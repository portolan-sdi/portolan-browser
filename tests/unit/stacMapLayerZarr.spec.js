import { describe, it, expect, beforeEach, vi } from 'vitest'

// MapMixin's module-level `new Protocol()` needs the pmtiles module to exist,
// and nothing here reads a PMTiles archive.
vi.mock('pmtiles', () => {
  class PMTiles {
    async getHeader() { return { tileType: 1 } }
    async getMetadata() { return {} }
  }
  class SharedPromiseCache {}
  class Protocol {
    constructor() { this.tile = () => {} }
    add() {}
  }
  return { PMTiles, SharedPromiseCache, Protocol }
})

// What StacMapLayer passed to makeZarrLayerProps. Opening a store needs a
// network read, so the call itself is replaced — but its arguments are the
// subject of one test, so they are recorded. Everything else in the module
// (zarrDescriptors above all) stays the shipped implementation.
const zarrProps = vi.hoisted(() => ({ calls: [], result: null }))
vi.mock('../../src/utils/zarrLayers.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    makeZarrLayerProps: async (descriptor, options) => {
      zarrProps.calls.push({ descriptor, ...options })
      return zarrProps.result ?? { props: { id: descriptor.id }, minZoom: 0, hasOverviews: true }
    },
  }
})

import StacMapLayer from '../../src/components/maps/StacMapLayer.js'
import MapView from '../../src/components/MapView.vue'
import {
  ZARR_NOTICE_CHUNK_SHAPE, ZARR_NOTICE_ERROR, ZARR_NOTICE_ORDER, ZARR_NOTICE_ZOOM_IN,
  ZarrUnsuitableError,
} from '../../src/utils/zarrLayers.js'

// A MapLibre double with the three things the Zarr zoom notice needs — a zoom,
// a zoomend subscription, and a control host for the deck overlay — and
// nothing else.
function createZarrMap(zoom = 4) {
  const handlers = new Map()
  return {
    zoom,
    controls: [],
    sources: new Map(),
    layers: new Map(),
    on(event, handler) {
      handlers.set(event, [...(handlers.get(event) || []), handler])
    },
    off(event, handler) {
      handlers.set(event, (handlers.get(event) || []).filter(h => h !== handler))
    },
    fire(event) {
      for (const handler of [...(handlers.get(event) || [])]) {handler()}
    },
    handlerCount(event) { return (handlers.get(event) || []).length },
    getZoom() { return this.zoom },
    addControl(control) { this.controls.push(control) },
    removeControl(control) { this.controls = this.controls.filter(c => c !== control) },
    addSource(id, spec) { this.sources.set(id, spec) },
    getSource(id) { return this.sources.get(id) },
    removeSource(id) { this.sources.delete(id) },
    addLayer(spec) { this.layers.set(spec.id, spec) },
    getLayer(id) { return this.layers.get(id) },
    removeLayer(id) { this.layers.delete(id) },
    getStyle() { return { layers: [...this.layers.values()] } },
    getLayersOrder() { return [...this.layers.keys()] },
    moveLayer() {},
    getLayoutProperty() {},
    setLayoutProperty() {},
  }
}

class FakeZarrLayer {
  constructor(props) { this.props = props }
}

function fakeDeckDeps() {
  class FakeOverlay {
    constructor(props) { this.props = props }
    setProps(props) { this.props = { ...this.props, ...props } }
  }
  class FakeDecoderPool {}
  class FakeGeoTIFF {}
  return async () => ({
    MapboxOverlay: FakeOverlay,
    COGLayer: FakeZarrLayer,
    DecoderPool: FakeDecoderPool,
    GeoTIFF: FakeGeoTIFF,
  })
}

// A Zarr asset with one named variable per band, the shape a Portolan catalog
// writes. `bands` decides how many layers the picker lists.
function zarrAsset(bands, href = 'https://example.com/fire.zarr') {
  return {
    type: 'application/vnd.zarr; version=3',
    title: 'Fire characterisation',
    roles: ['data'],
    bands,
    getKey: () => 'zarr',
    getAbsoluteUrl: () => href,
    href,
  }
}

