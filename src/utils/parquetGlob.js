// Resolves a GeoParquet asset href that carries a wildcard to one concrete
// file. A partitioned collection publishes its data as many files and points
// one asset at all of them, as in
// `https://data.source.coop/ftw/global-data-2e/vector/2017/zone=*/utm*.parquet`.
// A query engine expands that pattern against object storage. A browser cannot
// list a prefix over HTTP, so the collection's own `item` links are the
// expansion: each item of a partitioned collection is one partition and
// declares that partition's file as an asset.
//
// Portolan v0.3 forbids that wildcard href: a partitioned collection states
// where its data lives in `partition:glob` and may publish no concrete parquet
// data asset at all. That collection resolves through utils/partitionList.js,
// which lists the bucket over its provider's anonymous HTTP API, and the
// caller selects the expansion through the synthetic entry below.
//
// The table preview reads one partition, not the whole collection. Reading
// further partitions would need a second reader: the preview holds one
// hyparquet file handle and maps a clicked row back to a row index in it (see
// getBboxForRow), which a concatenation of files would break.

import { fetchableAssetHref } from './fetchableHref.js';
import { expandPartitionGlob, globToRegExp, readPartitionMetadata } from './partitionList.js';
import { GLOB_UNRESOLVED, hasGlobPattern, isParquetAsset } from './parquetShared.js';

// Re-exported so the resolver's callers and tests reach the detector and the
// rejection code through this module, which owns the glob behavior.
export { GLOB_UNRESOLVED, hasGlobPattern };

function unresolved(message) {
  const error = new Error(message);
  error.code = GLOB_UNRESOLVED;
  return error;
}

// The key of the synthetic entry, and the property that marks it. A
// partitioned collection of Portolan v0.3 may publish no concrete parquet data
// asset at all: the spec forbids a wildcard href, so the only statement of
// where the data lives is the collection's `partition:glob`. ParquetViewer
// offers one entry for it, and this marker tells the resolver to expand that
// field by listing the bucket instead of reading an item.
const PLACEHOLDER_KEY = 'partition:glob';
const PLACEHOLDER_FLAG = 'portolanPartitionPlaceholder';

/**
 * The synthetic asset entry for a collection whose data sits behind
 * `partition:glob`. Carries the title its caller shows in the asset list and
 * reads every metadata field through the collection, so the resolver finds
 * `table:row_count` and the partition fields where it finds them on a real
 * asset.
 */
export function createPartitionPlaceholder(context, { title = '' } = {}) {
  return {
    [PLACEHOLDER_FLAG]: true,
    title,
    getKey: () => PLACEHOLDER_KEY,
    getContext: () => context || null,
    getMetadata: field => context?.getMetadata?.(field),
    // No href names the data: the glob does, and only the resolver expands it.
    getAbsoluteUrl: () => null,
  };
}

/** True for an entry createPartitionPlaceholder made, false for a real asset. */
export function isPartitionPlaceholder(asset) {
  return Boolean(asset?.[PLACEHOLDER_FLAG]);
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

// The file name the expansion ends in, decoded: a listing builds its URLs
// with percent-encoded path segments, and `year%3D2021` names no partition to
// a reader. Query and fragment are cut first, so a signed URL still reports
// its file.
function basename(url) {
  const path = String(url).split('#')[0].split('?')[0];
  const last = path.slice(path.lastIndexOf('/') + 1);
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

// The partitioned-collection branch: no asset names the data, so the
// collection's `partition:glob` is expanded against its bucket and the first
// file in lexicographic order is the preview. `count` is the number of files
// the glob matched, which is what the partition note states.
async function resolvePartitionGlob(asset, { signal, listGlob }) {
  const metadata = readPartitionMetadata(asset);
  if (!metadata) {
    throw unresolved('The collection declares no partition:glob to expand');
  }

  const context = asset.getContext?.();
  const files = await listGlob(metadata.glob, context?.getMetadata?.('storage:schemes'), { signal });
  // expandPartitionGlob sorts by key and rejects an empty expansion, so the
  // first entry is the first partition. The guard holds for any other lister.
  if (!files || files.length === 0) {
    throw unresolved(`The expansion of the partition glob ${metadata.glob} named no files`);
  }

  const totalRows = declaredTotalRows(asset);
  return {
    url: files[0],
    partition: {
      title: basename(files[0]),
      count: files.length,
      totalRows,
      mirrorUrl: totalRows ? null : mirrorUrl(context),
    },
  };
}

/**
 * Resolve a parquet asset to one file the browser can read.
 *
 * Returns `{ url, partition }`. An asset whose href has no wildcard resolves to
 * itself with a null `partition` and costs no request. A wildcard href resolves
 * to the parquet asset of the first `item` link of the asset's collection, and
 * `partition` reports that partition's `title` and the collection's partition
 * `count` so the caller can state which partition it shows. The synthetic
 * entry of createPartitionPlaceholder resolves to the first file of the
 * collection's expanded `partition:glob`, with that file's name as the
 * partition `title` and the number of matched files as the `count`.
 *
 * `partition` also carries the row count over every partition, so a count over
 * one file does not read as a count over the collection. `totalRows` holds the
 * count when the metadata declares it. Otherwise `mirrorUrl` names the
 * collection's STAC-GeoParquet item mirror, which the caller can total itself.
 * Both are null when neither is available.
 *
 * Rejects with `error.code === GLOB_UNRESOLVED` when the collection lists no
 * items, when the asset has no collection, when the first item declares no
 * parquet asset, when a placeholder's collection declares no glob, and
 * whenever the expansion of a glob fails. A failed item request rejects with
 * that request's own error.
 *
 * `fetchJson` is the item reader and `listGlob` the glob expander, both
 * injected for tests. `signal` (an AbortSignal) is forwarded to them.
 */
export async function resolveParquetGlob(asset, {
  signal, fetchJson = fetchItemJson, listGlob = expandPartitionGlob,
} = {}) {
  if (isPartitionPlaceholder(asset)) {
    return resolvePartitionGlob(asset, { signal, listGlob });
  }

  const url = asset.getAbsoluteUrl?.() || asset.href || '';
  if (!hasGlobPattern(url)) {
    // An s3:// primary href previews through the https alternate the v0.3
    // spec requires beside it; fetchableAssetHref answers the href itself
    // whenever it is already one a browser can read.
    return { url: fetchableAssetHref(asset) || url, partition: null };
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
