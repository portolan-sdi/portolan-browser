// Apache Iceberg loader for the map layer. This module imports icebird, so
// StacMapLayer loads it lazily (_loadIcebergDeps). Predicates and constants
// that other modules need live in icebergShared.js, which stays free of
// icebird.

import {
  icebergDataSource,
  icebergMetadata,
  icebergQuery,
  streamRowBatches,
  urlResolver,
} from 'icebird';
import { avroSafeResolver } from './avroInflate.js';
import {
  createDomainGuard,
  createLonLatTransform,
  MAP_RENDERABLE_CRS,
  reprojectGeometry,
} from './crs.js';
import { MAX_ICEBERG_MAP_GEOMETRIES, MAX_ICEBERG_PREVIEW_ROWS, splitMetadataUrl } from './icebergShared.js';
import { VECTOR_NOTICE_NO_GEOMETRY } from './parquetShared.js';

export { MAX_ICEBERG_MAP_GEOMETRIES, MAX_ICEBERG_PREVIEW_ROWS };
export { createDomainGuard, createLonLatTransform, reprojectGeometry };

// How long the reprojection loop may hold the main thread before yielding.
// One frame at 60 Hz, the same value the GeoParquet loader uses.
const REPROJECT_YIELD_MS = 16;

const GEO_TYPE = /^(geometry|geography)(?:\((.*)\))?$/;

function abortError() {
  const err = new Error('Aborted');
  err.name = 'AbortError';
  return err;
}

// The table's current schema. Format v2 and later list every schema and name
// the current one by id. Format v1 may carry a single `schema` instead.
export function currentSchema(metadata) {
  const id = metadata['current-schema-id'];
  return metadata.schemas?.find(s => s['schema-id'] === id) ?? metadata.schema ?? { fields: [] };
}

// Columns whose Iceberg type is `geometry` or `geography`, with the CRS the
// type declares. An Iceberg type without a CRS means OGC:CRS84 (lon/lat), so
// `crs` is null there, like the GeoParquet loader's lon/lat case.
export function geometryColumns(schema) {
  const columns = [];
  for (const field of schema.fields ?? []) {
    const match = typeof field.type === 'string' ? field.type.match(GEO_TYPE) : null;
    if (!match) {continue;}
    // `geography(crs, algorithm)` carries a second argument. Only the CRS matters here.
    const declared = match[2]?.split(',')[0].trim();
    columns.push({ name: field.name, crs: declared ? declared.toUpperCase() : null });
  }
  return columns;
}

