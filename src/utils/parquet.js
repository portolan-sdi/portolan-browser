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
  // Top-level schema elements by name, so callers can read a column's logical
  // type (see isDateOnlyColumn). Top-level only, matching hyparquet's own
  // column selection, which resolves names against `path_in_schema[0]`.
  const columnElements = new Map(schema.children.map(e => [e.element.name, e.element]));
  const totalRows = Number(metadata.num_rows);
  const geoInfo = detectGeometryInfo(metadata, columnNames);
  const standaloneBbox = geoInfo?.bboxMapping || detectBboxColumns(columnNames);

  return {
    file,
    metadata,
    columnNames,
    columnElements,
    totalRows,
    geometryColumn: geoInfo?.geometryColumn || null,
    bboxMapping: standaloneBbox,
    crs: geoInfo?.crs || null,
    crsDefinition: geoInfo?.crsDefinition || null,
  };
}

const MAX_SAFE = 9007199254740991n;

// A parquet DATE column carries no time of day. hyparquet converts it to a JS
// Date at UTC midnight, so a full ISO instant would fail to match a style
// authored against the PMTiles build of the same data, where GDAL/tippecanoe
// writes the field as "YYYY-MM-DD". Real timestamps keep their full instant.
function isDateOnlyColumn(element) {
  if (!element) {return false;}
  if (element.converted_type === 'DATE') {return true;}
  return element.logical_type?.type === 'DATE';
}

// Whether a column must represent its integers as strings. Decided once for
// the whole column, never per cell: MapLibre's expressions are type-strict, so
// a column emitting numbers for small values and strings for large ones makes
// `step`/`interpolate` error to the spec default on some features while
// `match` silently takes the fallback branch on others. Homogeneity matters
// more than per-cell exactness — see toStyleValue.
function columnNeedsStringInts(rows, name) {
  for (const row of rows) {
    const value = row[name];
    if (typeof value === 'bigint' && (value < -MAX_SAFE || value > MAX_SAFE)) {return true;}
  }
  return false;
}

// Coerce one parquet cell into a value MapLibre can evaluate in a style
// expression. Returns `undefined` for anything that isn't usable, and the
// caller then omits the property and records the column as undelivered.
//
// BigInt matters here: hyparquet returns int64 columns (a GeoParquet `fid` is
// typically one) as BigInt, which throws "Do not know how to serialize a
// BigInt" the moment MapLibre's worker structured-clones or JSON-stringifies
// the feature. `stringInts` carries the per-column decision above.
//
// Arrays of scalars pass through: a geojson source supports them, and
// `["in", "park", ["get", "categories"]]` is a real thing publishers write —
// unlike a vector tile, where such a column genuinely could not be matched on.
// Structs and maps are still dropped: a style can't match on them and a `bbox`
// struct on every feature would bloat the source for nothing. Binary columns
// mostly never reach here — hyparquet UTF-8-decodes plain BYTE_ARRAY before we
// see it — so only FIXED_LEN_BYTE_ARRAY arrives as a Uint8Array and is dropped.
function toStyleValue(value, { dateOnly = false, stringInts = false } = {}) {
  if (value === null || value === undefined) {return undefined;}
  const type = typeof value;
  if (type === 'string' || type === 'boolean') {return value;}
  if (type === 'number') {return Number.isFinite(value) ? value : undefined;}
  if (type === 'bigint') {return stringInts ? value.toString() : Number(value);}
  if (value instanceof Date) {
    const iso = value.toISOString();
    return dateOnly ? iso.slice(0, 10) : iso;
  }
  if (Array.isArray(value)) {
    const items = [];
    for (const item of value) {
      const itemType = typeof item;
      if (itemType === 'string' || itemType === 'boolean') {items.push(item);}
      else if (itemType === 'number' && Number.isFinite(item)) {items.push(item);}
      else if (itemType === 'bigint') {items.push(stringInts ? item.toString() : Number(item));}
      // A non-scalar element makes the whole array unmatchable; drop it rather
      // than emit a ragged list a style would silently mis-evaluate.
      else {return undefined;}
    }
    return items;
  }
  return undefined;
}

