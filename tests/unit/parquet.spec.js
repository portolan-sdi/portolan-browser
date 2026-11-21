import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest'
import {
  isLoadableParquetAsset,
  isParquetAsset,
  findParquetAssets,
  parseWkbType,
  bboxFromWkb,
  loadParquetMetadata,
  loadGeoJsonFromParquet,
} from '../../src/utils/parquet.js'

describe('parquet utilities', () => {
  describe('isParquetAsset', () => {
    it('returns true for apache parquet type', () => {
      expect(isParquetAsset({ type: 'application/vnd.apache.parquet' })).toBe(true)
    })

    it('returns true for x-parquet type', () => {
      expect(isParquetAsset({ type: 'application/x-parquet' })).toBe(true)
    })

    it('returns true for a parameterized media type (substring match, like sibling predicates)', () => {
      expect(isParquetAsset({ type: 'application/vnd.apache.parquet; charset=binary' })).toBe(true)
    })

    it('falls back to the href for untyped .parquet assets', () => {
      expect(isParquetAsset({ href: 'https://example.com/data.parquet' })).toBe(true)
      expect(isParquetAsset({ getAbsoluteUrl: () => 'https://example.com/data.parquet' })).toBe(true)
      expect(isParquetAsset({ href: 'https://example.com/data.gpkg' })).toBe(false)
    })

    it('returns false for other types', () => {
      expect(isParquetAsset({ type: 'application/json' })).toBe(false)
      expect(isParquetAsset({ type: 'image/tiff' })).toBe(false)
    })

    it('returns false for missing type and href', () => {
      expect(isParquetAsset({})).toBe(false)
    })

    it('returns true for a glob href: the preview resolves it to one partition', () => {
      const type = 'application/vnd.apache.parquet'
      expect(isParquetAsset({ type, href: './country=*/geom_type=*/type=*/*.parquet' })).toBe(true)
    })
  })

  describe('isLoadableParquetAsset', () => {
    it('returns true for a single-file href', () => {
      expect(isLoadableParquetAsset({ type: 'application/vnd.apache.parquet', href: './items.parquet' })).toBe(true)
    })

    it('returns false for a glob href, which names many files rather than one', () => {
      const type = 'application/vnd.apache.parquet'
      expect(isLoadableParquetAsset({ type, href: './country=*/geom_type=*/type=*/*.parquet' })).toBe(false)
      // getAbsoluteUrl() percent-encodes the asterisk
      expect(isLoadableParquetAsset({
        type,
        href: './country=*/*.parquet',
        getAbsoluteUrl: () => 'https://example.com/col/country=%2A/%2A.parquet',
      })).toBe(false)
      expect(isLoadableParquetAsset({ type, getAbsoluteUrl: () => 'https://example.com/col/country=%2a/%2a.parquet' })).toBe(false)
    })

    it('keeps a single-file href whose query string carries a wildcard', () => {
      const type = 'application/vnd.apache.parquet'
      expect(isLoadableParquetAsset({ type, href: 'https://example.com/data.parquet?token=ab*cd' })).toBe(true)
      expect(isLoadableParquetAsset({ type, href: 'https://example.com/data.parquet?sig=a%2Ab' })).toBe(true)
    })
  })

  describe('findParquetAssets', () => {
    it('filters parquet assets from array', () => {
      const assets = [
        { type: 'application/vnd.apache.parquet', href: 'data.parquet' },
        { type: 'application/json', href: 'metadata.json' },
        { type: 'application/x-parquet', href: 'other.parquet' },
      ]
      const result = findParquetAssets(assets)
      expect(result).toHaveLength(2)
      expect(result[0].href).toBe('data.parquet')
      expect(result[1].href).toBe('other.parquet')
    })

    it('keeps a partition glob asset for the preview to resolve', () => {
      const assets = [
        { type: 'application/vnd.apache.parquet', href: './key=*/*.parquet' },
        { type: 'application/vnd.apache.parquet', href: './items.parquet' },
      ]
      expect(findParquetAssets(assets).map(a => a.href)).toEqual(['./key=*/*.parquet', './items.parquet'])
    })

    it('returns empty array when no parquet assets', () => {
      const assets = [{ type: 'image/png', href: 'image.png' }]
      expect(findParquetAssets(assets)).toEqual([])
    })
  })

  describe('parseWkbType', () => {
    it('returns Unknown for null/undefined', () => {
      expect(parseWkbType(null)).toBe('Unknown')
      expect(parseWkbType(undefined)).toBe('Unknown')
    })

    it('returns Unknown for buffer too small', () => {
      expect(parseWkbType(new Uint8Array([1, 2, 3]))).toBe('Unknown')
    })

    it('parses Point (type 1) little-endian', () => {
      // WKB: 01 (little-endian) + 01000000 (type 1 = Point)
      const buffer = new Uint8Array([
        0x01, // little-endian
        0x01, 0x00, 0x00, 0x00, // type 1
        // coordinates would follow but not needed for type detection
      ])
      expect(parseWkbType(buffer)).toBe('Point')
    })

    it('parses Point (type 1) big-endian', () => {
      const buffer = new Uint8Array([
        0x00, // big-endian
        0x00, 0x00, 0x00, 0x01, // type 1
      ])
      expect(parseWkbType(buffer)).toBe('Point')
    })

    it('parses LineString (type 2)', () => {
      const buffer = new Uint8Array([
        0x01, // little-endian
        0x02, 0x00, 0x00, 0x00, // type 2
      ])
      expect(parseWkbType(buffer)).toBe('LineString')
    })

    it('parses Polygon (type 3)', () => {
      const buffer = new Uint8Array([
        0x01, // little-endian
        0x03, 0x00, 0x00, 0x00, // type 3
      ])
      expect(parseWkbType(buffer)).toBe('Polygon')
    })

    it('parses MultiPoint (type 4)', () => {
      const buffer = new Uint8Array([
        0x01,
        0x04, 0x00, 0x00, 0x00,
      ])
      expect(parseWkbType(buffer)).toBe('MultiPoint')
    })

    it('parses MultiLineString (type 5)', () => {
      const buffer = new Uint8Array([
        0x01,
        0x05, 0x00, 0x00, 0x00,
      ])
      expect(parseWkbType(buffer)).toBe('MultiLineString')
    })

    it('parses MultiPolygon (type 6)', () => {
      const buffer = new Uint8Array([
        0x01,
        0x06, 0x00, 0x00, 0x00,
      ])
      expect(parseWkbType(buffer)).toBe('MultiPolygon')
    })

    it('handles 3D types (1000 + base type)', () => {
      // WKB 3D Point = 1001
      const buffer = new Uint8Array([
        0x01, // little-endian
        0xe9, 0x03, 0x00, 0x00, // 1001 in little-endian
      ])
      expect(parseWkbType(buffer)).toBe('Point')
    })
  })

  describe('bboxFromWkb', () => {
    it('returns null for null/undefined', () => {
      expect(bboxFromWkb(null)).toBeNull()
      expect(bboxFromWkb(undefined)).toBeNull()
    })

    it('returns null for buffer too small', () => {
      expect(bboxFromWkb(new Uint8Array(10))).toBeNull()
    })

    it('extracts bbox from Point', () => {
      // WKB Point at (10.5, 20.5)
      const buffer = new ArrayBuffer(21)
      const view = new DataView(buffer)
      view.setUint8(0, 1) // little-endian
      view.setUint32(1, 1, true) // Point type
      view.setFloat64(5, 10.5, true) // x
      view.setFloat64(13, 20.5, true) // y

      const bbox = bboxFromWkb(new Uint8Array(buffer))
      expect(bbox).toEqual([10.5, 20.5, 10.5, 20.5])
    })

    it('extracts bbox from LineString', () => {
      // WKB LineString with 2 points: (0, 0) and (10, 20)
      const buffer = new ArrayBuffer(41)
      const view = new DataView(buffer)
      view.setUint8(0, 1) // little-endian
      view.setUint32(1, 2, true) // LineString type
      view.setUint32(5, 2, true) // 2 points
      // Point 1
      view.setFloat64(9, 0, true)
      view.setFloat64(17, 0, true)
      // Point 2
      view.setFloat64(25, 10, true)
      view.setFloat64(33, 20, true)

      const bbox = bboxFromWkb(new Uint8Array(buffer))
      expect(bbox).toEqual([0, 0, 10, 20])
    })

    it('extracts bbox from Polygon', () => {
      // Simple square polygon (0,0), (10,0), (10,10), (0,10), (0,0)
      const buffer = new ArrayBuffer(93)
      const view = new DataView(buffer)
      view.setUint8(0, 1) // little-endian
      view.setUint32(1, 3, true) // Polygon type
      view.setUint32(5, 1, true) // 1 ring
      view.setUint32(9, 5, true) // 5 points in ring

      let offset = 13
      const points = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]
      for (const [x, y] of points) {
        view.setFloat64(offset, x, true)
        view.setFloat64(offset + 8, y, true)
        offset += 16
      }

      const bbox = bboxFromWkb(new Uint8Array(buffer))
      expect(bbox).toEqual([0, 0, 10, 10])
    })
  })
})