// Quote an identifier for the SQL that icebird runs.
function quote(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

// Scalars only. A style can match on them, and a struct or list would bloat
// the geojson source. The GeoParquet loader applies the same rule.
function toStyleValue(value) {
  if (value === null || value === undefined) {return undefined;}
  const type = typeof value;
  if (type === 'string' || type === 'boolean') {return value;}
  if (type === 'number') {return Number.isFinite(value) ? value : undefined;}
  if (type === 'bigint') {return Number(value);}
  if (value instanceof Date) {return value.toISOString();}
  return undefined;
}

// Pin the snapshot the STAC metadata names, but only when the table still has
// it. A table that is re-uploaded can drop old snapshots, and a stale pin must
// not turn a readable table into an error.
function pinnedSnapshot(metadata, declared) {
  if (typeof declared !== 'string' && typeof declared !== 'number') {return undefined;}
  const id = String(declared);
  if (!/^\d+$/.test(id)) {return undefined;}
  const known = metadata.snapshots?.some(s => String(s['snapshot-id']) === id);
  return known ? BigInt(id) : undefined;
}

// Split the metadata URL, build the resolver and read the table metadata. Both
// loaders start here, so they address the table and handle Avro the same way.
async function openTable(url, signal) {
  const location = splitMetadataUrl(url);
  if (!location) {
    throw new Error(`Iceberg metadata URL must end in /metadata/<file>.metadata.json: ${url}`);
  }
  const { tableUrl, metadataFileName } = location;
  // icebird reads a deflate-compressed Avro manifest through a decoder that
  // fails on some writers' output. avroSafeResolver rewrites those files first.
  const resolver = avroSafeResolver(urlResolver({ requestInit: signal ? { signal } : undefined }));

  const metadata = await icebergMetadata({ tableUrl, metadataFileName, resolver });
  if (signal?.aborted) {throw abortError();}
  return { tableUrl, resolver, metadata, schema: currentSchema(metadata) };
}

// Rows in the table's current snapshot, from the snapshot summary. Null when
// the writer left the summary out. A table with deletes may hold fewer rows
// than this says, so treat it as the table's size and not as an exact count.
function totalRecords(metadata) {
  const current = metadata.snapshots?.find(s => s['snapshot-id'] === metadata['current-snapshot-id']);
  const total = Number(current?.summary?.['total-records']);
  return Number.isFinite(total) ? total : null;
}

/**
 * Load an Iceberg table's geometries as a GeoJSON FeatureCollection for map display.
 *
 * `url` is the table's `metadata.json`. It must sit in a `metadata/` folder
 * under the table root, which is the layout every Iceberg writer produces and
 * the one icebird expects.
 *
 * Only the geometry column is read, plus any `fields` the table has. Rows with
 * a null geometry are skipped in the query, so a sparse table does not spend
 * the cap on empty rows. The read stops after `maxFeatures` geometries. When
 * the table has more, the result carries `truncated: true` and holds the first
 * `maxFeatures`. An aborted `signal` rejects with an `AbortError`.
 *
 * Throws when the table has no geometry column (the error carries
 * `noticeReason`), when its CRS cannot be shown, or on a fetch or parse error.
 *
 * Geometries in a projected CRS are reprojected to lon/lat. Features that fall
 * outside the transform's usable domain are dropped and counted in
 * `droppedFeatures`, as in the GeoParquet loader.
 */
export async function loadGeoJsonFromIceberg(url, {
  signal,
  fields = [],
  geometryColumn: preferredColumn,
  snapshotId,
  maxFeatures = MAX_ICEBERG_MAP_GEOMETRIES,
} = {}) {
  const { tableUrl, resolver, metadata, schema } = await openTable(url, signal);
  const geometries = geometryColumns(schema);
  const geometry = geometries.find(c => c.name === preferredColumn) ?? geometries[0];
  if (!geometry) {
    throw Object.assign(new Error('Iceberg table has no geometry column'), {
      noticeReason: VECTOR_NOTICE_NO_GEOMETRY,
    });
  }

  // OGC:CRS84 and EPSG:4326 are lon/lat already. Any other CRS is reprojected
  // when proj4 can resolve its authority code. Otherwise the geometries would
  // land near 0/0, so refusing is the right answer.
  const crs = geometry.crs === 'CRS84' ? 'OGC:CRS84' : geometry.crs;
  const transform = MAP_RENDERABLE_CRS.includes(crs) ? null : createLonLatTransform(crs, null);
  if (!MAP_RENDERABLE_CRS.includes(crs) && !transform) {
    throw new Error(`Iceberg CRS ${crs} is not supported for map display`);
  }
  const guard = transform ? createDomainGuard(crs, null) : null;

  const known = new Set((schema.fields ?? []).map(f => f.name));
  const requested = fields.filter(name => name !== geometry.name);
  const attributeColumns = requested.filter(name => known.has(name));
  const absentColumns = requested.filter(name => !known.has(name));

  const source = await icebergDataSource({
    tableUrl,
    metadata,
    snapshotId: pinnedSnapshot(metadata, snapshotId),
    resolver,
  });
  // The query asks for one row past the cap. That extra row is how the loader
  // knows the table holds more than it shows.
  const query = `SELECT ${[geometry.name, ...attributeColumns].map(quote).join(', ')} `
    + `FROM t WHERE ${quote(geometry.name)} IS NOT NULL LIMIT ${maxFeatures + 1}`;
  const result = await icebergQuery({ tables: { t: source }, query, resolver, signal });

  const features = [];
  const delivered = new Set();
  let droppedFeatures = 0;
  let truncated = false;
  let lastYield = Date.now();

  for await (const batch of streamRowBatches(result, { batchRows: 1024 })) {
    if (signal?.aborted) {throw abortError();}
    for (const row of batch) {
      if (features.length >= maxFeatures) {
        truncated = true;
        break;
      }
      // Reprojection is a per-position proj4 call. Hand the event loop back
      // periodically so the page stays responsive and an abort can interrupt.
      if (transform && Date.now() - lastYield >= REPROJECT_YIELD_MS) {
        // eslint-disable-next-line no-await-in-loop -- yielding to the event loop is the point
        await new Promise(resolve => { setTimeout(resolve, 0); });
        if (signal?.aborted) {throw abortError();}
        lastYield = Date.now();
      }
      const raw = row[geometry.name];
      if (raw === null || raw === undefined) {continue;}
      if (raw instanceof Uint8Array || raw instanceof ArrayBuffer) {
        throw new Error('Iceberg geometry column was not decoded');
      }
      const shape = transform ? reprojectGeometry(raw, transform, guard) : raw;
      if (shape === null) {
        droppedFeatures++;
        continue;
      }
      const properties = {};
      for (const name of attributeColumns) {
        const value = toStyleValue(row[name]);
        if (value !== undefined) {
          properties[name] = value;
          delivered.add(name);
        }
      }
      features.push({ type: 'Feature', geometry: shape, properties });
    }
    if (truncated) {break;}
  }

  const unusableColumns = features.length > 0
    ? attributeColumns.filter(name => !delivered.has(name))
    : [];

  return {
    exceeded: false,
    truncated,
    max: maxFeatures,
    featureCollection: { type: 'FeatureCollection', features },
    totalRows: totalRecords(metadata),
    missingFields: [...absentColumns, ...unusableColumns].sort(),
    reprojectedFrom: transform ? crs : null,
    droppedFeatures,
  };
}

// The bounding box of a GeoJSON geometry in the geometry's own CRS, or null for
// an empty one. A GeometryCollection merges the boxes of its members.
export function geometryBbox(geometry) {
  if (!geometry) {return null;}
  if (Array.isArray(geometry.geometries)) {
    return geometry.geometries.reduce((box, member) => {
      const next = geometryBbox(member);
      if (!next) {return box;}
      return box
        ? [Math.min(box[0], next[0]), Math.min(box[1], next[1]), Math.max(box[2], next[2]), Math.max(box[3], next[3])]
        : next;
    }, null);
  }
  if (!Array.isArray(geometry.coordinates)) {return null;}
  let xmin = Infinity;
  let ymin = Infinity;
  let xmax = -Infinity;
  let ymax = -Infinity;
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      xmin = Math.min(xmin, coords[0]);
      xmax = Math.max(xmax, coords[0]);
      ymin = Math.min(ymin, coords[1]);
      ymax = Math.max(ymax, coords[1]);
      return;
    }
    for (const part of coords) {visit(part);}
  };
  visit(geometry.coordinates);
  return xmin === Infinity ? null : [xmin, ymin, xmax, ymax];
}

