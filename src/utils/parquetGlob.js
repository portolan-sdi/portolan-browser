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

import { isParquetAsset } from './parquetShared.js';

// Error code on the rejection when the pattern cannot be expanded. The caller
// turns it into its own message, because this module does no localization.
export const GLOB_UNRESOLVED = 'globUnresolved';

function unresolved(message) {
  const error = new Error(message);
  error.code = GLOB_UNRESOLVED;
  return error;
}

// Both spellings of the wildcard. stac-js resolves an href through a URI
// library that percent-encodes `*`, so a published `zone=*/utm*.parquet`
// reaches this module as `zone=%2A/utm%2A.parquet`.
// Not a global regex: `test` on one carries `lastIndex` between calls, and
// `split` matches every occurrence either way.
const WILDCARD = /\*|%2A/i;

// Only the path is examined. A wildcard in a query string or a fragment is a
// literal character of the URL, not a pattern over object keys.
export function hasGlobPattern(url) {
  if (!url) {
    return false;
  }
  return WILDCARD.test(url.split('#')[0].split('?')[0]);
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

// The parquet asset of one partition, as an absolute href. An href that the
// pattern matches wins. Otherwise the parquet asset with the `data` role wins,
// which covers a publisher whose pattern and item hrefs do not correspond.
function findPartitionHref(item, pattern, itemUrl) {
  const candidates = Object.values(item?.assets || {})
    .filter(asset => isParquetAsset(asset) && typeof asset.href === 'string')
    .map(asset => ({ asset, url: new URL(asset.href, itemUrl).href }));
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

  const itemLinks = asset.getContext?.()?.getStacLinksWithRel?.('item') || [];
  if (itemLinks.length === 0) {
    throw unresolved(`No item links expand the pattern ${url}`);
  }

  const link = itemLinks[0];
  const itemUrl = link.getAbsoluteUrl?.() || link.href;
  const item = await fetchJson(itemUrl, signal);
  const partitionUrl = findPartitionHref(item, url, itemUrl);
  if (!partitionUrl) {
    throw unresolved(`Item ${itemUrl} declares no parquet asset`);
  }

  return {
    url: partitionUrl,
    partition: { title: link.title || item?.id || itemUrl, count: itemLinks.length },
  };
}
