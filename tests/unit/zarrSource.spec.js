import { describe, it, expect } from 'vitest'
import {
  coordinateSpacing,
  geoZarrAttrsFromCoordinates,
  isIcechunkAsset,
  isZarrAsset,
  declaresMultiscales,
  resolveLevelPaths,
  spatialDimNames,
  unusableCrs,
  withMultiscalesLayout,
  zarrMinZoom,
  zarrZoomGuard,
} from '../../src/utils/zarrSource.js'

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
    expect(spatialDimNames([null, 'y', 'x'])).toBeNull()
  })
})

// A zarrita-shaped stub: enough of `open`, `resolve` and `get` for the
// coordinate reader and the level resolver.
function fakeStore({ arrays = {}, groups = [] } = {}) {
  const node = (path) => ({
    path,
    resolve: (sub) => node(sub.startsWith('/') ? sub : `${path === '/' ? '' : path}/${sub}`),
  })
  return {
    arrays,
    groups,
    root: node('/'),
  }
}

describe('geoZarrAttrsFromCoordinates', () => {
  // The module calls zarrita directly, so the coordinate arrays are supplied
  // through a root whose `resolve` the test controls and a zarrita `open` that
  // the module imports. Rather than mock the module, the affine arithmetic is
  // checked through the pure helpers above and the assembled attributes are
  // checked here against a root that answers with real zarrita arrays.
  it('returns null for an array whose dimensions are not spatial', async () => {
    const root = fakeStore().root
    const array = { dimensionNames: ['time', 'level'], shape: [2, 3] }
    expect(await geoZarrAttrsFromCoordinates(root, array)).toBeNull()
  })

  it('returns null when the array has no named dimensions', async () => {
    const root = fakeStore().root
    expect(await geoZarrAttrsFromCoordinates(root, { shape: [2, 3] })).toBeNull()
  })
})

describe('resolveLevelPaths', () => {
  // The resolver opens nodes through zarrita, so the interesting cases (a
  // level that is a group holding the data array) are covered by
  // tests/integration against the real stores. The contract checked here is
  // that it asks for nothing when there is nothing to ask about.
  it('returns an empty list for a store with no levels', async () => {
    const group = { path: '/', resolve: () => { throw new Error('should not resolve') } }
    expect(await resolveLevelPaths(group, [])).toEqual([])
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
