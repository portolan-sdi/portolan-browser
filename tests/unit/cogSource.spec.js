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

// The same source, but each fetch stays in flight until the test releases it.
// Needed to observe what happens between the merged request going out and its
// bytes arriving.
function gatedSource(size = 4096) {
  const source = fakeSource(size)
  const pending = []
  return {
    ...source,
    release() { for (const fn of pending.splice(0)) { fn() } },
    fetch(offset, length, options) {
      source.calls.push({ offset, length, signal: options?.signal })
      const end = length === undefined ? size : Math.min(offset + length, size)
      return new Promise(resolve => {
        pending.push(() => resolve(source.bytes.buffer.slice(offset, end)))
      })
    },
  }
}

// Let the macrotask that `coalescingDataSource` waits on run.
function flushBatch() {
  return new Promise(resolve => setTimeout(resolve, 0))
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
    const source = gatedSource()
    const src = coalescingDataSource(source)
    const first = new AbortController()
    const second = new AbortController()
    const reads = [
      src.fetch(0, 16, { signal: first.signal }),
      src.fetch(16, 16, { signal: second.signal }),
    ]
    reads.forEach(r => r.catch(() => null))
    await flushBatch()
    expect(source.calls).toHaveLength(1)
    const merged = source.calls[0].signal
    expect(merged.aborted).toBe(false)
    first.abort()
    expect(merged.aborted).toBe(false)
    second.abort()
    expect(merged.aborted).toBe(true)
  })

  it('cancels the merged request when one signal covers every read', async () => {
    // A tile and its mask are read under one deck tile signal, which is the
    // pair this merge exists for.
    const source = gatedSource()
    const src = coalescingDataSource(source)
    const tile = new AbortController()
    const reads = [
      src.fetch(0, 16, { signal: tile.signal }),
      src.fetch(16, 16, { signal: tile.signal }),
    ]
    reads.forEach(r => r.catch(() => null))
    await flushBatch()
    expect(source.calls).toHaveLength(1)
    tile.abort()
    expect(source.calls[0].signal.aborted).toBe(true)
  })

  it('rejects a read that aborts while the merged request is in flight', async () => {
    const source = gatedSource()
    const src = coalescingDataSource(source)
    const dropped = new AbortController()
    const kept = src.fetch(16, 16, { signal: new AbortController().signal })
    const abandoned = src.fetch(0, 16, { signal: dropped.signal })
    abandoned.catch(() => null)
    await flushBatch()
    expect(source.calls).toHaveLength(1)
    // The bytes are already on their way, so this read is cancelled between
    // the request going out and its answer arriving.
    dropped.abort()
    source.release()
    await expect(abandoned).rejects.toThrow()
    expect(actual(await kept)).toEqual(expected(source, 16, 16))
  })

  it('rejects with an AbortError when the caller aborts with a plain value', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const dropped = new AbortController()
    const abandoned = src.fetch(0, 16, { signal: dropped.signal })
    dropped.abort('viewport moved')
    await expect(abandoned).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('stops listening to the caller signals once the merged request settles', async () => {
    const source = fakeSource()
    const src = coalescingDataSource(source)
    const controller = new AbortController()
    const removed = []
    const remove = controller.signal.removeEventListener.bind(controller.signal)
    controller.signal.removeEventListener = (type, fn) => { removed.push(type); remove(type, fn) }
    await Promise.all([
      src.fetch(0, 16, { signal: controller.signal }),
      src.fetch(16, 16, { signal: controller.signal }),
    ])
    expect(removed).toEqual(['abort'])
  })

  it('settles every read when a fetch throws rather than rejects', async () => {
    // `flush` runs in a timer, so a synchronous throw would otherwise escape
    // it and leave this group and every later group of the batch hanging.
    const good = fakeSource()
    const source = {
      calls: good.calls,
      fetch(offset, length, options) {
        if (offset === 0) {throw new Error('bad range')}
        return good.fetch(offset, length, options)
      },
    }
    // A gap small enough to keep the two reads in separate groups.
    const src = coalescingDataSource(source, { gap: 64 })
    const results = await Promise.allSettled([
      src.fetch(0, 16),
      src.fetch(2000, 16),
    ])
    expect(results.map(r => r.status)).toEqual(['rejected', 'fulfilled'])
    expect(results[0].reason.message).toBe('bad range')
    expect(actual(results[1].value)).toEqual(expected(good, 2000, 16))
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