/**
 * Load a GeoParquet file as a GeoJSON FeatureCollection for map display.
 *
 * By default only the geometry column is read and every feature's `properties`
 * is empty. Pass `fields` (see the option below) to also read named attribute
 * columns, which is what lets a MapLibre style's `["get", …]` expressions
 * evaluate against a parquet-backed source.
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
 *
 * `fields` is the attribute columns to read alongside the geometry, normally
 * the union of what the collection's styles reference (see
 * `extractStyleFields`). Names the file doesn't have are ignored rather than
 * erroring, so a style may reference attributes that only some of a
 * collection's assets carry.
 *
 * Any requested field that could not be delivered — absent from the schema, or
 * present but unusable on every row — is reported back in `missingFields`.
 * That matters because a missing attribute is *not* benign: MapLibre falls
 * back gracefully only for `match`/`case`. For `step` and `interpolate` it
 * discards the errored expression and substitutes the style-spec default,
 * which for `fill-color` is solid black. The caller decides what to do about
 * it; silently rendering black is not an option.
 */
export async function loadGeoJsonFromParquet(url, { signal, fields = [] } = {}) {
  const maxFeatures = MAX_MAP_FEATURES;
  const {
    file, metadata, totalRows, geometryColumn, crs, crsDefinition, columnNames, columnElements,
  } = await loadParquetMetadata(url, { signal });

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

  // Columns are pruned to the geometry plus whatever the caller asked for:
  // with no `fields`, the default vector layers use `$type` filters and static
  // paint, so attribute columns would cost network, CPU and memory for no
  // benefit.
  //
  // Names the file doesn't have are dropped rather than passed through. (On
  // this path that is a choice, not a necessity: parquetReadObjects uses
  // `rowFormat: 'object'`, which skips unmatched names — only the 'array'
  // format throws.) Dropping them is reported via `missingFields` below, since
  // an unresolved field renders black under `step`/`interpolate`.
  const requestedColumns = fields.filter(name => name !== geometryColumn);
  const attributeColumns = requestedColumns.filter(name => columnNames.includes(name));
  const absentColumns = requestedColumns.filter(name => !columnNames.includes(name));

  // `rowEnd` bounds the read even when the footer's `num_rows` understates
  // the real row count (hyparquet never cross-checks it against the row
  // groups). Reading one row past the cap detects the over-cap case.
  const rows = await parquetReadObjects({
    file,
    metadata,
    compressors,
    columns: [geometryColumn, ...attributeColumns],
    rowStart: 0,
    rowEnd: maxFeatures + 1,
  });

  if (rows.length > maxFeatures) {
    // The footer under-declared its row count; report what we actually know.
    return { exceeded: true, reason: VECTOR_NOTICE_TOO_LARGE, totalRows: Math.max(totalRows, rows.length) };
  }

  // Both decisions are per column and made once, before the row loop, so every
  // feature represents a given column the same way.
  const columnOptions = new Map(attributeColumns.map(name => [name, {
    dateOnly: isDateOnlyColumn(columnElements?.get(name)),
    stringInts: columnNeedsStringInts(rows, name),
  }]));

  const features = [];
  const delivered = new Set();
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
    // Empty unless `fields` asked for columns (see the `columns` option).
    const properties = {};
    for (const name of attributeColumns) {
      const value = toStyleValue(row[name], columnOptions.get(name));
      if (value !== undefined) {
        properties[name] = value;
        delivered.add(name);
      }
    }
    features.push({ type: 'Feature', geometry, properties });
  }

  // A column read but usable on no feature (all null, all NaN, a struct) is as
  // undelivered as one the schema never had. Only meaningful once there is at
  // least one feature to have carried it.
  const unusableColumns = features.length > 0
    ? attributeColumns.filter(name => !delivered.has(name))
    : [];

  return {
    exceeded: false,
    featureCollection: { type: 'FeatureCollection', features },
    totalRows,
    missingFields: [...absentColumns, ...unusableColumns].sort(),
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
