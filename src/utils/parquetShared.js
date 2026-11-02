// Parquet constants and predicates shared between the map layer and the
// parquet loader. This module must stay free of hyparquet imports so that
// StacMapLayer can import it statically without pulling hyparquet into the
// map bundle (hyparquet lives behind utils/parquet.js, which is lazy-loaded
// via StacMapLayer._loadParquetDeps).

export const PARQUET_MEDIA_TYPES = [
  'application/vnd.apache.parquet',
  'application/x-parquet',
];

// Row cap for the table preview in ParquetViewer.
export const MAX_ROWS = 10000;

// Feature-count cap for rendering a GeoParquet directly on the map. Beyond
// this the whole-file download and main-thread decode get expensive; MapLibre
// handles the rendering itself fine (geojson-vt tiles client-side). Defined
// as MAX_ROWS so the table preview and map share one limit.
export const MAX_MAP_FEATURES = MAX_ROWS;

// Byte cap for rendering GeoParquet directly: files this large are too
// expensive to download and decode on the main thread even if their row
// count passes MAX_MAP_FEATURES (few rows, huge geometries).
export const MAX_MAP_PARQUET_BYTES = 50 * 1024 * 1024;

// Reasons carried by the vector-fallback notice channel (StacMapLayer's
// `onVectorNotice` option). Produced by StacMapLayer/utils/parquet.js,
// consumed by MapView — named here so producer and consumer share one
// definition instead of matching magic strings across files.
export const VECTOR_NOTICE_TOO_LARGE = 'tooLarge';
export const VECTOR_NOTICE_TOO_BIG = 'tooBig';
export const VECTOR_NOTICE_ERROR = 'error';
// Distinct from ERROR: the file downloaded and parsed fine, but every feature
// reprojected outside the transform's usable domain, so there is nothing to
// draw. Calling that a load failure points the user at the network when the
// problem is the declared CRS or the coordinates themselves.
export const VECTOR_NOTICE_REPROJECTION = 'reprojection';

// Both spellings of the wildcard that marks a glob href, such as the
// `./country=*/*.parquet` asset portolan-cli writes beside `partition:glob` on
// a partitioned collection. stac-js resolves an href through a URI library
// that percent-encodes `*`, so a published `zone=*/utm*.parquet` reaches a
// caller as `zone=%2A/utm%2A.parquet`.
// Not a global regex: `test` on one carries `lastIndex` between calls, and
// `split` matches every occurrence either way.
export const WILDCARD = /\*|%2A/i;

// Only the path is examined. A wildcard in a query string or a fragment is a
// literal character of the URL, not a pattern over object keys — a signed URL
// such as `data.parquet?token=ab*cd` names one file.
export function hasGlobPattern(url) {
  if (!url) {
    return false;
  }
  return WILDCARD.test(url.split('#')[0].split('?')[0]);
}

// Matches the sibling predicates in StacMapLayer (isCogAsset/isPmtilesAsset):
// substring media-type match — so parameterized types like
// `application/vnd.apache.parquet; charset=binary` are detected — plus an
// `.parquet` href fallback for untyped assets. Shared by the map render path
// and the table preview so both detect the same assets. A glob asset is a
// parquet asset: the table preview resolves its pattern to one partition
// through utils/parquetGlob.js. A caller that fetches the href as one file
// filters with isLoadableParquetAsset below.
export function isParquetAsset(asset) {
  const type = asset.type || '';
  const href = asset.getAbsoluteUrl?.() || asset.href || '';
  return PARQUET_MEDIA_TYPES.some(mt => type.includes(mt)) || href.endsWith('.parquet');
}

// A parquet asset whose href names one fetchable file. The map render path
// downloads an asset's bytes directly and cannot expand a glob, so it filters
// with this predicate and leaves glob assets to the table preview.
export function isLoadableParquetAsset(asset) {
  return isParquetAsset(asset) && !hasGlobPattern(asset.getAbsoluteUrl?.() || asset.href || '');
}
