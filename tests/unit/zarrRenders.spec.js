import { describe, it, expect, vi } from 'vitest'
import {
  decimateSliceSpec, makeZarrRenderTileLoader, zarrSamples,
} from '../../src/utils/renders.js'

// A zarrita stand-in whose `get` answers with a prepared chunk.
function fakeZarr(chunk) {
  return {
    get: vi.fn().mockResolvedValue(chunk),
    slice: (start, stop, step) => ({ start, stop, step }),
  }
}

// Read the RGBA of pixel `i` out of a loader result.
function pixel(result, i) {
  const d = result.colorImage.data
  return [d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]]
}

describe('zarrSamples', () => {
  it('takes the pixel count from the trailing two axes', () => {
    const chunk = { data: new Float32Array(6), shape: [2, 3] }
    expect(zarrSamples(chunk)).toMatchObject({ w: 3, h: 2, npix: 6, planeStride: 0 })
  })

  it('reports a plane stride for a multi-band result', () => {
    const chunk = { data: new Uint8Array(3 * 4), shape: [3, 2, 2] }
    expect(zarrSamples(chunk)).toMatchObject({ w: 2, h: 2, npix: 4, planeStride: 4 })
  })

  it('reports no plane stride for a band axis of length one', () => {
    const chunk = { data: new Uint8Array(4), shape: [1, 2, 2] }
    expect(zarrSamples(chunk).planeStride).toBe(0)
  })

  it('rejects a chunk past the colormap budget', () => {
    const chunk = { data: new Float32Array(0), shape: [4096, 4096] }
    expect(zarrSamples(chunk)).toBeNull()
  })

  it('rejects a degenerate chunk', () => {
    expect(zarrSamples({ data: new Float32Array(0), shape: [0, 5] }, {})).toBeNull()
    expect(zarrSamples({ data: new Float32Array(1), shape: [5] }, {})).toBeNull()
    expect(zarrSamples(null, {})).toBeNull()
  })

  it('accepts an edge chunk, which is narrower or shorter than a full one', () => {
    const chunk = { data: new Float32Array(20), shape: [5, 4] }
    expect(zarrSamples(chunk)).toMatchObject({ w: 4, h: 5 })
  })

  // `zarr.get` honours a v2 `order: "F"` array and a v3 transpose codec, so the
  // result is not always row-major. The compositing code walks the trailing
  // axes as rows of pixels, so a column-major chunk would draw transposed.
  it('rejects a chunk whose spatial axes are not row-major', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(zarrSamples({ data: new Float32Array(6), shape: [2, 3], stride: [1, 2] })).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('accepts a row-major chunk that reports its stride', () => {
    const chunk = { data: new Uint8Array(12), shape: [3, 2, 2], stride: [4, 2, 1] }
    expect(zarrSamples(chunk)).toMatchObject({ planeStride: 4, planes: 3 })
  })
})

describe('makeZarrRenderTileLoader, one band', () => {
  const render = { colormap_name: 'viridis', rescale: [[0, 100]], nodata: -9 }

  it('colours a two-dimensional chunk through the ramp', async () => {
    const chunk = { data: Float32Array.from([0, 50, 100, 0]), shape: [2, 2] }
    const zarr = fakeZarr(chunk)
    const { getTileData, renderTile } = makeZarrRenderTileLoader(render, { zarr })
    const result = await getTileData({}, { sliceSpec: [0, null, null], width: 2, height: 2 })

    expect(zarr.get).toHaveBeenCalledOnce()
    expect(result.width).toBe(2)
    // The low end of viridis is dark purple, the high end yellow.
    expect(pixel(result, 0)[3]).toBe(255)
    expect(pixel(result, 2)[0]).toBeGreaterThan(pixel(result, 0)[0])
    expect(renderTile(result)).toEqual({ image: result.colorImage })
  })

  it('leaves a no-data pixel transparent', async () => {
    const chunk = { data: Float32Array.from([-9, 50, 50, 50]), shape: [2, 2] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [0, null, null], width: 2, height: 2 })
    expect(pixel(result, 0)).toEqual([0, 0, 0, 0])
    expect(pixel(result, 1)[3]).toBe(255)
  })

  it('leaves a NaN pixel transparent, which is how a float store writes a gap', async () => {
    const chunk = { data: Float32Array.from([NaN, 50]), shape: [1, 2] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [0, null, null], width: 2, height: 1 })
    expect(pixel(result, 0)).toEqual([0, 0, 0, 0])
    expect(pixel(result, 1)[3]).toBe(255)
  })

  it('colours a class mask by value, through a discrete colormap', async () => {
    const classes = { colormap: { 1: [255, 0, 0, 255], 2: [0, 0, 255, 255] }, nodata: [0] }
    const chunk = { data: Int16Array.from([1, 2, 0, 1]), shape: [2, 2] }
    const { getTileData } = makeZarrRenderTileLoader(classes, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [0, null, null], width: 2, height: 2 })
    expect(pixel(result, 0)).toEqual([255, 0, 0, 255])
    expect(pixel(result, 1)).toEqual([0, 0, 255, 255])
    expect(pixel(result, 2)).toEqual([0, 0, 0, 0])
  })

  it('reads the plane a band axis selects rather than the first', async () => {
    // Two bands of 2x2. Band 2 (bidx 2) is the plane of fifties.
    const chunk = { data: Float32Array.from([0, 0, 0, 0, 50, 50, 50, 50]), shape: [2, 2, 2] }
    const banded = { ...render, bidx: [2] }
    const { getTileData } = makeZarrRenderTileLoader(banded, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 2, height: 2 })
    // All four pixels read 50, so they share one colour that is not the ramp's
    // low end.
    const first = pixel(result, 0)
    expect(pixel(result, 3)).toEqual(first)
    expect(first[3]).toBe(255)
    expect(first).not.toEqual([68, 1, 84, 255])
  })

  it('returns null when the tile was aborted while the chunk was in flight', async () => {
    const chunk = { data: Float32Array.from([1]), shape: [1, 1] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, {
      sliceSpec: [0, null, null], width: 1, height: 1, signal: { aborted: true },
    })
    expect(result).toBeNull()
  })

  // A plane the chunk does not carry indexes past the buffer, and `undefined`
  // written through the ramp draws an opaque garbage image.
  it('draws nothing for a bidx the chunk has no plane for', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const chunk = { data: Float32Array.from([1, 2, 3, 4]), shape: [2, 1, 2] }
    const banded = { ...render, bidx: [5] }
    const { getTileData } = makeZarrRenderTileLoader(banded, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 2, height: 1 })
    expect(result).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('builds the colour table once per layer, not once per chunk', async () => {
    let reads = 0
    const counted = { rescale: [[0, 100]] }
    Object.defineProperty(counted, 'colormap', { get() { reads++; return undefined } })
    const chunk = { data: Float32Array.from([1]), shape: [1, 1] }
    const { getTileData } = makeZarrRenderTileLoader(counted, { zarr: fakeZarr(chunk) })
    expect(reads).toBeGreaterThan(0)
    const atConstruction = reads
    const opts = { sliceSpec: [0, null, null], width: 1, height: 1 }
    await getTileData({}, opts)
    await getTileData({}, opts)
    expect(reads).toBe(atConstruction)
  })

  it('returns null for a chunk it cannot shape', async () => {
    const { getTileData } = makeZarrRenderTileLoader(render, {
      zarr: fakeZarr({ data: Float32Array.from([1]), shape: [1] }),
    })
    expect(await getTileData({}, { sliceSpec: [0], width: 1, height: 1 })).toBeNull()
  })
})

