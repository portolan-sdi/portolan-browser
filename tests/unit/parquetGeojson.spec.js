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
  reprojectGeometry,
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

// EPSG:28992 (Amersfoort / RD New) as PROJJSON, matching what a real writer
// emits — including `base_crs.id` and `bbox`, both of which are load-bearing.
// proj4 ships WGS84, NAD83, Web Mercator and the WGS84 UTM zones but no
// national grid, so a file like this is only renderable via its own definition.
//
// `base_crs.id` is what lets proj4 look up the Amersfoort→WGS84 datum shift.
// Without it the transform silently omits the shift and lands 113.8 m away,
// which is close enough to look right on a country-wide screenshot — so an
// abbreviated fixture would pin the wrong answer instead of catching that.
const RD_NEW_PROJJSON = {
  type: 'ProjectedCRS',
  name: 'Amersfoort / RD New',
  base_crs: {
    name: 'Amersfoort',
    id: { authority: 'EPSG', code: 4289 },
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
  bbox: { south_latitude: 50.75, west_longitude: 3.2, north_latitude: 53.7, east_longitude: 7.22 },
  id: { authority: 'EPSG', code: 28992 },
}

// RD New's own origin. 155000/463000 metres is 5.38763888888889 E,
// 52.1561605555556 N *on the Amersfoort datum* — that is how the projection is
// defined — but the transform's output is WGS84, so the expected value is that
// point after the Amersfoort→WGS84 shift, 113.8 m to the south-west. Verified
// against `+proj=sterea ... +ellps=bessel +towgs84=565.4171,50.3319,465.5524,
// -0.398957,0.343988,-1.87740,4.0725`, which agrees to 0.00 m.
const RD_ORIGIN = [155000, 463000]
const RD_ORIGIN_LONLAT = [5.387203504610944, 52.15517229274862]

// A second point well inside the area of use, so the fixture is not only
// exercised at the projection's own origin (where several kinds of error
// cancel): Amsterdam, 121687/487484 m.
const RD_AMSTERDAM = [121687, 487484]
const RD_AMSTERDAM_LONLAT = [4.898009884440856, 52.37421815184261]

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
    // A Web Mercator easting of 1e9 metres is ~24 times around the world, so
    // it falls outside the projection's own input domain and is rejected
    // before proj4 sees it (see the domain-guard tests below for why the
    // check has to happen on the way in).
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

// EPSG:27572 (NTF (Paris) / Lambert zone II), abridged from the real EPSG
// PROJJSON. The prime meridian is Paris expressed in *grads*, which is the
// interesting part: PROJJSON writes a non-degree unit as a `{value, unit}`
// object, and proj4's parser multiplies that object by π/180 straight away,
// yielding `from_greenwich = NaN`. Because proj4 then guards the offset with
// `if (source.from_greenwich)` and NaN is falsy, it silently drops the whole
// Paris meridian — 2.337°, about 171 km — and returns a well-formed lon/lat
// that no coordinate-level check can flag.
const NTF_PARIS_PROJJSON = {
  type: 'ProjectedCRS',
  name: 'NTF (Paris) / Lambert zone II',
  base_crs: {
    name: 'NTF (Paris)',
    id: { authority: 'EPSG', code: 4807 },
    datum: {
      type: 'GeodeticReferenceFrame',
      name: 'Nouvelle Triangulation Francaise (Paris)',
      ellipsoid: { name: 'Clarke 1880 (IGN)', semi_major_axis: 6378249.2, semi_minor_axis: 6356515 },
      prime_meridian: {
        name: 'Paris',
        longitude: {
          value: 2.5969213,
          unit: { type: 'AngularUnit', name: 'grad', conversion_factor: 0.0157079632679489 },
        },
      },
    },
  },
  conversion: {
    name: 'Lambert zone II',
    method: { name: 'Lambert Conic Conformal (1SP)', id: { authority: 'EPSG', code: 9801 } },
    parameters: [
      { name: 'Latitude of natural origin', value: 52, unit: { type: 'AngularUnit', name: 'grad', conversion_factor: 0.0157079632679489 } },
      { name: 'Longitude of natural origin', value: 0, unit: { type: 'AngularUnit', name: 'grad', conversion_factor: 0.0157079632679489 } },
      { name: 'Scale factor at natural origin', value: 0.99987742, unit: 'unity' },
      { name: 'False easting', value: 600000, unit: 'metre' },
      { name: 'False northing', value: 2200000, unit: 'metre' },
    ],
  },
  coordinate_system: {
    subtype: 'Cartesian',
    axis: [
      { name: 'Easting', abbreviation: 'X', direction: 'east', unit: 'metre' },
      { name: 'Northing', abbreviation: 'Y', direction: 'north', unit: 'metre' },
    ],
  },
  bbox: { south_latitude: 42.33, west_longitude: -4.87, north_latitude: 51.14, east_longitude: 8.23 },
  id: { authority: 'EPSG', code: 27572 },
}

describe('createLonLatTransform prime meridian handling', () => {
  it('applies a prime meridian declared in grads', () => {
    // Without the unit conversion the Paris offset is dropped entirely and
    // longitude comes back as 0 — the Bay of Biscay instead of Paris.
    const transform = createLonLatTransform('EPSG:27572', NTF_PARIS_PROJJSON)
    const [lon, lat] = transform.forward([600000, 2428000])
    expect(lon).toBeCloseTo(2.3372291699, 6)
    expect(lat).toBeCloseTo(48.8504, 3)
  })

  it('refuses a definition whose prime meridian cannot be converted', () => {
    // An angular unit with no conversion factor cannot be reduced to degrees.
    // Handing it to proj4 anyway would silently skip the offset, so the
    // definition is dropped and the (unresolvable) code refuses the file.
    const broken = structuredClone(NTF_PARIS_PROJJSON)
    broken.base_crs.datum.prime_meridian.longitude = { value: 2.5969213, unit: 'grad' }
    expect(createLonLatTransform('EPSG:27572', broken)).toBeNull()
  })

  it('leaves a Greenwich-based definition alone', () => {
    const transform = createLonLatTransform('EPSG:28992', RD_NEW_PROJJSON)
    closeToLonLat(transform.forward(RD_ORIGIN), RD_ORIGIN_LONLAT)
  })
})

describe('createLonLatTransform candidate priority', () => {
  it('uses the file definition even when the authority code also resolves', () => {
    // proj4 ships every WGS84 UTM zone, so EPSG:32633 resolves on its own.
    // Pairing it with RD New's definition is deliberately mismatched: only
    // definition-first ordering can produce the RD New answer, which is what
    // makes this test able to detect the order being reversed.
    const transform = createLonLatTransform('EPSG:32633', RD_NEW_PROJJSON)
    closeToLonLat(transform.forward(RD_ORIGIN), RD_ORIGIN_LONLAT)
  })

  it('resolves a UTM zone from its authority code', () => {
    const transform = createLonLatTransform('EPSG:32631', null)
    const [lon, lat] = transform.forward([500000, 0])
    expect(lon).toBeCloseTo(3, 9)
    expect(lat).toBeCloseTo(0, 9)
  })
})

describe('reprojection domain guard', () => {
  // A stub transform pins the lon/lat range check exactly, without a real
  // projection's arithmetic deciding which coordinates are reachable.
  const fixedTransform = (out) => ({ forward: () => out })
  const point = { type: 'Point', coordinates: [0, 0] }

  it.each([
    ['the north-east corner', [180, 90]],
    ['the south-west corner', [-180, -90]],
  ])('keeps a position on %s of the lon/lat domain', (_label, out) => {
    expect(reprojectGeometry(point, fixedTransform(out))).not.toBeNull()
  })

  it.each([
    ['longitude past +180', [180.0000001, 0]],
    ['longitude past -180', [-180.0000001, 0]],
    ['latitude past +90', [0, 90.0000001]],
    ['latitude past -90', [0, -90.0000001]],
    // NaN and ±Infinity are rejected by the range comparisons alone (every
    // comparison against NaN is false), so the explicit finite check is
    // belt-and-braces rather than load-bearing.
    ['NaN', [NaN, 0]],
    ['Infinity', [Infinity, 0]],
    ['-Infinity', [0, -Infinity]],
  ])('drops a position with %s', (_label, out) => {
    expect(reprojectGeometry(point, fixedTransform(out))).toBeNull()
  })

  it('rejects Web Mercator input past the world extent instead of wrapping it', async () => {
    // proj4 wraps an easting past the extent back across the antimeridian, so
    // a line that runs off the edge would otherwise be drawn as a streak most
    // of the way around the globe.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'LineString', coordinates: [[19000000, 0], [20037508, 0], [20500000, 0]] } }],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/webmerc.parquet')
    expect(result.featureCollection.features).toHaveLength(0)
    expect(result.droppedFeatures).toBe(1)
  })

  it('still renders legitimate data close to the antimeridian', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'LineString', coordinates: [[19900000, -2000000], [20030000, -2000000]] } }],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/fiji.parquet')
    expect(result.droppedFeatures).toBe(0)
    const [[lon1], [lon2]] = result.featureCollection.features[0].geometry.coordinates
    expect(lon1).toBeCloseTo(178.765, 2)
    expect(lon2).toBeCloseTo(179.933, 2)
  })

  it('rejects a Web Mercator northing past the world extent instead of saturating it', async () => {
    // proj4 clamps an absurd northing to exactly ±90 rather than overflowing,
    // so without an input check every such feature piles onto the pole.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: [0, 1e18] } }],
      crs: { id: { authority: 'EPSG', code: 3857 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/webmerc.parquet')
    expect(result.featureCollection.features).toHaveLength(0)
    expect(result.droppedFeatures).toBe(1)
  })

  it('drops positions that land far outside the declared area of use', async () => {
    // 1e9 metres in RD New reprojects to a well-formed lon/lat south of New
    // Zealand. Only the declared area of use can catch that.
    mockParquetFile({
      numRows: 2,
      rows: [
        { geometry: { type: 'Point', coordinates: [1e9, 1e9] } },
        { geometry: { type: 'Point', coordinates: RD_AMSTERDAM } },
      ],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.droppedFeatures).toBe(1)
    closeToLonLat(result.featureCollection.features[0].geometry.coordinates, RD_AMSTERDAM_LONLAT)
  })

  it('allows data that overhangs the area of use by a little', async () => {
    // Area-of-use boxes are advisory; a dataset spilling just past its edge is
    // normal and must not be dropped.
    const justOutside = [155000, 700000] // ~54.3 N, north of the 53.7 N bound
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: justOutside } }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.droppedFeatures).toBe(0)
    expect(result.featureCollection.features[0].geometry.coordinates[1]).toBeGreaterThan(53.7)
  })

  it('drops positions moderately outside the area of use, not just absurd ones', async () => {
    // 1e6 m past the RD origin lands at ~23.4 E, 16 degrees east of the
    // declared 7.22 E bound. Pinning a case this close stops the margin from
    // being widened until the check no longer does anything.
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: [1155000, 1463000] } }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.featureCollection.features).toHaveLength(0)
    expect(result.droppedFeatures).toBe(1)
  })

  it('drops a GeometryCollection when any member fails, rather than keeping a partial one', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{
        geometry: {
          type: 'GeometryCollection',
          geometries: [
            { type: 'Point', coordinates: RD_ORIGIN },
            { type: 'Point', coordinates: [1e9, 1e9] },
          ],
        },
      }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.featureCollection.features).toHaveLength(0)
    expect(result.droppedFeatures).toBe(1)
  })
})

