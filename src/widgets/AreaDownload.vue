<template>
  <div class="area-download">
    <h3>{{ $t('widgets.areaDownload.title') }}</h3>

    <b-alert v-if="refusal" variant="secondary" show class="refusal">
      {{ refusal }}
    </b-alert>

    <template v-else>
      <p class="intro">{{ $t('widgets.areaDownload.intro', { dataset: datasetTitle }) }}</p>

      <!-- 1. Pick an area ------------------------------------------------ -->
      <b-form-group :label="$t('widgets.areaDownload.area.label')" label-for="areaDownloadSearch">
        <b-form-input
          id="areaDownloadSearch"
          v-model.trim="query"
          type="search"
          autocomplete="off"
          :placeholder="$t('widgets.areaDownload.area.placeholder')"
          @update:model-value="onQuery"
        />
        <b-list-group v-if="results.length > 0" class="results">
          <b-list-group-item
            v-for="result of results"
            :key="result.featureId"
            button
            @click="selectResult(result)"
          >
            <strong>{{ result.name }}</strong>
            <small>{{ resultDetail(result) }}</small>
          </b-list-group-item>
        </b-list-group>
        <p v-if="searchNote" class="note">{{ searchNote }}</p>
      </b-form-group>

      <div class="area-alternatives">
        <label class="upload-label" for="areaDownloadUpload">
          {{ $t('widgets.areaDownload.area.upload') }}
          <input
            id="areaDownloadUpload"
            type="file"
            accept=".geojson,.json,application/geo+json"
            @change="onUpload"
          >
        </label>
        <b-button v-if="area" size="sm" variant="outline-secondary" @click="clearArea">
          {{ $t('widgets.areaDownload.area.clear') }}
        </b-button>
      </div>

      <div ref="map" class="map" role="region" :aria-label="$t('widgets.areaDownload.area.mapLabel')" />
      <p class="note">{{ $t('widgets.areaDownload.area.drawHint') }}</p>

      <b-alert v-if="areaError" variant="warning" show>{{ areaError }}</b-alert>
      <p v-if="area" class="area-summary">
        <strong>{{ area.name }}</strong>
        {{ $t('widgets.areaDownload.area.summary', { vertices: area.vertexCount.filter, bbox: formatBbox(area.bbox) }) }}
      </p>

      <!-- 2. Estimate ---------------------------------------------------- -->
      <b-button variant="primary" :disabled="busy" @click="runEstimate">
        <b-spinner v-if="estimating" small />
        {{ $t('widgets.areaDownload.estimate.button') }}
      </b-button>

      <dl v-if="estimateResult" class="estimate">
        <dt>{{ $t('widgets.areaDownload.estimate.rows') }}</dt>
        <dd>{{ formatBounded(estimateResult.rows) }}</dd>
        <dt>{{ $t('widgets.areaDownload.estimate.read') }}</dt>
        <dd>{{ formatBoundedBytes(estimateResult.readBytes) }}</dd>
        <dt>{{ $t('widgets.areaDownload.estimate.output') }}</dt>
        <dd>{{ formatBoundedBytes(estimateResult.outputBytes) }}</dd>
        <dt>{{ $t('widgets.areaDownload.estimate.parts') }}</dt>
        <dd>
          {{ $t('widgets.areaDownload.estimate.partsValue', {
            files: estimateResult.files.selected,
            filesTotal: estimateResult.files.total,
            rowGroups: estimateResult.rowGroups.selected,
            rowGroupsTotal: estimateResult.rowGroups.total,
            requests: estimateResult.requests
          }) }}
        </dd>
      </dl>
      <b-alert v-if="estimateWarnings" variant="warning" show>{{ estimateWarnings }}</b-alert>

      <!-- 3. Download ---------------------------------------------------- -->
      <template v-if="estimateResult">
        <b-button-group class="formats">
          <b-button :disabled="busy" @click="startDownload('geojson')">GeoJSON</b-button>
          <b-button :disabled="busy" @click="startDownload('geoparquet')">GeoParquet</b-button>
        </b-button-group>
        <b-button v-if="downloading" size="sm" variant="outline-secondary" @click="cancel">
          {{ $t('widgets.areaDownload.download.cancel') }}
        </b-button>
      </template>

      <b-alert v-if="ceiling" variant="warning" show>
        {{ $t('widgets.areaDownload.download.ceiling', { breaches: ceiling.breaches.join(', ') }) }}
        <b-button size="sm" variant="warning" @click="acceptCeiling">
          {{ $t('widgets.areaDownload.download.acceptCeiling') }}
        </b-button>
      </b-alert>

      <p v-if="progress" class="progress-note">{{ progress }}</p>
      <b-alert v-if="downloadError" variant="danger" show>{{ downloadError }}</b-alert>
      <p v-if="downloadUrl" class="download-ready">
        <a :href="downloadUrl" :download="downloadName">
          {{ $t('widgets.areaDownload.download.save', { filename: downloadName }) }}
        </a>
      </p>

      <!-- 4. Attribution + reproducibility ------------------------------- -->
      <p v-if="attribution" class="attribution">{{ attribution }}</p>

      <b-button size="sm" variant="link" class="code-toggle" @click="showCode = !showCode">
        {{ showCode ? $t('widgets.areaDownload.code.hide') : $t('widgets.areaDownload.code.show') }}
      </b-button>
      <div v-if="showCode && request" class="request-code">
        <div v-for="generator of codeGenerators" :key="generator.language">
          <h4>{{ $t(generator.labelKey) }}</h4>
          <CodeBox :generator="generator" :filters="request" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, markRaw } from 'vue';
