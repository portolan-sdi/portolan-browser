// What the download card *says*, for the states that cannot be reached
// without real parquet bytes behind them.
//
// The split: `downloadFilters.spec.js` holds the pure functions, the e2e
// spec drives the DOM the user can reach with no data (the tools, the
// picker, the date row, the column filters), and the two verify scripts
// drive real downloads against live catalogs. What is left -- the four
// ways a run can end, the honest readings of an estimate, the empty state
// and the ceiling warning -- is rendered from state, so it is mounted here
// with that state set directly rather than earned through a network.

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

// The code generators reach the app's i18n singleton, which reaches
// `merged-config`'s `@stac-browser-external-config` -- a module Vite
// supplies and a unit test has no reason to. The card only needs the list
// to render its "show this download as code" panel, which these tests do
// not open.
vi.mock('../../codeGenerators.config.js', () => ({ default: [], downloadGenerators: [] }))

const AreaDownload = (await import('../../src/widgets/AreaDownload.vue')).default

const COLLECTION = {
  type: 'Collection',
  id: 'adm2',
  title: 'Second-level boundaries',
  license: 'CC-BY-4.0',
  isCollection: true,
  extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
  'table:primary_geometry': 'geometry',
  'table:columns': [
    { name: 'shapeName', type: 'string' },
    { name: 'bbox', type: 'struct' },
    { name: 'geometry', type: 'geometry' }
  ],
  assets: {
    data: { href: 'https://data.example.org/adm2/cgaz.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] }
  },
  links: [{ rel: 'self', href: 'https://data.example.org/adm2/collection.json' }]
}

const AREA = {
  name: 'Liechtenstein',
  bbox: [9.47, 47.04, 9.64, 47.27],
  vertexCount: { display: 44, filter: 44 }
}

// An estimate's shape, with only what the card reads.
function estimate(overrides = {}) {
  return {
    rows: { min: 0, max: 768, estimate: 15, exact: false },
    readBytes: { min: 5_500_000, max: 5_500_000, estimate: 5_500_000, exact: true },
    outputBytes: { min: 0, max: 1_000_000, estimate: 100_000, exact: false },
    files: { total: 1, selected: 1 },
    rowGroups: { total: 193, selected: 3 },
    requests: 4,
    columns: ['shapeName', 'geometry'],
    prune: [
      { stage: 'row-group-bbox', before: 193, after: 3, basis: 'covering bbox' },
      { stage: 'row-group-stats', before: 3, after: 3, basis: 'no time filter' }
    ],
    warnings: [],
    ceiling: { exceeded: false, breaches: [], limits: {} },
    elapsedMs: 120,
    ...overrides
  }
}

// `$t` returns the key with its arguments appended, so an assertion can
// name the key *and* see the numbers interpolated into it -- a wrong
// number in the right sentence is the failure mode worth catching.
const translate = (key, values) => (values ? `${key}(${JSON.stringify(values)})` : key)

function factory(state = {}) {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const wrapper = mount(AreaDownload, {
    global: {
      mocks: {
        $t: translate,
        $te: () => true,
        // The widget reads the current entity from the store, and nothing
        // else from it.
        $store: { state: { data: COLLECTION } }
      },
      // `map-overlay` is the only hook with a map host; without one the
      // widget renders and declines to touch a map, which is exactly the
      // state these tests want.
      provide: {},
      stubs: { CodeBox: true }
    }
  })
  warn.mockRestore()
  wrapper.vm.area = AREA
  Object.assign(wrapper.vm, state)
  return wrapper
}

describe('the download card, rendered', () => {
  it('leads with the range when the estimate is wide, and keeps the point estimate as a footnote', async () => {
    const wrapper = factory({ estimateResult: estimate() })
    await wrapper.vm.$nextTick()
    const rows = wrapper.find('dl.estimate dd')
    // O12: max/estimate is 51, so the range is the answer.
    expect(rows.find('.ad-value').text()).toContain('estimate.span')
    expect(rows.find('.ad-value').text()).toContain('768')
    expect(rows.find('.ad-hedge').text()).toContain('estimate.likely')
  })

  it('says an exact number plainly', async () => {
    const wrapper = factory({
      estimateResult: estimate({ rows: { min: 218, max: 218, estimate: 218, exact: true } })
    })
    await wrapper.vm.$nextTick()
    const rows = wrapper.find('dl.estimate dd')
    expect(rows.find('.ad-value').text()).toBe('218')
    expect(rows.find('.ad-hedge').exists()).toBe(false)
  })

  it('says "up to" when the row cap, not the data, decided the number', async () => {
    // 0.3.0 dropped the default row cap (the ceilings and size warnings
    // guard the common hazards), so the cap is a deployment's own choice.
    const wrapper = factory({
      estimateResult: estimate({ rows: { min: 0, max: 100000, estimate: 100000, exact: false } })
    })
    await wrapper.setProps({ limit: 100000 })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('dl.estimate dd .ad-value').text()).toContain('estimate.upTo')
    expect(wrapper.find('dl.estimate dd .ad-hedge').text()).toContain('estimate.theLimit')
    // ...and the why panel repeats it with the number.
    expect(wrapper.find('.ad-why').text()).toContain('estimate.limited')
  })

  it('narrates the pruning cascade stage by stage, with the package\'s own basis', async () => {
    const wrapper = factory({ estimateResult: estimate() })
    await wrapper.vm.$nextTick()
    const lines = wrapper.findAll('.ad-why-list li')
    expect(lines).toHaveLength(2)
    expect(lines[0].text()).toContain('prune.rowGroupBbox')
    expect(lines[0].text()).toContain('193')
    expect(lines[0].find('.ad-basis').text()).toBe('covering bbox')
  })

  it('says each warning on its own line, in its own words', async () => {
    const wrapper = factory({
      estimateResult: estimate({
        warnings: [
          { code: 'no-covering', message: 'ignored, the card has its own sentence' },
          { code: 'share-alike', attribution: [{ license: 'ODbL-1.0' }] },
          { code: 'something-new', message: 'a code this app has never heard of' }
        ]
      })
    })
    await wrapper.vm.$nextTick()
    const warnings = wrapper.findAll('.ad-warnings .ad-warning')
    expect(warnings).toHaveLength(3)
    expect(warnings[0].text()).toContain('warnings.noCovering')
    expect(warnings[1].text()).toContain('ODbL-1.0')
    // An unknown code keeps the package's own message rather than printing
    // the code.
    expect(warnings[2].text()).toBe('a code this app has never heard of')
  })

  it('offers no format buttons for an estimate of nothing, and says why', async () => {
    const wrapper = factory({
      timeEnabled: true,
      estimateResult: estimate({
        rows: { min: 0, max: 0, estimate: 0, exact: true },
        prune: [{ stage: 'part-time', before: 27, after: 0, basis: 'time window overlaps part interval' }]
      })
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ad-empty').text()).toContain('empty.dates')
    expect(wrapper.find('.ad-empty').text()).toContain('empty.datesHint')
    expect(wrapper.find('.ad-formats').exists()).toBe(false)
  })

  it('warns about the ceiling from the estimate, before anything is clicked', async () => {
    const wrapper = factory({
      estimateResult: estimate({
        ceiling: { exceeded: true, breaches: ['readBytes', 'files'], limits: {} }
      })
    })
    await wrapper.vm.$nextTick()
    const ceiling = wrapper.find('.ad-ceiling')
    expect(ceiling.text()).toContain('download.ceiling')
    expect(ceiling.text()).toContain('breaches.readBytes')
    // The accept button belongs to the handle's gate, which does not exist
    // until a download is blocked on it.
    expect(ceiling.text()).not.toContain('acceptCeiling')
  })

  it('ends a finished download in a success state, not a progress line', async () => {
    const wrapper = factory({
      estimateResult: estimate(),
      result: { filename: 'adm2.geojson', rows: 17, bytes: 394294, format: 'geojson', elapsedMs: 5700, blob: true }
    })
    await wrapper.vm.$nextTick()
    const done = wrapper.find('.ad-done')
    expect(done.find('.ad-done-head').text()).toContain('adm2.geojson')
    expect(done.text()).toContain('17')
    expect(done.text()).toContain('385.1 kB')
    expect(done.text()).toContain('5.7')
    expect(done.text()).toContain('download.blobNote')
    // The formats are out of the way until the user asks for another.
    expect(wrapper.find('.ad-formats').exists()).toBe(false)
  })

  it('shows what a format writer had to change, beside the file it changed', async () => {
    const wrapper = factory({
      estimateResult: estimate(),
      result: { filename: 'adm2.shp.zip', rows: 17, bytes: 284489, format: 'shapefile', elapsedMs: 7100 },
      runWarnings: ['Column "country_units" was renamed to "COUNTRY_UN".']
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ad-done .ad-warning').text()).toContain('COUNTRY_UN')
  })

  it('reports a cancel as an outcome and not as a failure', async () => {
    const wrapper = factory({ estimateResult: estimate(), cancelled: { rows: 2118 } })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.ad-outcome').text()).toContain('download.cancelled')
    expect(wrapper.find('.ad-outcome').text()).toContain('2,118')
    expect(wrapper.find('.ad-error').exists()).toBe(false)
  })

  it('says a failure in the taxonomy\'s words, with a way to try again', async () => {
    const wrapper = factory({ estimateResult: estimate(), lastFormat: 'geojson' })
    wrapper.vm.downloadError = wrapper.vm.formatError({ code: 'SINK_QUOTA_EXCEEDED', message: 'Too large to buffer' })
    await wrapper.vm.$nextTick()
    const outcome = wrapper.find('.ad-outcome')
    expect(outcome.text()).toContain('errors.sinkQuotaExceeded')
    expect(outcome.text()).not.toContain('SINK_QUOTA_EXCEEDED:')
    expect(outcome.text()).toContain('download.retry')
  })

  it('keeps the code of an error it has no sentence for', () => {
    const wrapper = factory()
    expect(wrapper.vm.formatError({ code: 'WAT', message: 'boom' })).toBe('WAT: boom')
  })

  it('offers two formats, then six more, each writer with its own size', async () => {
    const wrapper = factory({ estimateResult: estimate() })
    await wrapper.vm.$nextTick()
    const primary = wrapper.findAll('.ad-formats .ad-button')
    expect(primary.map(button => button.text())).toEqual([
      expect.stringContaining('GeoJSON'),
      expect.stringContaining('GeoParquet')
    ])
    // Different formats, different numbers: one "output size" for both
    // would be wrong for whichever one was picked.
    expect(primary[0].text()).not.toBe(primary[1].text())

    await wrapper.find('.ad-formats .ad-link-button').trigger('click')
    const more = wrapper.findAll('.ad-formats-more .ad-button')
    // The label is separated from its size by a non-breaking space, so
    // that a button never wraps between a format and its number.
    expect(more.map(button => button.text().split(/[\s·]+/u)[0])).toEqual([
      'GeoPackage', 'FlatGeobuf', 'Shapefile', 'CSV', 'Esri',
      // The raw passthrough, labelled in the UI's own language rather
      // than by the descriptor's English prose.
      'widgets.areaDownload.download.rawLabel'
    ])
    // The one with a wasm behind it says so before it is clicked.
    expect(more[0].text()).toContain('download.weight')
    expect(more[2].text()).not.toContain('download.weight')
  })

  it('disarms a draw on Escape before it collapses the tools', async () => {
    const wrapper = factory()
    const setArmed = vi.fn(() => false)
    wrapper.vm.bboxDraw = { setArmed }
    wrapper.vm.drawArmed = true
    await wrapper.find('.area-download').trigger('keydown.esc')
    expect(setArmed).toHaveBeenCalledWith(false)
    expect(wrapper.vm.open).toBe(true)

    await wrapper.find('.area-download').trigger('keydown.esc')
    expect(wrapper.vm.open).toBe(false)
  })
})

describe('the 0.3.0 size warnings and the confirmation gate', () => {
  const LARGE = { code: 'large-download', bytes: 2_000_000_000, estimatedSeconds: 200 }
  const SLOW = { code: 'slow-download', estimatedSeconds: 90 }

  it('renders large/slow-download ahead of the ordinary warnings, dressed to be seen', async () => {
    const wrapper = factory({
      estimateResult: estimate({
        warnings: [
          { code: 'share-alike', attribution: [{ license: 'ODbL-1.0' }] },
          LARGE,
          SLOW
        ]
      })
    })
    await wrapper.vm.$nextTick()
    const strong = wrapper.findAll('.ad-warning-strong')
    expect(strong).toHaveLength(2)
    expect(strong[0].text()).toContain('warnings.largeDownload')
    // The flat payload's own numbers, interpolated: bytes said as bytes,
    // seconds as a count.
    expect(strong[0].text()).toContain('1.9 GB')
    expect(strong[1].text()).toContain('warnings.slowDownload')
    const ordinary = wrapper.findAll('.ad-warning:not(.ad-warning-strong)')
    expect(ordinary).toHaveLength(1)
    expect(ordinary[0].text()).toContain('warnings.shareAlike')
  })

  it('says the three raw-* warnings with their payload fields', () => {
    const wrapper = factory()
    expect(wrapper.vm.warningText({ code: 'raw-size-unknown', partsWithoutSize: 2, partsTotal: 3 }))
      .toContain('"parts":"2","total":"3"')
    expect(wrapper.vm.warningText({ code: 'raw-no-pruning', basis: 'bbox' }))
      .toContain('"basis":"bbox"')
    expect(wrapper.vm.warningText({ code: 'raw-passthrough-unfiltered', dropped: ['columns', 'where'] }))
      .toContain('"dropped":"columns, where"')
  })

  it('gates a large download behind a confirmation, and cancel clears it', async () => {
    const wrapper = factory({ estimateResult: estimate({ warnings: [LARGE] }) })
    await wrapper.vm.$nextTick()
    await wrapper.vm.startDownload('geojson')
    await wrapper.vm.$nextTick()
    // Nothing ran: the gate holds the sentences instead.
    expect(wrapper.vm.downloading).toBe(false)
    expect(wrapper.vm.pendingConfirm).toBeTruthy()
    expect(wrapper.vm.pendingConfirm.format).toBe('geojson')
    const box = wrapper.find('.ad-confirm')
    expect(box.exists()).toBe(true)
    expect(box.text()).toContain('warnings.largeDownload')
    // The second button clears the gate without running anything.
    await box.findAll('.ad-button')[1].trigger('click')
    expect(wrapper.vm.pendingConfirm).toBe(null)
  })

  it('needs no confirmation when the estimate raised no size warning', async () => {
    const wrapper = factory({ estimateResult: estimate() })
    expect(await wrapper.vm.confirmationFor('geojson')).toBe(null)
  })

  it('names a multi-file raw download .zip and a single-file one .parquet', () => {
    const wrapper = factory()
    expect(wrapper.vm.outputFor('parquet-raw', 1).filename.endsWith('.parquet')).toBe(true)
    expect(wrapper.vm.outputFor('parquet-raw', 3).filename.endsWith('.zip')).toBe(true)
    // A writer format never zips, whatever the file count.
    expect(wrapper.vm.outputFor('geojson', 3).filename.endsWith('.geojson')).toBe(true)
  })

  it('omits the row cap from the filter unless a deployment sets one', async () => {
    const wrapper = factory()
    expect('limit' in wrapper.vm.buildFilter()).toBe(false)
    await wrapper.setProps({ limit: 500 })
    expect(wrapper.vm.buildFilter().limit).toBe(500)
  })

  it('narrates the raw copying phase in whole-archive bytes, indeterminate when sizes are unknown', () => {
    const wrapper = factory()
    wrapper.vm._rawTotalBytes = 4_194_304
    wrapper.vm.onProgress({ phase: 'copying', fileIndex: 1, fileCount: 3, bytesWritten: 1_048_576, bytesTotal: 1_048_576 })
    expect(wrapper.vm.progressPercent).toBe(25)
    expect(wrapper.vm.progress).toContain('download.copying')
    // The second file starts: the bar keeps the first file's bytes
    // instead of restarting at 0%.
    wrapper.vm.onProgress({ phase: 'copying', fileIndex: 2, fileCount: 3, bytesWritten: 1_048_576, bytesTotal: 2_097_152 })
    expect(wrapper.vm.progressPercent).toBe(50)
    const unknown = factory()
    unknown.vm.onProgress({ phase: 'copying', fileIndex: 1, fileCount: 2, bytesWritten: 10, bytesTotal: null })
    expect(unknown.vm.progressPercent).toBe(null)
  })

  it('cancelling a run while blocked on the ceiling releases the wait and the banner', () => {
    const wrapper = factory()
    const gate = vi.fn()
    wrapper.vm.handle = { cancel: vi.fn() }
    wrapper.vm.ceilingGate = gate
    wrapper.vm.ceiling = { exceeded: true, breaches: ['rows'] }
    wrapper.vm.cancel()
    expect(gate).toHaveBeenCalledWith('cancel')
    expect(wrapper.vm.ceiling).toBe(null)
  })

  it('a reset mid-run cancels the handle, releases the ceiling wait and clears downloading', () => {
    // Drawing a new area while a run is blocked on the ceiling used to
    // abandon the wait: downloading stayed true forever.
    const wrapper = factory()
    const cancel = vi.fn()
    const gate = vi.fn()
    wrapper.vm.handle = { cancel }
    wrapper.vm.ceilingGate = gate
    wrapper.vm.downloading = true
    const seq = wrapper.vm._runSeq || 0
    wrapper.vm.resetDownload()
    expect(cancel).toHaveBeenCalled()
    expect(gate).toHaveBeenCalledWith('cancel')
    expect(wrapper.vm.downloading).toBe(false)
    expect(wrapper.vm.handle).toBe(null)
    expect(wrapper.vm._runSeq).toBe(seq + 1)
  })

  it('a stale terminal state does not swallow the confirmation gate', async () => {
    const wrapper = factory({
      estimateResult: estimate({ warnings: [LARGE] }),
      cancelled: { rows: 5 }
    })
    await wrapper.vm.$nextTick()
    await wrapper.vm.startDownload('geojson')
    await wrapper.vm.$nextTick()
    // The cancelled outcome is cleared so the confirm box is what renders.
    expect(wrapper.vm.cancelled).toBe(null)
    expect(wrapper.vm.pendingConfirm).toBeTruthy()
    expect(wrapper.find('.ad-confirm').exists()).toBe(true)
  })

  it('a confirmation for a request that changed re-gates instead of running', async () => {
    const wrapper = factory({ estimateResult: estimate({ warnings: [LARGE] }) })
    await wrapper.vm.$nextTick()
    // A payload stamped with a different filter: the proceed click must
    // rebuild the gate against the live filter, not start the download.
    wrapper.vm.pendingConfirm = { format: 'geojson', filterKey: 'stale', filesSelected: undefined, lines: [], sources: [] }
    await wrapper.vm.startDownload('geojson', true)
    expect(wrapper.vm.downloading).toBe(false)
    expect(wrapper.vm.pendingConfirm).toBeTruthy()
    expect(wrapper.vm.pendingConfirm.filterKey).not.toBe('stale')
  })

  it("gates on the chosen format's own byte model when the generic estimate stayed quiet", async () => {
    // 60M rows of GeoJSON text crosses the 1 GiB line on the format's own
    // model even when the estimate raised no size warning.
    const rows = { min: 60_000_000, max: 60_000_000, estimate: 60_000_000, exact: true }
    const wrapper = factory({ estimateResult: estimate({ rows, warnings: [] }) })
    const confirm = await wrapper.vm.confirmationFor('geojson')
    expect(confirm).toBeTruthy()
    expect(confirm.lines.join(' ')).toContain('warnings.largeDownload')
  })
})
