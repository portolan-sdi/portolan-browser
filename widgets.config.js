import { defineAsyncComponent } from 'vue';
import { mayHaveDownloadableVector } from './src/utils/download/support.js';
// The raw defaults file, NOT `src/merged-config.js`: that module also pulls
// in the `@stac-browser-external-config` virtual alias and the
// `CONFIG_FROM_ENV` global that Vite's `define` injects at build time --
// neither exists under vitest (see tests/unit/downloadCard.spec.js's own
// note on the same hazard, where it mocks codeGenerators.config.js rather
// than let it reach merged-config through i18n). Importing it here would
// make this file, and therefore any test of it, require a full Vite build.
//
// The trade-off: these three settings below are read from config.js's
// hard-coded defaults only. A deployment that overrides them via SB_CONFIG,
// an SB_ env var, or `window.STAC_BROWSER_CONFIG` -- the overrides
// `src/merged-config.js` layers on top of config.js for every other setting
// -- will NOT see that override here. Changing the default means editing
// config.js (or forking it, the same way every other build-time-only option
// such as `historyMode` is already changed).
import CONFIG from './config.js';

// The "Download data" tool. It is registered on the `map-overlay` hook, so
// it renders inside the map container and draws on the page's real map: the
// search box, the draw and upload buttons and the download card all sit over
// the data they select from.
//
// It appears on any collection or item that plausibly holds vector
// GeoParquet, and nowhere else: a raster, zarr or PMTiles-only collection
// gets nothing at all, which is how the widget design wants "unsupported" to
// read.
//
// `condition` runs on every render of the hook and must stay cheap, so it
// uses a small app-local predicate rather than the authoritative
// `@cng/download-core` derivation -- see src/utils/download/support.js for
// why (this file is in the main bundle; the widget is not).
const areaDownload = {
  id: 'AreaDownload',
  component: defineAsyncComponent(() => import('./src/widgets/AreaDownload.vue')),
  condition: ({ data }) => mayHaveDownloadableVector(data),
  props: {
    // `areaSearchIndexUrl` (config.js / config.schema.json). Defaults to
    // the published geoBoundaries names index on Source Cooperative
    // (portolan-mirrors/geoboundaries-catalog): 52,398 names across
    // ADM0-2, with geometry_ref fast-path row pointers. `null` hides the
    // widget's search box -- draw/upload/download still work; see
    // AreaDownload.vue's own `indexUrl` prop doc.
    indexUrl: CONFIG.areaSearchIndexUrl,
    // `areaDownloadFormats`. `null` (the default) offers every format
    // `src/utils/download/formats.js` has registered.
    allowedFormats: CONFIG.areaDownloadFormats
  }
};

export default {
  // `enableAreaDownload` is the master switch: false and this widget is
  // not in the array at all, so WidgetHook never registers it -- not "off
  // and present", simply absent.
  'map-overlay': CONFIG.enableAreaDownload ? [areaDownload] : []
};
