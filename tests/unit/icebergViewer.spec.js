import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import IcebergViewer from '../../src/components/IcebergViewer.vue'
import en from '../../src/locales/en/texts.json'
import { loadIcebergRows, loadIcebergSnapshots } from '../../src/utils/iceberg'

vi.mock('../../src/utils/iceberg', () => ({ loadIcebergRows: vi.fn(), loadIcebergSnapshots: vi.fn() }))

const URL = 'https://example.com/wh/tbl/metadata/v1.metadata.json'

const icebergAsset = (key = 'iceberg', extra = {}) => ({
  getKey: () => key,
  href: URL,
  type: 'application/vnd.apache.iceberg+json',
  title: 'Test table',
  ...extra,
})

const tableData = (extra = {}) => ({
  columns: ['id', 'name'],
  rows: [[1n, 'a'], [2n, 'b']],
  loadedRows: 2,
  totalRows: 205915,
  geometryColumn: 'geom',
  bboxes: [[1, 2, 3, 4], null],
  crs: 'EPSG:4326',
  ...extra,
})

const viewer = (assets = [icebergAsset()]) => mount(IcebergViewer, {
  props: { assets },
  global: {
    plugins: [createI18n({ legacy: true, locale: 'en', messages: { en } })],
    stubs: {
      BCollapse: { template: '<div><slot /></div>' },
      BBadge: { template: '<span class="badge-stub"><slot /></span>' },
      // Tabs render every pane, so a test can read the one it is not on.
      BTabs: { template: '<div><slot /></div>' },
      BTab: { props: ['title'], template: '<div class="tab-stub" :data-title="title"><slot /></div>' },
      ParquetTable: {
        name: 'ParquetTable',
        props: ['columns', 'rows', 'totalRows', 'loadedRows', 'geometryColumn'],
        template: '<div class="table-stub" />',
      },
    },
  },
})

const snapshot = (id, extra = {}) => ({
  id, timestamp: new Date('2026-10-08T14:54:16.789Z'), operation: 'append', rows: 402756, files: 1, current: false, ...extra,
})

beforeEach(() => {
  loadIcebergSnapshots.mockResolvedValue({ snapshots: [], currentSnapshotId: null })
})

afterEach(() => vi.resetAllMocks())

