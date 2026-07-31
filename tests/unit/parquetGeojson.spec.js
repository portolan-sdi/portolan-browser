import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock hyparquet so loadGeoJsonFromParquet can be exercised without network
// or real parquet files. Kept in a separate spec file from parquet.spec.js,
// which tests against the real (unmocked) module.
vi.mock('hyparquet', () => {
  const parquetRead = vi.fn()
  return {
    asyncBufferFromUrl: vi.fn(),
    parquetMetadataAsync: vi.fn(),
    parquetRead,
    // Mirrors the real parquetReadObjects: a promise wrapper over parquetRead
    // forcing object rows — so tests keep asserting on parquetRead's options.
    parquetReadObjects: vi.fn(options => new Promise((resolve, reject) => {
      parquetRead({ ...options, rowFormat: 'object', onComplete: resolve }).catch(reject)
    })),
    parquetSchema: vi.fn(),
  }
})
vi.mock('hyparquet-compressors', () => ({ compressors: {} }))

import { asyncBufferFromUrl, parquetMetadataAsync, parquetRead, parquetSchema } from 'hyparquet'
import {
  createLonLatTransform,
  loadGeoJsonFromParquet,
  loadGeometryTypesForRows,
  getBboxForRow,
  bboxFromGeoJson,
  MAX_MAP_FEATURES,
  MAX_MAP_PARQUET_BYTES,
} from '../../src/utils/parquet.js'

const POLYGON = {
  type: 'Polygon',
  coordinates: [[[-71.1, 42.2], [-70.9, 42.2], [-70.9, 42.4], [-71.1, 42.2]]],
}

// EPSG:28992 (Amersfoort / RD New) as PROJJSON, the shape a GeoParquet writer
// puts in the `geo` metadata. Self-contained: proj4 ships only WGS84 and Web
// Mercator, so a file like this is only renderable via its own definition.
const RD_NEW_PROJJSON = {
  type: 'ProjectedCRS',
  name: 'Amersfoort / RD New',
  base_crs: {
    name: 'Amersfoort',
    datum: {
      type: 'GeodeticReferenceFrame',
      name: 'Amersfoort',
      ellipsoid: { name: 'Bessel 1841', semi_major_axis: 6377397.155, inverse_flattening: 299.1528128 },
    },
    coordinate_system: {
      subtype: 'ellipsoidal',
      axis: [
        { name: 'Geodetic latitude', abbreviation: 'Lat', direction: 'north', unit: 'degree' },
        { name: 'Geodetic longitude', abbreviation: 'Lon', direction: 'east', unit: 'degree' },
      ],
    },
  },
  conversion: {
    name: 'RD New',
    method: { name: 'Oblique Stereographic', id: { authority: 'EPSG', code: 9809 } },
    parameters: [
      { name: 'Latitude of natural origin', value: 52.1561605555556, unit: 'degree' },
      { name: 'Longitude of natural origin', value: 5.38763888888889, unit: 'degree' },
      { name: 'Scale factor at natural origin', value: 0.9999079, unit: 'unity' },
      { name: 'False easting', value: 155000, unit: 'metre' },
      { name: 'False northing', value: 463000, unit: 'metre' },
    ],
  },
  coordinate_system: {
    subtype: 'Cartesian',
    axis: [
      { name: 'Easting', abbreviation: 'X', direction: 'east', unit: 'metre' },
      { name: 'Northing', abbreviation: 'Y', direction: 'north', unit: 'metre' },
    ],
  },
  id: { authority: 'EPSG', code: 28992 },
}

// RD New's own origin: 155000/463000 metres is exactly 5.38763888888889 E,
// 52.1561605555556 N by definition, which makes it a self-checking fixture.
const RD_ORIGIN = [155000, 463000]
const RD_ORIGIN_LONLAT = [5.38763888888889, 52.1561605555556]

// Wires the hyparquet mocks so that loadParquetMetadata sees a GeoParquet
// file with a `geometry` column, `numRows` rows, and (optionally) a CRS, and
// parquetRead delivers `rows` in whatever format the caller asked for.
function mockParquetFile({ numRows, rows = [], crs = null, geo = true, columns = ['geometry', 'name'], byteLength = 1000 }) {
  const geoMeta = {
    primary_column: 'geometry',
    columns: { geometry: crs ? { crs } : {} },
  }
  const metadata = {
    num_rows: BigInt(numRows),
    key_value_metadata: geo ? [{ key: 'geo', value: JSON.stringify(geoMeta) }] : [],
  }
  asyncBufferFromUrl.mockResolvedValue({ byteLength })
  parquetMetadataAsync.mockResolvedValue(metadata)
  parquetSchema.mockReturnValue({ children: columns.map(name => ({ element: { name } })) })
  parquetRead.mockImplementation(async (opts) => { opts.onComplete(rows) })
}

