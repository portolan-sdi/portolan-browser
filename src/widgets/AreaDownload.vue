<template>
  <!-- One lane down the right of the map: the area picker at the top of it,
       the download card at the bottom. The rest of the map is spoken for --
       the notice top left, MapLibre's buttons down the right edge, the style
       picker and layer control bottom left, the attribution bottom right. -->
  <div class="area-download" :class="{ 'drop-active': dropActive }">
    <!-- The cheap condition in widgets.config.js already keeps the widget
         off anything that plainly has no vector data, so reaching here with
         a refusal means the real §2.4 derivation disagreed with it. Saying
         which, on the map, beats vanishing. -->
    <p v-if="refusal" class="area-download-refusal">{{ refusal }}</p>

    <template v-else>
      <!-- 1. The on-map control cluster ------------------------------------
           Open, it is the whole area picker: a real MapLibre geocoder
           control, a draw button and an upload button, over the data they
           select from. Collapsed, it is one pill that still says the data
           can be downloaded -- the affordance that used to be buried in the
           metadata column. -->
      <div
        class="ad-tools"
        :class="{ open, attention }"
        role="group"
        :aria-label="$t('widgets.areaDownload.area.label')"
      >
        <button
          v-show="!open"
          type="button"
          class="ad-pill"
          :title="$t('widgets.areaDownload.intro', { dataset: datasetTitle })"
          @click="openTools"
        >
          <BIconDownload aria-hidden="true" />
          <span>{{ $t('widgets.areaDownload.open') }}</span>
        </button>

        <!-- v-show, not v-if: the GeocoderControl's element is appended to
             `ad-search` imperatively, so collapsing the cluster must hide
             that subtree rather than destroy it. -->
        <div v-show="open" class="ad-tools-panel">
          <div class="ad-tools-head">
            <BIconDownload aria-hidden="true" />
            <strong>{{ $t('widgets.areaDownload.title') }}</strong>
            <button
              type="button"
              class="ad-icon-button ad-collapse"
              :title="$t('widgets.areaDownload.close')"
              :aria-label="$t('widgets.areaDownload.close')"
              @click="open = false"
            >
              &times;
            </button>
          </div>
          <div class="ad-tools-row">
            <!-- @cnmw/maplibre's GeocoderControl lands here; see mountSearch(). -->
            <div ref="search" class="ad-search" />
            <button
              type="button"
              class="ad-button"
              :class="{ active: drawArmed }"
              :aria-pressed="String(drawArmed)"
              @click="toggleDraw"
            >
              {{ drawArmed ? $t('widgets.areaDownload.area.drawArmed') : $t('widgets.areaDownload.area.draw') }}
            </button>
            <button
              type="button"
              class="ad-button"
              :title="$t('widgets.areaDownload.area.uploadTitle')"
              @click="$refs.upload.click()"
            >
              {{ $t('widgets.areaDownload.area.upload') }}
            </button>
            <input
              ref="upload"
              class="ad-file"
              type="file"
              accept=".geojson,.json,application/geo+json"
              @change="onUpload"
            >
          </div>
          <p class="ad-note">{{ dropActive ? $t('widgets.areaDownload.area.dropActive') : $t('widgets.areaDownload.area.drawHint') }}</p>
          <p v-if="areaError" class="ad-note ad-error">{{ areaError }}</p>
        </div>
      </div>

      <!-- 2. The download card --------------------------------------------
           Anchored on the map, not in the sidebar: the area it describes is
           drawn right beside it, over the data it comes from. -->
      <div v-if="area" class="ad-card" :class="{ wide: showCode }">
        <div class="ad-card-head">
          <div>
            <strong class="ad-dataset">{{ datasetTitle }}</strong>
            <span class="ad-area-name">{{ area.name }}</span>
          </div>
          <button
            type="button"
            class="ad-icon-button"
            :title="$t('widgets.areaDownload.area.clear')"
            :aria-label="$t('widgets.areaDownload.area.clear')"
            @click="clearArea"
          >
            &times;
          </button>
        </div>

        <p class="ad-area-summary">
          {{ $t('widgets.areaDownload.area.summary', { vertices: area.vertexCount.filter, bbox: formatBbox(area.bbox) }) }}
        </p>

        <!-- Rows and output size first, then the action, then the rest. The
             card is at most a few hundred pixels tall on a hero map, so the
             two numbers a user decides on and the buttons they press have to
             be above the fold; how many row groups it took is interesting,
             not decisive, and can be scrolled to. -->
        <p v-if="estimating" class="ad-status">{{ $t('widgets.areaDownload.estimate.running') }}</p>
        <dl v-else-if="estimateResult" class="estimate">
          <dt>{{ $t('widgets.areaDownload.estimate.rows') }}</dt>
          <dd>{{ formatBounded(estimateResult.rows) }}</dd>
          <dt>{{ $t('widgets.areaDownload.estimate.output') }}</dt>
          <dd>{{ formatBoundedBytes(estimateResult.outputBytes) }}</dd>
        </dl>

        <p v-if="estimateWarnings" class="ad-warning">{{ estimateWarnings }}</p>
        <p v-if="estimateError" class="ad-error">{{ estimateError }}</p>
        <button
          v-if="!estimateResult && !estimating"
          type="button"
          class="ad-button"
          @click="runEstimate"
        >
          {{ $t('widgets.areaDownload.estimate.button') }}
        </button>

        <div v-if="ceiling" class="ad-ceiling">
          <p>{{ $t('widgets.areaDownload.download.ceiling', { breaches: ceiling.breaches.join(', ') }) }}</p>
          <button type="button" class="ad-button ad-button-warning" @click="acceptCeiling">
            {{ $t('widgets.areaDownload.download.acceptCeiling') }}
          </button>
        </div>

        <div v-if="estimateResult && !downloading" class="ad-formats">
          <span class="ad-formats-label">{{ $t('widgets.areaDownload.download.format') }}</span>
          <button type="button" class="ad-button ad-button-primary" @click="startDownload('geojson')">GeoJSON</button>
          <button type="button" class="ad-button ad-button-primary" @click="startDownload('geoparquet')">GeoParquet</button>
        </div>

        <div v-if="downloading" class="ad-progress-row">
          <div class="ad-progress" role="progressbar" :aria-valuenow="progressPercent" aria-valuemin="0" aria-valuemax="100">
            <div class="ad-progress-bar" :class="{ indeterminate: progressPercent === null }" :style="progressStyle" />
          </div>
          <button type="button" class="ad-button" @click="cancel">
            {{ $t('widgets.areaDownload.download.cancel') }}
          </button>
        </div>

        <p v-if="progress" class="ad-status">{{ progress }}</p>
        <p v-if="downloadError" class="ad-error">{{ downloadError }}</p>
        <p v-if="estimateResult" class="ad-scanned">
          {{ $t('widgets.areaDownload.estimate.read') }}: {{ formatBoundedBytes(estimateResult.readBytes) }} —
          {{ $t('widgets.areaDownload.estimate.partsValue', {
            files: estimateResult.files.selected,
            filesTotal: estimateResult.files.total,
            rowGroups: estimateResult.rowGroups.selected,
            rowGroupsTotal: estimateResult.rowGroups.total,
            requests: estimateResult.requests
          }) }}
        </p>
        <p v-if="attribution" class="ad-attribution" :title="attribution">{{ attribution }}</p>

        <button v-if="request" type="button" class="ad-link-button code-toggle" @click="showCode = !showCode">
          {{ showCode ? $t('widgets.areaDownload.code.hide') : $t('widgets.areaDownload.code.show') }}
        </button>
        <div v-if="showCode && request" class="request-code">
          <div v-for="generator of codeGenerators" :key="generator.language">
            <h4>{{ $t(generator.labelKey) }}</h4>
            <CodeBox :generator="generator" :filters="request" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, markRaw } from 'vue';
