import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ParquetViewer from '../../src/components/ParquetViewer.vue'
import en from '../../src/locales/en/texts.json'
import { loadParquetMetadata, loadParquetRows, resolveParquetGlob } from '../../src/utils/parquet'

vi.mock('../../src/utils/parquet', () => ({
  findParquetAssets: assets => assets,
  loadParquetMetadata: vi.fn(),
  loadParquetRows: vi.fn(),
  getBboxForRow: vi.fn(),
  GLOB_UNRESOLVED: 'globUnresolved',
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
      ParquetTable: true,
    },
  },
})

const globAsset = {
  getKey: () => 'data',
  getAbsoluteUrl: () => GLOB_HREF,
}

const tableLoads = () => {
  loadParquetMetadata.mockResolvedValue({
    file: {}, metadata: {}, columnNames: ['id'], totalRows: 6311,
    geometryColumn: 'geometry', bboxMapping: null, crs: null, crsDefinition: null,
  })
  loadParquetRows.mockResolvedValue({
    columns: ['id'], rows: [[1]], totalRows: 6311, loadedRows: 6311,
  })
}

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
      url: PARTITION_HREF, partition: { title: 'UTM zone 1', count: 54 },
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
      url: PARTITION_HREF, partition: { title: 'UTM zone 1', count: 54 },
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
      url: PARTITION_HREF, partition: { title: 'UTM zone 1', count: 1 },
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

  it('clears the note when the selected asset changes', async () => {
    resolveParquetGlob.mockResolvedValue({
      url: PARTITION_HREF, partition: { title: 'UTM zone 1', count: 54 },
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
