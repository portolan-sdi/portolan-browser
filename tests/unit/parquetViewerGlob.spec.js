import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ParquetViewer from '../../src/components/ParquetViewer.vue'
import en from '../../src/locales/en/texts.json'
import {
  loadParquetMetadata, loadParquetRows, readMirrorRowTotal, resolveParquetGlob,
} from '../../src/utils/parquet'

vi.mock('../../src/utils/parquet', () => ({
  findParquetAssets: assets => assets,
  loadParquetMetadata: vi.fn(),
  loadParquetRows: vi.fn(),
  getBboxForRow: vi.fn(),
  GLOB_UNRESOLVED: 'globUnresolved',
  readMirrorRowTotal: vi.fn(),
  resolveParquetGlob: vi.fn(),
  MAX_ROWS: 10000,
}))

const GLOB_HREF = 'https://data.test/ftw/2017/zone=*/utm*.parquet'
const PARTITION_HREF = 'https://data.test/ftw/2017/zone=01/utm01.parquet'

const viewer = (assets = []) => mount(ParquetViewer, {
  props: { assets },
  global: {
    plugins: [createI18n({ legacy: true, locale: 'en', messages: { en } })],
    stubs: {
      BCollapse: { template: '<div><slot /></div>' },
      BBadge: { template: '<span><slot /></span>' },
      // Declares the props the tests read, which a generated stub does not.
      ParquetTable: {
        name: 'ParquetTable',
        props: ['totalRows', 'loadedRows'],
        template: '<div class="parquet-table-stub" />',
      },
    },
  },
})

const globAsset = {
  getKey: () => 'data',
  getAbsoluteUrl: () => GLOB_HREF,
}

const tableLoads = (rows = 6311) => {
  loadParquetMetadata.mockResolvedValue({
    file: {}, metadata: {}, columnNames: ['id'], totalRows: rows,
    geometryColumn: 'geometry', bboxMapping: null, crs: null, crsDefinition: null,
  })
  loadParquetRows.mockResolvedValue({
    columns: ['id'], rows: [[1]], totalRows: rows, loadedRows: Math.min(rows, 10000),
  })
}

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const partitionOf = (extra = {}) => ({
  title: 'UTM zone 1', count: 54, totalRows: null, mirrorUrl: null, ...extra,
})

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
})

