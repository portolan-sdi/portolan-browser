// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import zlib from 'node:zlib'
import { avroDeflateToNull, avroSafeResolver, hasAvroMagic } from '../../src/utils/avroInflate.js'

const SYNC = Uint8Array.from({ length: 16 }, (_, i) => i + 1)

function long(value) {
  let n = (BigInt(value) << 1n) ^ (value < 0 ? -1n : 0n)
  const out = []
  while (n > 0x7fn) {
    out.push(Number(n & 0x7fn) | 0x80)
    n >>= 7n
  }
  out.push(Number(n))
  return out
}

function str(text) {
  const bytes = new TextEncoder().encode(text)
  return [...long(bytes.length), ...bytes]
}

// A minimal Avro object container file with one entry in the metadata map per
// `meta` pair and one block per element of `blocks`.
function buildAvro(codec, blocks, schema = '{"type":"long"}') {
  const meta = [['avro.schema', schema], ['avro.codec', codec]]
  const header = [0x4f, 0x62, 0x6a, 0x01, ...long(meta.length)]
  for (const [k, v] of meta) { header.push(...str(k), ...str(v)) }
  header.push(0, ...SYNC)
  const parts = [Uint8Array.from(header)]
  for (const { records, data } of blocks) {
    parts.push(Uint8Array.from([...long(records), ...long(data.length)]), data, SYNC)
  }
  return Buffer.concat(parts)
}

function readBack(bytes) {
  // Walk the rewritten file and return its codec and raw block payloads.
  let o = 4
  const read = () => {
    let n = 0n, s = 0n, c
    do { c = bytes[o++]; n |= BigInt(c & 0x7f) << s; s += 7n } while (c & 0x80)
    return Number((n >> 1n) ^ -(n & 1n))
  }
  const meta = {}
  let count = read()
  while (count) {
    for (let i = 0; i < count; i++) {
      const kl = read(); const k = Buffer.from(bytes.subarray(o, o + kl)).toString(); o += kl
      const vl = read(); meta[k] = Buffer.from(bytes.subarray(o, o + vl)).toString(); o += vl
    }
    count = read()
  }
  o += 16
  const blocks = []
  while (o < bytes.length) {
    const records = read(); const size = read()
    blocks.push({ records, data: Buffer.from(bytes.subarray(o, o + size)) })
    o += size + 16
  }
  return { meta, blocks }
}

describe('avroDeflateToNull', () => {
  it('rewrites every deflate block to the null codec', async () => {
    const first = Buffer.from('hello avro '.repeat(40))
    const second = Buffer.from([1, 2, 3, 4, 5])
    const file = buildAvro('deflate', [
      { records: 3, data: zlib.deflateRawSync(first) },
      { records: 5, data: zlib.deflateRawSync(second) },
    ])

    const out = readBack(await avroDeflateToNull(new Uint8Array(file)))

    expect(out.meta['avro.codec']).toBe('null')
    expect(out.meta['avro.schema']).toBe('{"type":"long"}')
    expect(out.blocks).toHaveLength(2)
    expect(out.blocks[0].records).toBe(3)
    expect(out.blocks[0].data.equals(first)).toBe(true)
    expect(out.blocks[1].records).toBe(5)
    expect(out.blocks[1].data.equals(second)).toBe(true)
  })

  it('returns a null-codec file unchanged', async () => {
    const file = new Uint8Array(buildAvro('null', [{ records: 1, data: Buffer.from([7]) }]))
    expect(await avroDeflateToNull(file)).toBe(file)
  })

  it('returns bytes that are not Avro unchanged', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5, 6])
    expect(hasAvroMagic(bytes)).toBe(false)
    expect(await avroDeflateToNull(bytes)).toBe(bytes)
  })
})

describe('avroSafeResolver', () => {
  const asyncBuffer = bytes => ({
    byteLength: bytes.length,
    slice: (start, end) => bytes.buffer.slice(bytes.byteOffset + start, bytes.byteOffset + (end ?? bytes.length)),
  })

  it('passes a non-Avro path and its length hint through untouched', async () => {
    const source = asyncBuffer(new Uint8Array([1, 2, 3]))
    const base = { reader: vi.fn(() => source) }
    const resolver = avroSafeResolver(base)

    expect(await resolver.reader('https://x/data.parquet', 99)).toBe(source)
    expect(base.reader).toHaveBeenCalledWith('https://x/data.parquet', 99)
  })

  it('ignores the length hint for an Avro file and returns the rewritten bytes', async () => {
    const payload = Buffer.from('manifest rows '.repeat(30))
    const file = new Uint8Array(buildAvro('deflate', [{ records: 2, data: zlib.deflateRawSync(payload) }]))
    const base = { reader: vi.fn(() => asyncBuffer(file)) }
    const resolver = avroSafeResolver(base)

    // 11 bytes too few, like a manifest list that understates manifest_length.
    const out = await resolver.reader('https://x/metadata/snap-1.avro', file.length - 11)

    expect(base.reader).toHaveBeenCalledWith('https://x/metadata/snap-1.avro')
    const parsed = readBack(new Uint8Array(await out.slice(0, out.byteLength)))
    expect(parsed.meta['avro.codec']).toBe('null')
    expect(parsed.blocks[0].data.equals(payload)).toBe(true)
  })
})
