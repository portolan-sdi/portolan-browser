// The Portolan registry (https://github.com/portolan-sdi/portolan-registry) is the
// canonical list of registered Portolan catalogs. It publishes that list as a STAC
// Catalog whose child links are the catalogs, each carrying `portolan_registry:*`
// metadata from the registry's nightly crawl. See its schema/export.schema.json.
//
// The entries returned here feed the catalog list on the data source selection page.

import { hasText, isObject } from 'stac-js/src/utils.js';

// The export is fetched at runtime from a host this repo does not control, so
// what it says is input, not configuration. A catalog URL is followed when a
// visitor clicks it, so only the two schemes the browser can actually read a
// catalog over are accepted. Credentials in the URL are refused rather than
// forwarded to whatever host the registry names.
function catalogUrl(href) {
  if (!hasText(href)) {
    return null;
  }
  let url;
  try {
    url = new URL(href.trim());
  }
  catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  if (url.username || url.password) {
    return null;
  }
  return url.toString();
}

// A logo is fetched and rendered by the browser, so its href goes through the
// same gate as the catalog's: an `href` the registry supplies is not trusted to
// be a plain URL just because it sits under a different key.
function catalogLogo(logo) {
  if (!isObject(logo)) {
    return null;
  }
  const href = catalogUrl(logo.href);
  if (href === null) {
    return null;
  }
  return { href, title: hasText(logo.title) ? logo.title : null };
}

// A count the registry could not measure is left out rather than shown as zero.
function positiveInteger(value) {
  return Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * Converts a Portolan registry export into catalog entries for the data source list.
 *
 * Catalogs the registry has removed are left out, as are entries whose href is not
 * a plain http(s) URL. Stale ones are kept: they still resolve, they just failed a
 * recent crawl.
 *
 * Counts are returned as numbers rather than a sentence, so the view can phrase and
 * localise them.
 *
 * @param {object} data The parsed `exports/catalogs.json` of the registry.
 * @returns {Array.<object>} Entries with `id`, `title`, `url`, `isApi`, `logo` and counts.
 */
export function parseRegistryExport(data) {
  if (!isObject(data) || !Array.isArray(data.links)) {
    return [];
  }
  const seen = new Set();
  const entries = [];
  for (const link of data.links) {
    if (!isObject(link) || link.rel !== 'child' || link['portolan_registry:status'] === 'removed') {
      continue;
    }
    const url = catalogUrl(link.href);
    if (url === null) {
      continue;
    }
    // The id keys the rendered list. The registry does not promise it is unique,
    // and a repeated key renders the wrong row, so fall back to the URL.
    let id = hasText(link['portolan_registry:id']) ? link['portolan_registry:id'] : url;
    if (seen.has(id)) {
      id = url;
    }
    if (seen.has(id)) {
      continue;
    }
    seen.add(id);
    entries.push({
      id,
      title: hasText(link.title) ? link.title : id,
      url,
      isApi: link['portolan_registry:api_type'] === 'api',
      logo: catalogLogo(link['portolan_registry:logo']),
      collectionCount: positiveInteger(link['portolan_registry:collection_count']),
      featureCount: positiveInteger(link['portolan_registry:feature_count']),
      countsPartial: link['portolan_registry:counts_partial'] === true
    });
  }
  return entries;
}
