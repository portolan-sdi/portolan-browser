import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// --- An in-memory Zarr store ------------------------------------------------
//
// makeZarrLayerProps reaches a store two ways: through the zarrita module it is
// handed, and through utils/zarrSource, which imports zarrita itself. Both have
// to see the same store, so the module is mocked once and the mock is also what
// the tests pass in as `zarr`.
//
// `storeNodes` is the store: a path per node, groups and arrays together. A
// test sets it to the layout it is about, and no request is made for anything.
const fake = vi.hoisted(() => ({ nodes: {} }))

vi.mock('zarrita', () => {
  // zarrita resolves a path the way a URL does, so a bare name is relative to
  // the node and a leading slash is absolute from the store root. The level
  // paths depend on that difference, so the fake reproduces it exactly.
  const join = (base, path) => {
    const root = new URL(`file://${base.endsWith('/') ? base : `${base}/`}`)
    return decodeURIComponent(new URL(path, root).pathname)
  }
  const at = (path) => {
    const key = path.length > 1 ? path.replace(/\/+$/, '') : path
    return fake.nodes[key] ?? null
  }
  const backing = {
    // No codec metadata, so every store counts as decodable. A store that
    // needs to fail that check has its own test in zarrSource.spec.js.
    get: async () => undefined,
    contents: () => Object.entries(fake.nodes).map(([path, spec]) => ({ path, kind: spec.kind })),
  }
  const handle = path => ({ path, store: backing, resolve: p => handle(join(path, p)) })
  const open = async (target, options) => {
    const path = target?.path ?? '/'
    const spec = at(path)
    if (!spec) {throw new Error(`zarrita: nothing at ${path}`)}
    if (options?.kind && options.kind !== spec.kind) {
      throw new Error(`zarrita: ${path} is a ${spec.kind}, not a ${options.kind}`)
    }
    return { ...spec, path, store: backing, resolve: p => handle(join(path, p)) }
  }
  class FetchStore {
    constructor(url) { this.url = url }
  }
  return {
    FetchStore,
    open,
    registry: new Map(),
    root: () => handle('/'),
    // A coordinate read. The reader asks for three cell centres in two slices,
    // so the slice has to be honoured: the last one is what says whether the
    // axis is regularly spaced.
    get: async (array, selection) => {
      const values = array.values ?? []
      const slice = selection?.[0]
      return {
        data: typeof slice?.start === 'number' ? values.slice(slice.start, slice.stop) : values,
      }
    },
    slice: (start, stop) => ({ start, stop }),
    withRangeCoalescing: store => store,
    withMaybeConsolidatedMetadata: store => store,
  }
})

// The render the tile loader was built with. It is the one thing that says how
// a variable will be coloured, and it is otherwise closed over inside the
// loader, so the loader is stubbed and the render recorded.
const tileRenders = vi.hoisted(() => ({ calls: [] }))
vi.mock('../../src/utils/renders.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    makeZarrRenderTileLoader: (render) => {
      tileRenders.calls.push(render)
      return { getTileData: () => null, renderTile: () => null }
    },
  }
})

import * as fakeZarr from 'zarrita'
import { parseGeoZarrMetadata } from '@developmentseed/geozarr'
import {
  chunkAmplification,
  defaultVariable,
  describesArray,
  makeZarrLayerProps,
  zarrDescriptors,
  zarrDimensionFault,
  zarrSelection,
  zarrVariables,
  ZARR_NOTICE_ERROR,
  ZARR_NOTICE_NO_GEO,
  ZARR_NOTICE_ORDER,
} from '../../src/utils/zarrLayers.js'
import { zarrZoomGuard } from '../../src/utils/zarrSource.js'

// The five variables of the GOES fire-characterisation store, as its Portolan
// catalog writes them on the asset.
const goesAsset = {
  key: 'icechunk',
  type: 'application/vnd.zarr; version=3',
  getKey: () => 'icechunk',
  bands: [
    { name: 'Area', description: 'Fire Area', unit: 'm2', data_type: 'uint16', nodata: 65535 },
    { name: 'DQF', description: 'Data quality flags', unit: '1', data_type: 'uint8', nodata: 255 },
    { name: 'Mask', description: 'Fire Mask', unit: '1', data_type: 'int16', nodata: -99 },
    { name: 'Power', description: 'Fire Radiative Power', unit: 'MW', data_type: 'float32', nodata: -9 },
    { name: 'Temp', description: 'Fire Temperature', unit: 'K', data_type: 'uint16', nodata: 65535 },
  ],
}

// The render the same catalog declares for that asset.
const frpRender = {
  title: 'Fire radiative power (MW)',
  assets: ['icechunk'],
  rescale: [[0, 200]],
  colormap_name: 'inferno',
  nodata: -9,
}

