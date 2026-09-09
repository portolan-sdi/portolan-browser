import { describe, it, expect } from 'vitest'
import {
  makeRenderTileLoader, resolveRenders, renderFromClassification,
  classificationClasses, discreteLegend,
} from '../../src/utils/renders.js'

// Build a fake deck.gl-geotiff COGLayer `image` whose fetchTile returns one
// interleaved single-band tile. Mirrors the { array: { data, width, height,
// layout } } shape makeRenderTileLoader consumes.
function fakeImage(data, width, height, layout = 'pixel-interleaved') {
  return {
    fetchTile: async () => ({ array: { data, width, height, layout } }),
  }
}

const call = (render, image) =>
  makeRenderTileLoader(render).getTileData(image, { x: 0, y: 0, signal: undefined })

describe('makeRenderTileLoader', () => {
  it('maps data values to opaque colors and nodata to transparent', async () => {
    const render = { colormap_name: 'viridis', rescale: [[0, 1]], bidx: [1], nodata: 0 }
    // 2x2, single band interleaved: [nodata, mid, max, nodata]
    const data = new Float32Array([0, 0.5, 1, 0])
    const res = await call(render, fakeImage(data, 2, 2))
    const px = res.colorImage.data
    expect(px[3]).toBe(0)    // pixel 0: nodata -> transparent
    expect(px[7]).toBe(255)  // pixel 1: data -> opaque
    expect(px[11]).toBe(255) // pixel 2: data -> opaque
    expect(px[15]).toBe(0)   // pixel 3: nodata -> transparent
  })

  it('bails (returns null) on a pathologically large tile instead of allocating', async () => {
    const render = { colormap_name: 'viridis', rescale: [[0, 1]], bidx: [1] }
    // 3000x3000 = 9M px exceeds the main-thread colormap budget.
    const res = await call(render, fakeImage(new Float32Array(1), 3000, 3000))
    expect(res).toBeNull()
  })

  it('returns null for a zero-dimension tile without throwing', async () => {
    const render = { colormap_name: 'viridis', rescale: [[0, 1]], bidx: [1] }
    const res = await call(render, fakeImage(new Float32Array(0), 0, 0))
    expect(res).toBeNull()
  })

  it('falls back to a real colormap when custom stops are malformed', async () => {
    // Numeric t but empty color arrays — the buggy version produces black (0,0,0).
    const render = { colormap: [[0, []], [1, []]], rescale: [[0, 1]], bidx: [1] }
    const res = await call(render, fakeImage(new Float32Array([0.5]), 1, 1))
    const px = res.colorImage.data
    expect(px[3]).toBe(255)                  // opaque
    expect(px[0] + px[1] + px[2]).toBeGreaterThan(0) // a real color, not black
  })

  it('handles a pathologically long nodata array without error', async () => {
    const nodata = Array.from({ length: 100000 }, (_, i) => i + 1000)
    const render = { colormap_name: 'viridis', rescale: [[0, 1]], bidx: [1], nodata }
    const res = await call(render, fakeImage(new Float32Array([0.5]), 1, 1))
    expect(res.colorImage.data[3]).toBe(255) // value 0.5 is not nodata -> opaque
  })
})

describe('resolveRenders', () => {
  it('reads top-level renders from an item', () => {
    expect(resolveRenders({ renders: { a: { title: 'A' } } })).toEqual({ a: { title: 'A' } })
  })
  it('returns {} when absent', () => {
    expect(resolveRenders({})).toEqual({})
    expect(resolveRenders(null)).toEqual({})
  })
})

// The colour of pixel `i` in a returned tile, as [r, g, b, a].
const pixel = (res, i) => Array.from(res.colorImage.data.slice(i * 4, i * 4 + 4))

