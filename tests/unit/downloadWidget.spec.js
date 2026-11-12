// The "Download data" widget's glue: the cheap `condition` gate, the
// stac-js -> DatasetDescriptor derivation, and the two code generators.
//
// Fixtures are trimmed from real Portolan catalogs: geoboundaries-catalog's
// adm0 collection (single GeoParquet, relative hrefs, bbox covering) and
// firms-catalog's hive-partitioned detections collection (no parquet asset
// at all, an s3:// partition glob, one item per year).

import { describe, it, expect } from 'vitest'
import { Collection, Item } from 'stac-js'
import { mayHaveDownloadableVector } from '../../src/utils/download/support.js'
import { describeDataset, toPlainStacJson } from '../../src/utils/download/descriptor.js'
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

  it('refuses a source the browser cannot fetch, naming the scheme', () => {
    // The real FIRMS collection's partition glob is an s3:// URI. DuckDB can
    // read it; fetch() cannot.
    const support = describeDataset(firmsCollection())
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
    spec: 'cnmw-request/1.0',
    dataset: descriptor,
    filter: {
      spec: 'cnmw-filter/1.0',
      area: AREA_DOCUMENT,
      spatial: { mode: 'intersects' },
      where: [{ col: 'area_km2', op: '>=', value: 10 }],
      limit: 100000,
      ...overrides.filter
    },
    output: { spec: 'cnmw-output/1.0', format: 'geoparquet', filename: 'adm0.parquet' },
    generator: { name: 'portolan-browser/AreaDownload', version: 'test', at: '2026-11-12T00:00:00Z' }
  }
}

describe('DownloadRequestGenerator', () => {
  it('emits the request as JSON that round-trips', () => {
    const generator = new DownloadRequestGenerator()
    const code = generator.generate(request())
    expect(generator.outputFile).toBe('download-request.json')
    expect(generator.highlightLanguage).toBe('json')
    expect(JSON.parse(code).spec).toBe('cnmw-request/1.0')
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
