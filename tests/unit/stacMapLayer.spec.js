import { describe, it, expect, beforeEach } from 'vitest'
import StacMapLayer from '../../src/components/maps/StacMapLayer.js'

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

function fakeStac(assets) {
  return { getAssets: () => assets, toGeoJSON: () => null }
}

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
      expect(layer._pmtilesSourceIds).toEqual(['stac-tile-0'])
    })

    it('preserves the rendered tile layers after a style change', async () => {
      await layer.setAssets([xyzVectorAsset()])
      const before = layer._pmtilesLayerIds.length
      expect(before).toBeGreaterThan(0)

      await layer.readdAfterStyleChange()

      expect(layer._pmtilesLayerIds.length).toBe(before)
      for (const id of layer._pmtilesLayerIds) {
        expect(map.layers.has(id)).toBe(true)
      }
    })
  })

  describe('_addPmtilesSource', () => {
    it('replaces an existing source instead of throwing', () => {
      layer._addPmtilesSource('stac-tile-0', { type: 'vector', tiles: ['a'] })
      expect(() =>
        layer._addPmtilesSource('stac-tile-0', { type: 'vector', tiles: ['b'] })
      ).not.toThrow()

      expect(map.sources.get('stac-tile-0').tiles).toEqual(['b'])
      expect(layer._pmtilesSourceIds).toEqual(['stac-tile-0'])
    })
  })
})
