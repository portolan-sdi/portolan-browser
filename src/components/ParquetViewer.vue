<template>
  <section v-if="parquetAssets.length > 0" class="parquet-viewer mb-4">
    <div class="parquet-header" @click="open = !open">
      <span class="parquet-header-left">
        <BIconChevronDown v-if="open" />
        <BIconChevronRight v-else />
        <span class="parquet-title">{{ previewTitle }}</span>
        <b-badge variant="primary" class="parquet-file-badge">{{ selectedAssetTitle }}</b-badge>
      </span>
      <span class="parquet-header-right">
        <select
          v-if="parquetAssets.length > 1"
          v-model="selectedAssetKey"
          class="form-select form-select-sm parquet-asset-select"
          @click.stop
        >
          <option v-for="asset in parquetAssets" :key="asset.getKey()" :value="asset.getKey()">
            {{ asset.title || asset.getKey() }}
          </option>
        </select>
        <span v-if="rowInfo" class="parquet-meta-info">{{ rowInfo }}</span>
      </span>
    </div>
    <b-collapse v-model="open">
      <div v-if="loading" class="parquet-loading">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">{{ $t('loading') }}</span>
        </div>
        <span class="ms-2">{{ loadingMessage }}</span>
      </div>
      <div v-else-if="error" class="parquet-error alert alert-warning m-2">
        <p class="mb-1">{{ error }}</p>
        <button class="btn btn-sm btn-outline-primary" @click="loadData">{{ $t('parquet.retry') }}</button>
      </div>
      <template v-else-if="tableData">
        <p v-if="partitionNote" class="parquet-partition-note">{{ partitionNote }}</p>
        <ParquetTable
          :columns="tableData.columns"
          :rows="tableData.rows"
          :totalRows="displayRows"
          :loadedRows="tableData.loadedRows"
          :geometryColumn="geoInfo.geometryColumn"
          :bboxMapping="geoInfo.bboxMapping"
          @zoom-to-feature="onZoomToFeature"
          @select-row="onSelectRow"
        />
      </template>
    </b-collapse>
  </section>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { BCollapse, BBadge } from 'bootstrap-vue-next';
import BIconChevronDown from '~icons/bi/chevron-down';
import BIconChevronRight from '~icons/bi/chevron-right';
import {
  createPartitionPlaceholder,
  findParquetAssets,
  loadParquetMetadata,
  loadParquetRows,
  getBboxForRow,
  MAX_ROWS,
  GLOB_UNRESOLVED,
  isLoadableParquetAsset,
  isParquetAsset,
  isPartitionPlaceholder,
  readMirrorRowTotal,
  resolveParquetGlob,
} from '../utils/parquet';
import { readPartitionMetadata } from '../utils/partitionList';
import { isLoadableIcebergAsset } from '../utils/icebergShared';

// The role is read both ways, because a plain STAC asset object carries
// `roles` while a stac-js Asset answers hasRole.
function hasDataRole(asset) {
  if (typeof asset.hasRole === 'function') {
    return asset.hasRole('data');
  }
  return Array.isArray(asset.roles) && asset.roles.includes('data');
}

// An asset that already names the collection's data, and so settles whether
// the collection needs the synthetic entry below. A wildcard href counts: a
// v0.2 partitioned collection declares `partition:glob` beside such an asset,
// and the resolver expands it through the collection's items, which is the
// proven path for those catalogs.
function isParquetDataAsset(asset) {
  return isParquetAsset(asset) && hasDataRole(asset);
}

