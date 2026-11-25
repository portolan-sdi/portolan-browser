<template>
  <section v-if="icebergAssets.length > 0" class="iceberg-viewer mb-4">
    <div class="iceberg-header" @click="open = !open">
      <span class="iceberg-header-left">
        <BIconChevronDown v-if="open" />
        <BIconChevronRight v-else />
        <span class="iceberg-title">{{ $t('parquet.dataPreview') }}</span>
        <b-badge variant="primary" class="iceberg-badge">{{ selectedAssetTitle }}</b-badge>
      </span>
      <span class="iceberg-header-right">
        <select
          v-if="icebergAssets.length > 1"
          v-model="selectedAssetKey"
          class="form-select form-select-sm iceberg-asset-select"
          @click.stop
        >
          <option v-for="asset in icebergAssets" :key="asset.getKey()" :value="asset.getKey()">
            {{ asset.title || asset.getKey() }}
          </option>
        </select>
        <span v-if="rowInfo" class="iceberg-meta-info">{{ rowInfo }}</span>
      </span>
    </div>
    <b-collapse v-model="open">
      <b-tabs v-model="activeTab" small class="iceberg-tabs">
        <b-tab :title="$t('iceberg.tabs.data')">
          <div v-if="loading" class="iceberg-loading">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">{{ $t('loading') }}</span>
            </div>
            <span class="ms-2">{{ $t('parquet.loadingMetadata') }}</span>
          </div>
          <div v-else-if="error" class="iceberg-error alert alert-warning m-2">
            <p class="mb-1">{{ error }}</p>
            <button class="btn btn-sm btn-outline-primary" @click="loadData">{{ $t('parquet.retry') }}</button>
          </div>
          <ParquetTable
            v-else-if="tableData"
            :columns="tableData.columns"
            :rows="tableData.rows"
            :totalRows="tableData.totalRows"
            :loadedRows="tableData.loadedRows"
            :geometryColumn="tableData.geometryColumn"
            @zoom-to-feature="onZoomToFeature"
            @select-row="onSelectRow"
          />
        </b-tab>
        <b-tab :title="$t('iceberg.tabs.snapshots')">
          <div v-if="snapshotsLoading" class="iceberg-loading">
            <div class="spinner-border spinner-border-sm text-primary" role="status">
              <span class="visually-hidden">{{ $t('loading') }}</span>
            </div>
          </div>
          <div v-else-if="snapshotsError" class="iceberg-snapshots-error alert alert-warning m-2">
            <p class="mb-1">{{ snapshotsError }}</p>
            <button class="btn btn-sm btn-outline-primary" @click="loadSnapshots">{{ $t('parquet.retry') }}</button>
          </div>
          <template v-else-if="snapshots">
            <div v-if="pinnedMismatch" class="iceberg-snapshots-note alert alert-warning m-2">
              {{ $t('iceberg.snapshots.pinnedMismatch', { id: pinnedSnapshotId }) }}
            </div>
            <div v-if="snapshots.length > 0" class="table-responsive">
              <table class="table table-sm table-striped iceberg-snapshots">
                <thead>
                  <tr>
                    <th>{{ $t('iceberg.snapshots.committed') }}</th>
                    <th>{{ $t('iceberg.snapshots.snapshot') }}</th>
                    <th>{{ $t('iceberg.snapshots.operation') }}</th>
                    <th class="text-end">{{ $t('iceberg.snapshots.rows') }}</th>
                    <th class="text-end">{{ $t('iceberg.snapshots.files') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="snapshot in snapshots" :key="snapshot.id">
                    <td class="iceberg-committed">{{ formatCommitted(snapshot.timestamp) }}</td>
                    <td>
                      <code>{{ snapshot.id }}</code>
                      <b-badge v-if="snapshot.current" variant="success" class="ms-1">{{ $t('iceberg.snapshots.tableCurrent') }}</b-badge>
                      <b-badge v-if="snapshot.id === pinnedSnapshotId" variant="info" class="ms-1">{{ $t('iceberg.snapshots.collection') }}</b-badge>
                    </td>
                    <td>{{ snapshot.operation }}</td>
                    <td class="text-end">{{ formatCount(snapshot.rows) }}</td>
                    <td class="text-end">{{ formatCount(snapshot.files) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted m-2">{{ $t('iceberg.snapshots.none') }}</p>
          </template>
        </b-tab>
      </b-tabs>
    </b-collapse>
  </section>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { BCollapse, BBadge, BTabs, BTab } from 'bootstrap-vue-next';
import BIconChevronDown from '~icons/bi/chevron-down';
import BIconChevronRight from '~icons/bi/chevron-right';
import { loadIcebergRows, loadIcebergSnapshots } from '../utils/iceberg';
import { icebergField, icebergMetadataUrl, isLoadableIcebergAsset } from '../utils/icebergShared';

// The preview of an Iceberg table: its first rows in the same table the
// GeoParquet preview uses. The asset is the table's metadata.json, so this
// reads the table through icebird and not through a Parquet file.
export default {
  name: 'IcebergViewer',
  components: {
    BCollapse,
    BBadge,
    BTabs,
    BTab,
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
      error: null,
      selectedAssetKey: null,
      // Identifies the current load, so a late answer for an asset the reader
      // has since left does not land on the one they selected.
      loadId: 0,
      snapshotsLoadId: 0,
      snapshotsAbort: null,
      loadAbort: null,
      tableData: null,
      activeTab: 0,
      // The snapshots come from the metadata file alone, so they load apart
      // from the rows and a slow or failed row read does not hold them back.
      snapshots: null,
      snapshotsLoading: false,
      snapshotsError: null,
    };
  },
  computed: {
    // A static-catalog table the browser can read. Other Iceberg assets have
    // nothing to preview, so they do not appear.
    icebergAssets() {
      return this.assets.filter(isLoadableIcebergAsset);
    },
    selectedAsset() {
      if (!this.selectedAssetKey) {return this.icebergAssets[0] || null;}
      return this.icebergAssets.find(a => a.getKey() === this.selectedAssetKey) || this.icebergAssets[0];
    },
    selectedAssetTitle() {
      if (!this.selectedAsset) {return '';}
      return this.selectedAsset.title || this.selectedAsset.getKey();
    },
    // The snapshot the collection names, as a string: the extension types it as
    // a string because a 64-bit id loses precision as a JSON number.
    pinnedSnapshotId() {
      const declared = this.selectedAsset && icebergField(this.selectedAsset, 'iceberg:current_snapshot_id');
      return declared == null ? null : String(declared);
    },
    // The collection names a snapshot that is not the table's current one: the
    // table moved on, or the snapshot is gone. Either way the collection's
    // description of the table may be out of date.
    pinnedMismatch() {
      if (!this.snapshots || this.pinnedSnapshotId === null) {return false;}
      const current = this.snapshots.find(snapshot => snapshot.current);
      return Boolean(current) && current.id !== this.pinnedSnapshotId;
    },
    rowInfo() {
      if (!this.tableData) {return null;}
      const { loadedRows, totalRows } = this.tableData;
      const format = n => n.toLocaleString(this.$i18n.locale);
      if (loadedRows < totalRows) {
        return this.$t('parquet.loadedRowCount', { loaded: format(loadedRows), total: format(totalRows) }, totalRows);
      }
      return this.$t('parquet.rowCount', { count: format(totalRows) }, totalRows);
    }
  },
  watch: {
    selectedAsset: {
      immediate: true,
      handler() {
        if (this.selectedAsset) {
          this.loadData();
          this.loadSnapshots();
        }
      }
    }
  },
  beforeUnmount() {
    this.loadAbort?.abort();
    this.snapshotsAbort?.abort();
  },
  methods: {
    async loadData() {
      if (!this.selectedAsset) {return;}

      const loadId = ++this.loadId;
      this.loadAbort?.abort();
      const abort = new AbortController();
      this.loadAbort = abort;
      this.loading = true;
      this.error = null;
      this.tableData = null;

      try {
        const url = icebergMetadataUrl(this.selectedAsset);
        const data = await loadIcebergRows(url, {
          signal: abort.signal,
          geometryColumn: icebergField(this.selectedAsset, 'table:primary_geometry'),
          snapshotId: icebergField(this.selectedAsset, 'iceberg:current_snapshot_id'),
        });
        if (loadId !== this.loadId) {return;}
        this.tableData = data;
      } catch (err) {
        // A superseded or unmounted load is not a failure the reader should see.
        if (loadId !== this.loadId || abort.signal.aborted) {return;}
        console.error('IcebergViewer: failed to load', err);
        if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          this.error = this.$t('parquet.networkError');
        } else {
          this.error = this.$t('iceberg.loadFailed', { message: err.message });
        }
      } finally {
        if (loadId === this.loadId && !abort.signal.aborted) {
          this.loading = false;
        }
      }
    },
    async loadSnapshots() {
      if (!this.selectedAsset) {return;}

      const loadId = ++this.snapshotsLoadId;
      this.snapshotsAbort?.abort();
      const abort = new AbortController();
      this.snapshotsAbort = abort;
      this.snapshotsLoading = true;
      this.snapshotsError = null;
      this.snapshots = null;

      try {
        const { snapshots } = await loadIcebergSnapshots(icebergMetadataUrl(this.selectedAsset), {
          signal: abort.signal,
        });
        if (loadId !== this.snapshotsLoadId) {return;}
        this.snapshots = snapshots;
      } catch (err) {
        if (loadId !== this.snapshotsLoadId || abort.signal.aborted) {return;}
        console.error('IcebergViewer: failed to load snapshots', err);
        this.snapshotsError = this.$t('iceberg.loadFailed', { message: err.message });
      } finally {
        if (loadId === this.snapshotsLoadId && !abort.signal.aborted) {
          this.snapshotsLoading = false;
        }
      }
    },
    // UTC, to the second, like `2026-10-08 14:54:16Z`.
    formatCommitted(date) {
      return date ? date.toISOString().replace('T', ' ').replace(/\.\d+Z$/, 'Z') : '';
    },
    // An empty cell for a count the writer did not record.
    formatCount(count) {
      return count === null ? '' : count.toLocaleString(this.$i18n.locale);
    },
    // The loader computed one box per row, so the table's row index is enough.
    bboxFor(origIndex) {
      return this.tableData?.bboxes?.[origIndex] ?? null;
    },
    onSelectRow({ origIndex }) {
      // Deselecting sends a null index. A row with no geometry has no box.
      const bbox = origIndex === null ? null : this.bboxFor(origIndex);
      if (bbox) {
        this.$emit('highlight-bbox', { bbox, crs: this.tableData.crs, crsDefinition: null });
      }
    },
    onZoomToFeature({ origIndex }) {
      const bbox = this.bboxFor(origIndex);
      if (!bbox) {return;}
      this.$emit('zoom-to-bbox', { bbox, crs: this.tableData.crs, crsDefinition: null });
      document.querySelector('.hero-map, .maps-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};
</script>

<style lang="scss">
@import "../theme/variables.scss";
@import "../theme/mixins.scss";

.iceberg-viewer {
  border-radius: $border-radius;
}

.iceberg-header {
  @include section-header(".iceberg-title");
  gap: 0.5rem;
}

.iceberg-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: $secondary;
    flex-shrink: 0;
  }
}

.iceberg-badge {
  font-size: 0.75rem;
  font-weight: 500;
}

.iceberg-header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.iceberg-asset-select {
  max-width: 180px;
  font-size: 0.8rem;
}

.iceberg-meta-info {
  font-size: 0.8rem;
  color: $secondary;
  white-space: nowrap;
}

.iceberg-loading {
  display: flex;
  align-items: center;
  padding: 1rem;
  color: $secondary;
  font-size: 0.9rem;
}

.iceberg-error,
.iceberg-snapshots-error,
.iceberg-snapshots-note {
  font-size: 0.9rem;
}

.iceberg-tabs {
  .nav {
    padding: 0 0.5rem;
  }
}

.iceberg-snapshots {
  font-size: 0.85rem;

  .iceberg-committed {
    white-space: nowrap;
  }
}
</style>