describe('discrete colormaps', () => {
  // The form the render extension's own examples use: pixel value -> RGBA.
  const threeClass = {
    title: '3-class labels',
    rescale: [[0, 2]],
    nodata: [0],
    colormap: { 1: [0, 158, 115, 255], 2: [213, 94, 0, 255] },
  }

  it('colours by pixel value, not by the rescaled position', async () => {
    // 1x3 mask: background, field, boundary.
    const res = await call(threeClass, fakeImage(new Uint8Array([0, 1, 2]), 3, 1))
    expect(pixel(res, 0)).toEqual([0, 0, 0, 0])      // nodata -> transparent
    expect(pixel(res, 1)).toEqual([0, 158, 115, 255])
    expect(pixel(res, 2)).toEqual([213, 94, 0, 255])
  })

  it('draws a value the colormap does not cover as transparent', async () => {
    const res = await call(threeClass, fakeImage(new Uint8Array([7]), 1, 1))
    expect(pixel(res, 0)).toEqual([0, 0, 0, 0])
  })

  it('accepts a three-channel entry and makes it opaque', async () => {
    const render = { colormap: { 5: [10, 20, 30] } }
    const res = await call(render, fakeImage(new Uint8Array([5]), 1, 1))
    expect(pixel(res, 0)).toEqual([10, 20, 30, 255])
  })

  it('renders an entry with alpha 0 transparent', async () => {
    const render = { colormap: { 1: [255, 0, 0, 0], 2: [0, 0, 255, 255] } }
    const res = await call(render, fakeImage(new Uint8Array([1, 2]), 2, 1))
    expect(pixel(res, 0)[3]).toBe(0)
    expect(pixel(res, 1)).toEqual([0, 0, 255, 255])
  })

  it('handles values beyond the dense-table range through the map path', async () => {
    const render = { colormap: { 100000: [1, 2, 3, 255] } }
    const res = await call(render, fakeImage(new Uint32Array([100000, 5]), 2, 1))
    expect(pixel(res, 0)).toEqual([1, 2, 3, 255])
    expect(pixel(res, 1)[3]).toBe(0)
  })

  it('lets colormap_name win over a discrete colormap, as it always has', async () => {
    const render = { colormap_name: 'viridis', colormap: { 1: [1, 2, 3, 255] }, rescale: [[0, 1]] }
    const res = await call(render, fakeImage(new Float32Array([1]), 1, 1))
    expect(pixel(res, 0)).not.toEqual([1, 2, 3, 255])
    expect(pixel(res, 0)[3]).toBe(255)
  })

  it('falls back to viridis when the entries are garbage', async () => {
    for (const colormap of [
      { 1: [0, 158] },                       // too few channels
      { 1: ['red', 'green', 'blue'] },       // non-numeric channels
      { notanumber: [1, 2, 3] },             // key is not a pixel value
      { 1: [0, 158, 115, 255, 9] },          // too many channels
      { 1: [0.5, 0.5, 0.5] },                // 0..1 floats, not 8-bit channels
      { 1: [300, 0, 0] },                    // channel out of range
      { '0x10': [1, 2, 3] },                 // not a decimal pixel value
      { ' 1 ': [1, 2, 3] },                  // padded key
      { '1e3': [1, 2, 3] },                  // exponent key
      { '': [1, 2, 3] },                     // empty key
    ]) {
      const res = await call({ colormap, rescale: [[0, 1]] }, fakeImage(new Float32Array([1]), 1, 1))
      expect(pixel(res, 0)).toEqual([253, 231, 37, 255])  // viridis at t=1
    }
  })

  it('falls back to a ramp on a fractional key instead of throwing', async () => {
    // `new Array(1.5)` throws RangeError, which would abort every COG layer on
    // the item, so the key form has to be rejected before the dense table.
    const res = await call({ colormap: { '0.5': [1, 2, 3] }, rescale: [[0, 1]] },
      fakeImage(new Float32Array([0.5]), 1, 1))
    expect(pixel(res, 0)).toEqual([33, 145, 140, 255])  // viridis at t=0.5
  })

  it('uses the sparse path for a value past the dense table bound', async () => {
    const res = await call({ colormap: { 100000000: [1, 2, 3] }, rescale: [[0, 1]] },
      fakeImage(new Float64Array([100000000]), 1, 1))
    expect(pixel(res, 0)).toEqual([1, 2, 3, 255])
  })

  it('drops a nodata value even when the colormap names it', async () => {
    const render = { colormap: { 1: [255, 0, 0, 255] }, nodata: [1] }
    const res = await call(render, fakeImage(new Float32Array([1]), 1, 1))
    expect(pixel(res, 0)).toEqual([0, 0, 0, 0])
  })

  it('draws NaN transparent on the discrete path', async () => {
    const render = { colormap: { 1: [255, 0, 0, 255] } }
    const res = await call(render, fakeImage(new Float32Array([NaN]), 1, 1))
    expect(pixel(res, 0)).toEqual([0, 0, 0, 0])
  })

  it('does not treat an Object.prototype key as a built-in colormap', async () => {
    // `COLORMAPS.toString` is a function, which used to reach buildLut and throw
    // out of layer construction, dropping every COG on the item.
    for (const name of ['toString', 'constructor', 'valueOf', 'hasOwnProperty']) {
      const render = { colormap_name: name, colormap: { 1: [1, 2, 3] }, rescale: [[0, 1]] }
      const res = await call(render, fakeImage(new Float32Array([1]), 1, 1))
      expect(pixel(res, 0)).toEqual([1, 2, 3, 255])
    }
  })

  it('falls back to a ramp when the colormap has too many entries', async () => {
    const colormap = {}
    for (let i = 0; i < 2000; i++) {colormap[i] = [1, 2, 3, 255]}
    const res = await call({ colormap, rescale: [[0, 1]] }, fakeImage(new Float32Array([1]), 1, 1))
    expect(pixel(res, 0)).not.toEqual([1, 2, 3, 255])
  })

  it('keeps the linear stops form working', async () => {
    const render = { colormap: [[0, [0, 0, 0]], [1, [255, 255, 255]]], rescale: [[0, 1]] }
    const res = await call(render, fakeImage(new Float32Array([1]), 1, 1))
    expect(pixel(res, 0)).toEqual([255, 255, 255, 255])
  })
})

