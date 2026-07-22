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

  it('throws for a CRS the map cannot display', async () => {
    mockParquetFile({
      numRows: 1,
      crs: { id: { authority: 'EPSG', code: 2249 } },
    })
    await expect(loadGeoJsonFromParquet('https://example.com/data.parquet'))
      .rejects.toThrow(/EPSG:2249/)
  })

  it('rejects a declared PROJJSON CRS without a recognizable authority/code', async () => {
    // Legal per GeoParquet (some writers omit `id`), but it cannot be assumed
    // to be lon/lat — defaulting to EPSG:4326 would plot projected meters raw.
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