describe('loadGeoJsonFromParquet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns exceeded without reading data when over the cap', async () => {
    mockParquetFile({ numRows: MAX_MAP_FEATURES + 1 })
    const result = await loadGeoJsonFromParquet('https://example.com/big.parquet')
    expect(result).toEqual({ exceeded: true, reason: 'tooLarge', totalRows: MAX_MAP_FEATURES + 1 })
    expect(parquetRead).not.toHaveBeenCalled()
  })

  it('rejects a file whose actual byte length is over the size cap without reading data', async () => {
    // STAC metadata can lie or be absent; the loader checks the real
    // byteLength (from the HEAD/range probe) before reading any data pages.
    const byteLength = MAX_MAP_PARQUET_BYTES + 1
    mockParquetFile({ numRows: 5, byteLength })
    const result = await loadGeoJsonFromParquet('https://example.com/huge.parquet')
    expect(result).toEqual({ exceeded: true, reason: 'tooBig', byteLength })
    expect(parquetRead).not.toHaveBeenCalled()
  })

  it('bounds the read with rowEnd so a lying footer num_rows cannot cause an unbounded read', async () => {
    mockParquetFile({
      numRows: 1, // footer under-declares; the real row groups hold more
      rows: [{ geometry: POLYGON, name: 'a' }],
    })
    await loadGeoJsonFromParquet('https://example.com/liar.parquet')
    expect(parquetRead).toHaveBeenCalledWith(expect.objectContaining({ rowStart: 0, rowEnd: MAX_MAP_FEATURES + 1 }))
  })

  it('returns exceeded when the reader delivers more rows than the footer declared', async () => {
    const rows = Array.from({ length: MAX_MAP_FEATURES + 1 }, (_, i) => ({ geometry: POLYGON, name: `f${i}` }))
    mockParquetFile({ numRows: 1, rows })
    const result = await loadGeoJsonFromParquet('https://example.com/liar.parquet')
    expect(result).toEqual({ exceeded: true, reason: 'tooLarge', totalRows: MAX_MAP_FEATURES + 1 })
  })

  it('builds a FeatureCollection reading only the geometry column, with empty properties', async () => {
    // Attribute columns are pruned from the read (nothing on the map uses
    // them), so features carry intentionally empty properties. The BigInt
    // sanitizing the property path used to need is gone with it: int64
    // attribute columns are never read, so nothing BigInt can reach MapLibre.
    mockParquetFile({
      numRows: 2,
      rows: [
        { geometry: POLYGON },
        { geometry: POLYGON },
      ],
    })
    const result = await loadGeoJsonFromParquet('https://example.com/data.parquet')
    expect(result.exceeded).toBe(false)
    expect(result.totalRows).toBe(2)
    expect(result.featureCollection.type).toBe('FeatureCollection')
    expect(result.featureCollection.features).toHaveLength(2)
    expect(result.featureCollection.features[0]).toEqual({
      type: 'Feature',
      geometry: POLYGON,
      properties: {},
    })
    expect(parquetRead).toHaveBeenCalledWith(expect.objectContaining({
      columns: ['geometry'],
      rowFormat: 'object',
    }))
  })

  it('skips rows with null geometry', async () => {
    mockParquetFile({
      numRows: 2,
      rows: [
        { geometry: null },
        { geometry: POLYGON },
      ],
    })
    const result = await loadGeoJsonFromParquet('https://example.com/data.parquet')
    expect(result.featureCollection.features).toHaveLength(1)
    expect(result.featureCollection.features[0].geometry).toEqual(POLYGON)
  })

  it('forwards an AbortSignal to hyparquet fetches via requestInit', async () => {
    mockParquetFile({ numRows: 1, rows: [{ geometry: POLYGON }] })
    const controller = new AbortController()
    await loadGeoJsonFromParquet('https://example.com/data.parquet', { signal: controller.signal })
    expect(asyncBufferFromUrl).toHaveBeenCalledWith({
      url: 'https://example.com/data.parquet',
      requestInit: { signal: controller.signal },
    })
  })

  it('throws when the geometry column was not decoded (raw WKB bytes)', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: new Uint8Array([1, 2, 3]), name: 'a' }],
    })
    await expect(loadGeoJsonFromParquet('https://example.com/data.parquet'))
      .rejects.toThrow(/not decoded/)
  })

  it('throws for a CRS that identifies itself but supplies no usable definition', async () => {
    // An `id` with no projection parameters: proj4 doesn't ship EPSG:2249 and
    // there is nothing in the file to build a transform from, so the map has
    // no way to place the data.
    mockParquetFile({
      numRows: 1,
      crs: { id: { authority: 'EPSG', code: 2249 } },
    })
    await expect(loadGeoJsonFromParquet('https://example.com/data.parquet'))
      .rejects.toThrow(/EPSG:2249/)
  })

  it('rejects a declared PROJJSON CRS without a recognizable authority/code', async () => {
    // Legal per GeoParquet (some writers omit `id`), but a bare name is
    // neither assumable as lon/lat — that would plot projected metres raw —
    // nor enough for proj4 to build a transform.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: POLYGON, name: 'a' }],
      crs: { type: 'ProjectedCRS', name: 'NAD83 / Massachusetts Mainland' },
    })
    await expect(loadGeoJsonFromParquet('https://example.com/data.parquet'))
      .rejects.toThrow(/NAD83 \/ Massachusetts Mainland/)
  })

  it('renders when the file declares no CRS at all (GeoParquet default OGC:CRS84)', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: POLYGON, name: 'a' }],
    })
    const result = await loadGeoJsonFromParquet('https://example.com/data.parquet')
    expect(result.featureCollection.features).toHaveLength(1)
  })

  it('accepts the OGC:CRS84 CRS', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: POLYGON, name: 'a' }],
      crs: { id: { authority: 'OGC', code: 'CRS84' } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/data.parquet')
    expect(result.featureCollection.features).toHaveLength(1)
  })

  it('throws when the file has no geometry column', async () => {
    mockParquetFile({ numRows: 1, geo: false, columns: ['name', 'value'] })
    await expect(loadGeoJsonFromParquet('https://example.com/data.parquet'))
      .rejects.toThrow(/no geometry column/)
  })
})

