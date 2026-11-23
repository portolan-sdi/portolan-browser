import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createPartitionPlaceholder,
  GLOB_UNRESOLVED,
  hasGlobPattern,
  isPartitionPlaceholder,
  resolveParquetGlob,
} from '../../src/utils/parquetGlob.js'

const COLLECTION_URL = 'https://data.test/ftw/2017/collection.json'
const GLOB_HREF = 'https://data.test/ftw/2017/zone=*/utm*.parquet'

// Minimal stand-ins for the stac-js objects ParquetViewer hands the resolver:
// an Asset that knows its absolute href and its owning Collection, and a
// Collection that lists its `item` links.
const link = (href, title) => ({ href, title, getAbsoluteUrl: () => new URL(href, COLLECTION_URL).href })

const mirror = (href = './items.parquet') => ({
  type: 'application/vnd.apache.parquet',
  hasRole: roles => (Array.isArray(roles) ? roles : [roles]).includes('collection-mirror'),
  getAbsoluteUrl: () => new URL(href, COLLECTION_URL).href,
})

const collection = (itemLinks, assets = []) => ({
  getStacLinksWithRel: rel => (rel === 'item' ? itemLinks : []),
  getAssets: () => assets,
})

const globAsset = (itemLinks, href = GLOB_HREF, { assets = [], rowCount = null } = {}) => ({
  href,
  getAbsoluteUrl: () => href,
  getMetadata: field => (field === 'table:row_count' ? rowCount : undefined),
  getContext: () => collection(itemLinks, assets),
})

const itemJson = (assets, id = 'utm01') => ({ type: 'Feature', id, assets })

const fetchJson = (item) => vi.fn().mockResolvedValue(item)

afterEach(() => vi.resetAllMocks())

describe('hasGlobPattern', () => {
  it('detects a wildcard in the path', () => {
    expect(hasGlobPattern(GLOB_HREF)).toBe(true)
    expect(hasGlobPattern('https://data.test/a/*.parquet')).toBe(true)
  })

  it('detects the percent-encoded wildcard stac-js produces', () => {
    expect(hasGlobPattern('https://data.test/ftw/2017/zone=%2A/utm%2A.parquet')).toBe(true)
    expect(hasGlobPattern('https://data.test/ftw/2017/zone=%2a/utm%2a.parquet')).toBe(true)
  })

  it('returns false for a concrete href', () => {
    expect(hasGlobPattern('https://data.test/ftw/2017/zone=01/utm01.parquet')).toBe(false)
  })

  it('gives the same answer on repeated calls', () => {
    // A global regex would carry lastIndex between calls and alternate here.
    expect(hasGlobPattern(GLOB_HREF)).toBe(true)
    expect(hasGlobPattern(GLOB_HREF)).toBe(true)
    expect(hasGlobPattern(GLOB_HREF)).toBe(true)
  })

  it('ignores a wildcard in the query string or the fragment', () => {
    expect(hasGlobPattern('https://data.test/a.parquet?select=*')).toBe(false)
    expect(hasGlobPattern('https://data.test/a.parquet#*')).toBe(false)
  })

  it('returns false for an empty href', () => {
    expect(hasGlobPattern('')).toBe(false)
    expect(hasGlobPattern(null)).toBe(false)
  })
})