describe('IcebergViewer', () => {
  it('renders nothing when no asset is a readable Iceberg table', async () => {
    const wrapper = viewer([
      { getKey: () => 'a', href: 'https://example.com/data.parquet' },
      icebergAsset('rest', { 'iceberg:catalog_type': 'rest' }),
    ])
    await flushPromises()

    expect(wrapper.find('section').exists()).toBe(false)
    expect(loadIcebergRows).not.toHaveBeenCalled()
  })

  it('loads the table by its metadata URL with the declared geometry and snapshot', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    viewer([icebergAsset('iceberg', {
      'table:primary_geometry': 'geom',
      'iceberg:current_snapshot_id': '42',
    })])
    await flushPromises()

    expect(loadIcebergRows).toHaveBeenCalledWith(URL, expect.objectContaining({
      geometryColumn: 'geom',
      snapshotId: '42',
      signal: expect.any(AbortSignal),
    }))
  })

  it('shows the rows in the table and counts them against the table size', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const wrapper = viewer()
    await flushPromises()

    const table = wrapper.findComponent({ name: 'ParquetTable' })
    expect(table.props()).toMatchObject({
      columns: ['id', 'name'],
      totalRows: 205915,
      loadedRows: 2,
      geometryColumn: 'geom',
    })
    expect(wrapper.find('.iceberg-meta-info').text()).toBe('2 / 205,915 rows')
  })

  it('omits the outstanding count when the table fits in the preview', async () => {
    loadIcebergRows.mockResolvedValue(tableData({ loadedRows: 2, totalRows: 2 }))
    const wrapper = viewer()
    await flushPromises()

    expect(wrapper.find('.iceberg-meta-info').text()).toBe('2 rows')
  })

  it('zooms the map to the clicked row with the geometry CRS', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const wrapper = viewer()
    await flushPromises()

    wrapper.findComponent({ name: 'ParquetTable' }).vm.$emit('zoom-to-feature', { origIndex: 0, bbox: null })

    expect(wrapper.emitted('zoom-to-bbox')).toEqual([[{ bbox: [1, 2, 3, 4], crs: 'EPSG:4326', crsDefinition: null }]])
  })

  it('does nothing when the clicked row has no geometry', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const wrapper = viewer()
    await flushPromises()
    const table = wrapper.findComponent({ name: 'ParquetTable' })

    table.vm.$emit('zoom-to-feature', { origIndex: 1, bbox: null })
    table.vm.$emit('select-row', { origIndex: 1, bbox: null })

    expect(wrapper.emitted('zoom-to-bbox')).toBeUndefined()
    expect(wrapper.emitted('highlight-bbox')).toBeUndefined()
  })

  it('highlights the selected row and ignores a deselect', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const wrapper = viewer()
    await flushPromises()
    const table = wrapper.findComponent({ name: 'ParquetTable' })

    table.vm.$emit('select-row', { origIndex: 0, bbox: null })
    table.vm.$emit('select-row', { origIndex: null, bbox: null })

    expect(wrapper.emitted('highlight-bbox')).toEqual([[{ bbox: [1, 2, 3, 4], crs: 'EPSG:4326', crsDefinition: null }]])
  })

  it('shows the failure and retries on request', async () => {
    loadIcebergRows.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(tableData())
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = viewer()
    await flushPromises()

    expect(wrapper.find('.iceberg-error').text()).toContain('Failed to load Iceberg data: boom')

    await wrapper.find('.iceberg-error button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.iceberg-error').exists()).toBe(false)
    expect(wrapper.findComponent({ name: 'ParquetTable' }).exists()).toBe(true)
  })

  it('names a cross-origin or network failure as such', async () => {
    loadIcebergRows.mockRejectedValue(new TypeError('Failed to fetch'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = viewer()
    await flushPromises()

    expect(wrapper.find('.iceberg-error').text()).toContain('cross-origin access not allowed or network error')
  })

  it('aborts the read when the viewer unmounts, without showing an error', async () => {
    let signal
    loadIcebergRows.mockImplementation((url, options) => {
      signal = options.signal
      return new Promise((resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(Object.assign(new Error('Aborted'), { name: 'AbortError' })))
      })
    })
    const wrapper = viewer()
    await flushPromises()
    wrapper.unmount()
    await flushPromises()

    expect(signal.aborted).toBe(true)
  })

  it('reloads for the asset the reader selects', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const second = { ...icebergAsset('second'), href: 'https://example.com/wh/other/metadata/v2.metadata.json' }
    const wrapper = viewer([icebergAsset('first'), second])
    await flushPromises()

    await wrapper.find('select').setValue('second')
    await flushPromises()

    expect(loadIcebergRows).toHaveBeenCalledTimes(2)
    expect(loadIcebergRows.mock.calls[1][0]).toBe('https://example.com/wh/other/metadata/v2.metadata.json')
  })

  describe('snapshots tab', () => {
    const rows = wrapper => wrapper.findAll('.iceberg-snapshots tbody tr')

    it('has a Data tab and a Snapshots tab', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.findAll('.tab-stub').map(t => t.attributes('data-title'))).toEqual(['Data', 'Snapshots'])
    })

    it('reads the snapshots from the selected table with an abort signal', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      viewer()
      await flushPromises()

      expect(loadIcebergSnapshots).toHaveBeenCalledWith(URL, { signal: expect.any(AbortSignal) })
    })

    it('lists committed time, snapshot, operation, rows and files', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('7301492987444415423', { current: true })],
        currentSnapshotId: '7301492987444415423',
      })
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.findAll('.iceberg-snapshots thead th').map(th => th.text()))
        .toEqual(['Committed', 'Snapshot', 'Operation', 'Rows', 'Files'])
      const cells = rows(wrapper)[0].findAll('td')
      expect(cells[0].text()).toBe('2026-10-08 14:54:16Z')
      expect(cells[1].find('code').text()).toBe('7301492987444415423')
      expect(cells[2].text()).toBe('append')
      expect(cells[3].text()).toBe('402,756')
      expect(cells[4].text()).toBe('1')
    })

    it('badges the table-current snapshot and the one the collection names', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('3', { current: true }), snapshot('2'), snapshot('1')],
        currentSnapshotId: '3',
      })
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '3' })])
      await flushPromises()

      const badges = rows(wrapper).map(r => r.findAll('.badge-stub').map(b => b.text()))
      expect(badges).toEqual([['table current', 'collection'], [], []])
      expect(wrapper.find('.iceberg-snapshots-note').exists()).toBe(false)
    })

    it('flags a collection that names a snapshot other than the current one', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('3', { current: true }), snapshot('2')],
        currentSnapshotId: '3',
      })
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '2' })])
      await flushPromises()

      expect(wrapper.find('.iceberg-snapshots-note').text())
        .toBe("The collection names snapshot 2, which is not the table's current snapshot.")
      expect(rows(wrapper)[1].findAll('.badge-stub').map(b => b.text())).toEqual(['collection'])
    })

    it('flags a collection that names a snapshot the table no longer has', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({ snapshots: [snapshot('3', { current: true })], currentSnapshotId: '3' })
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '99' })])
      await flushPromises()

      expect(wrapper.find('.iceberg-snapshots-note').exists()).toBe(true)
    })

    it('leaves a count cell empty when the writer recorded none', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('1', { rows: null, files: null, operation: null })],
        currentSnapshotId: null,
      })
      const wrapper = viewer()
      await flushPromises()

      const cells = rows(wrapper)[0].findAll('td')
      expect([cells[2].text(), cells[3].text(), cells[4].text()]).toEqual(['', '', ''])
    })

    it('says so when the table has no snapshots', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.text()).toContain('This table has no snapshots.')
      expect(wrapper.find('.iceberg-snapshots').exists()).toBe(false)
    })

    it('shows a snapshot failure without losing the data tab, and retries', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce({
        snapshots: [snapshot('1')], currentSnapshotId: null,
      })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.find('.iceberg-snapshots-error').text()).toContain('Failed to load Iceberg data: boom')
      expect(wrapper.findComponent({ name: 'ParquetTable' }).exists()).toBe(true)
      expect(wrapper.find('.iceberg-error').exists()).toBe(false)

      await wrapper.find('.iceberg-snapshots-error button').trigger('click')
      await flushPromises()

      expect(wrapper.find('.iceberg-snapshots-error').exists()).toBe(false)
      expect(rows(wrapper)).toHaveLength(1)
    })

    it('keeps the snapshots when the row read fails', async () => {
      loadIcebergRows.mockRejectedValue(new Error('rows failed'))
      loadIcebergSnapshots.mockResolvedValue({ snapshots: [snapshot('1')], currentSnapshotId: null })
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.find('.iceberg-error').exists()).toBe(true)
      expect(rows(wrapper)).toHaveLength(1)
    })

    it('aborts the snapshot read when the viewer unmounts', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      let signal
      loadIcebergSnapshots.mockImplementation((url, options) => {
        signal = options.signal
        return new Promise(() => {})
      })
      const wrapper = viewer()
      await flushPromises()
      wrapper.unmount()

      expect(signal.aborted).toBe(true)
    })

    it('reloads the snapshots for the asset the reader selects', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const second = { ...icebergAsset('second'), href: 'https://example.com/wh/other/metadata/v2.metadata.json' }
      const wrapper = viewer([icebergAsset('first'), second])
      await flushPromises()

      await wrapper.find('select').setValue('second')
      await flushPromises()

      expect(loadIcebergSnapshots).toHaveBeenCalledTimes(2)
      expect(loadIcebergSnapshots.mock.calls[1][0]).toBe('https://example.com/wh/other/metadata/v2.metadata.json')
    })
  })
})
