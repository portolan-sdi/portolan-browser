// stac-js entity -> `@cnmw/download-core` DatasetDescriptor.
//
// The §2.4 mapping itself (collection JSON -> descriptor) lives in
// `@cnmw/download-core`, where it is shared with the Python side and with
// any other host. This module is the portolan-browser-specific half, and it
// is deliberately small: turn the store's stac-js object back into plain
// JSON, make every asset href absolute the way the rest of this app does,
// and hand it over.
//
// Everything here is glue. A stac-browser widget would keep this file and
// change nothing in it (stac-js is upstream's object model too).

import { collectionDownloadSupport } from '@cnmw/download-core';
import { assetHref } from '../mapAssets.js';

// The table/partition extension fields sit at the top level of a Collection
// but inside `properties` on an Item -- a FIRMS partition item carries its
// own `table:row_count` there. §2.4 is written against the collection
// spelling, so an item's properties are lifted to meet it. Only the
// extension prefixes the derivation reads are lifted; nothing else about the
// item is touched.
const LIFTED_PREFIXES = ['table:', 'partition:', 'geoparquet:', 'proj:'];

function liftItemProperties(json) {
  const properties = json.properties;
  if (json.type !== 'Feature' || !properties) {
    return json;
  }
  const lifted = { ...json };
  for (const [key, value] of Object.entries(properties)) {
    if (LIFTED_PREFIXES.some(prefix => key.startsWith(prefix)) && lifted[key] === undefined) {
      lifted[key] = value;
    }
  }
  if (lifted.license === undefined && properties.license) {
    lifted.license = properties.license;
  }
  if (lifted.providers === undefined && properties.providers) {
    lifted.providers = properties.providers;
  }
  return lifted;
}

/**
 * A plain collection/item JSON with absolute asset hrefs.
 *
 * `toJSON()` gives back the document as published, so its hrefs are
 * relative (`./cgaz_adm0.parquet` is the Portolan norm). stac-js already
 * knows how to resolve those -- including the percent-encoding its URI
 * library applies to a `partition:glob`'s `*` -- so the hrefs are taken
 * from the Asset objects rather than re-resolved here.
 * @param {object} data a stac-js Collection or Item
 */
export function toPlainStacJson(data) {
  const json = typeof data.toJSON === 'function' ? data.toJSON() : { ...data };
  if (typeof data.getAssets !== 'function' || !json.assets) {
    return json;
  }
  const assets = { ...json.assets };
  for (const asset of data.getAssets()) {
    const key = asset.getKey?.();
    if (key && assets[key]) {
      assets[key] = { ...assets[key], href: assetHref(asset) };
    }
  }
  return { ...liftItemProperties(json), assets };
}

/**
 * The URLs a browser would actually have to fetch to run this descriptor.
 *
 * Not every URL in a descriptor is one the widget reads. A hive source
 * carries a `partition:glob` that may be an `s3://` URI -- FIRMS publishes
 * one -- but the glob is only *fetched* when the partition values are
 * enumerated from it (`declared`/`values` enumeration). With a
 * `collection-mirror` or `stac-items` enumeration, which is what §2.4
 * derives for every Portolan partitioned collection, the concrete file URL
 * of each part comes from the mirror row or the item's own asset, and the
 * glob is a declaration for DuckDB's benefit that the browser never
 * touches. Treating it as unreachable refused the whole FIRMS archive for
 * no reason.
 * @param {object} source a resolved `DatasetDescriptor['source']`
 * @returns {string[]}
 */
export function fetchTargets(source) {
  if (!source) {
    return [];
  }
  if (source.kind === 'parquet') {
    return [source.url].filter(Boolean);
  }
  if (source.kind === 'parquet-set') {
    return (source.urls || (source.parts || []).map(part => part.url)).filter(Boolean);
  }
  if (source.kind === 'hive' || source.kind === 'stac-geoparquet') {
    const enumeration = source.enumeration;
    if (!enumeration || enumeration.kind === 'declared') {
      return [source.glob].filter(Boolean);
    }
    if (enumeration.kind === 'values') {
      return [source.glob, enumeration.url].filter(Boolean);
    }
    if (enumeration.kind === 'collection-mirror') {
      return [enumeration.url].filter(Boolean);
    }
    if (enumeration.kind === 'stac-items') {
      return [enumeration.collectionUrl].filter(Boolean);
    }
    if (enumeration.kind === 'bucket-listing') {
      return [enumeration.endpoint].filter(Boolean);
    }
    return [source.glob].filter(Boolean);
  }
  return [source.url, source.glob].filter(Boolean);
}

/**
 * A browser can only read `http(s)` and same-origin relative URLs. Portolan
 * catalogs do publish other schemes, and a descriptor carrying one is
 * resolvable in DuckDB or the QGIS plugin but not here. Saying so is much
 * better than a fetch failing with a cryptic scheme error several seconds
 * into an estimate -- but only for the URLs the browser would really fetch,
 * which is what `fetchTargets` decides.
 * @param {object} descriptor
 * @returns {string|null} a reason, or null when the source is fetchable
 */
export function unreachableSource(descriptor) {
  for (const url of fetchTargets(descriptor?.source)) {
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url);
    if (scheme && !/^https?$/i.test(scheme[1])) {
      return `${scheme[1]}:// is not readable from a browser (${url})`;
    }
  }
  return null;
}

/**
 * The authoritative support answer, plus the descriptor when supported.
 *
 * An item inherits nothing from its collection here: a Portolan partition
 * item (FIRMS' `year=2020`) carries its own `data` parquet asset and its own
 * `table:row_count`, which is exactly the single-file case §2.4 handles.
 * @param {object} data a stac-js Collection or Item from the Vuex store
 * @returns {{ supported: boolean, code?: string, message?: string, descriptor?: object }}
 */
export function describeDataset(data) {
  if (!data) {
    return { supported: false, code: 'DATASET_UNSUPPORTED' };
  }
  const baseUrl = typeof data.getAbsoluteUrl === 'function' ? data.getAbsoluteUrl() : undefined;
  const json = toPlainStacJson(data);
  const support = collectionDownloadSupport(json, {
    baseUrl,
    id: json.id,
    title: json.title || json.properties?.title || json.id,
  });
  if (!support.supported) {
    return support;
  }
  const unreachable = unreachableSource(support.descriptor);
  if (unreachable) {
    return { supported: false, code: 'DATASET_UNREACHABLE', message: unreachable, descriptor: support.descriptor };
  }
  return support;
}

