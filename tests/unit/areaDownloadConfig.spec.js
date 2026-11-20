// Coverage for making the AreaDownload widget configurable (config.js /
// config.schema.json's `enableAreaDownload`, `areaSearchIndexUrl` and
// `areaDownloadFormats`), split the same way downloadCard.spec.js and
// downloadWidget.spec.js already are:
//
//   * `widgets.config.js` tests mock `config.js` itself (not the merged,
//     runtime config -- see widgets.config.js's own note on why) and check
//     what gets registered on the `map-overlay` hook.
//   * `AreaDownload.vue` tests mount the widget the same way
//     downloadCard.spec.js does -- no map host, so the widget renders and
//     declines to touch a map, which is exactly the state these need.
//
// The one constraint every test here answers to: a deployment that sets
// nothing must behave exactly as it did before this file existed.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'

// The code generators reach the app's i18n singleton, which reaches
// `merged-config`'s `@stac-browser-external-config` -- a module Vite
// supplies and a unit test has no reason to. Mocked here for exactly the
// reason downloadCard.spec.js mocks it; hoisted by vitest regardless of
// where in the file it is written, but kept at the top to match that
// file's convention.
vi.mock('../../codeGenerators.config.js', () => ({ default: [], downloadGenerators: [] }))

const DEFAULT_INDEX_URL = 'https://data.source.coop/portolan-mirrors/geoboundaries-catalog/names/index.json'

describe('widgets.config.js (the AreaDownload registration)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  // Each test that needs a different config.js re-mocks it itself, but an
  // unmock after every test keeps that order-independent rather than
  // relying on this describe's tests happening to run top to bottom.
  afterEach(() => {
    vi.doUnmock('../../config.js')
  })

  it('registers AreaDownload with the config.js defaults, unchanged from before this option existed', async () => {
    const widgets = (await import('../../widgets.config.js')).default
    expect(widgets['map-overlay']).toHaveLength(1)
    const [widget] = widgets['map-overlay']
    expect(widget.id).toBe('AreaDownload')
    expect(widget.props.indexUrl).toBe(DEFAULT_INDEX_URL)
    expect(widget.props.allowedFormats).toBe(null)
  })

  it('omits the widget entirely when enableAreaDownload is false -- not registered, not just hidden', async () => {
    vi.doMock('../../config.js', () => ({
      default: {
        enableAreaDownload: false,
        areaSearchIndexUrl: DEFAULT_INDEX_URL,
        areaDownloadFormats: null
      }
    }))
    const widgets = (await import('../../widgets.config.js')).default
    expect(widgets['map-overlay']).toEqual([])
  })

  it('passes areaSearchIndexUrl (including null) and areaDownloadFormats through as props', async () => {
    vi.doMock('../../config.js', () => ({
      default: {
        enableAreaDownload: true,
        areaSearchIndexUrl: null,
        areaDownloadFormats: ['geojson', 'csv']
      }
    }))
    const widgets = (await import('../../widgets.config.js')).default
    const [widget] = widgets['map-overlay']
    expect(widget.props.indexUrl).toBe(null)
    expect(widget.props.allowedFormats).toEqual(['geojson', 'csv'])
  })
})

describe('AreaDownload.vue (indexUrl and allowedFormats props)', () => {
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

  function estimate(overrides = {}) {
    return {
      rows: { min: 218, max: 218, estimate: 218, exact: true },
      readBytes: { min: 5_500_000, max: 5_500_000, estimate: 5_500_000, exact: true },
      outputBytes: { min: 0, max: 1_000_000, estimate: 100_000, exact: false },
      files: { total: 1, selected: 1 },
      rowGroups: { total: 193, selected: 3 },
      requests: 4,
      columns: ['shapeName', 'geometry'],
      prune: [],
      warnings: [],
      ceiling: { exceeded: false, breaches: [], limits: {} },
      elapsedMs: 120,
      ...overrides
    }
  }

  const translate = (key, values) => (values ? `${key}(${JSON.stringify(values)})` : key)

  async function factory(props = {}, state = {}) {
    const AreaDownload = (await import('../../src/widgets/AreaDownload.vue')).default
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(AreaDownload, {
      props,
      global: {
        mocks: {
          $t: translate,
          $te: () => true,
          $store: { state: { data: COLLECTION } }
        },
        // No map host: the widget renders and declines to touch a map,
        // which is exactly the state these tests want -- see
        // downloadCard.spec.js's identical setup.
        provide: {},
        stubs: { CodeBox: true }
      }
    })
    warn.mockRestore()
    wrapper.vm.area = AREA
    Object.assign(wrapper.vm, state)
    return wrapper
  }

  it('with no props set, behaves exactly as the old hardcoded widget did: search box shown, every format offered', async () => {
    const wrapper = await factory()
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.indexUrl).toBe(DEFAULT_INDEX_URL)
    // See the null-indexUrl test below for why this reads the style
    // directly rather than through `isVisible()`.
    expect(wrapper.find('.ad-search').element.style.display).not.toBe('none')

    Object.assign(wrapper.vm, { estimateResult: estimate() })
    await wrapper.vm.$nextTick()
    const primary = wrapper.findAll('.ad-formats .ad-button')
    expect(primary).toHaveLength(2) // GeoJSON, GeoParquet
    await wrapper.find('.ad-formats .ad-link-button').trigger('click')
    const more = wrapper.findAll('.ad-formats-more .ad-button')
    expect(more).toHaveLength(5) // GeoPackage, FlatGeobuf, Shapefile, CSV, Esri JSON
  })

  it('hides the search box, and never builds a Geocoder, when indexUrl is null', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await factory({ indexUrl: null })
    await wrapper.vm.$nextTick()

    // happy-dom's `isVisible()` does not reliably read an inline
    // `display: none` back in this setup, so the v-show toggle is checked
    // directly against the style it actually wrote.
    expect(wrapper.find('.ad-search').element.style.display).toBe('none')

    // mountSearch() is normally reached through bindMap(), which needs a
    // real map host; calling it directly exercises its own guard without
    // standing one up, the same way the "no map host" tests above let
    // mounted() return early rather than faking a MapLibre map.
    wrapper.vm.mountSearch()
    expect(wrapper.vm.searchControl).toBe(null)
    expect(wrapper.vm.geocoder).toBe(null)
    expect(error).not.toHaveBeenCalled()
    error.mockRestore()
  })

  it('restricts the offered formats to allowedFormats, dropping both the primary GeoParquet button and unlisted "more" ones', async () => {
    const wrapper = await factory({ allowedFormats: ['geojson', 'csv'] }, { estimateResult: estimate() })
    await wrapper.vm.$nextTick()

    const primary = wrapper.findAll('.ad-formats .ad-button')
    expect(primary.map(button => button.text())).toEqual([expect.stringContaining('GeoJSON')])

    await wrapper.find('.ad-formats .ad-link-button').trigger('click')
    const more = wrapper.findAll('.ad-formats-more .ad-button')
    expect(more.map(button => button.text().split(/[\s·]+/u)[0])).toEqual(['CSV'])
  })

  it('treats an empty allowedFormats array the same as null: every format offered', async () => {
    const wrapper = await factory({ allowedFormats: [] }, { estimateResult: estimate() })
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.ad-formats .ad-button')).toHaveLength(2)
  })
})