describe('reprojection coordinate shape', () => {
  it('preserves a fourth ordinate as well as a third', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: { type: 'Point', coordinates: [...RD_ORIGIN, 12.5, 99] } }],
      crs: RD_NEW_PROJJSON,
    })
    const result = await loadGeoJsonFromParquet('https://example.com/rd.parquet')
    expect(result.featureCollection.features[0].geometry.coordinates.slice(2)).toEqual([12.5, 99])
  })

  it('ignores the axis order a PROJJSON coordinate_system declares', () => {
    // GeoParquet always stores x/y in WKB regardless of the CRS's declared
    // axis order, and proj4 only honours `axis` when forward() is called with
    // an explicit enforceAxis argument (which we never pass). Pinning this
    // makes the assumption fail loudly if proj4 ever changes its default.
    const northFirst = structuredClone(RD_NEW_PROJJSON)
    northFirst.coordinate_system.axis = [
      { name: 'Northing', abbreviation: 'Y', direction: 'north', unit: 'metre' },
      { name: 'Easting', abbreviation: 'X', direction: 'east', unit: 'metre' },
    ]
    const eastFirst = createLonLatTransform('EPSG:28992', RD_NEW_PROJJSON)
    const flipped = createLonLatTransform('EPSG:28992', northFirst)
    expect(flipped.forward(RD_ORIGIN)).toEqual(eastFirst.forward(RD_ORIGIN))
  })
})