import { mapState } from 'vuex';
import { estimate, blobSink, fileSystemSink, downloadRequest } from '@cnmw/download-core';
import { Geocoder } from '@cnmw/geocoder-core';
import { areaFromFile, attachDropTarget } from '@cnmw/upload-core';
import { addAreaLayer, GeocoderControl } from '@cnmw/maplibre';
import { toAreaDocument, buildArea, VERSION } from '@cnmw/spec';
import BboxDrawInteraction from '../components/maps/BboxDrawInteraction.js';
import { MAP_HOST } from '../components/maps/mapHost.js';
import CodeBox from '../components/CodeBox.vue';
import BIconDownload from '~icons/bi/download';
import { describeDataset } from '../utils/download/descriptor.js';
import { useAppHyparquet } from '../utils/download/hyparquet.js';
import { downloadGenerators } from '../../codeGenerators.config.js';

// Warning codes that reach the user as numbers only, so the widget has to
// supply the sentence. Anything not listed carries its own `message`.
const WARNING_KEYS = {
  'estimate-wide': 'widgets.areaDownload.warnings.estimateWide',
  'antimeridian-split': 'widgets.areaDownload.warnings.antimeridianSplit',
  'share-alike': 'widgets.areaDownload.warnings.shareAlike'
};

const MEDIA_TYPES = {
  geojson: 'application/geo+json',
  geoparquet: 'application/vnd.apache.parquet'
};

