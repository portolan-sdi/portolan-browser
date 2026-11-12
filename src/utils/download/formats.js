// Which output formats the card offers, and what each one costs.
//
// `@cnmw/download-core` ships GeoJSON and GeoParquet in core and registers
// them itself. Everything else is a separate package that registers a small
// *descriptor* — id, label, extension, media type, a synchronous
// `estimateBytes` and an `approxBytes` weight — whose `load()` is not
// called until a download for that id actually starts. That is what makes
// it honest to offer GeoPackage: the card can say "+340 KB" *before* the
// sql.js wasm is fetched, and never fetch it for a user who picks
// GeoParquet.
//
// Registration is by module import, so the descriptors (a few KB of
// JavaScript each) land in the widget's lazy chunk and the heavy parts stay
// behind their own `load()`:
//
// | id         | load()                      | weight |
// | ---------- | --------------------------- | ------ |
// | geojson    | built in, eager             | —      |
// | geoparquet | built in, eager             | —      |
// | gpkg       | sql.js wasm, from a CDN     | ~340 KB |
// | flatgeobuf | flatgeobuf, from a CDN      | ~10 KB |
// | shapefile  | resolves locally, no fetch  | ~2 KB  |
// | csv        | resolves locally, no fetch  | — |
// | esrijson   | resolves locally, no fetch  | — |
//
// The two CDN ones are the only part of this widget that fetches code at
// runtime, and they fail loudly (`FORMAT_LOAD_FAILED`, said in words by the
// card) rather than silently: a deployment with no outbound internet keeps
// five formats and loses two, which is a better trade than bundling a
// 340 KB wasm into every page that shows a map.

import { registerLazyFormat, formats, getFormat, formatLoadState } from '@cnmw/download-core';
import { gpkgFormatDescriptor } from '@cnmw/format-gpkg';
import { flatGeobufFormatDescriptor } from '@cnmw/format-flatgeobuf';
import { shapefileFormatDescriptor } from '@cnmw/format-shapefile';
import { csvFormatDescriptor, esriJsonFormatDescriptor } from '@cnmw/format-extras';

// The order they are offered in: the two that need nothing first, then the
// interchange formats, then the two text ones. Any format registered by a
// host but not named here still appears, after these.
export const FORMAT_ORDER = ['geojson', 'geoparquet', 'gpkg', 'flatgeobuf', 'shapefile', 'csv', 'esrijson'];

// `formats()` labels an eagerly-registered plugin with its own id, because
// core has no human name for it. These two do.
const BUILT_IN_LABELS = {
  geojson: 'GeoJSON',
  geoparquet: 'GeoParquet'
};

let registered = false;

/**
 * Register the optional formats, once per page. Idempotent, and cheap:
 * `registerLazyFormat` stores the descriptor and nothing else.
 */
export function registerOptionalFormats() {
  if (registered) {
    return;
  }
  for (const descriptor of [
    gpkgFormatDescriptor,
    flatGeobufFormatDescriptor,
    shapefileFormatDescriptor,
    csvFormatDescriptor,
    esriJsonFormatDescriptor
  ]) {
    registerLazyFormat(descriptor);
  }
  registered = true;
}

function orderOf(id) {
  const index = FORMAT_ORDER.indexOf(id);
  return index === -1 ? FORMAT_ORDER.length : index;
}

/**
 * Every registered format, in offer order, with what the card needs to
 * render a button for it: a label, the bytes-per-row model, the plugin's
 * own download weight, and whether that plugin is already here.
 *
 * Listing never loads anything — that is the whole point of the lazy
 * registry — so this is safe to call from a computed property.
 * @returns {Array<{ id: string, label: string, extension: string, mediaType: string,
 *   estimateBytes?: Function, approxBytes?: object, lazy: boolean, loadState: string }>}
 */
export function listFormats() {
  registerOptionalFormats();
  const entries = formats().map(entry => {
    // An eager entry is a *summary* of its plugin and carries no
    // `estimateBytes`; the plugin itself does, and `getFormat` has it
    // without loading anything.
    const plugin = entry.lazy ? null : getFormat(entry.id);
    return {
      ...entry,
      label: BUILT_IN_LABELS[entry.id] || entry.label || entry.id,
      estimateBytes: entry.estimateBytes || plugin?.estimateBytes,
      loadState: entry.loadState || formatLoadState(entry.id)
    };
  });
  return entries.sort((a, b) => orderOf(a.id) - orderOf(b.id));
}

/**
 * The weight to show beside a format that is not loaded yet, in bytes, or
 * null when there is nothing to fetch or it is already here.
 *
 * A descriptor that declares a sub-kilobyte weight (the pure-JS writers)
 * says "nothing worth mentioning" rather than "+300 B", which would be
 * noise in a row of buttons.
 * @param {{ approxBytes?: { estimate?: number, max?: number }, loadState?: string }} entry
 */
export function pluginWeight(entry) {
  if (!entry || entry.loadState === 'loaded') {
    return null;
  }
  const bytes = entry.approxBytes?.estimate ?? entry.approxBytes?.max;
  return typeof bytes === 'number' && bytes >= 1024 ? bytes : null;
}

/**
 * The file extension a `showSaveFilePicker` `accept` entry can carry.
 * Shapefile's extension is `shp.zip`, and the picker rejects an extension
 * with more than one dot in it.
 * @param {string} extension
 */
export function pickerExtension(extension) {
  return `.${String(extension || 'bin').split('.').pop()}`;
}