describe('resolveParquetGlob', () => {
  it('returns a concrete href unchanged and fetches nothing', async () => {
    const fetcher = vi.fn()
    const asset = {
      getAbsoluteUrl: () => 'https://data.test/ftw/2017/all.parquet',
      getContext: () => collection([]),
    }
    const result = await resolveParquetGlob(asset, { fetchJson: fetcher })
    expect(result).toEqual({ url: 'https://data.test/ftw/2017/all.parquet', partition: null })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('resolves the glob to the data asset of the first item', async () => {
    const links = [
      link('./zone=01/utm01.json', 'UTM zone 1'),
      link('./zone=04/utm04.json', 'UTM zone 4'),
    ]
    const fetcher = fetchJson(itemJson({
      data: { href: './utm01.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
    }))
    const result = await resolveParquetGlob(globAsset(links), { fetchJson: fetcher })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toBe('https://data.test/ftw/2017/zone=01/utm01.json')
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/utm01.parquet')
    expect(result.partition).toEqual({ title: 'UTM zone 1', count: 2, totalRows: null, mirrorUrl: null })
  })

  it('resolves a percent-encoded wildcard, the form stac-js hands it', async () => {
    const encoded = 'https://data.test/ftw/2017/zone=%2A/utm%2A.parquet'
    const fetcher = fetchJson(itemJson({
      data: { href: './utm01.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
    }))
    const result = await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')], encoded), {
      fetchJson: fetcher,
    })
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/utm01.parquet')
  })

  it('prefers the asset whose href matches the glob', async () => {
    const fetcher = fetchJson(itemJson({
      mirror: { href: './items.parquet', type: 'application/vnd.apache.parquet', roles: ['metadata'] },
      data: { href: './utm01.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
    }))
    const result = await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher })
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/utm01.parquet')
  })

  it('keeps the wildcard inside one path segment', async () => {
    // `zone=*` must not match `zone=01/nested`, so the nested file loses to the
    // data-role fallback below rather than matching the glob.
    const fetcher = fetchJson(itemJson({
      nested: { href: './deeper/utm01.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
    }))
    const asset = globAsset([link('./zone=01/utm01.json')], 'https://data.test/ftw/2017/zone=*/utm01.parquet')
    const result = await resolveParquetGlob(asset, { fetchJson: fetcher })
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/deeper/utm01.parquet')
  })

  it('falls back to the parquet asset with the data role when no href matches', async () => {
    const fetcher = fetchJson(itemJson({
      thumbnail: { href: './thumb.png', type: 'image/png', roles: ['thumbnail'] },
      part: { href: './rows-0001.parquet', type: 'application/vnd.apache.parquet', roles: ['data'] },
    }))
    const result = await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher })
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/rows-0001.parquet')
  })

  it('detects an untyped parquet asset by its extension', async () => {
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    const result = await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher })
    expect(result.url).toBe('https://data.test/ftw/2017/zone=01/utm01.parquet')
  })

  it('reports globUnresolved when the context lists no items', async () => {
    const fetcher = vi.fn()
    await expect(resolveParquetGlob(globAsset([]), { fetchJson: fetcher }))
      .rejects.toMatchObject({ code: GLOB_UNRESOLVED })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('reports globUnresolved when the asset has no context', async () => {
    const asset = { getAbsoluteUrl: () => GLOB_HREF }
    await expect(resolveParquetGlob(asset, { fetchJson: vi.fn() }))
      .rejects.toMatchObject({ code: GLOB_UNRESOLVED })
  })

  it('reports globUnresolved when the first item carries no parquet asset', async () => {
    const fetcher = fetchJson(itemJson({ thumbnail: { href: './thumb.png', type: 'image/png' } }))
    await expect(resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher }))
      .rejects.toMatchObject({ code: GLOB_UNRESOLVED })
  })

  it('propagates a failed item fetch', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fetch item failed 404'))
    await expect(resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher }))
      .rejects.toThrow('fetch item failed 404')
  })

  it('names the partition after the item id when the link has no title', async () => {
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }, 'utm01'))
    const result = await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), { fetchJson: fetcher })
    expect(result.partition).toEqual({ title: 'utm01', count: 1, totalRows: null, mirrorUrl: null })
  })

  it('reports the declared row count over every partition', async () => {
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    const asset = globAsset([link('./zone=01/utm01.json')], GLOB_HREF, { rowCount: 133102683 })
    const result = await resolveParquetGlob(asset, { fetchJson: fetcher })
    expect(result.partition.totalRows).toBe(133102683)
    // A declared count settles the question, so the mirror stays unread.
    expect(result.partition.mirrorUrl).toBeNull()
  })

  it('names the item mirror when the metadata declares no total', async () => {
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    const asset = globAsset([link('./zone=01/utm01.json')], GLOB_HREF, { assets: [mirror()] })
    const result = await resolveParquetGlob(asset, { fetchJson: fetcher })
    expect(result.partition.totalRows).toBeNull()
    expect(result.partition.mirrorUrl).toBe('https://data.test/ftw/2017/items.parquet')
  })

  it('ignores a mirror asset that is not parquet', async () => {
    const jsonMirror = {
      type: 'application/json',
      hasRole: roles => (Array.isArray(roles) ? roles : [roles]).includes('collection-mirror'),
      getAbsoluteUrl: () => 'https://data.test/ftw/2017/items.json',
    }
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    const asset = globAsset([link('./zone=01/utm01.json')], GLOB_HREF, { assets: [jsonMirror] })
    const result = await resolveParquetGlob(asset, { fetchJson: fetcher })
    expect(result.partition.mirrorUrl).toBeNull()
  })

  it('rejects a row count that is not a positive number', async () => {
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    for (const rowCount of [0, -5, 'many', null]) {
      // eslint-disable-next-line no-await-in-loop
      const result = await resolveParquetGlob(
        globAsset([link('./zone=01/utm01.json')], GLOB_HREF, { rowCount }), { fetchJson: fetcher }
      )
      expect(result.partition.totalRows).toBeNull()
    }
  })

  it('forwards the abort signal to the item fetch', async () => {
    const controller = new AbortController()
    const fetcher = fetchJson(itemJson({ data: { href: './utm01.parquet', roles: ['data'] } }))
    await resolveParquetGlob(globAsset([link('./zone=01/utm01.json')]), {
      fetchJson: fetcher, signal: controller.signal,
    })
    expect(fetcher.mock.calls[0][1]).toBe(controller.signal)
  })
})