describe('loadGeoJsonFromParquet reprojection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const closeTo = (actual, expected) => {
    expect(actual[0]).toBeCloseTo(expected[0], 9)
    expect(actual[1]).toBeCloseTo(expected[1], 9)
  }

  it('reprojects geometries using the PROJJSON definition in the file', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: RD_ORIGIN } }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.exceeded).toBe(false)
    expect(result.reprojectedFrom).toBe('EPSG:28992')
    expect(result.droppedFeatures).toBe(0)
    closeTo(result.featureCollection.features[0].geometry.coordinates, RD_ORIGIN_LONLAT)
  })

  it('reprojects every position of a nested geometry, leaving the type alone', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{
        geometry: {
          type: 'MultiLineString',
          coordinates: [[RD_ORIGIN, RD_ORIGIN], [RD_ORIGIN]],
        },
      }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    const geometry = result.featureCollection.features[0].geometry
    expect(geometry.type).toBe('MultiLineString')
    expect(geometry.coordinates.map(part => part.length)).toEqual([2, 1])
    for (const position of geometry.coordinates.flat()) {
      closeTo(position, RD_ORIGIN_LONLAT)
    }
  })

  it('recurses into a GeometryCollection', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{
        geometry: {
          type: 'GeometryCollection',
          geometries: [
            { type: 'Point', coordinates: RD_ORIGIN },
            {
              type: 'GeometryCollection',
              geometries: [{ type: 'Point', coordinates: RD_ORIGIN }],
            },
          ],
        },
      }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    const { geometries } = result.featureCollection.features[0].geometry
    closeTo(geometries[0].coordinates, RD_ORIGIN_LONLAT)
    closeTo(geometries[1].geometries[0].coordinates, RD_ORIGIN_LONLAT)
  })

  it('passes a third ordinate through untouched', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: [...RD_ORIGIN, 12.5] } }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.featureCollection.features[0].geometry.coordinates[2]).toBe(12.5)
  })

  it('drops and counts features whose coordinates leave the lon/lat domain', async () => {
    // A Web Mercator easting of 1e9 metres is ~24 times around the world; it
    // reprojects to a longitude of 8623°. (Northings saturate at exactly ±90
    // instead of overflowing, so easting is the ordinate that shows this.)
    mockParquetFile({
      numRows: 2,
      rows: [
        { geometry: { type: 'Point', coordinates: [1e9, 0] } },
        { geometry: { type: 'Point', coordinates: [0, 0] } },
      ],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/webmerc.parquet')
    expect(result.droppedFeatures).toBe(1)
    expect(result.featureCollection.features).toHaveLength(1)
    closeTo(result.featureCollection.features[0].geometry.coordinates, [0, 0])
  })

  it('drops a geometry entirely when only some of its positions are out of domain', async () => {
    // A partly transformed shape would draw as a spike across the map, which
    // is worse than the feature going missing.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'LineString', coordinates: [[0, 0], [1e9, 0]] } }],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/webmerc.parquet')
    expect(result.featureCollection.features).toHaveLength(0)
    expect(result.droppedFeatures).toBe(1)
  })

  it('reprojects EPSG:3857 from its authority code alone', async () => {
    // detectGeometryInfo leaves crsDefinition null for Web Mercator, so this
    // exercises the code fallback rather than the PROJJSON path.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: [1113194.9079327357, 0] } }],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/webmerc.parquet')
    expect(result.reprojectedFrom).toBe('EPSG:3857')
    closeTo(result.featureCollection.features[0].geometry.coordinates, [10, 0])
  })

  it('leaves lon/lat data untouched and reports no reprojection', async () => {
    mockParquetFile({ numRows: 1, rows: [{ geometry: POLYGON }] })
    const result = await loadGeoJsonFromParquet('https://example.com/data.parquet')
    expect(result.reprojectedFrom).toBeNull()
    expect(result.droppedFeatures).toBe(0)
    expect(result.featureCollection.features[0].geometry).toEqual(POLYGON)
  })
})

