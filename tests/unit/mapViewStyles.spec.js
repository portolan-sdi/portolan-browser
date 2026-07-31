import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Collection from 'stac-js/src/collection.js'

// The whole feature's correctness is decided by the order in which MapView
// calls expectStyleFields, setAssets, setStyleFields and applyStyleAtIndex.
// Mounting the component would drag in maplibre, the store and the router
// without making that ordering any more observable, so the orchestration
// methods are driven directly against a recording layer double. Everything
// they call into — resolveStyles, extractStyleFields, applyStyleAtIndex — is
// the shipped implementation; only the network and the layer are doubles.

// Per-test control over every style fetch, keyed by href.
const styleFetch = vi.hoisted(() => ({ impl: null }))
vi.mock('../../src/utils/portolanStyles.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    loadStyleJson: (href) => styleFetch.impl(href),
  }
})

// The layer double records the call order and honours the field-gate contract
// (expectStyleFields blocks until setStyleFields or releaseStyleFields), so a
// test can assert that assets load while the gate is still shut.
const layerCalls = vi.hoisted(() => ({ instances: [] }))
vi.mock('../../src/components/maps/StacMapLayer.js', () => {
  class FakeStacMapLayer {
    constructor(map, options) {
      this.map = map
      this.options = options
      this.calls = []
      this.styleFields = null
      this.released = false
      this.applied = []
      this._gate = null
      this._openGate = null
      layerCalls.instances.push(this)
    }
    _record(name, ...args) { this.calls.push(name); return args }
    setStac() { this._record('setStac') }
    setChildren() { this._record('setChildren') }
    setFootprintVisible() { this._record('setFootprintVisible') }
    fit() { this._record('fit') }
    expectStyleFields() {
      this._record('expectStyleFields')
      this._gate = new Promise(resolve => { this._openGate = resolve })
    }
    setStyleFields(fields) {
      this._record('setStyleFields')
      this.styleFields = fields
      this.releaseStyleFields()
    }
    releaseStyleFields() {
      this.released = true
      this._openGate?.()
      this._openGate = null
    }
    // Mirrors _addParquetAssets: the read is an input-waiter, not a racer.
    async setAssets() {
      this._record('setAssets')
      if (this._gate) { await this._gate }
      this._record('setAssets:read')
    }
    async autoLoadVisualAssets() {
      this._record('autoLoadVisualAssets')
      if (this._gate) { await this._gate }
    }
    applyGlStyle(style, href) { this._record('applyGlStyle'); this.applied.push(href) }
    isEmpty() { return false }
    getChildrenLayerIds() { return [] }
    remove() { this._record('remove') }
  }
  return { default: FakeStacMapLayer }
})

import MapView from '../../src/components/MapView.vue'

const COLLECTION_URL = 'https://example.com/boundaries/nl/collection.json'

const collection = (assets, extra = {}) => new Collection({
  type: 'Collection',
  stac_version: '1.0.0',
  id: 'nl',
  description: 'test',
  license: 'proprietary',
  extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
  links: [{ rel: 'self', href: COLLECTION_URL }],
  assets,
  ...extra,
}, COLLECTION_URL)

const styleAsset = (over = {}) => ({
  type: 'application/vnd.mapbox.style+json',
  roles: ['style'],
  ...over,
})

const styleDoc = (field = 'naam') => ({
  version: 8,
  sources: { data: { type: 'vector', url: 'pmtiles://x.pmtiles' } },
  layers: [{
    id: 'fill',
    type: 'fill',
    source: 'data',
    paint: { 'fill-color': ['match', ['get', field], 'a', '#0f0', '#f00'] },
  }],
})

// A plain object carrying MapView's own data and methods. Methods are bound to
// it, so `this` inside them is this context and the real implementations run.
function createView(overrides = {}) {
  const view = {
    stac: null,
    children: null,
    assets: null,
    hideFootprint: false,
    popover: false,
    map: {},
    stacLayerOptions: {},
    stacLayer: null,
    availableStyles: [],
    activeStyleIndex: 0,
    activeLegend: [],
    styleApplied: false,
    empty: false,
    vectorNotice: null,
    emitted: [],
    $emit(...args) { this.emitted.push(args) },
    getShownData: () => ({}),
    ...overrides,
  }
  for (const [name, fn] of Object.entries(MapView.methods)) {
    if (!(name in view)) { view[name] = fn.bind(view) }
  }
  return view
}

