import { describe, it, expect } from 'vitest'
import { coalescingDataSource, openCog } from '../../src/utils/cogSource.js'

// A source over a known byte string, which records every range it was asked
// for. Byte i holds the value i % 251, so a slice proves its own position.
function fakeSource(size = 4096) {
  const bytes = new Uint8Array(size)
  for (let i = 0; i < size; i++) { bytes[i] = i % 251 }
  const calls = []
  return {
    calls,
    bytes,
    fetch(offset, length, options) {
      calls.push({ offset, length, signal: options?.signal })
      const end = length === undefined ? size : Math.min(offset + length, size)
      return Promise.resolve(bytes.buffer.slice(offset, end))
    },
  }
}

function expected(source, offset, length) {
  return Array.from(source.bytes.subarray(offset, offset + length))
}

function actual(buffer) {
  return Array.from(new Uint8Array(buffer))
}

describe('coalescingDataSource', () => {
  it('merges reads that sit close together into one range request', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    // A tile and the mask tile 8 bytes past its end, as GDAL's COG driver
    // writes them.
    const [tile, mask] = await Promise.all([
      src.fetch(1000, 100),
      src.fetch(1108, 20),
    ])
    expect(source.calls).toHaveLength(1)
    expect(source.calls[0]).toMatchObject({ offset: 1000, length: 128 })
    expect(actual(tile)).toEqual(expected(source, 1000, 100))
    expect(actual(mask)).toEqual(expected(source, 1108, 20))
  })

  it('returns the right bytes whatever order the reads arrive in', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const [late, early] = await Promise.all([
      src.fetch(2048, 32),
      src.fetch(2000, 16),
    ])
    expect(source.calls).toHaveLength(1)
    expect(actual(early)).toEqual(expected(source, 2000, 16))
    expect(actual(late)).toEqual(expected(source, 2048, 32))
  })

  it('keeps reads apart when the gap between them is too large', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source, { gap: 64 })
    await Promise.all([src.fetch(0, 16), src.fetch(1000, 16)])
    expect(source.calls).toHaveLength(2)
    expect(source.calls.map(c => c.offset).sort((a, b) => a - b)).toEqual([0, 1000])
  })

  it('never lets a merged read grow past maxSize', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source, { gap: 1024, maxSize: 200 })
    await Promise.all([src.fetch(0, 100), src.fetch(150, 100)])
    expect(source.calls).toHaveLength(2)
  })

  it('does not merge reads issued in separate macrotasks', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    await src.fetch(0, 16)
    await src.fetch(16, 16)
    expect(source.calls).toHaveLength(2)
  })

  it('passes a read from the end of the file straight through', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    await src.fetch(-16)
    expect(source.calls).toEqual([{ offset: -16, length: undefined, signal: undefined }])
  })

  it('cancels the merged request only once every read has aborted', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const first = new AbortController()
    const second = new AbortController()
    const reads = [
      src.fetch(0, 16, { signal: first.signal }),
      src.fetch(16, 16, { signal: second.signal }),
    ]
    await Promise.all(reads.map(r => r.catch(() => null)))
    expect(source.calls).toHaveLength(1)
    const merged = source.calls[0].signal
    expect(merged.aborted).toBe(false)
    first.abort()
    expect(merged.aborted).toBe(false)
    second.abort()
    expect(merged.aborted).toBe(true)
  })

  it('rejects the read that aborted and keeps its neighbour whole', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const dropped = new AbortController()
    const kept = src.fetch(16, 16, { signal: new AbortController().signal })
    const abandoned = src.fetch(0, 16, { signal: dropped.signal })
    dropped.abort()
    await expect(abandoned).rejects.toThrow()
    expect(actual(await kept)).toEqual(expected(source, 16, 16))
  })

  it('never reads for a signal that aborted before the merge', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const dropped = new AbortController()
    const abandoned = src.fetch(0, 16, { signal: dropped.signal })
    dropped.abort()
    await expect(abandoned).rejects.toThrow()
    expect(source.calls).toHaveLength(0)
  })
})

describe('openCog', () => {
  it('reads the header once and rebuilds the COG over a coalescing source', async () => {
    const source = fakeSource()
    const opened = []
    class FakeGeoTIFF {
      constructor(tiff, dataSource) { this.tiff = tiff; this.dataSource = dataSource }
      static async fromUrl(url) {
        opened.push(url)
        return new FakeGeoTIFF({ url }, source)
      }
      static async fromTiff(tiff, dataSource) { return new FakeGeoTIFF(tiff, dataSource) }
    }

    const cog = await openCog(FakeGeoTIFF, 'https://example.com/a.tif')
    // The header is read once; `fromTiff` reuses the initialised Tiff.
    expect(opened).toEqual(['https://example.com/a.tif'])
    expect(cog.tiff).toEqual({ url: 'https://example.com/a.tif' })
    // Tile reads now merge, which is the whole point of the rebuild.
    await Promise.all([cog.dataSource.fetch(0, 16), cog.dataSource.fetch(24, 16)])
    expect(source.calls).toHaveLength(1)
    expect(source.calls[0]).toMatchObject({ offset: 0, length: 40 })
  })
})