describe('chunkAmplification', () => {
  it('is one for a store chunked for display', () => {
    // GOES: [1, 250, 250], one time step per chunk.
    expect(chunkAmplification([1, 250, 250], [1])).toBe(1)
  })

  it('is one when every index of a chunked dimension is used', () => {
    // italy-aerial: [4, 1024, 1024] with all four colour bands drawn.
    expect(chunkAmplification([4, 1024, 1024], [4])).toBe(1)
  })

  it('counts the waste of a time-series chunking', () => {
    // dynamical.org GFS: [1440, 50, 50], and the map draws one time step.
    expect(chunkAmplification([1440, 50, 50], [1])).toBe(1440)
  })

  it('multiplies across several wasted dimensions', () => {
    expect(chunkAmplification([10, 4, 100, 100], [1, 1])).toBe(40)
  })

  it('is one for a plain two-dimensional array', () => {
    expect(chunkAmplification([512, 512], [])).toBe(1)
  })

  it('treats a partly used dimension proportionally', () => {
    expect(chunkAmplification([8, 100, 100], [4])).toBe(2)
  })

  it('ignores a malformed chunk length rather than dividing by zero', () => {
    expect(chunkAmplification([0, 100, 100], [1])).toBe(1)
  })
})

describe('zarrVariables', () => {
  it('reads the variables from the asset bands', () => {
    const vars = zarrVariables(goesAsset, null)
    expect(vars.map(v => v.name)).toEqual(['Area', 'DQF', 'Mask', 'Power', 'Temp'])
    expect(vars[3]).toMatchObject({ name: 'Power', nodata: -9, unit: 'MW' })
    expect(vars[3].title).toBe('Fire Radiative Power')
  })

  it('prefers cube:variables, which name each variable\'s dimensions', () => {
    const asset = {
      'cube:variables': {
        temperature_2m: {
          type: 'data',
          dimensions: ['time', 'latitude', 'longitude'],
          long_name: '2 metre temperature',
          unit: 'degree_Celsius',
        },
        latitude: { type: 'auxiliary', dimensions: ['latitude'] },
      },
    }
    const vars = zarrVariables(asset, null)
    expect(vars).toHaveLength(1)
    expect(vars[0]).toMatchObject({ name: 'temperature_2m', title: '2 metre temperature' })
  })

  it('reads cube:variables from the collection when the asset has none', () => {
    const stac = {
      'cube:variables': {
        precip: { type: 'data', dimensions: ['time', 'y', 'x'], long_name: 'Precipitation' },
      },
    }
    expect(zarrVariables({ key: 'data' }, stac).map(v => v.name)).toEqual(['precip'])
  })

  it('leaves out a variable with no grid to draw', () => {
    const asset = {
      'cube:variables': {
        series: { type: 'data', dimensions: ['time'], long_name: 'A time series' },
        grid: { type: 'data', dimensions: ['y', 'x'], long_name: 'A grid' },
      },
    }
    expect(zarrVariables(asset, null).map(v => v.name)).toEqual(['grid'])
  })

  it('leaves out the coordinate arrays', () => {
    const asset = {
      'cube:variables': {
        time: { type: 'data', dimensions: ['time', 'y', 'x'] },
        spatial_ref: { type: 'data', dimensions: ['y', 'x'] },
        real: { type: 'data', dimensions: ['y', 'x'] },
      },
    }
    expect(zarrVariables(asset, null).map(v => v.name)).toEqual(['real'])
  })

  it('returns nothing for a store STAC does not describe', () => {
    expect(zarrVariables({ key: 'data' }, null)).toEqual([])
  })

  it('fills what the datacube extension does not carry from the asset bands', () => {
    // The live GOES-18 asset: `cube:variables` names the five variables and
    // their dimensions, and `bands` holds the no-data value and the statistics.
    // The datacube extension gained `nodata` only in 2.3.0 and carries no
    // statistics at all, so reading one instead of the other left every
    // variable without a sentinel and without a range.
    const asset = {
      ...goesAsset,
      'cube:variables': {
        Area: { type: 'data', dimensions: ['time', 'y', 'x'] },
        DQF: { type: 'data', dimensions: ['time', 'y', 'x'] },
        Mask: { type: 'data', dimensions: ['time', 'y', 'x'] },
        Power: { type: 'data', dimensions: ['time', 'y', 'x'], unit: 'MW' },
        Temp: { type: 'data', dimensions: ['time', 'y', 'x'] },
      },
    }
    const vars = zarrVariables(asset, null)
    expect(vars.map(v => v.nodata)).toEqual([65535, 255, -99, -9, 65535])
    expect(vars[3]).toMatchObject({
      name: 'Power',
      title: 'Fire Radiative Power',
      unit: 'MW',
      dataType: 'float32',
    })
    // Which is what lets the render find the variable it was written for.
    expect(defaultVariable(vars, frpRender).name).toBe('Power')
  })

  it('prefers what the datacube extension does carry', () => {
    const asset = {
      bands: [{ name: 'temp', description: 'From the bands', nodata: 0, unit: 'K' }],
      'cube:variables': {
        temp: {
          type: 'data',
          dimensions: ['y', 'x'],
          long_name: 'From cube:variables',
          nodata: -999,
        },
      },
    }
    expect(zarrVariables(asset, null)[0]).toMatchObject({
      title: 'From cube:variables',
      nodata: -999,
      unit: 'K',
    })
  })

  it('carries a variable\'s declared statistics through', () => {
    const asset = {
      bands: [{ name: 'Power', statistics: { minimum: 0, maximum: 200 } }],
      'cube:variables': { Power: { type: 'data', dimensions: ['time', 'y', 'x'] } },
    }
    expect(zarrVariables(asset, null)[0].statistics).toEqual({ minimum: 0, maximum: 200 })
  })
})

