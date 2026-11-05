import { describe, it, expect, vi, afterEach } from 'vitest'
import * as zarr from 'zarrita'
import {
  coordinateSpacing,
  geoZarrAttrsFromCoordinates,
  isIcechunkAsset,
  isZarrAsset,
  declaresMultiscales,
  openZarrRoot,
  resolveLevelPaths,
  spatialDimNames,
  unsupportedCodecs,
  unusableCrs,
  withMultiscalesLayout,
  zarrMinZoom,
  zarrZoomGuard,
} from '../../src/utils/zarrSource.js'

// --- Real zarrita stores, in memory ------------------------------------------
//
// A `Map` satisfies zarrita's read and write interfaces, so a store built with
// `zarr.create` and read with `zarr.open` exercises the same metadata
// documents, path resolution and chunk reads as a store over HTTP. These
// helpers build one, which is what lets the tests below check the behaviour
// the module has against zarrita rather than against a stub of it.

/** A store with no listing, which is what plain HTTP offers. */
function store() {
  return new Map()
}

/**
 * The same store with a `contents()` listing, which is what consolidated
 * metadata and the Icechunk reader give zarrita.
 */
function listable(map) {
  const suffix = '/zarr.json'
  const contents = [...map.keys()]
    .filter(key => key.endsWith(suffix))
    .map((key) => {
      const meta = JSON.parse(new TextDecoder().decode(map.get(key)))
      return { path: key.slice(0, -suffix.length) || '/', kind: meta.node_type }
    })
  return { get: async key => map.get(key), contents: () => contents }
}

/** An array holding `values`, chunked in `chunkShape`. */
async function writeArray(location, { shape, chunkShape, values, dimensionNames, attributes }) {
  const array = await zarr.create(location, {
    shape, chunkShape, dtype: 'float64', dimensionNames, attributes,
  })
  const data = Float64Array.from(
    values ?? Array.from({ length: shape.reduce((a, b) => a * b, 1) }, (_, i) => i),
  )
  const stride = []
  let step = 1
  for (let i = shape.length - 1; i >= 0; i--) {
    stride[i] = step
    step *= shape[i]
  }
  await zarr.set(array, null, { data, shape, stride })
  return array
}

/** A y axis of `n` cells running north to south, and an x axis running east. */
function descending(n, origin, step) {
  return Array.from({ length: n }, (_, i) => origin + i * step)
}

describe('isZarrAsset', () => {
  it('accepts the Zarr media types, with and without parameters', () => {
    expect(isZarrAsset({ type: 'application/vnd.zarr' })).toBe(true)
    expect(isZarrAsset({ type: 'application/vnd.zarr; version=3' })).toBe(true)
    expect(isZarrAsset({ type: 'application/vnd.zarr; version=3; profile=multiscales' })).toBe(true)
    expect(isZarrAsset({ type: 'application/vnd+zarr; version=2' })).toBe(true)
    expect(isZarrAsset({ type: 'application/x-zarr' })).toBe(true)
  })

  it('accepts Icechunk, which reads as Zarr once open', () => {
    expect(isZarrAsset({ type: 'application/x-icechunk' })).toBe(true)
    expect(isIcechunkAsset({ type: 'application/x-icechunk' })).toBe(true)
    expect(isIcechunkAsset({ type: 'application/vnd.zarr; version=3' })).toBe(false)
  })

  it('rejects the raster formats the COG path owns', () => {
    expect(isZarrAsset({ type: 'image/tiff; application=geotiff' })).toBe(false)
    expect(isZarrAsset({ type: 'application/vnd.pmtiles' })).toBe(false)
    expect(isZarrAsset({ type: 'application/geo+json' })).toBe(false)
  })

  it('falls back to the href only when no media type is stated', () => {
    expect(isZarrAsset({ href: 'https://example.com/data.zarr' })).toBe(true)
    expect(isZarrAsset({ href: 'https://example.com/repo.icechunk/' })).toBe(true)
    expect(isZarrAsset({ href: 'https://example.com/store/icechunk' })).toBe(true)
    expect(isZarrAsset({ href: 'https://example.com/data.tif' })).toBe(false)
    // A stated type that is not Zarr settles it, whatever the href looks like.
    expect(isZarrAsset({ type: 'text/html', href: 'https://example.com/data.zarr' })).toBe(false)
  })

  it('ignores a query string when matching the href', () => {
    expect(isZarrAsset({ href: 'https://example.com/data.zarr?v=2' })).toBe(true)
  })
})

describe('coordinateSpacing', () => {
  it('reads the origin and the step of a descending axis', () => {
    const lat = Float64Array.from({ length: 721 }, (_, i) => 90 - i * 0.25)
    expect(coordinateSpacing(lat)).toEqual({ origin: 90, step: -0.25 })
  })

  it('reads an ascending axis', () => {
    const lon = Float64Array.from({ length: 1440 }, (_, i) => -180 + i * 0.25)
    const got = coordinateSpacing(lon)
    expect(got.origin).toBe(-180)
    expect(got.step).toBeCloseTo(0.25, 12)
  })

  it('rejects an irregular axis, which no affine can describe', () => {
    expect(coordinateSpacing(Float64Array.from([0, 1, 2, 10]))).toBeNull()
  })

  it('rejects an axis too short to have a step', () => {
    expect(coordinateSpacing(Float64Array.from([5]))).toBeNull()
    expect(coordinateSpacing(undefined)).toBeNull()
  })

  it('rejects a repeated coordinate, whose step is zero', () => {
    expect(coordinateSpacing(Float64Array.from([3, 3, 3]))).toBeNull()
  })
})

