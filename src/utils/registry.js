// The Portolan registry (https://github.com/portolan-sdi/portolan-registry) is the
// canonical list of registered Portolan catalogs. It publishes that list as a STAC
// Catalog whose child links are the catalogs, each carrying `portolan_registry:*`
// metadata from the registry's nightly crawl. See its schema/export.schema.json.
//
// The entries returned here feed the catalog list on the data source selection page.

import { hasText, isObject } from 'stac-js/src/utils.js';

const NUMBER_FORMAT = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function formatCount(value, partial, singular, plural) {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  const number = NUMBER_FORMAT.format(value) + (partial ? '+' : '');
  return `${number} ${value === 1 ? singular : plural}`;
}

// The registry stores no prose about a catalog, so summarize what it does measure.
function summarize(link) {
  const partial = link['portolan_registry:counts_partial'] === true;
  return [
    formatCount(link['portolan_registry:collection_count'], partial, 'collection', 'collections'),
    formatCount(link['portolan_registry:feature_count'], partial, 'feature', 'features')
  ].filter(Boolean).join(' · ');
}

/**
 * Converts a Portolan registry export into catalog entries for the data source list.
 *
 * Catalogs the registry has removed are left out. Stale ones are kept: they still
 * resolve, they just failed a recent crawl.
 *
 * @param {object} data The parsed `exports/catalogs.json` of the registry.
 * @returns {Array.<object>} Entries with `id`, `title`, `summary`, `url` and `isApi`.
 */
export function parseRegistryExport(data) {
  if (!isObject(data) || !Array.isArray(data.links)) {
    return [];
  }
  return data.links
    .filter(link =>
      isObject(link) &&
      link.rel === 'child' &&
      hasText(link.href) &&
      link['portolan_registry:status'] !== 'removed'
    )
    .map(link => {
      const id = hasText(link['portolan_registry:id']) ? link['portolan_registry:id'] : link.href;
      return {
        id,
        title: hasText(link.title) ? link.title : id,
        summary: summarize(link),
        url: link.href,
        isApi: link['portolan_registry:api_type'] === 'api'
      };
    });
}

export default parseRegistryExport;
