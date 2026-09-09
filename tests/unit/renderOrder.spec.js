import { describe, it, expect } from 'vitest'
import { renderOrderKeys, orderedRenderLayers } from '../../src/utils/renderOrder.js'
import ShowAssetLinkMixin from '../../src/components/ShowAssetLinkMixin.js'

const asset = (key, opts = {}) => ({
  type: opts.type || 'image/tiff; application=geotiff; profile=cloud-optimized',
  roles: opts.roles || ['data'],
  getKey: () => key,
})

const RENDERS = {
  planting_rgb: { title: 'Planting season', assets: ['planting_image'], bidx: [1, 2, 3] },
  instance: { title: 'Field instances', assets: ['instance_mask'], colormap_name: 'viridis' },
}

describe('renderOrderKeys', () => {
  it('reads the field from properties', () => {
    expect(renderOrderKeys({ properties: { 'portolan:render_order': ['a'] } })).toEqual(['a'])
  })

  it('reads the field from the document root', () => {
    expect(renderOrderKeys({ 'portolan:render_order': ['a'] })).toEqual(['a'])
  })

  it('prefers properties over the root, as portolan:styles does', () => {
    const stac = {
      'portolan:render_order': ['root'],
      properties: { 'portolan:render_order': ['props'] },
    }
    expect(renderOrderKeys(stac)).toEqual(['props'])
  })

  it('returns null when the field is absent or not a list', () => {
    expect(renderOrderKeys({})).toBeNull()
    expect(renderOrderKeys(null)).toBeNull()
    expect(renderOrderKeys({ properties: { 'portolan:render_order': 'a' } })).toBeNull()
  })

  it('caps a hostile list rather than walking all of it', () => {
    const keys = Array.from({ length: 500 }, (_, i) => `k${i}`)
    expect(renderOrderKeys({ 'portolan:render_order': keys })).toHaveLength(16)
  })
})

describe('orderedRenderLayers', () => {
  const assets = [asset('instance_mask'), asset('planting_image'), asset('extra')]
  const stacked = (stac, renders = RENDERS, list = assets) =>
    orderedRenderLayers(stac, renders, list).map(l => [l.id, l.asset.getKey()])

  it('resolves the keys to render/asset pairs in declared order, not asset order', () => {
    const stac = { properties: { 'portolan:render_order': ['planting_rgb', 'instance'] } }
    expect(stacked(stac)).toEqual([
      ['planting_rgb', 'planting_image'],
      ['instance', 'instance_mask'],
    ])
  })

  it('skips a key naming no render, and a non-string key', () => {
    const stac = { properties: { 'portolan:render_order': ['nope', 7, 'instance'] } }
    expect(stacked(stac)).toEqual([['instance', 'instance_mask']])
  })

  it('skips a render whose assets are not among the ones offered', () => {
    const stac = { properties: { 'portolan:render_order': ['planting_rgb'] } }
    expect(stacked(stac, RENDERS, [asset('instance_mask')])).toEqual([])
  })

  it('lists an asset once even when two renders name it', () => {
    const renders = {
      a: { assets: ['m'] },
      b: { assets: ['m'] },
    }
    const stac = { properties: { 'portolan:render_order': ['a', 'b'] } }
    expect(stacked(stac, renders, [asset('m')])).toEqual([['a', 'm']])
  })

  it('gives a render listing several assets one entry each, in its own order', () => {
    const renders = { pair: { assets: ['b', 'a'] } }
    const stac = { properties: { 'portolan:render_order': ['pair'] } }
    expect(stacked(stac, renders, [asset('a'), asset('b')]))
      .toEqual([['pair', 'b'], ['pair', 'a']])
  })

  it('is empty for a document that declares nothing', () => {
    expect(orderedRenderLayers({}, RENDERS, assets)).toEqual([])
    expect(orderedRenderLayers({ properties: { 'portolan:render_order': [] } }, RENDERS, assets))
      .toEqual([])
  })

  it('tolerates missing renders and a missing asset list', () => {
    const stac = { 'portolan:render_order': ['instance'] }
    expect(orderedRenderLayers(stac, undefined, assets)).toEqual([])
    expect(orderedRenderLayers(stac, RENDERS, undefined)).toEqual([])
  })
})

// The auto-selection is the path an item view actually takes: it decides what
// setAssets() is called with, so the convention has to be honoured here too.
describe('_autoSelectCogAsset', () => {
  const run = (stac, assets) => {
    const ctx = { data: stac, selectedAssets: [], hasAutoSelected: false }
    ShowAssetLinkMixin.methods._autoSelectCogAsset.call(ctx, assets)
    return ctx
  }
  const assets = [asset('instance_mask'), asset('planting_image', { roles: ['data', 'visual'] })]
  const keys = ctx => ctx.selectedAssets.map(a => a.getKey())

  it('opens every declared layer, in declared order', () => {
    const stac = {
      properties: { renders: RENDERS, 'portolan:render_order': ['planting_rgb', 'instance'] },
    }
    expect(keys(run(stac, assets))).toEqual(['planting_image', 'instance_mask'])
  })

  it('falls back to the visual-role asset when nothing is declared', () => {
    expect(keys(run({ properties: { renders: RENDERS } }, assets))).toEqual(['planting_image'])
  })

  it('falls back to the first COG when there is no visual asset', () => {
    const plain = [asset('a'), asset('b')]
    expect(keys(run({}, plain))).toEqual(['a'])
  })

  it('falls back when the declared keys resolve to nothing', () => {
    const stac = { properties: { renders: RENDERS, 'portolan:render_order': ['gone'] } }
    expect(keys(run(stac, assets))).toEqual(['planting_image'])
  })

  it('selects nothing at all when the item has no COG assets', () => {
    const ctx = run({}, [asset('data', { type: 'application/geo+json' })])
    expect(ctx.selectedAssets).toEqual([])
    expect(ctx.hasAutoSelected).toBe(false)
  })
})
