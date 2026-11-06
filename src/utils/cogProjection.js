// The Web Mercator definition that COGLayer projects into.
//
// `@developmentseed/deck.gl-geotiff` builds its reprojection mesh with
// `proj4(sourceProjection, "EPSG:3857")`. The built-in proj4 definition of
// EPSG:3857 wraps every longitude into [-180, 180]. A grid whose west edge is
// west of -180 then has a mesh column that maps to the east edge of the world.
// An example is a 0.5 degree grid with its origin at -180.3125. The mesh
// refinement cannot converge across that jump, and it warps every tile that
// touches the column. On a global grid that is the whole raster.
//
// The `over` flag stops the wrap. A longitude of -180.3125 then projects to
// an x west of -20037508 m, which deck draws next to the antimeridian.
// GDAL and rasterio read the file the same way.
//
// Only the `EPSG:3857` key changes. The aliases EPSG:900913, EPSG:3785, and
// EPSG:102113 keep the wrapped definition. In the app, `utils/crs.js` also
// reads EPSG:3857, but it refuses input past the world extent, so the flag
// does not change its output. The upstream defect is in deck.gl-geotiff 0.7.0
// and 0.9.0. Delete this file when COGLayer handles the overflow itself.
import proj4 from 'proj4';

const WEB_MERCATOR = 'EPSG:3857';

/**
 * Let EPSG:3857 projections keep longitudes outside [-180, 180].
 * The call is idempotent.
 */
export function allowWebMercatorOverflow() {
  const def = proj4.defs(WEB_MERCATOR);
  if (!def || def.over) {return;}
  proj4.defs(WEB_MERCATOR, { ...def, over: true });
}