import { mapState } from 'vuex';
import { estimate, memorySink, downloadRequest } from '@cnmw/download-core';
import { Geocoder } from '@cnmw/geocoder-core';
import { areaFromFile } from '@cnmw/upload-core';
import { addAreaLayer } from '@cnmw/maplibre';
import { toAreaDocument, buildArea, VERSION } from '@cnmw/spec';
import MapMixin from '../components/maps/MapMixin.js';
import BboxDrawInteraction from '../components/maps/BboxDrawInteraction.js';
import CodeBox from '../components/CodeBox.vue';
import { describeDataset } from '../utils/download/descriptor.js';
import { useAppHyparquet } from '../utils/download/hyparquet.js';
import { downloadGenerators } from '../../codeGenerators.config.js';

/** Human-readable bytes, for the estimate rows and the progress line. */
function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  const units = ['B', 'kB', 'MB', 'GB'];
  let index = 0;
  let scaled = value;
  while (scaled >= 1024 && index < units.length - 1) {
    scaled /= 1024;
    index += 1;
  }
  return `${index === 0 ? scaled : scaled.toFixed(1)} ${units[index]}`;
}

// The widget renders its own small map rather than reaching into the page's
// MapView: that instance is held in MapView's own component data and is not
// exposed on the store, injected, or emitted (see
// .github/DOWNLOAD_WIDGET_NOTES.md). MapSelect.vue does exactly the same
// thing for the search view's bbox picker, so this follows the house
// pattern instead of adding a new cross-component channel.
export default defineComponent({
  name: 'AreaDownload',
  components: {
    CodeBox
  },
  mixins: [
    MapMixin
  ],
  props: {
    // The geocoder's names index. Defaults to a locally served copy of the
    // provisional geoBoundaries index; it becomes the published
    // source.coop URL once portolan-mirrors/geoboundaries-catalog is live.
    indexUrl: {
      type: String,
      default: 'http://localhost:8000/examples/geocoder-demo/data/index.json'
    },
    // Attribute filters applied to every request, as @cnmw Predicates.
    where: {
      type: Array,
      default: () => []
    },
    // Hard row cap on a download. The ceiling is a separate, louder thing.
    limit: {
      type: Number,
      default: 100000
    }
  },
  data() {
    return {
      query: '',
      results: [],
      searchNote: '',
      area: null,
      areaError: '',
      estimateResult: null,
      estimating: false,
      downloading: false,
      progress: '',
      downloadError: '',
      downloadUrl: '',
      downloadName: '',
      ceiling: null,
      showCode: false,
      request: null,
      geocoder: null,
      areaLayer: null,
      bboxDraw: null,
      handle: null,
      codeGenerators: markRaw(downloadGenerators.map(Generator => new Generator()))
    };
  },
  computed: {
    ...mapState(['data']),
    support() {
      return describeDataset(this.data);
    },
    descriptor() {
      return this.support.supported ? this.support.descriptor : null;
    },
    datasetTitle() {
      return this.descriptor?.title || this.data?.id || '';
    },
    refusal() {
      if (this.support.supported) {
        return '';
      }
      // The widget's `condition` already hides it for anything that plainly
      // has no vector data, so reaching here means the cheap gate said yes
      // and the real §2.4 derivation said no. Saying which is more useful
      // than vanishing.
      return this.support.message
        ? this.$t('widgets.areaDownload.unsupportedReason', { reason: this.support.message })
        : this.$t('widgets.areaDownload.unsupported');
    },
    busy() {
      return this.estimating || this.downloading;
    },
    attribution() {
      const entries = this.descriptor?.attribution || [];
      const parts = entries.map(entry => [entry.text, entry.license].filter(Boolean).join(' · '));
      const index = this.geocoder?.attribution || [];
      for (const entry of index) {
        parts.push([entry.text, entry.license].filter(Boolean).join(' · '));
      }
      return parts.filter(Boolean).join(' | ');
    },
    estimateWarnings() {
      const warnings = this.estimateResult?.warnings || [];
      if (warnings.length === 0) {
        return '';
      }
      return warnings.map(warning => warning.message || warning.code).join(' ');
    }
  },
  async mounted() {
    if (!this.support.supported) {
      return;
    }
    await useAppHyparquet();
    await this.initMap();
  },
  beforeUnmount() {
    this.handle?.cancel('widget unmounted');
    this.geocoder?.close();
    if (this.bboxDraw) {
      this.bboxDraw.destroy();
      this.bboxDraw = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.revokeDownloadUrl();
  },
  methods: {
    async initMap() {
      await this.createMap(this.$refs.map, this.data, true);
      if (!this.map) {
        return;
      }
      this.attachMapLayers();
      const bbox = this.data?.getBoundingBox?.();
      if (bbox) {
        this.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 20, maxZoom: this.maxZoom });
      }
    },
    // MapMixin's hook, called after every `map.setStyle` -- including the
    // one that loads the basemap right after createMap() resolves. setStyle
    // drops every source and layer added before it, so the outline and the
    // draw rectangle have to be put back or they silently never appear.
    onBasemapChanged() {
      this.attachMapLayers();
    },
    attachMapLayers() {
      if (!this.map) {
        return;
      }
      this.areaLayer = markRaw(addAreaLayer(this.map));
      this.bboxDraw?.destroy();
      this.bboxDraw = markRaw(new BboxDrawInteraction(this.map, extent => this.areaFromExtent(extent)));
      if (this.area) {
        this.areaLayer.setArea(this.area);
        if (this.area.provenance?.source === 'draw') {
          this.bboxDraw.setExtent(this.area.bbox);
        }
      }
    },
    ensureGeocoder() {
      if (!this.geocoder) {
        const geocoder = new Geocoder({ indexUrl: this.indexUrl, limit: 8 });
        // `select({ resolution: 'both' })` hands back the display-simplified
        // outline immediately and finishes the full-resolution filter
        // geometry in the background. Without this the download would filter
        // on the simplified outline, which is deliberately drawn *outward*
        // of the true boundary -- so it would over-select at the edges.
        geocoder.on('area:upgraded', ({ area }) => {
          if (this.area && area.id === this.area.id) {
            this.setArea(area, { refit: false });
          }
        });
        geocoder.on('warning', warning => {
          this.searchNote = warning?.message || warning?.code || '';
        });
        this.geocoder = markRaw(geocoder);
      }
      return this.geocoder;
    },
    async onQuery(value) {
      this.searchNote = '';
      if (!value || value.length < 2) {
        this.results = [];
        return;
      }
      try {
        const geocoder = this.ensureGeocoder();
        this.results = await geocoder.search(value, { viewport: this.viewportBbox() });
        if (this.results.length === 0) {
          this.searchNote = this.$t('widgets.areaDownload.area.noResults');
        }
      } catch (error) {
        this.results = [];
        this.searchNote = this.formatError(error);
      }
    },
    viewportBbox() {
      if (!this.map) {
        return undefined;
      }
      const bounds = this.map.getBounds();
      return [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];
    },
    async selectResult(result) {
      this.areaError = '';
      this.results = [];
      this.query = result.name;
      try {
        const area = await this.ensureGeocoder().select(result, { resolution: 'both' });
        this.setArea(area);
      } catch (error) {
        this.areaError = this.formatError(error);
      }
    },
    areaFromExtent(extent) {
      if (!extent) {
        this.clearArea();
        return;
      }
      const [west, south, east, north] = extent;
      const ring = [[west, south], [east, south], [east, north], [west, north], [west, south]];
      this.setArea(buildArea({
        name: this.$t('widgets.areaDownload.area.drawnName'),
        geometry: { type: 'Polygon', coordinates: [ring] },
        source: 'draw',
        features: []
      }));
    },
    async onUpload(event) {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      this.areaError = '';
      try {
        const { area, warnings } = await areaFromFile(file);
        this.setArea(area);
        if (warnings.length > 0) {
          this.areaError = this.$t('widgets.areaDownload.area.uploadWarnings', {
            warnings: warnings.map(warning => warning.code).join(', ')
          });
        }
      } catch (error) {
        this.areaError = this.formatError(error);
      }
    },
    setArea(area, options = {}) {
      this.area = markRaw(area);
      this.resetDownload();
      this.estimateResult = null;
      this.areaLayer?.setArea(area);
      if (options.refit !== false) {
        this.areaLayer?.fit({ padding: 20, maxZoom: this.maxZoom });
        if (this.bboxDraw && area.provenance?.source !== 'draw') {
          this.bboxDraw.setExtent(null);
        }
      }
    },
    clearArea() {
      this.area = null;
      this.areaError = '';
      this.estimateResult = null;
      this.areaLayer?.setArea(null);
      this.bboxDraw?.setExtent(null);
      this.resetDownload();
    },
    buildFilter() {
      return {
        spec: 'cnmw-filter/1.0',
        spatial: { mode: this.area ? 'intersects' : 'bbox' },
        where: this.where,
        limit: this.limit
      };
    },
    async runEstimate() {
      this.estimating = true;
      this.estimateResult = null;
      this.downloadError = '';
      this.resetDownload();
      try {
        this.estimateResult = await estimate(this.descriptor, this.area, this.buildFilter());
        this.updateRequest('geoparquet');
      } catch (error) {
        this.downloadError = this.formatError(error);
      } finally {
        this.estimating = false;
      }
    },
    updateRequest(format) {
      const filter = this.buildFilter();
      this.request = markRaw({
        spec: 'cnmw-request/1.0',
        dataset: this.descriptor,
        filter: this.area ? { ...filter, area: toAreaDocument(this.area) } : filter,
        output: this.outputFor(format),
        generator: {
          name: 'portolan-browser/AreaDownload',
          version: VERSION,
          at: new Date().toISOString()
        }
      });
    },
    outputFor(format) {
      const base = (this.descriptor?.id || 'download').replace(/[^\w.-]+/g, '-');
      return {
        spec: 'cnmw-output/1.0',
        format,
        filename: `${base}.${format === 'geojson' ? 'geojson' : 'parquet'}`
      };
    },
    async startDownload(format) {
      this.resetDownload();
      this.downloading = true;
      this.progress = this.$t('widgets.areaDownload.download.planning');
      this.updateRequest(format);
      try {
        // GeoParquet output needs hyparquet-writer, which is loaded on
        // demand so a GeoJSON download never pays for it.
        await useAppHyparquet({ writer: format === 'geoparquet' });
        const sink = memorySink();
        // Routed through downloadRequest() so the thing that runs is the
        // same serialized request the code panel shows. If they ever
        // diverge, the snippet is a lie.
        const handle = downloadRequest(this.request, this.area, { sink });
        this.handle = markRaw(handle);
        handle.on('progress', event => this.onProgress(event));
        handle.on('ceiling', event => {
          this.ceiling = markRaw(event.estimate.ceiling);
        });
        const result = await handle.result;
        this.ceiling = null;
        this.progress = this.$t('widgets.areaDownload.download.done', {
          rows: result.rows,
          bytes: formatBytes(result.bytes),
          seconds: (result.elapsedMs / 1000).toFixed(1)
        });
        this.offerFile(sink);
      } catch (error) {
        this.progress = '';
        this.downloadError = this.formatError(error);
      } finally {
        this.downloading = false;
        this.handle = null;
      }
    },
    onProgress(event) {
      if (event.phase === 'reading' && event.rowGroupsTotal > 0) {
        this.progress = this.$t('widgets.areaDownload.download.reading', {
          done: event.rowGroupsDone,
          total: event.rowGroupsTotal,
          rows: event.rowsMatched,
          bytes: formatBytes(event.bytesRead)
        });
      } else {
        this.progress = this.$t('widgets.areaDownload.download.phase', { phase: event.phase });
      }
    },
    offerFile(sink) {
      // A memory sink plus an object URL, rather than autoSink()'s File
      // System Access picker: it keeps the flow drivable headlessly and
      // avoids a native dialog mid-page.
      const type = this.request.output.format === 'geojson'
        ? 'application/geo+json'
        : 'application/vnd.apache.parquet';
      const blob = sink.blob ?? new Blob(sink.chunks, { type });
      this.revokeDownloadUrl();
      this.downloadUrl = URL.createObjectURL(blob);
      this.downloadName = this.request.output.filename;
    },
    acceptCeiling() {
      this.handle?.acceptCeiling();
      this.ceiling = null;
    },
    cancel() {
      this.handle?.cancel('cancelled by user');
    },
    resetDownload() {
      this.ceiling = null;
      this.progress = '';
      this.downloadError = '';
      this.revokeDownloadUrl();
      this.downloadName = '';
    },
    revokeDownloadUrl() {
      if (this.downloadUrl) {
        URL.revokeObjectURL(this.downloadUrl);
        this.downloadUrl = '';
      }
    },
    resultDetail(result) {
      return [result.parentName, result.country, `ADM${result.level}`].filter(Boolean).join(' · ');
    },
    formatBbox(bbox) {
      return bbox.map(value => value.toFixed(3)).join(', ');
    },
    formatBounded(bounded) {
      if (!bounded) {
        return '';
      }
      const estimated = Math.round(bounded.estimate).toLocaleString();
      if (bounded.exact) {
        return estimated;
      }
      return this.$t('widgets.areaDownload.estimate.range', {
        estimate: estimated,
        min: Math.round(bounded.min).toLocaleString(),
        max: Math.round(bounded.max).toLocaleString()
      });
    },
    formatBoundedBytes(bounded) {
      if (!bounded) {
        return '';
      }
      if (bounded.exact) {
        return formatBytes(bounded.estimate);
      }
      return this.$t('widgets.areaDownload.estimate.range', {
        estimate: formatBytes(bounded.estimate),
        min: formatBytes(bounded.min),
        max: formatBytes(bounded.max)
      });
    },
    formatError(error) {
      const code = error?.code;
      const message = error?.message || String(error);
      return code ? `${code}: ${message}` : message;
    }
  }
});

</script>

<style lang="scss" scoped>
@import "../theme/variables.scss";

.area-download {
  margin-bottom: $block-gap;

  .intro,
  .note {
    font-size: 0.875rem;
    color: $secondary;
  }

  .map {
    height: 240px;
    margin-bottom: 0.5rem;
  }

  .results {
    margin-top: 0.25rem;
    max-height: 14rem;
    overflow-y: auto;

    small {
      display: block;
      color: $secondary;
    }
  }

  .area-alternatives {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .upload-label {
    font-size: 0.875rem;
    margin: 0;
  }

  .estimate {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.125rem 0.75rem;
    margin: 0.5rem 0;
    font-size: 0.875rem;

    dt {
      font-weight: 600;
    }

    dd {
      margin: 0;
    }
  }

  .formats {
    margin-right: 0.5rem;
  }

  .progress-note,
  .area-summary,
  .attribution {
    font-size: 0.875rem;
    margin: 0.5rem 0;
  }

  .attribution {
    color: $secondary;
  }

  .request-code {
    margin-top: 0.5rem;
  }
}
</style>
