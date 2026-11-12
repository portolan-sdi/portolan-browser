// Does this STAC entity plausibly hold downloadable vector data?
//
// This is the cheap gate the "Download data" widget's `condition` in
// widgets.config.js runs on every render. It is deliberately *not* the
// authoritative answer: that is `@cnmw/download-core`'s §2.4 derivation,
// which `utils/download/descriptor.js` runs inside the widget's own lazy
// chunk. The split exists because widgets.config.js is imported eagerly by
// WidgetHook, so anything it pulls in lands in the main bundle -- and
// `@cnmw/download-core` plus `@cnmw/spec` is not something every catalog
// page should pay for to decide not to show a panel.
//
// So: this module must stay dependency-light (it imports only the app's own
// parquet predicates), must never throw, and must only ever be *more*
// permissive than the real derivation. When it says yes and the derivation
// then refuses, the widget renders its refusal and nothing is lost. When it
// says no, the panel is simply absent -- which is how the design wants
// "unsupported" to read (design call #8: unsupported is an absence, not an
// error dialog).

import { isParquetAsset } from '../parquetShared.js';

// A hive-partitioned Portolan collection may carry no parquet *asset* at
// all: FIRMS publishes `partition:glob` plus one `item` link per year, and
// its only `data`-role asset is PMTiles. Those collections are exactly the
// ones the download widget is for, so the partition keys count as evidence.
function isPartitioned(data) {
  return Boolean(data['partition:scheme'] || data['partition:glob']);
}

function hasVectorParquetAsset(data) {
  const assets = typeof data.getAssets === 'function' ? data.getAssets() : Object.values(data.assets || {});
  return assets.some(asset => {
    const roles = Array.isArray(asset.roles) ? asset.roles : [];
    // §2.4 derives the source from a `data`-role asset. An asset with no
    // roles at all is still worth a look -- plenty of catalogs omit them --
    // but a thumbnail or an overview is not the dataset.
    if (roles.length > 0 && !roles.includes('data')) {
      return false;
    }
    return isParquetAsset(asset);
  });
}

/**
 * True when the download widget should offer itself for this entity.
 * @param {object} data the STAC entity from the Vuex store (a stac-js object)
 * @returns {boolean}
 */
export function mayHaveDownloadableVector(data) {
  if (!data || typeof data !== 'object') {
    return false;
  }
  // Collections and items only. A catalog is a container; the landing page
  // has no dataset to download.
  if (!data.isCollection && !data.isItem) {
    return false;
  }
  try {
    return isPartitioned(data) || hasVectorParquetAsset(data);
  } catch {
    return false;
  }
}
