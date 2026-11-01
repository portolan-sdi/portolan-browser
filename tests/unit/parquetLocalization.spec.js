import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import ParquetViewer from '../../src/components/ParquetViewer.vue'
import ParquetTable from '../../src/components/ParquetTable.vue'
import en from '../../src/locales/en/texts.json'
import es from '../../src/locales/es/texts.json'
import { loadParquetMetadata, loadParquetRows } from '../../src/utils/parquet'

vi.mock('../../src/utils/parquet', () => ({
  findParquetAssets: assets => assets,
  loadParquetMetadata: vi.fn(),
  loadParquetRows: vi.fn(),
  getBboxForRow: vi.fn(),
  MAX_ROWS: 10000,
}))

const localization = () => createI18n({
  legacy: true,
  locale: 'es',
  fallbackLocale: 'en',
  messages: { en, es },
})

const missingKeys = (reference, translated, path = []) =>
  Object.entries(reference).flatMap(([key, value]) => {
    const next = [...path, key]
    if (!Object.hasOwn(translated ?? {}, key)) {return [next.join('.')];}
    return typeof value === 'object'
      ? missingKeys(value, translated[key], next)
      : translated[key] ? [] : [next.join('.')]
  })

const deferred = () => {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

const viewer = (assets = []) => mount(ParquetViewer, {
  props: { assets },
  global: {
    plugins: [localization()],
    stubs: {
      BCollapse: { template: '<div><slot /></div>' },
      BBadge: { template: '<span><slot /></span>' },
      ParquetTable: true,
    },
  },
})

const asset = {
  getKey: () => 'data',
  getAbsoluteUrl: () => 'https://example.test/data.parquet',
}

afterEach(() => vi.resetAllMocks())

describe('Spanish GeoParquet localization', () => {
  it('defines every English text key without relying on fallback', () => {
    expect(missingKeys(en, es)).toEqual([])
  })

  it.each([[0, '0 filas'], [1, '1 fila'], [2, '2 filas']])(
    'translates row counts for %i rows', async (count, label) => {
      const wrapper = viewer()
      await wrapper.setData({ tableData: { totalRows: count, loadedRows: count } })
      expect(wrapper.vm.rowInfo).toBe(label)
      wrapper.unmount()
    }
  )

  it('translates and formats partial row counts in the selected locale', async () => {
    const wrapper = viewer()
    await wrapper.setData({ tableData: { totalRows: 25000, loadedRows: 10000 } })
    expect(wrapper.vm.rowInfo).toBe('10.000 / 25.000 filas')
    wrapper.unmount()
  })

  it('translates table controls, row counts, pagination and zoom labels', () => {
    const wrapper = mount(ParquetTable, {
      props: {
        columns: ['id', 'geometry'],
        rows: Array.from({ length: 101 }, (_, i) => [i, null]),
        totalRows: 25000,
        loadedRows: 101,
        geometryColumn: 'geometry',
      },
      global: { plugins: [localization()] },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Filtrar filas...')
    expect(wrapper.find('select option').text()).toBe('Todas las columnas')
    expect(wrapper.find('.parquet-row-count').text()).toBe('Mostrando las primeras 101 de 25.000 filas')
    expect(wrapper.find('.parquet-page-info').text()).toBe('Filas 1–100 de 101')
    expect(wrapper.find('.parquet-zoom-btn').attributes('title')).toBe('Acercar a la entidad')
    expect(wrapper.text()).not.toMatch(/rows|columns|First|Previous|Next|Last/)
    wrapper.unmount()
  })

  it('translates metadata and row loading messages', async () => {
    const metadata = deferred()
    const rows = deferred()
    loadParquetMetadata.mockReturnValueOnce(metadata.promise)
    loadParquetRows.mockReturnValueOnce(rows.promise)
    const wrapper = viewer([asset])
    expect(wrapper.text()).toContain('Vista previa de datos')
    expect(wrapper.text()).toContain('Cargando metadatos...')
    metadata.resolve({ totalRows: 25000, columnNames: ['id'], file: {}, metadata: {} })
    await flushPromises()
    expect(wrapper.text()).toContain('Cargando filas (10.000)...')
    rows.resolve({ columns: ['id'], rows: [[1]], totalRows: 25000, loadedRows: 1 })
    await flushPromises()
    expect(wrapper.vm.loading).toBe(false)
    wrapper.unmount()
  })

  it.each([
    ['Failed to fetch', 'No se puede mostrar la vista previa:'],
    ['invalid footer', 'No se pudieron cargar los datos parquet: invalid footer'],
  ])('translates errors and retry controls for %s', async (message, translated) => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    loadParquetMetadata.mockRejectedValueOnce(new Error(message))
    const wrapper = viewer([asset])
    await flushPromises()
    expect(wrapper.find('.parquet-error').text()).toContain(translated)
    expect(wrapper.find('.parquet-error button').text()).toBe('Reintentar')
    wrapper.unmount()
    vi.restoreAllMocks()
  })
})
