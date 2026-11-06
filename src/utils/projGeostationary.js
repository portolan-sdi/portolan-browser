// Geostationary satellite grids for proj4.
//
// proj4 implements the geostationary projection and registers it as `geos`.
// It still cannot build a transform from a geostationary WKT2 definition,
// because the names do not meet. GDAL writes the method as
// `Geostationary Satellite (Sweep X)`. proj4 knows the projection as
// `Geostationary Satellite View`, `Geostationary_Satellite` or `geos`.
// `wkt-parser` passes the method name through without a translation, so
// proj4 looks up a name it does not hold and throws.
//
// The satellite height is the second half of the gap. proj4's `geos` reads
// the height as `h`. `wkt-parser` emits the WKT2 parameter as
// `satellite_height` and maps no alias for it. A fix for the name alone is
// worse than the error. `geos` computes `h / a`, which is `NaN` for an absent
// height, and both of its guards pass for `NaN`. The layer then draws every
// chunk at a `NaN` position, with no message.
//
// This module closes both halves. It registers an alias of `geos` under the
// two GDAL method names. The alias maps `satellite_height` to `h`, and reads
// the sweep axis from the method name.
//
// The sweep axis is not cosmetic. A position moves about 400 m between the
// two axes, so a wrong axis misplaces every chunk of the store.
//
// The fix belongs upstream in `wkt-parser`, which already maps the other WKT2
// parameter names onto proj4's names. See `transformPROJJSON.js` in that
// package. This module is the local stand-in until that lands.

// The method names GDAL writes for a geostationary grid. proj4 lowercases a
// name before it looks the name up, so the case here does not matter.
const GEOSTATIONARY_METHODS = [
  'Geostationary Satellite (Sweep X)',
  'Geostationary Satellite (Sweep Y)',
];

// One registration per proj4 instance. A module-level flag is wrong, because
// a test and the application can hold different instances.
const registered = new WeakSet();

/**
 * Teach a proj4 instance the GDAL spelling of a geostationary projection.
 *
 * Call this before proj4 reads a definition that may hold a geostationary
 * grid. The call is safe to repeat. It adds an alias of proj4's own `geos`
 * projection and changes no projection that proj4 already holds.
 *
 * @param proj4 The proj4 instance to register the alias on.
 */
export function registerGeostationary(proj4) {
  if (!proj4?.Proj?.projections || registered.has(proj4)) {return;}
  const geos = proj4.Proj.projections.get('geos');
  // A proj4 build without `geos` cannot gain the projection from an alias.
  if (!geos) {return;}

  proj4.Proj.projections.add({
    names: GEOSTATIONARY_METHODS,
    init() {
      if (this.h === undefined) {this.h = this.satellite_height;}
      if (this.sweep === undefined) {
        this.sweep = /sweep\s*y/i.test(this.projName ?? '') ? 'y' : 'x';
      }
      // A definition with no height cannot make a transform. The throw keeps
      // the failure visible. `geos` would accept `NaN` and draw nothing.
      if (!Number.isFinite(Number(this.h))) {
        throw new Error('A geostationary CRS declares no satellite height.');
      }
      return geos.init.call(this);
    },
    forward: geos.forward,
    inverse: geos.inverse,
  });

  registered.add(proj4);
}
