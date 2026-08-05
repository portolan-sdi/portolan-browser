<template>
  <div class="parquet-table-wrapper">
    <div class="parquet-filter-bar">
      <input
        v-model="filterText"
        type="text"
        class="form-control form-control-sm parquet-filter-input"
        :placeholder="$t('parquet.filterPlaceholder', 'Filter rows...')"
      >
      <select v-model="filterColumn" class="form-select form-select-sm parquet-filter-column">
        <option value="">{{ $t('parquet.allColumns', 'All columns') }}</option>
        <option v-for="col in displayColumns" :key="col" :value="col">{{ col }}</option>
      </select>
      <span class="parquet-row-count">
        <template v-if="filteredRows.length !== rows.length">
          {{ filteredRows.length }} / {{ rows.length }}
        </template>
        <template v-else-if="loadedRows < totalRows">
          {{ $t('parquet.showingOf', { loaded: loadedRows.toLocaleString(), total: totalRows.toLocaleString() }, `Showing first ${loadedRows.toLocaleString()} of ${totalRows.toLocaleString()} rows`) }}
        </template>
        <template v-else>
          {{ totalRows.toLocaleString() }} {{ $t('parquet.rows', 'rows') }}
        </template>
      </span>
    </div>
    <div class="parquet-scroll-container">
      <table class="table table-sm table-striped parquet-data-table">
        <thead>
          <tr>
            <th v-if="geometryColumn" class="parquet-header-cell parquet-geom-col">
              {{ geometryColumn }}
            </th>
            <th
              v-for="col in displayColumns"
              :key="col"
              class="parquet-header-cell"
              @click="toggleSort(col)"
            >
              <span class="parquet-header-text">{{ col }}</span>
              <span v-if="sortColumn === col" class="parquet-sort-indicator">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
              <span v-else class="parquet-sort-indicator parquet-sort-inactive">{{ '↕' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visibleRows" :key="row._origIndex"
            :class="{ 'parquet-row-selected': selectedIndex === row._origIndex }"
            @click="selectRow(row)"
          >
            <td v-if="geometryColumn" class="parquet-data-cell parquet-geom-col">
              <button
                class="btn btn-link btn-sm parquet-zoom-btn p-0"
                :title="$t('parquet.zoomToFeature', 'Zoom to feature')"
                @click.stop="zoomToRow(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none"
                  stroke="currentColor" stroke-width="1.5"
                  viewBox="0 0 16 16"
                >
                  <circle cx="8" cy="8" r="6" />
                  <circle cx="8" cy="8" r="2.5" />
                  <line x1="8" y1="0.5" x2="8" y2="3" />
                  <line x1="8" y1="13" x2="8" y2="15.5" />
                  <line x1="0.5" y1="8" x2="3" y2="8" />
                  <line x1="13" y1="8" x2="15.5" y2="8" />
                </svg>
              </button>
            </td>
            <td v-for="col in displayColumns" :key="col" class="parquet-data-cell">
              <a v-if="isUrl(row[col])" :href="row[col]" target="_blank" rel="noopener noreferrer">{{ formatCellValue(row[col]) }}</a>
              <template v-else>{{ formatCellValue(row[col]) }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="pageCount > 1" class="parquet-pagination">
      <button
        type="button" class="btn btn-sm btn-outline-primary"
        :disabled="currentPage === 0"
        @click="prevPage"
      >
        {{ $t('parquet.prevPage', 'Previous') }}
      </button>
      <span class="parquet-page-info">
        {{ $t('parquet.pageRows', { from: pageFrom.toLocaleString(), to: pageTo.toLocaleString(), total: sortedRows.length.toLocaleString() }, `Rows ${pageFrom.toLocaleString()}–${pageTo.toLocaleString()} of ${sortedRows.length.toLocaleString()}`) }}
      </span>
      <button
        type="button" class="btn btn-sm btn-outline-primary"
        :disabled="currentPage >= pageCount - 1"
        @click="nextPage"
      >
        {{ $t('parquet.nextPage', 'Next') }}
      </button>
    </div>
  </div>
</template>

<script>
// How many rows are in the DOM at once. The loader caps what it decodes
// (MAX_ROWS, 10k), but rendering even that many rows at once is fatal on a
// wide table: 10k rows × ~140 columns is over a million table cells, which
// freezes the tab and grows the heap into the gigabytes long after the data
// itself (a few hundred MB) decoded fine. Filtering and sorting still work
// across everything that was loaded — only the rendering is windowed.
export const PAGE_SIZE = 100;

export default {
  name: 'ParquetTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    rows: {
      type: Array,
      required: true
    },
    totalRows: {
      type: Number,
      required: true
    },
    loadedRows: {
      type: Number,
      required: true
    },
    geometryColumn: {
      type: String,
      default: null
    },
    geometryTypes: {
      type: Array,
      default: () => []
    },
    bboxMapping: {
      type: Object,
      default: null
    }
  },
  emits: ['zoom-to-feature', 'select-row'],
  data() {
    return {
      filterText: '',
      filterColumn: '',
      sortColumn: null,
      sortDirection: null,
      selectedIndex: null,
      page: 0,
    };
  },
  computed: {
    hiddenColumns() {
      const hidden = new Set();
      if (this.geometryColumn) {hidden.add(this.geometryColumn);}
      if (this.bboxMapping) {
        Object.values(this.bboxMapping).forEach(col => {
          if (col) {
            hidden.add(col);
            const parent = col.split('.')[0];
            if (parent !== col) {hidden.add(parent);}
          }
        });
      }
      for (const col of this.columns) {
        const lower = col.toLowerCase();
        if (lower.includes('bbox') || lower === 'xmin' || lower === 'ymin' || lower === 'xmax' || lower === 'ymax') {
          hidden.add(col);
        }
      }
      return hidden;
    },
    displayColumns() {
      return this.columns.filter(c => !this.hiddenColumns.has(c));
    },
    indexedRows() {
      return this.rows.map((row, i) => {
        const obj = { _origIndex: i };
        this.columns.forEach((col, ci) => {
          obj[col] = row[ci];
        });
        if (this.geometryTypes[i]) {
          obj._geomType = this.geometryTypes[i];
        }
        return obj;
      });
    },
    filteredRows() {
      let result = this.indexedRows;
      if (this.filterText) {
        const search = this.filterText.toLowerCase();
        result = result.filter(row => {
          const cols = this.filterColumn ? [this.filterColumn] : this.displayColumns;
          return cols.some(col => {
            const val = row[col];
            return val != null && String(val).toLowerCase().includes(search);
          });
        });
      }
      return result;
    },
    sortedRows() {
      if (!this.sortColumn || !this.sortDirection) {
        return this.filteredRows;
      }
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      return [...this.filteredRows].sort((a, b) => {
        const va = a[col];
        const vb = b[col];
        if (va == null && vb == null) {return 0;}
        if (va == null) {return 1;}
        if (vb == null) {return -1;}
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * dir;
        }
        return String(va).localeCompare(String(vb)) * dir;
      });
    },
    pageCount() {
      return Math.max(1, Math.ceil(this.sortedRows.length / PAGE_SIZE));
    },
    // Clamped rather than trusting `page`: the row set can shrink under the
    // current page (filtering while on a late page) between the watcher reset
    // and this read.
    currentPage() {
      return Math.min(this.page, this.pageCount - 1);
    },
    pageFrom() {
      return this.sortedRows.length === 0 ? 0 : this.currentPage * PAGE_SIZE + 1;
    },
    pageTo() {
      return Math.min((this.currentPage + 1) * PAGE_SIZE, this.sortedRows.length);
    },
    visibleRows() {
      return this.sortedRows.slice(this.currentPage * PAGE_SIZE, (this.currentPage + 1) * PAGE_SIZE);
    }
  },
  watch: {
    // A new filter or sort order changes what the pages contain, so stale page
    // positions are meaningless — start over from the first page.
    filterText() {
      this.page = 0;
    },
    filterColumn() {
      this.page = 0;
    },
    sortColumn() {
      this.page = 0;
    },
    sortDirection() {
      this.page = 0;
    },
    rows() {
      this.page = 0;
    },
  },
  methods: {
    prevPage() {
      this.page = Math.max(0, this.currentPage - 1);
    },
    nextPage() {
      this.page = Math.min(this.pageCount - 1, this.currentPage + 1);
    },
    toggleSort(col) {
      if (this.sortColumn === col) {
        if (this.sortDirection === 'asc') {
          this.sortDirection = 'desc';
        } else {
          this.sortColumn = null;
          this.sortDirection = null;
        }
      } else {
        this.sortColumn = col;
        this.sortDirection = 'asc';
      }
    },
    isUrl(val) {
      return typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'));
    },
    formatCellValue(val) {
      if (val == null) {return '';}
      if (val instanceof Uint8Array || val instanceof ArrayBuffer) {return '[binary]';}
      if (typeof val === 'object') {
        try {
          return JSON.stringify(val);
        } catch {
          return String(val);
        }
      }
      if (typeof val === 'bigint') {return val.toString();}
      return val;
    },
    getNestedValue(row, path) {
      if (!path) {return undefined;}
      if (row[path] !== undefined) {return row[path];}
      const parts = path.split('.');
      let val = row;
      for (const part of parts) {
        if (val == null) {return undefined;}
        val = val[part];
      }
      return val;
    },
    selectRow(row) {
      this.selectedIndex = this.selectedIndex === row._origIndex ? null : row._origIndex;
      if (this.selectedIndex !== null) {
        let bbox = null;
        if (this.bboxMapping) {
          bbox = [
            this.getNestedValue(row, this.bboxMapping.xmin),
            this.getNestedValue(row, this.bboxMapping.ymin),
            this.getNestedValue(row, this.bboxMapping.xmax),
            this.getNestedValue(row, this.bboxMapping.ymax),
          ];
          if (bbox.some(v => v == null)) {
            bbox = null;
          }
        }
        this.$emit('select-row', { origIndex: row._origIndex, bbox });
      }
    },
    zoomToRow(row) {
      let bbox = null;
      if (this.bboxMapping) {
        bbox = [
          this.getNestedValue(row, this.bboxMapping.xmin),
          this.getNestedValue(row, this.bboxMapping.ymin),
          this.getNestedValue(row, this.bboxMapping.xmax),
          this.getNestedValue(row, this.bboxMapping.ymax),
        ];
        if (bbox.some(v => v == null)) {
          bbox = null;
        }
      }
      this.$emit('zoom-to-feature', { origIndex: row._origIndex, bbox });
    }
  }
};
</script>