describe('defaultVariable', () => {
  it('picks the variable the render was written for, by its nodata value', () => {
    const vars = zarrVariables(goesAsset, null)
    expect(defaultVariable(vars, frpRender).name).toBe('Power')
  })

  it('falls back to the first variable when no nodata matches', () => {
    const vars = zarrVariables(goesAsset, null)
    expect(defaultVariable(vars, { nodata: -12345 }).name).toBe('Area')
  })

  it('falls back to the first variable with no render at all', () => {
    const vars = zarrVariables(goesAsset, null)
    expect(defaultVariable(vars, null).name).toBe('Area')
  })

  it('matches a render whose nodata is a list', () => {
    const vars = zarrVariables(goesAsset, null)
    expect(defaultVariable(vars, { nodata: [0, -99] }).name).toBe('Mask')
  })

  it('returns null when there are no variables', () => {
    expect(defaultVariable([], frpRender)).toBeNull()
  })
})

describe('zarrDescriptors', () => {
  it('makes one descriptor per variable and prefers the rendered one', () => {
    const descs = zarrDescriptors(goesAsset, null, frpRender)
    expect(descs).toHaveLength(5)
    expect(descs.map(d => d.kind)).toEqual(Array(5).fill('zarr'))
    expect(descs.map(d => d.id)).toEqual([
      'zarr:icechunk:Area', 'zarr:icechunk:DQF', 'zarr:icechunk:Mask',
      'zarr:icechunk:Power', 'zarr:icechunk:Temp',
    ])
    expect(descs.filter(d => d.preferred).map(d => d.variable.name)).toEqual(['Power'])
  })

  it('narrows the render to each variable\'s own no-data value', () => {
    const descs = zarrDescriptors(goesAsset, null, frpRender)
    const mask = descs.find(d => d.variable.name === 'Mask')
    // The render's own -9 stays, and the Mask variable's -99 is added, so one
    // variable's sentinel is never drawn as another's data.
    expect(mask.render.nodata).toEqual([-9, -99])
    expect(mask.render.colormap_name).toBe('inferno')
  })

  it('keeps a variable\'s no-data value even with no render', () => {
    const descs = zarrDescriptors(goesAsset, null, null)
    expect(descs.find(d => d.variable.name === 'Power').render).toEqual({ nodata: [-9] })
  })

  it('leaves the render alone for a variable with no declared no-data', () => {
    const asset = { key: 'data', getKey: () => 'data', bands: [{ name: 'b' }] }
    expect(zarrDescriptors(asset, null, frpRender)[0].render).toBe(frpRender)
  })

  it('titles a single-variable store after the asset', () => {
    const asset = {
      key: 'data',
      getKey: () => 'data',
      title: 'Sentinel-2 composite',
      bands: [{ name: 'reflectance', description: 'Surface reflectance' }],
    }
    const descs = zarrDescriptors(asset, null, null)
    expect(descs).toHaveLength(1)
    expect(descs[0].title).toBe('Sentinel-2 composite')
  })

  it('makes one unnamed descriptor for a store STAC does not describe', () => {
    const asset = { key: 'data', getKey: () => 'data', title: 'A Zarr store' }
    const descs = zarrDescriptors(asset, null, null)
    expect(descs).toEqual([{
      kind: 'zarr',
      id: 'zarr:data',
      asset,
      variable: null,
      title: 'A Zarr store',
      render: null,
    }])
  })
})

describe('describesArray', () => {
  // The GOES store's root states this grid. Each fire variable is a
  // [time, y, x] array over the same two spatial dimensions.
  const meta = { levels: [{ path: '.', arrayWidth: 2500, arrayHeight: 1500 }] }

  it('accepts a description that matches the two spatial dimensions', () => {
    expect(describesArray(meta, { shape: [3996, 1500, 2500] })).toBe(true)
    expect(describesArray(meta, { shape: [1500, 2500] })).toBe(true)
  })

  it('rejects a description of a different grid', () => {
    expect(describesArray(meta, { shape: [3996, 1200, 2500] })).toBe(false)
    expect(describesArray(meta, { shape: [3996, 2500, 1500] })).toBe(false)
  })

  it('rejects metadata or an array it cannot read', () => {
    expect(describesArray(null, { shape: [1500, 2500] })).toBe(false)
    expect(describesArray({ levels: [] }, { shape: [1500, 2500] })).toBe(false)
    expect(describesArray(meta, { shape: [2500] })).toBe(false)
    expect(describesArray(meta, {})).toBe(false)
  })
})

