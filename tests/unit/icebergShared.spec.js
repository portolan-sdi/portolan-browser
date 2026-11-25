import { describe, it, expect } from 'vitest'
import {
  icebergMetadataUrl,
  isIcebergAsset,
  isLoadableIcebergAsset,
  splitMetadataUrl,
} from '../../src/utils/icebergShared.js'
import { isMapRenderableAsset } from '../../src/utils/mapAssets.js'

const HREF = 'https://example.com/wh/tbl/metadata/v1.metadata.json'
const asset = (props = {}) => ({ href: HREF, type: 'application/vnd.apache.iceberg+json', ...props })

describe('isIcebergAsset', () => {
  it('matches the extension media type, including parameters', () => {
    expect(isIcebergAsset(asset())).toBe(true)
    expect(isIcebergAsset(asset({ type: 'application/vnd.apache.iceberg+json; charset=utf-8' }))).toBe(true)
  })

  it('matches an untyped asset whose href is a metadata.json', () => {
    expect(isIcebergAsset({ href: HREF })).toBe(true)
    expect(isIcebergAsset({ href: 'https://example.com/00001-abc.metadata.json.gz' })).toBe(true)
  })

  it('does not match other JSON or parquet assets', () => {
    expect(isIcebergAsset({ href: 'https://example.com/collection.json', type: 'application/json' })).toBe(false)
    expect(isIcebergAsset({ href: 'https://example.com/a.parquet' })).toBe(false)
    expect(isIcebergAsset(null)).toBe(false)
  })
})

describe('isLoadableIcebergAsset', () => {
  it('accepts a static catalog and one that does not say', () => {
    expect(isLoadableIcebergAsset(asset())).toBe(true)
    expect(isLoadableIcebergAsset(asset({ 'iceberg:catalog_type': 'static' }))).toBe(true)
  })

  it('refuses a catalog type the browser cannot read', () => {
    for (const type of ['rest', 'glue', 'hive', 'sql', 'dynamodb']) {
      expect(isLoadableIcebergAsset(asset({ 'iceberg:catalog_type': type }))).toBe(false)
    }
  })

  it('reads the catalog type from the parent through getMetadata', () => {
    const fromParent = asset({ getMetadata: name => (name === 'iceberg:catalog_type' ? 'rest' : undefined) })
    expect(isLoadableIcebergAsset(fromParent)).toBe(false)
  })

  it('is part of what the map can render', () => {
    expect(isMapRenderableAsset(asset())).toBe(true)
    expect(isMapRenderableAsset(asset({ 'iceberg:catalog_type': 'rest' }))).toBe(false)
  })
})

describe('icebergMetadataUrl', () => {
  it('uses the asset href', () => {
    expect(icebergMetadataUrl(asset())).toBe(HREF)
  })

  it('falls back to an https alternate for a non-browser href', () => {
    const s3 = asset({
      href: 's3://bucket/tbl/metadata/v1.metadata.json',
      alternate: { https: { href: HREF } },
    })
    expect(icebergMetadataUrl(s3)).toBe(HREF)
  })

  it('falls back to an absolute iceberg:metadata_location', () => {
    const only = asset({ href: 's3://bucket/tbl/metadata/v1.metadata.json', 'iceberg:metadata_location': HREF })
    expect(icebergMetadataUrl(only)).toBe(HREF)
  })

  it('returns null when nothing is fetchable from a browser', () => {
    const relative = asset({ href: 's3://bucket/x.metadata.json', 'iceberg:metadata_location': './metadata/v1.metadata.json' })
    expect(icebergMetadataUrl(relative)).toBe(null)
  })
})

describe('splitMetadataUrl', () => {
  it('splits a metadata.json URL into the table root and the file name', () => {
    expect(splitMetadataUrl(HREF)).toEqual({
      tableUrl: 'https://example.com/wh/tbl',
      metadataFileName: 'v1.metadata.json',
    })
  })

  it('keeps a compressed metadata file name', () => {
    expect(splitMetadataUrl('https://x/t/metadata/00002-abc.metadata.json.gz')).toEqual({
      tableUrl: 'https://x/t',
      metadataFileName: '00002-abc.metadata.json.gz',
    })
  })

  it('returns null for a layout icebird cannot address', () => {
    expect(splitMetadataUrl('https://x/t/v1.metadata.json')).toBe(null)
    expect(splitMetadataUrl('https://x/t/metadata/v1.metadata.json?sig=1')).toBe(null)
    expect(splitMetadataUrl('https://x/t/metadata/readme.txt')).toBe(null)
  })
})