<style lang="scss">
@import "../theme/variables.scss";

.parquet-table-wrapper {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: $border-radius;
  overflow: hidden;
}

.parquet-filter-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  background: $light;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.parquet-filter-input {
  max-width: 200px;
}

.parquet-filter-column {
  max-width: 160px;
}

.parquet-row-count {
  margin-left: auto;
  font-size: 0.8rem;
  color: $secondary;
  white-space: nowrap;
}

.parquet-scroll-container {
  overflow: auto;
  max-height: 400px;
}

.parquet-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: $light;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.parquet-page-info {
  font-size: 0.8rem;
  color: $secondary;
  white-space: nowrap;
}

.parquet-data-table {
  margin-bottom: 0;
  font-size: 0.85rem;
  white-space: nowrap;

  thead {
    position: sticky;
    top: 0;
    z-index: 1;
    background: white;
  }

  tbody tr {
    cursor: pointer;
  }
}

.parquet-header-cell {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  vertical-align: middle;

  &:hover {
    background-color: darken($light, 5%);
  }
}

.parquet-sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.75rem;
}

.parquet-sort-inactive {
  opacity: 0.3;
}

.parquet-data-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.parquet-row-selected {
  td {
    background-color: rgba(255, 200, 0, 0.3) !important;
    border-color: rgba(200, 150, 0, 0.4);
  }
}

.parquet-zoom-btn {
  color: $primary;
  line-height: 1;
  &:hover {
    color: darken($primary, 15%);
  }
}

.parquet-geom-col {
  color: $secondary;
  font-style: italic;
}

</style>