describe('zarrSelection', () => {
  it('pins a named dimension at its true shape index, past an unnamed one', () => {
    // A v3 array may leave a dimension unnamed. Filtering the names first made
    // `time` index 1 of the list and so index 1 of the shape, which pinned it
    // to 99 of a 100-step axis — no, to 2 of the 3-step axis beside it.
    const { selection, used } = zarrSelection([null, 'time', 'y', 'x'], [3, 100, 500, 500])
    expect(selection).toEqual({ time: 99 })
    // One entry per non-spatial dimension, in the order of the chunk shape, so
    // the chunk waste of each axis is measured against that axis.
    expect(used).toEqual([1, 1])
  })

  it('pins a time axis to its most recent slice', () => {
    expect(zarrSelection(['time', 'y', 'x'], [3996, 1500, 2500]).selection).toEqual({ time: 3995 })
  })

  it('takes every band of a band axis', () => {
    const { selection, used } = zarrSelection(['band', 'y', 'x'], [4, 1024, 1024])
    expect(selection).toEqual({ band: null })
    expect(used).toEqual([4])
  })

  it('selects nothing for a plain two-dimensional array', () => {
    expect(zarrSelection(['y', 'x'], [512, 512])).toEqual({ selection: {}, used: [] })
  })

  it('selects nothing for an array that names no dimensions', () => {
    expect(zarrSelection(undefined, [512, 512])).toEqual({ selection: {}, used: [] })
  })
})

describe('zarrDimensionFault', () => {
  const meta = { axes: ['y', 'x'], yAxisIndex: 0, xAxisIndex: 1 }

  it('accepts an array whose last two dimensions are the spatial ones', () => {
    expect(zarrDimensionFault(meta, {
      shape: [3, 512, 512], dimensionNames: ['time', 'y', 'x'],
    })).toBeNull()
  })

  it('refuses an array with no grid', () => {
    expect(zarrDimensionFault(meta, { shape: [512], dimensionNames: ['x'] }))
      .toMatch(/no grid/)
    expect(zarrDimensionFault(meta, {})).toMatch(/no grid/)
  })

  it('refuses an unnamed dimension, which ZarrLayer cannot slice', () => {
    expect(zarrDimensionFault(meta, {
      shape: [3, 512, 512], dimensionNames: [null, 'y', 'x'],
    })).toMatch(/dimension 0 .* no name/)
  })

  it('refuses spatial dimensions that are not the last two', () => {
    const fault = zarrDimensionFault(meta, {
      shape: [512, 512, 3], dimensionNames: ['y', 'x', 'time'],
    })
    expect(fault).toContain('"y"')
    expect(fault).toContain('y, x, time')
  })

  it('refuses a swapped spatial order, which the browser cannot transpose', () => {
    expect(zarrDimensionFault(meta, {
      shape: [3, 512, 512], dimensionNames: ['time', 'x', 'y'],
    })).toMatch(/transpose/)
  })

  it('says nothing about an array the metadata names no axes for', () => {
    // A store described from its coordinate arrays takes those names from the
    // array's own last two dimensions, so there is nothing to disagree with.
    expect(zarrDimensionFault({}, { shape: [512, 512] })).toBeNull()
    expect(zarrDimensionFault(null, { shape: [512, 512] })).toBeNull()
  })
})