// Portolan v0.3 forbids a wildcard href, so a partitioned collection declares
// `partition:glob` and may publish no concrete parquet data asset at all.
// ParquetViewer then offers one synthetic entry, and the resolver expands the
// glob by listing the bucket instead of reading an item.
const FILES = [
  'https://ftw.s3.us-west-2.amazonaws.com/at/year%3D2021/part-0.parquet',
  'https://ftw.s3.us-west-2.amazonaws.com/at/year%3D2022/part-0.parquet',
  'https://ftw.s3.us-west-2.amazonaws.com/at/year%3D2023/part-0.parquet',
]

const SCHEMES = { aws: { type: 'aws-s3', bucket: 'ftw', region: 'us-west-2' } }

const partitioned = ({
  glob = 's3://ftw/at/year=*/*.parquet',
  fileCount = 3,
  rowCount = null,
  assets = [],
} = {}) => ({
  getMetadata: field => ({
    'partition:glob': glob,
    'partition:file_count': fileCount,
    'storage:schemes': SCHEMES,
    'table:row_count': rowCount,
  })[field],
  getAssets: () => assets,
  getStacLinksWithRel: () => [],
})

const lister = (files = FILES) => vi.fn().mockResolvedValue(files)

describe('isPartitionPlaceholder', () => {
  it('marks the synthetic entry and nothing else', () => {
    expect(isPartitionPlaceholder(createPartitionPlaceholder(partitioned()))).toBe(true)
    expect(isPartitionPlaceholder({ getAbsoluteUrl: () => GLOB_HREF })).toBe(false)
    expect(isPartitionPlaceholder(null)).toBe(false)
  })

  it('carries the title the viewer gives it and the collection as its context', () => {
    const context = partitioned()
    const placeholder = createPartitionPlaceholder(context, { title: 'Partitioned data (3 files)' })
    expect(placeholder.title).toBe('Partitioned data (3 files)')
    expect(placeholder.getContext()).toBe(context)
    expect(placeholder.getKey()).toBe('partition:glob')
  })
})

