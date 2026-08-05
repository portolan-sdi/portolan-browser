import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParquetTable, { PAGE_SIZE } from '../../src/components/ParquetTable.vue'

// vue-i18n's $t(key, default) / $t(key, params, default) forms: the last
// string argument is the default message the component ships inline.
const $t = (key, a, b) => {
  if (typeof b === 'string') {return b;}
  if (typeof a === 'string') {return a;}
  return key
}

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
    const [prev, next] = wrapper.findAll('.parquet-pagination button')
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
    await wrapper.findAll('.parquet-pagination button')[1].trigger('click')
    expect(wrapper.find('.parquet-page-info').text()).toBe(`Rows ${PAGE_SIZE + 1}–${PAGE_SIZE * 2} of 250`)
  })

  it('hides the pagination bar when one page suffices', () => {
    const wrapper = factory(PAGE_SIZE)
    expect(wrapper.find('.parquet-pagination').exists()).toBe(false)
    expect(wrapper.findAll('tbody tr')).toHaveLength(PAGE_SIZE)
  })

  it('filters across all loaded rows and snaps back to the first page', async () => {
    const wrapper = factory(PAGE_SIZE * 3)
    await wrapper.findAll('.parquet-pagination button')[1].trigger('click')
    expect(cellTexts(wrapper)[0]).toBe(`id-${PAGE_SIZE}`)

    // A row far beyond the first page must be findable.
    await wrapper.find('.parquet-filter-input').setValue(`id-${PAGE_SIZE * 3 - 1}`)
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
})
