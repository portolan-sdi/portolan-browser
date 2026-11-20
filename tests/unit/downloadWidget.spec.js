// The "Download data" widget's glue: the cheap `condition` gate, the
// stac-js -> DatasetDescriptor derivation, the two code generators, and the
// two pieces of map plumbing the on-map redesign added -- the map host that
// hands the page's real map to a `map-overlay` widget, and the draw
// interaction's button-driven armed mode.
//
// Fixtures are trimmed from real Portolan catalogs: geoboundaries-catalog's
// adm0 collection (single GeoParquet, relative hrefs, bbox covering) and
// firms-catalog's hive-partitioned detections collection (no parquet asset
// at all, an s3:// partition glob, one item per year).

import { describe, it, expect, vi } from 'vitest'
import { Collection, Item } from 'stac-js'
import { mayHaveDownloadableVector } from '../../src/utils/download/support.js'
import { describeDataset, toPlainStacJson } from '../../src/utils/download/descriptor.js'
import { createMapHost } from '../../src/components/maps/mapHost.js'
import BboxDrawInteraction from '../../src/components/maps/BboxDrawInteraction.js'
import { createDrawTool } from '@cng/maplibre'
import DownloadRequestGenerator from '../../src/codegen/DownloadRequestGenerator.js'
import DuckDbSqlGenerator from '../../src/codegen/DuckDbSqlGenerator.js'

const COLLECTION_URL = 'https://data.example.org/geoboundaries/adm0/collection.json'

function adm0() {
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'adm0',
    title: 'CGAZ ADM0 - Country Boundaries',
    description: 'Country boundaries.',
    license: 'CC-BY-4.0',
    extent: { spatial: { bbox: [[-180, -90, 180, 83.6]] }, temporal: { interval: [[null, null]] } },
    providers: [{ name: 'geoBoundaries', roles: ['producer', 'licensor'], url: 'https://www.geoboundaries.org/' }],
    'table:primary_geometry': 'geometry',
    'table:row_count': 218,
    'table:columns': [
      { name: 'shapeName', type: 'string' },
      { name: 'shapeGroup', type: 'string' },
      { name: 'area_km2', type: 'double' },
      { name: 'bbox', type: 'struct' },
      { name: 'geometry', type: 'geometry' }
    ],
    assets: {
      data: { href: './cgaz_adm0.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
      pmtiles: { href: './adm0.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual', 'data'] },
      thumbnail: { href: './adm0.thumb.png', type: 'image/png', roles: ['thumbnail'] }
    },
    links: [{ rel: 'self', href: COLLECTION_URL }]
  })
}

function rasterCollection() {
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'dem',
    description: 'Elevation.',
    license: 'CC0-1.0',
    extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
    assets: {
      data: {
        href: './dem.tif',
        type: 'image/tiff; application=geotiff; profile=cloud-optimized',
        roles: ['data']
      }
    },
    links: [{ rel: 'self', href: 'https://data.example.org/dem/collection.json' }]
  })
}

function firmsCollection() {
  return new Collection({
    type: 'Collection',
    stac_version: '1.1.0',
    id: 'detections',
    title: 'Active Fire Detections',
    description: 'Fires.',
    license: 'CC0-1.0',
    extent: { spatial: { bbox: [[-180, -90, 180, 90]] }, temporal: { interval: [[null, null]] } },
    'partition:scheme': 'hive',
    'partition:glob': 's3://portolan-mirrors/firms-catalog/detections/year=*/*.parquet',
    'partition:keys': [{ name: 'year', type: 'int32' }],
    'partition:file_count': 28,
    'table:primary_geometry': 'geometry',
    'table:columns': [
      { name: 'geometry', type: 'geometry' },
      { name: 'acq_datetime', type: 'timestamp' },
      { name: 'frp', type: 'double' }
    ],
    assets: {
      pmtiles: { href: './fire-latest.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual', 'data'] }
    },
    links: [{ rel: 'self', href: 'https://data.example.org/firms/detections/collection.json' }]
  })
}