describe('resolveParquetGlob for a partitioned collection', () => {
  it('previews the first file of the expansion and counts every match', async () => {
    const listGlob = lister()
    const result = await resolveParquetGlob(
      createPartitionPlaceholder(partitioned()), { listGlob, fetchJson: vi.fn() }
    )
    expect(result.url).toBe(FILES[0])
    expect(result.partition).toEqual({
      title: 'part-0.parquet', count: 3, totalRows: null, mirrorUrl: null,
    })
  })

  it('expands the collection glob with the collection storage schemes', async () => {
    const controller = new AbortController()
    const listGlob = lister()
    await resolveParquetGlob(createPartitionPlaceholder(partitioned()), {
      listGlob, signal: controller.signal,
    })
    expect(listGlob).toHaveBeenCalledTimes(1)
    expect(listGlob.mock.calls[0][0]).toBe('s3://ftw/at/year=*/*.parquet')
    expect(listGlob.mock.calls[0][1]).toBe(SCHEMES)
    expect(listGlob.mock.calls[0][2]).toEqual({ signal: controller.signal })
  })

  it('reads no item links for a partitioned collection', async () => {
    const fetchJson = vi.fn()
    await resolveParquetGlob(createPartitionPlaceholder(partitioned()), {
      listGlob: lister(), fetchJson,
    })
    expect(fetchJson).not.toHaveBeenCalled()
  })

  it('surfaces an unresolved expansion', async () => {
    const error = new Error('Listing matched no files for the partition glob')
    error.code = GLOB_UNRESOLVED
    const listGlob = vi.fn().mockRejectedValue(error)
    await expect(resolveParquetGlob(createPartitionPlaceholder(partitioned()), { listGlob }))
      .rejects.toMatchObject({ code: GLOB_UNRESOLVED })
  })

  it('reports globUnresolved for a listing failure that carries no code', async () => {
    // A blocked cross-origin listing rejects with a bare TypeError. Without
    // the code the caller cannot tell it from a failure of its own, and loses
    // the fallback it offers for files it cannot reach.
    const listGlob = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(resolveParquetGlob(createPartitionPlaceholder(partitioned()), { listGlob }))
      .rejects.toMatchObject({ code: GLOB_UNRESOLVED })
  })

  it('keeps an abort as an abort', async () => {
    const controller = new AbortController()
    const listGlob = vi.fn().mockImplementation(() => {
      controller.abort()
      return Promise.reject(new DOMException('aborted', 'AbortError'))
    })
    await expect(resolveParquetGlob(createPartitionPlaceholder(partitioned()), {
      listGlob, signal: controller.signal,
    })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('reports globUnresolved for an expansion that answered nothing', async () => {
    await expect(resolveParquetGlob(
      createPartitionPlaceholder(partitioned()), { listGlob: lister([]) }
    )).rejects.toMatchObject({ code: GLOB_UNRESOLVED })
  })

  it('reports globUnresolved when the collection declares no glob', async () => {
    const listGlob = lister()
    await expect(resolveParquetGlob(
      createPartitionPlaceholder(partitioned({ glob: null })), { listGlob }
    )).rejects.toMatchObject({ code: GLOB_UNRESOLVED })
    expect(listGlob).not.toHaveBeenCalled()
  })

  it('names the file by its decoded basename', async () => {
    const listGlob = lister(['https://ftw.s3.us-west-2.amazonaws.com/at/two%20words.parquet'])
    const result = await resolveParquetGlob(createPartitionPlaceholder(partitioned()), { listGlob })
    expect(result.partition.title).toBe('two words.parquet')
  })

  it('reports the row count the collection declares over every partition', async () => {
    const result = await resolveParquetGlob(
      createPartitionPlaceholder(partitioned({ rowCount: 133102683, assets: [mirror()] })),
      { listGlob: lister() }
    )
    expect(result.partition.totalRows).toBe(133102683)
    expect(result.partition.mirrorUrl).toBeNull()
  })

  it('names the item mirror of the collection when no total is declared', async () => {
    const result = await resolveParquetGlob(
      createPartitionPlaceholder(partitioned({ assets: [mirror()] })), { listGlob: lister() }
    )
    expect(result.partition.mirrorUrl).toBe('https://data.test/ftw/2017/items.parquet')
  })
})

describe('resolveParquetGlob for an s3-primary asset', () => {
  it('previews a concrete asset through its https alternate', async () => {
    const asset = {
      href: 's3://ftw/at/all.parquet',
      getAbsoluteUrl: () => 's3://ftw/at/all.parquet',
      alternate: { https: { href: 'https://data.test/ftw/at/all.parquet' } },
    }
    const result = await resolveParquetGlob(asset, { fetchJson: vi.fn() })
    expect(result).toEqual({ url: 'https://data.test/ftw/at/all.parquet', partition: null })
  })
})