describe('interval colormaps', () => {
  // titiler's other form: [[[min, max], [r, g, b(, a)]], ...]
  const intervals = {
    colormap: [
      [[0, 10], [255, 0, 0]],
      [[10, 20], [0, 255, 0, 128]],
    ],
  }

  it('matches the first interval where min <= v < max', async () => {
    const res = await call(intervals, fakeImage(new Float32Array([0, 9.9, 10]), 3, 1))
    expect(pixel(res, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(res, 1)).toEqual([255, 0, 0, 255])
    expect(pixel(res, 2)).toEqual([0, 255, 0, 128])
  })

  it('includes the upper bound of the last interval', async () => {
    const res = await call(intervals, fakeImage(new Float32Array([20]), 1, 1))
    expect(pixel(res, 0)).toEqual([0, 255, 0, 128])
  })

  it('draws a value outside every interval as transparent', async () => {
    const res = await call(intervals, fakeImage(new Float32Array([-1, 21]), 2, 1))
    expect(pixel(res, 0)[3]).toBe(0)
    expect(pixel(res, 1)[3]).toBe(0)
  })

  it('reads the upper bound off the highest interval, not the last written', async () => {
    // A legend is often written high to low. Trusting declaration order made the
    // top value of the raster transparent.
    const descending = {
      colormap: [
        [[20, 30], [0, 0, 255]],
        [[10, 20], [0, 255, 0]],
        [[0, 10], [255, 0, 0]],
      ],
    }
    const res = await call(descending, fakeImage(new Float32Array([5, 15, 25, 30]), 4, 1))
    expect(pixel(res, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(res, 1)).toEqual([0, 255, 0, 255])
    expect(pixel(res, 2)).toEqual([0, 0, 255, 255])
    expect(pixel(res, 3)).toEqual([0, 0, 255, 255])
  })

  it('falls back to a ramp on a malformed interval list', async () => {
    for (const colormap of [
      [[[0], [1, 2, 3]]],                          // range is not a pair
      [[[20, 10], [1, 2, 3]]],                     // reversed range matches nothing
      [[[0, 0], [1, 2, 3]]],                       // empty range
      [[[0, 10], [1, 2, 3]], [[5, 15], [4, 5, 6]]],  // overlapping intervals
    ]) {
      const res = await call({ colormap, rescale: [[0, 1]] }, fakeImage(new Float32Array([1]), 1, 1))
      expect(pixel(res, 0)).toEqual([253, 231, 37, 255])  // viridis at t=1
    }
  })

  it('falls back to a ramp when the interval list has too many entries', async () => {
    const colormap = Array.from({ length: 2000 }, (_, i) => [[i, i + 1], [1, 2, 3]])
    const res = await call({ colormap, rescale: [[0, 1]] }, fakeImage(new Float32Array([1]), 1, 1))
    expect(pixel(res, 0)).toEqual([253, 231, 37, 255])
  })

  it('colours a full-size tile from a large interval list without stalling', async () => {
    // A per-pixel linear scan of the cap took seconds per tile on the main
    // thread, which the MAX_TILE_PIXELS budget exists to prevent.
    const colormap = Array.from({ length: 1024 }, (_, i) => [[i, i + 1], [1, 2, 3]])
    const side = 1024
    const data = new Float64Array(side * side).map((_, i) => i % 1024)
    const started = Date.now()
    const res = await call({ colormap }, fakeImage(data, side, side))
    expect(pixel(res, 0)).toEqual([1, 2, 3, 255])
    expect(Date.now() - started).toBeLessThan(1000)
  })
})

// A COG asset carrying classification classes on its first band.
function classifiedAsset(classes, bandExtra = {}, key = 'bands') {
  return { [key]: [{ data_type: 'uint8', ...bandExtra, 'classification:classes': classes }] }
}

const FTW_CLASSES = [
  { value: 0, name: 'background', description: 'Not a field', color_hint: '000000' },
  { value: 1, name: 'field', description: 'Field polygon interior', color_hint: '009E73' },
  { value: 2, name: 'boundary', description: 'Field boundary line', color_hint: 'D55E00' },
]

describe('renderFromClassification', () => {
  it('builds a discrete render from the classes colour hints', () => {
    const render = renderFromClassification(classifiedAsset(FTW_CLASSES))
    expect(render.colormap).toEqual({ 1: [0, 158, 115, 255], 2: [213, 94, 0, 255] })
    expect(render.bidx).toEqual([1])
  })

  it('makes a background class transparent instead of colouring it', () => {
    const render = renderFromClassification(classifiedAsset(FTW_CLASSES))
    expect(render.colormap['0']).toBeUndefined()
    expect(render.nodata).toContain(0)
  })

  it('makes the class whose value is the band nodata transparent', () => {
    const classes = [
      { value: 3, name: 'empty', color_hint: 'FFFFFF' },
      { value: 1, name: 'field', color_hint: '009E73' },
    ]
    const render = renderFromClassification(classifiedAsset(classes, { nodata: 3 }))
    expect(render.colormap).toEqual({ 1: [0, 158, 115, 255] })
    expect(render.nodata).toContain(3)
  })

  it('reads STAC 1.0 raster:bands as well as bands', () => {
    const render = renderFromClassification(classifiedAsset(FTW_CLASSES, {}, 'raster:bands'))
    expect(render.colormap['1']).toEqual([0, 158, 115, 255])
  })

  it('reads asset-level classification:classes', () => {
    const render = renderFromClassification({ 'classification:classes': FTW_CLASSES })
    expect(render.colormap['2']).toEqual([213, 94, 0, 255])
  })

  it('returns null when no class carries a colour hint', () => {
    const classes = FTW_CLASSES.map(({ color_hint, ...rest }) => rest)
    expect(renderFromClassification(classifiedAsset(classes))).toBeNull()
  })

  it('returns null for an asset with no classes at all', () => {
    expect(renderFromClassification({ bands: [{ data_type: 'uint16' }] })).toBeNull()
    expect(renderFromClassification({})).toBeNull()
    expect(renderFromClassification(null)).toBeNull()
  })

  it('gives up the whole asset when one colour hint is malformed', () => {
    // Colouring only the readable classes drew a mask that was mostly holes,
    // and threw away the render that could have coloured it properly.
    const classes = [
      { value: 1, name: 'field', color_hint: '#009E73' },  // hint carries a "#"
      { value: 2, name: 'boundary', color_hint: 'D55E00' },
    ]
    expect(renderFromClassification(classifiedAsset(classes))).toBeNull()
  })

  it('gives up the whole asset when a class value is not a number', () => {
    const classes = [
      { value: '1', name: 'field', color_hint: '009E73' },
      { value: 2, name: 'boundary', color_hint: 'D55E00' },
    ]
    expect(renderFromClassification(classifiedAsset(classes))).toBeNull()
  })

  it('reads a transparent class that carries no hint at all', () => {
    // "background" says what to draw without a colour, so it must not count as
    // a gap in the hints.
    const classes = [
      { value: 0, name: 'background' },
      { value: 1, name: 'field', color_hint: '009E73' },
    ]
    const render = renderFromClassification(classifiedAsset(classes))
    expect(render.colormap).toEqual({ 1: [0, 158, 115, 255] })
    expect(render.nodata).toContain(0)
  })

  it('matches a transparent class name whatever its case', () => {
    const classes = [
      { value: 0, name: 'Background', color_hint: '000000' },
      { value: 1, name: 'field', color_hint: '009E73' },
    ]
    const render = renderFromClassification(classifiedAsset(classes))
    expect(render.colormap['0']).toBeUndefined()
    expect(render.nodata).toContain(0)
  })

  it('adds the band nodata that no class declares', () => {
    const classes = [{ value: 1, name: 'field', color_hint: '009E73' }]
    const render = renderFromClassification(classifiedAsset(classes, { nodata: 255 }))
    expect(render.nodata).toEqual([255])
  })

  it('does not let an empty bands array hide raster:bands', () => {
    const asset = {
      bands: [],
      'raster:bands': [{ 'classification:classes': FTW_CLASSES }],
    }
    expect(renderFromClassification(asset).colormap['1']).toEqual([0, 158, 115, 255])
  })

  it('drives the tile loader end to end', async () => {
    const render = renderFromClassification(classifiedAsset(FTW_CLASSES))
    const res = await call(render, fakeImage(new Uint8Array([0, 1, 2]), 3, 1))
    expect(pixel(res, 0)[3]).toBe(0)
    expect(pixel(res, 1)).toEqual([0, 158, 115, 255])
    expect(pixel(res, 2)).toEqual([213, 94, 0, 255])
  })
})

describe('classificationClasses', () => {
  it('reads the classes off the first band', () => {
    expect(classificationClasses(classifiedAsset(FTW_CLASSES))).toHaveLength(3)
  })
  it('returns an empty list when there are none', () => {
    expect(classificationClasses({})).toEqual([])
    expect(classificationClasses(null)).toEqual([])
  })
})

describe('discreteLegend', () => {
  it('names the rows from the classification classes', () => {
    const asset = classifiedAsset(FTW_CLASSES)
    const legend = discreteLegend(renderFromClassification(asset), classificationClasses(asset))
    expect(legend).toEqual([
      { color: 'rgb(0, 158, 115)', label: 'field' },
      { color: 'rgb(213, 94, 0)', label: 'boundary' },
    ])
  })

  it('labels a discrete colormap with the pixel value when no class names it', () => {
    const legend = discreteLegend({ colormap: { 2: [213, 94, 0, 255], 1: [0, 158, 115, 255] } })
    expect(legend.map(r => r.label)).toEqual(['1', '2'])
  })

  it('sorts the rows by pixel value, not by key order', () => {
    // A negative key sorts after "10" as a string, so only a numeric sort gets
    // this right. Integer-like keys alone would pass whatever the code did.
    const legend = discreteLegend({
      colormap: { 10: [1, 1, 1, 255], '-1': [2, 2, 2, 255], 2: [3, 3, 3, 255] },
    })
    expect(legend.map(r => r.label)).toEqual(['-1', '2', '10'])
  })

  it('names the rows from the classes even when a render supplies the colours', () => {
    // Precedence 2: the publisher wrote the colormap, the asset still names the
    // classes. The picker should read "field", not "1".
    const render = { colormap: { 1: [255, 0, 0, 255], 2: [0, 0, 255, 255] } }
    const legend = discreteLegend(render, classificationClasses(classifiedAsset(FTW_CLASSES)))
    expect(legend.map(r => r.label)).toEqual(['field', 'boundary'])
  })

  it('leaves out a value the loader drops as nodata', () => {
    // The loader never paints a nodata value, so a swatch for one would promise
    // a colour that is not on the map.
    const legend = discreteLegend({ colormap: { 0: [0, 0, 0, 255], 1: [255, 0, 0, 255] }, nodata: [0] })
    expect(legend).toEqual([{ color: 'rgb(255, 0, 0)', label: '1' }])
  })

  it('cuts a class name that would stretch the picker', () => {
    const classes = [{ value: 1, name: 'x'.repeat(500) }]
    const legend = discreteLegend({ colormap: { 1: [1, 2, 3, 255] } }, classes)
    expect(legend[0].label).toHaveLength(64)
  })

  it('leaves out a fully transparent entry', () => {
    const legend = discreteLegend({ colormap: { 1: [1, 2, 3, 0], 2: [4, 5, 6, 255] } })
    expect(legend).toEqual([{ color: 'rgb(4, 5, 6)', label: '2' }])
  })

  it('writes a partly transparent swatch as rgba', () => {
    const legend = discreteLegend({ colormap: { 1: [1, 2, 3, 128] } })
    expect(legend[0].color).toBe('rgba(1, 2, 3, 0.50)')
  })

  it('labels interval rows with their range', () => {
    const legend = discreteLegend({ colormap: [[[0, 10], [255, 0, 0]]] })
    expect(legend).toEqual([{ color: 'rgb(255, 0, 0)', label: '0-10' }])
  })

  it('returns no rows for a continuous ramp', () => {
    expect(discreteLegend({ colormap_name: 'viridis' })).toEqual([])
    expect(discreteLegend({ colormap: [[0, [0, 0, 0]], [1, [255, 255, 255]]] })).toEqual([])
    expect(discreteLegend(null)).toEqual([])
  })

  it('caps the rows so a huge colormap cannot fill the picker', () => {
    const colormap = {}
    for (let i = 0; i < 200; i++) {colormap[i] = [1, 2, 3, 255]}
    expect(discreteLegend({ colormap }).length).toBe(32)
  })
})
