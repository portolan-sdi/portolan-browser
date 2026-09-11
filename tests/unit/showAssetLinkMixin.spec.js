import { describe, it, expect } from 'vitest'
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