// A table cell holds a scalar the table can print. A Date becomes an ISO
// string, because the table would print a Date as a quoted JSON string. A
// geometry in a column other than the primary one becomes its type name,
// because its coordinates would fill the cell.
function toCell(value, isGeometry) {
  if (value instanceof Date) {return value.toISOString();}
  if (isGeometry) {return value?.type ?? null;}
  return value ?? null;
}

/**
 * Load the first rows of an Iceberg table for the table preview.
 *
 * Returns the shape ParquetTable takes: `columns` and `rows`, where each row is
 * an array in column order. The primary geometry column is left out of `rows`.
 * Its bounding boxes come back in `bboxes`, one per row and null where the
 * geometry is null, so the preview can zoom the map to a row. `crs` names the
 * CRS of those boxes. `totalRows` is the table's size from the snapshot
 * summary, or the loaded count when the summary has none.
 *
 * Reads rows in table order and stops after `maxRows`. An aborted `signal`
 * rejects with an `AbortError`.
 */
export async function loadIcebergRows(url, {
  signal,
  geometryColumn: preferredColumn,
  snapshotId,
  maxRows = MAX_ICEBERG_PREVIEW_ROWS,
} = {}) {
  const { tableUrl, resolver, metadata, schema } = await openTable(url, signal);
  const geometries = geometryColumns(schema);
  const primary = geometries.find(c => c.name === preferredColumn) ?? geometries[0] ?? null;
  const otherGeometries = new Set(geometries.filter(c => c !== primary).map(c => c.name));
  const names = (schema.fields ?? []).map(f => f.name);
  const columns = names.filter(name => name !== primary?.name);

  const source = await icebergDataSource({
    tableUrl,
    metadata,
    snapshotId: pinnedSnapshot(metadata, snapshotId),
    resolver,
  });
  const query = `SELECT ${names.map(quote).join(', ')} FROM t LIMIT ${maxRows}`;
  const result = await icebergQuery({ tables: { t: source }, query, resolver, signal });

  const rows = [];
  const bboxes = [];
  for await (const batch of streamRowBatches(result, { batchRows: 1024 })) {
    if (signal?.aborted) {throw abortError();}
    for (const row of batch) {
      if (rows.length >= maxRows) {break;}
      rows.push(columns.map(name => toCell(row[name], otherGeometries.has(name))));
      bboxes.push(primary ? geometryBbox(row[primary.name]) : null);
    }
    if (rows.length >= maxRows) {break;}
  }

  return {
    columns,
    rows,
    loadedRows: rows.length,
    totalRows: totalRecords(metadata) ?? rows.length,
    geometryColumn: primary?.name ?? null,
    bboxes,
    // A type without a CRS means OGC:CRS84, which the map takes as lon/lat.
    crs: primary ? primary.crs ?? 'EPSG:4326' : null,
  };
}

