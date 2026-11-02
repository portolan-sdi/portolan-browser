// Resolves a GeoParquet asset href that carries a wildcard to one concrete
// file. A partitioned collection publishes its data as many files and points
// one asset at all of them, as in
// `https://data.source.coop/ftw/global-data-2e/vector/2017/zone=*/utm*.parquet`.
// A query engine expands that pattern against object storage. A browser cannot
// list a prefix over HTTP, so the collection's own `item` links are the
// expansion: each item of a partitioned collection is one partition and
// declares that partition's file as an asset.
//
// The table preview reads one partition, not the whole collection. Reading
// further partitions would need a second reader: the preview holds one
// hyparquet file handle and maps a clicked row back to a row index in it (see
// getBboxForRow), which a concatenation of files would break.

import { hasGlobPattern, isParquetAsset, WILDCARD } from './parquetShared.js';

// Re-exported so the resolver's callers and tests reach the detector through
// this module, which owns the glob behavior.
export { hasGlobPattern };

// Error code on the rejection when the pattern cannot be expanded. The caller
// turns it into its own message, because this module does no localization.
export const GLOB_UNRESOLVED = 'globUnresolved';

function unresolved(message) {
  const error = new Error(message);
  error.code = GLOB_UNRESOLVED;
  return error;
}

// A wildcard matches within one path segment, as it does for DuckDB and for
// the `partition:glob` field of the Portolan partition extension. A pattern
// over `zone=*` must not reach into `zone=01/deeper`. Every other character of
// the pattern is matched literally.
function globToRegExp(pattern) {
  const body = pattern
    .split(WILDCARD)
    .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${body}$`);
}

async function fetchItemJson(url, signal) {
  const response = await fetch(url, signal ? { signal } : undefined);
  if (!response.ok) {
    throw new Error(`fetch item failed ${response.status}`);
  }
  return response.json();
}

// The row count over every partition, when the metadata states it. The asset
// stands for the whole collection, so its `table:row_count` is the total.
// stac-js falls back from the asset to its collection, which covers a
// collection that declares the count once for all of its assets.
function declaredTotalRows(asset) {
  const count = Number(asset.getMetadata?.('table:row_count'));
  return Number.isFinite(count) && count > 0 ? count : null;
}

// The STAC-GeoParquet copy of the collection's items, which the spec marks
// with the `collection-mirror` role. Its one row per item holds each
// partition's own row count, so a reader can total the collection from one
// small file instead of 54 item requests. Null when the collection has no
// mirror, and the caller then leaves the total unknown.
function mirrorUrl(context) {
  const mirror = context.getAssets?.()
    ?.find(candidate => candidate.hasRole?.('collection-mirror') && isParquetAsset(candidate));
  return mirror?.getAbsoluteUrl?.() || null;
}

// The parquet asset of one partition, as an absolute href. An href that the
// pattern matches wins. Otherwise the parquet asset with the `data` role wins,
// which covers a publisher whose pattern and item hrefs do not correspond.
// Null rather than a TypeError for an href that URL cannot parse, so one
// malformed asset does not turn the resolver's answer into a generic
// "Invalid URL" failure.
function toAbsolute(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function findPartitionHref(item, pattern, itemUrl) {
  const candidates = Object.values(item?.assets || {})
    .filter(asset => isParquetAsset(asset) && typeof asset.href === 'string')
    .map(asset => ({ asset, url: toAbsolute(asset.href, itemUrl) }))
    .filter(candidate => candidate.url);
  const matcher = globToRegExp(pattern);
  const matched = candidates.find(candidate => matcher.test(candidate.url));
  if (matched) {
    return matched.url;
  }
  const dataRole = candidates.find(candidate => candidate.asset.roles?.includes('data'));
  return dataRole ? dataRole.url : null;
}

/**
 * Resolve a parquet asset to one file the browser can read.
 *
 * Returns `{ url, partition }`. An asset whose href has no wildcard resolves to
 * itself with a null `partition` and costs no request. A wildcard href resolves
 * to the parquet asset of the first `item` link of the asset's collection, and
 * `partition` reports that partition's `title` and the collection's partition
 * `count` so the caller can state which partition it shows.
 *
 * `partition` also carries the row count over every partition, so a count over
 * one file does not read as a count over the collection. `totalRows` holds the
 * count when the metadata declares it. Otherwise `mirrorUrl` names the
 * collection's STAC-GeoParquet item mirror, which the caller can total itself.
 * Both are null when neither is available.
 *
 * Rejects with `error.code === GLOB_UNRESOLVED` when the collection lists no
 * items, when the asset has no collection, or when the first item declares no
 * parquet asset. A failed item request rejects with that request's own error.
 *
 * `fetchJson` is the item reader, injected for tests. `signal` (an
 * AbortSignal) is forwarded to it.
 */
export async function resolveParquetGlob(asset, { signal, fetchJson = fetchItemJson } = {}) {
  const url = asset.getAbsoluteUrl?.() || asset.href || '';
  if (!hasGlobPattern(url)) {
    return { url, partition: null };
  }

  const context = asset.getContext?.();
  const itemLinks = context?.getStacLinksWithRel?.('item') || [];
  if (itemLinks.length === 0) {
    throw unresolved(`No item links expand the pattern ${url}`);
  }

  const link = itemLinks[0];
  // A relative href with no getAbsoluteUrl would fetch against the page
  // origin, which is never the catalog's host under hash routing.
  const itemUrl = toAbsolute(link.getAbsoluteUrl?.() || link.href || '');
  if (!itemUrl) {
    throw unresolved(`The first item link of ${url} has no absolute href`);
  }
  const item = await fetchJson(itemUrl, signal);
  const partitionUrl = findPartitionHref(item, url, itemUrl);
  if (!partitionUrl) {
    throw unresolved(`Item ${itemUrl} declares no parquet asset`);
  }

  const totalRows = declaredTotalRows(asset);
  return {
    url: partitionUrl,
    partition: {
      title: link.title || item?.id || itemUrl,
      count: itemLinks.length,
      totalRows,
      mirrorUrl: totalRows ? null : mirrorUrl(context),
    },
  };
}
