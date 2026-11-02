import { describe, it, expect, vi } from 'vitest'

vi.mock('pmtiles', () => {
  class PMTiles {
    constructor(url) { this.url = url; this.source = { getKey: () => url } }
    async getHeader() { return { tileType: 1 } }
    async getMetadata() { return { vector_layers: [{ id: 'features' }] } }
  }
  class SharedPromiseCache {}
  class Protocol {
    constructor() { this.tile = () => {} }
    add() {}
  }
  return { PMTiles, SharedPromiseCache, Protocol }
})

import { Collection } from 'stac-js'
import StacMapLayer from '../../src/components/maps/StacMapLayer.js'
import { pmtilesLinks, renderableSources } from '../../src/utils/mapAssets.js'

// A Portolan collection MUST register its PMTiles through a collection-level
// `rel: "pmtiles"` link (PORTO-FMT-011) and MAY also publish the archive as an
// asset, which separately means the publisher offers it for download
// (PORTO-FMT-013). A conformant collection can therefore carry the link alone,
// and the map has to render from it.

const COLLECTION_URL = 'https://example.com/collection/collection.json'
const TILES_URL = 'https://example.com/collection/data.pmtiles'

// A real stac-js Collection, not a hand-rolled fake. An earlier draft of this
// test used a fake whose link accessor was a plain `rel` filter; the real one
// (getStacLinksWithRel) keeps only STAC media types and silently dropped every
// PMTiles link, so the fake passed while the browser did not render. Building
// the real object is what makes these tests mean anything.
function collection({ withPmtilesLink = true, withPmtilesAsset = false, withParquet = true, duplicateLink = false } = {}) {
  const assets = {}
  if (withParquet) {
    assets.data = {
      href: 'data.parquet',
      type: 'application/vnd.apache.parquet',
      roles: ['data'],
      title: 'GeoParquet',
    }
  }
  if (withPmtilesAsset) {
    assets.tiles = {
      href: 'data.pmtiles',
      type: 'application/vnd.pmtiles',
      roles: ['visual'],
      title: 'Vector tiles for download',
    }
  }
  const links = [{ rel: 'self', href: COLLECTION_URL, type: 'application/json' }]
  if (withPmtilesLink) {
    // The href is relative, as a published collection's is, so these tests
    // also cover resolution against the collection's own URL.
    links.push({
      rel: 'pmtiles',
      href: 'data.pmtiles',
      type: 'application/vnd.pmtiles',
      title: 'Vector tiles',
      'pmtiles:layers': ['features'],
    })
  }
  if (duplicateLink) {
    links.push({
      rel: 'pmtiles',
      href: 'data.pmtiles',
      type: 'application/vnd.pmtiles',
      title: 'The same archive, declared twice',
    })
  }
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'test-collection',
    description: 'Test',
    license: 'CC-BY-4.0',
    extent: { spatial: { bbox: [[-1, -1, 1, 1]] }, temporal: { interval: [[null, null]] } },
    links,
    assets,
  }, COLLECTION_URL)
}

function createFakeMap() {
  const sources = new Map()
  const layers = new Map()
  return {
    sources,
    layers,
    addSource(id, spec) { sources.set(id, spec) },
    getSource(id) { return sources.get(id) },
    removeSource(id) { sources.delete(id) },
    addLayer(spec) { layers.set(spec.id, spec) },
    getLayer(id) { return layers.get(id) },
    removeLayer(id) { layers.delete(id) },
    getStyle() { return { layers: [...layers.values()] } },
    getLayersOrder() { return [...layers.keys()] },
    moveLayer() {},
    getLayoutProperty(id, name) { return layers.get(id)?.layout?.[name] },
    setLayoutProperty(id, name, value) {
      const layer = layers.get(id)
      layer.layout = { ...layer.layout, [name]: value }
    },
  }
}

// Records whether the GeoParquet direct read ran. Rendering tiles must not
// trigger it: that is the whole point of shipping a tiled derivative.
function injectParquetSpy(layer) {
  const calls = []
  layer._loadParquetDeps = async () => {
    calls.push(true)
    return {
      readParquetAsGeoJSON: async () => ({ exceeded: false, featureCollection: { type: 'FeatureCollection', features: [] }, totalRows: 0 }),
    }
  }
  return calls
}

describe('pmtilesLinks', () => {
  it('returns the PMTiles a collection registers by link', () => {
    expect(pmtilesLinks(collection())).toHaveLength(1)
  })

  it('ignores a collection whose links register no tiles', () => {
    expect(pmtilesLinks(collection({ withPmtilesLink: false }))).toEqual([])
  })

  it('tolerates an object that exposes no links', () => {
    expect(pmtilesLinks({ getAssets: () => [] })).toEqual([])
    expect(pmtilesLinks(null)).toEqual([])
  })
})

describe('renderableSources', () => {
  it('adds a linked archive to the assets', () => {
    const sources = renderableSources(collection())
    expect(sources).toHaveLength(2)
    expect(sources.some(s => s.type === 'application/vnd.pmtiles')).toBe(true)
  })

  it('does not duplicate an archive declared as both a link and an asset', () => {
    // The specification lets the two coexist: the link says "render this", the
    // asset says "and you may download it". One archive, one source.
    const sources = renderableSources(collection({ withPmtilesAsset: true, withParquet: false }))
    expect(sources).toHaveLength(1)
    expect(sources[0].roles).toEqual(['visual'])
  })

  it('leaves a collection with no tile links untouched', () => {
    const sources = renderableSources(collection({ withPmtilesLink: false }))
    expect(sources).toHaveLength(1)
    expect(sources[0].type).toBe('application/vnd.apache.parquet')
  })

  it('yields one source when the same archive is registered by two links', () => {
    const tiles = renderableSources(collection({ duplicateLink: true }))
      .filter(s => s.type === 'application/vnd.pmtiles')
    expect(tiles).toHaveLength(1)
  })

  it('tolerates an object with no assets', () => {
    expect(renderableSources(null)).toEqual([])
    expect(renderableSources({})).toEqual([])
  })
})

describe('autoLoadVisualAssets with a link-registered archive', () => {
  it('renders tiles from the link and skips the GeoParquet read', async () => {
    const map = createFakeMap()
    const layer = new StacMapLayer(map)
    const parquetCalls = injectParquetSpy(layer)

    const stac = collection()
    layer.setStac(stac)
    await layer.autoLoadVisualAssets(stac)

    expect(map.sources.has('stac-tile-0')).toBe(true)
    // Resolved against the collection's own URL, not used as the raw href.
    expect(map.sources.get('stac-tile-0').url).toBe(`pmtiles://${TILES_URL}`)
    expect(parquetCalls).toHaveLength(0)
  })

  it('still falls back to GeoParquet when a collection registers no tiles', async () => {
    const map = createFakeMap()
    const layer = new StacMapLayer(map)
    const parquetCalls = injectParquetSpy(layer)

    const stac = collection({ withPmtilesLink: false })
    layer.setStac(stac)
    await layer.autoLoadVisualAssets(stac)

    expect(map.sources.has('stac-tile-0')).toBe(false)
    expect(parquetCalls).toHaveLength(1)
  })
})
