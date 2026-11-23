import { describe, it, expect } from 'vitest'
import { isHttpUrl, httpsAlternateHref, fetchableAssetHref } from '../../src/utils/fetchableHref.js'

describe('isHttpUrl', () => {
  it('accepts an absolute https URL', () => {
    expect(isHttpUrl('https://example.com/a.tif')).toBe(true)
  })

  it('accepts an absolute http URL', () => {
    expect(isHttpUrl('http://example.com/a.tif')).toBe(true)
  })

  it('rejects an s3:// URL', () => {
    expect(isHttpUrl('s3://bucket/a.tif')).toBe(false)
  })

  it('rejects an ftp:// URL', () => {
    expect(isHttpUrl('ftp://host/a.tif')).toBe(false)
  })
})

describe('httpsAlternateHref', () => {
  it('returns the https alternate href when the primary is s3://', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        https: { href: 'https://example.com/a.tif' },
      },
    }
    expect(httpsAlternateHref(asset)).toBe('https://example.com/a.tif')
  })

  it('returns null when every alternate entry is non-http(s)', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        s3: { href: 's3://bucket/a.tif' },
        ftp: { href: 'ftp://host/a.tif' },
      },
    }
    expect(httpsAlternateHref(asset)).toBeNull()
  })

  it('returns null when there is no alternate field', () => {
    const asset = { href: 's3://bucket/a.tif' }
    expect(httpsAlternateHref(asset)).toBeNull()
  })

  it('absolutizes a relative alternate href against the asset context', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      getAbsoluteUrl: () => 'https://example.com/collection/item.json',
      alternate: {
        https: { href: './a.tif' },
      },
    }
    expect(httpsAlternateHref(asset)).toBe('https://example.com/collection/a.tif')
  })

  it('returns null (without throwing) for a relative alternate href with no resolvable base', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        https: { href: './a.tif' },
      },
    }
    expect(() => httpsAlternateHref(asset)).not.toThrow()
    expect(httpsAlternateHref(asset)).toBeNull()
  })
})

describe('fetchableAssetHref', () => {
  it('returns the absolute primary href as-is when it is already http(s)', () => {
    const asset = { getAbsoluteUrl: () => 'https://example.com/a.tif', href: './a.tif' }
    expect(fetchableAssetHref(asset)).toBe('https://example.com/a.tif')
  })

  it('falls back to the https alternate when the primary is s3://', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        https: { href: 'https://example.com/a.tif' },
      },
    }
    expect(fetchableAssetHref(asset)).toBe('https://example.com/a.tif')
  })

  it('returns null when the primary is non-http(s) and no alternate resolves', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        s3: { href: 's3://bucket/a.tif' },
        ftp: { href: 'ftp://host/a.tif' },
      },
    }
    expect(fetchableAssetHref(asset)).toBeNull()
  })

  it('returns null when the primary is non-http(s) and there is no alternate field', () => {
    expect(fetchableAssetHref({ href: 's3://bucket/a.tif' })).toBeNull()
  })

  it('returns null (without throwing) when the primary is non-http(s) and the alternate is relative with no resolvable base', () => {
    const asset = {
      href: 's3://bucket/a.tif',
      alternate: {
        https: { href: './a.tif' },
      },
    }
    expect(() => fetchableAssetHref(asset)).not.toThrow()
    expect(fetchableAssetHref(asset)).toBeNull()
  })

  it('handles a plain-object asset with no stac-js methods', () => {
    const httpsAsset = { href: 'https://example.com/a.tif' }
    expect(fetchableAssetHref(httpsAsset)).toBe('https://example.com/a.tif')

    const s3Asset = { href: 's3://bucket/a.tif' }
    expect(fetchableAssetHref(s3Asset)).toBeNull()
  })
})
