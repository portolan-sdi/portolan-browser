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
  rebasedResolver, verifiedResolver,
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

// The map loader with a row cap, as the layer would call it.
const loadGeoJsonFor = maxRows => loadGeoJsonFromIceberg(URL, { maxRows })

describe('loadGeoJsonFromIceberg', () => {
  it('reads the geometry column and returns a FeatureCollection', async () => {
    rowsAre([{ object_geometry: point(1, 2) }, { object_geometry: point(3, 4) }])
    const result = await loadGeoJsonFromIceberg(URL)

    expect(result.exceeded).toBe(false)
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

  it('selects only the geometry column and caps the read at the row limit in SQL', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { maxRows: 10 })

    const { query, tables } = icebird.icebergQuery.mock.calls[0][0]
    expect(query).toBe('SELECT "object_geometry" FROM t LIMIT 10 OFFSET 0')
    expect(tables).toEqual({ t: { source: true } })
  })

  it('reads the first 1000 rows by default, the same rows as the preview table', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL)
    await loadIcebergRows(URL)

    expect(icebird.icebergQuery.mock.calls[0][0].query).toContain(' FROM t LIMIT 1000 OFFSET 0')
    expect(icebird.icebergQuery.mock.calls[1][0].query).toContain(' FROM t LIMIT 1000 OFFSET 0')
  })

  it('does not filter on the geometry, so row order matches the preview table', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL)

    expect(icebird.icebergQuery.mock.calls[0][0].query).not.toMatch(/WHERE/i)
  })

  it('reads the requested attribute columns that the table has and reports the others', async () => {
    rowsAre([{ object_geometry: point(1, 2), name: 'park', big: 5n }])
    const result = await loadGeoJsonFromIceberg(URL, { fields: ['name', 'missing'] })

    expect(icebird.icebergQuery.mock.calls[0][0].query).toContain('SELECT "object_geometry", "name" FROM t')
    expect(result.featureCollection.features[0].properties).toEqual({ name: 'park' })
    expect(result.missingFields).toEqual(['missing'])
  })

  it('stops at the row cap', async () => {
    rowsAre(
      [{ object_geometry: point(0, 0) }, { object_geometry: point(1, 1) }],
      [{ object_geometry: point(2, 2) }, { object_geometry: point(3, 3) }],
    )
    const result = await loadGeoJsonFor(3)

    expect(result.featureCollection.features).toHaveLength(3)
  })

  it('counts a row with no geometry toward the cap and draws nothing for it', async () => {
    rowsAre([
      { object_geometry: null },
      { object_geometry: point(1, 1) },
      { object_geometry: null },
      { object_geometry: point(3, 3) },
      { object_geometry: point(4, 4) },
    ])
    const result = await loadGeoJsonFor(4)

    // Only the first four rows count, so the fifth row's geometry stays out.
    expect(result.featureCollection.features.map(f => f.geometry)).toEqual([point(1, 1), point(3, 3)])
  })

  it('reads the page that starts after the rows to skip', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { maxRows: 1000, offset: 3000 })

    expect(icebird.icebergQuery.mock.calls[0][0].query)
      .toBe('SELECT "object_geometry" FROM t LIMIT 1000 OFFSET 3000')
  })

  it('asks for the same page as the preview table for the same offset', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { offset: 2000 })
    await loadIcebergRows(URL, { offset: 2000 })

    const [map, table] = icebird.icebergQuery.mock.calls.map(call => call[0].query)
    expect(map).toContain(' FROM t LIMIT 1000 OFFSET 2000')
    expect(table).toContain(' FROM t LIMIT 1000 OFFSET 2000')
  })

  it('draws the geometries of exactly the rows the preview table shows', async () => {
    const rows = [
      { id: 1n, name: 'a', object_geometry: null },
      { id: 2n, name: 'b', object_geometry: point(2, 2) },
      { id: 3n, name: 'c', object_geometry: point(3, 3) },
      { id: 4n, name: 'd', object_geometry: point(4, 4) },
    ]
    rowsAre(rows)
    const table = await loadIcebergRows(URL, { maxRows: 3 })
    rowsAre(rows)
    const map = await loadGeoJsonFor(3)

    const inTable = table.bboxes.filter(Boolean).map(([x, y]) => [x, y])
    const onMap = map.featureCollection.features.map(f => f.geometry.coordinates)
    expect(onMap).toEqual(inTable)
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

  it('lists every column with its type, the geometry column included, in schema order', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata([
      { id: 1, name: 'id', type: 'long' },
      { id: 2, name: 'tags', type: { type: 'list', 'element-id': 9, element: 'string' } },
      { id: 3, name: 'shape', type: 'geometry(EPSG:3067)' },
    ]))
    rowsAre([])
    const result = await loadIcebergRows(URL, { geometryColumn: 'shape' })

    expect(result.fields).toEqual([
      { name: 'id', type: 'long' },
      { name: 'tags', type: 'list' },
      { name: 'shape', type: 'geometry(EPSG:3067)' },
    ])
    expect(result.columns).toEqual(['id', 'tags'])
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
      .toBe('SELECT "id", "name", "object_geometry" FROM t LIMIT 1000 OFFSET 0')
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

  it('falls back to the rows seen when the summary has no total', async () => {
    icebird.icebergMetadata.mockResolvedValue(metadata(
      [{ id: 1, name: 'id', type: 'long' }],
      { snapshots: [{ 'snapshot-id': 7n, summary: {} }] },
    ))
    rowsAre([{ id: 1n }, { id: 2n }])
    const result = await loadIcebergRows(URL)

    expect(result.totalRows).toBe(2)
    expect(result.totalKnown).toBe(false)
  })

  it('says the total is known when the snapshot summary gives it', async () => {
    rowsAre([{ id: 1n, name: 'a', object_geometry: null }])

    expect((await loadIcebergRows(URL)).totalKnown).toBe(true)
  })

  describe('paging', () => {
    it('starts the page after the rows to skip', async () => {
      rowsAre([])
      await loadIcebergRows(URL, { offset: 2000, maxRows: 1000 })

      expect(icebird.icebergQuery.mock.calls[0][0].query)
        .toBe('SELECT "id", "name", "object_geometry" FROM t LIMIT 1000 OFFSET 2000')
    })

    it('reports the offset it read from', async () => {
      rowsAre([{ id: 1n, name: 'a', object_geometry: null }])

      expect((await loadIcebergRows(URL, { offset: 2000 })).offset).toBe(2000)
      expect((await loadIcebergRows(URL)).offset).toBe(0)
    })

    it('keeps the same snapshot and metadata file for every page', async () => {
      rowsAre([])
      await loadIcebergRows(URL, { offset: 0, snapshotId: '7' })
      await loadIcebergRows(URL, { offset: 1000, snapshotId: '7' })

      expect(icebird.icebergDataSource.mock.calls.map(c => c[0].snapshotId)).toEqual([7n, 7n])
      expect(icebird.icebergMetadata.mock.calls.map(c => c[0].metadataFileName)).toEqual(['v1.metadata.json', 'v1.metadata.json'])
    })

    it('counts rows seen so far as the total when the summary has none', async () => {
      icebird.icebergMetadata.mockResolvedValue(metadata(
        [{ id: 1, name: 'id', type: 'long' }],
        { snapshots: [{ 'snapshot-id': 7n, summary: {} }] },
      ))
      rowsAre([{ id: 1n }, { id: 2n }])
      const result = await loadIcebergRows(URL, { offset: 1000 })

      expect(result.totalRows).toBe(1002)
    })

    it('returns an empty page past the end of the table', async () => {
      rowsAre([])
      const result = await loadIcebergRows(URL, { offset: 999999 })

      expect(result.rows).toEqual([])
      expect(result.loadedRows).toBe(0)
      expect(result.bboxes).toEqual([])
    })
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

describe('filtering with a SQL condition', () => {
  it('adds the condition to the table query, in parentheses', async () => {
    rowsAre([])
    await loadIcebergRows(URL, { where: "name = 'a' OR id > 5" })

    expect(icebird.icebergQuery.mock.calls[0][0].query)
      .toBe('SELECT "id", "name", "object_geometry" FROM t WHERE (name = \'a\' OR id > 5) LIMIT 1000 OFFSET 0')
  })

  it('adds the same condition to the map query, so both views hold the same rows', async () => {
    rowsAre([])
    await loadGeoJsonFromIceberg(URL, { where: "name = 'a'", offset: 1000 })

    expect(icebird.icebergQuery.mock.calls[0][0].query)
      .toBe('SELECT "object_geometry" FROM t WHERE (name = \'a\') LIMIT 1000 OFFSET 1000')
  })

  it('trims the condition and adds nothing for an empty one', async () => {
    rowsAre([])
    await loadIcebergRows(URL, { where: '   ' })
    await loadIcebergRows(URL, { where: '  id > 1  ' })

    expect(icebird.icebergQuery.mock.calls[0][0].query).not.toMatch(/WHERE/)
    expect(icebird.icebergQuery.mock.calls[1][0].query).toContain('WHERE (id > 1) LIMIT')
  })

  it('does not report the whole table size for a filtered read', async () => {
    rowsAre([{ id: 1n, name: 'a', object_geometry: null }])
    const filtered = await loadIcebergRows(URL, { where: "name = 'a'" })
    const whole = await loadIcebergRows(URL)

    expect(filtered.totalKnown).toBe(false)
    expect(filtered.totalRows).toBe(1)
    expect(whole.totalKnown).toBe(true)
    expect(whole.totalRows).toBe(250)
  })

  it('passes a syntax error from the query engine up to the caller', async () => {
    icebird.icebergQuery.mockRejectedValue(new SyntaxError('Expected expression after "WHERE" but found "="'))

    await expect(loadIcebergRows(URL, { where: '= =' })).rejects.toThrow(/Expected expression/)
    await expect(loadGeoJsonFromIceberg(URL, { where: '= =' })).rejects.toThrow(/Expected expression/)
  })
})

describe('reading a table at a snapshot', () => {
  const twoSnapshots = () => metadata([
    { id: 1, name: 'id', type: 'long' },
    { id: 2, name: 'object_geometry', type: 'geometry' },
  ], {
    'current-snapshot-id': 7n,
    snapshots: [
      { 'snapshot-id': 5n, summary: { 'total-records': '100' } },
      { 'snapshot-id': 7n, summary: { 'total-records': '250' } },
    ],
  })

  it('reads the snapshot the caller names', async () => {
    icebird.icebergMetadata.mockResolvedValue(twoSnapshots())
    rowsAre([])
    await loadIcebergRows(URL, { snapshotId: '5' })
    await loadGeoJsonFromIceberg(URL, { snapshotId: '5' })

    expect(icebird.icebergDataSource.mock.calls.map(c => c[0].snapshotId)).toEqual([5n, 5n])
  })

  it('takes the table size from that snapshot, not the current one', async () => {
    icebird.icebergMetadata.mockResolvedValue(twoSnapshots())
    rowsAre([{ id: 1n }])

    expect((await loadIcebergRows(URL, { snapshotId: '5' })).totalRows).toBe(100)
    expect((await loadIcebergRows(URL, { snapshotId: '7' })).totalRows).toBe(250)
    expect((await loadIcebergRows(URL)).totalRows).toBe(250)
    expect((await loadGeoJsonFromIceberg(URL, { snapshotId: '5' })).totalRows).toBe(100)
  })

  it('finds a snapshot whose id icebird parsed as a number, not a BigInt', async () => {
    // A snapshot id under 2^53 arrives as a number. One over it arrives as a BigInt.
    icebird.icebergMetadata.mockResolvedValue(metadata([
      { id: 1, name: 'id', type: 'long' },
      { id: 2, name: 'object_geometry', type: 'geometry' },
    ], {
      'current-snapshot-id': 1367746163159851,
      snapshots: [
        { 'snapshot-id': 8499625711907274, summary: { 'total-records': '2' } },
        { 'snapshot-id': 1367746163159851, summary: { 'total-records': '6' } },
      ],
    }))
    rowsAre([{ id: 1n }])

    const old = await loadIcebergRows(URL, { snapshotId: '8499625711907274' })
    const current = await loadIcebergRows(URL)

    expect(old.totalRows).toBe(2)
    expect(old.totalKnown).toBe(true)
    expect(current.totalRows).toBe(6)
    expect(current.totalKnown).toBe(true)
    // icebird is handed the id as a BigInt, as before.
    expect(icebird.icebergDataSource.mock.calls[0][0].snapshotId).toBe(8499625711907274n)
  })

  it('reads the current snapshot when the table does not have the one named', async () => {
    icebird.icebergMetadata.mockResolvedValue(twoSnapshots())
    rowsAre([{ id: 1n }])
    const result = await loadIcebergRows(URL, { snapshotId: '999' })

    expect(icebird.icebergDataSource.mock.calls[0][0].snapshotId).toBeUndefined()
    expect(result.totalRows).toBe(250)
  })

  it('keeps a filter and a page together with the snapshot', async () => {
    icebird.icebergMetadata.mockResolvedValue(twoSnapshots())
    rowsAre([])
    await loadIcebergRows(URL, { snapshotId: '5', where: 'id > 1', offset: 1000 })

    expect(icebird.icebergQuery.mock.calls[0][0].query).toContain('FROM t WHERE (id > 1) LIMIT 1000 OFFSET 1000')
    expect(icebird.icebergDataSource.mock.calls[0][0].snapshotId).toBe(5n)
  })
})

describe('verifiedResolver', () => {
  // A source that answers each slice call from a list of byte lengths.
  const sourceOf = (byteLength, lengths) => {
    // Like a server, it holds only the bytes that exist, so a range past the end is cut short.
    const slice = vi.fn(async (start, end) => new ArrayBuffer(lengths.shift() ?? (Math.min(end ?? byteLength, byteLength) - start)))
    return { byteLength, slice, extra: 'kept' }
  }
  const resolverOf = source => verifiedResolver({ reader: vi.fn(async () => source) })

  it('returns a read that has every byte, with one request', async () => {
    const source = sourceOf(1000, [])
    const file = await resolverOf(source).reader('https://x/a.parquet', 1000)

    expect((await file.slice(100, 400)).byteLength).toBe(300)
    expect(source.slice).toHaveBeenCalledTimes(1)
  })

  it('passes the path and the length hint to the resolver it wraps', async () => {
    const reader = vi.fn(async () => sourceOf(10, []))
    await verifiedResolver({ reader }).reader('https://x/a.parquet', 10)

    expect(reader).toHaveBeenCalledWith('https://x/a.parquet', 10)
  })

  it('keeps the other properties of the file it wraps', async () => {
    const file = await resolverOf(sourceOf(10, [])).reader('https://x/a.parquet')

    expect(file.byteLength).toBe(10)
    expect(file.extra).toBe('kept')
  })

  it('reads a range again when the body comes back short', async () => {
    const source = sourceOf(10000, [2880])
    const file = await resolverOf(source).reader('https://x/a.parquet')

    expect((await file.slice(100, 4100)).byteLength).toBe(4000)
    expect(source.slice).toHaveBeenCalledTimes(2)
  })

  it('fails with the file and the range after the retries are used up', async () => {
    const source = sourceOf(10000, [10, 20, 30])
    const file = await resolverOf(source).reader('https://x/a.parquet')

    await expect(file.slice(100, 4100)).rejects.toThrow(
      'Short read from https://x/a.parquet: asked for 4000 bytes at 100 and got 30'
    )
    // The first try and two retries.
    expect(source.slice).toHaveBeenCalledTimes(3)
  })

  it('counts a read to the end of the file, and one that runs past it, by the bytes that exist', async () => {
    const source = sourceOf(1000, [])
    const file = await resolverOf(source).reader('https://x/a.parquet')

    expect((await file.slice(900)).byteLength).toBe(100)
    expect((await file.slice(900, 5000)).byteLength).toBe(100)
    expect(source.slice).toHaveBeenCalledTimes(2)
  })

  it('is used for every file the loaders read', async () => {
    rowsAre([])
    await loadIcebergRows(URL)

    // icebird got a resolver whose reader is the verified one.
    const { resolver } = icebird.icebergDataSource.mock.calls[0][0]
    const file = await (async () => {
      icebird.urlResolver.mock.results[0].value.reader.mockResolvedValue(sourceOf(10, [3, 4, 10]))
      return resolver.reader('https://x/data.parquet')
    })()
    expect((await file.slice(0, 10)).byteLength).toBe(10)
  })
})

describe('rebasedResolver', () => {
  const resolver = (target, reader = vi.fn(async path => ({ path }))) => ({
    reader, wrapped: rebasedResolver({ reader }, target),
  })

  it('reads a path under the table location from the URL the table was loaded from', async () => {
    const { reader, wrapped } = resolver({ from: 's3://bucket/ns/tbl', to: 'https://host.example/bucket/ns/tbl' })
    await wrapped.reader('s3://bucket/ns/tbl/data/part-0.parquet', 123)

    expect(reader).toHaveBeenCalledWith('https://host.example/bucket/ns/tbl/data/part-0.parquet', 123)
  })

  it('leaves a path outside the location alone', async () => {
    const { reader, wrapped } = resolver({ from: 's3://bucket/ns/tbl', to: 'https://host.example/bucket/ns/tbl' })
    await wrapped.reader('https://elsewhere.example/other.parquet')
    await wrapped.reader('s3://bucket/ns/other/data.parquet')

    expect(reader.mock.calls.map(c => c[0])).toEqual([
      'https://elsewhere.example/other.parquet',
      's3://bucket/ns/other/data.parquet',
    ])
  })

  it('leaves every path alone while the location is unknown', async () => {
    const { reader, wrapped } = resolver({ from: null, to: 'https://host.example/tbl' })
    await wrapped.reader('s3://bucket/ns/tbl/metadata/v1.metadata.json')

    expect(reader).toHaveBeenCalledWith('s3://bucket/ns/tbl/metadata/v1.metadata.json', undefined)
  })

  it('maps once the location is filled in, by the same wrapper', async () => {
    const target = { from: null, to: 'https://host.example/tbl' }
    const { reader, wrapped } = resolver(target)
    await wrapped.reader('s3://b/tbl/a.avro')
    target.from = 's3://b/tbl'
    await wrapped.reader('s3://b/tbl/a.avro')

    expect(reader.mock.calls.map(c => c[0])).toEqual(['s3://b/tbl/a.avro', 'https://host.example/tbl/a.avro'])
  })

  it('does not match a sibling folder that only starts with the same letters', async () => {
    // Known limit: the match is on the prefix text, as the location is a folder.
    const { reader, wrapped } = resolver({ from: 's3://b/tbl', to: 'https://host.example/tbl' })
    await wrapped.reader('s3://b/tbl/data.parquet')

    expect(reader.mock.calls[0][0]).toBe('https://host.example/tbl/data.parquet')
  })
})

describe('a table whose files are named with s3:// paths', () => {
  const s3Table = location => metadata([
    { id: 1, name: 'id', type: 'long' },
    { id: 2, name: 'object_geometry', type: 'geometry' },
  ], { location })

  // The resolver icebird is handed, and the reader underneath it.
  const resolverAndReader = async () => {
    const { resolver } = icebird.icebergDataSource.mock.calls[0][0]
    const reader = icebird.urlResolver.mock.results.at(-1).value.reader
    reader.mockResolvedValue({ byteLength: 10, slice: async () => new ArrayBuffer(10) })
    return { resolver, reader }
  }

  it('reads them from the URL the metadata was loaded from', async () => {
    icebird.icebergMetadata.mockResolvedValue(s3Table('s3://bucket/wh/tbl'))
    rowsAre([])
    await loadIcebergRows('https://host.example/bucket/wh/tbl/metadata/v1.metadata.json')
    const { resolver, reader } = await resolverAndReader()

    await resolver.reader('s3://bucket/wh/tbl/metadata/snap-1.avro')
    await resolver.reader('s3://bucket/wh/tbl/data/part-0.parquet')

    expect(reader.mock.calls.map(c => c[0])).toEqual([
      'https://host.example/bucket/wh/tbl/metadata/snap-1.avro',
      'https://host.example/bucket/wh/tbl/data/part-0.parquet',
    ])
  })

  it('does the same for the map loader', async () => {
    icebird.icebergMetadata.mockResolvedValue(s3Table('s3a://bucket/wh/tbl/'))
    rowsAre([])
    await loadGeoJsonFromIceberg('https://host.example/bucket/wh/tbl/metadata/v1.metadata.json')
    const { resolver, reader } = await resolverAndReader()

    await resolver.reader('s3a://bucket/wh/tbl/data/part-0.parquet')

    expect(reader.mock.calls[0][0]).toBe('https://host.example/bucket/wh/tbl/data/part-0.parquet')
  })

  it('maps nothing when the location is already an http URL', async () => {
    icebird.icebergMetadata.mockResolvedValue(s3Table('https://host.example/bucket/wh/tbl'))
    rowsAre([])
    await loadIcebergRows('https://host.example/bucket/wh/tbl/metadata/v1.metadata.json')
    const { resolver, reader } = await resolverAndReader()

    await resolver.reader('https://host.example/bucket/wh/tbl/data/part-0.parquet')

    expect(reader.mock.calls[0][0]).toBe('https://host.example/bucket/wh/tbl/data/part-0.parquet')
  })

  it('reads the metadata file itself before the location is known', async () => {
    icebird.icebergMetadata.mockResolvedValue(s3Table('s3://bucket/wh/tbl'))
    rowsAre([])
    await loadIcebergSnapshots('https://host.example/bucket/wh/tbl/metadata/v1.metadata.json')

    expect(icebird.icebergMetadata).toHaveBeenCalledWith(expect.objectContaining({
      tableUrl: 'https://host.example/bucket/wh/tbl',
      metadataFileName: 'v1.metadata.json',
    }))
  })
})
