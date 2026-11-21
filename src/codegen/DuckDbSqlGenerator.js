// The DuckDB SQL equivalent of a `DownloadRequest` -- design call #7's
// "documented SQL recipes", generated rather than documented, so the snippet
// always matches the area and filters the user actually picked.
//
// The translation follows the @cngeo design doc §2.9 table verbatim, because
// that table is also what the QGIS plugin's Python side implements:
//   spatial.mode 'bbox'       -> covering-column comparison only
//   spatial.mode 'intersects' -> covering comparison AND ST_Intersects(geom)
//   spatial.mode 'clip'       -> the above, with ST_Intersection in SELECT
//   where                     -> one ANDed term per predicate
//   whereSql                  -> appended verbatim (it is already DuckDB)
//   columns                   -> an explicit SELECT list
//   time                      -> one more ANDed term
// Running this in DuckDB and running the widget must produce the same rows;
// that equivalence is the point of emitting it at all.
//
// See DownloadRequestGenerator.js for why this does not extend
// CodeGenerator.

/** Identifiers come from parquet schemas, so quote and escape them. */
function ident(name) {
  return String(name)
    .split('.')
    .map(part => `"${part.replace(/"/g, '""')}"`)
    .join('.');
}

function literal(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * The covering's top-level column name(s), mirroring extract-core's
 * `bboxColumnNames`: a struct covering is one column, a columns covering
 * up to four distinct ones. A future `native` covering lives in parquet
 * footer statistics, not in any column, so it contributes none.
 */
function coveringColumnNames(bbox) {
  if (!bbox || bbox.kind === 'none') {
    return [];
  }
  if (bbox.kind === 'struct') {
    return [bbox.column || 'bbox'];
  }
  if (bbox.kind === 'columns') {
    return [...new Set([bbox.xmin, bbox.ymin, bbox.xmax, bbox.ymax])].filter(Boolean);
  }
  return [];
}

/** The covering columns, as dotted paths DuckDB can read. */
function coveringPaths(bbox) {
  if (!bbox || bbox.kind === 'none') {
    return null;
  }
  if (bbox.kind === 'struct') {
    const fields = bbox.fields || {};
    const column = bbox.column || 'bbox';
    return {
      xmin: `${column}.${fields.xmin || 'xmin'}`,
      ymin: `${column}.${fields.ymin || 'ymin'}`,
      xmax: `${column}.${fields.xmax || 'xmax'}`,
      ymax: `${column}.${fields.ymax || 'ymax'}`
    };
  }
  if (bbox.kind === 'columns') {
    return { xmin: bbox.xmin, ymin: bbox.ymin, xmax: bbox.xmax, ymax: bbox.ymax };
  }
  return null;
}

function predicateSql(predicate) {
  if (!predicate || typeof predicate !== 'object') {
    return null;
  }
  const { op } = predicate;
  if (op === 'and' || op === 'or') {
    const parts = (predicate.args || []).map(predicateSql).filter(Boolean);
    return parts.length > 0 ? `(${parts.join(` ${op.toUpperCase()} `)})` : null;
  }
  if (op === 'not') {
    const inner = predicateSql(predicate.arg);
    return inner ? `NOT (${inner})` : null;
  }
  const col = ident(predicate.col);
  switch (op) {
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=':
      return `${col} ${op === '!=' ? '<>' : op} ${literal(predicate.value)}`;
    case 'in':
    case 'not_in':
      return `${col} ${op === 'in' ? 'IN' : 'NOT IN'} (${(predicate.values || []).map(literal).join(', ')})`;
    case 'between':
      return `${col} BETWEEN ${literal(predicate.low)} AND ${literal(predicate.high)}`;
    case 'is_null':
      return `${col} IS NULL`;
    case 'is_not_null':
      return `${col} IS NOT NULL`;
    case 'like':
      return `${col} LIKE ${literal(predicate.value)}`;
    case 'ilike':
      return `${col} ILIKE ${literal(predicate.value)}`;
    case 'not_like':
      return `${col} NOT LIKE ${literal(predicate.value)}`;
    default:
      return null;
  }
}

function timeSql(time, table) {
  if (!time || (!time.start && !time.end)) {
    return null;
  }
  const column = ident(time.column || table?.timeColumn || 'datetime');
  const closed = time.closed || '[)';
  const parts = [];
  if (time.start) {
    parts.push(`${column} ${closed.startsWith('[') ? '>=' : '>'} ${literal(time.start)}`);
  }
  if (time.end) {
    parts.push(`${column} ${closed.endsWith(']') ? '<=' : '<'} ${literal(time.end)}`);
  }
  return parts.join(' AND ');
}

function bboxSql(paths, bboxes, includeTouch) {
  if (!paths || !Array.isArray(bboxes) || bboxes.length === 0) {
    return null;
  }
  const le = includeTouch ? '<=' : '<';
  const ge = includeTouch ? '>=' : '>';
  // One group per box: an antimeridian-crossing area carries two
  // (design doc §1.5), and the test is an OR over them.
  const groups = bboxes.map(([xmin, ymin, xmax, ymax]) => (
    `(${ident(paths.xmin)} ${le} ${xmax} AND ${ident(paths.xmax)} ${ge} ${xmin}`
    + ` AND ${ident(paths.ymin)} ${le} ${ymax} AND ${ident(paths.ymax)} ${ge} ${ymin})`
  ));
  return groups.length === 1 ? groups[0] : `(${groups.join('\n      OR ')})`;
}

// A filter geometry can run to the 10,000-vertex ceiling, which inlines as
// a few hundred KB of coordinates: still pasteable, but past some size the
// snippet stops being readable and the syntax highlighter starts to cost
// real time. Past this many characters the snippet falls back to the bbox
// test and says so; the exact geometry is in the request JSON next to it.
// 120,000 characters is about 5,000 vertices, which covers an ADM2-sized
// area comfortably and a simplified country outline most of the time.
const MAX_INLINE_GEOMETRY_CHARS = 120_000;

function sourceSql(source) {
  if (!source) {
    return { from: "read_parquet('?')", hive: false };
  }
  if (source.kind === 'parquet') {
    return { from: `read_parquet(${literal(source.url)})`, hive: false };
  }
  if (source.kind === 'parquet-set') {
    // An explicit list of files making one logical table. DuckDB reads a
    // list the same way the widget's engine does.
    const urls = (source.parts || source.urls || [])
      .map(part => part?.url || part)
      .filter(url => typeof url === 'string');
    if (urls.length > 0) {
      return { from: `read_parquet([${urls.map(literal).join(', ')}])`, hive: false };
    }
  }
  if (source.glob) {
    return {
      from: `read_parquet(${literal(source.glob)}, hive_partitioning = true)`,
      hive: true
    };
  }
  if (source.url) {
    return { from: `read_parquet(${literal(source.url)})`, hive: false };
  }
  return { from: "read_parquet('?')", hive: false };
}

function partitionSql(partitions) {
  if (!partitions) {
    return [];
  }
  const terms = [];
  for (const [key, value] of Object.entries(partitions)) {
    if (!value || value.op === 'all') {
      continue;
    }
    if (value.op === 'in') {
      terms.push(`${ident(key)} IN (${(value.values || []).map(literal).join(', ')})`);
    } else if (value.op === 'between') {
      terms.push(`${ident(key)} BETWEEN ${literal(value.low)} AND ${literal(value.high)}`);
    }
  }
  return terms;
}

function selectList(request, geometryExpression) {
  const { dataset, filter } = request;
  const geometryColumn = dataset.table?.geometryColumn || 'geometry';
  const projection = filter.columns || {};
  const declared = (dataset.table?.columns || []).map(c => c.name);
  // The covering column(s) are pruning machinery, not data: the engine's
  // `resolveOutputColumns` drops them from the output unless
  // `columns.includeBbox` asks for them, and the snippet must select the
  // same columns or the two files differ on every Portolan dataset.
  const bboxColumns = projection.includeBbox ? [] : coveringColumnNames(dataset.table?.bbox);
  const hidden = name => name === geometryColumn || bboxColumns.includes(name);
  let names;
  if (Array.isArray(projection.include) && projection.include.length > 0) {
    names = projection.include.filter(name => !hidden(name));
  } else if (Array.isArray(projection.exclude) && projection.exclude.length > 0) {
    names = declared.filter(name => !hidden(name) && !projection.exclude.includes(name));
  } else if (declared.length > 0) {
    names = declared.filter(name => !hidden(name));
  } else {
    names = [];
  }
  // With no declared columns, a bare `*` would repeat the geometry column
  // beside its decoded copy below -- DuckDB refuses duplicate output
  // names -- and would leak the covering column into the output.
  const star = `* EXCLUDE (${[geometryColumn, ...bboxColumns].map(ident).join(', ')})`;
  const parts = names.length > 0 ? names.map(ident) : [star];
  if (!projection.dropGeometry) {
    parts.push(`${geometryExpression} AS ${ident(geometryColumn)}`);
  }
  return parts;
}

// The GDAL driver for each non-parquet output the widget offers. GDAL has
// no Esri JSON writer, so that one falls back to GeoJSON and generate()
// says so in a note.
const GDAL_DRIVERS = {
  geojson: "DRIVER 'GeoJSON'",
  gpkg: "DRIVER 'GPKG'",
  flatgeobuf: "DRIVER 'FlatGeobuf'",
  shapefile: "DRIVER 'ESRI Shapefile'",
  csv: "DRIVER 'CSV', LAYER_CREATION_OPTIONS 'GEOMETRY=AS_WKT'",
  esrijson: "DRIVER 'GeoJSON'"
};

function copyOptions(output) {
  if (output?.format === 'geoparquet') {
    const options = output.options || {};
    const compression = String(options.compression || 'zstd').toUpperCase();
    const parts = ['FORMAT PARQUET', `COMPRESSION ${compression}`];
    if (options.rowGroupSize) {
      parts.push(`ROW_GROUP_SIZE ${Number(options.rowGroupSize)}`);
    }
    return parts.join(', ');
  }
  const driver = GDAL_DRIVERS[output?.format] || GDAL_DRIVERS.geojson;
  return `FORMAT GDAL, ${driver}`;
}

export default class DuckDbSqlGenerator {
  get language() {
    return 'sql';
  }

  // The host renders the label; the generator only names its key, so
  // this module stays importable without the app's i18n bootstrap.
  get labelKey() {
    return 'widgets.areaDownload.code.sql';
  }

  get highlightLanguage() {
    return 'sql';
  }

  get outputFile() {
    return 'download.sql';
  }

  get installDependencies() {
    return 'INSTALL spatial;\nLOAD spatial;';
  }

  /**
   * @param {object} request a `cng-request/1.0` DownloadRequest
   * @returns {string}
   */
  generate(request) {
    if (!request?.dataset) {
      return '';
    }
    // The raw passthrough has no row-filtered SQL equivalent: it copies
    // the original file(s) byte for byte, and the area and dates only
    // choose WHICH files are fetched. A filtered COPY here would claim
    // row selection that never happens.
    if (request.output?.format === 'parquet-raw') {
      return this.generateRaw(request);
    }
    const { dataset, filter, output } = request;
    const geometryColumn = dataset.table?.geometryColumn || 'geometry';
    const mode = filter?.spatial?.mode || 'intersects';
    const area = filter?.area && !filter.area.ref ? filter.area : null;
    const bboxes = area?.properties?.['area:bboxes'] || (area?.bbox ? [area.bbox] : []);
    const notes = [];

    // The *filter* geometry, not the display one: that is what the widget
    // tests rows against, so the SQL has to use the same vertices or the two
    // return different rows. It is null when simplification degraded the
    // area to its bbox (design doc §1.3), and then the bbox test is the
    // whole spatial filter here too.
    const filterGeometry = area ? (area.properties?.['area:filter_geometry'] || area.geometry) : null;

    let areaExpression = null;
    if (filterGeometry) {
      const geojson = JSON.stringify(filterGeometry);
      if (geojson.length <= MAX_INLINE_GEOMETRY_CHARS) {
        areaExpression = `ST_GeomFromGeoJSON(${literal(geojson)})`;
      } else {
        notes.push(
          `-- The selected area has ${area.properties?.['area:vertex_count']?.filter ?? 'many'} vertices,`,
          '-- too many to inline here. This query keeps the bbox test only, so it',
          '-- over-selects near the area boundary. The exact geometry is in the',
          '-- accompanying download-request.json (filter.area).'
        );
      }
    }

    const geometryExpression = mode === 'clip' && areaExpression
      ? `ST_Intersection(ST_GeomFromWKB(${ident(geometryColumn)}), ${areaExpression})`
      : `ST_GeomFromWKB(${ident(geometryColumn)})`;

    const where = [];
    const bbox = bboxSql(coveringPaths(dataset.table?.bbox), bboxes, filter?.spatial?.includeBboxTouch);
    if (bbox) {
      where.push({ comment: '-- Covering-column prune: row groups are skipped on these statistics.', sql: bbox });
    } else if (bboxes.length > 0) {
      notes.push(
        '-- This dataset declares no bbox covering columns, so DuckDB has to',
        '-- read every geometry. The widget behaves the same way.'
      );
    }
    if (mode !== 'bbox' && areaExpression) {
      where.push({
        comment: '-- Exact test against the selected area.',
        sql: `ST_Intersects(ST_GeomFromWKB(${ident(geometryColumn)}), ${areaExpression})`
      });
    } else if (mode === 'bbox' && !bbox && areaExpression) {
      // No covering columns to test (an undeclared covering, or a future
      // footer-statistics one): without a stand-in the query would select
      // the whole dataset.
      where.push({
        comment: '-- No covering columns: the exact test stands in for the bbox prune.',
        sql: `ST_Intersects(ST_GeomFromWKB(${ident(geometryColumn)}), ${areaExpression})`
      });
    }
    if (output?.format === 'geoparquet') {
      notes.push(
        '-- The widget\'s GeoParquet writer also derives fresh bbox covering',
        '-- columns (bbox_xmin .. bbox_ymax) for the output; this query does not.'
      );
    } else if (output?.format === 'esrijson') {
      notes.push(
        '-- GDAL cannot write Esri JSON, so this query writes GeoJSON instead.'
      );
    }
    for (const term of partitionSql(filter?.partitions)) {
      where.push({ comment: null, sql: term });
    }
    const time = timeSql(filter?.time, dataset.table);
    if (time) {
      where.push({ comment: null, sql: time });
    }
    for (const predicate of filter?.where || []) {
      const sql = predicateSql(predicate);
      if (sql) {
        where.push({ comment: null, sql });
      }
    }
    if (filter?.whereSql?.fragment) {
      where.push({
        comment: '-- Raw filter fragment, as typed.',
        sql: `(${filter.whereSql.fragment})`
      });
    }

    const { from } = sourceSql(dataset.source);
    const lines = [];
    lines.push(`-- ${dataset.title || dataset.id}`);
    if (area?.properties?.['area:name']) {
      lines.push(`-- Area: ${area.properties['area:name']}`);
    }
    lines.push('-- Generated by the portolan-browser download widget.');
    lines.push(...notes);
    lines.push('');
    lines.push('INSTALL spatial;');
    lines.push('LOAD spatial;');
    lines.push('');
    lines.push('COPY (');
    lines.push(`  SELECT ${selectList(request, geometryExpression).join(',\n         ')}`);
    lines.push(`  FROM ${from}`);
    if (where.length > 0) {
      lines.push('  WHERE');
      where.forEach((term, index) => {
        if (term.comment) {
          lines.push(`    ${term.comment}`);
        }
        lines.push(`    ${index === 0 ? '' : 'AND '}${term.sql}`);
      });
    }
    if (filter?.limit) {
      lines.push(`  LIMIT ${Number(filter.limit)}`);
    }
    lines.push(`) TO ${literal(output?.filename || 'download.parquet')} (${copyOptions(output)});`);
    return `${lines.join('\n')}\n`;
  }

  /**
   * The raw-passthrough snippet: no COPY and no WHERE, because the real
   * download applies neither. It names the source file(s) and shows how
   * to open them, which is all the SQL there honestly is.
   * @param {object} request a `cng-request/1.0` DownloadRequest
   * @returns {string}
   */
  generateRaw(request) {
    const { dataset } = request;
    const source = dataset.source || {};
    const urls = source.kind === 'parquet' && source.url
      ? [source.url]
      : (source.parts || source.urls || [])
        .map(part => part?.url || part)
        .filter(url => typeof url === 'string');
    const lines = [];
    lines.push(`-- ${dataset.title || dataset.id}`);
    lines.push('-- Generated by the portolan-browser download widget.');
    lines.push('--');
    lines.push('-- This download copies the original source file(s) byte for byte.');
    lines.push('-- The area and the date window only choose WHICH files are fetched;');
    lines.push('-- no SQL filters the rows inside them.');
    if (urls.length > 0) {
      lines.push('--');
      lines.push('-- To read the same file(s) in DuckDB:');
      lines.push('');
      lines.push(urls.length === 1
        ? `SELECT * FROM read_parquet(${literal(urls[0])});`
        : `SELECT * FROM read_parquet([${urls.map(literal).join(', ')}]);`);
    } else if (source.glob) {
      lines.push('--');
      lines.push('-- To read the same files in DuckDB:');
      lines.push('');
      lines.push(`SELECT * FROM read_parquet(${literal(source.glob)}, hive_partitioning = true);`);
    }
    return `${lines.join('\n')}\n`;
  }
}
