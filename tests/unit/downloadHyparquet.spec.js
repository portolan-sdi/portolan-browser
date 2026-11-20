// The hyparquet version reconciliation behind the "Download data" widget.
//
// The @cng packages pin hyparquet 1.33.0 in the CDN URLs they use when they
// run without a bundler; this app pins 1.26.0 and injects it instead (see
// src/utils/download/hyparquet.js). That is only safe if the two read-path
// flags download-core depends on behave the same way on 1.26.0, and if
// hyparquet-writer -- overridden onto 1.26.0 in pnpm-workspace.yaml -- can
// still write a file this hyparquet reads back. Both are asserted here
// rather than assumed, because the failure mode of getting it wrong is
// silent: mangled WKB, or geometry that decodes to the wrong thing.

import { describe, it, expect } from 'vitest'
import * as hyparquet from 'hyparquet'
import { compressors } from 'hyparquet-compressors'
import { parquetWriteBuffer } from 'hyparquet-writer'

/** An AsyncBuffer over an ArrayBuffer, which is all hyparquet needs. */
function asyncBufferFrom(arrayBuffer) {
  return {
    byteLength: arrayBuffer.byteLength,
    slice: (start, end) => arrayBuffer.slice(start, end)
  }
}

// A minimal GeoParquet 1.1: one WKB point column, a bbox covering struct,
// and the `geo` metadata that makes hyparquet treat the column as geometry.
const WKB_POINT = new Uint8Array([
  1, 1, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 36, 64, // x = 10
  0, 0, 0, 0, 0, 0, 72, 64 // y = 48
])

const GEO_METADATA = JSON.stringify({
  version: '1.1.0',
  primary_column: 'geometry',
  columns: {
    geometry: {
      encoding: 'WKB',
      geometry_types: ['Point'],
      bbox: [10, 48, 10, 48],
      covering: { bbox: { xmin: ['bbox', 'xmin'], ymin: ['bbox', 'ymin'], xmax: ['bbox', 'xmax'], ymax: ['bbox', 'ymax'] } }
    }
  }
})

function writeFixture() {
  return parquetWriteBuffer({
    columnData: [
      { name: 'name', data: ['one', 'two'], type: 'STRING' },
      { name: 'geometry', data: [WKB_POINT, WKB_POINT], type: 'BYTE_ARRAY' },
      {
        name: 'bbox',
        data: [
          { xmin: 10, ymin: 48, xmax: 10, ymax: 48 },
          { xmin: 10, ymin: 48, xmax: 10, ymax: 48 }
        ]
      }
    ],
    kvMetadata: [{ key: 'geo', value: GEO_METADATA }]
  })
}

describe('hyparquet-writer writes what this hyparquet reads', () => {
  it('round-trips a GeoParquet fixture', async () => {
    const file = asyncBufferFrom(writeFixture())
    const metadata = await hyparquet.parquetMetadataAsync(file, { geoparquet: false })
    expect(Number(metadata.num_rows)).toBe(2)
    const rows = await hyparquet.parquetReadObjects({
      file,
      metadata,
      columns: ['name', 'bbox'],
      compressors
    })
    expect(rows).toHaveLength(2)
    expect(rows[0].name).toBe('one')
    expect(rows[0].bbox).toEqual({ xmin: 10, ymin: 48, xmax: 10, ymax: 48 })
  })
})

describe('the read-path flags download-core depends on', () => {
  it('geoparquet: false is live on this version, not a no-op', async () => {
    // 1.26.0 *does* implement the auto-marking: by default the geometry
    // column comes back with a GEOMETRY logical type, which is exactly what
    // download-core turns off so it can decode the WKB itself.
    const file = asyncBufferFrom(writeFixture())
    const marked = await hyparquet.parquetMetadataAsync(file)
    const plain = await hyparquet.parquetMetadataAsync(file, { geoparquet: false })
    const geometryOf = metadata => metadata.schema.find(element => element.name === 'geometry')
    expect(geometryOf(marked).logical_type).toEqual({ type: 'GEOMETRY' })
    expect(geometryOf(plain).logical_type).toBeUndefined()
  })

  it('utf8: false keeps WKB binary instead of mangling it into a string', async () => {
    const file = asyncBufferFrom(writeFixture())
    const metadata = await hyparquet.parquetMetadataAsync(file, { geoparquet: false })
    const asString = await hyparquet.parquetReadObjects({ file, metadata, columns: ['geometry'], compressors })
    const asBytes = await hyparquet.parquetReadObjects({
      file,
      metadata,
      columns: ['geometry'],
      compressors,
      utf8: false
    })
    expect(typeof asString[0].geometry).toBe('string')
    expect(asBytes[0].geometry).toBeInstanceOf(Uint8Array)
    expect(Array.from(asBytes[0].geometry)).toEqual(Array.from(WKB_POINT))
  })
})
