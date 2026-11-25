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
import { MAX_ICEBERG_MAP_ROWS, MAX_ICEBERG_PREVIEW_ROWS, splitMetadataUrl } from './icebergShared.js';
import { VECTOR_NOTICE_NO_GEOMETRY } from './parquetShared.js';

export { MAX_ICEBERG_MAP_ROWS, MAX_ICEBERG_PREVIEW_ROWS };
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

// The WHERE part of a query, from a condition the reader typed. The condition is
// wrapped in parentheses, so a trailing OR cannot reach the LIMIT, and a stray
// closing parenthesis is a syntax error instead of a way out of the query. An
// empty condition adds nothing. icebird's SQL engine only reads, so a condition
// can filter rows and nothing more.
function whereClause(where) {
  const condition = typeof where === 'string' ? where.trim() : '';
  return condition ? ` WHERE (${condition})` : '';
}

// A column's type as text. A nested type (struct, list, map) is an object in
// the metadata, so its kind stands in for it.
function typeLabel(type) {
  return typeof type === 'string' ? type : (type?.type ?? '');
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

/**
 * Wrap an icebird resolver so paths under the table's own `location` are read
 * from the URL the table was loaded from.
 *
 * The metadata names every file by absolute path, under `location`. A writer
 * that used object storage names them `s3://bucket/path`. icebird turns an
 * `s3://` path into an Amazon host, which is wrong for any other S3-compatible
 * host, such as MinIO, R2 or a lakehouse service. The metadata file was fetched
 * from a URL the browser can use, and every file of the table sits beside it,
 * so a path under `location` maps onto the same place under that URL. The
 * `target` object is filled in once the metadata is read, because `location`
 * is not known before.
 *
 * @param {{reader: (path: string, byteLength?: number) => any}} base
 * @param {{from: string | null, to: string}} target
 * @returns {{reader: (path: string, byteLength?: number) => any}}
 */
export function rebasedResolver(base, target) {
  return {
    ...base,
    reader(path, byteLength) {
      const mapped = target.from && path.startsWith(target.from)
        ? target.to + path.slice(target.from.length)
        : path;
      return base.reader(mapped, byteLength);
    },
  };
}

// How many more times a short range read is tried before it fails.
const SHORT_READ_RETRIES = 2;

/**
 * Wrap an icebird resolver so a range read must return every byte it asked for.
 *
 * A range request can come back with `206` and the right headers and still
 * deliver fewer bytes than the range holds, when a network hop cuts a large
 * body short. hyparquet does not check the length. It parses the short buffer
 * and fails far from the cause, with a message such as "Invalid typed array
 * length". This wrapper reads the range again, up to SHORT_READ_RETRIES more
 * times, and then fails with a message that names the file and the range.
 *
 * @param {{reader: (path: string, byteLength?: number) => any}} base
 * @returns {{reader: (path: string, byteLength?: number) => any}}
 */
export function verifiedResolver(base) {
  return {
    ...base,
    async reader(path, byteLength) {
      const source = await base.reader(path, byteLength);
      return {
        ...source,
        async slice(start, end) {
          const wanted = Math.min(end ?? source.byteLength, source.byteLength) - start;
          let received = 0;
          for (let attempt = 0; attempt <= SHORT_READ_RETRIES; attempt++) {
            // eslint-disable-next-line no-await-in-loop -- each try follows the one that came up short
            const buffer = await source.slice(start, end);
            received = buffer.byteLength;
            if (received === wanted) {return buffer;}
          }
          throw new Error(`Short read from ${path}: asked for ${wanted} bytes at ${start} and got ${received}`);
        },
      };
    },
  };
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
  // `rebase.from` stays empty until the metadata names the table's location.
  const rebase = { from: null, to: tableUrl };
  const resolver = avroSafeResolver(verifiedResolver(rebasedResolver(
    urlResolver({ requestInit: signal ? { signal } : undefined }),
    rebase,
  )));

  const metadata = await icebergMetadata({ tableUrl, metadataFileName, resolver });
  if (signal?.aborted) {throw abortError();}
  // A location that is already an http(s) URL needs no mapping. Any other scheme
  // (s3://, s3a://, gs://) is not a URL a browser can fetch.
  if (typeof metadata.location === 'string' && !/^https?:\/\//i.test(metadata.location)) {
    rebase.from = metadata.location.replace(/\/+$/, '');
  }
  return { tableUrl, resolver, metadata, schema: currentSchema(metadata) };
}

// Rows in a snapshot, from the snapshot summary. The snapshot is `snapshotId`
// when the caller reads one, and the table's current snapshot otherwise. Null
// when the writer left the summary out. A table with deletes may hold fewer rows
// than this says, so treat it as the table's size and not as an exact count.
function totalRecords(metadata, snapshotId) {
  // icebird parses a snapshot id as a number when it fits in 53 bits and as a
  // BigInt when it does not, and `===` finds no match between the two. Compare
  // the ids as text.
  const wanted = String(snapshotId ?? metadata['current-snapshot-id']);
  const snapshot = metadata.snapshots?.find(s => String(s['snapshot-id']) === wanted);
  const total = Number(snapshot?.summary?.['total-records']);
  return Number.isFinite(total) ? total : null;
}

/**
 * Load an Iceberg table's geometries as a GeoJSON FeatureCollection for map display.
 *
 * `url` is the table's `metadata.json`. It must sit in a `metadata/` folder
 * under the table root, which is the layout every Iceberg writer produces and
 * the one icebird expects.
 *
 * Only the geometry column is read, plus any `fields` the table has. The read
 * covers `maxRows` rows in table order, after the first `offset` rows. These
 * are the rows that `loadIcebergRows` returns for the same `offset`, so the map
 * draws the page of the preview table on screen. A row with a null geometry
 * counts toward `maxRows` and draws nothing, so a sparse table can yield fewer
 * features than rows. `where` is a SQL condition that filters the rows first.
 * An aborted `signal` rejects with an `AbortError`.
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
  maxRows = MAX_ICEBERG_MAP_ROWS,
  offset = 0,
  where = '',
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

  const snapshot = pinnedSnapshot(metadata, snapshotId);
  const source = await icebergDataSource({ tableUrl, metadata, snapshotId: snapshot, resolver });
  // There is no filter on the geometry: the rows must be the same rows the
  // preview table shows for this page.
  const query = `SELECT ${[geometry.name, ...attributeColumns].map(quote).join(', ')} `
    + `FROM t${whereClause(where)} LIMIT ${maxRows} OFFSET ${offset}`;
  const result = await icebergQuery({ tables: { t: source }, query, resolver, signal });

  const features = [];
  const delivered = new Set();
  let droppedFeatures = 0;
  let rowsRead = 0;
  let lastYield = Date.now();

  for await (const batch of streamRowBatches(result, { batchRows: 1024 })) {
    if (signal?.aborted) {throw abortError();}
    for (const row of batch) {
      // The query holds the read to one page. Never go past it, whatever it yields.
      if (rowsRead >= maxRows) {break;}
      rowsRead++;
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
    if (rowsRead >= maxRows) {break;}
  }

  const unusableColumns = features.length > 0
    ? attributeColumns.filter(name => !delivered.has(name))
    : [];

  return {
    exceeded: false,
    featureCollection: { type: 'FeatureCollection', features },
    totalRows: totalRecords(metadata, snapshot),
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
 * Reads `maxRows` rows in table order, starting after the first `offset` rows,
 * so a caller can page through the whole table. The order is stable for one
 * metadata file, because the query has no `ORDER BY` and the scan walks the data
 * files in manifest order. Page one (`offset` 0) holds the same rows that
 * `loadGeoJsonFromIceberg` reads for the map. `fields` lists every column of the
 * table in schema order, the geometry column included, with its type, for the
 * query tab. `totalKnown` says whether
 * `totalRows` comes from the snapshot summary. Without a summary, `totalRows`
 * is only the rows seen so far, `offset` plus the page. `where` is a SQL
 * condition that filters the rows. The snapshot summary counts the whole table,
 * so a filtered read never reports a known total. `snapshotId` reads the table
 * as it was at that snapshot (time travel), and the total comes from that
 * snapshot's summary. An id the table does not have is ignored, and the read
 * uses the current snapshot. An aborted `signal` rejects with an `AbortError`.
 */
export async function loadIcebergRows(url, {
  signal,
  geometryColumn: preferredColumn,
  snapshotId,
  maxRows = MAX_ICEBERG_PREVIEW_ROWS,
  offset = 0,
  where = '',
} = {}) {
  const { tableUrl, resolver, metadata, schema } = await openTable(url, signal);
  const geometries = geometryColumns(schema);
  const primary = geometries.find(c => c.name === preferredColumn) ?? geometries[0] ?? null;
  const otherGeometries = new Set(geometries.filter(c => c !== primary).map(c => c.name));
  const names = (schema.fields ?? []).map(f => f.name);
  const columns = names.filter(name => name !== primary?.name);

  const snapshot = pinnedSnapshot(metadata, snapshotId);
  const source = await icebergDataSource({ tableUrl, metadata, snapshotId: snapshot, resolver });
  const query = `SELECT ${names.map(quote).join(', ')} FROM t${whereClause(where)} LIMIT ${maxRows} OFFSET ${offset}`;
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

  const total = whereClause(where) ? null : totalRecords(metadata, snapshot);
  return {
    columns,
    rows,
    fields: (schema.fields ?? []).map(field => ({ name: field.name, type: typeLabel(field.type) })),
    offset,
    loadedRows: rows.length,
    totalRows: total ?? offset + rows.length,
    totalKnown: total !== null,
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
