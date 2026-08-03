import { Collection, STAC } from 'stac-js';

const BASEMAPS = {
  earth: [
    {
      url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      title: 'Voyager',
    },
    {
      url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      title: 'Positron',
    },
    {
      url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      title: 'Dark Matter',
    },
    {
      url: 'https://cholmes.github.io/overture-pmtiles-styles/style-satellite.json',
      title: 'Satellite',
    },
  ],
//'earth-dark': [
//  {
//    url: 'https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
//    is: 'XYZ',
//    title: 'Carto Dark',
//    attributions: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.',
//    projection: "EPSG:3857"
//  }
//],
  europa: [
    {
      title: 'USGS Europa',
      raster: true,
      attribution: 'USGS Astrogeology',
      tiles: ['https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/jupiter/europa_simp_cyl.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=GALILEO_VOYAGER&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png'],
    },
  ],
  mars: [
    {
      title: 'USGS Mars',
      raster: true,
      attribution: 'USGS Astrogeology',
      tiles: ['https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/mars/mars_simp_cyl.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MDIM21&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png'],
    },
  ],
  moon: [
    {
      title: 'USGS Moon',
      raster: true,
      attribution: 'USGS Astrogeology',
      tiles: ['https://planetarymaps.usgs.gov/cgi-bin/mapserv?map=/maps/earth/moon_simp_cyl.map&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=LROC_WAC&SRS=EPSG:3857&BBOX={bbox-epsg-3857}&WIDTH=256&HEIGHT=256&FORMAT=image/png'],
    },
  ],
};

/**
 * Portolan's basemaps are MapLibre GL style/raster definitions, not the
 * OpenLayers layers upstream configures here, so this takes only the STAC
 * object. Upstream's `i18n` and `store` arguments — the latter used to pick a
 * dark basemap variant from `store.state.colorMode` — arrive when the MapLibre
 * stack learns to follow the color mode.
 *
 * @param {Object} stac The STAC object
 * @returns {Array.<BasemapOptions>}
 */
export default function configureBasemap(stac) {
  let targets;
  if (stac instanceof Collection) {
    targets = stac.getSummary('ssys:targets');
  }
  if (stac instanceof STAC && !targets) {
    targets = stac.getMetadata('ssys:targets');
  }
  if (!targets) {
    targets = ['earth'];
  }

  if (store.state.colorMode === 'dark') {
    targets = targets.map(t => {
      const darkVariant = `${t}-dark`;
      return Array.isArray(BASEMAPS[darkVariant]) ? darkVariant : t;
    });
  }

  let layers = [];
  for (const target of targets) {
    const maps = BASEMAPS[target.toLowerCase()];
    if (!Array.isArray(maps)) {
      continue;
    }
    layers = layers.concat(maps);
  }
  return layers;
}
