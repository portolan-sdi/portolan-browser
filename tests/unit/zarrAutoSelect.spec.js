import { describe, it, expect } from 'vitest'
import ShowAssetLinkMixin from '../../src/components/ShowAssetLinkMixin.js'

// A collection whose only raster is a Zarr store auto-selects it, which tells
// the map "show only this asset". That has to name a store the browser can
// actually read: selecting one it cannot takes the item's other layers off the
// map with it, because nothing else is selected any more.
const zarrAsset = (key, href) => ({
  type: 'application/vnd.zarr; version=3',
  roles: ['data'],
  getKey: () => key,
  getAbsoluteUrl: () => href,
  href,
})

describe('_autoSelectCogAsset with Zarr assets', () => {
  const run = (assets) => {
    const ctx = { data: {}, selectedAssets: [], hasAutoSelected: false }
    ShowAssetLinkMixin.methods._autoSelectCogAsset.call(ctx, assets)
    return ctx
  }

  it('selects an https store', () => {
    const asset = zarrAsset('zarr', 'https://example.com/fire.zarr')
    const ctx = run([asset])
    expect(ctx.selectedAssets).toEqual([asset])
    expect(ctx.hasAutoSelected).toBe(true)
  })

  it('selects nothing when the only store is an s3 one', () => {
    // Many catalogs list the `s3://` store beside its https twin. The map
    // leaves that one out (see StacMapLayer._collectZarrAssets), so selecting
    // it here would suppress the children, the vector tiles and the GeoParquet
    // that used to draw.
    const ctx = run([zarrAsset('zarr-s3', 's3://example-bucket/fire.zarr')])
    expect(ctx.selectedAssets).toEqual([])
    expect(ctx.hasAutoSelected).toBe(false)
  })

  it('selects the https twin and not the s3 one', () => {
    const https = zarrAsset('zarr', 'https://example.com/fire.zarr')
    const ctx = run([zarrAsset('zarr-s3', 's3://example-bucket/fire.zarr'), https])
    expect(ctx.selectedAssets).toEqual([https])
  })
})
