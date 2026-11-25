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
  fields: [
    { name: 'geom', type: 'geometry' },
    { name: 'id', type: 'long' },
    { name: 'name', type: 'string' },
  ],
  rows: [[1n, 'a'], [2n, 'b']],
  offset: 0,
  loadedRows: 2,
  totalRows: 205915,
  totalKnown: true,
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
      icebergAsset('private', { href: 's3://bucket/tbl/metadata/v1.metadata.json' }),
    ])
    await flushPromises()

    expect(wrapper.find('section').exists()).toBe(false)
    expect(loadIcebergRows).not.toHaveBeenCalled()
  })

  it('shows a table that sits in a REST catalog, because it reads the files and not the catalog', async () => {
    loadIcebergRows.mockResolvedValue(tableData())
    const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:catalog_type': 'rest', 'iceberg:authorization_type': 'oauth2' })])
    await flushPromises()

    expect(wrapper.find('section').exists()).toBe(true)
    expect(loadIcebergRows).toHaveBeenCalledWith(URL, expect.anything())
    expect(wrapper.findComponent({ name: 'ParquetTable' }).exists()).toBe(true)
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
    // A full page: the table holds more rows than the page shows.
    loadIcebergRows.mockResolvedValue(tableData({ loadedRows: 1000 }))
    const wrapper = viewer()
    await flushPromises()

    const table = wrapper.findComponent({ name: 'ParquetTable' })
    // The table counts the rows on its page. The header counts against the table.
    expect(table.props()).toMatchObject({
      columns: ['id', 'name'],
      totalRows: 1000,
      loadedRows: 1000,
      geometryColumn: 'geom',
    })
    expect(wrapper.find('.iceberg-meta-info').text()).toBe('Rows 1–1,000 of 205,915')
  })

  it('omits the outstanding count when the table fits in the preview', async () => {
    loadIcebergRows.mockResolvedValue(tableData({ loadedRows: 2, totalRows: 2 }))
    const wrapper = viewer()
    await flushPromises()

    expect(wrapper.find('.iceberg-meta-info').text()).toBe('2 rows')
    expect(wrapper.find('.iceberg-pager').exists()).toBe(false)
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

    it('has a Data tab, a Snapshots tab and a Query tab', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.findAll('.tab-stub').map(t => t.attributes('data-title'))).toEqual(['Data', 'Snapshots', 'Query'])
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
        .toEqual(['Committed', 'Snapshot', 'Operation', 'Rows', 'Files', ''])
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

    it('has a Query button on every snapshot', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('3', { current: true }), snapshot('2'), snapshot('1')], currentSnapshotId: '3',
      })
      const wrapper = viewer()
      await flushPromises()

      const buttons = wrapper.findAll('.iceberg-snapshots .iceberg-snapshot-query')
      expect(buttons).toHaveLength(3)
      expect(buttons.map(b => b.text())).toEqual(['Query', 'Query', 'Query'])
    })

    it('opens the Query tab with that snapshot chosen in the drop-down', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('3', { current: true }), snapshot('2'), snapshot('1')], currentSnapshotId: '3',
      })
      const wrapper = viewer()
      await flushPromises()
      expect(wrapper.find('.iceberg-snapshot-select').element.value).toBe('3')

      await wrapper.findAll('.iceberg-snapshot-query')[2].trigger('click')

      expect(wrapper.vm.activeTab).toBe('iceberg-tab-query')
      expect(wrapper.find('.iceberg-snapshot-select').element.value).toBe('1')
    })

    it('reads nothing until the reader runs the query', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({ snapshots: [snapshot('3', { current: true }), snapshot('1')], currentSnapshotId: '3' })
      const wrapper = viewer()
      await flushPromises()

      await wrapper.findAll('.iceberg-snapshot-query')[1].trigger('click')
      await flushPromises()

      expect(loadIcebergRows).toHaveBeenCalledTimes(1)
      expect(wrapper.emitted('page-change')).toHaveLength(1)
    })

    it('runs the chosen snapshot with a condition the reader adds', async () => {
      loadIcebergRows.mockResolvedValue(tableData({ loadedRows: 1000, totalRows: 205915 }))
      loadIcebergSnapshots.mockResolvedValue({ snapshots: [snapshot('3', { current: true }), snapshot('1')], currentSnapshotId: '3' })
      const wrapper = viewer()
      await flushPromises()
      await wrapper.findAll('.iceberg-snapshot-query')[1].trigger('click')

      await wrapper.find('.iceberg-query-input').setValue('id > 1')
      await wrapper.find('.iceberg-run').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ snapshotId: '1', where: 'id > 1' })
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: 'id > 1', snapshotId: '1' }])
    })

    it('puts the snapshot of the Query button in the drop-down even after another was chosen', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue({
        snapshots: [snapshot('3', { current: true }), snapshot('2'), snapshot('1')], currentSnapshotId: '3',
      })
      const wrapper = viewer()
      await flushPromises()
      await wrapper.find('.iceberg-snapshot-select').setValue('2')

      await wrapper.findAll('.iceberg-snapshot-query')[2].trigger('click')

      expect(wrapper.find('.iceberg-snapshot-select').element.value).toBe('1')
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

  describe('paging through the table', () => {
    const page = (offset, extra = {}) => tableData({
      offset, loadedRows: 1000, totalRows: 205915, rows: [[BigInt(offset), 'a']], bboxes: [null], ...extra,
    })
    const button = (wrapper, name) => wrapper.find(`.iceberg-${name}`)

    it('offers the next 1,000 rows and no previous page on page one', async () => {
      loadIcebergRows.mockResolvedValue(page(0))
      const wrapper = viewer()
      await flushPromises()

      expect(button(wrapper, 'next').text()).toBe('Next 1,000 rows')
      expect(button(wrapper, 'next').attributes('disabled')).toBeUndefined()
      expect(button(wrapper, 'previous').text()).toBe('Previous 1,000 rows')
      expect(button(wrapper, 'previous').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.iceberg-pager-info').text()).toBe('Rows 1–1,000 of 205,915')
    })

    it('loads the next page by offset, with the same snapshot and geometry options', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockResolvedValueOnce(page(1000))
      const wrapper = viewer([icebergAsset('iceberg', {
        'table:primary_geometry': 'geom', 'iceberg:current_snapshot_id': '42',
      })])
      await flushPromises()

      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(loadIcebergRows).toHaveBeenCalledTimes(2)
      expect(loadIcebergRows.mock.calls[1][1]).toMatchObject({
        offset: 1000, geometryColumn: 'geom', snapshotId: '42',
      })
      expect(wrapper.find('.iceberg-pager-info').text()).toBe('Rows 1,001–2,000 of 205,915')
      expect(wrapper.find('.iceberg-meta-info').text()).toBe('Rows 1,001–2,000 of 205,915')
    })

    it('tells the map which page the table shows, once the rows are loaded', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockResolvedValueOnce(page(1000)).mockResolvedValueOnce(page(0))
      const wrapper = viewer()
      await flushPromises()
      expect(wrapper.emitted('page-change')).toEqual([[{ offset: 0, where: '', snapshotId: '' }]])

      await button(wrapper, 'next').trigger('click')
      await flushPromises()
      await button(wrapper, 'previous').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('page-change')).toEqual([
        [{ offset: 0, where: '', snapshotId: '' }], [{ offset: 1000, where: '', snapshotId: '' }], [{ offset: 0, where: '', snapshotId: '' }],
      ])
    })

    it('does not move the map to a page that failed to load', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockRejectedValueOnce(new Error('page failed'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('page-change')).toEqual([[{ offset: 0, where: '', snapshotId: '' }]])
    })

    it('goes back a page', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockResolvedValueOnce(page(1000)).mockResolvedValueOnce(page(0))
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      await button(wrapper, 'previous').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.map(c => c[1].offset)).toEqual([0, 1000, 0])
    })

    it('shows the rows of the new page in the table', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockResolvedValueOnce(page(1000, { rows: [[1000n, 'z']] }))
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(wrapper.findComponent({ name: 'ParquetTable' }).props('rows')).toEqual([[1000n, 'z']])
    })

    it('stops offering next on the last page, a short page', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockResolvedValueOnce(page(205000, { loadedRows: 915 }))
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(button(wrapper, 'next').attributes('disabled')).toBeDefined()
      expect(button(wrapper, 'previous').attributes('disabled')).toBeUndefined()
      expect(wrapper.find('.iceberg-pager-info').text()).toBe('Rows 205,001–205,915 of 205,915')
    })

    it('stops at the table size when a full page ends exactly on it', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0, { totalRows: 2000 }))
        .mockResolvedValueOnce(page(1000, { totalRows: 2000 }))
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(button(wrapper, 'next').attributes('disabled')).toBeDefined()
    })

    it('offers next after a full page when the table size is unknown, and shows no total', async () => {
      loadIcebergRows.mockResolvedValue(page(0, { totalKnown: false, totalRows: 1000 }))
      const wrapper = viewer()
      await flushPromises()

      expect(button(wrapper, 'next').attributes('disabled')).toBeUndefined()
      expect(wrapper.find('.iceberg-pager-info').text()).toBe('Rows 1–1,000')
    })

    it('shows no pager for a table that fits on one page', async () => {
      loadIcebergRows.mockResolvedValue(tableData({ loadedRows: 40, totalRows: 40 }))
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.find('.iceberg-pager').exists()).toBe(false)
    })

    it('keeps the pager when a page fails, so the reader can go back', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockRejectedValueOnce(new Error('page failed'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(wrapper.find('.iceberg-error').text()).toContain('page failed')
      expect(button(wrapper, 'previous').attributes('disabled')).toBeUndefined()
    })

    it('retries the page that failed, not page one', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0)).mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(page(1000))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      await wrapper.find('.iceberg-error button').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.map(c => c[1].offset)).toEqual([0, 1000, 1000])
    })

    it('starts the next table on its first page', async () => {
      loadIcebergRows.mockResolvedValue(page(0))
      const second = { ...icebergAsset('second'), href: 'https://example.com/wh/other/metadata/v2.metadata.json' }
      const wrapper = viewer([icebergAsset('first'), second])
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      await wrapper.find('select').setValue('second')
      await flushPromises()

      const last = loadIcebergRows.mock.calls.at(-1)
      expect(last[0]).toBe('https://example.com/wh/other/metadata/v2.metadata.json')
      expect(last[1].offset).toBe(0)
    })

    it('does not page while a page is loading', async () => {
      loadIcebergRows.mockResolvedValueOnce(page(0))
      const wrapper = viewer()
      await flushPromises()
      loadIcebergRows.mockImplementation(() => new Promise(() => {}))

      await button(wrapper, 'next').trigger('click')
      await flushPromises()
      await button(wrapper, 'next').trigger('click')
      await flushPromises()

      expect(loadIcebergRows).toHaveBeenCalledTimes(2)
    })
  })

  describe('query tab', () => {
    const run = async (wrapper, text) => {
      await wrapper.find('.iceberg-query-input').setValue(text)
      await wrapper.find('.iceberg-run').trigger('click')
      await flushPromises()
    }
    const firstPage = (extra = {}) => tableData({ loadedRows: 1000, totalRows: 205915, ...extra })

    const columnRows = wrapper => wrapper.findAll('.iceberg-columns tbody tr')
      .map(row => row.findAll('td').map(cell => cell.text()))

    it('lists the columns and their types in a table, the geometry column included', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      expect(wrapper.findAll('.iceberg-columns thead th').map(th => th.text())).toEqual(['Name', 'Type'])
      expect(columnRows(wrapper)).toEqual([['geom', 'geometry'], ['id', 'long'], ['name', 'string']])
    })

    it('puts each name and each type in a cell of its own, so one can be selected alone', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      const cells = wrapper.findAll('.iceberg-columns tbody td')
      expect(cells).toHaveLength(6)
      expect(cells[0].classes()).toContain('iceberg-column-name')
      expect(cells[1].classes()).toContain('iceberg-column-type')
      expect(cells.every(cell => cell.element.children.length === 0)).toBe(true)
    })

    it('puts the hint on the same line as the label at the top', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      const heading = wrapper.find('.iceberg-query-heading')
      expect(heading.find('label').text()).toBe('Filter rows with SQL')
      expect(heading.find('.iceberg-query-help').text())
        .toBe('Write the condition that follows WHERE and the table and the map will show the rows that match.')
      // One copy of the hint, not one at the top and one under the box.
      expect(wrapper.findAll('.iceberg-query-help')).toHaveLength(1)
    })

    it('reads as the one brief block of documentation beside the label', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      // A browser shows a run of spaces as one, so compare it that way.
      expect(wrapper.find('.iceberg-query-docs').text().replace(/\s+/g, ' ')).toBe(
        'Write the condition that follows WHERE and the table and the map will show the rows that match. '
        + 'The query adds LIMIT 1000; use the page buttons under the table to see more rows.'
      )
    })

    it('says that the query adds the LIMIT, and where to see more rows', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = viewer()
      await flushPromises()

      // The limit note sits with the other documentation, above the box.
      expect(wrapper.find('.iceberg-query-heading .iceberg-query-docs .iceberg-query-limit').exists()).toBe(true)
      expect(wrapper.findAll('.iceberg-query-limit')).toHaveLength(1)
      expect(wrapper.find('.iceberg-query-limit').text())
        .toBe('The query adds LIMIT 1000; use the page buttons under the table to see more rows.')
    })

    it('runs the typed condition and reloads from the first page', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const wrapper = viewer()
      await flushPromises()

      await run(wrapper, "  name = 'a'  ")

      expect(loadIcebergRows).toHaveBeenCalledTimes(2)
      expect(loadIcebergRows.mock.calls[1][1]).toMatchObject({ where: "name = 'a'", offset: 0 })
    })

    it('tells the map which rows to draw, the page and the condition', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockResolvedValueOnce(firstPage({ totalKnown: false, totalRows: 3 }))
      const wrapper = viewer()
      await flushPromises()

      await run(wrapper, "name = 'a'")

      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: "name = 'a'", snapshotId: '' }])
    })

    it('shows the results in the Data tab and names the filter above the table', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockResolvedValueOnce(tableData({ loadedRows: 2, totalRows: 2, totalKnown: false }))
      const wrapper = viewer()
      await flushPromises()
      expect(wrapper.find('.iceberg-filter').exists()).toBe(false)

      await run(wrapper, "name = 'a'")

      expect(wrapper.vm.activeTab).toBe('iceberg-tab-data')
      expect(wrapper.find('.iceberg-filter').text()).toContain("Filtered by name = 'a'")
    })

    it('runs on Ctrl+Enter in the box', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const wrapper = viewer()
      await flushPromises()

      await wrapper.find('.iceberg-query-input').setValue('id > 5')
      await wrapper.find('.iceberg-query-input').trigger('keydown', { key: 'Enter', ctrlKey: true })
      await flushPromises()

      expect(loadIcebergRows.mock.calls[1][1].where).toBe('id > 5')
    })

    it('keeps the filter when the reader pages', async () => {
      loadIcebergRows.mockResolvedValue(firstPage({ totalKnown: false }))
      const wrapper = viewer()
      await flushPromises()
      await run(wrapper, "name = 'a'")

      await wrapper.find('.iceberg-next').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ where: "name = 'a'", offset: 1000 })
    })

    it('goes back to the first page when the condition changes', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const wrapper = viewer()
      await flushPromises()
      await wrapper.find('.iceberg-next').trigger('click')
      await flushPromises()

      await run(wrapper, "name = 'b'")

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ where: "name = 'b'", offset: 0 })
    })

    it('shows an invalid query\'s message in the Query tab and keeps the map where it was', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockRejectedValueOnce(new Error('Prepared source schema does not contain column "nosuch"'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()

      await run(wrapper, 'nosuch = 1')

      expect(wrapper.find('.iceberg-query-error').text()).toContain('does not contain column "nosuch"')
      // The map was told about page one only. The failed query did not move it.
      expect(wrapper.emitted('page-change')).toHaveLength(1)
    })

    it('hides the query error once a query runs', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockRejectedValueOnce(new Error('bad')).mockResolvedValueOnce(firstPage())
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()
      await run(wrapper, 'bad')

      await run(wrapper, 'id > 1')

      expect(wrapper.find('.iceberg-query-error').exists()).toBe(false)
    })

    it('clears the filter from the Data tab and reloads the whole table', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const wrapper = viewer()
      await flushPromises()
      await run(wrapper, "name = 'a'")

      await wrapper.find('.iceberg-filter-clear').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ where: '', offset: 0 })
      expect(wrapper.find('.iceberg-filter').exists()).toBe(false)
      expect(wrapper.find('.iceberg-query-input').element.value).toBe('')
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: '', snapshotId: '' }])
    })

    it('treats an empty condition as no filter', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const wrapper = viewer()
      await flushPromises()

      await run(wrapper, '   ')

      expect(loadIcebergRows.mock.calls[1][1].where).toBe('')
      expect(wrapper.find('.iceberg-filter').exists()).toBe(false)
    })

    it('does not run a second query while one is loading', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage())
      const wrapper = viewer()
      await flushPromises()
      loadIcebergRows.mockImplementation(() => new Promise(() => {}))

      await run(wrapper, 'id > 1')
      await run(wrapper, 'id > 2')

      expect(loadIcebergRows).toHaveBeenCalledTimes(2)
    })

    it('starts the next table with no filter and an empty box', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      const second = { ...icebergAsset('second'), href: 'https://example.com/wh/other/metadata/v2.metadata.json' }
      const wrapper = viewer([icebergAsset('first'), second])
      await flushPromises()
      await run(wrapper, "name = 'a'")

      await wrapper.find('select').setValue('second')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ where: '', offset: 0 })
      expect(wrapper.find('.iceberg-query-input').element.value).toBe('')
    })

    it('keeps the column hint after a failed query', async () => {
      loadIcebergRows.mockResolvedValueOnce(tableData()).mockRejectedValueOnce(new Error('bad'))
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()

      await run(wrapper, 'bad')

      expect(columnRows(wrapper)).toHaveLength(3)
    })
  })

  describe('snapshot drop-down in the query tab', () => {
    const snap = (id, ms, extra = {}) => snapshot(id, { timestamp: new Date(ms), ...extra })
    const threeSnapshots = () => ({
      snapshots: [
        snap('3', Date.UTC(2026, 9, 8, 14, 54, 16), { current: true }),
        snap('2', Date.UTC(2026, 9, 7, 9, 0, 0)),
        snap('1', Date.UTC(2026, 9, 6, 8, 30, 5)),
      ],
      currentSnapshotId: '3',
    })
    const firstPage = (extra = {}) => tableData({ loadedRows: 1000, totalRows: 205915, ...extra })
    const select = wrapper => wrapper.find('.iceberg-snapshot-select')
    const optionTexts = wrapper => select(wrapper).findAll('option').map(o => o.text())
    const runWith = async (wrapper, snapshotId, clause = '') => {
      await select(wrapper).setValue(snapshotId)
      await wrapper.find('.iceberg-query-input').setValue(clause)
      await wrapper.find('.iceberg-run').trigger('click')
      await flushPromises()
    }

    it('sits above the SQL box and lists every snapshot, newest first', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      const children = [...wrapper.find('.iceberg-query').element.children].map(c => c.className)
      expect(children.indexOf('iceberg-query-snapshot')).toBeLessThan(children.indexOf('iceberg-query-heading'))
      expect(wrapper.find('.iceberg-query-snapshot label').text()).toBe('Snapshot')
      expect(optionTexts(wrapper)).toEqual([
        '2026-10-08 14:54:16Z · 3 (table current)',
        '2026-10-07 09:00:00Z · 2',
        '2026-10-06 08:30:05Z · 1',
      ])
    })

    it('starts on the table\'s current snapshot', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      expect(select(wrapper).element.value).toBe('3')
    })

    it('starts on the snapshot the collection names, and tags it', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '2' })])
      await flushPromises()

      expect(select(wrapper).element.value).toBe('2')
      expect(optionTexts(wrapper)[1]).toBe('2026-10-07 09:00:00Z · 2 (collection)')
    })

    it('tags a snapshot that is both the table\'s current one and the collection\'s', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '3' })])
      await flushPromises()

      expect(optionTexts(wrapper)[0]).toBe('2026-10-08 14:54:16Z · 3 (table current, collection)')
    })

    it('falls back to the current snapshot when the collection names one the table lacks', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '99' })])
      await flushPromises()

      expect(select(wrapper).element.value).toBe('3')
    })

    it('is disabled until the snapshots are known, and when there are none', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      let release
      loadIcebergSnapshots.mockReturnValue(new Promise(resolve => { release = resolve }))
      const wrapper = viewer()
      await flushPromises()
      expect(select(wrapper).attributes('disabled')).toBeDefined()

      release({ snapshots: [], currentSnapshotId: null })
      await flushPromises()
      expect(select(wrapper).attributes('disabled')).toBeDefined()
      expect(optionTexts(wrapper)).toEqual([])
    })

    it('reads the chosen snapshot, and tells the map to draw it', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      await runWith(wrapper, '1')

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ snapshotId: '1', offset: 0, where: '' })
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: '', snapshotId: '1' }])
    })

    it('applies the snapshot together with the condition', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      await runWith(wrapper, '2', "name = 'a'")

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ snapshotId: '2', where: "name = 'a'" })
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: "name = 'a'", snapshotId: '2' }])
    })

    it('reads nothing new until the query runs', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      await select(wrapper).setValue('1')
      await flushPromises()

      expect(loadIcebergRows).toHaveBeenCalledTimes(1)
    })

    it('leaves the default snapshot to the loader, so the collection\'s pin still applies', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer([icebergAsset('iceberg', { 'iceberg:current_snapshot_id': '2' })])
      await flushPromises()

      // The drop-down already shows the default snapshot, so a run leaves it alone.
      await wrapper.find('.iceberg-query-input').setValue('id > 1')
      await wrapper.find('.iceberg-run').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1].snapshotId).toBe('2')
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: 'id > 1', snapshotId: '' }])
      expect(wrapper.find('.iceberg-filter-snapshot').exists()).toBe(false)
    })

    it('names a snapshot that is not the default above the table', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      await runWith(wrapper, '1')

      expect(wrapper.find('.iceberg-filter-snapshot').text()).toBe('Snapshot 1')
      expect(wrapper.find('.iceberg-filter-where').exists()).toBe(false)
    })

    it('keeps the snapshot when the reader pages', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()
      await runWith(wrapper, '1')

      await wrapper.find('.iceberg-next').trigger('click')
      await flushPromises()

      expect(loadIcebergRows.mock.calls.at(-1)[1]).toMatchObject({ snapshotId: '1', offset: 1000 })
    })

    it('counts the pages against the snapshot\'s own size', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockResolvedValueOnce(firstPage({ totalRows: 4000 }))
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()

      await runWith(wrapper, '1')

      expect(wrapper.find('.iceberg-pager-info').text()).toBe('Rows 1–1,000 of 4,000')
    })

    it('clears the snapshot, the condition and the box in one step', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()
      await runWith(wrapper, '1', "name = 'a'")

      await wrapper.find('.iceberg-filter-clear').trigger('click')
      await flushPromises()

      expect(select(wrapper).element.value).toBe('3')
      expect(wrapper.find('.iceberg-query-input').element.value).toBe('')
      expect(wrapper.find('.iceberg-filter').exists()).toBe(false)
      expect(wrapper.emitted('page-change').at(-1)).toEqual([{ offset: 0, where: '', snapshotId: '' }])
    })

    it('offers Clear when the drop-down was changed and nothing has run', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = viewer()
      await flushPromises()
      expect(wrapper.find('.iceberg-clear').exists()).toBe(false)

      await select(wrapper).setValue('1')
      expect(wrapper.find('.iceberg-clear').exists()).toBe(true)

      await wrapper.find('.iceberg-clear').trigger('click')
      expect(select(wrapper).element.value).toBe('3')
      // Nothing had run, so Clear read nothing.
      expect(loadIcebergRows).toHaveBeenCalledTimes(1)
    })

    it('starts the next table on its own default snapshot', async () => {
      loadIcebergRows.mockResolvedValue(firstPage())
      loadIcebergSnapshots.mockResolvedValueOnce(threeSnapshots()).mockResolvedValueOnce({
        snapshots: [snap('9', Date.UTC(2026, 10, 1), { current: true })], currentSnapshotId: '9',
      })
      const second = { ...icebergAsset('second'), href: 'https://example.com/wh/other/metadata/v2.metadata.json' }
      const wrapper = viewer([icebergAsset('first'), second])
      await flushPromises()
      await runWith(wrapper, '1')

      await wrapper.find('select:not(.iceberg-snapshot-select)').setValue('second')
      await flushPromises()

      expect(select(wrapper).element.value).toBe('9')
      expect(loadIcebergRows.mock.calls.at(-1)[1].snapshotId).toBeUndefined()
      expect(wrapper.find('.iceberg-filter').exists()).toBe(false)
    })

    it('shows a failed snapshot read in the query tab and keeps the map where it was', async () => {
      loadIcebergRows.mockResolvedValueOnce(firstPage()).mockRejectedValueOnce(new Error('snapshot gone'))
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      vi.spyOn(console, 'error').mockImplementation(() => {})
      const wrapper = viewer()
      await flushPromises()

      await runWith(wrapper, '1')

      expect(wrapper.find('.iceberg-query-error').text()).toContain('snapshot gone')
      expect(wrapper.emitted('page-change')).toHaveLength(1)
    })
  })

  // These mount the real tab group, not the stub the tests above use. A stub
  // cannot tell a tab id from a number, and the real group can.
  describe('with the real tab group', () => {
    const realViewer = (assets = [icebergAsset()]) => mount(IcebergViewer, {
      attachTo: document.body,
      props: { assets },
      global: {
        plugins: [createI18n({ legacy: true, locale: 'en', messages: { en } })],
        stubs: {
          BCollapse: { template: '<div><slot /></div>' },
          ParquetTable: { name: 'ParquetTable', template: '<div class="table-stub" />' },
        },
      },
    })
    const shownPane = wrapper => wrapper.findAll('.tab-pane').find(pane => pane.classes().includes('active'))
    const threeSnapshots = () => ({
      snapshots: [snapshot('3', { current: true }), snapshot('2'), snapshot('1')], currentSnapshotId: '3',
    })

    it('shows the Data tab first', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      const wrapper = realViewer()
      await flushPromises()

      expect(shownPane(wrapper).attributes('id')).toBe('iceberg-tab-data')
      wrapper.unmount()
    })

    it('shows the Query tab when a snapshot\'s Query button is clicked', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = realViewer()
      await flushPromises()

      await wrapper.findAll('.iceberg-snapshot-query')[2].trigger('click')
      await flushPromises()

      expect(shownPane(wrapper).attributes('id')).toBe('iceberg-tab-query')
      expect(wrapper.find('.iceberg-snapshot-select').element.value).toBe('1')
      wrapper.unmount()
    })

    it('shows the Data tab again when a query runs', async () => {
      loadIcebergRows.mockResolvedValue(tableData())
      loadIcebergSnapshots.mockResolvedValue(threeSnapshots())
      const wrapper = realViewer()
      await flushPromises()
      await wrapper.findAll('.iceberg-snapshot-query')[2].trigger('click')
      await flushPromises()
      expect(shownPane(wrapper).attributes('id')).toBe('iceberg-tab-query')

      await wrapper.find('.iceberg-run').trigger('click')
      await flushPromises()

      expect(shownPane(wrapper).attributes('id')).toBe('iceberg-tab-data')
      wrapper.unmount()
    })
  })
})
