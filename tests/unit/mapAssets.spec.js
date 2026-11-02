import { describe, it, expect } from 'vitest'
import { isMapRenderableAsset } from '../../src/utils/mapAssets.js'

describe('isMapRenderableAsset', () => {
  it('reports a single-file parquet asset as renderable', () => {
    expect(isMapRenderableAsset({ type: 'application/vnd.apache.parquet', href: './items.parquet' })).toBe(true)
  })

  it('reports a glob parquet asset as not renderable: the layer downloads one file', () => {
    const type = 'application/vnd.apache.parquet'
    expect(isMapRenderableAsset({ type, href: './zone=*/utm*.parquet' })).toBe(false)
    // getAbsoluteUrl() percent-encodes the asterisk
    expect(isMapRenderableAsset({
      type,
      href: './zone=*/utm*.parquet',
      getAbsoluteUrl: () => 'https://example.com/col/zone=%2A/utm%2A.parquet',
    })).toBe(false)
  })

  it('reports a non-parquet asset without tiles as not renderable', () => {
    expect(isMapRenderableAsset({ type: 'image/png', href: 'thumb.png' })).toBe(false)
  })
})
