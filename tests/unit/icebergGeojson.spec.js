import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock icebird so loadGeoJsonFromIceberg runs without network or a real table.
const icebird = vi.hoisted(() => ({
  icebergMetadata: vi.fn(),
  icebergDataSource: vi.fn(),
  icebergQuery: vi.fn(),
  streamRowBatches: vi.fn(),
  urlResolver: vi.fn(() => ({ reader: vi.fn() })),
}))
vi.mock('icebird', () => icebird)

import {
  geometryBbox, geometryColumns, loadGeoJsonFromIceberg, loadIcebergRows, loadIcebergSnapshots, summarizeSnapshots,
} from '../../src/utils/iceberg.js'

const URL = 'https://example.com/wh/tbl/metadata/v1.metadata.json'

function metadata(fields, extra = {}) {
  return {
    'current-schema-id': 0,
    schemas: [{ 'schema-id': 0, fields }],
    'current-snapshot-id': 7n,
    snapshots: [{ 'snapshot-id': 7n, summary: { 'total-records': '250' } }],
    ...extra,
  }
}

const point = (x, y) => ({ type: 'Point', coordinates: [x, y] })

// Feeds the mocked query result as one or more batches of rows.
function rowsAre(...batches) {
  icebird.streamRowBatches.mockImplementation(async function* () {
    for (const batch of batches) { yield batch }
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  icebird.urlResolver.mockReturnValue({ reader: vi.fn() })
  icebird.icebergDataSource.mockResolvedValue({ source: true })
  icebird.icebergQuery.mockResolvedValue({ result: true })
  icebird.icebergMetadata.mockResolvedValue(metadata([
    { id: 1, name: 'id', type: 'long' },
    { id: 2, name: 'name', type: 'string' },
    { id: 3, name: 'object_geometry', type: 'geometry' },
  ]))
})

describe('geometryColumns', () => {
  it('finds geometry and geography columns by type, whatever their name', () => {
    expect(geometryColumns({ fields: [
      { name: 'a', type: 'string' },
      { name: 'shape', type: 'geometry' },
      { name: 'where', type: 'geography(OGC:CRS84, spherical)' },
      { name: 'proj', type: 'geometry(EPSG:3067)' },
    ] })).toEqual([
      { name: 'shape', crs: null },
      { name: 'where', crs: 'OGC:CRS84' },
      { name: 'proj', crs: 'EPSG:3067' },
    ])
  })

  it('ignores a nested struct type', () => {
    expect(geometryColumns({ fields: [{ name: 's', type: { type: 'struct', fields: [] } }] })).toEqual([])
  })
})

describe('loadGeoJsonFromIceberg', () => {
  it('reads the geometry column and returns a FeatureCollection', async () => {
    rowsAre([{ object_geometry: point(1, 2) }, { object_geometry: point(3, 4) }])
    const result = await loadGeoJsonFromIceberg(URL)

    expect(result.exceeded).toBe(false)
    expect(result.truncated).toBe(false)
    expect(result.featureCollection.features.map(f => f.geometry)).toEqual([point(1, 2), point(3, 4)])
    expect(result.totalRows).toBe(250)
    expect(result.reprojectedFrom).toBe(null)
  })

  it('addresses the table by its root and metadata file name', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL)

    expect(icebird.icebergMetadata).toHaveBeenCalledWith(expect.objectContaining({
      tableUrl: 'https://example.com/wh/tbl',
      metadataFileName: 'v1.metadata.json',
    }))
  })

  it('selects only the geometry column, skips null geometries and caps the read in SQL', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { maxFeatures: 10 })

    const { query, tables } = icebird.icebergQuery.mock.calls[0][0]
    expect(query).toBe('SELECT "object_geometry" FROM t WHERE "object_geometry" IS NOT NULL LIMIT 11')
    expect(tables).toEqual({ t: { source: true } })
  })

  it('reads the requested attribute columns that the table has and reports the others', async () => {
    rowsAre([{ object_geometry: point(1, 2), name: 'park', big: 5n }])
    const result = await loadGeoJsonFromIceberg(URL, { fields: ['name', 'missing'] })

    expect(icebird.icebergQuery.mock.calls[0][0].query).toContain('SELECT "object_geometry", "name" FROM t')
    expect(result.featureCollection.features[0].properties).toEqual({ name: 'park' })
    expect(result.missingFields).toEqual(['missing'])
  })

  it('stops at the cap and marks the result truncated', async () => {
    rowsAre(
      [{ object_geometry: point(0, 0) }, { object_geometry: point(1, 1) }],
      [{ object_geometry: point(2, 2) }, { object_geometry: point(3, 3) }],
    )
    const result = await loadGeoJsonFromIceberg(URL, { maxFeatures: 3 })

    expect(result.truncated).toBe(true)
    expect(result.max).toBe(3)
    expect(result.featureCollection.features).toHaveLength(3)
  })

  it('does not mark a table truncated when it holds exactly the cap', async () => {
    rowsAre([{ object_geometry: point(0, 0) }, { object_geometry: point(1, 1) }, { object_geometry: point(2, 2) }])
    const result = await loadGeoJsonFromIceberg(URL, { maxFeatures: 3 })

    expect(result.truncated).toBe(false)
    expect(result.featureCollection.features).toHaveLength(3)
  })

  it('prefers the declared primary geometry column when there are several', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([
      { id: 1, name: 'centroid', type: 'geometry' },
      { id: 2, name: 'footprint', type: 'geometry' },
    ]))
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { geometryColumn: 'footprint' })

    expect(icebird.icebergQuery.mock.calls[0][0].query).toContain('SELECT "footprint"')
  })

  it('pins the declared snapshot only when the table still has it', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { snapshotId: '7' })
    expect(icebird.icebergDataSource.mock.calls[0][0].snapshotId).toBe(7n)

    await loadGeoJsonFromIceberg(URL, { snapshotId: '999' })
    expect(icebird.icebergDataSource.mock.calls[1][0].snapshotId).toBeUndefined()
  })

  it('throws a coded error when the table has no geometry column', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'id', type: 'long' }]))

    await expect(loadGeoJsonFromIceberg(URL)).rejects.toMatchObject({ noticeReason: 'noGeometry' })
    expect(icebird.icebergQuery).not.toHaveBeenCalled()
  })

  it('refuses a CRS it cannot reproject', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'g', type: 'geometry(SR-ORG:7777)' }]))

    await expect(loadGeoJsonFromIceberg(URL)).rejects.toThrow(/not supported/)
  })

  it('treats EPSG:4326 as lon/lat without reprojecting', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'g', type: 'geometry(EPSG:4326)' }]))
    rowsAre([{ g: point(5, 6) }])
    const result = await loadGeoJsonFromIceberg(URL)

    expect(result.reprojectedFrom).toBe(null)
    expect(result.featureCollection.features[0].geometry).toEqual(point(5, 6))
  })

  it('reprojects a projected CRS to lon/lat', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'g', type: 'geometry(EPSG:3857)' }]))
    // 1113194.9 m east on the equator is 10 degrees of longitude.
    rowsAre([{ g: point(1113194.9, 0) }])
    const result = await loadGeoJsonFromIceberg(URL)

    expect(result.reprojectedFrom).toBe('EPSG:3857')
    const [lon, lat] = result.featureCollection.features[0].geometry.coordinates
    expect(lon).toBeCloseTo(10, 3)
    expect(lat).toBeCloseTo(0, 3)
  })

  it('rejects a metadata URL outside a metadata folder', async () => {
    await expect(loadGeoJsonFromIceberg('https://example.com/tbl/v1.metadata.json')).rejects.toThrow(/\/metadata\//)
    expect(icebird.icebergMetadata).not.toHaveBeenCalled()
  })

  it('rejects with an AbortError when the signal aborts mid read', async () => {
    const controller = new AbortController()
    icebird.streamRowBatches.mockImplementation(async function* () {
      controller.abort()
      yield [{ object_geometry: point(1, 2) }]
    })

    await expect(loadGeoJsonFromIceberg(URL, { signal: controller.signal }))
      .rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects when a geometry arrives undecoded', async () => {
    rowsAre([{ object_geometry: new Uint8Array([1, 2, 3]) }])

    await expect(loadGeoJsonFromIceberg(URL)).rejects.toThrow(/not decoded/)
  })
})