describe('spatialDimNames', () => {
  it('takes the last two dimensions, which is where the renderer requires them', () => {
    expect(spatialDimNames(['time', 'latitude', 'longitude'])).toEqual(['latitude', 'longitude'])
    expect(spatialDimNames(['band', 'y', 'x'])).toEqual(['y', 'x'])
  })

  it('rejects an array whose last two dimensions are not spatial', () => {
    expect(spatialDimNames(['y', 'x', 'time'])).toBeNull()
    expect(spatialDimNames(['time'])).toBeNull()
    expect(spatialDimNames(['y', null])).toBeNull()
  })

  it('accepts an unnamed dimension in front of the spatial ones, which v3 allows', () => {
    expect(spatialDimNames([null, 'y', 'x'])).toEqual(['y', 'x'])
    expect(spatialDimNames([null, null, 'latitude', 'longitude'])).toEqual(['latitude', 'longitude'])
  })
})

// A CF-style store: one data array with its coordinate arrays beside it.
async function cfStore({
  at = '/tas',
  dimensionNames = ['lat', 'lon'],
  shape = [5, 4],
  yStep = -0.25,
  xStep = 0.25,
  attributes = undefined,
} = {}) {
  const map = store()
  const root = zarr.root(map)
  await zarr.create(root)
  const base = at.slice(0, at.lastIndexOf('/')) || '/'
  const beside = name => (base === '/' ? root.resolve(`/${name}`) : root.resolve(`${base}/${name}`))
  if (base !== '/') {await zarr.create(root.resolve(base))}
  await writeArray(root.resolve(at), { shape, chunkShape: shape, dimensionNames, attributes })
  await writeArray(beside(dimensionNames[0]), {
    shape: [shape[0]], chunkShape: [shape[0]], values: descending(shape[0], 90, yStep),
  })
  await writeArray(beside(dimensionNames[1]), {
    shape: [shape[1]], chunkShape: [shape[1]], values: descending(shape[1], -180, xStep),
  })
  return { map, root }
}