describe('makeZarrRenderTileLoader, true colour', () => {
  const render = { bidx: [1, 2, 3], rescale: [[0, 255]] }

  it('composites three band planes into true colour', async () => {
    // Four bands (r, g, b, alpha) of one pixel, as an RGBA store writes them.
    const chunk = { data: Uint8Array.from([10, 20, 30, 255]), shape: [4, 1, 1] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 1, height: 1 })
    expect(pixel(result, 0)).toEqual([10, 20, 30, 255])
  })

  it('composites a 2x2 tile in row-major order, plane by plane', async () => {
    const r = [1, 2, 3, 4]
    const g = [10, 20, 30, 40]
    const b = [100, 110, 120, 130]
    const chunk = { data: Uint8Array.from([...r, ...g, ...b]), shape: [3, 2, 2] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 2, height: 2 })
    expect(pixel(result, 0)).toEqual([1, 10, 100, 255])
    expect(pixel(result, 3)).toEqual([4, 40, 130, 255])
  })

  it('stretches each band by its own rescale pair', async () => {
    const stretched = { bidx: [1, 2, 3], rescale: [[0, 10], [0, 100], [0, 1000]] }
    const chunk = { data: Uint16Array.from([10, 100, 1000]), shape: [3, 1, 1] }
    const { getTileData } = makeZarrRenderTileLoader(stretched, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 1, height: 1 })
    // Each band sits at the top of its own range, so each reads as full white.
    expect(pixel(result, 0)).toEqual([255, 255, 255, 255])
  })

  it('refuses a true-colour render of a chunk with no band axis', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const chunk = { data: Uint8Array.from([1, 2, 3, 4]), shape: [2, 2] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    expect(await getTileData({}, { sliceSpec: [0, null, null], width: 2, height: 2 })).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  // A plane the chunk does not carry indexes past the buffer, and `undefined`
  // is written opaque, so the tile draws a garbage image.
  it('draws nothing when the chunk carries fewer planes than bidx names', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const chunk = { data: Uint8Array.from([10, 20]), shape: [2, 1, 1] }
    const { getTileData } = makeZarrRenderTileLoader(render, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 1, height: 1 })
    expect(result).toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('drops a pixel only where every channel is empty', async () => {
    const withNodata = { bidx: [1, 2, 3], rescale: [[0, 255]], nodata: 0 }
    // Pixel 0 is empty in all three channels; pixel 1 only in red.
    const chunk = { data: Uint8Array.from([0, 5, 0, 10, 0, 20]), shape: [3, 1, 2] }
    const { getTileData } = makeZarrRenderTileLoader(withNodata, { zarr: fakeZarr(chunk) })
    const result = await getTileData({}, { sliceSpec: [null, null, null], width: 2, height: 1 })
    expect(pixel(result, 0)).toEqual([0, 0, 0, 0])
    expect(pixel(result, 1)).toEqual([5, 10, 20, 255])
  })
})