// How close the map zooms to a selected area. Matches MapMixin's cap, which
// this widget no longer mixes in -- it draws on the page's map instead of
// making one.
const MAX_ZOOM = 16;

// How long the pill keeps drawing the eye to itself. Two slow pulses: enough
// to be noticed over the map, short enough not to become a nag.
const ATTENTION_MS = 2600;

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

// An on-map widget, not a panel. It renders inside the `map-overlay` hook
// (so its DOM is a child of the map container) and draws on the page's real
// map, which it gets from the injected map host -- see
// src/components/maps/mapHost.js and docs/widgets.md.
//
// That is why the area picker here is @cnmw/maplibre's GeocoderControl and
// not a bootstrap-vue-next form: the adapter's controls were written to be
// mounted on a map, and now there is a map to mount them on. The user sees
// the area they picked outlined over the actual data, which is the whole
// point of putting the tool on the map.
export default defineComponent({
  name: 'AreaDownload',
  components: {
    BIconDownload,
    CodeBox
  },
  inject: {
    mapHost: { from: MAP_HOST, default: null }
  },
  props: {
    // The geocoder's names index, as a `cnmw-index/1.0` manifest URL.
    indexUrl: {
      type: String,
      default: 'https://data.source.coop/portolan-mirrors/geoboundaries-catalog/names/index.json'
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
    },
    // How the finished file reaches the disk. `'picker'` always asks the
    // File System Access API for a destination, `'anchor'` always writes a
    // Blob and clicks it, `'auto'` prefers the picker where it exists. Either
    // way the save starts without the user clicking a rendered link.
    directSave: {
      type: String,
      default: 'auto',
      validator: value => ['auto', 'picker', 'anchor'].includes(value)
    }
  },
  data() {
    return {
      open: true,
      attention: false,
      area: null,
      areaError: '',
      dropActive: false,
      drawArmed: false,
      estimateResult: null,
      estimating: false,
      estimateError: '',
      downloading: false,
      progress: '',
      progressPercent: null,
      downloadError: '',
      ceiling: null,
      showCode: false,
      request: null,
      geocoder: null,
      indexAttribution: [],
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
      return this.support.message
        ? this.$t('widgets.areaDownload.unsupportedReason', { reason: this.support.message })
        : this.$t('widgets.areaDownload.unsupported');
    },
    attribution() {
      const entries = this.descriptor?.attribution || [];
      const parts = entries.map(entry => [entry.text, entry.license].filter(Boolean).join(' · '));
      for (const entry of this.indexAttribution) {
        parts.push([entry.text, entry.license].filter(Boolean).join(' · '));
      }
      return parts.filter(Boolean).join(' | ');
    },
    progressStyle() {
      return this.progressPercent === null ? {} : { width: `${this.progressPercent}%` };
    },
    estimateWarnings() {
      const warnings = this.estimateResult?.warnings || [];
      if (warnings.length === 0) {
        return '';
      }
      // Most warnings carry their own sentence. Three carry only numbers --
      // and one of those, share-alike, is a licence obligation the user has
      // to see in words, not as a code.
      return warnings.map(warning => {
        const key = WARNING_KEYS[warning.code];
        if (key) {
          return this.$t(key, {
            ratio: Math.round(warning.ratio || 0),
            boxes: warning.boxes,
            licenses: (warning.attribution || []).map(entry => entry.license).join(', ')
          });
        }
        return warning.message || warning.code;
      }).join(' ');
    },
    // Whether the finished bytes go straight to a file the user named.
    // Under automation the native dialog is skipped: a WebDriver session
    // cannot dismiss a modal the page did not draw, so a test would hang on
    // it instead of getting a file. Nothing else about the flow differs --
    // the anchor path is still a save the user never has to click.
    usePicker() {
      if (this.directSave === 'anchor' || typeof window.showSaveFilePicker !== 'function') {
        return false;
      }
      return this.directSave === 'picker' || !navigator.webdriver;
    }
  },
  created() {
    this.map = null;
    this.areaLayer = null;
    this.bboxDraw = null;
    this.searchControl = null;
    this.handle = null;
    this.detachDrop = null;
    this.unsubscribeMap = null;
    this.unsubscribeStyle = null;
    this.dropTimer = null;
    this.attentionTimer = null;
    this.blobUrls = [];
    this._estimateToken = 0;
  },
  async mounted() {
    if (!this.support.supported || !this.mapHost) {
      if (!this.mapHost) {
        console.warn('AreaDownload needs the map-overlay hook: no map host was provided.');
      }
      return;
    }
    await useAppHyparquet();
    this.unsubscribeMap = this.mapHost.onMap(map => this.bindMap(map));
    // Re-stacking the layer list either drops what this widget added (a
    // basemap `setStyle`) or buries it (the collection's own GL style, whose
    // data layers go in below the basemap's labels and therefore above
    // anything added before them). The host says when it happened; without
    // this the outline either never appears or appears under the data.
    this.unsubscribeStyle = this.mapHost.onStyleReload(() => this.attachMapLayers());
    this.flashAttention();
  },
  beforeUnmount() {
    this.handle?.cancel('widget unmounted');
    this.unsubscribeMap?.();
    this.unsubscribeStyle?.();
    this.geocoder?.close();
    this.releaseMap();
    clearTimeout(this.dropTimer);
    clearTimeout(this.attentionTimer);
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  },
  methods: {
    // --- the map -------------------------------------------------------
    bindMap(map) {
      this.releaseMap();
      this.map = map ? markRaw(map) : null;
      if (!this.map) {
        return;
      }
      this.attachMapLayers();
      this.mountSearch();
      // Dropping a file on the map is the same gesture as dropping it on an
      // upload box, and the map is what the user is looking at.
      this.detachDrop = attachDropTarget(
        this.map.getContainer(),
        ({ area, warnings }) => this.onUploaded(area, warnings),
        { onError: error => { this.areaError = this.formatError(error); } }
      );
      const container = this.map.getContainer();
      container.addEventListener('dragover', this.onDragOver);
      container.addEventListener('drop', this.onDropEnd);
    },
    releaseMap() {
      if (this.detachDrop) {
        this.detachDrop();
        this.detachDrop = null;
      }
      if (this.map) {
        const container = this.map.getContainer();
        container.removeEventListener('dragover', this.onDragOver);
        container.removeEventListener('drop', this.onDropEnd);
      }
      if (this.searchControl) {
        this.searchControl.onRemove();
        this.searchControl = null;
      }
      if (this.$refs.search) {
        this.$refs.search.replaceChildren();
      }
      this.bboxDraw?.destroy();
      this.bboxDraw = null;
      this.drawArmed = false;
      this.areaLayer = null;
      this.map = null;
    },
    // Idempotent: called when the map arrives and again on every re-stacking
    // of the layer list, which either dropped what this added or pushed data
    // layers above it. Removing first is what makes the re-add a *raise*:
    // `addAreaLayer` leaves existing layers alone, so without the remove the
    // outline would stay wherever it already was in the stack.
    attachMapLayers() {
      if (!this.map) {
        return;
      }
      this.areaLayer?.remove();
      this.areaLayer = markRaw(addAreaLayer(this.map, {
        id: 'area-download',
        // Amber, not the app's blue: the outline has to read over whatever
        // the collection's own style paints underneath it, and Portolan's
        // sequential ramps are blues and purples.
        lineColor: '#e5a100',
        lineWidth: 3,
        fillColor: '#e5a100',
        // Barely there on purpose: the area is a frame around the data, and
        // the user is here to look at the data inside it.
        fillOpacity: 0.07
      }));
      const wasArmed = this.drawArmed;
      this.bboxDraw?.destroy();
      this.bboxDraw = markRaw(new BboxDrawInteraction(this.map, extent => this.areaFromExtent(extent)));
      this.drawArmed = this.bboxDraw.setArmed(wasArmed);
      // The draw rectangle is only the rubber band of a drag in progress.
      // Once there is an area, the amber outline *is* that box, and drawing
      // a dashed blue one over it says nothing extra.
      if (this.area) {
        this.areaLayer.setArea(this.area);
      }
    },
    // @cnmw/maplibre's GeocoderControl, built as a MapLibre IControl: it
    // takes the real map, reads the real viewport to bias ranking, and
    // brings its own combobox a11y. Its element goes into this widget's
    // cluster rather than a MapLibre corner container (which is all
    // `map.addControl` would do with it) so that it sits beside the draw and
    // upload buttons as one tool, instead of stacking above them.
    mountSearch() {
      if (!this.$refs.search || this.searchControl) {
        return;
      }
      const control = new GeocoderControl({
        geocoder: this.ensureGeocoder(),
        placeholder: this.$t('widgets.areaDownload.area.placeholder'),
        limit: 8,
        // This widget owns the single outline layer and the single fit, for
        // all three ways of picking an area; the control must not add a
        // second one of each.
        outline: false,
        fitBounds: false,
        // The card carries attribution, where it sits beside the dataset's.
        showAttribution: false
      });
      this.$refs.search.appendChild(control.onAdd(this.map));
      control.on('select', ({ area }) => this.setArea(area));
      control.on('upgrade', ({ area }) => this.upgradeArea(area));
      control.on('error', error => { this.areaError = this.formatError(error); });
      this.searchControl = markRaw(control);
    },
    ensureGeocoder() {
      if (!this.geocoder) {
        const geocoder = new Geocoder({
          indexUrl: this.indexUrl,
          limit: 8,
          // `'both'` hands back the display-simplified outline at once and
          // finishes the full-resolution filter geometry in the background.
          // Without it the download would filter on the simplified outline,
          // which is drawn deliberately *outward* of the true boundary -- so
          // it would over-select at the edges. Set on the Geocoder rather
          // than per select() call, because GeocoderControl owns the call.
          geometry: { resolution: 'both' }
        });
        // The index carries its own licence (the geoBoundaries index is
        // CC-BY) and only knows it once loaded. Copy it into reactive state:
        // reading `geocoder.attribution` off the markRaw'd object would
        // leave the credit off the page until some unrelated render happened
        // to pick it up.
        geocoder.on('state', ({ state }) => {
          if (state === 'ready') {
            this.indexAttribution = [...geocoder.attribution];
          }
        });
        this.geocoder = markRaw(geocoder);
      }
      return this.geocoder;
    },

    // --- the cluster ---------------------------------------------------
    openTools() {
      this.open = true;
      this.attention = false;
      this.$nextTick(() => this.searchControl?.focus());
    },
    // One pass of a slow glow on the pill when a downloadable collection
    // loads, so the affordance is noticed once without becoming furniture.
    // Honoured as a no-op under prefers-reduced-motion by the stylesheet.
    flashAttention() {
      this.attention = true;
      this.attentionTimer = setTimeout(() => { this.attention = false; }, ATTENTION_MS);
    },
    toggleDraw() {
      if (!this.bboxDraw) {
        return;
      }
      this.drawArmed = this.bboxDraw.setArmed(!this.drawArmed);
    },
    onDragOver() {
      this.dropActive = true;
      clearTimeout(this.dropTimer);
      // `dragleave` fires crossing every child of the map, so the hint would
      // flicker. A timer that the continuous `dragover` keeps resetting is
      // steady, and it also clears itself if the pointer leaves the window.
      this.dropTimer = setTimeout(() => { this.dropActive = false; }, 150);
    },
    onDropEnd() {
      clearTimeout(this.dropTimer);
      this.dropActive = false;
      this.open = true;
    },
    areaFromExtent(extent) {
      this.drawArmed = Boolean(this.bboxDraw?.armed);
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
      const input = event.target;
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      this.areaError = '';
      try {
        const { area, warnings } = await areaFromFile(file);
        this.onUploaded(area, warnings);
      } catch (error) {
        this.areaError = this.formatError(error);
      } finally {
        // So picking the same file twice in a row still fires `change`.
        input.value = '';
      }
    },
    onUploaded(area, warnings = []) {
      this.setArea(area);
      this.areaError = warnings.length > 0
        ? this.$t('widgets.areaDownload.area.uploadWarnings', {
          warnings: warnings.map(warning => warning.code).join(', ')
        })
        : '';
    },

    // --- the area ------------------------------------------------------
    // A new area: everything computed from the old one is now wrong, and the
    // estimate for the new one starts at once. Metadata-only, so it costs a
    // few range requests and no row data -- cheap enough that making the
    // user press a button for it was the wrong trade.
    setArea(area) {
      // Re-add first, which raises the outline above whatever has been
      // stacked over it since. MapView announces the re-stackings it knows
      // about, but StacMapLayer also re-binds the active style on its own
      // when assets finish loading, and that is not a MapView event.
      this.attachMapLayers();
      this.applyArea(area);
      this.resetDownload();
      this.areaError = '';
      this.areaLayer?.fit({ padding: 60, maxZoom: MAX_ZOOM });
      // The rubber band has done its job; the outline takes over.
      this.bboxDraw?.setExtent(null);
      this.runEstimate();
    },
    // The same area at full resolution, arriving from the geocoder's
    // background upgrade. It must not clear the estimate: the upgrade lands
    // whenever the boundary file finishes loading, which can be after the
    // estimate has already been shown, and taking a result away because
    // something finished in the background is indefensible. The numbers stay
    // valid: row-group selection is driven by the bbox, which the upgrade
    // does not change, and the download rebuilds its request from
    // `this.area`, so it filters on the full-resolution geometry.
    upgradeArea(area) {
      this.applyArea(area);
    },
    applyArea(area) {
      this.area = markRaw(area);
      this.areaLayer?.setArea(area);
    },
    clearArea() {
      this._estimateToken += 1;
      this.area = null;
      this.areaError = '';
      this.estimateResult = null;
      this.estimateError = '';
      this.estimating = false;
      this.showCode = false;
      this.request = null;
      this.areaLayer?.setArea(null);
      this.bboxDraw?.setExtent(null);
      this.searchControl?.clear();
      this.resetDownload();
    },

    // --- estimate ------------------------------------------------------
    buildFilter() {
      return {
        spec: 'cnmw-filter/1.0',
        spatial: { mode: this.area ? 'intersects' : 'bbox' },
        where: this.where,
        limit: this.limit
      };
    },
    async runEstimate() {
      if (!this.area || !this.descriptor) {
        return;
      }
      // Areas can be replaced faster than an estimate finishes (type, pick,
      // pick again). Only the newest one may write to the card.
      const token = ++this._estimateToken;
      this.estimating = true;
      this.estimateResult = null;
      this.estimateError = '';
      try {
        const result = await estimate(this.descriptor, this.area, this.buildFilter());
        if (token !== this._estimateToken) {
          return;
        }
        this.estimateResult = markRaw(result);
        this.updateRequest('geoparquet');
      } catch (error) {
        if (token !== this._estimateToken) {
          return;
        }
        this.estimateError = this.formatError(error);
      } finally {
        if (token === this._estimateToken) {
          this.estimating = false;
        }
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

    // --- download ------------------------------------------------------
    async startDownload(format) {
      if (this.downloading) {
        return;
      }
      const output = this.outputFor(format);

      // The save dialog has to open inside this click's own activation
      // window. Anything awaited before it -- the hyparquet-writer import,
      // the first range request -- spends that activation and the browser
      // throws instead of asking. So: destination first, bytes second.
      let handle = null;
      if (this.usePicker) {
        try {
          handle = await window.showSaveFilePicker({
            suggestedName: output.filename,
            types: [{
              description: format === 'geojson' ? 'GeoJSON' : 'GeoParquet',
              accept: { [MEDIA_TYPES[format]]: [format === 'geojson' ? '.geojson' : '.parquet'] }
            }]
          });
        } catch (error) {
          if (error?.name === 'AbortError') {
            this.progress = this.$t('widgets.areaDownload.download.dismissed');
            return;
          }
          // Any other picker failure (a browser that has the function but
          // refuses the call) is not worth a dead end: write a Blob instead.
          handle = null;
        }
      }

      this.resetDownload();
      this.downloading = true;
      this.progressPercent = null;
      this.progress = this.$t('widgets.areaDownload.download.planning');
      this.updateRequest(format);
      try {
        // GeoParquet output needs hyparquet-writer, loaded on demand so a
        // GeoJSON download never pays for it.
        await useAppHyparquet({ writer: format === 'geoparquet' });
        const sink = handle ? await fileSystemSink({ handle }) : blobSink();
        // Routed through downloadRequest() so the thing that runs is the
        // same serialized request the code panel shows. If they ever
        // diverge, the snippet is a lie.
        const requestHandle = downloadRequest(this.request, this.area, { sink });
        this.handle = markRaw(requestHandle);
        requestHandle.on('progress', event => this.onProgress(event));
        requestHandle.on('ceiling', event => {
          this.ceiling = markRaw(event.estimate.ceiling);
        });
        const result = await requestHandle.result;
        this.ceiling = null;
        if (!handle) {
          this.saveBlob(sink.blob, result.filename);
        }
        this.progress = this.$t('widgets.areaDownload.download.done', {
          filename: result.filename,
          rows: result.rows,
          bytes: formatBytes(result.bytes),
          seconds: (result.elapsedMs / 1000).toFixed(1)
        });
      } catch (error) {
        this.progress = '';
        this.downloadError = this.formatError(error);
      } finally {
        this.downloading = false;
        this.progressPercent = null;
        this.handle = null;
      }
    },
    // The no-File-System-Access path, and still a direct download: the
    // anchor is created, clicked and thrown away in one go, so the browser
    // starts saving without the user having to find and click a link.
    saveBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      this.blobUrls.push(url);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Revoking straight away can cut the save off before the browser has
      // taken the bytes; beforeUnmount revokes whatever is left.
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.blobUrls = this.blobUrls.filter(entry => entry !== url);
      }, 60000);
    },
    onProgress(event) {
      if (event.phase === 'reading' && event.rowGroupsTotal > 0) {
        this.progressPercent = Math.min(100, Math.round((event.rowGroupsDone / event.rowGroupsTotal) * 100));
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
      this.progressPercent = null;
      this.downloadError = '';
    },

    // --- formatting ----------------------------------------------------
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

// Everything here lives over the map, inside the `map-overlay` hook's
// pointer-events-none canvas. Each piece of chrome claims pointer events
// back for itself; the gaps between them stay pannable map.
//
// One lane down the right of the map: the area picker at the top of it, the
// download card at the bottom, and never the two overlapping -- the lane is
// a flex column, so a tall card scrolls instead of growing into the picker.
// Everywhere else is spoken for. The top left
// is MapView's notice lane (`.map-textcontrol`, which says why a layer did
// not draw and must not be covered by a control, or cover one). The bottom
// left is StylePicker (`bottom: 70px`, with a legend that grows upward from
// there) and LayerControl (`bottom: 30px`). The far right edge is MapLibre's
// own navigation buttons, 29px wide at `right: 10px` -- which is what the
// 52px inset here clears -- and the compact attribution button sits in the
// very bottom right corner, which is what the card's `bottom` clears.
//
// `--sb-map-overlay-top` is the hook's contract for where the usable top of
// the map is: the hero layouts pull the map up under the site header and
// raise it, so this starts below the header rather than behind it.
// The lane itself: a column pinned to the right of the map, with the picker
// at its top and the card at its bottom. A column rather than two
// independently anchored boxes, because a tall card and an open picker would
// otherwise grow into each other.
.area-download {
  position: absolute;
  top: var(--sb-map-overlay-top, 10px);
  right: 52px;
  bottom: 36px;
  max-width: calc(100% - 62px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
  pointer-events: none;
  font-size: 0.875rem;
}

.ad-tools,
.ad-card,
.area-download-refusal {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.96);
  border-radius: $border-radius;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  max-width: 100%;
}

.ad-tools {
  flex: 0 0 auto;
  // The geocoder's input and the two buttons are one row: wrapping them
  // reads as three unrelated controls. Shrinking to the pill on collapse
  // then happens in place, because the column is right-aligned.
  width: max-content;

  &:not(.open) {
    background: none;
    box-shadow: none;
  }
}

.ad-tools-panel {
  padding: 0.5rem;
}

.ad-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 2rem;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  color: white;
  background: $primary;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);

  &:hover,
  &:focus-visible {
    background: darken($primary, 8%);
  }
}

// One pass of a slow glow when a downloadable collection loads: noticed
// once, not a nag. Nothing moves, so it cannot push the map around.
@keyframes ad-attention {
  0%, 100% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba($primary, 0.28); }
}

