import { describe, it, expect, beforeEach, vi } from 'vitest'

// The tile-path race tests need a PMTiles whose getHeader()/getMetadata() can
// be gated on a promise, so the module is mocked with a minimal double.
// `pmtilesTestHooks.header`/`.metadata` let individual tests take over those
// calls; null hooks fall back to instant defaults. The Protocol double keeps
// MapMixin's module-level `new Protocol()` + `addProtocol` happy.
const pmtilesTestHooks = vi.hoisted(() => ({ header: null, metadata: null }))
vi.mock('pmtiles', () => {
  class PMTiles {
    constructor(url) {
      this.url = url
      this.source = { getKey: () => url }
    }
    async getHeader() {
      return pmtilesTestHooks.header ? pmtilesTestHooks.header(this.url) : { tileType: 1 }
    }
    async getMetadata() {
      return pmtilesTestHooks.metadata ? pmtilesTestHooks.metadata(this.url) : {}
    }
  }
  class SharedPromiseCache {}
  class Protocol {
    constructor() {
      this.tile = () => {}
    }
    add() {}
  }
  return { PMTiles, SharedPromiseCache, Protocol }
})

import StacMapLayer, { isGlobalBbox } from '../../src/components/maps/StacMapLayer.js'

// Minimal fake of a MapLibre GL map that faithfully reproduces the behavior
// that surfaced the bug: addSource/addLayer throw when the id already exists,
// just like the real implementation. Sources/layers persist until explicitly
// removed, mirroring how imperatively-added sources can survive a setStyle().
function createFakeMap() {
  const sources = new Map()
  const layers = new Map()
  return {
    sources,
    layers,
    addSource(id, spec) {
      if (sources.has(id)) {
        throw new Error(`Source "${id}" already exists.`)
      }
      sources.set(id, spec)
    },
    getSource(id) {
      return sources.get(id)
    },
    removeSource(id) {
      if (!sources.has(id)) {
        throw new Error(`There is no source with this ID "${id}"`)
      }
      sources.delete(id)
    },
    addLayer(spec) {
      if (layers.has(spec.id)) {
        throw new Error(`Layer "${spec.id}" already exists.`)
      }
      layers.set(spec.id, spec)
    },
    getLayer(id) {
      return layers.get(id)
    },
    removeLayer(id) {
      if (!layers.has(id)) {
        throw new Error(`The layer "${id}" does not exist in the map's style.`)
      }
      layers.delete(id)
    },
    getStyle() {
      return { layers: [...layers.values()] }
    },
    getLayoutProperty() {
      return undefined
    },
    setLayoutProperty() {},
  }
}

// An XYZ vector tile asset exercises the same guarded source path as PMTiles
// without requiring network access or the pmtiles protocol, making it ideal
// for a fast, deterministic unit test.
function xyzVectorAsset() {
  return {
    href: 'https://example.com/tiles/{z}/{x}/{y}.pbf',
    type: 'application/vnd.mapbox-vector-tile',
    title: 'Test tiles',
  }
}

// A Cloud-Optimized GeoTIFF asset. The deck.gl render path is guarded off when
// the (fake) map has no addControl, so these exercise the list/visibility logic
// without network or WebGL.
function cogAsset(key, opts = {}) {
  return {
    type: 'image/tiff; application=geotiff; profile=cloud-optimized',
    title: opts.title,
    roles: opts.roles || ['data'],
    bands: [],
    getKey: () => key,
    getAbsoluteUrl: () => `https://example.com/${key}.tif`,
    href: `https://example.com/${key}.tif`,
  }
}

function fakeStac(assets, renders) {
  return { getAssets: () => assets, toGeoJSON: () => null, renders }
}

// A COG asset that exposes only `.key` (no getKey()), as some stac-js asset
// shapes do. Exercises the cogKey() fallback end-to-end.
function cogAssetKeyOnly(key) {
  return {
    type: 'image/tiff; application=geotiff; profile=cloud-optimized',
    roles: ['data'],
    bands: [],
    key,
    getAbsoluteUrl: () => `https://example.com/${key}.tif`,
    href: `https://example.com/${key}.tif`,
  }
}

// A deck.gl backend test double + a map that accepts a deck overlay control, so
// the COG render reconciliation (_syncCogLayers / _makeCogLayer / cache) can be
// exercised without WebGL. Inject via `layer._loadDeckDeps`.
function fakeDeckDeps() {
  class FakeCOGLayer {
    constructor(props) { this.props = props }
  }
  class FakeOverlay {
    constructor(props) { this.props = props; this.setPropsCount = 0 }
    setProps(props) { this.props = { ...this.props, ...props }; this.setPropsCount++ }
  }
  class FakeDecoderPool {
    constructor(opts) { this.opts = opts }
  }
  return async () => ({ MapboxOverlay: FakeOverlay, COGLayer: FakeCOGLayer, DecoderPool: FakeDecoderPool })
}

function createDeckCapableMap() {
  const map = createFakeMap()
  map.controls = []
  map.addControl = (c) => { map.controls.push(c) }
  map.removeControl = (c) => { map.controls = map.controls.filter(x => x !== c) }
  return map
}

const overlayLayerIds = layer =>
  (layer._deckOverlay?.props.layers || []).map(l => l.props.id)