describe('decimateSliceSpec', () => {
  const zarr = { slice: (start, stop, step) => ({ start, stop, step }) }
  const sl = (start, stop, step = 1) => ({ start, stop, step })

  it('leaves a tile inside the budget alone', () => {
    const spec = [0, sl(0, 512), sl(0, 512)]
    expect(decimateSliceSpec(spec, zarr)).toBe(spec)
  })

  it('steps over a chunk far larger than the budget', () => {
    // The FTW global store: 4096 by 4096 is 16.7M samples against a 4.19M
    // budget, so every second sample is read and the tile returns 2048 square.
    const spec = [0, sl(0, 4096), sl(0, 4096)]
    const out = decimateSliceSpec(spec, zarr)
    expect(out[1]).toMatchObject({ start: 0, stop: 4096, step: 2 })
    expect(out[2]).toMatchObject({ start: 0, stop: 4096, step: 2 })
    const pixels = Math.ceil(4096 / 2) ** 2
    expect(pixels).toBeLessThanOrEqual(2048 * 2048)
  })

  it('keeps the non-spatial entries untouched', () => {
    const spec = [3, null, sl(0, 8192), sl(0, 8192)]
    const out = decimateSliceSpec(spec, zarr)
    expect(out[0]).toBe(3)
    expect(out[1]).toBeNull()
    expect(out[2].step).toBeGreaterThan(1)
  })

  it('multiplies a step the layer already asked for', () => {
    const spec = [sl(0, 8192, 2), sl(0, 8192, 2)]
    // 4096 by 4096 effective samples, so it needs one more halving.
    const out = decimateSliceSpec(spec, zarr)
    expect(out[0].step).toBe(4)
  })

  it('leaves a spec it cannot measure alone', () => {
    const spec = [0, null, null]
    expect(decimateSliceSpec(spec, zarr)).toBe(spec)
    expect(decimateSliceSpec([sl(0, 10)], zarr)).toEqual([sl(0, 10)])
  })
})
