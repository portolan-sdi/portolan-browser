import { defineAsyncComponent } from 'vue';
import { mayHaveDownloadableVector } from './src/utils/download/support.js';

// The "Download data" panel. It appears on any collection or item that
// plausibly holds vector GeoParquet, and nowhere else: a raster, zarr or
// PMTiles-only collection simply has no panel, which is how the widget
// design wants "unsupported" to read.
//
// `condition` runs on every render of the hook and must stay cheap, so it
// uses a small app-local predicate rather than the authoritative
// `@cnmw/download-core` derivation -- see src/utils/download/support.js for
// why (this file is in the main bundle; the widget is not).
const areaDownload = {
  id: 'AreaDownload',
  component: defineAsyncComponent(() => import('./src/widgets/AreaDownload.vue')),
  condition: ({ data }) => mayHaveDownloadableVector(data),
  props: {
    // Provisional geoBoundaries names index, served locally for the branch
    // demo (see .github/DOWNLOAD_WIDGET_NOTES.md). This becomes the
    // portolan-mirrors/geoboundaries-catalog names index on source.coop
    // once that catalog is published.
    indexUrl: 'http://localhost:8000/examples/geocoder-demo/data/index.json'
  }
};

export default {
  'view-catalog-meta-end': [areaDownload],
  'view-item-secondary-end': [areaDownload]
};