describe('geometryBbox', () => {
  it('covers a point, a polygon and a multipolygon', () => {
    expect(geometryBbox(point(3, 4))).toEqual([3, 4, 3, 4])
    expect(geometryBbox({ type: 'Polygon', coordinates: [[[0, 0], [4, 0], [4, 2], [0, 0]]] })).toEqual([0, 0, 4, 2])
    expect(geometryBbox({
      type: 'MultiPolygon',
      coordinates: [[[[0, 0], [1, 0], [1, 1], [0, 0]]], [[[5, 5], [6, 5], [6, 7], [5, 5]]]],
    })).toEqual([0, 0, 6, 7])
  })

  it('merges the members of a GeometryCollection', () => {
    expect(geometryBbox({ type: 'GeometryCollection', geometries: [point(1, 1), point(-2, 9)] })).toEqual([-2, 1, 1, 9])
  })

  it('returns null for a missing or empty geometry', () => {
    expect(geometryBbox(null)).toBe(null)
    expect(geometryBbox({ type: 'Point' })).toBe(null)
    expect(geometryBbox({ type: 'MultiPoint', coordinates: [] })).toBe(null)
  })
})

describe('loadIcebergRows', () => {
  it('returns rows as arrays in column order, without the geometry column', async () => {
    rowsAre([
      { id: 1n, name: 'a', object_geometry: point(1, 2) },
      { id: 2n, name: 'b', object_geometry: null },
    ])
    const result = await loadIcebergRows(URL)

    expect(result.columns).toEqual(['id', 'name'])
    expect(result.rows).toEqual([[1n, 'a'], [2n, 'b']])
    expect(result.geometryColumn).toBe('object_geometry')
    expect(result.loadedRows).toBe(2)
  })

  it('computes one bounding box per row, null where the geometry is null', async () => {
    rowsAre([
      { id: 1n, name: 'a', object_geometry: point(1, 2) },
      { id: 2n, name: 'b', object_geometry: null },
    ])
    const result = await loadIcebergRows(URL)

    expect(result.bboxes).toEqual([[1, 2, 1, 2], null])
    expect(result.crs).toBe('EPSG:4326')
  })

  it('reports the CRS the type declares', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'g', type: 'geometry(EPSG:3067)' }]))
    rowsAre([{ g: point(400000, 6700000) }])

    expect((await loadIcebergRows(URL)).crs).toBe('EPSG:3067')
  })

  it('asks for the first 1000 rows by default and reads every column', async () => {
    rowsAre([])
    await loadIcebergRows(URL)

    expect(icebird.icebergQuery.mock.calls[0][0].query)
      .toBe('SELECT "id", "name", "object_geometry" FROM t LIMIT 1000')
  })

  it('stops at the row cap', async () => {
    rowsAre(
      [{ id: 1n, name: 'a', object_geometry: null }, { id: 2n, name: 'b', object_geometry: null }],
      [{ id: 3n, name: 'c', object_geometry: null }, { id: 4n, name: 'd', object_geometry: null }],
    )
    const result = await loadIcebergRows(URL, { maxRows: 3 })

    expect(result.rows).toHaveLength(3)
    expect(result.loadedRows).toBe(3)
    expect(result.bboxes).toHaveLength(3)
  })

  it('takes the table size from the snapshot summary', async () => {
    rowsAre([{ id: 1n, name: 'a', object_geometry: null }])
    const result = await loadIcebergRows(URL)

    expect(result.totalRows).toBe(250)
    expect(result.loadedRows).toBe(1)
  })

  it('falls back to the loaded count when the summary has no total', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata(
      [{ id: 1, name: 'id', type: 'long' }],
      { snapshots: [{ 'snapshot-id': 7n, summary: {} }] },
    ))
    rowsAre([{ id: 1n }, { id: 2n }])

    expect((await loadIcebergRows(URL)).totalRows).toBe(2)
  })

  it('previews a table that has no geometry column', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'id', type: 'long' }]))
    rowsAre([{ id: 1n }])
    const result = await loadIcebergRows(URL)

    expect(result.geometryColumn).toBe(null)
    expect(result.crs).toBe(null)
    expect(result.columns).toEqual(['id'])
    expect(result.bboxes).toEqual([null])
  })

  it('prints a date as an ISO string and a secondary geometry as its type', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([
      { id: 1, name: 'seen', type: 'timestamp' },
      { id: 2, name: 'centroid', type: 'geometry' },
      { id: 3, name: 'footprint', type: 'geometry' },
    ]))
    rowsAre([{ seen: new Date('2026-01-02T03:04:05Z'), centroid: point(1, 1), footprint: point(2, 2) }])
    const result = await loadIcebergRows(URL, { geometryColumn: 'footprint' })

    expect(result.columns).toEqual(['seen', 'centroid'])
    expect(result.rows).toEqual([['2026-01-02T03:04:05.000Z', 'Point']])
    expect(result.bboxes).toEqual([[2, 2, 2, 2]])
  })

  it('rejects with an AbortError when the signal aborts mid read', async () => {
    const controller = new AbortController()
    icebird.streamRowBatches.mockImplementation(async function* () {
      controller.abort()
      yield [{ id: 1n }]
    })

    await expect(loadIcebergRows(URL, { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('summarizeSnapshots', () => {
  const snapshot = (id, ms, summary, extra = {}) => ({
    'snapshot-id': id, 'timestamp-ms': ms, summary, ...extra,
  })

  it('reads the columns of the snapshots table from the summary', () => {
    const [only] = summarizeSnapshots({
      'current-snapshot-id': 7301492987444415423n,
      snapshots: [snapshot(7301492987444415423n, Date.UTC(2026, 9, 8, 14, 54, 16), {
        operation: 'append', 'total-records': '402756', 'total-data-files': '1',
      })],
    })

    expect(only).toMatchObject({
      id: '7301492987444415423',
      operation: 'append',
      rows: 402756,
      files: 1,
      current: true,
    })
    expect(only.timestamp.toISOString()).toBe('2026-10-08T14:54:16.000Z')
  })

  it('keeps a 64-bit id exact', () => {
    const [only] = summarizeSnapshots({ snapshots: [snapshot(9223372036854775807n, 1, {})] })
    expect(only.id).toBe('9223372036854775807')
  })

  it('lists the newest snapshot first and marks only the current one', () => {
    const rows = summarizeSnapshots({
      'current-snapshot-id': 2n,
      snapshots: [snapshot(1n, 1000, {}), snapshot(3n, 3000, {}), snapshot(2n, 2000, {})],
    })

    expect(rows.map(r => r.id)).toEqual(['3', '2', '1'])
    expect(rows.map(r => r.current)).toEqual([false, true, false])
  })

  it('breaks a timestamp tie by sequence number', () => {
    const rows = summarizeSnapshots({
      snapshots: [snapshot(1n, 1000, {}, { 'sequence-number': 1 }), snapshot(2n, 1000, {}, { 'sequence-number': 2 })],
    })

    expect(rows.map(r => r.id)).toEqual(['2', '1'])
  })

  it('subtracts position deletes from the row count', () => {
    const [only] = summarizeSnapshots({
      snapshots: [snapshot(1n, 1, { 'total-records': '100', 'total-position-deletes': '30' })],
    })

    expect(only.rows).toBe(70)
  })

  it('reports the total when an equality delete hides an unknown number of rows', () => {
    const [only] = summarizeSnapshots({
      snapshots: [snapshot(1n, 1, {
        'total-records': '100', 'total-position-deletes': '30', 'total-equality-deletes': '5',
      })],
    })

    expect(only.rows).toBe(100)
  })

  it('leaves a count null when the writer omitted it', () => {
    const [only] = summarizeSnapshots({ snapshots: [snapshot(1n, 1, { operation: 'append' })] })

    expect(only.rows).toBe(null)
    expect(only.files).toBe(null)
  })

  it('handles a table with no snapshots and a snapshot with no timestamp', () => {
    expect(summarizeSnapshots({})).toEqual([])
    expect(summarizeSnapshots({ snapshots: [{ 'snapshot-id': 1n }] })[0]).toMatchObject({
      timestamp: null, operation: null, rows: null, files: null, current: false,
    })
  })
})

describe('loadIcebergSnapshots', () => {
  it('reads the metadata file and nothing else', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([{ id: 1, name: 'id', type: 'long' }]))
    const result = await loadIcebergSnapshots(URL)

    expect(result.currentSnapshotId).toBe('7')
    expect(result.snapshots).toHaveLength(1)
    expect(icebird.icebergMetadata).toHaveBeenCalledWith(expect.objectContaining({
      tableUrl: 'https://example.com/wh/tbl',
      metadataFileName: 'v1.metadata.json',
    }))
    expect(icebird.icebergDataSource).not.toHaveBeenCalled()
    expect(icebird.icebergQuery).not.toHaveBeenCalled()
  })

  it('rejects a metadata URL outside a metadata folder', async () => {
    await expect(loadIcebergSnapshots('https://example.com/tbl/v1.metadata.json')).rejects.toThrow(/\/metadata\//)
  })
})
