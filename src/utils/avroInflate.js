/**
 * Workaround for a decoder bug in hyparquet-compressors `gunzip`.
 *
 * icebird decompresses Avro `deflate` blocks with `gunzip`. That function throws
 * "offset is out of bounds" on valid raw-deflate blocks that Apache Iceberg Go writes.
 * This module rewrites such a file to the `null` codec with the native
 * `DecompressionStream`. icebird then reads the file without the broken path.
 *
 * Remove this module when the upstream fix ships in hyparquet-compressors.
 * This module has no heavy imports and stays out of the entry chunk.
 */

const AVRO_MAGIC = [0x4f, 0x62, 0x6a, 0x01]; // "Obj" + version 1
const SYNC_LENGTH = 16;

/**
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
export function hasAvroMagic(bytes) {
  return bytes.length >= 4 && AVRO_MAGIC.every((b, i) => bytes[i] === b);
}

/**
 * Read one Avro zig-zag varint.
 * @param {{bytes: Uint8Array, offset: number}} reader
 * @returns {number}
 */
function readLong(reader) {
  let n = 0n;
  let shift = 0n;
  let byte;
  do {
    if (reader.offset >= reader.bytes.length) {throw new Error('avro: unexpected end of data');}
    byte = reader.bytes[reader.offset++];
    n |= BigInt(byte & 0x7f) << shift;
    shift += 7n;
  } while (byte & 0x80);
  return Number((n >> 1n) ^ -(n & 1n));
}

/**
 * @param {number} value
 * @returns {number[]}
 */
function encodeLong(value) {
  let n = (BigInt(value) << 1n) ^ (value < 0 ? -1n : 0n);
  const out = [];
  while (n > 0x7fn) {
    out.push(Number(n & 0x7fn) | 0x80);
    n >>= 7n;
  }
  out.push(Number(n));
  return out;
}

/**
 * Inflate one raw-deflate block with the platform decoder.
 * @param {Uint8Array} data
 * @returns {Promise<Uint8Array>}
 */
async function inflateRaw(data) {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * Rewrite an Avro object container file from the `deflate` codec to the `null` codec.
 * Return the input unchanged when the file is not Avro or uses another codec.
 *
 * @param {Uint8Array} bytes
 * @returns {Promise<Uint8Array>}
 */
export async function avroDeflateToNull(bytes) {
  if (!hasAvroMagic(bytes)) {return bytes;}
  const reader = { bytes, offset: 4 };
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Header metadata map: blocks of (count, [key, value]...) ending with a zero count.
  /** @type {Array<[Uint8Array, Uint8Array]>} */
  const entries = [];
  let codec = 'null';
  let count = readLong(reader);
  while (count !== 0) {
    if (count < 0) {
      count = -count;
      readLong(reader); // block size in bytes, not needed
    }
    for (let i = 0; i < count; i++) {
      const keyLength = readLong(reader);
      const key = bytes.subarray(reader.offset, reader.offset + keyLength);
      reader.offset += keyLength;
      const valueLength = readLong(reader);
      const value = bytes.subarray(reader.offset, reader.offset + valueLength);
      reader.offset += valueLength;
      if (decoder.decode(key) === 'avro.codec') {codec = decoder.decode(value);}
      entries.push([key, value]);
    }
    count = readLong(reader);
  }
  if (codec !== 'deflate') {return bytes;}
  const sync = bytes.subarray(reader.offset, reader.offset + SYNC_LENGTH);
  reader.offset += SYNC_LENGTH;

  /** @type {number[]} */
  const header = [...AVRO_MAGIC, ...encodeLong(entries.length)];
  for (const [key, rawValue] of entries) {
    const value = decoder.decode(key) === 'avro.codec' ? encoder.encode('null') : rawValue;
    header.push(...encodeLong(key.length), ...key, ...encodeLong(value.length));
    // Spread would overflow the stack on a large schema value, so push in a loop.
    for (let i = 0; i < value.length; i++) {header.push(value[i]);}
  }
  header.push(0); // end of metadata map

  // Read every block's bounds first, then inflate them together.
  /** @type {Array<{records: number, data: Uint8Array}>} */
  const blocks = [];
  while (reader.offset < bytes.length) {
    const records = readLong(reader);
    const size = readLong(reader);
    blocks.push({ records, data: bytes.subarray(reader.offset, reader.offset + size) });
    reader.offset += size + SYNC_LENGTH;
  }
  const inflated = await Promise.all(blocks.map(block => inflateRaw(block.data)));

  /** @type {Uint8Array[]} */
  const parts = [Uint8Array.from(header), sync];
  blocks.forEach((block, i) => {
    parts.push(
      Uint8Array.from([...encodeLong(block.records), ...encodeLong(inflated[i].length)]),
      inflated[i],
      sync
    );
  });

  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let position = 0;
  for (const part of parts) {
    out.set(part, position);
    position += part.length;
  }
  return out;
}

/**
 * Wrap an icebird resolver so Avro files arrive with the `null` codec.
 * Only `.avro` paths are fetched in full and rewritten. All other paths pass through.
 *
 * @param {{reader: (path: string, byteLength?: number) => any}} base
 * @returns {{reader: (path: string, byteLength?: number) => any}}
 */
export function avroSafeResolver(base) {
  return {
    ...base,
    async reader(path, byteLength) {
      if (!/\.avro(\?|$)/i.test(path)) {return base.reader(path, byteLength);}
      // Ignore the length hint. A manifest list can state a manifest_length that differs from
      // the real file size. A short hint truncates the file and breaks the inflate step.
      const source = await base.reader(path);
      const raw = new Uint8Array(await source.slice(0, source.byteLength));
      const rewritten = await avroDeflateToNull(raw);
      return {
        byteLength: rewritten.length,
        slice: (start, end) => rewritten.buffer.slice(
          rewritten.byteOffset + start,
          rewritten.byteOffset + (end ?? rewritten.length)
        )
      };
    }
  };
}
