import { describe, it, expect } from 'vitest'
import { Asset } from 'stac-js'
import HrefActions from '../../src/components/HrefActions.vue'

// The component's buttons are decided entirely by its computed properties, and
// mounting it needs the store and the i18n plugin. The computeds are plain
// functions, so each one is called against a context that resolves the others
// lazily — the same shape Vue gives them — with the store-backed ones stubbed.
const STORE_STUBS = {
  downloads: {},
  requestHeaders: {},
  buildTileUrlTemplate: null,
  useTileLayerAsFallback: false,
  tileUrlTemplate: null,
  getRequestUrl: url => url,
  isExternalUrl: () => true,
  isLoggedIn: false,
  auth: [],
  $t: key => key,
  $te: () => false,
}

const vm = (data, overrides = {}) => {
  const ctx = {}
  for (const [name, fn] of Object.entries(HrefActions.computed)) {
    Object.defineProperty(ctx, name, { get: () => fn.call(ctx), configurable: true })
  }
  for (const [name, value] of Object.entries({ data, isAsset: true, ...STORE_STUBS, ...overrides })) {
    Object.defineProperty(ctx, name, { value, configurable: true, writable: true })
  }
  return ctx
}

// A GeoParquet asset: the map can render it and the browser cannot open it, so
// it gets both buttons and a `download` attribute.
const parquetAsset = (extra = {}) => new Asset({
  href: 'https://example.com/data.parquet',
  type: 'application/vnd.apache.parquet',
  roles: ['data'],
  ...extra,
})

const S3_HREF = 's3://example-bucket/data.parquet'
const ALTERNATE = 'https://example.com/data.parquet'

describe('HrefActions', () => {
  it('shows and downloads an https asset at its own href', () => {
    const ctx = vm(parquetAsset())
    expect(ctx.canShow).toBe(true)
    expect(ctx.canDownload).toBe(true)
    expect(ctx.downloadProps.href).toBe(ALTERNATE)
    expect(ctx.href).toBe(ALTERNATE)
  })

  // Portolan v0.3 (PORTO-CORE-023): an s3:// href with an https alternate is a
  // readable asset. The buttons act on the alternate, while the displayed and
  // copied href stays the asset's own.
  it('shows and downloads an s3 asset through its https alternate', () => {
    const ctx = vm(parquetAsset({
      href: S3_HREF,
      alternate: { https: { href: ALTERNATE } },
    }))
    expect(ctx.canShow).toBe(true)
    expect(ctx.canDownload).toBe(true)
    expect(ctx.downloadProps.href).toBe(ALTERNATE)
    expect(ctx.fetchableHref).toBe(ALTERNATE)
    // What the user sees and copies is unchanged.
    expect(ctx.href).toBe(S3_HREF)
  })

  it('offers neither button for an s3 asset with no http(s) alternate', () => {
    const ctx = vm(parquetAsset({ href: S3_HREF }))
    expect(ctx.canShow).toBe(false)
    expect(ctx.canDownload).toBe(false)
    expect(ctx.downloadProps).toEqual({})
    expect(ctx.protocol).toBe('s3')
  })

  it('names the alternate as the asset shown on the map', () => {
    const ctx = vm(parquetAsset({
      href: S3_HREF,
      alternate: { https: { href: ALTERNATE } },
    }))
    const emitted = []
    ctx.$emit = (event, payload) => emitted.push([event, payload])
    HrefActions.methods.show.call(ctx)
    expect(emitted).toHaveLength(1)
    expect(emitted[0][0]).toBe('show')
    expect(emitted[0][1].href).toBe(ALTERNATE)
  })
})