describe('ParquetViewer glob resolution', () => {
  it('reads the partition the resolver returns, not the wildcard href', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: partitionOf(),
    })
    tableLoads()
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(resolveParquetGlob).toHaveBeenCalledWith(globAsset)
    expect(loadParquetMetadata).toHaveBeenCalledWith(PARTITION_HREF)
    expect(wrapper.find('.parquet-error').exists()).toBe(false)
    wrapper.unmount()
  })

  it('names the partition and the partition count under the header', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: partitionOf(),
    })
    tableLoads()
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.find('.parquet-partition-note').text())
      .toBe('Preview of the first of 54 partitions: UTM zone 1.')
    wrapper.unmount()
  })

  it('uses the singular text for a collection with one partition', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: partitionOf({ count: 1 }),
    })
    tableLoads()
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.find('.parquet-partition-note').text())
      .toBe('Preview of the only partition: UTM zone 1.')
    wrapper.unmount()
  })

  it('shows no note for a concrete href', async () => {
    resolveParquetGlob.mockResolvedValue({ url: PARTITION_HREF, partition: null })
    tableLoads()
    const wrapper = viewer([{ getKey: () => 'data', getAbsoluteUrl: () => PARTITION_HREF }])
    await flushPromises()
    expect(wrapper.find('.parquet-partition-note').exists()).toBe(false)
    wrapper.unmount()
  })

  it('reports an unexpandable wildcard with its own message', async () => {
    const error = new Error('No item links expand the pattern')
    error.code = 'globUnresolved'
    resolveParquetGlob.mockRejectedValue(error)
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.find('.parquet-error').text()).toContain('the href has a wildcard')
    expect(loadParquetMetadata).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('counts the rows of the collection, not of the partition it read', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: partitionOf({ totalRows: 133102683 }),
    })
    tableLoads(7335)
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.vm.rowInfo).toBe('7,335 / 133,102,683 rows')
    // The table reports the same total, so neither count reads as the whole
    // collection on its own.
    expect(wrapper.findComponent({ name: 'ParquetTable' }).props('totalRows')).toBe(133102683)
    expect(readMirrorRowTotal).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('totals the partitions from the item mirror when no count is declared', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF,
      partition: partitionOf({ mirrorUrl: 'https://data.test/ftw/2017/items.parquet' }),
    })
    tableLoads(7335)
    readMirrorRowTotal.mockResolvedValue(133102683)
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(readMirrorRowTotal).toHaveBeenCalledWith('https://data.test/ftw/2017/items.parquet')
    expect(wrapper.vm.rowInfo).toBe('7,335 / 133,102,683 rows')
    wrapper.unmount()
  })

  it('names the partition in the count when no total is available', async () => {
    resolveParquetGlob.mockResolvedValue({ url: PARTITION_HREF, partition: partitionOf() })
    tableLoads(7335)
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.vm.rowInfo).toBe('7,335 rows in this partition')
    wrapper.unmount()
  })

  it('keeps the preview when the mirror read fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF,
      partition: partitionOf({ mirrorUrl: 'https://data.test/ftw/2017/items.parquet' }),
    })
    tableLoads(7335)
    readMirrorRowTotal.mockRejectedValue(new Error('fetch head failed 404'))
    const wrapper = viewer([globAsset])
    await flushPromises()
    expect(wrapper.find('.parquet-error').exists()).toBe(false)
    expect(wrapper.vm.rowInfo).toBe('7,335 rows in this partition')
    wrapper.unmount()
  })

  it('counts a concrete asset as before', async () => {
    resolveParquetGlob.mockResolvedValue({ url: PARTITION_HREF, partition: null })
    tableLoads(7335)
    const wrapper = viewer([{ getKey: () => 'cells', getAbsoluteUrl: () => PARTITION_HREF }])
    await flushPromises()
    expect(wrapper.vm.rowInfo).toBe('7,335 rows')
    wrapper.unmount()
  })

  it('drops a mirror total that arrives after the reader selects another asset', async () => {
    const late = deferred()
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF,
      partition: partitionOf({ mirrorUrl: 'https://data.test/ftw/2017/items.parquet' }),
    })
    tableLoads(7335)
    readMirrorRowTotal.mockReturnValue(late.promise)
    const concrete = { getKey: () => 'cells', getAbsoluteUrl: () => 'https://data.test/cells.parquet' }
    const wrapper = viewer([globAsset, concrete])
    await flushPromises()

    resolveParquetGlob.mockResolvedValue({ url: 'https://data.test/cells.parquet', partition: null })
    await wrapper.setData({ selectedAssetKey: 'cells' })
    await flushPromises()
    late.resolve(133102683)
    await flushPromises()

    expect(wrapper.vm.collectionRows).toBeNull()
    expect(wrapper.vm.rowInfo).toBe('7,335 rows')
    wrapper.unmount()
  })

  it('clears the note when the selected asset changes', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: partitionOf(),
    })
    tableLoads()
    const concrete = { getKey: () => 'cells', getAbsoluteUrl: () => 'https://data.test/cells.parquet' }
    const wrapper = viewer([globAsset, concrete])
    await flushPromises()
    expect(wrapper.find('.parquet-partition-note').exists()).toBe(true)

    resolveParquetGlob.mockResolvedValue({ url: 'https://data.test/cells.parquet', partition: null })
    await wrapper.setData({ selectedAssetKey: 'cells' })
    await flushPromises()
    expect(wrapper.find('.parquet-partition-note').exists()).toBe(false)
    wrapper.unmount()
  })
})