const fakeStac = (assets, bbox = [-130, 20, -60, 55]) => ({
  getAssets: () => assets,
  getBoundingBox: () => bbox,
  toGeoJSON: () => null,
})

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('StacMapLayer Zarr layers', () => {
  let map
  let layer
  let notices

  // Two variables, so one can be held back below its zoom while the other
  // draws. A and B are listed in band order; A is the preferred one, because
  // no render names either.
  const twoVariables = [
    { name: 'A', description: 'Variable A', nodata: 1 },
    { name: 'B', description: 'Variable B', nodata: 2 },
  ]

  // Hold a variable back below `minZoom`, or refuse it outright.
  const openAs = (plan) => async (descriptor) => {
    const outcome = plan[descriptor.variable?.name] ?? { minZoom: 0 }
    if (outcome.error) {throw outcome.error}
    return {
      Layer: FakeZarrLayer,
      props: { id: descriptor.id },
      minZoom: outcome.minZoom ?? 0,
      hasOverviews: outcome.hasOverviews ?? false,
    }
  }

  const descriptorFor = name => layer._cogList.find(d => d.variable?.name === name)

  beforeEach(() => {
    zarrProps.calls = []
    zarrProps.result = null
    notices = []
    map = createZarrMap(4)
    layer = new StacMapLayer(map, { onVectorNotice: n => notices.push(n) })
    layer._loadDeckDeps = fakeDeckDeps()
    layer._loadZarrDeps = async () => ({ ZarrLayer: FakeZarrLayer, zarr: {} })
  })

  describe('the zoom notice', () => {
    beforeEach(async () => {
      layer._makeZarrLayerProps = openAs({ A: { minZoom: 8 }, B: { minZoom: 0 } })
      const asset = zarrAsset(twoVariables)
      layer.setStac(fakeStac([asset]))
      await layer.setAssets([asset])
    })

    it('tells the user to zoom in for a variable held below its minimum zoom', () => {
      expect(notices.at(-1)).toMatchObject({
        format: 'zarr',
        reason: ZARR_NOTICE_ZOOM_IN,
        minZoom: 8,
      })
    })

    it('takes the notice down when the held variable is switched off', async () => {
      await layer.setCogVisible('zarr:zarr:A', false)
      expect(notices.at(-1)).toBeNull()
      // And it stays down. The held list is empty, so a zoom cannot put the
      // message back for a layer that is no longer on the map.
      notices.length = 0
      map.fire('zoomend')
      expect(notices).toEqual([])
    })

    it('takes the notice down when the user switches to a variable that draws', async () => {
      // Both changes in one reconciliation, which is what the layer control
      // does when a selection moves from one variable to another.
      descriptorFor('A').visible = false
      descriptorFor('B').visible = true
      await layer._syncCogLayers()
      expect(notices.at(-1)).toBeNull()
      notices.length = 0
      map.fire('zoomend')
      expect(notices).toEqual([])
    })

    it('clears itself once the user zooms in far enough', async () => {
      map.zoom = 9
      map.fire('zoomend')
      expect(notices.at(-1)).toBeNull()
      // Zooming further must not keep clearing: another format's notice would
      // be the one on screen by then.
      notices.length = 0
      map.fire('zoomend')
      expect(notices).toEqual([])
      map.zoom = 4
      map.fire('zoomend')
      expect(notices.at(-1)).toMatchObject({ reason: ZARR_NOTICE_ZOOM_IN })
    })

    it('leaves another format\'s notice alone after a teardown', async () => {
      // A basemap switch tears the raster layers down. Nothing is held back
      // after that, so a GeoParquet notice posted next has to survive every
      // zoom the user makes.
      layer._removeCogLayers()
      notices.length = 0
      map.fire('zoomend')
      map.zoom = 9
      map.fire('zoomend')
      expect(notices).toEqual([])
    })

    it('keeps a refusal on screen rather than restoring a stale zoom notice', async () => {
      // Variable B cannot be drawn at all. Its refusal takes the notice slot
      // from A's zoom message, and a later zoom must not hand it back.
      layer._makeZarrLayerProps = openAs({
        A: { minZoom: 8 },
        B: { error: new ZarrUnsuitableError(ZARR_NOTICE_CHUNK_SHAPE, 'chunked for time series', { amplification: 1440 }) },
      })
      descriptorFor('B').visible = true
      await layer._syncCogLayers()
      expect(notices.at(-1)).toMatchObject({
        format: 'zarr',
        reason: ZARR_NOTICE_CHUNK_SHAPE,
        amplification: 1440,
      })

      notices.length = 0
      map.fire('zoomend')
      expect(notices).toEqual([])
    })

    it('leaves a GeoParquet notice alone when the user zooms', () => {
      // One notice slot, two formats. A GeoParquet file too large to draw puts
      // its message up; a Zarr variable held back below its zoom re-posts on
      // every zoomend, and without knowing what is already on screen it
      // replaced that message the moment the user zoomed.
      notices.length = 0
      layer._postNotice({ format: 'parquet', reason: 'vector-too-large' })
      map.fire('zoomend')
      expect(notices.at(-1)).toMatchObject({ format: 'parquet' })
    })
  })

  describe('a refusal notice', () => {
    beforeEach(async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      layer._makeZarrLayerProps = openAs({
        A: { error: new ZarrUnsuitableError(ZARR_NOTICE_CHUNK_SHAPE, 'chunked for time series', { amplification: 1440 }) },
        B: { minZoom: 0 },
      })
      const asset = zarrAsset(twoVariables)
      layer.setStac(fakeStac([asset]))
      await layer.setAssets([asset])
      expect(notices.at(-1)).toMatchObject({ reason: ZARR_NOTICE_CHUNK_SHAPE })
    })

    it('comes down when the refused variable is switched off', async () => {
      // Nothing is on the map any more, so a message about why a layer was
      // refused is about nothing. Only the zoom notice had a teardown, so this
      // one stayed on screen for a variable the user had turned off.
      await layer.setCogVisible('zarr:zarr:A', false)
      expect(notices.at(-1)).toBeNull()
    })

    it('comes down when the user switches to a variable that draws', async () => {
      descriptorFor('A').visible = false
      descriptorFor('B').visible = true
      await layer._syncCogLayers()
      expect(notices.at(-1)).toBeNull()
    })
  })

  describe('a Zarr layer that fails to open', () => {
    it('says so even when the failure carries no reason', async () => {
      layer._makeZarrLayerProps = async () => { throw new Error('NotFoundError: /zarr.json') }
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const asset = zarrAsset([twoVariables[0]])
      layer.setStac(fakeStac([asset]))
      await layer.setAssets([asset])

      expect(notices.at(-1)).toMatchObject({
        format: 'zarr',
        reason: ZARR_NOTICE_ERROR,
        title: 'Fire characterisation',
      })
      console.warn.mockRestore()
    })

    it('reads as the generic load error in MapView', () => {
      const text = MapView.computed.zarrNoticeText.call({
        vectorNotice: { format: 'zarr', reason: ZARR_NOTICE_ERROR, title: 'Fire characterisation' },
        $t: key => key,
      })
      expect(text).toBe('mapping.zarr.loadError')
    })

    it('reads an axis-order refusal as its own message, not the generic one', () => {
      // Without its own key this refusal fell through to the load error, which
      // says the browser failed rather than what is wrong with the store. The
      // axis names are passed as values, so the sentence around them can be
      // translated.
      const seen = []
      const text = MapView.computed.zarrNoticeText.call({
        vectorNotice: {
          format: 'zarr',
          reason: ZARR_NOTICE_ORDER,
          title: 'Tessera global RGB mosaic',
          kind: 'axes',
          y: 'lat',
          x: 'lon',
        },
        $t: (key, values) => { seen.push(values); return key },
      })
      expect(text).toBe('mapping.zarr.orderAxes')
      expect(seen[0]).toEqual({ title: 'Tessera global RGB mosaic', y: 'lat', x: 'lon' })
    })

    it('reads a column-major refusal as its own message', () => {
      const text = MapView.computed.zarrNoticeText.call({
        vectorNotice: {
          format: 'zarr', reason: ZARR_NOTICE_ORDER, title: 'A Fortran-order store', kind: 'columnMajor',
        },
        $t: key => key,
      })
      expect(text).toBe('mapping.zarr.orderColumnMajor')
    })

    it('reads a transpose-codec refusal as its own message', () => {
      const seen = []
      const text = MapView.computed.zarrNoticeText.call({
        vectorNotice: {
          format: 'zarr', reason: ZARR_NOTICE_ORDER, title: 'A transposed store',
          kind: 'transpose', order: '1, 0',
        },
        $t: (key, values) => { seen.push(values); return key },
      })
      expect(text).toBe('mapping.zarr.orderTranspose')
      expect(seen[0]).toMatchObject({ order: '1, 0' })
    })
  })

  describe('the item\'s bounding box', () => {
    it('is read before the Zarr backend loads, not after', async () => {
      // Loading the backend is a chunk download. The user can navigate away
      // while it is in flight, which nulls `this.stac`; the box read after the
      // await would then be undefined and the zoom guard would widen from the
      // item's extent to the whole world. See issue #73.
      let release
      layer._loadZarrDeps = () => new Promise(resolve => { release = resolve })
      const asset = zarrAsset([twoVariables[0]])
      layer.setStac(fakeStac([asset], [10, 20, 11, 21]))
      const pending = layer.setAssets([asset])
      await tick()

      layer.stac = null
      release({ ZarrLayer: FakeZarrLayer, zarr: {} })
      await pending
      await tick()

      expect(zarrProps.calls).toHaveLength(1)
      expect(zarrProps.calls[0].bbox).toEqual([10, 20, 11, 21])
    })
  })

  describe('the layer cap', () => {
    it('lists at most the cap and counts the rest as overflow', async () => {
      // A weather archive names twenty-five variables. Listing them all floods
      // the picker, and each one switched on costs a 64 MB cache and sixteen
      // requests in flight.
      layer._makeZarrLayerProps = openAs({})
      const bands = Array.from({ length: 25 }, (unused, i) => ({
        name: `v${i}`, description: `Variable ${i}`, nodata: -9,
      }))
      const asset = zarrAsset(bands)
      layer.setStac(fakeStac([asset]))
      await layer.setAssets([asset])

      expect(layer._cogList).toHaveLength(16)
      expect(layer.getCogOverflowCount()).toBe(9)
      // The variable the render was written for is listed whatever the cap
      // says, because it is the one that draws.
      expect(layer._cogList.filter(d => d.visible).map(d => d.variable.name)).toEqual(['v0'])
      expect(layer._cogList[0].variable.name).toBe('v0')
    })

    it('shares the cap with the COGs already listed', async () => {
      // One picker, one cap. A Zarr store counted against a budget of its own
      // listed sixteen variables beside sixteen COGs, which is thirty-two
      // entries in a picker that is meant to hold sixteen.
      layer._makeZarrLayerProps = openAs({})
      layer._makeCogLayerProps = async () => ({})
      const cogs = Array.from({ length: 10 }, (unused, i) => ({
        type: 'image/tiff; application=geotiff',
        title: `Scene ${i}`,
        roles: ['data'],
        getKey: () => `cog${i}`,
        getAbsoluteUrl: () => `https://example.com/scene${i}.tif`,
        href: `https://example.com/scene${i}.tif`,
      }))
      const bands = Array.from({ length: 25 }, (unused, i) => ({
        name: `v${i}`, description: `Variable ${i}`, nodata: -9,
      }))
      const asset = zarrAsset(bands)
      layer.setStac(fakeStac([...cogs, asset]))
      await layer.setAssets([asset])

      expect(layer._cogList.length).toBeLessThanOrEqual(16)
      // The variable the render was written for is listed whatever the cap
      // says, because it is the one that draws.
      expect(layer._cogList.some(d => d.variable?.name === 'v0')).toBe(true)
    })

    it('lists every variable of a store that fits', async () => {
      layer._makeZarrLayerProps = openAs({})
      const asset = zarrAsset(twoVariables)
      layer.setStac(fakeStac([asset]))
      await layer.setAssets([asset])
      expect(layer._cogList).toHaveLength(2)
      expect(layer.getCogOverflowCount()).toBe(0)
    })
  })
})