// Exercises the real hyparquet reader over a committed fixture whose geometry
// column uses the native Parquet GEOMETRY logical type instead of a
// GeoParquet `geo` key (see tests/fixtures/make-native-geometry.py). The file
// is served through a stubbed `fetch`, so the loader runs its own byte-length
// probe and range read without a network.
describe('native GEOMETRY logical type', () => {
  const FIXTURE_URL = 'https://example.test/native-geometry.parquet'
  let fixture

  beforeAll(() => {
    // vitest runs with the repository root as the working directory.
    fixture = readFileSync(resolve(process.cwd(), 'tests/fixtures/native-geometry.parquet'))
  })

  beforeEach(() => {
    vi.stubGlobal('fetch', async (url, init = {}) => {
      if (url !== FIXTURE_URL) {
        return new Response(null, { status: 404 })
      }
      const headers = { 'Content-Length': String(fixture.byteLength) }
      if (init.method === 'HEAD') {
        return new Response(null, { status: 200, headers })
      }
      // Status 200 for a ranged GET tells hyparquet the server ignores Range,
      // so it buffers the whole (tiny) file and slices it itself.
      const body = fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength)
      return new Response(body, { status: 200, headers })
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads a fixture that carries neither a geo key nor a conventional column name', async () => {
    const { metadata, columnNames } = await loadParquetMetadata(FIXTURE_URL)
    expect(metadata.key_value_metadata?.some(kv => kv.key === 'geo')).toBeFalsy()
    expect(columnNames).toEqual(['id', 'name', 'shape'])
  })

  it('detects the geometry column from the schema and reports no declared CRS', async () => {
    const result = await loadParquetMetadata(FIXTURE_URL)
    expect(result.geometryColumn).toBe('shape')
    expect(result.crs).toBeNull()
    expect(result.crsDefinition).toBeNull()
  })

  it('loads the geometries as GeoJSON features', async () => {
    const result = await loadGeoJsonFromParquet(FIXTURE_URL, { fields: ['name'] })
    expect(result.exceeded).toBe(false)
    expect(result.reprojectedFrom).toBeNull()
    const { features } = result.featureCollection
    expect(features).toHaveLength(3)
    expect(features.map(f => f.geometry.type)).toEqual(['Point', 'Point', 'Polygon'])
    expect(features[0].geometry.coordinates).toEqual([10, 20])
    expect(features.map(f => f.properties.name)).toEqual(['one', 'two', 'three'])
  })
})