describe('geoZarrAttrsFromCoordinates', () => {
  it('returns null for an array whose dimensions are not spatial', async () => {
    const root = zarr.root(store())
    const array = { path: '/tas', dimensionNames: ['time', 'level'], shape: [2, 3] }
    expect(await geoZarrAttrsFromCoordinates(root, array)).toBeNull()
  })

  it('returns null when the array has no named dimensions', async () => {
    const root = zarr.root(store())
    expect(await geoZarrAttrsFromCoordinates(root, { path: '/tas', shape: [2, 3] })).toBeNull()
  })

  it('derives the affine from the coordinate arrays, descending y included', async () => {
    const { root } = await cfStore()
    const array = await zarr.open(root.resolve('/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(root, array)
    expect(attrs['spatial:transform']).toEqual([0.25, 0, -180, 0, -0.25, 90])
    expect(attrs['spatial:shape']).toEqual([5, 4])
    expect(attrs['spatial:registration']).toBe('node')
    expect(attrs['spatial:dimensions']).toEqual(['lat', 'lon'])
    expect(attrs['proj:code']).toBe('EPSG:4326')
  })

  it('refuses a coordinate array that does not label this array', async () => {
    // A store holding a coarser copy of the axis under the same name would
    // otherwise give full-resolution spacing over half the extent, which puts
    // every pixel in the wrong place and says nothing about it.
    const map = store()
    const root = zarr.root(map)
    await zarr.create(root)
    await writeArray(root.resolve('/tas'), {
      shape: [5, 4], chunkShape: [5, 4], dimensionNames: ['lat', 'lon'],
    })
    await writeArray(root.resolve('/lat'), {
      shape: [3], chunkShape: [3], values: [90, 89.5, 89],
    })
    await writeArray(root.resolve('/lon'), {
      shape: [4], chunkShape: [4], values: descending(4, -180, 0.25),
    })
    const array = await zarr.open(root.resolve('/tas'), { kind: 'array' })
    expect(await geoZarrAttrsFromCoordinates(root, array)).toBeNull()
  })

  it('reads the coordinate arrays beside the array before the ones at the root', async () => {
    const { root } = await cfStore({ at: '/cube/tas', yStep: -0.25, xStep: 0.25 })
    // A different grid at the root, of the same lengths, must not win.
    await writeArray(root.resolve('/lat'), {
      shape: [5], chunkShape: [5], values: descending(5, 10, -0.5),
    })
    await writeArray(root.resolve('/lon'), {
      shape: [4], chunkShape: [4], values: descending(4, 10, 0.5),
    })
    const array = await zarr.open(root.resolve('/cube/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(root, array)
    expect(attrs['spatial:transform']).toEqual([0.25, 0, -180, 0, -0.25, 90])
  })

  it('falls back to the coordinate arrays at the root', async () => {
    const map = store()
    const root = zarr.root(map)
    await zarr.create(root)
    await zarr.create(root.resolve('/cube'))
    await writeArray(root.resolve('/cube/tas'), {
      shape: [5, 4], chunkShape: [5, 4], dimensionNames: ['lat', 'lon'],
    })
    await writeArray(root.resolve('/lat'), {
      shape: [5], chunkShape: [5], values: descending(5, 90, -0.25),
    })
    await writeArray(root.resolve('/lon'), {
      shape: [4], chunkShape: [4], values: descending(4, -180, 0.25),
    })
    const array = await zarr.open(root.resolve('/cube/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(root, array)
    expect(attrs['spatial:transform']).toEqual([0.25, 0, -180, 0, -0.25, 90])
  })

  it('reads three slices of a coordinate axis, not the whole axis', async () => {
    const reads = []
    const map = store()
    const root = zarr.root(map)
    await zarr.create(root)
    await writeArray(root.resolve('/tas'), {
      shape: [10, 10], chunkShape: [10, 10], dimensionNames: ['lat', 'lon'],
    })
    await writeArray(root.resolve('/lat'), {
      shape: [10], chunkShape: [1], values: descending(10, 90, -0.25),
    })
    await writeArray(root.resolve('/lon'), {
      shape: [10], chunkShape: [1], values: descending(10, -180, 0.25),
    })
    const counting = { get: async (key) => { reads.push(key); return map.get(key) } }
    const countingRoot = zarr.root(counting)
    const array = await zarr.open(countingRoot.resolve('/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(countingRoot, array)
    expect(attrs['spatial:transform']).toEqual([0.25, 0, -180, 0, -0.25, 90])
    // Ten one-cell chunks per axis. Three samples need the first chunk, its
    // neighbour and the last, never the eight in between.
    const chunkReads = reads.filter(key => key.includes('/lat/c/'))
    expect(chunkReads.length).toBeLessThanOrEqual(3)
    expect(chunkReads).not.toContain('/lat/c/5')
  })

  it('does not call a projected grid EPSG:4326', async () => {
    // A rioxarray UTM store names its dimensions y and x. Reading its metres
    // as degrees would place the data at longitude 499980.
    const { root } = await cfStore({ dimensionNames: ['y', 'x'], yStep: -10, xStep: 10 })
    const array = await zarr.open(root.resolve('/tas'), { kind: 'array' })
    expect(await geoZarrAttrsFromCoordinates(root, array)).toBeNull()
  })

  it('reads a projected CRS from the CF grid-mapping array', async () => {
    const wkt = 'PROJCRS["WGS 84 / UTM zone 33N",ID["EPSG",32633]]'
    const { root } = await cfStore({
      dimensionNames: ['y', 'x'], yStep: -10, xStep: 10, attributes: { grid_mapping: 'spatial_ref' },
    })
    await writeArray(root.resolve('/spatial_ref'), {
      shape: [1], chunkShape: [1], values: [0], attributes: { crs_wkt: wkt },
    })
    const array = await zarr.open(root.resolve('/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(root, array)
    expect(attrs['proj:wkt2']).toBe(wkt)
    expect(attrs['proj:code']).toBeUndefined()
  })

  it('keeps a CRS the caller supplies', async () => {
    const { root } = await cfStore({ dimensionNames: ['y', 'x'], yStep: -10, xStep: 10 })
    const array = await zarr.open(root.resolve('/tas'), { kind: 'array' })
    const attrs = await geoZarrAttrsFromCoordinates(root, array, { crs: { code: 'EPSG:32633' } })
    expect(attrs['proj:code']).toBe('EPSG:32633')
  })
})

// A pyramid written as one group per level, each holding the data array beside
// the coordinate arrays that label it. This is how source.coop's italy-aerial
// store is laid out.
async function pyramidStore({ at = '/temperature', variable = 'temp', decoy = false } = {}) {
  const map = store()
  const root = zarr.root(map)
  await zarr.create(root)
  if (at !== '/') {
    await zarr.create(root.resolve(at), {
      attributes: { multiscales: { layout: [{ asset: '0' }, { asset: '1' }] } },
    })
  }
  for (const [level, size] of [['0', 4], ['1', 2]]) {
    const base = at === '/' ? `/${level}` : `${at}/${level}`
    await zarr.create(root.resolve(base))
    await writeArray(root.resolve(`${base}/${variable}`), {
      shape: [size, size], chunkShape: [size, size], dimensionNames: ['y', 'x'],
    })
    await writeArray(root.resolve(`${base}/y`), { shape: [size], chunkShape: [size] })
    await writeArray(root.resolve(`${base}/x`), { shape: [size], chunkShape: [size] })
  }
  if (decoy) {
    // An unrelated array at the store root that shares a level's name. A
    // resolver that treats the level path as absolute opens this instead.
    await writeArray(root.resolve('/0'), { shape: [9, 9], chunkShape: [9, 9] })
  }
  return { map, root }
}

describe('resolveLevelPaths', () => {
  it('returns an empty list for a store with no levels', async () => {
    const group = { path: '/', resolve: () => { throw new Error('should not resolve') } }
    expect(await resolveLevelPaths(group, [])).toEqual([])
  })

  it('resolves the level paths relative to the group that declares the pyramid', async () => {
    const { map, root } = await pyramidStore()
    const group = await zarr.open(zarr.root(listable(map)).resolve('/temperature'), { kind: 'group' })
    expect(root.path).toBe('/')
    expect(await resolveLevelPaths(group, [{ path: '0' }, { path: '1' }]))
      .toEqual(['0/temp', '1/temp'])
  })

  it('ignores a root node that shares a level name', async () => {
    const { map } = await pyramidStore({ decoy: true })
    const group = await zarr.open(zarr.root(listable(map)).resolve('/temperature'), { kind: 'group' })
    expect(await resolveLevelPaths(group, [{ path: '0' }, { path: '1' }]))
      .toEqual(['0/temp', '1/temp'])
  })

  it('leaves level paths alone when each one already names an array', async () => {
    const map = store()
    const root = zarr.root(map)
    await zarr.create(root)
    await zarr.create(root.resolve('/rgb'))
    await writeArray(root.resolve('/rgb/0'), { shape: [4, 4], chunkShape: [4, 4] })
    await writeArray(root.resolve('/rgb/1'), { shape: [2, 2], chunkShape: [2, 2] })
    const group = await zarr.open(zarr.root(listable(map)).resolve('/rgb'), { kind: 'group' })
    expect(await resolveLevelPaths(group, [{ path: '0' }, { path: '1' }])).toEqual(['0', '1'])
  })

  it('lists the children of a group whose path carries a trailing slash', async () => {
    // `resolve('')` is how the render path reaches the group of a single-level
    // store, and URL resolution leaves a trailing slash in the path.
    const map = store()
    const root = zarr.root(map)
    await zarr.create(root)
    await zarr.create(root.resolve('/rgb'))
    await writeArray(root.resolve('/rgb/data'), { shape: [4, 4], chunkShape: [4, 4] })
    await writeArray(root.resolve('/rgb/y'), { shape: [4], chunkShape: [4] })
    await writeArray(root.resolve('/rgb/x'), { shape: [4], chunkShape: [4] })
    const group = await zarr.open(zarr.root(listable(map)).resolve('/rgb').resolve(''), { kind: 'group' })
    expect(group.path).toBe('/rgb/')
    expect(await resolveLevelPaths(group, [{ path: '.' }])).toEqual(['data'])
  })

  it('opens the variable inside a level when the store cannot be listed', async () => {
    // Icechunk offers `listChildren`, not `contents`, and plain HTTP without
    // consolidated metadata lists nothing. The caller knows the variable, so
    // one direct open settles the layout.
    const { map } = await pyramidStore({ variable: 'rgba' })
    const group = await zarr.open(zarr.root(map).resolve('/temperature'), { kind: 'group' })
    expect(await resolveLevelPaths(group, [{ path: '0' }, { path: '1' }], 'rgba'))
      .toEqual(['0/rgba', '1/rgba'])
  })

  it('reports a level group it can find no data array in', async () => {
    const { map } = await pyramidStore()
    const group = await zarr.open(zarr.root(map).resolve('/temperature'), { kind: 'group' })
    await expect(resolveLevelPaths(group, [{ path: '0' }], 'missing'))
      .rejects.toThrow(/no single data array/)
  })
})

describe('openZarrRoot', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('opens a plain store over HTTP, consolidated metadata and all', async () => {
    const files = new Map([
      ['/zarr.json', JSON.stringify({
        zarr_format: 3, node_type: 'group', attributes: { 'proj:code': 'EPSG:4326' },
      })],
    ])
    vi.stubGlobal('fetch', async (input) => {
      const url = new URL(typeof input === 'string' ? input : input.url)
      const body = files.get(url.pathname.replace('/data.zarr', ''))
      return body ? new Response(body, { status: 200 }) : new Response(null, { status: 404 })
    })
    const root = await openZarrRoot('https://example.com/data.zarr')
    expect(root.kind).toBe('group')
    expect(root.attrs['proj:code']).toBe('EPSG:4326')
  })

  it('falls back to the plain reader when the Icechunk reader fails', async () => {
    const map = store()
    await zarr.create(zarr.root(map), { attributes: { marker: 'plain' } })
    vi.stubGlobal('fetch', async (input) => {
      const url = new URL(typeof input === 'string' ? input : input.url)
      const body = map.get(url.pathname.replace('/repo.icechunk', ''))
      return body ? new Response(body, { status: 200 }) : new Response(null, { status: 404 })
    })
    const deps = { icechunk: { IcechunkStore: { open: async () => { throw new Error('no repo') } } } }
    const root = await openZarrRoot('https://example.com/repo.icechunk', { icechunk: true, deps })
    expect(root.attrs.marker).toBe('plain')
  })
})

describe('unsupportedCodecs', () => {
  const encode = value => new TextEncoder().encode(JSON.stringify(value))

  // A v2 array, written as `.zarray` the way xarray and zarr-python do.
  function v2Array({ compressor = null, filters = null, order = 'C' } = {}) {
    const map = new Map([
      ['/.zgroup', encode({ zarr_format: 2 })],
      ['/tas/.zarray', encode({
        zarr_format: 2,
        shape: [4, 4],
        chunks: [2, 2],
        dtype: '<f8',
        compressor,
        filters,
        fill_value: null,
        order,
      })],
    ])
    return { get: async key => map.get(key) }
  }

  it('flags the compressor of a v2 store, which reads nothing from zarr.json', async () => {
    const backing = v2Array({ compressor: { id: 'gribberish' } })
    const array = await zarr.open(zarr.root(backing).resolve('/tas'), { kind: 'array' })
    expect(await unsupportedCodecs(array)).toEqual(['numcodecs.gribberish'])
  })

  it('passes a v2 store compressed with a codec zarrita has', async () => {
    const backing = v2Array({ compressor: { id: 'blosc', cname: 'zstd' }, filters: [{ id: 'shuffle' }] })
    const array = await zarr.open(zarr.root(backing).resolve('/tas'), { kind: 'array' })
    expect(await unsupportedCodecs(array)).toEqual([])
  })

  it('passes a v2 store whose filter zarrita translates', async () => {
    // zarrita rewrites `fixedscaleoffset` into codecs it implements, so
    // naming it after numcodecs would refuse a store it can read.
    const backing = v2Array({ filters: [{ id: 'fixedscaleoffset', scale: 10, offset: 0 }] })
    const array = await zarr.open(zarr.root(backing).resolve('/tas'), { kind: 'array' })
    expect(await unsupportedCodecs(array)).toEqual([])
  })

  it('passes a sharded v3 store, whose sharding zarrita implements itself', async () => {
    const backing = {
      // zarrita opens a sharded array only against a store that can read a
      // byte range, because a shard index is read before its chunks.
      getRange: async () => undefined,
      get: async key => new Map([
        ['/zarr.json', encode({ zarr_format: 3, node_type: 'group', attributes: {} })],
        ['/rgb/zarr.json', encode({
          zarr_format: 3,
          node_type: 'array',
          shape: [8, 8],
          data_type: 'uint8',
          chunk_grid: { name: 'regular', configuration: { chunk_shape: [8, 8] } },
          chunk_key_encoding: { name: 'default' },
          fill_value: 0,
          attributes: {},
          codecs: [{
            name: 'sharding_indexed',
            configuration: {
              chunk_shape: [4, 4],
              codecs: [{ name: 'bytes' }, { name: 'zstd' }],
              index_codecs: [{ name: 'bytes' }, { name: 'crc32c' }],
            },
          }],
        })],
      ]).get(key),
    }
    const array = await zarr.open(zarr.root(backing).resolve('/rgb'), { kind: 'array' })
    expect(await unsupportedCodecs(array)).toEqual([])
  })

  it('reads the metadata of an array whose path carries a trailing slash', async () => {
    const backing = {
      get: async key => new Map([
        ['/zarr.json', encode({ zarr_format: 3, node_type: 'group', attributes: {} })],
        ['/rgb/zarr.json', encode({
          zarr_format: 3,
          node_type: 'array',
          shape: [4, 4],
          data_type: 'float64',
          chunk_grid: { name: 'regular', configuration: { chunk_shape: [4, 4] } },
          chunk_key_encoding: { name: 'default' },
          fill_value: 0,
          attributes: {},
          codecs: [{ name: 'bytes' }, { name: 'gribberish' }],
        })],
      ]).get(key),
    }
    const array = await zarr.open(zarr.root(backing).resolve('/rgb').resolve(''), { kind: 'array' })
    expect(array.path).toBe('/rgb/')
    expect(await unsupportedCodecs(array)).toEqual(['gribberish'])
  })

  it('reports nothing when neither metadata document can be read', async () => {
    const array = { path: '/rgb', store: { get: async () => { throw new Error('offline') } } }
    expect(await unsupportedCodecs(array)).toEqual([])
  })
})

describe('zarrMinZoom', () => {
  it('is zero for a pyramid whose coarsest level is one chunk', () => {
    expect(zarrMinZoom({ chunksAcross: 1, worldFraction: 1 })).toBe(0)
  })

  it('is zero when the coarsest level fits the budget at a world view', () => {
    expect(zarrMinZoom({ chunksAcross: 6, worldFraction: 1 })).toBe(0)
  })

  it('holds back a level that would cost thousands of chunks at a world view', () => {
    // The FTW global store: one level, 4,007,517 pixels across in 4096-pixel
    // chunks, covering the whole world.
    const chunksAcross = Math.ceil(4007517 / 4096)
    const zoom = zarrMinZoom({ chunksAcross, worldFraction: 1, chunkPixels: 4096 * 4096 })
    expect(zoom).toBeGreaterThan(5)
    expect(Number.isFinite(zoom)).toBe(true)
  })

  it('bounds pixels as well as requests', () => {
    // The same chunk count, chunked large, costs far more pixels per view and
    // so needs more zoom than the request budget alone would ask for.
    const small = zarrMinZoom({ chunksAcross: 500, worldFraction: 1, chunkPixels: 256 * 256 })
    const large = zarrMinZoom({ chunksAcross: 500, worldFraction: 1, chunkPixels: 4096 * 4096 })
    expect(large).toBeGreaterThan(small)
  })

  it('still answers for a chunk larger than the whole pixel budget', () => {
    // One chunk is the least a view can ask for, so no zoom brings a chunk
    // this big inside the pixel budget. The request budget still applies.
    const zoom = zarrMinZoom({ chunksAcross: 500, worldFraction: 1, chunkPixels: 64 * 1024 * 1024 })
    expect(Number.isFinite(zoom)).toBe(true)
    expect(zoom).toBeGreaterThan(0)
  })

  it('draws a grid of small chunks at a world view', () => {
    // The GOES CONUS grid: 10 by 6 chunks of 250 pixels. Sixty requests and
    // 3.75 megapixels is cheap, so it is not held back.
    expect(zarrMinZoom({
      chunksAcross: 10, worldFraction: 55 / 360, chunkPixels: 250 * 250,
    })).toBe(0)
  })

  it('demands more zoom the finer the only level is', () => {
    const coarse = zarrMinZoom({ chunksAcross: 100, worldFraction: 1 })
    const fine = zarrMinZoom({ chunksAcross: 10000, worldFraction: 1 })
    expect(fine).toBeGreaterThan(coarse)
  })

  it('accounts for data that covers only part of the world', () => {
    // The same chunk count over a tenth of the world is ten times as dense, so
    // it needs more zoom before it is affordable.
    const global = zarrMinZoom({ chunksAcross: 1000, worldFraction: 1 })
    const local = zarrMinZoom({ chunksAcross: 1000, worldFraction: 0.1 })
    expect(local).toBeGreaterThan(global)
  })

  it('leaves a small dataset alone however finely it is chunked', () => {
    // Six chunks across is within the budget, so a dataset covering a city
    // block draws at a world view rather than being held back.
    expect(zarrMinZoom({ chunksAcross: 6, worldFraction: 0.0001 })).toBe(0)
  })

  it('never returns a negative zoom', () => {
    expect(zarrMinZoom({ chunksAcross: 1, worldFraction: 0.001 })).toBeGreaterThanOrEqual(0)
  })

  it('is zero for metadata it cannot measure', () => {
    expect(zarrMinZoom({ chunksAcross: 0, worldFraction: 1 })).toBe(0)
    expect(zarrMinZoom({ chunksAcross: 10, worldFraction: 0 })).toBe(0)
  })
})

describe('zarrZoomGuard', () => {
  const chunk = { width: 4096, height: 4096 }

  it('reports a single-level store as having no overviews', () => {
    const meta = { levels: [{ arrayWidth: 4007517, arrayHeight: 1566049 }] }
    const guard = zarrZoomGuard(meta, [chunk], [-180, -57, 180, 84])
    expect(guard.hasOverviews).toBe(false)
    expect(guard.minZoom).toBeGreaterThan(0)
  })

  it('lets a full pyramid draw from a world view', () => {
    // italy-aerial: 12 levels, the coarsest a single chunk.
    const levels = Array.from({ length: 12 }, (_, i) => ({
      arrayWidth: Math.ceil(2244608 / 2 ** i),
      arrayHeight: Math.ceil(2899968 / 2 ** i),
    }))
    const chunks = levels.map(() => ({ width: 1024, height: 1024 }))
    const guard = zarrZoomGuard({ levels }, chunks, [6.6, 35.5, 18.6, 47.1])
    expect(guard.hasOverviews).toBe(true)
    expect(guard.minZoom).toBe(0)
  })

  it('measures the coarsest level, not the finest', () => {
    const levels = [
      { arrayWidth: 100000, arrayHeight: 100000 },
      { arrayWidth: 1000, arrayHeight: 1000 },
    ]
    const chunks = [{ width: 1024, height: 1024 }, { width: 1024, height: 1024 }]
    expect(zarrZoomGuard({ levels }, chunks, [-180, -90, 180, 90]).minZoom).toBe(0)
  })

  it('survives metadata with no levels', () => {
    expect(zarrZoomGuard({ levels: [] }, [], null)).toEqual({ minZoom: 0, hasOverviews: false })
    expect(zarrZoomGuard(null, [], null)).toEqual({ minZoom: 0, hasOverviews: false })
  })

  it('finds the coarsest level however the store orders them', () => {
    // GeoZarr 0.4 mandates coarsest first, and the multiscales convention
    // states no order at all, so position cannot settle which level is which.
    const fine = { arrayWidth: 100000, arrayHeight: 100000 }
    const coarse = { arrayWidth: 1000, arrayHeight: 1000 }
    const chunks = [{ width: 1024, height: 1024 }, { width: 1024, height: 1024 }]
    expect(zarrZoomGuard({ levels: [coarse, fine] }, chunks, [-180, -90, 180, 90]).minZoom).toBe(0)
    expect(zarrZoomGuard({ levels: [fine, coarse] }, chunks, [-180, -90, 180, 90]).minZoom).toBe(0)
  })

  it('pairs the coarsest level with its own chunk size', () => {
    // The chunk sizes run parallel to the levels, so a coarsest level listed
    // first must be measured with the first chunk size, not the last.
    const levels = [
      { arrayWidth: 1024, arrayHeight: 1024 },
      { arrayWidth: 1048576, arrayHeight: 1048576 },
    ]
    const chunks = [{ width: 16, height: 16 }, { width: 4096, height: 4096 }]
    // 1024 pixels in 16-pixel chunks is 64 chunks across, and 256 small chunks
    // afford 16 of them across a view, so the view has to narrow four times.
    // The last chunk size would make the same level one chunk wide and the
    // last level 256 chunks wide: neither answers 4.
    expect(zarrZoomGuard({ levels }, chunks, [-180, -90, 180, 90]).minZoom).toBe(4)
  })

  it('measures an antimeridian box by the span it covers', () => {
    // RFC 7946 puts the west edge east of the east edge for a box that
    // crosses the antimeridian. Subtracting then measures the rest of the
    // world, and the guard would let a global-resolution store draw at a
    // world view.
    const meta = { levels: [{ arrayWidth: 400000, arrayHeight: 200000 }] }
    const crossing = zarrZoomGuard(meta, [chunk], [170, -10, -170, 10])
    const equivalent = zarrZoomGuard(meta, [chunk], [0, -10, 20, 10])
    expect(crossing.minZoom).toBe(equivalent.minZoom)
    expect(crossing.minZoom).toBeGreaterThan(zarrZoomGuard(meta, [chunk], [-180, -90, 180, 90]).minZoom)
  })
})

describe('withMultiscalesLayout', () => {
  // The array form, as the FTW global prediction store writes it. Each entry
  // names the level group in `path`.
  const ftw = {
    'proj:code': 'EPSG:4326',
    'spatial:dimensions': ['y', 'x'],
    'spatial:registration': 'pixel',
    'spatial:transform': [0.0000898311982, 0, -180, 0, -0.0000898311982, 83.748345],
    'spatial:shape': [1566049, 4007517],
    multiscales: [{
      tile_matrix_set: 'WGS84Quad',
      resampling_method: 'average',
      datasets: [
        {
          path: '.',
          factor: 1,
          crs: 'EPSG:4326',
          'spatial:transform': [0.0000898311982, 0, -180, 0, -0.0000898311982, 83.748345],
          'spatial:shape': [1566049, 4007517],
        },
        {
          path: '2x',
          factor: 2,
          crs: 'EPSG:4326',
          'spatial:transform': [0.0001796623964, 0, -180, 0, -0.0001796623964, 83.748345],
          'spatial:shape': [783025, 2003759],
        },
      ],
    }],
  }

  it('turns the array form into the layout the convention defines', () => {
    const attrs = withMultiscalesLayout(ftw)
    expect(attrs.multiscales.layout).toHaveLength(2)
    expect(attrs.multiscales.layout[0].asset).toBe('.')
    expect(attrs.multiscales.layout[1].asset).toBe('2x')
    expect(attrs.multiscales.layout[1]['spatial:shape']).toEqual([783025, 2003759])
    expect(attrs.multiscales.resampling_method).toBe('average')
  })

  it('keeps every other attribute as it was', () => {
    const attrs = withMultiscalesLayout(ftw)
    expect(attrs['proj:code']).toBe('EPSG:4326')
    expect(attrs['spatial:shape']).toEqual([1566049, 4007517])
  })

  it('parses into one level per dataset', async () => {
    const { parseGeoZarrMetadata } = await import('@developmentseed/geozarr')
    const meta = parseGeoZarrMetadata(withMultiscalesLayout(ftw))
    expect(meta.levels).toHaveLength(2)
    expect(meta.levels.map(l => l.path)).toEqual(['.', '2x'])
  })

  it('leaves the object form alone', () => {
    const declared = { multiscales: { layout: [{ asset: '0' }, { asset: '1' }] } }
    expect(withMultiscalesLayout(declared)).toBe(declared)
  })

  it('leaves attributes with no multiscales alone', () => {
    const plain = { 'proj:code': 'EPSG:3857' }
    expect(withMultiscalesLayout(plain)).toBe(plain)
    expect(withMultiscalesLayout(null)).toBe(null)
  })

  it('ignores an array form that names no datasets', () => {
    const empty = { multiscales: [{ tile_matrix_set: 'WGS84Quad' }] }
    expect(withMultiscalesLayout(empty)).toBe(empty)
  })

  it('orders the levels finest first whatever order the store lists them in', () => {
    const coarsestFirst = { ...ftw, multiscales: [{
      ...ftw.multiscales[0],
      datasets: [...ftw.multiscales[0].datasets].reverse(),
    }] }
    const attrs = withMultiscalesLayout(coarsestFirst)
    expect(attrs.multiscales.layout.map(level => level.asset)).toEqual(['.', '2x'])
  })
})

// The convention marks the per-level spatial metadata optional, so a store may
// state only how each level was resampled. These are the convention's own
// examples, at
// https://github.com/zarr-conventions/multiscales/tree/main/examples.
describe('withMultiscalesLayout, per-level metadata the convention leaves out', () => {
  const scaled = (asset, scale, derivedFrom) => ({
    asset,
    ...(derivedFrom ? { derived_from: derivedFrom } : {}),
    transform: { scale: [scale, scale], translation: [0, 0] },
  })

  it('derives the shape and the transform from the group and the level scale', () => {
    const attrs = withMultiscalesLayout({
      'proj:code': 'EPSG:32632',
      'spatial:dimensions': ['y', 'x'],
      'spatial:transform': [10, 0, 500000, 0, -10, 5000000],
      'spatial:shape': [1024, 2048],
      multiscales: {
        layout: [scaled('0', 1), scaled('1', 2, '0'), scaled('2', 2, '1')],
        resampling_method: 'average',
      },
    })
    const { layout } = attrs.multiscales
    expect(layout.map(level => level['spatial:shape']))
      .toEqual([[1024, 2048], [512, 1024], [256, 512]])
    expect(layout[2]['spatial:transform']).toEqual([40, 0, 500000, 0, -40, 5000000])
    expect(attrs.multiscales.resampling_method).toBe('average')
  })

  it('reads the level scale as relative to its source level', () => {
    // The convention states scale as "the coordinate transformation from the
    // source level (derived_from) to this level", so a chain multiplies.
    const attrs = withMultiscalesLayout({
      'spatial:dimensions': ['y', 'x'],
      'spatial:transform': [10, 0, 0, 0, -10, 0],
      'spatial:shape': [900, 900],
      multiscales: { layout: [scaled('r10m', 1), scaled('r20m', 2, 'r10m'), scaled('r60m', 3, 'r20m')] },
    })
    expect(attrs.multiscales.layout.map(level => level['spatial:shape']))
      .toEqual([[900, 900], [450, 450], [150, 150]])
  })

  it('takes a missing shape from the bounding box and the level transform', () => {
    // The convention's geospatial-pyramid example: every level states its own
    // transform, none states a shape, and the group states its extent.
    const attrs = withMultiscalesLayout({
      'proj:code': 'EPSG:32632',
      'spatial:dimensions': ['Y', 'X'],
      'spatial:transform': [10, 0, 500000, 0, -10, 5000000],
      'spatial:bbox': [500000, 4900000, 600000, 5000000],
      multiscales: {
        layout: [
          { ...scaled('0', 1), 'spatial:transform': [10, 0, 500000, 0, -10, 5000000] },
          { ...scaled('1', 2, '0'), 'spatial:transform': [20, 0, 500000, 0, -20, 5000000] },
          { ...scaled('2', 2, '1'), 'spatial:transform': [40, 0, 500000, 0, -40, 5000000] },
        ],
        resampling_method: 'average',
      },
    })
    expect(attrs.multiscales.layout.map(level => level['spatial:shape']))
      .toEqual([[10000, 10000], [5000, 5000], [2500, 2500]])
  })

  it('parses the convention DEM example, whose finest level is listed last', async () => {
    const { parseGeoZarrMetadata } = await import('@developmentseed/geozarr')
    const attrs = withMultiscalesLayout({
      'proj:code': 'EPSG:4326',
      'spatial:dimensions': ['latitude', 'longitude'],
      'spatial:transform': [0.000277778, 0, -180, 0, -0.000277778, 90],
      'spatial:bbox': [-180, -90, 180, 90],
      multiscales: {
        layout: [
          { ...scaled('dem_30m', 1), 'spatial:transform': [0.000277778, 0, -180, 0, -0.000277778, 90] },
          { ...scaled('dem_90m', 3, 'dem_30m'), 'spatial:transform': [0.000833334, 0, -180, 0, -0.000833334, 90] },
          { ...scaled('dem_270m', 3, 'dem_90m'), 'spatial:transform': [0.0025, 0, -180, 0, -0.0025, 90] },
          { ...scaled('dem_10m_superres', 0.333, 'dem_30m'), 'spatial:transform': [0.000092593, 0, -180, 0, -0.000092593, 90] },
        ],
        resampling_method: 'cubic',
      },
    })
    const meta = parseGeoZarrMetadata(attrs)
    expect(meta.levels.map(level => level.path))
      .toEqual(['dem_10m_superres', 'dem_30m', 'dem_90m', 'dem_270m'])
    const widths = meta.levels.map(level => level.arrayWidth)
    expect([...widths].sort((a, b) => b - a)).toEqual(widths)
  })

  it('leaves the convention Sentinel-2 example as it is', () => {
    const sentinel = {
      'proj:code': 'EPSG:32633',
      'spatial:dimensions': ['Y', 'X'],
      'spatial:bbox': [500000, 4900000, 600000, 5000000],
      multiscales: {
        layout: [
          { ...scaled('r10m', 1), 'spatial:transform': [10, 0, 500000, 0, -10, 5000000], 'spatial:shape': [10980, 10980] },
          { ...scaled('r20m', 2, 'r10m'), 'spatial:transform': [20, 0, 500000, 0, -20, 5000000], 'spatial:shape': [5490, 5490] },
          { ...scaled('r60m', 3, 'r20m'), 'spatial:transform': [60, 0, 500000, 0, -60, 5000000], 'spatial:shape': [1830, 1830] },
        ],
      },
    }
    expect(withMultiscalesLayout(sentinel)).toBe(sentinel)
  })

  it('leaves a level alone when the arithmetic is not well defined', () => {
    // The convention's array-based-pyramid example shifts each level's origin
    // by half a cell of its source, in units the convention does not pin
    // down, and states no spatial metadata at all.
    const shifted = {
      'spatial:dimensions': ['y', 'x'],
      'spatial:transform': [10, 0, 0, 0, -10, 0],
      'spatial:shape': [1024, 1024],
      multiscales: {
        layout: [
          { asset: '0/data', transform: { scale: [1, 1] } },
          { asset: '1/data', derived_from: '0/data', transform: { scale: [2, 2], translation: [0.5, 0.5] } },
        ],
      },
    }
    const attrs = withMultiscalesLayout(shifted)
    expect(attrs.multiscales.layout[0]['spatial:shape']).toEqual([1024, 1024])
    expect(attrs.multiscales.layout[1]['spatial:shape']).toBeUndefined()
    expect(attrs.multiscales.layout[1]['spatial:transform']).toBeUndefined()
  })

  it('leaves a pyramid alone when the group describes no grid', () => {
    // The convention's domain-agnostic examples carry no spatial conventions,
    // so there is no arithmetic to do and nothing to draw either.
    const generic = {
      multiscales: {
        layout: [scaled('0', 1), scaled('1', 2, '0'), scaled('2', 4, '1')],
        resampling_method: 'average',
      },
    }
    expect(withMultiscalesLayout(generic)).toBe(generic)
  })

  it('stops at a derived_from cycle rather than following it', () => {
    const cyclic = {
      'spatial:dimensions': ['y', 'x'],
      'spatial:transform': [10, 0, 0, 0, -10, 0],
      'spatial:shape': [1024, 1024],
      multiscales: { layout: [scaled('a', 2, 'b'), scaled('b', 2, 'a')] },
    }
    expect(withMultiscalesLayout(cyclic)).toBe(cyclic)
  })
})

describe('declaresMultiscales', () => {
  it('is true for either spelling', () => {
    expect(declaresMultiscales({ multiscales: { layout: [{ asset: '0' }] } })).toBe(true)
    expect(declaresMultiscales({ multiscales: [{ datasets: [{ path: '.' }] }] })).toBe(true)
  })

  it('is false when the store declares none', () => {
    expect(declaresMultiscales({ 'proj:code': 'EPSG:4326' })).toBe(false)
    expect(declaresMultiscales(null)).toBe(false)
  })
})

describe('unusableCrs', () => {
  // The GOES-18 store's own definition, cut to the conversion. GDAL writes
  // the method name as "Geostationary Satellite (Sweep X)".
  const geostationary = 'PROJCRS["undefined",BASEGEOGCRS["undefined",DATUM["undefined",ELLIPSOID["undefined",6378137,298.257222096042,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]]],CONVERSION["unknown",METHOD["Geostationary Satellite (Sweep X)"],PARAMETER["Satellite height",35786023,LENGTHUNIT["metre",1]],PARAMETER["Latitude of natural origin",0,ANGLEUNIT["degree",0.0174532925199433]],PARAMETER["Longitude of natural origin",-137,ANGLEUNIT["degree",0.0174532925199433]],PARAMETER["False easting",0,LENGTHUNIT["metre",1]],PARAMETER["False northing",0,LENGTHUNIT["metre",1]]],CS[Cartesian,2],AXIS["(E)",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["(N)",north,ORDER[2],LENGTHUNIT["metre",1]]]'

  it('takes an EPSG code on trust', async () => {
    expect(await unusableCrs({ code: 'EPSG:4326' })).toBe(null)
  })

  it('accepts a geostationary grid', async () => {
    expect(await unusableCrs({ wkt2: geostationary })).toBe(null)
  })

  it('names the projection it cannot build', async () => {
    const unknown = geostationary.replace(
      'Geostationary Satellite (Sweep X)',
      'Hyperbolic Pseudo Mercator',
    )
    expect(await unusableCrs({ wkt2: unknown })).toBe('Hyperbolic Pseudo Mercator')
  })

  it('reports a store with no CRS at all', async () => {
    expect(await unusableCrs({})).toBe('none')
  })
})