// One count from a snapshot summary, or null when the writer left it out.
function summaryCount(summary, key) {
  const value = Number(summary?.[key]);
  return summary?.[key] != null && Number.isFinite(value) ? value : null;
}

/**
 * Summarize the snapshots in a table's metadata for the snapshots tab, newest
 * first. Everything comes from `metadata.json`, so no data file is read.
 *
 * `rows` is the live row count of the snapshot. A merge-on-read writer hides
 * rows with position deletes and leaves them in `total-records`, so the live
 * count is `total-records` minus `total-position-deletes`. An equality delete
 * hides rows by value, and the summary cannot say how many, so `total-records`
 * stands in for it there. `files` is `total-data-files`. Each is null when the
 * writer left the summary field out. `current` marks the table's current
 * snapshot.
 */
export function summarizeSnapshots(metadata) {
  const currentId = metadata['current-snapshot-id'] != null ? String(metadata['current-snapshot-id']) : null;
  const snapshots = (metadata.snapshots ?? []).map((snapshot) => {
    const { summary } = snapshot;
    const total = summaryCount(summary, 'total-records');
    const positionDeletes = summaryCount(summary, 'total-position-deletes') ?? 0;
    const equalityDeletes = summaryCount(summary, 'total-equality-deletes') ?? 0;
    const committed = Number(snapshot['timestamp-ms']);
    return {
      id: String(snapshot['snapshot-id']),
      timestamp: Number.isFinite(committed) ? new Date(committed) : null,
      operation: summary?.operation ?? null,
      rows: total !== null && equalityDeletes === 0 ? total - positionDeletes : total,
      files: summaryCount(summary, 'total-data-files'),
      current: currentId !== null && String(snapshot['snapshot-id']) === currentId,
      sequence: Number(snapshot['sequence-number']) || 0,
    };
  });
  return snapshots.sort((a, b) =>
    (b.timestamp?.getTime() ?? 0) - (a.timestamp?.getTime() ?? 0) || b.sequence - a.sequence
  );
}

/**
 * Load a table's snapshots from its `metadata.json`. This reads one small file,
 * so the snapshots tab shows long before the data preview finishes. Returns
 * `{ snapshots, currentSnapshotId }`. An aborted `signal` rejects with an
 * `AbortError`.
 */
export async function loadIcebergSnapshots(url, { signal } = {}) {
  const { metadata } = await openTable(url, signal);
  return {
    snapshots: summarizeSnapshots(metadata),
    currentSnapshotId: metadata['current-snapshot-id'] != null ? String(metadata['current-snapshot-id']) : null,
  };
}
