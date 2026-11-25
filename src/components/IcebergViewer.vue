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
        <b-tab :id="TAB_DATA" :title="$t('iceberg.tabs.data')">
          <p v-if="where || snapshotId" class="iceberg-filter">
            <span>
              <span v-if="snapshotId" class="iceberg-filter-snapshot">
                {{ $t('iceberg.query.snapshot') }} <code>{{ snapshotId }}</code>
              </span>
              <span v-if="where" class="iceberg-filter-where">
                {{ $t('iceberg.query.filteredBy') }} <code>{{ where }}</code>
              </span>
            </span>
            <button type="button" class="btn btn-sm btn-outline-secondary iceberg-filter-clear" @click="clearQuery">
              {{ $t('iceberg.query.clear') }}
            </button>
          </p>
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
          <template v-else-if="tableData">
            <ParquetTable
              :columns="tableData.columns"
              :rows="tableData.rows"
              :totalRows="tableData.loadedRows"
              :loadedRows="tableData.loadedRows"
              :geometryColumn="tableData.geometryColumn"
              @zoom-to-feature="onZoomToFeature"
              @select-row="onSelectRow"
            />
          </template>
          <div v-if="offset > 0 || hasNext" class="iceberg-pager">
            <button
              type="button" class="btn btn-sm btn-outline-primary iceberg-previous"
              :disabled="loading || offset === 0"
              @click="previousPage"
            >
              {{ $t('iceberg.pager.previous', { count: pageSize.toLocaleString($i18n.locale) }) }}
            </button>
            <span class="iceberg-pager-info" role="status" aria-live="polite">{{ rowInfo }}</span>
            <button
              type="button" class="btn btn-sm btn-outline-primary iceberg-next"
              :disabled="loading || !hasNext"
              @click="nextPage"
            >
              {{ $t('iceberg.pager.next', { count: pageSize.toLocaleString($i18n.locale) }) }}
            </button>
          </div>
        </b-tab>
        <b-tab :id="TAB_SNAPSHOTS" :title="$t('iceberg.tabs.snapshots')">
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
                    <th />
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
                    <td class="text-end">
                      <button
                        type="button" class="btn btn-sm btn-outline-primary iceberg-snapshot-query"
                        @click="queryAtSnapshot(snapshot)"
                      >
                        {{ $t('iceberg.snapshots.query') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted m-2">{{ $t('iceberg.snapshots.none') }}</p>
          </template>
        </b-tab>
        <b-tab :id="TAB_QUERY" :title="$t('iceberg.tabs.query')">
          <div class="iceberg-query">
            <div class="iceberg-query-snapshot">
              <label class="form-label" for="iceberg-query-snapshot">{{ $t('iceberg.query.snapshot') }}</label>
              <select
                id="iceberg-query-snapshot"
                v-model="querySnapshot"
                class="form-select form-select-sm iceberg-snapshot-select"
                :disabled="!snapshots || snapshots.length === 0"
              >
                <option v-for="snapshot in snapshots || []" :key="snapshot.id" :value="snapshot.id">
                  {{ snapshotLabel(snapshot) }}
                </option>
              </select>
            </div>
            <div class="iceberg-query-heading">
              <label class="form-label" for="iceberg-query-input">{{ $t('iceberg.query.label') }}</label>
              <span class="iceberg-query-docs">
                <span class="iceberg-query-help">{{ $t('iceberg.query.help') }}</span>
                <!-- Each sentence has its own line. Vue drops the whitespace between two
                     elements, so the space stays explicit, for copying and screen readers. -->
                {{ ' ' }}
                <span class="iceberg-query-limit">
                  {{ $t('iceberg.query.limit', { limit: pageSize }) }}
                </span>
              </span>
            </div>
            <textarea
              id="iceberg-query-input"
              v-model="queryText"
              class="form-control form-control-sm iceberg-query-input"
              rows="3"
              spellcheck="false"
              :placeholder="$t('iceberg.query.placeholder')"
              @keydown.ctrl.enter.prevent="runQuery"
              @keydown.meta.enter.prevent="runQuery"
            />
            <div v-if="columnInfo.length > 0" class="iceberg-query-columns">
              <h4>{{ $t('iceberg.query.columns') }}</h4>
              <div class="iceberg-columns-scroll">
                <table class="table table-sm table-striped iceberg-columns">
                  <thead>
                    <tr>
                      <th>{{ $t('iceberg.query.columnName') }}</th>
                      <th>{{ $t('iceberg.query.columnType') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="column in columnInfo" :key="column.name">
                      <td class="iceberg-column-name">{{ column.name }}</td>
                      <td class="iceberg-column-type">{{ column.type }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="iceberg-query-actions">
              <button type="button" class="btn btn-sm btn-primary iceberg-run" :disabled="loading" @click="runQuery">
                {{ $t('iceberg.query.run') }}
              </button>
              <button
                v-if="where || queryText || snapshotId || snapshotChanged"
                type="button" class="btn btn-sm btn-outline-secondary iceberg-clear"
                @click="clearQuery"
              >
                {{ $t('iceberg.query.clear') }}
              </button>
            </div>
            <div v-if="queryError" class="iceberg-query-error alert alert-warning mt-2">{{ queryError }}</div>
          </div>
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
import {
  icebergField, icebergMetadataUrl, isLoadableIcebergAsset, MAX_ICEBERG_PREVIEW_ROWS,
} from '../utils/icebergShared';

// The tabs are named by id. The model of a tab group is the id of the tab that
// shows, and a number matches no tab.
const TAB_DATA = 'iceberg-tab-data';
const TAB_SNAPSHOTS = 'iceberg-tab-snapshots';
const TAB_QUERY = 'iceberg-tab-query';

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
  emits: ['zoom-to-bbox', 'highlight-bbox', 'page-change'],
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
      // Rows before the page the table shows. Page one starts at 0.
      offset: 0,
      // The SQL condition the table and the map are filtered by. `queryText` is
      // what the reader has typed, and `where` is what the last run applied.
      where: '',
      queryText: '',
      // The snapshot the table and the map are read at. Empty means the default,
      // which is the snapshot the collection names, or else the table's current
      // one. `querySnapshot` is the drop-down's choice before a run applies it.
      snapshotId: '',
      querySnapshot: '',
      // The columns of the table and their types, for the Query tab. They outlive
      // a failed query, which leaves no rows to read them from.
      columnInfo: [],
      activeTab: TAB_DATA,
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
    // A failed query shows its message where the reader edits the query. The
    // Data tab shows the same message beside its Retry button.
    queryError() {
      return this.where || this.snapshotId ? this.error : null;
    },
    // The snapshot a read uses when the reader picks none. This matches the
    // loader, which pins the snapshot the collection names when the table still
    // has it, and otherwise reads the table's current snapshot.
    defaultSnapshotId() {
      if (!this.snapshots?.length) {return null;}
      const pinned = this.pinnedSnapshotId;
      if (pinned && this.snapshots.some(snapshot => snapshot.id === pinned)) {return pinned;}
      return (this.snapshots.find(snapshot => snapshot.current) ?? this.snapshots[0]).id;
    },
    // The drop-down shows a snapshot other than the one the table holds now.
    snapshotChanged() {
      return Boolean(this.querySnapshot) && this.querySnapshot !== (this.snapshotId || this.defaultSnapshotId);
    },
    // Rows per page. The map draws the geometries of the page on screen.
    pageSize() {
      return MAX_ICEBERG_PREVIEW_ROWS;
    },
    // Another page follows. A full page is the sign of that, unless the snapshot
    // summary gives the table size and the rows seen have reached it.
    hasNext() {
      const data = this.tableData;
      if (!data || data.loadedRows < this.pageSize) {return false;}
      return !data.totalKnown || data.offset + data.loadedRows < data.totalRows;
    },
    // The rows on the page, against the table size when the summary gives it.
    rowInfo() {
      if (!this.tableData) {return null;}
      const { offset, loadedRows, totalRows, totalKnown } = this.tableData;
      const format = n => n.toLocaleString(this.$i18n.locale);
      if (loadedRows === 0 || (offset === 0 && !this.hasNext)) {
        return this.$t('parquet.rowCount', { count: format(totalRows) }, totalRows);
      }
      const range = { from: format(offset + 1), to: format(offset + loadedRows) };
      if (!totalKnown) {return this.$t('iceberg.rowRange', range);}
      return this.$t('parquet.pageRows', { ...range, total: format(totalRows) }, totalRows);
    }
  },
  watch: {
    // The drop-down starts on the default snapshot once the snapshots are known.
    defaultSnapshotId(id) {
      if (id && !this.snapshots.some(snapshot => snapshot.id === this.querySnapshot)) {
        this.querySnapshot = id;
      }
    },
    selectedAsset: {
      immediate: true,
      handler() {
        if (this.selectedAsset) {
          // Another table starts on its first page, with no filter. Its columns
          // are not the columns of the one before.
          this.offset = 0;
          this.where = '';
          this.queryText = '';
          this.snapshotId = '';
          this.querySnapshot = '';
          this.columnInfo = [];
          this.loadData();
          this.loadSnapshots();
        }
      }
    }
  },
  created() {
    // Read by the template, which names each tab by these ids.
    this.TAB_DATA = TAB_DATA;
    this.TAB_SNAPSHOTS = TAB_SNAPSHOTS;
    this.TAB_QUERY = TAB_QUERY;
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
      // The filter and snapshot this load runs. A later run may change them before it ends.
      const where = this.where;
      const snapshotId = this.snapshotId;

      try {
        const url = icebergMetadataUrl(this.selectedAsset);
        const data = await loadIcebergRows(url, {
          signal: abort.signal,
          geometryColumn: icebergField(this.selectedAsset, 'table:primary_geometry'),
          snapshotId: snapshotId || icebergField(this.selectedAsset, 'iceberg:current_snapshot_id'),
          offset: this.offset,
          where,
        });
        if (loadId !== this.loadId) {return;}
        this.tableData = data;
        this.columnInfo = data.fields;
        // The map draws the geometries of the rows the table now shows.
        this.$emit('page-change', { offset: data.offset, where, snapshotId });
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
    // Apply the typed condition. The results go to the Data tab, where the table
    // and the map show them. An empty condition is the same as no filter.
    runQuery() {
      if (this.loading) {return;}
      this.where = this.queryText.trim();
      // The default snapshot is stored as empty, so the loader picks it the way it always did.
      this.snapshotId = this.querySnapshot && this.querySnapshot !== this.defaultSnapshotId ? this.querySnapshot : '';
      this.offset = 0;
      this.activeTab = TAB_DATA;
      this.loadData();
    },
    clearQuery() {
      this.queryText = '';
      this.querySnapshot = this.defaultSnapshotId ?? '';
      if (!this.where && !this.snapshotId) {return;}
      this.where = '';
      this.snapshotId = '';
      this.offset = 0;
      this.loadData();
    },
    // The Query button of a snapshot: open the Query tab with that snapshot
    // chosen in the drop-down. The reader adds a condition if they want one and
    // runs it, so nothing is read until then.
    queryAtSnapshot(snapshot) {
      this.querySnapshot = snapshot.id;
      this.activeTab = TAB_QUERY;
    },
    // One option of the drop-down: when it was committed, its id, and which
    // snapshot it is for the table and for the collection.
    snapshotLabel(snapshot) {
      const tags = [];
      if (snapshot.current) {tags.push(this.$t('iceberg.snapshots.tableCurrent'));}
      if (snapshot.id === this.pinnedSnapshotId) {tags.push(this.$t('iceberg.snapshots.collection'));}
      const suffix = tags.length > 0 ? ` (${tags.join(', ')})` : '';
      return `${this.formatCommitted(snapshot.timestamp)} · ${snapshot.id}${suffix}`;
    },
    // A page is one query with an OFFSET, so any page loads without the pages
    // before it. The rows keep one order for one metadata file.
    nextPage() {
      if (!this.hasNext || this.loading) {return;}
      this.offset += this.pageSize;
      this.loadData();
    },
    previousPage() {
      if (this.offset === 0 || this.loading) {return;}
      this.offset = Math.max(0, this.offset - this.pageSize);
      this.loadData();
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

.iceberg-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
}

.iceberg-query {
  padding: 0.75rem;

  .iceberg-query-snapshot {
    margin-bottom: 0.75rem;

    .form-label {
      margin-bottom: 0.25rem;
    }

    .iceberg-snapshot-select {
      font-family: $font-family-monospace;
    }
  }

  .iceberg-query-input {
    font-family: $font-family-monospace;
  }

  // The label and all of its documentation share a block above the box, and the
  // documentation wraps under the label on a narrow screen.
  .iceberg-query-heading {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.1rem 0.75rem;
    margin-bottom: 0.25rem;

    .form-label {
      margin: 0;
    }
  }

  // One sentence to a line.
  .iceberg-query-docs {
    font-size: 0.8rem;
    color: $secondary;

    .iceberg-query-help,
    .iceberg-query-limit {
      display: block;
    }
  }

  .iceberg-query-columns {
    margin-top: 0.75rem;

    h4 {
      margin: 0 0 0.25rem;
      font-size: 0.85rem;
      color: $secondary;
    }
  }

  // A table with many columns scrolls here, so the box does not push the
  // Run button out of view.
  .iceberg-columns-scroll {
    max-height: 14rem;
    overflow: auto;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: $border-radius;
  }

  .iceberg-columns {
    margin: 0;
    font-size: 0.8rem;

    th {
      position: sticky;
      top: 0;
      background: $light;
    }

    // One cell holds one name, so a click selects that name and nothing else.
    .iceberg-column-name {
      font-family: $font-family-monospace;
    }

    .iceberg-column-type {
      color: $secondary;
      font-family: $font-family-monospace;
    }
  }

  .iceberg-query-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
}

.iceberg-filter-snapshot {
  margin-right: 0.75rem;
}

.iceberg-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.5rem;
}

.iceberg-pager-info {
  font-size: 0.8rem;
  color: $secondary;
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