function firmsItem() {
  return new Item({
    type: 'Feature',
    stac_version: '1.1.0',
    id: '2020',
    collection: 'detections',
    geometry: { type: 'Polygon', coordinates: [[[-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]]] },
    properties: {
      datetime: '2020-01-01T00:00:00Z',
      'table:row_count': 25000000,
      'table:primary_geometry': 'geometry'
    },
    assets: {
      data: { href: './detections.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] }
    },
    links: [{ rel: 'self', href: 'https://data.example.org/firms/detections/year=2020/2020.json' }]
  })
}

describe('mayHaveDownloadableVector (the widget condition)', () => {
  it('says yes for a collection with a vector GeoParquet asset', () => {
    expect(mayHaveDownloadableVector(adm0())).toBe(true)
  })

  it('says yes for a hive-partitioned collection with no parquet asset', () => {
    // FIRMS publishes only PMTiles as an asset; the parquet lives behind
    // partition:glob and the item links.
    expect(mayHaveDownloadableVector(firmsCollection())).toBe(true)
  })

  it('says yes for a partition item carrying its own parquet asset', () => {
    expect(mayHaveDownloadableVector(firmsItem())).toBe(true)
  })

  it('says no for a raster collection', () => {
    expect(mayHaveDownloadableVector(rasterCollection())).toBe(false)
  })

  it('says no for a catalog, and for junk', () => {
    expect(mayHaveDownloadableVector({ isCatalog: true })).toBe(false)
    expect(mayHaveDownloadableVector(null)).toBe(false)
    expect(mayHaveDownloadableVector('collection')).toBe(false)
  })
})

describe('describeDataset', () => {
  it('derives a concrete parquet descriptor with an absolute href', () => {
    const { supported, descriptor } = describeDataset(adm0())
    expect(supported).toBe(true)
    expect(descriptor.source).toEqual({
      kind: 'parquet',
      url: 'https://data.example.org/geoboundaries/adm0/cgaz_adm0.parquet'
    })
    expect(descriptor.table.geometryColumn).toBe('geometry')
    expect(descriptor.table.bbox).toEqual({ kind: 'struct', column: 'bbox' })
    expect(descriptor.table.rowCount).toBe(218)
    expect(descriptor.attribution[0]).toMatchObject({ license: 'CC-BY-4.0', text: 'geoBoundaries' })
  })

  it('refuses a raster collection with a reason that names the type', () => {
    const support = describeDataset(rasterCollection())
    expect(support.supported).toBe(false)
    expect(support.message).toMatch(/raster\/zarr/i)
  })

  it('accepts a partitioned collection whose glob is s3://, because the glob is never fetched', () => {
    // The real FIRMS collection's partition glob is an s3:// URI, which
    // DuckDB can read, fetch() cannot, and the browser never asks for: with
    // no `collection-mirror` asset, §2.4 derives a `stac-items`
    // enumeration, so each year's concrete file URL comes from that item's
    // own `data` asset over https. Refusing on the glob alone turned a
    // 632M-row archive away over a string published for other tools.
    const support = describeDataset(firmsCollection())
    expect(support.supported).toBe(true)
    expect(support.descriptor.source.kind).toBe('hive')
    expect(support.descriptor.source.enumeration).toEqual({
      kind: 'stac-items',
      collectionUrl: 'https://data.example.org/firms/detections/collection.json'
    })
    // And the time column the card's date range feeds.
    expect(support.descriptor.table.timeColumn).toBe('acq_datetime')
  })

  it('refuses a source the browser really cannot fetch, naming the scheme', () => {
    const collection = adm0()
    collection.assets.data.href = 's3://example-bucket/cgaz_adm0.parquet'
    const support = describeDataset(collection)
    expect(support.supported).toBe(false)
    expect(support.code).toBe('DATASET_UNREACHABLE')
    expect(support.message).toMatch(/^s3:\/\//)
  })

  it('lifts an item\'s table:* properties to where §2.4 looks for them', () => {
    const json = toPlainStacJson(firmsItem())
    expect(json['table:row_count']).toBe(25000000)
    const { supported, descriptor } = describeDataset(firmsItem())
    expect(supported).toBe(true)
    expect(descriptor.source.url).toBe('https://data.example.org/firms/detections/year=2020/detections.parquet')
    expect(descriptor.table.rowCount).toBe(25000000)
  })
})

const AREA_DOCUMENT = {
  type: 'Feature',
  bbox: [9.47, 47.04, 9.64, 47.27],
  geometry: { type: 'Polygon', coordinates: [[[9.47, 47.04], [9.64, 47.04], [9.64, 47.27], [9.47, 47.27], [9.47, 47.04]]] },
  properties: {
    'area:name': 'Liechtenstein',
    'area:bboxes': [[9.47, 47.04, 9.64, 47.27]],
    'area:vertex_count': { display: 5, filter: 5 },
    'area:filter_geometry': {
      type: 'Polygon',
      coordinates: [[[9.47, 47.04], [9.64, 47.04], [9.64, 47.27], [9.47, 47.27], [9.47, 47.04]]]
    }
  }
}

function request(overrides = {}) {
  const { descriptor } = describeDataset(adm0())
  return {
    spec: 'cng-request/1.0',
    dataset: descriptor,
    filter: {
      spec: 'cng-filter/1.0',
      area: AREA_DOCUMENT,
      spatial: { mode: 'intersects' },
      where: [{ col: 'area_km2', op: '>=', value: 10 }],
      limit: 100000,
      ...overrides.filter
    },
    output: { spec: 'cng-output/1.0', format: 'geoparquet', filename: 'adm0.parquet' },
    generator: { name: 'portolan-browser/AreaDownload', version: 'test', at: '2026-11-12T00:00:00Z' }
  }
}

describe('DownloadRequestGenerator', () => {
  it('emits the request as JSON that round-trips', () => {
    const generator = new DownloadRequestGenerator()
    const code = generator.generate(request())
    expect(generator.outputFile).toBe('download-request.json')
    expect(generator.highlightLanguage).toBe('json')
    expect(JSON.parse(code).spec).toBe('cng-request/1.0')
    expect(JSON.parse(code).dataset.source.url).toMatch(/cgaz_adm0\.parquet$/)
  })

  it('emits nothing when there is no request yet', () => {
    expect(new DownloadRequestGenerator().generate(null)).toBe('')
  })
})

describe('DuckDbSqlGenerator', () => {
  it('translates the request into the §2.9 SQL shape', () => {
    const sql = new DuckDbSqlGenerator().generate(request())
    expect(sql).toContain('INSTALL spatial;')
    expect(sql).toContain("read_parquet('https://data.example.org/geoboundaries/adm0/cgaz_adm0.parquet')")
    // Covering prune, then the exact test, then the attribute predicate.
    expect(sql).toContain('"bbox"."xmin" <= 9.64')
    expect(sql).toContain('ST_Intersects(ST_GeomFromWKB("geometry"), ST_GeomFromGeoJSON(')
    expect(sql).toContain('"area_km2" >= 10')
    expect(sql).toContain('LIMIT 100000')
    expect(sql).toContain('(FORMAT PARQUET, COMPRESSION ZSTD)')
    // The geometry column is projected through ST_GeomFromWKB, and the
    // declared columns become an explicit SELECT list.
    expect(sql).toContain('"shapeName"')
    expect(sql).not.toContain('SELECT *')
  })

  it('uses the filter geometry, not the display geometry', () => {
    const marker = [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]
    const doc = {
      ...AREA_DOCUMENT,
      geometry: { type: 'Polygon', coordinates: [[[9, 47], [9.1, 47], [9.1, 47.1], [9, 47.1], [9, 47]]] },
      properties: { ...AREA_DOCUMENT.properties, 'area:filter_geometry': { type: 'Polygon', coordinates: [marker] } }
    }
    const sql = new DuckDbSqlGenerator().generate(request({ filter: { area: doc } }))
    expect(sql).toContain(JSON.stringify({ type: 'Polygon', coordinates: [marker] }))
  })

  it('bbox mode emits no geometry test', () => {
    const sql = new DuckDbSqlGenerator().generate(request({ filter: { spatial: { mode: 'bbox' } } }))
    expect(sql).toContain('"bbox"."xmin"')
    expect(sql).not.toContain('ST_Intersects')
  })

  it('clip mode cuts the geometry in the projection', () => {
    const sql = new DuckDbSqlGenerator().generate(request({ filter: { spatial: { mode: 'clip' } } }))
    expect(sql).toContain('ST_Intersection(ST_GeomFromWKB("geometry")')
  })

  it('escapes string literals rather than concatenating them raw', () => {
    const sql = new DuckDbSqlGenerator().generate(request({
      filter: { where: [{ col: 'shapeName', op: '=', value: "Côte d'Ivoire" }] }
    }))
    expect(sql).toContain('"shapeName" = \'Côte d\'\'Ivoire\'')
  })

  it('falls back to the bbox test when the geometry is too large to inline', () => {
    // Past ~5,000 vertices the inlined GeoJSON stops being a readable
    // snippet, so the generator drops to the bbox test and says why.
    const ring = []
    for (let i = 0; i < 6000; i += 1) {
      ring.push([9 + i / 1000000, 47 + i / 1000000])
    }
    ring.push(ring[0])
    const doc = {
      ...AREA_DOCUMENT,
      properties: {
        ...AREA_DOCUMENT.properties,
        'area:filter_geometry': { type: 'Polygon', coordinates: [ring] },
        'area:vertex_count': { display: 6001, filter: 6001 }
      }
    }
    const sql = new DuckDbSqlGenerator().generate(request({ filter: { area: doc } }))
    expect(sql).not.toContain('ST_GeomFromGeoJSON')
    expect(sql).toContain('6001 vertices')
    expect(sql).toContain('download-request.json')
  })

  it('reads a hive partition glob with hive_partitioning', () => {
    const { descriptor } = describeDataset(firmsCollection())
    const req = request()
    const sql = new DuckDbSqlGenerator().generate({
      ...req,
      dataset: { ...descriptor, table: { ...descriptor.table, bbox: { kind: 'none' } } },
      filter: { ...req.filter, partitions: { year: { op: 'in', values: [2020, 2021] } } }
    })
    expect(sql).toContain('hive_partitioning = true')
    expect(sql).toContain('"year" IN (2020, 2021)')
    expect(sql).toContain('declares no bbox covering columns')
  })

  it('emits a time window honouring the interval closure', () => {
    const req = request()
    const sql = new DuckDbSqlGenerator().generate({
      ...req,
      filter: { ...req.filter, time: { column: 'acq_datetime', start: '2020-01-01', end: '2021-01-01', closed: '[)' } }
    })
    expect(sql).toContain('"acq_datetime" >= \'2020-01-01\'')
    expect(sql).toContain('"acq_datetime" < \'2021-01-01\'')
  })
})

describe('createMapHost (the map-overlay extension point)', () => {
  const fakeMap = id => ({ id })

  it('hands a late subscriber the map that already exists', () => {
    const host = createMapHost()
    host.setMap(fakeMap('a'))

    const seen = []
    host.onMap(map => seen.push(map?.id ?? null))

    expect(seen).toEqual(['a'])
    expect(host.map.id).toBe('a')
    expect(host.mapRef.value.id).toBe('a')
  })

  it('tells subscribers about a replacement, and about teardown', () => {
    const host = createMapHost()
    const seen = []
    host.onMap(map => seen.push(map?.id ?? null))

    expect(seen).toEqual([])  // nothing yet: there is no map
    host.setMap(fakeMap('a'))
    host.setMap(fakeMap('b'))
    host.setMap(null)

    expect(seen).toEqual(['a', 'b', null])
    expect(host.map).toBe(null)
  })

  it('stops calling a handler that unsubscribed', () => {
    const host = createMapHost()
    const handler = vi.fn()
    const off = host.onMap(handler)
    host.setMap(fakeMap('a'))
    off()
    host.setMap(fakeMap('b'))

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('keeps the style-reload channel separate, and silent without a map', () => {
    const host = createMapHost()
    const onMap = vi.fn()
    const onStyle = vi.fn()
    host.onMap(onMap)
    host.onStyleReload(onStyle)

    // No map yet: a re-stacking cannot be about anything.
    host.notifyStyleReload()
    expect(onStyle).not.toHaveBeenCalled()

    host.setMap(fakeMap('a'))
    host.notifyStyleReload()
    expect(onStyle).toHaveBeenCalledTimes(1)
    expect(onStyle).toHaveBeenCalledWith(host.map)
    // Publishing a map is not a style reload, and vice versa.
    expect(onMap).toHaveBeenCalledTimes(1)
  })

  it('does not let one broken widget stop the others', () => {
    const host = createMapHost()
    const console_ = vi.spyOn(console, 'error').mockImplementation(() => {})
    const second = vi.fn()
    host.onMap(() => { throw new Error('widget is broken') })
    host.onMap(second)

    host.setMap(fakeMap('a'))

    expect(second).toHaveBeenCalledTimes(1)
    expect(console_).toHaveBeenCalled()
    console_.mockRestore()
  })
})

describe('BboxDrawInteraction armed mode (the "Draw a box" button)', () => {
  // The smallest map the interaction actually touches.
  function stubMap() {
    const canvas = document.createElement('canvas')
    const sources = new Map()
    return {
      canvas,
      getCanvas: () => canvas,
      getSource: id => sources.get(id),
      addSource: (id, spec) => sources.set(id, { ...spec, setData(data) { this.data = data } }),
      addLayer: () => {},
      getLayer: () => undefined,
      removeLayer: () => {},
      removeSource: id => sources.delete(id),
      dragPan: { enable: () => {}, disable: () => {} },
      unproject: ([x, y]) => ({ lng: x / 10, lat: y / 10 })
    }
  }

  const drag = (map, from, to) => {
    const event = (type, point) => new MouseEvent(type, { bubbles: true, ...point })
    // happy-dom does not synthesize offsetX/offsetY, so set them directly.
    const at = (type, [x, y]) => Object.assign(event(type), { offsetX: x, offsetY: y })
    map.canvas.dispatchEvent(at('mousedown', from))
    map.canvas.dispatchEvent(at('mousemove', to))
    map.canvas.dispatchEvent(at('mouseup', to))
  }

  it('ignores a plain drag until the button arms it', () => {
    const map = stubMap()
    const onExtent = vi.fn()
    const draw = new BboxDrawInteraction(map, onExtent)

    drag(map, [10, 10], [100, 100])
    expect(onExtent).not.toHaveBeenCalled()

    expect(draw.setArmed(true)).toBe(true)
    expect(map.canvas.style.cursor).toBe('crosshair')
    drag(map, [10, 10], [100, 100])
    expect(onExtent).toHaveBeenCalledWith([1, 10, 10, 1])
  })

  it('disarms itself after the box it was armed for', () => {
    const map = stubMap()
    const onExtent = vi.fn()
    const draw = new BboxDrawInteraction(map, onExtent)
    draw.setArmed(true)

    drag(map, [10, 10], [100, 100])
    expect(draw.armed).toBe(false)
    expect(map.canvas.style.cursor).toBe('')

    drag(map, [20, 20], [120, 120])
    expect(onExtent).toHaveBeenCalledTimes(1)
  })
})

// The "Draw polygon" button is @cng/maplibre's shared `createDrawTool` in
// polygon mode, consumed through the Vite alias -- not a local class. The
// gesture logic has its own unit tests upstream; what is worth asserting
// *here* is that the package this app actually resolves behaves the way the
// widget assumes, in this app's DOM environment.
describe('createDrawTool polygon mode (the "Draw polygon" button)', () => {
  // A MapLibre-shaped stub: the tool listens through `map.on`, not through
  // raw canvas events.
  function stubMap() {
    const canvas = document.createElement('canvas')
    const sources = new Map()
    const handlers = new Map()
    return {
      canvas,
      sources,
      getCanvas: () => canvas,
      getSource: id => sources.get(id),
      addSource: (id, spec) => sources.set(id, { ...spec, setData(data) { this.data = data } }),
      addLayer: () => {},
      getLayer: () => undefined,
      removeLayer: () => {},
      removeSource: id => sources.delete(id),
      dragPan: { enable: () => {}, disable: () => {} },
      doubleClickZoom: { enable: () => {}, disable: () => {} },
      on: (type, fn) => {
        if (!handlers.has(type)) { handlers.set(type, new Set()) }
        handlers.get(type).add(fn)
      },
      off: (type, fn) => handlers.get(type)?.delete(fn),
      fire: (type, event) => { for (const fn of handlers.get(type) || []) { fn(event) } }
    }
  }

  // MapLibre hands both a screen point and a lngLat; this tool uses the
  // screen point for same-click detection and the lngLat for the ring.
  const clickAt = (map, x, y) => map.fire('click', { point: { x, y }, lngLat: { lng: x, lat: y } })

  it('ignores clicks until the button arms it', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    const onArea = vi.fn()
    draw.on('area', onArea)

    clickAt(map, 0, 0)
    expect(draw.vertices).toEqual([])

    draw.arm('polygon')
    expect(draw.armed).toBe(true)
    expect(map.canvas.style.cursor).toBe('crosshair')
    clickAt(map, 0, 0)
    expect(draw.vertices).toEqual([[0, 0]])
  })

  it('closes on double-click into an Area with draw provenance, and disarms', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'], names: { drawn: 'Drawn area' } })
    const onArea = vi.fn()
    draw.on('area', onArea)
    draw.arm('polygon')

    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    clickAt(map, 10, 10)
    map.fire('dblclick', { point: { x: 10, y: 10 }, lngLat: { lng: 10, lat: 10 }, preventDefault: () => {} })

    expect(onArea).toHaveBeenCalledTimes(1)
    const { area } = onArea.mock.calls[0][0]
    expect(area.name).toBe('Drawn area')
    expect(area.provenance.source).toBe('draw')
    expect(area.provenance.draw.tool).toBe('polygon')
    expect(area.provenance.draw.mapCrs).toBe('EPSG:4326')
    // Closed ring: four positions for a triangle.
    expect(area.geometry.type).toBe('Polygon')
    expect(area.geometry.coordinates[0]).toHaveLength(4)
    expect(area.geometry.coordinates[0][0]).toEqual(area.geometry.coordinates[0][3])
    expect(draw.armed).toBe(false)
  })

  it('drops the second half of a double-click rather than adding a duplicate corner', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    const onArea = vi.fn()
    draw.on('area', onArea)
    draw.arm('polygon')

    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    clickAt(map, 10, 10)
    // A real double-click delivers an ordinary click first, at the same spot.
    clickAt(map, 10, 10)
    map.fire('dblclick', { point: { x: 10, y: 10 }, lngLat: { lng: 10, lat: 10 }, preventDefault: () => {} })

    expect(onArea.mock.calls[0][0].area.geometry.coordinates[0]).toHaveLength(4)
  })

  it('closes on Enter and cancels on Escape', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    const onArea = vi.fn()
    const onCancel = vi.fn()
    draw.on('area', onArea)
    draw.on('cancel', onCancel)
    draw.arm('polygon')

    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onCancel).toHaveBeenCalledWith({ duringDrag: false, duringDraw: true })
    expect(draw.armed).toBe(false)
    expect(onArea).not.toHaveBeenCalled()

    draw.arm('polygon')
    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    clickAt(map, 10, 10)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(onArea).toHaveBeenCalledTimes(1)
  })

  it('refuses to close a ring of fewer than three corners, staying armed', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    const onArea = vi.fn()
    draw.on('area', onArea)
    draw.arm('polygon')

    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    map.fire('dblclick', { point: { x: 10, y: 10 }, lngLat: { lng: 10, lat: 10 }, preventDefault: () => {} })

    expect(onArea).not.toHaveBeenCalled()
    expect(draw.armed).toBe(true)
  })

  it('closes when the first corner is clicked again', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    const onArea = vi.fn()
    draw.on('area', onArea)
    draw.arm('polygon')

    clickAt(map, 0, 0)
    clickAt(map, 20, 0)
    clickAt(map, 20, 20)
    clickAt(map, 2, 2) // within SAME_POINT_PX of the first corner

    expect(onArea).toHaveBeenCalledTimes(1)
    expect(onArea.mock.calls[0][0].area.geometry.coordinates[0]).toHaveLength(4)
  })

  it('exposes arm/disarm/on/remove, and on() returns an unsubscribe', () => {
    const map = stubMap()
    const draw = createDrawTool(map, { tools: ['polygon'] })
    for (const member of ['arm', 'disarm', 'on', 'remove']) {
      expect(typeof draw[member]).toBe('function')
    }
    const onArea = vi.fn()
    const off = draw.on('area', onArea)
    off()
    draw.arm('polygon')
    clickAt(map, 0, 0)
    clickAt(map, 10, 0)
    clickAt(map, 10, 10)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    expect(onArea).not.toHaveBeenCalled()
  })

  it('refuses a tool outside the enabled set', () => {
    const draw = createDrawTool(stubMap(), { tools: ['polygon'] })
    expect(() => draw.arm('rectangle')).toThrow(/not in the enabled set/)
  })
})
