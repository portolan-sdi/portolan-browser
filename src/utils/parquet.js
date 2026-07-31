import { asyncBufferFromUrl, parquetMetadataAsync, parquetRead, parquetReadObjects, parquetSchema } from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import {
  createDomainGuard,
  createLonLatTransform,
  MAP_RENDERABLE_CRS,
  reprojectGeometry,
} from './crs.js';
import {
  isParquetAsset,
  MAX_MAP_FEATURES,
  MAX_MAP_PARQUET_BYTES,
  MAX_ROWS,
  VECTOR_NOTICE_TOO_BIG,
  VECTOR_NOTICE_TOO_LARGE,
} from './parquetShared.js';

export { isParquetAsset, MAX_MAP_FEATURES, MAX_MAP_PARQUET_BYTES, MAX_ROWS };
// Re-exported so callers (and tests) can reach the CRS layer through the
// loader they already import.
export { createDomainGuard, createLonLatTransform, reprojectGeometry };

// How long the reprojection loop may hold the main thread before yielding.
// One frame at 60 Hz: long enough that the yields cost little, short enough
// that the page keeps painting.
const REPROJECT_YIELD_MS = 16;

// Promise wrapper around hyparquet's callback-style parquetRead, preserving
// its default (array) row format. The object-format path uses hyparquet's own
// parquetReadObjects instead.
function readParquet(options) {
  return new Promise((resolve, reject) => {
    parquetRead({ ...options, onComplete: resolve }).catch(reject);
  });
}

const WKB_TYPES = {
  0: 'Unknown',
  1: 'Point',
  2: 'LineString',
  3: 'Polygon',
  4: 'MultiPoint',
  5: 'MultiLineString',
  6: 'MultiPolygon',
  7: 'GeometryCollection',
};

export function findParquetAssets(assets) {
  return assets.filter(isParquetAsset);
}

function parseGeoMetadata(metadata) {
  if (!metadata.key_value_metadata) {
    return null;
  }
  const geoEntry = metadata.key_value_metadata.find(kv => kv.key === 'geo');
  if (!geoEntry) {
    return null;
  }
  try {
    return JSON.parse(geoEntry.value);
  } catch {
    return null;
  }
}

function detectGeometryInfo(metadata, columnNames) {
  const geo = parseGeoMetadata(metadata);
  if (geo) {
    const primaryColumn = geo.primary_column || 'geometry';
    const columnMeta = geo.columns?.[primaryColumn];
    let bboxMapping = null;

    if (columnMeta?.covering?.bbox) {
      const cb = columnMeta.covering.bbox;
      bboxMapping = {
        xmin: cb.xmin?.[0] ? `${cb.xmin[0]}.${cb.xmin[1]}` : null,
        ymin: cb.ymin?.[0] ? `${cb.ymin[0]}.${cb.ymin[1]}` : null,
        xmax: cb.xmax?.[0] ? `${cb.xmax[0]}.${cb.xmax[1]}` : null,
        ymax: cb.ymax?.[0] ? `${cb.ymax[0]}.${cb.ymax[1]}` : null,
      };
      if (Object.values(bboxMapping).some(v => !v)) {
        bboxMapping = null;
      }
    }

    // Absent `crs` → null: GeoParquet's default is then OGC:CRS84 (lon/lat).
    // A declared PROJJSON CRS without a recognizable authority/code is legal
    // (some writers omit `id`) but cannot be assumed to be lon/lat, so it is
    // reported by name (or as unidentified) and fails MAP_RENDERABLE_CRS
    // instead of silently defaulting to EPSG:4326.
    let crs = null;
    let crsDefinition = null;
    if (columnMeta?.crs) {
      const projjson = columnMeta.crs;
      const auth = projjson.id?.authority;
      const code = projjson.id?.code;
      crs = auth && code ? `${auth}:${code}` : (projjson.name || 'unidentified');
      if (crs !== 'EPSG:4326' && crs !== 'EPSG:3857') {
        crsDefinition = projjson;
      }
    }

    return {
      geometryColumn: primaryColumn,
      bboxMapping,
      crs,
      crsDefinition,
    };
  }

  // No GeoParquet `geo` metadata → no declared CRS (null); consumers apply
  // the lon/lat default themselves.
  const geomCol = columnNames.find(n => n === 'geometry' || n === 'geom');
  return geomCol ? { geometryColumn: geomCol, bboxMapping: null, crs: null, crsDefinition: null } : null;
}

