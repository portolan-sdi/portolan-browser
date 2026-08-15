import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParquetTable, { PAGE_SIZE } from '../../src/components/ParquetTable.vue'

// vue-i18n's $t(key, default) / $t(key, params, default) forms: the last
// string argument is the default message the component ships inline. The
// pagination keys carry no inline default because they already ship
// translated in src/locales, so mirror the English ones here.
const TRANSLATED = {
  'pagination.first': '« First',
  'pagination.previous': '‹ Previous',
  'pagination.next': 'Next ›',
  'pagination.last': 'Last »',
}
const $t = (key, a, b) => {
  if (TRANSLATED[key]) {return TRANSLATED[key];}
  if (typeof b === 'string') {return b;}
  if (typeof a === 'string') {return a;}
  return key
}

// Address the controls by what they say, not by where they sit, so adding
// First/Last does not silently repoint the tests at a different button.
const button = (wrapper, label) =>
  wrapper.findAll('.parquet-pagination button').find(b => b.text().includes(label))

const factory = (rowCount, { columns = ['id', 'name'], ...props } = {}) => {
  const rows = Array.from({ length: rowCount }, (_, i) => columns.map(c => `${c}-${i}`))
  return mount(ParquetTable, {
    props: {
      columns,
      rows,
      totalRows: rowCount,
      loadedRows: rowCount,
      ...props,
    },
    global: { mocks: { $t } },
  })
}

// The filter is debounced, so a keystroke does not reach the rendered rows
// until it settles.
const settleFilter = async wrapper => {
  await new Promise(resolve => setTimeout(resolve, 200))
  await wrapper.vm.$nextTick()
}

const cellTexts = wrapper => wrapper.findAll('tbody tr td:first-child').map(td => td.text())

describe('ParquetTable', () => {
  // The regression this guards: a 134k-row × 140-column collection loads 10k
  // rows into the preview, and rendering them all at once (over a million
  // table cells) froze the tab at multi-GB heap sizes. Only a window of the
  // loaded rows may ever be in the DOM.
  it(`renders at most ${PAGE_SIZE} rows regardless of how many were loaded`, () => {
    const wrapper = factory(10000)
    expect(wrapper.findAll('tbody tr')).toHaveLength(PAGE_SIZE)
    expect(cellTexts(wrapper)[0]).toBe('id-0')
  })

  it('pages forward and back through the loaded rows', async () => {
    const wrapper = factory(PAGE_SIZE * 2 + 5)
    const prev = button(wrapper, 'Previous')
    const next = button(wrapper, 'Next')
    expect(prev.attributes('disabled')).toBeDefined()

    await next.trigger('click')
    expect(cellTexts(wrapper)[0]).toBe(`id-${PAGE_SIZE}`)
    expect(prev.attributes('disabled')).toBeUndefined()

    await next.trigger('click')
    expect(wrapper.findAll('tbody tr')).toHaveLength(5)
    expect(next.attributes('disabled')).toBeDefined()

    await prev.trigger('click')
    expect(cellTexts(wrapper)[0]).toBe(`id-${PAGE_SIZE}`)
  })

  it('reports the visible range', async () => {
    const wrapper = factory(250)
    expect(wrapper.find('.parquet-page-info').text()).toBe(`Rows 1–${PAGE_SIZE} of 250`)
    await button(wrapper, 'Next').trigger('click')
    expect(wrapper.find('.parquet-page-info').text()).toBe(`Rows ${PAGE_SIZE + 1}–${PAGE_SIZE * 2} of 250`)
  })

  it('hides the pagination bar when one page suffices', () => {
    const wrapper = factory(PAGE_SIZE)
    expect(wrapper.find('.parquet-pagination').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(PAGE_SIZE)
  })

  it('filters across all loaded rows and snaps back to the first page', async () => {
    const wrapper = factory(PAGE_SIZE * 3)
    await button(wrapper, 'Next').trigger('click')
    expect(cellTexts(wrapper)[0]).toBe(`id-${PAGE_SIZE}`)

    // A row far beyond the first page must be findable.
    await wrapper.find('.parquet-filter-input').setValue(`id-${PAGE_SIZE * 3 - 1}`)
    await settleFilter(wrapper)
    const cells = cellTexts(wrapper)
    expect(cells).toContain(`id-${PAGE_SIZE * 3 - 1}`)
    expect(wrapper.find('.parquet-pagination').exists()).toBe(false)
  })

  it('sorts across all loaded rows, not just the visible page', async () => {
    const wrapper = factory(PAGE_SIZE + 1)
    // Descending by id: the lexicographically largest id lives beyond page 1.
    const header = wrapper.findAll('th').find(th => th.text().includes('id'))
    await header.trigger('click') // asc
    await header.trigger('click') // desc
    expect(cellTexts(wrapper)[0]).toBe('id-99') // 'id-99' sorts last lexicographically
    expect(wrapper.findAll('tbody tr')).toHaveLength(PAGE_SIZE)
  })

  // The regression is a wide table, so the budget that matters is cells, not
  // rows. A 140-column page of 100 rows would be 14,000 cells — the shape that
  // froze the tab in the first place, just one page of it.
  it('shortens the page so a wide table costs no more DOM than a narrow one', () => {
    const columns = Array.from({ length: 140 }, (_, i) => `c${i}`)
    const wrapper = factory(1000, { columns })
    const rendered = wrapper.findAll('tbody tr').length
    expect(rendered).toBeLessThan(PAGE_SIZE)
    expect(wrapper.findAll('tbody td').length).toBeLessThanOrEqual(4000)
    // Still paginating, not collapsing to a single row.
    expect(rendered).toBeGreaterThanOrEqual(10)
  })

  it('leaves a narrow table on the full page size', () => {
    expect(factory(1000).findAll('tbody tr')).toHaveLength(PAGE_SIZE)
  })

  // Typing must not run a 10k-row scan per letter.
  it('does not re-filter until typing settles', async () => {
    const wrapper = factory(PAGE_SIZE * 3)
    const input = wrapper.find('.parquet-filter-input')
    for (const value of ['i', 'id', 'id-', 'id-2']) {
      await input.setValue(value)
    }
    // Nothing has been applied yet, so the full row set is still paginated.
    expect(wrapper.vm.appliedFilter).toBe('')
    await settleFilter(wrapper)
    expect(wrapper.vm.appliedFilter).toBe('id-2')
  })

  it('tells the map when a row is deselected, not only when one is selected', async () => {
    const wrapper = factory(3)
    const row = wrapper.findAll('tbody tr')[0]
    await row.trigger('click')
    await row.trigger('click')
    const emitted = wrapper.emitted('select-row')
    expect(emitted).toHaveLength(2)
    expect(emitted[1][0]).toEqual({ origIndex: null, bbox: null })
  })

  // Filtering down while on a late page must land on the first page of the new
  // result set, not the last page of it.
  it('returns to the first page when a filter shrinks the row set', async () => {
    const wrapper = factory(PAGE_SIZE * 5)
    await button(wrapper, 'Last').trigger('click')
    expect(wrapper.vm.currentPage).toBe(4)
    await wrapper.find('.parquet-filter-input').setValue('id-1')
    await settleFilter(wrapper)
    expect(wrapper.vm.currentPage).toBe(0)
  })
})
