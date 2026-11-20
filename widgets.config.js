import { defineAsyncComponent } from 'vue';
import { mayHaveDownloadableVector } from './src/utils/download/support.js';

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
    // The published geoBoundaries names index on Source Cooperative
    // (portolan-mirrors/geoboundaries-catalog): 52,398 names across
    // ADM0-2, with geometry_ref fast-path row pointers.
    indexUrl: 'https://data.source.coop/portolan-mirrors/geoboundaries-catalog/names/index.json'
  }
};

export default {
  'map-overlay': [areaDownload]
};