function detectBboxColumns(columnNames) {
  const patterns = [
    { xmin: 'xmin', ymin: 'ymin', xmax: 'xmax', ymax: 'ymax' },
    { xmin: 'bbox_xmin', ymin: 'bbox_ymin', xmax: 'bbox_xmax', ymax: 'bbox_ymax' },
    { xmin: 'minx', ymin: 'miny', xmax: 'maxx', ymax: 'maxy' },
  ];
  for (const pattern of patterns) {
    if (Object.values(pattern).every(name => columnNames.includes(name))) {
      return pattern;
    }
  }
  return null;
}

export function parseWkbType(buffer) {
  if (!buffer || buffer.byteLength < 5) {
    return 'Unknown';
  }
  const view = buffer instanceof DataView ? buffer : new DataView(
    buffer.buffer || buffer, buffer.byteOffset || 0, buffer.byteLength
  );
  const byteOrder = view.getUint8(0);
  const littleEndian = byteOrder === 1;
  let typeId = view.getUint32(1, littleEndian);
  typeId = typeId % 1000;
  return WKB_TYPES[typeId] || 'Unknown';
}

export function bboxFromGeoJson(geometry) {
  if (!geometry) {return null;}
  // GeometryCollection carries `geometries` instead of `coordinates`; merge
  // the bboxes of its members recursively.
  if (Array.isArray(geometry.geometries)) {
    let bbox = null;
    for (const g of geometry.geometries) {
      const b = bboxFromGeoJson(g);
      if (!b) {continue;}
      bbox = bbox
        ? [Math.min(bbox[0], b[0]), Math.min(bbox[1], b[1]), Math.max(bbox[2], b[2]), Math.max(bbox[3], b[3])]
        : b;
    }
    return bbox;
  }
  if (!geometry.coordinates) {return null;}
  let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      const [x, y] = coords;
      if (x < xmin) {xmin = x;}
      if (x > xmax) {xmax = x;}
      if (y < ymin) {ymin = y;}
      if (y > ymax) {ymax = y;}
      return;
    }
    for (const c of coords) {visit(c);}
  };
  try {
    visit(geometry.coordinates);
  } catch {
    return null;
  }
  if (xmin === Infinity) {return null;}
  return [xmin, ymin, xmax, ymax];
}

export function bboxFromWkb(buffer) {
  if (!buffer || buffer.byteLength < 21) {
    return null;
  }
  try {
    const view = buffer instanceof DataView ? buffer : new DataView(
      buffer.buffer || buffer, buffer.byteOffset || 0, buffer.byteLength
    );
    const littleEndian = view.getUint8(0) === 1;
    let typeId = view.getUint32(1, littleEndian);
    const hasZ = typeId >= 1000 && typeId < 2000;
    typeId = typeId % 1000;
    const coordSize = hasZ ? 24 : 16;
    let offset = 5;
    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;

    function readCoord() {
      const x = view.getFloat64(offset, littleEndian);
      const y = view.getFloat64(offset + 8, littleEndian);
      offset += coordSize;
      if (x < xmin) {xmin = x;}
      if (x > xmax) {xmax = x;}
      if (y < ymin) {ymin = y;}
      if (y > ymax) {ymax = y;}
    }

    function readLinearRing() {
      const numPoints = view.getUint32(offset, littleEndian);
      offset += 4;
      for (let i = 0; i < numPoints; i++) {readCoord();}
    }

    if (typeId === 1) {
      readCoord();
    } else if (typeId === 2) {
      readLinearRing();
    } else if (typeId === 3) {
      const numRings = view.getUint32(offset, littleEndian);
      offset += 4;
      for (let i = 0; i < numRings; i++) {readLinearRing();}
    } else if (typeId === 4 || typeId === 5 || typeId === 6) {
      const numGeoms = view.getUint32(offset, littleEndian);
      offset += 4;
      for (let i = 0; i < numGeoms; i++) {
        const subBo = view.getUint8(offset);
        const subLe = subBo === 1;
        let subType = view.getUint32(offset + 1, subLe);
        const subHasZ = subType >= 1000 && subType < 2000;
        subType = subType % 1000;
        const subCoordSize = subHasZ ? 24 : 16;
        offset += 5;
        if (subType === 1) {
          const x = view.getFloat64(offset, subLe);
          const y = view.getFloat64(offset + 8, subLe);
          offset += subCoordSize;
          if (x < xmin) {xmin = x;}
          if (x > xmax) {xmax = x;}
          if (y < ymin) {ymin = y;}
          if (y > ymax) {ymax = y;}
        } else if (subType === 2) {
          const n = view.getUint32(offset, subLe);
          offset += 4;
          for (let j = 0; j < n; j++) {
            const x = view.getFloat64(offset, subLe);
            const y = view.getFloat64(offset + 8, subLe);
            offset += subCoordSize;
            if (x < xmin) {xmin = x;}
            if (x > xmax) {xmax = x;}
            if (y < ymin) {ymin = y;}
            if (y > ymax) {ymax = y;}
          }
        } else if (subType === 3) {
          const numRings = view.getUint32(offset, subLe);
          offset += 4;
          for (let r = 0; r < numRings; r++) {
            const n = view.getUint32(offset, subLe);
            offset += 4;
            for (let j = 0; j < n; j++) {
              const x = view.getFloat64(offset, subLe);
              const y = view.getFloat64(offset + 8, subLe);
              offset += subCoordSize;
              if (x < xmin) {xmin = x;}
              if (x > xmax) {xmax = x;}
              if (y < ymin) {ymin = y;}
              if (y > ymax) {ymax = y;}
            }
          }
        }
      }
    } else {
      return null;
    }

    if (xmin === Infinity) {return null;}
    return [xmin, ymin, xmax, ymax];
  } catch {
    return null;
  }
}