describe('MapView style orchestration', () => {
  let warn

  beforeEach(() => {
    layerCalls.instances.length = 0
    styleFetch.impl = async () => styleDoc()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  it('declares the field expectation before any asset load begins', async () => {
    const view = createView({
      stac: collection({ 'style-main': styleAsset({ href: './styles/main.json' }) }),
      assets: [{ href: 'https://example.com/d.parquet' }],
    })

    await view.addStacLayer()
    const layer = layerCalls.instances[0]

    // Both orderings matter: the gate must exist before setAssets is called,
    // and the read behind it must not happen before the fields land.
    expect(layer.calls.indexOf('expectStyleFields')).toBeLessThan(layer.calls.indexOf('setAssets'))
    expect(layer.calls.indexOf('setStyleFields')).toBeLessThan(layer.calls.indexOf('setAssets:read'))
    expect(layer.styleFields).toEqual(['naam'])
  })

  it('does not hold the asset load behind a style fetch that never resolves', async () => {
    // A tile- or COG-backed collection consults no field set, so a slow or
    // unreachable style host must delay styling and nothing else.
    styleFetch.impl = () => new Promise(() => {})
    const view = createView({
      stac: collection({ 'style-main': styleAsset({ href: './styles/main.json' }) }),
      assets: [{ href: 'https://example.com/tiles.pmtiles' }],
    })
    // The gate is what the parquet path waits on; a tile layer never opens it,
    // so drive the double as a tile layer would behave (no gate wait).
    const done = view.addStacLayer()
    const layer = layerCalls.instances[0]
    layer.releaseStyleFields()
    await Promise.race([done, new Promise(resolve => setTimeout(resolve, 20))])

    expect(layer.calls).toContain('setAssets:read')
    expect(view.emitted.map(e => e[0])).toContain('changed')
  })

  describe('releasing the field gate', () => {
    // Each of these leaves setStyleFields uncalled. Without the release, the
    // parquet read waits forever and the map stays blank.
    it('releases when the entity is an Item, not a Collection', async () => {
      const view = createView({ stac: { type: 'Feature' } })
      await view.addStacLayer()
      expect(view.stacLayer.released).toBe(true)
      expect(view.stacLayer.styleFields).toBeNull()
    })

    it('releases when the collection declares no styles', async () => {
      const view = createView({ stac: collection({ data: { href: './d.parquet', roles: ['data'] } }) })
      await view.addStacLayer()
      expect(view.stacLayer.released).toBe(true)
      expect(view.stacLayer.styleFields).toBeNull()
    })

    it('releases when every style document fails to load', async () => {
      styleFetch.impl = async () => { throw new Error('404') }
      const view = createView({
        stac: collection({ 'style-main': styleAsset({ href: './styles/main.json' }) }),
      })
      await view.addStacLayer()
      expect(view.stacLayer.released).toBe(true)
      expect(view.stacLayer.styleFields).toBeNull()
    })

    it('releases when style discovery itself throws', async () => {
      const stac = collection({ 'style-main': styleAsset({ href: './styles/main.json' }) })
      // getAbsoluteUrl is the first thing resolveStyles touches.
      stac.getAbsoluteUrl = () => { throw new Error('broken links') }
      const view = createView({ stac })
      await view.addStacLayer()
      expect(view.stacLayer.released).toBe(true)
      expect(warn).toHaveBeenCalledWith('Failed to resolve styles:', expect.any(Error))
    })

    it('releases the layer it captured, not whichever is current later', async () => {
      // The component can be moved to another STAC entity mid-fetch. The
      // captured layer still owns a waiting read and must be let go.
      let resolveFetch
      styleFetch.impl = () => new Promise(resolve => { resolveFetch = resolve })
      const view = createView({
        stac: collection({ 'style-main': styleAsset({ href: './styles/main.json' }) }),
      })
      const pending = view.addStacLayer()
      const first = layerCalls.instances[0]
      const second = new first.constructor({}, {})
      second.setStyleFields = vi.fn()
      view.stacLayer = second
      resolveFetch(styleDoc())
      first.releaseStyleFields() // unblock the abandoned layer's asset load
      await pending

      expect(first.released).toBe(true)
      expect(first.styleFields).toBeNull()
      expect(second.setStyleFields).not.toHaveBeenCalled()
    })
  })

  it('warns when the styles reference more attribute columns than the cap', async () => {
    const fields = Array.from({ length: 33 }, (_, i) => `f${i}`)
    styleFetch.impl = async () => ({
      version: 8,
      layers: fields.map((f, i) => ({
        id: `l${i}`, type: 'fill', source: 'data',
        paint: { 'fill-color': ['match', ['get', f], 'a', '#0f0', '#f00'] },
      })),
    })
    const view = createView({
      stac: collection({ 'style-main': styleAsset({ href: './styles/main.json' }) }),
    })

    await view.addStacLayer()

    expect(view.stacLayer.styleFields).toHaveLength(33)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('33 attribute columns'))
  })

  describe('applying the default style', () => {
    const twoStyles = () => collection({
      'style-a': styleAsset({ href: './styles/a.json', title: 'A' }),
      'style-b': styleAsset({ href: './styles/b.json', title: 'B' }),
    })

    it('applies the first style once the documents are in hand', async () => {
      const view = createView({ stac: twoStyles() })

      await view.addStacLayer()

      expect(view.availableStyles).toHaveLength(2)
      expect(view.activeStyleIndex).toBe(0)
      expect(view.styleApplied).toBe(true)
      expect(view.stacLayer.applied).toEqual(['https://example.com/boundaries/nl/styles/a.json'])
    })

    it('does not snap back a style the user chose while the assets were loading', async () => {
      // The picker is live for the whole load. Auto-applying the default at
      // the end regardless would discard the choice and repaint the map.
      const view = createView({ stac: twoStyles() })
      const pending = view.addStacLayer()
      // Let the styles land, then choose the second one before the load ends.
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      view.applyStyleAtIndex(1)
      layerCalls.instances[0].releaseStyleFields()
      await pending

      expect(view.activeStyleIndex).toBe(1)
      expect(view.stacLayer.applied).toEqual(['https://example.com/boundaries/nl/styles/b.json'])
    })

    it('leaves a failed apply un-marked so the default can still be applied', async () => {
      const view = createView({ stac: twoStyles() })
      await view.addStacLayer()
      view.styleApplied = false
      view.stacLayer.applyGlStyle = () => { throw new Error('no glyphs') }

      view.applyStyleAtIndex(1)

      expect(view.styleApplied).toBe(false)
      expect(view.activeStyleIndex).toBe(0)
    })
  })
})