@keyframes ad-attention-panel {
  0%, 100% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25); }
  50% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25), 0 0 0 7px rgba($primary, 0.25); }
}

.ad-tools.attention {
  &:not(.open) .ad-pill {
    animation: ad-attention 1.3s ease-in-out 2;
  }

  &.open {
    animation: ad-attention-panel 1.3s ease-in-out 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ad-tools.attention,
  .ad-tools.attention .ad-pill {
    animation: none;
  }
}

.ad-tools-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
  color: $dark;

  strong {
    flex: 1 1 auto;
  }
}

.ad-tools-row {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.ad-search {
  // The GeocoderControl's own stylesheet sizes the input; its listbox is
  // absolutely positioned against this box.
  position: relative;
}

.ad-file {
  display: none;
}

.ad-note {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: $secondary;
  max-width: 24rem;
}

// --- the download card, at the bottom of the lane ---------------------
.ad-card {
  // `min-height: 0` is what lets the flex column scroll it rather than let
  // it grow into the picker above: the estimate and the code panel together
  // are taller than a hero map.
  flex: 0 1 auto;
  min-height: 0;
  width: 21rem;
  overflow-y: auto;
  padding: 0.6rem 0.7rem;

  &.wide {
    width: 34rem;
  }
}

.ad-card-head {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  > div {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.ad-dataset {
  display: block;
  color: $dark;
}

.ad-area-name {
  display: block;
  color: $primary;
  font-weight: 600;
}

.ad-area-summary {
  margin: 0.15rem 0 0.4rem;
  font-size: 0.75rem;
  color: $secondary;
}

.ad-icon-button {
  border: 0;
  background: none;
  line-height: 1;
  font-size: 1.1rem;
  color: $secondary;
  padding: 0 0.2rem;

  &:hover {
    color: $dark;
  }
}

.estimate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.1rem 0.6rem;
  margin: 0 0 0.4rem;
  font-size: 0.8rem;

  dt {
    font-weight: 600;
    white-space: nowrap;
  }

  dd {
    margin: 0;
  }
}

.ad-button {
  border: 1px solid $primary;
  border-radius: $border-radius;
  background: white;
  color: $primary;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  white-space: nowrap;

  &:hover,
  &.active {
    background: $primary;
    color: white;
  }
}

.ad-button-primary {
  background: $primary;
  color: white;

  &:hover {
    background: darken($primary, 8%);
  }
}

.ad-button-warning {
  border-color: $warning;
  color: darken($warning, 15%);

  &:hover {
    background: $warning;
    color: $dark;
  }
}

.ad-formats {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}

.ad-formats-label {
  font-size: 0.75rem;
  color: $secondary;
}

.ad-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.4rem 0;
}

.ad-progress {
  flex: 1 1 auto;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: $light;
  overflow: hidden;
}

.ad-progress-bar {
  height: 100%;
  width: 0;
  background: $primary;
  transition: width 0.2s linear;

  &.indeterminate {
    width: 40%;
    animation: ad-indeterminate 1.1s ease-in-out infinite;
  }
}

@keyframes ad-indeterminate {
  0% { margin-left: -40%; }
  100% { margin-left: 100%; }
}

.ad-status,
.ad-attribution,
.ad-scanned,
.ad-warning,
.ad-error {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
}

.ad-scanned {
  color: $secondary;
}

.ad-status {
  color: $secondary;
}

// A licence obligation, so it is always on screen -- but a full citation
// with a DOI is four lines of a card that is mostly numbers. Clamped, with
// the whole thing in the tooltip and written verbatim into the downloaded
// file by download-core either way.
.ad-attribution {
  color: $secondary;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-warning {
  color: darken($warning, 20%);
}

.ad-error {
  color: $danger;
}

.ad-ceiling {
  margin: 0.3rem 0;
  padding: 0.35rem 0.4rem;
  border-radius: $border-radius;
  background: rgba($warning, 0.15);
  font-size: 0.75rem;

  p {
    margin: 0 0 0.3rem;
  }
}

.ad-link-button {
  border: 0;
  background: none;
  padding: 0;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: $primary;
  text-decoration: underline;
}

.request-code {
  margin-top: 0.4rem;

  h4 {
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }
}

// --- the refusal -------------------------------------------------------
.area-download-refusal {
  margin: 0;
  padding: 0.3rem 0.6rem;
  color: $secondary;
  font-size: 0.8rem;
}

// A drop is aimed at the map, so the map is what acknowledges it.
.area-download.drop-active .ad-tools.open {
  outline: 2px dashed $primary;
  outline-offset: 2px;
}
</style>