export async function loadParquetMetadata(url, { signal } = {}) {
  // hyparquet spreads `requestInit` into both its byte-length probe and every
  // ranged fetch, so an AbortSignal here cancels the whole download.
  const file = await asyncBufferFromUrl(signal ? { url, requestInit: { signal } } : { url });
  const metadata = await parquetMetadataAsync(file);
  const schema = parquetSchema(metadata);
  const columnNames = schema.children.map(e => e.element.name);
  const totalRows = Number(metadata.num_rows);
  const geoInfo = detectGeometryInfo(metadata, columnNames);
  const standaloneBbox = geoInfo?.bboxMapping || detectBboxColumns(columnNames);

  return {
    file,
    metadata,
    columnNames,
    totalRows,
    geometryColumn: geoInfo?.geometryColumn || null,
    bboxMapping: standaloneBbox,
    crs: geoInfo?.crs || null,
    crsDefinition: geoInfo?.crsDefinition || null,
  };
}

/**
 * Load a GeoParquet file as a GeoJSON FeatureCollection for map display.
 * Only the geometry column is read — every feature's `properties` is empty
 * (see the `columns` option below for the rationale).
 *
 * Relies on hyparquet decoding WKB geometry columns to GeoJSON objects, which
 * it does for columns marked by the file's GeoParquet `geo` metadata (or a
 * GEOMETRY/GEOGRAPHY logical type). Enforces real bounds regardless of what
 * STAC metadata or the parquet footer declare: returns
 * `{ exceeded: true, reason: 'tooBig', byteLength }` when the file's actual
 * size is over MAX_MAP_PARQUET_BYTES, and
 * `{ exceeded: true, reason: 'tooLarge', totalRows }` when the row count is
 * over MAX_MAP_FEATURES — in both cases without reading the data pages. The
 * read itself is bounded via `rowEnd`, so a footer lying about `num_rows`
 * cannot cause an unbounded read. Throws when the file has no geometry
 * column, a CRS the map can't display, raw (undecoded) geometry bytes, or on
 * fetch/parse errors. An optional `signal` (AbortSignal) is forwarded to
 * every fetch hyparquet issues; aborting rejects with an `AbortError`.
 *
 * Geometries in a projected CRS are reprojected to lon/lat on the way out
 * (`reprojectedFrom` names the source CRS when that happened). Features whose
 * coordinates fall outside the transform's domain are dropped and counted in
 * `droppedFeatures` rather than drawn in the wrong place.
 */
