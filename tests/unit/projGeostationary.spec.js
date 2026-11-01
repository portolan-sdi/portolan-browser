import { describe, it, expect } from 'vitest'
import proj4 from 'proj4'
import { registerGeostationary } from '../../src/utils/projGeostationary.js'

// The real `proj:wkt2` of the GOES-18 fire characterisation store, at
// https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc/collection.json.
// GDAL writes the method name as "Geostationary Satellite (Sweep X)" and the
// height as a "Satellite height" parameter. proj4 knows neither spelling.
const GOES_WKT2 = 'PROJCRS["undefined",BASEGEOGCRS["undefined",DATUM["undefined",ELLIPSOID["undefined",6378137,298.257222096042,LENGTHUNIT["metre",1,ID["EPSG",9001]]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8901]]],CONVERSION["unknown",METHOD["Geostationary Satellite (Sweep X)"],PARAMETER["Satellite height",35786023,LENGTHUNIT["metre",1,ID["EPSG",9001]]],PARAMETER["Latitude of natural origin",0,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8801]],PARAMETER["Longitude of natural origin",-137,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8802]],PARAMETER["False easting",0,LENGTHUNIT["metre",1],ID["EPSG",8806]],PARAMETER["False northing",0,LENGTHUNIT["metre",1],ID["EPSG",8807]]],CS[Cartesian,2],AXIS["(E)",east,ORDER[1],LENGTHUNIT["metre",1,ID["EPSG",9001]]],AXIS["(N)",north,ORDER[2],LENGTHUNIT["metre",1,ID["EPSG",9001]]]]'

// The same grid as a proj4 string, which proj4 reads without help. This is the
// reference the WKT2 path must reproduce.
const GOES_PROJ4 = '+proj=geos +h=35786023 +lon_0=-137 +sweep=x +a=6378137 +rf=298.257222096042 +x_0=0 +y_0=0 +units=m +no_defs'

// Positions in the store's own grid, in metres from the sub-satellite point.
const GRID_POINTS = [[0, 0], [1e6, 1e6], [-2e6, 5e5], [3e6, -2.5e6]]

async function parse(definition) {
  const { default: wktParser } = await import('wkt-parser')
  return wktParser(definition)
}

describe('registerGeostationary', () => {
  it('makes proj4 build a transform from a GDAL geostationary WKT2', async () => {
    registerGeostationary(proj4)
    const transform = proj4(await parse(GOES_WKT2), 'EPSG:4326')
    const [lon, lat] = transform.forward([0, 0])
    expect(lon).toBeCloseTo(-137, 9)
    expect(lat).toBeCloseTo(0, 9)
  })

  it('agrees with the equivalent proj4 string', async () => {
    registerGeostationary(proj4)
    const fromWkt = proj4(await parse(GOES_WKT2), 'EPSG:4326')
    const fromString = proj4(GOES_PROJ4, 'EPSG:4326')
    for (const point of GRID_POINTS) {
      const [lonA, latA] = fromWkt.forward(point)
      const [lonB, latB] = fromString.forward(point)
      expect(lonA).toBeCloseTo(lonB, 9)
      expect(latA).toBeCloseTo(latB, 9)
    }
  })

  it('round-trips a position through the inverse', async () => {
    registerGeostationary(proj4)
    const transform = proj4(await parse(GOES_WKT2), 'EPSG:4326')
    const [lon, lat] = transform.forward(transform.inverse([-120, 30]))
    expect(lon).toBeCloseTo(-120, 9)
    expect(lat).toBeCloseTo(30, 9)
  })

  // The sweep axis moves a position by about 400 m, so the method name has to
  // set it. A default of "y" misplaces every GOES chunk.
  it('reads the sweep axis from the method name', async () => {
    registerGeostationary(proj4)
    const sweepY = GOES_WKT2.replace('(Sweep X)', '(Sweep Y)')
    const fromX = proj4(await parse(GOES_WKT2), 'EPSG:4326').forward([1e6, 1e6])
    const fromY = proj4(await parse(sweepY), 'EPSG:4326').forward([1e6, 1e6])
    expect(fromX).not.toEqual(fromY)
    const reference = proj4(GOES_PROJ4.replace('+sweep=x', '+sweep=y'), 'EPSG:4326')
    const [lon, lat] = reference.forward([1e6, 1e6])
    expect(fromY[0]).toBeCloseTo(lon, 9)
    expect(fromY[1]).toBeCloseTo(lat, 9)
  })

  it('runs twice without an error', () => {
    registerGeostationary(proj4)
    registerGeostationary(proj4)
    expect(proj4('EPSG:3857', 'EPSG:4326').forward([0, 0])).toEqual([0, 0])
  })

  it('leaves the projections proj4 already knows', () => {
    registerGeostationary(proj4)
    expect(proj4.Proj.projections.get('geos')).toBeTruthy()
    expect(proj4.Proj.projections.get('merc')).toBeTruthy()
    const [lon, lat] = proj4('EPSG:3857', 'EPSG:4326').forward([1113194.9, 0])
    expect(lon).toBeCloseTo(10, 6)
    expect(lat).toBeCloseTo(0, 6)
  })
})
