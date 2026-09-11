import { describe, it, expect } from 'vitest'
import { renderOrderKeys, orderedRenderLayers } from '../../src/utils/renderOrder.js'

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

  it('caps the resolved layers, not only the keys, so a stack fits the picker', () => {
    const many = Array.from({ length: 20 }, (_, i) => `a${i}`)
    const renders = { all: { assets: many } }
    const stac = { properties: { 'portolan:render_order': ['all'] } }
    const layers = orderedRenderLayers(stac, renders, many.map(k => asset(k)))
    expect(layers).toHaveLength(16)
    expect(layers.map(l => l.asset.getKey())).toEqual(many.slice(0, 16))
  })

  it('tolerates missing renders and a missing asset list', () => {
    const stac = { 'portolan:render_order': ['instance'] }
    expect(orderedRenderLayers(stac, undefined, assets)).toEqual([])
    expect(orderedRenderLayers(stac, RENDERS, undefined)).toEqual([])
  })
})