export async function loadGeoJsonFromParquet(url, { signal } = {}) {
  const maxFeatures = MAX_MAP_FEATURES;
  const { file, metadata, totalRows, geometryColumn, crs, crsDefinition } =
    await loadParquetMetadata(url, { signal });

  // Authoritative size gate on the *actual* byte length (from the HEAD/range
  // probe in asyncBufferFromUrl), not the self-declared STAC `file:size`.
  if (file.byteLength > MAX_MAP_PARQUET_BYTES) {
    return { exceeded: true, reason: VECTOR_NOTICE_TOO_BIG, byteLength: file.byteLength };
  }
  if (!geometryColumn) {
    throw new Error('Parquet file has no geometry column');
  }
  // A projected (or otherwise non-lon/lat) CRS is reprojected rather than
  // refused — but only if proj4 can resolve it from the file's own PROJJSON
  // or its authority code. When it can't, the geometries would land in the
  // Atlantic near 0°/0°, so refusing is still the right answer.
  const transform = MAP_RENDERABLE_CRS.includes(crs)
    ? null
    : createLonLatTransform(crs, crsDefinition);
  if (!MAP_RENDERABLE_CRS.includes(crs) && !transform) {
    throw new Error(`GeoParquet CRS ${crs} is not supported for map display`);
  }
  const guard = transform ? createDomainGuard(crs, crsDefinition) : null;
  if (totalRows > maxFeatures) {
    return { exceeded: true, reason: VECTOR_NOTICE_TOO_LARGE, totalRows };
  }

  // `rowEnd` bounds the read even when the footer's `num_rows` understates
  // the real row count (hyparquet never cross-checks it against the row
  // groups). Reading one row past the cap detects the over-cap case.
  const rows = await parquetReadObjects({
    file,
    metadata,
    compressors,
    // Only the geometry column is fetched and decoded. The rendered map
    // layers use `$type` filters with static paint and nothing reads
    // feature properties, so attribute columns would cost network, CPU and
    // memory for no benefit — features intentionally get empty `properties`
    // below. If a popup or attribute-driven style ever lands, the needed
    // columns must be re-fetched at that point.
    columns: [geometryColumn],
    rowStart: 0,
    rowEnd: maxFeatures + 1,
  });

  if (rows.length > maxFeatures) {
    // The footer under-declared its row count; report what we actually know.
    return { exceeded: true, reason: VECTOR_NOTICE_TOO_LARGE, totalRows: Math.max(totalRows, rows.length) };
  }

  const features = [];
  let droppedFeatures = 0;
  let lastYield = Date.now();
  for (const row of rows) {
    // Belt-and-braces: never build more than maxFeatures features, whatever
    // the reader delivered.
    if (features.length >= maxFeatures) {break;}
    // Reprojection is a per-position proj4 call, so a file near the byte cap
    // is seconds of work. Hand the event loop back periodically so the page
    // stays responsive and an abort can still interrupt us. Files that aren't
    // reprojected never reach the yield, and neither do small ones.
    if (transform && Date.now() - lastYield >= REPROJECT_YIELD_MS) {
      await new Promise(resolve => setTimeout(resolve, 0));
      if (signal?.aborted) {
        const err = new Error('Aborted');
        err.name = 'AbortError';
        throw err;
      }
      lastYield = Date.now();
    }
    const raw = row[geometryColumn];
    if (raw === null || raw === undefined) {continue;}
    if (raw instanceof Uint8Array || raw instanceof ArrayBuffer) {
      // hyparquet only leaves raw WKB when the column wasn't marked as a
      // geometry column, i.e. the file lacks GeoParquet `geo` metadata.
      throw new Error('Geometry column was not decoded (missing GeoParquet metadata)');
    }
    const geometry = transform ? reprojectGeometry(raw, transform, guard) : raw;
    if (geometry === null) {
      droppedFeatures++;
      continue;
    }
    // Properties are intentionally empty: attribute columns are pruned from
    // the read above (see the `columns` option).
    features.push({ type: 'Feature', geometry, properties: {} });
  }

  return {
    exceeded: false,
    featureCollection: { type: 'FeatureCollection', features },
    totalRows,
    reprojectedFrom: transform ? crs : null,
    droppedFeatures,
  };
}

export async function loadParquetRows(file, metadata, columnNames, geometryColumn) {
  const totalRows = Number(metadata.num_rows);
  const rowEnd = Math.min(totalRows, MAX_ROWS);
  const columnsToRead = columnNames.filter(n => n !== geometryColumn);

  const rows = await readParquet({
    file,
    metadata,
    compressors,
    columns: columnsToRead,
    rowStart: 0,
    rowEnd,
  });
  return {
    rows,
    loadedRows: rowEnd,
    totalRows,
    columns: columnsToRead,
  };
}

export async function loadGeometryTypesForRows(file, metadata, geometryColumn, rowEnd) {
  if (!geometryColumn) {return [];}
  const rows = await readParquet({
    file,
    metadata,
    compressors,
    columns: [geometryColumn],
    rowStart: 0,
    rowEnd,
  });
  return rows.map(row => {
    const geomValue = row[0];
    if (geomValue instanceof Uint8Array || geomValue instanceof ArrayBuffer) {
      return parseWkbType(geomValue);
    }
    // hyparquet >= 1.25 decodes marked geometry columns to GeoJSON objects
    if (geomValue && typeof geomValue.type === 'string') {
      return geomValue.type;
    }
    return 'Unknown';
  });
}

export async function getBboxForRow(file, metadata, geometryColumn, rowIndex) {
  const rows = await readParquet({
    file,
    metadata,
    compressors,
    columns: [geometryColumn],
    rowStart: rowIndex,
    rowEnd: rowIndex + 1,
  });
  if (rows.length === 0) {return null;}
  const geomValue = rows[0][0];
  if (geomValue instanceof Uint8Array || geomValue instanceof ArrayBuffer) {
    return bboxFromWkb(geomValue);
  }
  if (geomValue && (geomValue.coordinates || geomValue.geometries)) {
    // hyparquet >= 1.25 decodes marked geometry columns to GeoJSON objects
    return bboxFromGeoJson(geomValue);
  }
  return null;
}