describe('makeZarrLayerProps', () => {
  const url = 'https://example.com/fire.zarr'
  const bbox = [-130, 20, -60, 55]
  const crs = { code: 'EPSG:3857' }
  let parse
  let warn

  // The parser is injected, so each test states what the attributes parse to
  // rather than writing a document for the real schema validator. The real
  // parser throws on a document it cannot read, and so does this one.
  const deps = () => ({
    parseGeoZarrMetadata: attrs => parse(attrs),
    // Every store here is a plain one, and the Icechunk fallback must not
    // reach for the real reader.
    icechunk: { IcechunkStore: { open: async () => { throw new Error('not a repository') } } },
  })
  const open = (descriptor, box = bbox) =>
    makeZarrLayerProps(descriptor, { zarr: fakeZarr, bbox: box, deps: deps() })

  const gridAttrs = {
    'spatial:dimensions': ['y', 'x'],
    'spatial:transform': [10, 0, 0, 0, -10, 0],
    'proj:code': 'EPSG:3857',
  }
  const oneLevel = {
    levels: [{ path: '.', arrayWidth: 512, arrayHeight: 512 }],
    axes: ['y', 'x'],
    yAxisIndex: 0,
    xAxisIndex: 1,
    crs,
  }
  // The GOES-18 layout: the grid is described once on the root group, and each
  // variable is a [time, y, x] array under it.
  const goesNodes = (dimensionNames = ['time', 'y', 'x']) => ({
    '/': { kind: 'group', attrs: gridAttrs },
    '/Power': {
      kind: 'array',
      attrs: {},
      shape: [3, 512, 512],
      chunks: [1, 256, 256],
      dtype: 'float32',
      dimensionNames,
    },
  })
  const fireAsset = (band) => ({
    key: 'icechunk',
    getKey: () => 'icechunk',
    href: url,
    getAbsoluteUrl: () => url,
    bands: [{ name: 'Power', description: 'Fire Radiative Power', ...band }],
  })

  beforeEach(() => {
    tileRenders.calls = []
    fake.nodes = {}
    // Only a document that carries a transform parses, which is what makes the
    // root's description win over the child array's empty attributes.
    parse = (attrs) => {
      if (!attrs?.['spatial:transform']) {throw new Error('no spatial:transform')}
      return oneLevel
    }
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
  })

  describe('what the variable is coloured with', () => {
    it('stretches the ramp to the declared statistics of a variable that also has a no-data value', async () => {
      // The GOES case. Both are declared, and the no-data value alone used to
      // count as "a render exists", so the statistics were never read and the
      // ramp spanned 0 to 1 — one flat colour over a 0 to 200 MW variable.
      fake.nodes = goesNodes()
      const asset = fireAsset({ nodata: -9, statistics: { minimum: 0, maximum: 200 } })
      const [descriptor] = zarrDescriptors(asset, null, null)
      expect(descriptor.render).toEqual({ nodata: [-9] })

      await open(descriptor)
      expect(tileRenders.calls.at(-1)).toEqual({
        colormap_name: 'viridis',
        rescale: [[0, 200]],
        nodata: [-9],
      })
      expect(warn).not.toHaveBeenCalled()
    })

    it('punches out the no-data value of a variable that declares no statistics', async () => {
      fake.nodes = goesNodes()
      const [descriptor] = zarrDescriptors(fireAsset({ nodata: -9 }), null, null)
      await open(descriptor)
      expect(tileRenders.calls.at(-1)).toEqual({ nodata: [-9] })
    })

    it('keeps a declared render, which states the colour the statistics only guess at', async () => {
      fake.nodes = goesNodes()
      const asset = fireAsset({ nodata: -9, statistics: { minimum: 0, maximum: 200 } })
      const declared = { assets: ['icechunk'], colormap_name: 'inferno', rescale: [[0, 50]] }
      const [descriptor] = zarrDescriptors(asset, null, declared)
      await open(descriptor)
      expect(tileRenders.calls.at(-1)).toMatchObject({
        colormap_name: 'inferno',
        rescale: [[0, 50]],
        nodata: [-9],
      })
    })

    it('reports a variable with neither a render nor statistics', async () => {
      fake.nodes = goesNodes()
      const [descriptor] = zarrDescriptors(fireAsset({}), null, null)
      await open(descriptor)
      expect(tileRenders.calls.at(-1)).toEqual({})
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no render'))
    })

    it('narrows a render that names more bands than the variable carries', async () => {
      // The EOPF Sentinel-2 store: one array per band, and a true-colour
      // render whose `bidx: [3, 2, 1]` names three of them. A Zarr variable is
      // one array, so the composite asked for bands 2 and 3 of a single-band
      // chunk — and the tile loader answered with nothing at all. The layer
      // was switched on, the map stayed blank, and no notice said why.
      fake.nodes = {
        '/': { kind: 'group', attrs: gridAttrs },
        '/b04': {
          kind: 'array',
          attrs: {},
          shape: [512, 512],
          chunks: [256, 256],
          dtype: 'uint16',
          dimensionNames: ['y', 'x'],
        },
      }
      await open({
        kind: 'zarr',
        id: 'zarr:reflectance:b04',
        asset: { key: 'reflectance', getKey: () => 'reflectance', href: url, getAbsoluteUrl: () => url },
        variable: { name: 'b04' },
        title: 'Red',
        render: { bidx: [3, 2, 1], rescale: [[0, 3000]] },
      })
      expect(tileRenders.calls.at(-1)).toMatchObject({ bidx: [1], rescale: [[0, 3000]] })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('names bands'))
    })

    it('keeps a render whose bands the variable does carry', async () => {
      fake.nodes = {
        '/': { kind: 'group', attrs: gridAttrs },
        '/rgb': {
          kind: 'array',
          attrs: {},
          shape: [3, 512, 512],
          chunks: [3, 256, 256],
          dtype: 'uint16',
          dimensionNames: ['band', 'y', 'x'],
        },
      }
      await open({
        kind: 'zarr',
        id: 'zarr:data:rgb',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: { name: 'rgb' },
        title: 'True colour',
        render: { bidx: [3, 2, 1], rescale: [[0, 3000]] },
      })
      expect(tileRenders.calls.at(-1)).toMatchObject({ bidx: [3, 2, 1] })
    })

    it('stretches a declared colormap that states no range to the statistics', async () => {
      // `colormap_name` alone counts as a render that states colour, so the
      // statistics route was skipped — and a render with no `rescale` leaves
      // the ramp on its default 0 to 1 range, which saturates a 0 to 200
      // variable to one flat colour. The collection said which colours to
      // use, not over what range.
      fake.nodes = goesNodes()
      const asset = fireAsset({ nodata: -9, statistics: { minimum: 0, maximum: 200 } })
      const declared = { assets: ['icechunk'], colormap_name: 'inferno' }
      const [descriptor] = zarrDescriptors(asset, null, declared)
      await open(descriptor)
      expect(tileRenders.calls.at(-1)).toMatchObject({
        colormap_name: 'inferno',
        rescale: [[0, 200]],
        nodata: [-9],
      })
    })

    it('keeps the variable\'s no-data value on a synthesized true-colour render', async () => {
      // An RGB picture needs no declared render, but it still needs to know
      // where the store holds nothing: the sentinel came from the variable and
      // was dropped on the way to the synthesized render, so an uncovered
      // pixel drew as colour.
      fake.nodes = {
        '/': { kind: 'group', attrs: gridAttrs },
        '/rgb': {
          kind: 'array',
          attrs: {},
          shape: [3, 512, 512],
          chunks: [3, 256, 256],
          dtype: 'uint8',
          dimensionNames: ['band', 'y', 'x'],
        },
      }
      const asset = {
        key: 'data',
        getKey: () => 'data',
        href: url,
        getAbsoluteUrl: () => url,
      }
      await open({
        kind: 'zarr',
        id: 'zarr:data:rgb',
        asset,
        variable: { name: 'rgb', nodata: 0 },
        title: 'True colour',
        render: { nodata: [0] },
      })
      expect(tileRenders.calls.at(-1)).toMatchObject({
        bidx: [1, 2, 3],
        rescale: [[0, 255]],
        nodata: [0],
      })
    })
  })

  describe('the dimensions ZarrLayer insists on', () => {
    // The layer checks these itself and throws inside deck.gl, where the user
    // sees a blank map and no message. Each one has to be refused here.
    const selfDescribed = dimensionNames => ({
      '/': { kind: 'group', attrs: {} },
      '/data': {
        kind: 'array',
        attrs: gridAttrs,
        shape: [3, 512, 512],
        chunks: [1, 256, 256],
        dtype: 'float32',
        dimensionNames,
      },
    })
    const descriptor = {
      kind: 'zarr',
      id: 'zarr:data:data',
      asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
      variable: { name: 'data' },
      title: 'A grid',
      render: null,
    }

    it('refuses a swapped spatial order rather than letting deck.gl throw', async () => {
      fake.nodes = selfDescribed(['time', 'x', 'y'])
      await expect(open(descriptor)).rejects.toMatchObject({
        name: 'ZarrUnsuitableError',
        reason: ZARR_NOTICE_ORDER,
      })
      await expect(open(descriptor)).rejects.toThrow(/transpose/)
    })

    it('refuses an array whose band axis sits after its spatial axes', async () => {
      // Tessera's global RGB mosaic: `[lat, lon, band]`. The coordinate reader
      // looks at the last two axes, finds `band` there, and used to refuse the
      // store as having no coordinate arrays — so a store with a perfectly
      // good spatial reference was told it had none.
      fake.nodes = selfDescribed(['lat', 'lon', 'band'])
      await expect(open(descriptor)).rejects.toMatchObject({
        name: 'ZarrUnsuitableError',
        reason: ZARR_NOTICE_ORDER,
      })
      await expect(open(descriptor)).rejects.toThrow(/"lat" and "lon" are not the last two/)
      await expect(open(descriptor)).rejects.toMatchObject({
        detail: { kind: 'axes', y: 'lat', x: 'lon' },
      })
    })

    it('refuses an array that leaves a dimension unnamed', async () => {
      fake.nodes = selfDescribed([null, 'y', 'x'])
      await expect(open(descriptor)).rejects.toMatchObject({
        name: 'ZarrUnsuitableError',
        reason: ZARR_NOTICE_NO_GEO,
      })
    })

    it('draws an array whose spatial dimensions are the last two', async () => {
      fake.nodes = selfDescribed(['time', 'y', 'x'])
      const { props } = await open(descriptor)
      expect(props.selection).toEqual({ time: 2 })
    })
  })

  describe('a failure with no reason of its own', () => {
    // Without a reason the map used to show nothing and say nothing. The
    // generic reason is what MapView turns into mapping.zarr.loadError.
    it('reports a store that cannot be opened', async () => {
      fake.nodes = {}
      const descriptor = {
        kind: 'zarr',
        id: 'zarr:data',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: null,
        title: 'A Zarr store',
        render: null,
      }
      await expect(open(descriptor)).rejects.toMatchObject({
        name: 'ZarrUnsuitableError',
        reason: ZARR_NOTICE_ERROR,
      })
      await expect(open(descriptor)).rejects.toThrow(new RegExp(url))
    })

    it('reports a derived grid description the parser will not read', async () => {
      // The CF path: the store describes nothing itself, the coordinate arrays
      // describe it, and the parse of that description used to throw bare.
      fake.nodes = {
        '/': { kind: 'group', attrs: {} },
        '/data': {
          kind: 'array',
          attrs: {},
          shape: [4, 4],
          chunks: [2, 2],
          dtype: 'float32',
          dimensionNames: ['y', 'x'],
        },
        '/y': { kind: 'array', attrs: {}, shape: [4], values: [40, 30, 20, 10] },
        '/x': { kind: 'array', attrs: {}, shape: [4], values: [0, 10, 20, 30] },
      }
      parse = () => { throw new Error('schema: unknown spatial:registration') }
      const descriptor = {
        kind: 'zarr',
        id: 'zarr:data:data',
        asset: {
          key: 'data',
          getKey: () => 'data',
          href: url,
          getAbsoluteUrl: () => url,
          'proj:code': 'EPSG:4326',
        },
        variable: { name: 'data' },
        title: 'A grid',
        render: null,
      }
      await expect(open(descriptor)).rejects.toMatchObject({
        name: 'ZarrUnsuitableError',
        reason: ZARR_NOTICE_ERROR,
      })
    })
  })

  describe('the zoom a pyramid starts drawing at', () => {
    const pyramid = {
      levels: [
        { path: '0', arrayWidth: 65536, arrayHeight: 65536 },
        { path: '1', arrayWidth: 8192, arrayHeight: 8192 },
      ],
      axes: ['y', 'x'],
      yAxisIndex: 0,
      xAxisIndex: 1,
      crs,
    }
    const descriptor = {
      kind: 'zarr',
      id: 'zarr:data',
      asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
      variable: null,
      title: 'A pyramid',
      render: { colormap_name: 'viridis', rescale: [[0, 1]] },
    }

    beforeEach(() => {
      fake.nodes = {
        '/': {
          kind: 'group',
          attrs: { ...gridAttrs, multiscales: { layout: [{ asset: '0' }, { asset: '1' }] } },
        },
        '/0': {
          kind: 'array',
          attrs: {},
          shape: [65536, 65536],
          chunks: [512, 512],
          dtype: 'uint16',
          dimensionNames: ['y', 'x'],
        },
        // The top of the pyramid is chunked at 64 pixels, not the 512 of the
        // base. A store written with a fixed chunk count rather than a fixed
        // chunk size looks like this, and its top level then costs 128 chunk
        // requests across rather than 16.
        '/1': {
          kind: 'array',
          attrs: {},
          shape: [8192, 8192],
          chunks: [64, 64],
          dtype: 'uint16',
          dimensionNames: ['y', 'x'],
        },
      }
      parse = () => pyramid
    })

    it('finds a pyramid that lives inside the variable\'s own group', async () => {
      // The level-inside-a-variable layout: one group per variable, one group
      // per level inside it, and the array named after the variable inside
      // each level. The resolved level paths are relative to the variable's
      // group, so resolving them from the store root finds nothing and the
      // store reads as having no array to render.
      const nested = {
        levels: [
          { path: '0', arrayWidth: 2048, arrayHeight: 2048 },
          { path: '1', arrayWidth: 512, arrayHeight: 512 },
        ],
        axes: ['y', 'x'],
        yAxisIndex: 0,
        xAxisIndex: 1,
        crs,
      }
      const level = (path, size, chunk) => ({
        [path]: { kind: 'group', attrs: {} },
        [`${path}/temp`]: {
          kind: 'array',
          attrs: {},
          shape: [size, size],
          chunks: [chunk, chunk],
          dtype: 'float32',
          dimensionNames: ['y', 'x'],
        },
      })
      fake.nodes = {
        '/': { kind: 'group', attrs: {} },
        '/temperature': {
          kind: 'group',
          attrs: { ...gridAttrs, multiscales: { layout: [{ asset: '0' }, { asset: '1' }] } },
        },
        ...level('/temperature/0', 2048, 512),
        ...level('/temperature/1', 512, 128),
      }
      parse = attrs => (attrs?.['spatial:transform'] ? nested : null)

      const { props, minZoom, hasOverviews } = await makeZarrLayerProps({
        kind: 'zarr',
        id: 'zarr:data:temperature',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: { name: 'temperature' },
        title: 'Temperature',
        render: { colormap_name: 'viridis', rescale: [[250, 320]] },
      }, { zarr: fakeZarr, bbox, deps: deps() })

      expect(props.node.path).toBe('/temperature')
      // The layer opens each level by the corrected path, relative to that
      // same group.
      expect(props.metadata.multiscales.layout.map(l => l.asset)).toEqual(['0/temp', '1/temp'])
      expect(hasOverviews).toBe(true)
      expect(minZoom).toBe(zarrZoomGuard(
        nested, [{ width: 512, height: 512 }, { width: 128, height: 128 }], bbox,
      ).minZoom)
    })

    it('hands the layer the reordered levels of a coarsest-first store', async () => {
      // A self-describing store that lists its levels coarsest first, with
      // every level already an array, so no level path needs rewriting.
      // `withMultiscalesLayout` reorders the levels finest first — which is
      // the order ZarrLayer maps a tile's zoom onto — but `props.metadata`
      // stayed undefined, so the layer read the store's own attributes and
      // put a world view on the FULL-RESOLUTION level, while the minimum zoom
      // computed here came from the real coarsest level. A request flood, not
      // a drawing fault.
      parse = parseGeoZarrMetadata
      const level = (path, n) => ({
        [`/${path}`]: {
          kind: 'array',
          attrs: {},
          shape: [n, n],
          chunks: [256, 256],
          dtype: 'uint16',
          dimensionNames: ['y', 'x'],
        },
      })
      fake.nodes = {
        '/': {
          kind: 'group',
          attrs: {
            'proj:code': 'EPSG:3857',
            'spatial:dimensions': ['y', 'x'],
            'spatial:registration': 'pixel',
            multiscales: {
              layout: [
                { asset: 'coarse', 'spatial:shape': [512, 512], 'spatial:transform': [40, 0, 0, 0, -40, 0] },
                { asset: 'fine', 'spatial:shape': [2048, 2048], 'spatial:transform': [10, 0, 0, 0, -10, 0] },
              ],
            },
          },
        },
        ...level('coarse', 512),
        ...level('fine', 2048),
      }
      const { props } = await open({
        kind: 'zarr',
        id: 'zarr:data',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: null,
        title: 'A coarsest-first pyramid',
        render: { colormap_name: 'viridis', rescale: [[0, 1]] },
      })
      expect(props.metadata).toBeDefined()
      expect(props.metadata.multiscales.layout.map(l => l.asset)).toEqual(['fine', 'coarse'])
    })

    it('leaves the metadata undefined for a store that needs no rewrite', async () => {
      // The other side of it: a store already finest first, with no level path
      // to correct, describes itself to the layer and must not be handed a
      // copy of its own attributes.
      parse = parseGeoZarrMetadata
      fake.nodes = {
        '/': {
          kind: 'group',
          attrs: {
            'proj:code': 'EPSG:3857',
            'spatial:dimensions': ['y', 'x'],
            'spatial:transform': [10, 0, 0, 0, -10, 0],
            'spatial:shape': [2048, 2048],
          },
        },
      }
      fake.nodes['/'] = {
        ...fake.nodes['/'],
        kind: 'array',
        shape: [2048, 2048],
        chunks: [256, 256],
        dtype: 'uint16',
        dimensionNames: ['y', 'x'],
      }
      const { props } = await open({
        kind: 'zarr',
        id: 'zarr:data',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: null,
        title: 'A single-level store',
        render: { colormap_name: 'viridis', rescale: [[0, 1]] },
      })
      expect(props.metadata).toBeUndefined()
    })

    it('describes an ndpyramid store from its levels\' own coordinate arrays', async () => {
      // CarbonPlan's climate pyramids: `multiscales` in the array spelling
      // naming one group per level, nothing spatial on the root, and each
      // level holding its data array beside its own `lat`/`lon` arrays. Both
      // halves are real; only joining them was missing, and the store was
      // refused as "a pyramid the browser cannot read".
      //
      // The real parser runs here, so the synthesized document has to be one
      // the schema actually accepts.
      parse = parseGeoZarrMetadata
      const axis = (n, origin, step) => ({
        kind: 'array',
        attrs: {},
        shape: [n],
        chunks: [n],
        dtype: 'float32',
        values: Array.from({ length: n }, (_, i) => origin + i * step),
      })
      const level = (path, n) => ({
        [path]: { kind: 'group', attrs: {} },
        [`${path}/tavg`]: {
          kind: 'array',
          attrs: {},
          shape: [n, n],
          chunks: [4, 4],
          dtype: 'float32',
          dimensionNames: ['lat', 'lon'],
        },
        [`${path}/lat`]: axis(n, 80, -160 / n),
        [`${path}/lon`]: axis(n, -90, 180 / n),
      })
      fake.nodes = {
        // ndpyramid writes its levels coarsest first and states no spatial
        // metadata of its own.
        '/': {
          kind: 'group',
          attrs: { multiscales: [{ datasets: [{ path: '0' }, { path: '1' }] }] },
        },
        ...level('/0', 4),
        ...level('/1', 8),
      }

      const { props, hasOverviews } = await makeZarrLayerProps({
        kind: 'zarr',
        id: 'zarr:data:tavg',
        asset: { key: 'data', getKey: () => 'data', href: url, getAbsoluteUrl: () => url },
        variable: { name: 'tavg' },
        title: 'Mean temperature',
        render: { colormap_name: 'viridis', rescale: [[-30, 30]] },
      }, { zarr: fakeZarr, bbox, deps: deps() })

      expect(hasOverviews).toBe(true)
      // Finest first, which is the order the layer reads the levels in, and
      // the reverse of the order the store wrote them.
      expect(props.metadata.multiscales.layout.map(l => l.asset)).toEqual(['1/tavg', '0/tavg'])
      expect(props.metadata['spatial:shape']).toEqual([8, 8])
      expect(props.metadata['spatial:dimensions']).toEqual(['lat', 'lon'])
      expect(props.metadata['proj:code']).toBe('EPSG:4326')
      // Each level keeps its own cell size, read from its own coordinates.
      expect(props.metadata.multiscales.layout[0]['spatial:transform'][0]).toBeCloseTo(22.5, 6)
      expect(props.metadata.multiscales.layout[1]['spatial:transform'][0]).toBeCloseTo(45, 6)
    })

    it('reads the coarsest level\'s own chunking, not the finest level\'s', async () => {
      const { minZoom, hasOverviews } = await open(descriptor)
      expect(hasOverviews).toBe(true)
      const finest = { width: 512, height: 512 }
      const coarsest = { width: 64, height: 64 }
      expect(minZoom).toBe(zarrZoomGuard(pyramid, [finest, coarsest], bbox).minZoom)
      // Repeating the finest level's chunking is the bug: it counts four
      // chunks across the top level as one, and moves the minimum zoom.
      expect(minZoom).not.toBe(zarrZoomGuard(pyramid, [finest, finest], bbox).minZoom)
    })
  })
})
