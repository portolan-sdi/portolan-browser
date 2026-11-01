import { describe, it, expect } from 'vitest'
import {
  chunkAmplification,
  defaultVariable,
  describesArray,
  zarrDescriptors,
  zarrVariables,
} from '../../src/utils/zarrLayers.js'

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