describe('other CRS families', () => {
  it('reprojects a CRS whose axes are in US survey feet', () => {
    // EPSG:2263 (NAD83 / New York Long Island, ftUS). A unit mix-up here
    // would scale coordinates by 3.28 and put the data in the wrong ocean.
    const nyLongIsland = {
      type: 'ProjectedCRS',
      name: 'NAD83 / New York Long Island (ftUS)',
      base_crs: {
        name: 'NAD83',
        id: { authority: 'EPSG', code: 4269 },
        datum: {
          type: 'GeodeticReferenceFrame',
          name: 'North American Datum 1983',
          ellipsoid: { name: 'GRS 1980', semi_major_axis: 6378137, inverse_flattening: 298.257222101 },
        },
      },
      conversion: {
        name: 'SPCS83 New York Long Island zone (US survey foot)',
        method: { name: 'Lambert Conic Conformal (2SP)', id: { authority: 'EPSG', code: 9802 } },
        parameters: [
          { name: 'Latitude of false origin', value: 40.1666666666667, unit: 'degree' },
          { name: 'Longitude of false origin', value: -74, unit: 'degree' },
          { name: 'Latitude of 1st standard parallel', value: 41.0333333333333, unit: 'degree' },
          { name: 'Latitude of 2nd standard parallel', value: 40.6666666666667, unit: 'degree' },
          { name: 'Easting at false origin', value: 984250, unit: { type: 'LinearUnit', name: 'US survey foot', conversion_factor: 0.304800609601219 } },
          { name: 'Northing at false origin', value: 0, unit: { type: 'LinearUnit', name: 'US survey foot', conversion_factor: 0.304800609601219 } },
        ],
      },
      coordinate_system: {
        subtype: 'Cartesian',
        axis: [
          { name: 'Easting', abbreviation: 'X', direction: 'east', unit: { type: 'LinearUnit', name: 'US survey foot', conversion_factor: 0.304800609601219 } },
          { name: 'Northing', abbreviation: 'Y', direction: 'north', unit: { type: 'LinearUnit', name: 'US survey foot', conversion_factor: 0.304800609601219 } },
        ],
      },
      id: { authority: 'EPSG', code: 2263 },
    }
    const transform = createLonLatTransform('EPSG:2263', nyLongIsland)
    // The false origin itself: 984250 ftUS easting, 0 northing.
    const [lon, lat] = transform.forward([984250, 0])
    expect(lon).toBeCloseTo(-74, 6)
    expect(lat).toBeCloseTo(40.1666666666667, 6)
  })

  it('uses the horizontal half of a CompoundCRS', () => {
    // EPSG:7415 is RD New paired with NAP height. proj4 cannot transform the
    // pair, but the map only needs the horizontal component.
    const compound = {
      type: 'CompoundCRS',
      name: 'Amersfoort / RD New + NAP height',
      components: [
        RD_NEW_PROJJSON,
        { type: 'VerticalCRS', name: 'NAP height' },
      ],
      id: { authority: 'EPSG', code: 7415 },
    }
    const transform = createLonLatTransform('EPSG:7415', compound)
    expect(transform).not.toBeNull()
    closeToLonLat(transform.forward(RD_ORIGIN), RD_ORIGIN_LONLAT)
  })

  it('applies the datum shift for a GeographicCRS that is not WGS84', () => {
    // NAD83 coordinates are already degrees, so nothing here is out of range
    // — an omitted datum shift would simply move the data a metre or two with
    // no other symptom.
    const transform = createLonLatTransform('EPSG:4269', null)
    const [lon, lat] = transform.forward([-74, 40.7])
    expect(lon).toBeCloseTo(-74, 6)
    expect(lat).toBeCloseTo(40.7, 6)
  })
})

describe('declared lon/lat CRSs are passed through, not reprojected', () => {
  it('passes through an explicitly declared EPSG:4326', async () => {
    mockParquetFile({
      numRows: 1,
      rows: [{ geometry: POLYGON }],
      crs: { id: { authority: 'EPSG', code: 4326 } },
    })
    const result = await loadGeoJsonFromParquet('https://example.com/wgs84.parquet')
    expect(result.reprojectedFrom).toBeNull()
    expect(result.featureCollection.features[0].geometry).toEqual(POLYGON)
  })
})

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