describe('createLonLatTransform', () => {
  it('prefers the file definition over the authority code', () => {
    // A code proj4 cannot resolve on its own still works when the file
    // carries the parameters — this is the whole point of reading PROJJSON.
    expect(createLonLatTransform('EPSG:28992', null)).toBeNull()
    const transform = createLonLatTransform('EPSG:28992', RD_NEW_PROJJSON)
    closeToLonLat(transform.forward(RD_ORIGIN), RD_ORIGIN_LONLAT)
  })

  it('falls back to the authority code when the definition is unusable', () => {
    const transform = createLonLatTransform('EPSG:3857', { type: 'ProjectedCRS', name: 'nonsense' })
    closeToLonLat(transform.forward([1113194.9079327357, 0]), [10, 0])
  })

  it('returns null rather than throwing when neither input resolves', () => {
    // proj4 rejects these by throwing bare strings, not Errors.
    expect(createLonLatTransform('unidentified', null)).toBeNull()
    expect(createLonLatTransform(null, { foo: 'bar' })).toBeNull()
    expect(createLonLatTransform(null, null)).toBeNull()
  })
})

function closeToLonLat(actual, expected) {
  expect(actual[0]).toBeCloseTo(expected[0], 9)
  expect(actual[1]).toBeCloseTo(expected[1], 9)
}

describe('decoded-GeoJSON geometry handling (hyparquet >= 1.25)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadGeometryTypesForRows reads the type from decoded geometry objects', async () => {
    parquetRead.mockImplementation(async (opts) => {
      opts.onComplete([[{ type: 'MultiPolygon', coordinates: [] }], [null]])
    })
    const types = await loadGeometryTypesForRows({}, {}, 'geometry', 2)
    expect(types).toEqual(['MultiPolygon', 'Unknown'])
  })

  it('getBboxForRow computes the bbox from a decoded geometry object', async () => {
    parquetRead.mockImplementation(async (opts) => {
      opts.onComplete([[POLYGON]])
    })
    const bbox = await getBboxForRow({}, {}, 'geometry', 0)
    expect(bbox).toEqual([-71.1, 42.2, -70.9, 42.4])
  })
})

describe('bboxFromGeoJson', () => {
  it('computes the bbox of a point', () => {
    expect(bboxFromGeoJson({ type: 'Point', coordinates: [5, 10] })).toEqual([5, 10, 5, 10])
  })

  it('computes the bbox of nested multi-geometries', () => {
    const multi = {
      type: 'MultiPolygon',
      coordinates: [
        [[[0, 0], [2, 0], [2, 2], [0, 0]]],
        [[[-1, -1], [1, -1], [1, 1], [-1, -1]]],
      ],
    }
    expect(bboxFromGeoJson(multi)).toEqual([-1, -1, 2, 2])
  })

  it('computes the bbox of a GeometryCollection recursively', () => {
    const collection = {
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [5, 10] },
        { type: 'LineString', coordinates: [[-3, 0], [1, 12]] },
        {
          type: 'GeometryCollection',
          geometries: [{ type: 'Point', coordinates: [7, -2] }],
        },
      ],
    }
    expect(bboxFromGeoJson(collection)).toEqual([-3, -2, 7, 12])
  })

  it('returns null for missing or empty geometry', () => {
    expect(bboxFromGeoJson(null)).toBeNull()
    expect(bboxFromGeoJson({ type: 'Point' })).toBeNull()
    expect(bboxFromGeoJson({ type: 'MultiPolygon', coordinates: [] })).toBeNull()
    expect(bboxFromGeoJson({ type: 'GeometryCollection', geometries: [] })).toBeNull()
  })
})
