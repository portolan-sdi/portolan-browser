import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('pmtiles', () => {
  class PMTiles {
    constructor(url) { this.url = url; this.source = { getKey: () => url } }
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

import StacMapLayer from '../../src/components/maps/StacMapLayer.js'

// A fake map that models draw order, which the shared fake in
// stacMapLayer.spec.js deliberately does not. Order is the whole subject here:
// data must land above the basemap's ground and below its labels.
function createOrderedMap(basemapLayers) {
  const layers = new Map()
  const order = []
  for (const l of basemapLayers) {
    layers.set(l.id, l)
    order.push(l.id)
  }
  return {
    order,
    addSource() {},
    getSource() { return undefined },
    removeSource() {},
    getLayersOrder() { return [...order] },
    addLayer(spec, beforeId) {
      if (layers.has(spec.id)) { throw new Error(`Layer "${spec.id}" already exists.`) }
      layers.set(spec.id, spec)
      const at = beforeId ? order.indexOf(beforeId) : -1
      if (at === -1) { order.push(spec.id) }
      else { order.splice(at, 0, spec.id) }
    },
    moveLayer(id, beforeId) {
      const from = order.indexOf(id)
      if (from === -1) { throw new Error(`no layer ${id}`) }
      order.splice(from, 1)
      const at = beforeId ? order.indexOf(beforeId) : -1
      if (at === -1) { order.push(id) }
      else { order.splice(at, 0, id) }
    },
    getLayer(id) { return layers.get(id) },
    removeLayer(id) {
      layers.delete(id)
      const at = order.indexOf(id)
      if (at !== -1) { order.splice(at, 1) }
    },
    getStyle() { return { layers: order.map(id => layers.get(id)) } },
    getLayoutProperty() { return undefined },
    setLayoutProperty() {},
  }
}

// Mirrors the shape of tiles.trimet.org's TriMet 3D style: road labels, then
// the 3D buildings, then the place labels. The buildings sitting between the
// two label groups is exactly what makes a naive "insert before the first
// symbol layer" wrong.
function trimetLikeBasemap() {
  return createOrderedMap([
    { id: 'background', type: 'background' },
    { id: 'water', type: 'fill' },
    { id: 'road_major', type: 'line' },
    { id: 'road_major_label', type: 'symbol' },
    { id: 'building-3d', type: 'fill-extrusion' },
    { id: 'place_label_city', type: 'symbol' },
  ])
}

describe('data layer ordering', () => {
  let map, layer

  beforeEach(() => {
    map = trimetLikeBasemap()
    layer = new StacMapLayer(map)
  })

  it('puts geometry below every basemap label', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order.indexOf('routes')).toBeLessThan(map.order.indexOf('road_major_label'))
    expect(map.order.indexOf('routes')).toBeLessThan(map.order.indexOf('place_label_city'))
  })

  it('keeps geometry above the basemap ground', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order.indexOf('routes')).toBeGreaterThan(map.order.indexOf('water'))
    expect(map.order.indexOf('routes')).toBeGreaterThan(map.order.indexOf('road_major'))
  })

  it('sinks 3D buildings below the data so they cannot hide it', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order.indexOf('building-3d')).toBeLessThan(map.order.indexOf('routes'))
  })

  it('produces the full ground, buildings, data, labels stack', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order).toEqual([
      'background',
      'water',
      'road_major',
      'building-3d',
      'routes',
      'road_major_label',
      'place_label_city',
    ])
  })

  it("keeps the data's own labels on top, above the basemap's", () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    layer._addLayerBelowLabels({ id: 'route-labels', type: 'symbol', source: 's' })
    expect(map.order.indexOf('route-labels')).toBeGreaterThan(map.order.indexOf('place_label_city'))
    expect(map.order.indexOf('route-labels')).toBeGreaterThan(map.order.indexOf('routes'))
  })

  // readdAfterStyleChange() tears the data layers down and rebuilds them against
  // a brand-new basemap stack, so an order established once at load is gone the
  // first time someone switches basemap. The replacement basemap here puts its
  // labels and extrusion at different depths on purpose.
  it('re-establishes the order against a different basemap after a switch', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    layer._addLayerBelowLabels({ id: 'route-names', type: 'symbol', source: 's' })

    // Switch basemap: a fresh style, and the data layers are gone with it.
    const switched = createOrderedMap([
      { id: 'bg2', type: 'background' },
      { id: 'landuse', type: 'fill' },
      { id: 'buildings2', type: 'fill-extrusion' },
      { id: 'water_label', type: 'symbol' },
      { id: 'poi_label', type: 'symbol' },
    ])
    layer.map = switched

    // What readdAfterStyleChange() does: add the same specs again.
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    layer._addLayerBelowLabels({ id: 'route-names', type: 'symbol', source: 's' })

    const at = id => switched.order.indexOf(id)
    expect(at('routes')).toBeGreaterThan(at('landuse'))
    expect(at('routes')).toBeLessThan(at('water_label'))
    expect(at('routes')).toBeLessThan(at('poi_label'))
    // Buildings sink below the data on the new basemap too.
    expect(at('buildings2')).toBeLessThan(at('routes'))
    // The data's own labels stay on top of everything.
    expect(at('route-names')).toBeGreaterThan(at('poi_label'))
  })

  it('stays stable when the same layer set is re-added', () => {
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    const first = [...map.order]
    map.removeLayer('routes')
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order).toEqual(first)
  })

  it('anchors to the basemap, never to a layer it already added', () => {
    layer._addLayerBelowLabels({ id: 'a', type: 'line', source: 's' })
    layer.layerIds.push('a')
    layer._addLayerBelowLabels({ id: 'b', type: 'line', source: 's' })
    // Both sit in the data band, in insertion order, still under the labels.
    expect(map.order.indexOf('a')).toBeLessThan(map.order.indexOf('b'))
    expect(map.order.indexOf('b')).toBeLessThan(map.order.indexOf('road_major_label'))
  })

  it('appends when the basemap has no labels at all', () => {
    map = createOrderedMap([
      { id: 'background', type: 'background' },
      { id: 'satellite', type: 'raster' },
    ])
    layer = new StacMapLayer(map)
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order).toEqual(['background', 'satellite', 'routes'])
  })

  it('leaves a basemap with no extrusions untouched', () => {
    map = createOrderedMap([
      { id: 'background', type: 'background' },
      { id: 'place_label_city', type: 'symbol' },
    ])
    layer = new StacMapLayer(map)
    layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })
    expect(map.order).toEqual(['background', 'routes', 'place_label_city'])
  })

  it('survives a basemap that refuses to reorder', () => {
    map.moveLayer = () => { throw new Error('immutable style') }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => layer._addLayerBelowLabels({ id: 'routes', type: 'line', source: 's' })).not.toThrow()
    expect(map.order).toContain('routes')
    warn.mockRestore()
  })
})