export default {
  name: 'ParquetViewer',
  components: {
    BCollapse,
    BBadge,
    BIconChevronDown,
    BIconChevronRight,
    ParquetTable: defineAsyncComponent(() => import('./ParquetTable.vue')),
  },
  props: {
    assets: {
      type: Array,
      required: true
    }
  },
  emits: ['zoom-to-bbox', 'highlight-bbox'],
  data() {
    return {
      open: true,
      loading: false,
      loadingMessage: '',
      error: null,
      selectedAssetKey: null,
      parquetFile: null,
      parquetMetadata: null,
      partition: null,
      // Rows over every partition, so the counts below describe the
      // collection rather than the one file the table holds.
      collectionRows: null,
      // Identifies the current load. A late mirror total from a previous
      // asset must not land on the asset the user selected since.
      loadId: 0,
      // Cancels the requests of the load that loadId identifies. Expanding a
      // `partition:glob` walks every page of a bucket listing, which a
      // selection the reader has left behind must not keep spending.
      loadAbort: null,
      tableData: null,
      geoInfo: { geometryColumn: null, bboxMapping: null, crs: null, crsDefinition: null },
    };
  },
  computed: {
    // The STAC object the assets belong to. A partitioned collection declares
    // `partition:glob` once and stac-js hands every one of its assets the same
    // context, so the first asset that knows its context answers for all.
    partitionContext() {
      return this.assets.map(asset => asset.getContext?.()).find(Boolean) || null;
    },
    // Portolan v0.3 forbids a wildcard href, so a partitioned collection may
    // publish no parquet data asset at all: `partition:glob` is the only
    // statement of where the data lives. One synthetic entry gives the reader
    // something to select, and the resolver expands the glob when they do.
    // Any parquet data asset keeps winning, so this entry appears only for a
    // collection whose data is behind the glob and nowhere else. The entry is
    // then the default selection, and the open preview lists the bucket on
    // mount: a preview with nothing to read is itself the reason to look.
    partitionPlaceholder() {
      const metadata = readPartitionMetadata(this.partitionContext);
      if (!metadata || this.assets.some(isParquetDataAsset)) {
        return null;
      }
      const count = Number(metadata.fileCount) || 0;
      return createPartitionPlaceholder(this.partitionContext, {
        title: this.$t('parquet.partitionedData', {
          count: count.toLocaleString(this.$i18n.locale)
        }, count),
      });
    },
    parquetAssets() {
      const assets = findParquetAssets(this.assets);
      // First, so the default selection previews the collection's data rather
      // than a side asset such as its item mirror.
      return this.partitionPlaceholder ? [this.partitionPlaceholder, ...assets] : assets;
    },
    // Names the format when an Iceberg preview sits beside this one, so the two
    // can be told apart. Alone, the preview keeps the plain title.
    previewTitle() {
      return this.assets.some(isLoadableIcebergAsset)
        ? this.$t('parquet.parquetDataPreview')
        : this.$t('parquet.dataPreview');
    },
    selectedAsset() {
      if (!this.selectedAssetKey) {return this.parquetAssets[0] || null;}
      return this.parquetAssets.find(a => a.getKey() === this.selectedAssetKey) || this.parquetAssets[0];
    },
    selectedAssetTitle() {
      if (!this.selectedAsset) {return '';}
      return this.selectedAsset.title || this.selectedAsset.getKey();
    },
    // Names the partition the table shows, so a row count that covers one file
    // of many does not read as the whole collection.
    partitionNote() {
      if (!this.partition) {return null;}
      return this.$t('parquet.partitionPreview', {
        name: this.partition.title,
        count: this.partition.count.toLocaleString(this.$i18n.locale)
      }, this.partition.count);
    },
    // Rows the reader can reach: the collection's count for a partitioned
    // asset, the file's own count otherwise. The table shows fewer than this
    // whenever it holds one partition of many, or the row cap cut the read.
    displayRows() {
      if (!this.tableData) {return 0;}
      return this.collectionRows || this.tableData.totalRows;
    },
    rowInfo() {
      if (!this.tableData) {return null;}
      const loaded = this.tableData.loadedRows;
      // One partition, and no count for the rest of them. Every number here
      // is this file's, so every label says "in this partition" rather than
      // let a partition's rows read as the whole collection.
      if (this.partition && !this.collectionRows) {
        if (loaded < this.tableData.totalRows) {
          return this.$t('parquet.partitionLoadedRowCount', {
            loaded: loaded.toLocaleString(this.$i18n.locale),
            total: this.tableData.totalRows.toLocaleString(this.$i18n.locale)
          }, this.tableData.totalRows);
        }
        return this.$t('parquet.partitionRowCount', {
          count: loaded.toLocaleString(this.$i18n.locale)
        }, loaded);
      }
      if (loaded < this.displayRows) {
        return this.$t('parquet.loadedRowCount', {
          loaded: loaded.toLocaleString(this.$i18n.locale),
          total: this.displayRows.toLocaleString(this.$i18n.locale)
        }, this.displayRows);
      }
      return this.$t('parquet.rowCount', {
        count: this.displayRows.toLocaleString(this.$i18n.locale)
      }, this.displayRows);
    }
  },
  watch: {
    selectedAsset: {
      immediate: true,
      handler() {
        if (this.selectedAsset) {
          this.loadData();
        }
      }
    }
  },
  beforeUnmount() {
    // The reader has navigated away: a bucket listing still walking its pages
    // has nothing left to answer.
    this.loadAbort?.abort();
  },
  methods: {
    async loadData() {
      if (!this.selectedAsset) {return;}

      const loadId = ++this.loadId;
      // The load this one replaces stops where it stands: its answers are
      // dropped by the loadId checks below either way.
      this.loadAbort?.abort();
      const abort = new AbortController();
      this.loadAbort = abort;
      this.loading = true;
      this.error = null;
      this.tableData = null;
      this.partition = null;
      this.collectionRows = null;

      try {
        this.loadingMessage = this.$t('parquet.loadingMetadata');
        // A partitioned collection points one asset at every partition with a
        // wildcard href. Resolve it to one partition the browser can read.
        const { url, partition } = await resolveParquetGlob(this.selectedAsset, {
          signal: abort.signal,
        });
        // Every await below re-checks loadId: the user may have selected
        // another asset meanwhile, and this load's results belong to the old
        // one. The same check guards the catch and finally blocks.
        if (loadId !== this.loadId) {return;}
        this.partition = partition;
        this.collectionRows = partition?.totalRows || null;
        if (partition?.mirrorUrl) {
          // Not awaited: the table is the point, and the total only labels it.
          this.loadCollectionRows(partition.mirrorUrl, loadId);
        }
        const meta = await loadParquetMetadata(url);
        if (loadId !== this.loadId) {return;}
        this.parquetFile = meta.file;
        this.parquetMetadata = meta.metadata;
        this.geoInfo = {
          geometryColumn: meta.geometryColumn,
          bboxMapping: meta.bboxMapping,
          crs: meta.crs,
          crsDefinition: meta.crsDefinition,
        };

        const count = Math.min(meta.totalRows, MAX_ROWS);
        this.loadingMessage = this.$t('parquet.loadingRows', {
          count: count.toLocaleString(this.$i18n.locale)
        }, count);
        const data = await loadParquetRows(
          meta.file, meta.metadata, meta.columnNames, meta.geometryColumn
        );
        if (loadId !== this.loadId) {return;}
        this.tableData = data;
      } catch (err) {
        if (loadId !== this.loadId) {return;}
        if (abort.signal.aborted) {
          // The reader navigated away (beforeUnmount aborts this very
          // controller) before the load settled. loadId is untouched by
          // that abort, so without this check the rejection would read as a
          // real failure on a component that is already torn down.
          return;
        }
        console.error('ParquetViewer: failed to load', err);
        if (err.code === GLOB_UNRESOLVED) {
          // The default pick fell on a glob that no item expands. Show
          // another asset instead; an error about the glob belongs to the
          // user's own pick, not to a pick they never made. Over the real
          // assets, so the synthetic partition entry is never the fallback
          // for its own failed expansion. When that entry was the pick, any
          // parquet asset will do, because every one of them reaches the data
          // by a path the listing did not take; when a wildcard href was the
          // pick, only an asset that names one file can help.
          const assets = findParquetAssets(this.assets);
          const fallback = !this.selectedAssetKey
            && (isPartitionPlaceholder(this.selectedAsset)
              ? assets[0]
              : assets.find(a => isLoadableParquetAsset(a)));
          if (fallback) {
            this.selectedAssetKey = fallback.getKey();
            return;
          }
          this.error = this.$t('parquet.globUnresolved');
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          this.error = this.$t('parquet.networkError');
        } else {
          this.error = this.$t('parquet.loadFailed', { message: err.message });
        }
      } finally {
        // Same reasoning as the catch above: an unmount-triggered abort
        // leaves loadId unchanged, so these writes would otherwise land on
        // a torn-down component.
        if (loadId === this.loadId && !abort.signal.aborted) {
          this.loading = false;
          this.loadingMessage = '';
        }
      }
    },
    // Totals the partitions from the collection's item mirror. A failure
    // leaves the count at the one partition the table holds, because the
    // preview itself does not depend on this number.
    async loadCollectionRows(mirrorUrl, loadId) {
      try {
        const total = await readMirrorRowTotal(mirrorUrl);
        if (total && loadId === this.loadId) {
          this.collectionRows = total;
        }
      } catch (err) {
        console.warn('ParquetViewer: failed to total the partitions', err);
      }
    },
    scrollToMap() {
      const mapEl = document.querySelector('.hero-map, .maps-preview');
      if (mapEl) {
        mapEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    async onSelectRow({ origIndex, bbox }) {
      const crs = this.geoInfo.crs || 'EPSG:4326';
      const crsDefinition = this.geoInfo.crsDefinition;
      if (bbox) {
        this.$emit('highlight-bbox', { bbox, crs, crsDefinition });
        return;
      }
      if (this.geoInfo.geometryColumn && this.parquetFile && this.parquetMetadata) {
        try {
          const parsedBbox = await getBboxForRow(
            this.parquetFile, this.parquetMetadata,
            this.geoInfo.geometryColumn, origIndex
          );
          if (parsedBbox) {
            this.$emit('highlight-bbox', { bbox: parsedBbox, crs, crsDefinition });
          }
        } catch (err) {
          console.warn('Failed to parse geometry for highlight', err);
        }
      }
    },
    async onZoomToFeature({ origIndex, bbox }) {
      const crs = this.geoInfo.crs || 'EPSG:4326';
      const crsDefinition = this.geoInfo.crsDefinition;
      if (bbox) {
        this.$emit('zoom-to-bbox', { bbox, crs, crsDefinition });
        this.scrollToMap();
        return;
      }
      if (this.geoInfo.geometryColumn && this.parquetFile && this.parquetMetadata) {
        try {
          const parsedBbox = await getBboxForRow(
            this.parquetFile, this.parquetMetadata,
            this.geoInfo.geometryColumn, origIndex
          );
          if (parsedBbox) {
            this.$emit('zoom-to-bbox', { bbox: parsedBbox, crs, crsDefinition });
            this.scrollToMap();
          }
        } catch (err) {
          console.warn('Failed to parse geometry for zoom', err);
        }
      }
    }
  }
};
</script>

<style lang="scss">
@import "../theme/variables.scss";
@import "../theme/mixins.scss";

.parquet-viewer {
  border-radius: $border-radius;
}

.parquet-header {
  @include section-header(".parquet-title");
  gap: 0.5rem;
}

.parquet-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: $secondary;
    flex-shrink: 0;
  }
}

.parquet-file-badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.parquet-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.parquet-asset-select {
  max-width: 180px;
  font-size: 0.8rem;
}

.parquet-meta-info {
  font-size: 0.8rem;
  color: $secondary;
  white-space: nowrap;
}

.parquet-loading {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: $secondary;
  font-size: 0.9rem;
}

.parquet-error {
  font-size: 0.9rem;
}

.parquet-partition-note {
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: $secondary;
}

</style>
