import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ParquetViewer from '../../src/components/ParquetViewer.vue'
import IcebergViewer from '../../src/components/IcebergViewer.vue'
import en from '../../src/locales/en/texts.json'
import es from '../../src/locales/es/texts.json'

// Neither viewer needs data here. The titles come from the assets alone, so the
// loaders stay pending and the viewers stay in their loading state.
vi.mock('../../src/utils/parquet', () => ({
  createPartitionPlaceholder: vi.fn(),
  findParquetAssets: assets => assets.filter(a => /\.parquet/.test(a.href)),
  loadParquetMetadata: vi.fn(() => new Promise(() => {})),
  loadParquetRows: vi.fn(),
  getBboxForRow: vi.fn(),
  GLOB_UNRESOLVED: 'globUnresolved',
  isLoadableParquetAsset: a => /\.parquet/.test(a.href),
  isParquetAsset: a => /\.parquet/.test(a.href),
  isPartitionPlaceholder: () => false,
  readMirrorRowTotal: vi.fn(),
  resolveParquetGlob: vi.fn(a => Promise.resolve({ url: a.href, partition: null })),
  MAX_ROWS: 10000,
}))
vi.mock('../../src/utils/iceberg', () => ({
  loadIcebergRows: vi.fn(() => new Promise(() => {})),
  loadIcebergSnapshots: vi.fn(() => new Promise(() => {})),
}))

const parquet = { getKey: () => 'data', href: 'https://example.com/data.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] }
const iceberg = {
  getKey: () => 'iceberg',
  href: 'https://example.com/wh/tbl/metadata/v1.metadata.json',
  type: 'application/vnd.apache.iceberg+json',
  roles: ['metadata'],
}
// A table whose metadata file a browser cannot fetch gets no Iceberg preview.
const unreachableIceberg = { ...iceberg, href: 's3://bucket/tbl/metadata/v1.metadata.json' }

const mountViewer = async (component, assets, locale = 'en') => {
  const wrapper = mount(component, {
    props: { assets },
    global: {
      plugins: [createI18n({ legacy: true, locale, fallbackLocale: 'en', messages: { en, es } })],
      stubs: {
        BCollapse: { template: '<div><slot /></div>' },
        BBadge: { template: '<span><slot /></span>' },
        BTabs: { template: '<div><slot /></div>' },
        BTab: { template: '<div><slot /></div>' },
        ParquetTable: true,
      },
    },
  })
  await flushPromises()
  return wrapper
}
const parquetTitle = async (assets, locale) => (await mountViewer(ParquetViewer, assets, locale)).find('.parquet-title').text()
const icebergTitle = async (assets, locale) => (await mountViewer(IcebergViewer, assets, locale)).find('.iceberg-title').text()

afterEach(() => vi.clearAllMocks())

describe('data preview titles', () => {
  it('keeps the plain title for a Parquet preview on its own', async () => {
    expect(await parquetTitle([parquet])).toBe('Data Preview')
  })

  it('keeps the plain title for an Iceberg preview on its own', async () => {
    expect(await icebergTitle([iceberg])).toBe('Data Preview')
  })

  it('names the format of the Parquet preview when an Iceberg preview is beside it', async () => {
    expect(await parquetTitle([parquet, iceberg])).toBe('Parquet data preview')
  })

  it('names the format of the Iceberg preview when a Parquet preview is beside it', async () => {
    expect(await icebergTitle([parquet, iceberg])).toBe('Iceberg data preview')
  })

  it('tells the two previews of one collection apart', async () => {
    const assets = [parquet, iceberg]

    expect(await parquetTitle(assets)).not.toBe(await icebergTitle(assets))
  })

  it('keeps the plain Parquet title when the Iceberg table has no preview of its own', async () => {
    expect(await parquetTitle([parquet, unreachableIceberg])).toBe('Data Preview')
  })

  it('counts a Parquet asset that names many files as a Parquet preview', async () => {
    const glob = { ...parquet, href: 'https://example.com/zone=*/part.parquet' }

    expect(await icebergTitle([glob, iceberg])).toBe('Iceberg data preview')
  })

  it('reads in Spanish too', async () => {
    expect(await parquetTitle([parquet, iceberg], 'es')).toBe('Vista previa de datos Parquet')
    expect(await icebergTitle([parquet, iceberg], 'es')).toBe('Vista previa de datos Iceberg')
    expect(await parquetTitle([parquet], 'es')).toBe('Vista previa de datos')
  })
})