describe('StacMapLayer', () => {
  let map
  let layer

  beforeEach(() => {
    map = createFakeMap()
    layer = new StacMapLayer(map)
  })

  describe('COG layer list', () => {
    const cogOverlays = l =>
      l.getAssetOverlays().filter(o => o.type === 'deckgl')
    const cogIds = l => cogOverlays(l).map(o => o.id)
    const visibleCogIds = l =>
      cogOverlays(l).filter(o => o.visible).map(o => o.id)

    it('lists every COG asset of the item, not just the active one', async () => {
      const assets = ['a', 'b', 'c', 'd', 'e', 'f'].map(k => cogAsset(k))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[0]])
      expect(cogIds(layer)).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
    })

    it('shows exactly one COG (the active one) on by default', async () => {
      const assets = ['a', 'b', 'c'].map(k => cogAsset(k))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[1]])
      expect(visibleCogIds(layer)).toEqual(['b'])
    })

    it('caps the list at 8 COGs', async () => {
      const assets = Array.from({ length: 10 }, (_, i) => cogAsset(`c${i}`))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[0]])
      expect(cogIds(layer)).toHaveLength(8)
    })

    it('setCogVisible toggles by id and allows multiple visible at once', async () => {
      const assets = ['a', 'b', 'c'].map(k => cogAsset(k))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[0]])
      layer.setCogVisible('b', true)
      expect(visibleCogIds(layer)).toEqual(['a', 'b'])
      layer.setCogVisible('a', false)
      expect(visibleCogIds(layer)).toEqual(['b'])
    })

    it('show-on-map solos: re-selecting one asset turns the others off', async () => {
      const assets = ['a', 'b', 'c'].map(k => cogAsset(k))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[0]])
      layer.setCogVisible('b', true)
      layer.setCogVisible('c', true)
      await layer.setAssets([assets[1]])
      expect(visibleCogIds(layer)).toEqual(['b'])
    })

    it('swaps a not-listed COG into the capped list, evicting the last entry', async () => {
      const assets = Array.from({ length: 9 }, (_, i) => cogAsset(`c${i}`))
      layer.setStac(fakeStac(assets))
      await layer.setAssets([assets[0]])
      expect(cogIds(layer)).toEqual([
        'c0', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7',
      ])

      await layer.setAssets([assets[8]])
      const ids = cogIds(layer)
      expect(ids).toHaveLength(8)
      expect(ids).toContain('c8')
      expect(ids).not.toContain('c7')
      expect(visibleCogIds(layer)).toEqual(['c8'])
    })
  })

  describe('readdAfterStyleChange', () => {
    it('re-adds tile assets without throwing "source already exists"', async () => {
      await layer.setAssets([xyzVectorAsset()])
      expect(map.sources.has('stac-tile-0')).toBe(true)

      // Reproduces issue #13: a basemap change re-runs the layer setup while
      // the previous source still exists on the map.
      await expect(layer.readdAfterStyleChange()).resolves.not.toThrow()

      expect(map.sources.has('stac-tile-0')).toBe(true)
    })

    it('does not duplicate or leak the tile source across repeated changes', async () => {
      await layer.setAssets([xyzVectorAsset()])

      await layer.readdAfterStyleChange()
      await layer.readdAfterStyleChange()

      const tileSources = [...map.sources.keys()].filter(id =>
        id.startsWith('stac-tile-')
      )
      expect(tileSources).toEqual(['stac-tile-0'])
      expect(layer._overlaySourceIds).toEqual(['stac-tile-0'])
    })

    it('preserves the rendered tile layers after a style change', async () => {
      await layer.setAssets([xyzVectorAsset()])
      const before = layer._overlayLayerIds.length
      expect(before).toBeGreaterThan(0)

      await layer.readdAfterStyleChange()

      expect(layer._overlayLayerIds.length).toBe(before)
      for (const id of layer._overlayLayerIds) {
        expect(map.layers.has(id)).toBe(true)
      }
    })
  })

  describe('isGlobalBbox', () => {
    it('is true for a full-world bbox', () => {
      expect(isGlobalBbox([-180, -84, 180, 84])).toBe(true)
    })

    it('is true for a near-global bbox', () => {
      // The FTW global grid: -180..180 lon, -60..84 lat
      expect(isGlobalBbox([-180, -60, 180, 84])).toBe(true)
    })

    it('is false for a country-sized bbox', () => {
      // Netherlands-ish
      expect(isGlobalBbox([3.3, 50.7, 7.2, 53.6])).toBe(false)
    })

    it('is false for a continent that is not full-width', () => {
      // Africa spans ~75° of longitude — wide, but not global.
      expect(isGlobalBbox([-20, -35, 55, 38])).toBe(false)
    })

    it('is false for missing/short bboxes', () => {
      expect(isGlobalBbox(null)).toBe(false)
      expect(isGlobalBbox([0, 0, 1])).toBe(false)
    })
  })

  describe('fit', () => {
    function fitMap() {
      const calls = { fitBounds: [], jumpTo: [] }
      return {
        calls,
        getLayoutProperty: () => undefined,
        setLayoutProperty: () => {},
        // A deliberately far-north center, as web-mercator cameraForBounds
        // returns for global bounds — fit() should not use this latitude.
        cameraForBounds: () => ({ center: [0, 45], zoom: 1 }),
        fitBounds: (bounds, opts) => calls.fitBounds.push({ bounds, opts }),
        jumpTo: (opts) => calls.jumpTo.push(opts),
      }
    }
    const stacWith = bbox => ({ getBoundingBox: () => bbox })

    it('zooms a global dataset in 2 levels past the fit zoom', () => {
      const m = fitMap()
      const l = new StacMapLayer(m)
      l.stac = stacWith([-180, -60, 180, 84])
      l.fit()
      expect(m.calls.jumpTo).toHaveLength(1)
      expect(m.calls.jumpTo[0].zoom).toBe(3) // cameraForBounds zoom 1 + 2
      // Centered on the geographic midpoint of the bbox, not the far-north
      // mercator center: midLon 0, midLat (-60 + 84) / 2 = 12.
      expect(m.calls.jumpTo[0].center).toEqual([0, 12])
      expect(m.calls.fitBounds).toHaveLength(0)
    })

    it('uses plain fitBounds for a non-global dataset', () => {
      const m = fitMap()
      const l = new StacMapLayer(m)
      l.stac = stacWith([3.3, 50.7, 7.2, 53.6])
      l.fit()
      expect(m.calls.fitBounds).toHaveLength(1)
      expect(m.calls.jumpTo).toHaveLength(0)
    })
  })

  describe('_addOverlaySource', () => {
    it('replaces an existing source instead of throwing', () => {
      layer._addOverlaySource('stac-tile-0', { type: 'vector', tiles: ['a'] })
      expect(() =>
        layer._addOverlaySource('stac-tile-0', { type: 'vector', tiles: ['b'] })
      ).not.toThrow()

      expect(map.sources.get('stac-tile-0').tiles).toEqual(['b'])
      expect(layer._overlaySourceIds).toEqual(['stac-tile-0'])
    })
  })

  // Exercises the actual deck.gl reconciliation (_syncCogLayers / _makeCogLayer /
  // cache) by injecting a deck backend test double — no WebGL needed.
  describe('COG render reconciliation (deck path)', () => {
    let dmap, dlayer
    beforeEach(() => {
      dmap = createDeckCapableMap()
      dlayer = new StacMapLayer(dmap)
      dlayer._loadDeckDeps = fakeDeckDeps()
    })

    it('renders only the active COG as a deck layer', async () => {
      const assets = ['a', 'b', 'c'].map(k => cogAsset(k))
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[1]])
      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-b'])
      expect(dmap.controls).toHaveLength(1)
    })

    it('reuses the cached COGLayer instance when toggling another COG on', async () => {
      const assets = ['a', 'b'].map(k => cogAsset(k))
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[0]])
      const firstA = dlayer._cogLayerCache.get('a')
      await dlayer.setCogVisible('b', true)
      // 'a' must be the same instance — re-creating it would abort its tiles.
      expect(dlayer._cogLayerCache.get('a')).toBe(firstA)
      expect(overlayLayerIds(dlayer).sort()).toEqual(['stac-cog-a', 'stac-cog-b'])
    })

    it('prunes cached layers that drop off the list', async () => {
      const assets = Array.from({ length: 9 }, (_, i) => cogAsset(`c${i}`))
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[0]])
      expect(dlayer._cogLayerCache.has('c0')).toBe(true)
      // 8 actives (c1..c8) fill the cap, so c0 falls off the list entirely.
      await dlayer.setAssets(assets.slice(1, 9))
      expect(dlayer._cogLayerCache.has('c0')).toBe(false)
      expect([...dlayer._cogLayerCache.keys()].sort())
        .toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'])
    })

    it('removes the overlay when the last COG is hidden', async () => {
      const assets = [cogAsset('a')]
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[0]])
      expect(dmap.controls).toHaveLength(1)
      await dlayer.setCogVisible('a', false)
      expect(dmap.controls).toHaveLength(0)
      expect(dlayer._deckOverlay).toBeNull()
    })

    it('rebuilds COG layers after a style change re-adds the same assets', async () => {
      const assets = [cogAsset('a')]
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[0]])
      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-a'])
      // Basemap/style change tears everything down then re-adds identical assets.
      dlayer.assets = assets
      await dlayer.readdAfterStyleChange()
      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-a'])
    })

    it('handles COG assets that expose only .key (no getKey)', async () => {
      const assets = [cogAssetKeyOnly('k1'), cogAssetKeyOnly('k2')]
      dlayer.setStac(fakeStac(assets))
      await dlayer.setAssets([assets[0]])
      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-k1'])
    })

    it('synthesizes a render from the first declared render for an untargeted asset', async () => {
      const assets = [cogAsset('disp')]
      const renders = {
        alpha: { colormap_name: 'viridis', assets: ['other'] },
        beta: { colormap_name: 'magma', assets: ['other'] },
      }
      dlayer.setStac(fakeStac(assets, renders))
      await dlayer.setAssets([assets[0]])
      expect(dlayer._cogList[0].render.colormap_name).toBe('viridis')
    })

    it('a stale COG sync cannot repoint the overlay after a newer setAssets', async () => {
      // Race from todo 008 (deck path): call A suspends inside _loadDeckDeps;
      // call B tears A down and renders COG 'b'. A's continuation captured its
      // own visible list before the await — without the epoch check it would
      // setProps B's overlay back to 'a' and re-cache A's stale layer.
      let release
      let reached
      const depsStarted = new Promise(resolve => { reached = resolve })
      const gate = new Promise(resolve => { release = resolve })
      const loadDeps = fakeDeckDeps()
      let depsCalls = 0
      dlayer._loadDeckDeps = async () => {
        depsCalls++
        if (depsCalls === 1) {
          reached()
          await gate
        }
        return loadDeps()
      }
      const assets = ['a', 'b'].map(k => cogAsset(k))
      dlayer.setStac(fakeStac(assets))

      const first = dlayer.setAssets([assets[0]])
      await depsStarted // first run is now suspended loading the deck backend
      const second = dlayer.setAssets([assets[1]])
      await second
      release()
      await first

      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-b'])
      expect(dmap.controls).toHaveLength(1)
      expect([...dlayer._cogLayerCache.keys()]).toEqual(['b'])
    })
  })

  // Exercises the GeoParquet fallback (_addParquetAssets) by injecting a
  // parquet backend test double via the `_loadParquetDeps` seam — no network
  // and no hyparquet involvement.
  describe('GeoParquet fallback', () => {
    const FEATURE_COLLECTION = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
        properties: { name: 'park' },
      }],
    }

    function parquetAsset(extra = {}) {
      return {
        href: 'https://example.com/data.parquet',
        type: 'application/vnd.apache.parquet',
        roles: ['data'],
        title: 'Test parquet',
        ...extra,
      }
    }

    function injectParquetDeps(l, impl) {
      const calls = []
      // depsLoads counts _loadParquetDeps invocations: in production each one
      // downloads the lazy hyparquet chunk, so the declared-metadata gates
      // must reject without ever incrementing it.
      const depsLoads = { count: 0 }
      // The loader options of each call, so tests can assert which attribute
      // columns the layer asked for (see setStyleFields).
      const opts = []
      l._loadParquetDeps = async () => {
        depsLoads.count++
        return {
          loadGeoJsonFromParquet: async (url, options = {}) => {
            calls.push(url)
            opts.push(options)
            return impl(url)
          },
        }
      }
      calls.depsLoads = depsLoads
      calls.opts = opts
      return calls
    }

    // `notices` records every onVectorNotice call, including the `null`
    // clear that setAssets fires at the start of every real run — so tests
    // assert the full lifecycle, not just the set half. `lastNotice()` mirrors
    // what MapView would currently display.
    let notices
    const lastNotice = () => notices[notices.length - 1]

    beforeEach(() => {
      notices = []
      layer = new StacMapLayer(map, { onVectorNotice: n => notices.push(n) })
    })

    it('renders a parquet asset as a geojson source with default layers', async () => {
      injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset()])

      expect(map.sources.get('stac-parquet-0')).toEqual({ type: 'geojson', data: FEATURE_COLLECTION })
      const layerIds = layer._overlayLayerIds
      expect(layerIds).toHaveLength(3)
      for (const id of layerIds) {
        expect(map.layers.get(id)['source-layer']).toBeUndefined()
        expect(map.layers.get(id).source).toBe('stac-parquet-0')
      }
      expect(notices).toEqual([null])
    })

    it('lists the rendered parquet in the layer picker as a maplibre overlay', async () => {
      injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset()])

      const overlays = layer.getAssetOverlays()
      expect(overlays).toHaveLength(1)
      expect(overlays[0]).toMatchObject({ id: 'stac-parquet-0', title: 'Test parquet', type: 'maplibre', visible: true })
    })

    it('renders only the first passing asset when several parquet assets exist', async () => {
      // First-passing-asset-wins cap: the data-role sort ranks the candidates
      // and the first one through the gates renders; the rest are never
      // downloaded (bounds the multi-asset worst case to one full download).
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([
        parquetAsset({ href: 'https://example.com/no-role.parquet', roles: [] }),
        parquetAsset({ href: 'https://example.com/data-role.parquet' }),
      ])

      // The data-role asset ranks first and wins; the other is not fetched.
      expect([...calls]).toEqual(['https://example.com/data-role.parquet'])
      expect(map.sources.has('stac-parquet-0')).toBe(true)
      expect(map.sources.has('stac-parquet-1')).toBe(false)
      expect(layer._overlayAssetMeta).toHaveLength(1)
    })

    it('falls through to the next asset when the best-ranked one fails', async () => {
      const calls = injectParquetDeps(layer, (url) => {
        if (url.includes('broken')) { throw new Error('boom') }
        return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
      })
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([
          parquetAsset({ href: 'https://example.com/broken.parquet' }),
          parquetAsset({ href: 'https://example.com/ok.parquet' }),
        ])
      } finally {
        warn.mockRestore()
      }

      expect([...calls]).toEqual(['https://example.com/broken.parquet', 'https://example.com/ok.parquet'])
      expect(map.sources.has('stac-parquet-1')).toBe(true)
      // A later success suppresses the earlier failure's notice.
      expect(lastNotice()).toBeNull()
    })

    it('refuses non-http(s) parquet hrefs without fetching', async () => {
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset({ href: 'data:application/octet-stream;base64,AAAA' })])
      } finally {
        warn.mockRestore()
      }

      expect(calls).toHaveLength(0)
      expect(calls.depsLoads.count).toBe(0)
      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'error' }])
    })

    it('never touches parquet when a tile asset is present', async () => {
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([xyzVectorAsset(), parquetAsset()])

      expect(calls).toHaveLength(0)
      expect(map.sources.has('stac-tile-0')).toBe(true)
      expect(map.sources.has('stac-parquet-0')).toBe(false)
    })

    it('skips loading entirely when STAC metadata declares too many features', async () => {
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset({ 'geoparquet:feature_count': 20000 })])

      expect(calls).toHaveLength(0)
      expect(calls.depsLoads.count).toBe(0)
      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'tooLarge', totalRows: 20000, max: 10000 }])
    })

    it('skips loading when the declared file size is over the byte guard', async () => {
      const declared = 200 * 1024 * 1024
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset({ 'file:size': declared })])

      expect(calls).toHaveLength(0)
      expect(calls.depsLoads.count).toBe(0)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'tooBig', byteLength: declared, maxBytes: 50 * 1024 * 1024 }])
    })

    it('notifies when the parquet footer row count exceeds the cap', async () => {
      injectParquetDeps(layer, () => ({ exceeded: true, reason: 'tooLarge', totalRows: 123456 }))
      await layer.setAssets([parquetAsset()])

      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'tooLarge', totalRows: 123456, max: 10000 }])
    })

    it('notifies with tooBig when the loader rejects on actual byte length', async () => {
      const byteLength = 90 * 1024 * 1024
      injectParquetDeps(layer, () => ({ exceeded: true, reason: 'tooBig', byteLength }))
      await layer.setAssets([parquetAsset()])

      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'tooBig', byteLength, maxBytes: 50 * 1024 * 1024 }])
    })

    it('notifies with an error and does not crash when loading fails', async () => {
      injectParquetDeps(layer, () => { throw new Error('boom') })
      await expect(layer.setAssets([parquetAsset()])).resolves.not.toThrow()

      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'error' }])
    })

    it('renders the survivors and warns when reprojection dropped some features', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: FEATURE_COLLECTION,
        totalRows: 4,
        reprojectedFrom: 'EPSG:28992',
        droppedFeatures: 3,
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
        // Asserted before mockRestore(), which clears the recorded calls.
        expect(warn).toHaveBeenCalledWith(expect.stringMatching(/Dropped 3 feature\(s\).*EPSG:28992/))
      } finally {
        warn.mockRestore()
      }
      // Partial data still renders — and without an error banner over it.
      expect(map.sources.has('stac-parquet-0')).toBe(true)
      expect(notices).toEqual([null])
    })

    it('reports an error instead of an empty map when nothing survived reprojection', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: { type: 'FeatureCollection', features: [] },
        totalRows: 3,
        reprojectedFrom: 'EPSG:28992',
        droppedFeatures: 3,
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
      } finally {
        warn.mockRestore()
      }

      expect(map.sources.has('stac-parquet-0')).toBe(false)
      // Not `error`: the file downloaded and parsed fine, so the notice has to
      // say the coordinates could not be placed rather than blame the load.
      expect(notices).toEqual([
        null,
        { format: 'geoparquet', reason: 'reprojection', crs: 'EPSG:28992' },
      ])
    })

    it('warns about dropped features once, not again on every basemap switch', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: FEATURE_COLLECTION,
        totalRows: 4,
        reprojectedFrom: 'EPSG:28992',
        droppedFeatures: 3,
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
        await layer.readdAfterStyleChange()
        await layer.readdAfterStyleChange()
        const dropWarns = warn.mock.calls.filter(([msg]) => typeof msg === 'string' && msg.includes('Dropped 3 feature(s)'))
        expect(dropWarns).toHaveLength(1)
      } finally {
        warn.mockRestore()
      }
    })

    it('does not warn when nothing was dropped', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: FEATURE_COLLECTION,
        totalRows: 1,
        reprojectedFrom: 'EPSG:28992',
        droppedFeatures: 0,
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
        const dropWarns = warn.mock.calls.filter(([msg]) => typeof msg === 'string' && msg.includes('Dropped'))
        expect(dropWarns).toHaveLength(0)
      } finally {
        warn.mockRestore()
      }
    })

    // A style's `step`/`interpolate` over an attribute the file doesn't carry
    // paints solid black with no error anywhere. The read knows exactly which
    // columns it failed to deliver, so it has to say so.
    it('names the style attributes the file could not provide', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: FEATURE_COLLECTION,
        totalRows: 1,
        missingFields: ['bevolking', 'naam'],
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
        // Once per read: a basemap switch re-runs against the cache and must
        // not repeat it.
        await layer.readdAfterStyleChange()
        const missing = warn.mock.calls.filter(([m]) => typeof m === 'string' && m.includes('style attribute'))
        expect(missing).toHaveLength(1)
        expect(missing[0][0]).toContain('bevolking, naam')
      } finally {
        warn.mockRestore()
      }
      expect(map.sources.has('stac-parquet-0')).toBe(true)
    })

    it('says nothing when the file provided every attribute the styles wanted', async () => {
      injectParquetDeps(layer, () => ({
        exceeded: false,
        featureCollection: FEATURE_COLLECTION,
        totalRows: 1,
        missingFields: [],
      }))
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        await layer.setAssets([parquetAsset()])
        expect(warn.mock.calls.filter(([m]) => typeof m === 'string' && m.includes('style attribute'))).toHaveLength(0)
      } finally {
        warn.mockRestore()
      }
    })

    it('survives a basemap change without duplicating the source', async () => {
      injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset()])
      const before = layer._overlayLayerIds.length

      await expect(layer.readdAfterStyleChange()).resolves.not.toThrow()

      const parquetSources = [...map.sources.keys()].filter(id => id.startsWith('stac-parquet-'))
      expect(parquetSources).toEqual(['stac-parquet-0'])
      expect(layer._overlayLayerIds.length).toBe(before)
    })

    it('re-renders from the instance cache instead of re-downloading on a basemap switch', async () => {
      // readdAfterStyleChange clears the setAssets signature so the asset set
      // is rebuilt — but the rebuild must come from the instance result
      // cache, not a second full download/decode of the file.
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      await layer.setAssets([parquetAsset()])
      await layer.readdAfterStyleChange()

      expect(calls).toHaveLength(1)
      expect(calls.depsLoads.count).toBe(1)
      expect(map.sources.get('stac-parquet-0')).toEqual({ type: 'geojson', data: FEATURE_COLLECTION })
      expect(layer._overlayLayerIds).toHaveLength(3)
    })

    it('joins the in-flight download when a basemap switch supersedes it mid-read', async () => {
      // The teardown used to abort unconditionally, and errors are never
      // cached — so switching basemap at 90% of a 40MB file threw the bytes
      // away and restarted from zero. The successor wants the identical key.
      let release
      let reached
      const started = new Promise(resolve => { reached = resolve })
      const gate = new Promise(resolve => { release = resolve })
      const signals = []
      let loads = 0
      layer._loadParquetDeps = async () => ({
        loadGeoJsonFromParquet: async (url, { signal } = {}) => {
          loads++
          signals.push(signal)
          reached()
          await gate
          return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
        },
      })

      const first = layer.setAssets([parquetAsset()])
      await started
      const second = layer.readdAfterStyleChange()
      release()
      await Promise.all([first, second])

      expect(loads).toBe(1)
      expect(signals[0].aborted).toBe(false)
      expect(map.sources.get('stac-parquet-0')).toEqual({ type: 'geojson', data: FEATURE_COLLECTION })
      expect(layer._overlayLayerIds).toHaveLength(3)
    })

    it('aborts an in-flight download when the layer is removed', async () => {
      // Nothing will ever read those bytes now, so keeping the fetch alive is
      // pure waste — the one case where aborting is still right.
      let reached
      const started = new Promise(resolve => { reached = resolve })
      const signals = []
      layer._loadParquetDeps = async () => ({
        loadGeoJsonFromParquet: (url, { signal } = {}) => new Promise((resolve, reject) => {
          signals.push(signal)
          reached()
          signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
        }),
      })

      const pending = layer.setAssets([parquetAsset()])
      await started
      layer.remove()
      await pending

      expect(signals[0].aborted).toBe(true)
      expect(layer._parquetInflight.size).toBe(0)
    })

    it('bounds the decoded-result cache so field changes cannot accumulate copies', async () => {
      const calls = injectParquetDeps(layer, () => (
        { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
      ))

      for (const fields of [['a'], ['b'], ['c'], ['d']]) {
        layer.setStyleFields(fields)
        await layer.setAssets([parquetAsset()])
      }

      expect(calls).toHaveLength(4)
      expect(layer._parquetResultCache.size).toBe(3)
      // The oldest field set was evicted; the three most recent survive.
      expect([...layer._parquetResultCache.keys()].map(k => k.split('\n')[1]))
        .toEqual(['b', 'c', 'd'])
    })

    it('caches over-cap results per URL and re-emits the notice without re-downloading', async () => {
      // Over-cap is deterministic for a given URL, so it is cached too. A
      // repeat run (no signature guard: the failed run never recorded one)
      // hits the cache and still surfaces the notice.
      const calls = injectParquetDeps(layer, () => ({ exceeded: true, reason: 'tooLarge', totalRows: 123456 }))
      await layer.setAssets([parquetAsset()])
      await layer.setAssets([parquetAsset()])

      expect(calls).toHaveLength(1)
      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(lastNotice()).toEqual({ format: 'geoparquet', reason: 'tooLarge', totalRows: 123456, max: 10000 })
    })

    it('aborts the in-flight download when a newer setAssets supersedes it, without an error notice', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      try {
        let reached
        const loadStarted = new Promise(resolve => { reached = resolve })
        const signals = []
        layer._loadParquetDeps = async () => ({
          loadGeoJsonFromParquet: (url, { signal } = {}) => new Promise((resolve, reject) => {
            signals.push(signal)
            if (url.includes('slow')) {
              reached()
              // Simulate fetch: reject with AbortError when the signal fires.
              signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
              return
            }
            resolve({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 })
          }),
        })

        const first = layer.setAssets([parquetAsset({ href: 'https://example.com/slow.parquet' })])
        await loadStarted // call A is suspended inside its download
        const second = layer.setAssets([parquetAsset({ href: 'https://example.com/fast.parquet' })])
        await Promise.all([first, second])

        // The teardown in the second call aborted the first call's download.
        expect(signals[0].aborted).toBe(true)
        // The aborted run bails silently — no error notice, no console.warn —
        // and the newer run's source is on the map.
        expect(notices.filter(n => n?.reason === 'error')).toHaveLength(0)
        expect(warn).not.toHaveBeenCalled()
        expect(map.sources.has('stac-parquet-0')).toBe(true)
      } finally {
        warn.mockRestore()
      }
    })

    it('does not duplicate meta/layers when two setAssets calls race across the load', async () => {
      // Two calls with different asset hrefs both pass the signature guard;
      // the slow first load must not add its results on top of the second's.
      let release
      const gate = new Promise(resolve => { release = resolve })
      layer._loadParquetDeps = async () => ({
        loadGeoJsonFromParquet: async (url) => {
          if (url.includes('slow')) { await gate }
          return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
        },
      })

      const first = layer.setAssets([parquetAsset({ href: 'https://example.com/slow.parquet' })])
      const second = layer.setAssets([parquetAsset({ href: 'https://example.com/fast.parquet' })])
      await second
      release()
      await first

      expect(layer._overlayAssetMeta).toHaveLength(1)
      expect(layer._overlayLayerIds).toHaveLength(3)
    })

    it('a superseded run never reaches the COG stage after its parquet load resolves', async () => {
      // Race from todo 002: autoload starts a slow parquet download (call A);
      // the user picks a COG (call B). A's parquet stage bails on the stale
      // epoch — the setAssets tail must bail too, or A rebuilds the COG list
      // from its stale asset set and silently reverts B's selection back to
      // the default COG.
      const dmap = createDeckCapableMap()
      const dlayer = new StacMapLayer(dmap)
      dlayer._loadDeckDeps = fakeDeckDeps()

      let release
      let reached
      const loadStarted = new Promise(resolve => { reached = resolve })
      const gate = new Promise(resolve => { release = resolve })
      dlayer._loadParquetDeps = async () => ({
        loadGeoJsonFromParquet: async () => {
          reached()
          await gate
          return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
        },
      })

      const parquet = parquetAsset()
      const cogs = ['a', 'b'].map(k => cogAsset(k))
      dlayer.setStac(fakeStac([parquet, ...cogs]))

      const first = dlayer.setAssets([parquet])
      await loadStarted // call A is now suspended inside the parquet download
      const second = dlayer.setAssets([cogs[1]]) // the user picks COG 'b'
      await second
      release()
      await first

      // The newer call's selection survives — not the default pick ('a') that
      // A's stale tail would have rebuilt from its parquet-only asset list.
      expect(dlayer._cogList.filter(d => d.visible).map(d => d.id)).toEqual(['b'])
      expect(overlayLayerIds(dlayer)).toEqual(['stac-cog-b'])
      // And A's parquet result was not grafted onto B's state either.
      expect(dlayer._overlayAssetMeta).toHaveLength(0)
    })

    it('retries an identical asset set after a failed load instead of no-oping', async () => {
      // A transient failure (e.g. a 503 on the download) must not cache the
      // asset signature as success — the next identical call has to retry.
      let fail = true
      const calls = injectParquetDeps(layer, () => {
        if (fail) { throw new Error('503') }
        return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
      })

      await layer.setAssets([parquetAsset()])
      expect(map.sources.has('stac-parquet-0')).toBe(false)
      expect(notices).toEqual([null, { format: 'geoparquet', reason: 'error' }])

      fail = false
      await layer.setAssets([parquetAsset()])
      expect(calls).toHaveLength(2)
      expect(map.sources.has('stac-parquet-0')).toBe(true)
      // The retry is a new run: its clear-at-start removes the prior error
      // notice, and the successful load never re-emits one.
      expect(lastNotice()).toBeNull()
    })

    it('still no-ops an identical repeat call after a successful load', async () => {
      const calls = injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))

      await layer.setAssets([parquetAsset()])
      await layer.setAssets([parquetAsset()])

      expect(calls).toHaveLength(1)
      expect(layer._overlayLayerIds).toHaveLength(3)
    })

    it('autoLoadVisualAssets falls back to parquet only when no tile asset exists', async () => {
      injectParquetDeps(layer, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      layer.setStac(fakeStac([parquetAsset()]))
      await layer.autoLoadVisualAssets(layer.stac)
      expect(map.sources.has('stac-parquet-0')).toBe(true)

      const map2 = createFakeMap()
      const layer2 = new StacMapLayer(map2)
      const calls = injectParquetDeps(layer2, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
      layer2.setStac(fakeStac([xyzVectorAsset(), parquetAsset()]))
      await layer2.autoLoadVisualAssets(layer2.stac)
      expect(calls).toHaveLength(0)
      expect(map2.sources.has('stac-tile-0')).toBe(true)
    })

    it('clears a prior notice when a later run renders tiles', async () => {
      // Repro from todo 003: parquet over cap shows a banner, then the user
      // selects a tile asset — the banner must not outlive the parquet state.
      injectParquetDeps(layer, () => ({ exceeded: true, reason: 'tooLarge', totalRows: 123456 }))
      await layer.setAssets([parquetAsset()])
      expect(lastNotice()).toEqual({ format: 'geoparquet', reason: 'tooLarge', totalRows: 123456, max: 10000 })

      await layer.setAssets([xyzVectorAsset()])

      expect(map.sources.has('stac-tile-0')).toBe(true)
      expect(lastNotice()).toBeNull()
    })

    it('a stale run cannot set a notice over a newer successful run', async () => {
      // Call A suspends inside the parquet download and eventually fails;
      // call B supersedes it and renders. A's failure notice must not fire on
      // the stale epoch, and each run's clear-at-start happens synchronously
      // (current-epoch by construction), so B's state is left untouched.
      let release
      let reached
      const loadStarted = new Promise(resolve => { reached = resolve })
      const gate = new Promise(resolve => { release = resolve })
      layer._loadParquetDeps = async () => ({
        loadGeoJsonFromParquet: async (url) => {
          if (url.includes('slow')) {
            reached()
            await gate
            throw new Error('503 after supersession')
          }
          return { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
        },
      })

      const first = layer.setAssets([parquetAsset({ href: 'https://example.com/slow.parquet' })])
      await loadStarted // call A is suspended inside its parquet download
      const second = layer.setAssets([parquetAsset({ href: 'https://example.com/fast.parquet' })])
      await second
      release()
      await first

      // One synchronous clear per run, and no error notice from stale A.
      expect(notices).toEqual([null, null])
      expect(map.sources.has('stac-parquet-0')).toBe(true)
    })

    describe('applyGlStyle with a parquet-backed geojson source', () => {
      // A Portolan style as published: authored against the collection's
      // PMTiles asset, with a `source-layer` naming a layer inside the tiles
      // and a paint expression reading a feature attribute.
      const pmtilesStyle = () => ({
        version: 8,
        sources: { data: { type: 'vector', url: 'pmtiles://https://example.com/tiles.pmtiles' } },
        layers: [{
          id: 'styled-fill',
          type: 'fill',
          source: 'data',
          'source-layer': 'parks',
          paint: { 'fill-color': ['match', ['get', 'name'], 'park', '#0f0', '#f00'] },
        }],
      })

      const loadedParquet = async (l = layer) => {
        const calls = injectParquetDeps(l, () => ({ exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }))
        await l.setAssets([parquetAsset()])
        return calls
      }

      it('binds the style to the geojson source with source-layer stripped', async () => {
        await loadedParquet()
        expect(layer._overlayLayerIds).toHaveLength(3)

        layer.applyGlStyle(pmtilesStyle())

        // The style's own layer replaces the three default layers.
        expect(layer._overlayLayerIds).toEqual(['styled-fill'])
        const styled = map.layers.get('styled-fill')
        expect(styled.source).toBe('stac-parquet-0')
        // MapLibre rejects `source-layer` on a geojson source, so it is
        // dropped; the paint the publisher authored is kept verbatim.
        expect(styled['source-layer']).toBeUndefined()
        expect(styled.paint).toEqual(pmtilesStyle().layers[0].paint)
        // The default layers it superseded are gone from the map, not just
        // from the id list.
        expect([...map.layers.keys()]).toEqual(['styled-fill'])
      })

      it('reads the attribute columns the style needs when they were requested up front', async () => {
        layer.setStyleFields(['name'])
        const calls = await loadedParquet()

        expect(calls.opts[0].fields).toEqual(['name'])
      })

      // Which columns to keep is an input to the read, not a race against it.
      // Losing that race used to be permanent: the attribute-less result was
      // cached, `_assetsSig` recorded, and every later setAssets no-opped.
      describe('waiting for style fields', () => {
        it('does not read until the declared fields arrive', async () => {
          layer.expectStyleFields()
          const calls = injectParquetDeps(layer, () => (
            { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
          ))

          const pending = layer.setAssets([parquetAsset()])
          await Promise.resolve()
          await Promise.resolve()
          expect(calls).toHaveLength(0)

          layer.setStyleFields(['naam'])
          await pending

          expect(calls).toHaveLength(1)
          expect(calls.opts[0].fields).toEqual(['naam'])
        })

        it('proceeds with no fields once released, so a style-less collection still renders', async () => {
          // Every early exit in MapView.loadStyles calls this. Without it the
          // read would wait forever and the map would stay blank.
          layer.expectStyleFields()
          const calls = injectParquetDeps(layer, () => (
            { exceeded: false, featureCollection: FEATURE_COLLECTION, totalRows: 1 }
          ))

          const pending = layer.setAssets([parquetAsset()])
          layer.releaseStyleFields()
          await pending

          expect(calls.opts[0].fields).toEqual([])
          expect(layer._overlayLayerIds.length).toBeGreaterThan(0)
        })

        it('reads immediately when nothing declared an interest', async () => {
          // A layer whose owner never calls expectStyleFields must not wait.
          const calls = await loadedParquet()
          expect(calls).toHaveLength(1)
          expect(calls.opts[0].fields).toEqual([])
        })

        it('drops the idempotency signature when the field set changes', async () => {
          // Belt and braces for a read that already happened with a different
          // field set: the next setAssets must rebuild rather than no-op.
          await loadedParquet()
          expect(layer._assetsSig).toBeTruthy()

          layer.setStyleFields(['naam'])

          expect(layer._assetsSig).toBeNull()
        })
      })

      it('leaves the parquet source with default styling when the style never reaches it', async () => {
        // An inline-sources-only style: nothing maps onto the loaded asset
        // source, which would otherwise be left invisible after the clear.
        await loadedParquet()
        const defaultLayerIds = [...layer._overlayLayerIds]

        layer.applyGlStyle({
          version: 8,
          sources: { notes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
          layers: [{ id: 'notes-fill', type: 'fill', source: 'notes', paint: {} }],
        })

        expect(layer._overlayLayerIds).toEqual(defaultLayerIds)
        for (const id of defaultLayerIds) {
          expect(map.layers.get(id).source).toBe('stac-parquet-0')
        }
        // The style's inline source is added under its own name alongside.
        expect(map.sources.has('notes')).toBe(true)
        expect(map.layers.get('notes-fill').source).toBe('notes')
      })

      it('restores default styling when every style layer fails to add', async () => {
        // A symbol layer against a basemap with no glyphs is the real case:
        // MapLibre throws on addLayer. One unusable layer must not leave the
        // data invisible.
        await loadedParquet()
        const defaultLayerIds = [...layer._overlayLayerIds]
        const realAddLayer = map.addLayer.bind(map)
        map.addLayer = (spec) => {
          if (spec.id === 'styled-fill') { throw new Error('missing glyphs') }
          return realAddLayer(spec)
        }

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        try {
          layer.applyGlStyle(pmtilesStyle())
        } finally {
          warn.mockRestore()
        }

        expect(map.layers.has('styled-fill')).toBe(false)
        expect(layer._overlayLayerIds).toEqual(defaultLayerIds)
      })

      it('survives a basemap change with the style still applied to the geojson source', async () => {
        await loadedParquet()
        layer.applyGlStyle(pmtilesStyle(), 'https://example.com/styles/default.json')

        await layer.readdAfterStyleChange()

        expect(layer._overlayLayerIds).toEqual(['styled-fill'])
        expect(map.layers.get('styled-fill').source).toBe('stac-parquet-0')
        expect(map.layers.get('styled-fill')['source-layer']).toBeUndefined()
      })

      it('binds a style that was applied before the source finished loading', async () => {
        // The normal order, not an edge case: MapView resolves the styles up
        // front because the GeoParquet reader needs their attribute names
        // before it reads, so the apply can land while the file is still
        // downloading. Without the re-bind, the data draws in default blue.
        layer.applyGlStyle(pmtilesStyle(), 'https://example.com/styles/default.json')
        expect(layer._overlayLayerIds).toEqual([])

        await loadedParquet()

        expect(layer._overlayLayerIds).toEqual(['styled-fill'])
        expect(map.layers.get('styled-fill').source).toBe('stac-parquet-0')
        expect(map.layers.get('styled-fill')['source-layer']).toBeUndefined()
      })

      it('does not warn about a source-count mismatch when no assets have loaded yet', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        try {
          layer.applyGlStyle(pmtilesStyle())
          expect(warn).not.toHaveBeenCalled()
        } finally {
          warn.mockRestore()
        }
      })

      it('still maps style sources positionally onto tile-backed sources', async () => {
        await layer.setAssets([xyzVectorAsset()])

        layer.applyGlStyle(pmtilesStyle())

        expect(map.layers.has('styled-fill')).toBe(true)
        expect(map.layers.get('styled-fill').source).toBe('stac-tile-0')
        // A tile source keeps `source-layer` — it names a layer in the tiles.
        expect(map.layers.get('styled-fill')['source-layer']).toBe('parks')
        expect(layer._overlayLayerIds).toEqual(['styled-fill'])
      })

      it('keeps the styled parquet in the layer control under the publisher\'s layer ids', async () => {
        // The layer control used to find a source's layers by id prefix. A
        // style's own ids follow no such convention, so the asset vanished
        // from the control the moment a style bound to it — leaving the user
        // no way to toggle it off.
        await loadedParquet()
        layer.applyGlStyle(pmtilesStyle())

        const overlays = layer.getAssetOverlays()
        expect(overlays).toHaveLength(1)
        expect(overlays[0].id).toBe('stac-parquet-0')
        expect(overlays[0].layerIds).toEqual(['styled-fill'])
      })

      it('restores a tile source\'s default layers when the style never reaches it', async () => {
        // The geojson case was handled; a tile source was left invisible,
        // because restoring its default paint needs the source-layer names
        // and the tile metadata they came from is no longer re-readable.
        await layer.setAssets([xyzVectorAsset()])
        const defaultLayerIds = [...layer._overlayLayerIds]
        expect(defaultLayerIds.length).toBeGreaterThan(0)

        layer.applyGlStyle({
          version: 8,
          sources: { notes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
          layers: [{ id: 'notes-fill', type: 'fill', source: 'notes', paint: {} }],
        })

        expect(layer._overlayLayerIds).toEqual(defaultLayerIds)
        for (const id of defaultLayerIds) {
          expect(map.layers.get(id).source).toBe('stac-tile-0')
        }
      })

      it('does not let a raster source in the style hijack the data binding', async () => {
        // Positional mapping used to accept any source type, so a style whose
        // raster backdrop is declared before its vector source bound the
        // raster layer to the parquet and dropped the data layer — a basemap
        // over nothing.
        await loadedParquet()

        layer.applyGlStyle({
          version: 8,
          sources: {
            backdrop: { type: 'raster', tiles: ['https://example.com/{z}/{x}/{y}.png'] },
            data: { type: 'vector', url: 'pmtiles://https://example.com/tiles.pmtiles' },
          },
          layers: [
            { id: 'backdrop-layer', type: 'raster', source: 'backdrop' },
            { id: 'styled-fill', type: 'fill', source: 'data', 'source-layer': 'parks', paint: {} },
          ],
        })

        expect(map.layers.get('styled-fill').source).toBe('stac-parquet-0')
        // The raster keeps its own source rather than standing in for the data.
        expect(map.layers.get('backdrop-layer').source).toBe('backdrop')
        expect(map.sources.get('backdrop').type).toBe('raster')
      })

      it('applies the style once per basemap switch, not twice', async () => {
        // Each application re-tessellates every loaded tile of the geojson
        // source; setAssets already re-binds in its tail.
        await loadedParquet()
        layer.applyGlStyle(pmtilesStyle())
        const spy = vi.spyOn(layer, 'applyGlStyle')

        await layer.readdAfterStyleChange()

        expect(spy).toHaveBeenCalledTimes(1)
        expect(layer._overlayLayerIds).toEqual(['styled-fill'])
      })

      it('still re-applies a style whose only content is its own inline sources', async () => {
        // The narrow case the count exists to catch: nothing reaches the
        // setAssets tail, so the explicit re-apply is the only one.
        const inline = {
          version: 8,
          sources: { notes: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } },
          layers: [{ id: 'notes-fill', type: 'fill', source: 'notes', paint: {} }],
        }
        layer.applyGlStyle(inline)
        const spy = vi.spyOn(layer, 'applyGlStyle')

        await layer.readdAfterStyleChange()

        expect(spy).toHaveBeenCalledTimes(1)
        expect(map.layers.get('notes-fill').source).toBe('notes')
      })

      it('resolves a style-relative pmtiles URL against the style href, not the page', async () => {
        // formats.md: `sources.data.url` is the relative path from `styles/`
        // to the data, so `pmtiles://../x.pmtiles` is relative to the style
        // document. Two loaded sources make the match, not position, decide.
        const pmtilesAsset = href => ({ href, type: 'application/vnd.pmtiles', roles: ['visual'] })
        await layer.setAssets([
          pmtilesAsset('https://example.com/other/decoys.pmtiles'),
          pmtilesAsset('https://example.com/data/tiles.pmtiles'),
        ])
        // The style's target is the second asset, so a positional match would
        // pick the wrong source.
        expect(map.sources.get('stac-tile-1').url).toBe('pmtiles://https://example.com/data/tiles.pmtiles')

        layer.applyGlStyle({
          version: 8,
          sources: { data: { type: 'vector', url: 'pmtiles://../data/tiles.pmtiles' } },
          layers: [{ id: 'styled-fill', type: 'fill', source: 'data', 'source-layer': 'parks', paint: {} }],
        }, 'https://example.com/styles/default.json')

        expect(map.layers.get('styled-fill').source).toBe('stac-tile-1')
      })
    })
  })

  // Exercises the epoch guard in the tile path (_addTileAssets and helpers) by
  // gating the mocked pm.getHeader() on a promise — the same interleaving the
  // parquet race test pins, but across the PMTiles awaits (todo 008).
  describe('tile path epoch race', () => {
    beforeEach(() => {
      pmtilesTestHooks.header = null
      pmtilesTestHooks.metadata = null
    })

    it('a stale PMTiles continuation cannot replace the newer call\'s source and layers', async () => {
      let release
      let reached
      const headerStarted = new Promise(resolve => { reached = resolve })
      const gate = new Promise(resolve => { release = resolve })
      pmtilesTestHooks.header = async (url) => {
        if (url.includes('slow')) {
          reached()
          await gate
        }
        return { tileType: 1 }
      }
      pmtilesTestHooks.metadata = async () => ({ vector_layers: [{ id: 'roads' }] })

      const slowPmtiles = {
        href: 'https://example.com/slow.pmtiles',
        type: 'application/vnd.pmtiles',
        title: 'Slow PMTiles',
      }
      const first = layer.setAssets([slowPmtiles])
      await headerStarted // call A is now suspended inside pm.getHeader()
      const second = layer.setAssets([xyzVectorAsset()])
      await second
      release()
      await first

      // The newer call's state wins: its meta entry, its XYZ source spec (not
      // a stale pmtiles:// re-add), and exactly its three default layers —
      // no duplicates pushed by A's continuation.
      expect(layer._overlayAssetMeta).toHaveLength(1)
      expect(layer._overlayAssetMeta[0].title).toBe('Test tiles')
      const tileSources = [...map.sources.keys()].filter(id => id.startsWith('stac-tile-'))
      expect(tileSources).toEqual(['stac-tile-0'])
      expect(map.sources.get('stac-tile-0').tiles).toEqual(['https://example.com/tiles/{z}/{x}/{y}.pbf'])
      expect(layer._overlayLayerIds).toEqual([
        'stac-tile-0-default-fill',
        'stac-tile-0-default-line',
        'stac-tile-0-default-point',
      ])
    })
  })
})
