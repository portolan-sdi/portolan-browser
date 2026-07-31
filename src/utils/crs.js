// Coordinate reference system handling for GeoParquet map display: building a
// lon/lat transform from what a file declares about its CRS, and reprojecting
// GeoJSON geometries through it.
//
// Kept separate from utils/parquet.js so MapView can resolve a CRS without
// pulling hyparquet into the eager bundle (parquet.js is lazy-loaded via
// StacMapLayer._loadParquetDeps), and separate from parquetShared.js because
// this half needs proj4 while that one must stay dependency-free.

import proj4 from 'proj4';

// Coordinate reference systems we can put on the map as-is. `null` means the
// file declares no CRS at all — GeoParquet's default is then OGC:CRS84
// (lon/lat). Anything else is reprojected to lon/lat before it reaches
// MapLibre (see createLonLatTransform); a CRS we can neither pass through nor
// build a transform for is rejected for map display.
export const MAP_RENDERABLE_CRS = [null, 'OGC:CRS84', 'EPSG:4326'];

// Web Mercator is only defined inside the square world extent (half the
// equator's circumference, in metres). proj4 does not refuse input past it:
// eastings wrap back across the antimeridian and northings saturate at ±90,
// so a position one metre outside comes back as a well-formed lon/lat on the
// far side of the world. isLonLat cannot tell those from real coordinates, so
// the domain has to be enforced on the way *in*.
const WEB_MERCATOR_EXTENT = 20037508.342789244;

// The codes proj4 resolves to Web Mercator (see its own special-casing in
// parseCode.js). Only reachable via the authority code, since
// detectGeometryInfo leaves `crsDefinition` null for Web Mercator.
const WEB_MERCATOR_CRS = ['EPSG:3857', 'EPSG:900913', 'EPSG:3785', 'EPSG:102113'];

// How far outside its declared area of use a reprojected position may land
// before we treat it as misprojected rather than as legitimate overhang.
// EPSG area-of-use boxes are already generous, so a coordinate this far
// outside is a data or CRS error rather than a dataset that spills over its
// region by a little.
const AREA_OF_USE_MARGIN_DEG = 5;

/**
 * Reduce a PROJJSON prime meridian longitude to degrees, or null when it
 * cannot be expressed as a finite number of them.
 *
 * PROJJSON writes this either as a bare number (always degrees) or as
 * `{ value, unit }` when the unit is something else.
 */
function primeMeridianDegrees(longitude) {
  if (typeof longitude === 'number') {
    return Number.isFinite(longitude) ? longitude : null;
  }
  if (!longitude || typeof longitude !== 'object') {return null;}
  const { value, unit } = longitude;
  if (typeof value !== 'number' || !Number.isFinite(value)) {return null;}
  if (unit === undefined || unit === 'degree') {return value;}
  // A named unit other than degree carries no conversion factor we can use.
  if (typeof unit === 'string') {return null;}
  // `conversion_factor` is radians per unit, which is how PROJJSON expresses
  // grads (π/200) and any other angular unit.
  const factor = unit?.conversion_factor;
  if (typeof factor !== 'number' || !Number.isFinite(factor)) {return null;}
  return value * factor * (180 / Math.PI);
}

/**
 * Rewrite a PROJJSON prime meridian into the bare-degrees form proj4 can read,
 * returning null when it cannot be converted.
 *
 * proj4's PROJJSON support (via wkt-parser) only handles the bare-number form:
 * `transformPROJJSON.js` computes `from_greenwich` as
 * `prime_meridian.longitude * Math.PI / 180`, which is `NaN` for the object
 * form. proj4 then drops the offset entirely, because `transform.js` guards it
 * with `if (source.from_greenwich)` and NaN is falsy — so the coordinates come
 * out silently short by the whole prime meridian offset. For the NTF (Paris)
 * family, which declares Paris in grads, that is ~171 km with no NaN, no
 * out-of-range angle, and therefore nothing for isLonLat to catch.
 */
function normalizeCrsDefinition(crsDefinition) {
  if (!crsDefinition || typeof crsDefinition !== 'object') {return crsDefinition;}
  // A ProjectedCRS keeps its datum under `base_crs`; a GeographicCRS carries
  // it directly. Either may use `datum_ensemble` in place of `datum`.
  const holder = crsDefinition.base_crs || crsDefinition;
  const datumKey = holder.datum ? 'datum' : 'datum_ensemble';
  const datum = holder[datumKey];
  const primeMeridian = datum?.prime_meridian;
  // Greenwich (and anything already expressed as a bare number) needs no help.
  if (!primeMeridian || typeof primeMeridian.longitude !== 'object') {
    return crsDefinition;
  }
  const degrees = primeMeridianDegrees(primeMeridian.longitude);
  if (degrees === null) {return null;}
  const patchedHolder = {
    ...holder,
    [datumKey]: { ...datum, prime_meridian: { ...primeMeridian, longitude: degrees } },
  };
  return crsDefinition.base_crs
    ? { ...crsDefinition, base_crs: patchedHolder }
    : patchedHolder;
}

/**
 * Build a coordinate transform from a GeoParquet CRS to lon/lat, or return
 * null when neither input identifies a system proj4 can use.
 *
 * Prefers the file's own PROJJSON over its authority code: the definition is
 * self-contained, so it works without a network round-trip for the many
 * systems proj4 doesn't ship. It ships WGS84, NAD83, Web Mercator and all 120
 * WGS84 UTM zones — but no national grid, which is the case this exists for.
 * The code is the fallback for files that declare `id` but whose PROJJSON
 * proj4 rejects, and it is what makes EPSG:3857 work — detectGeometryInfo
 * deliberately leaves `crsDefinition` null for it.
 *
 * proj4 parses the axis order declared in a PROJJSON `coordinate_system`, but
 * only *applies* it when `forward` is called with a second `enforceAxis`
 * argument, which we never pass. So it always emits lon/lat here, matching the
 * x/y order the WKB coordinates were read in — which is also what GeoParquet
 * mandates regardless of the CRS's declared axis order.
 */
export function createLonLatTransform(crs, crsDefinition) {
  // A definition whose prime meridian cannot be normalized is dropped rather
  // than handed to proj4, which would silently ignore it.
  const definition = normalizeCrsDefinition(crsDefinition);
  for (const source of [definition, crs]) {
    if (!source) {continue;}
    try {
      return proj4(source, 'EPSG:4326');
    } catch {
      // proj4 throws on any definition it can't resolve — including a bare
      // name like 'unidentified' and PROJJSON missing a projection method.
      // It throws bare strings rather than Errors, hence the argument-less
      // catch. Fall through to the next candidate.
    }
  }
  return null;
}

/**
 * Build the domain checks for a transform: which source positions it is
 * defined for, and where its output is allowed to land. Both are optional —
 * an empty guard reproduces the old behavior of trusting proj4's output.
 */
export function createDomainGuard(crs, crsDefinition) {
  const guard = { maxInputAbs: null, areaOfUse: null };
  if (WEB_MERCATOR_CRS.includes(crs)) {
    guard.maxInputAbs = WEB_MERCATOR_EXTENT;
  }
  const bbox = crsDefinition?.bbox;
  const west = bbox?.west_longitude;
  const east = bbox?.east_longitude;
  const south = bbox?.south_latitude;
  const north = bbox?.north_latitude;
  if ([west, east, south, north].every(v => typeof v === 'number' && Number.isFinite(v))) {
    // EPSG writes a region spanning the antimeridian with west > east.
    guard.areaOfUse = { west, east, south, north, wraps: west > east };
  }
  return guard;
}

// Whether a reprojected position is close enough to the CRS's declared area of
// use to be believable. Generous by design — see AREA_OF_USE_MARGIN_DEG.
function withinAreaOfUse(area, lon, lat) {
  const m = AREA_OF_USE_MARGIN_DEG;
  if (lat < area.south - m || lat > area.north + m) {return false;}
  if (area.wraps) {
    // The box is the union of two spans either side of the antimeridian.
    return lon >= area.west - m || lon <= area.east + m;
  }
  return lon >= area.west - m && lon <= area.east + m;
}

// A reprojected position is only usable if it lands inside the lon/lat domain.
// The range test catches more than a finite test does: proj4 returns NaN or
// Infinity for some out-of-domain input, and MapLibre draws NaN coordinates as
// invisible gaps and out-of-range ones as spikes across the world.
//
// On its own this is a weak guard: for conformal projections most out-of-domain
// input still reprojects to a perfectly well-formed lon/lat in the wrong place
// (1e18 metres in RD New comes back as a real-looking point south of New
// Zealand). The domain guard from createDomainGuard is what catches those —
// this only rejects output that isn't a coordinate at all.
function isLonLat(x, y) {
  return Number.isFinite(x) && Number.isFinite(y)
    && x >= -180 && x <= 180 && y >= -90 && y <= 90;
}

// Walk a GeoJSON coordinates value — a bare position, or arbitrarily nested
// arrays of them — applying `transform` to each position. Returns null if any
// position fails to reproject, which drops the whole geometry: a partly
// transformed shape would render as a spike across the map.
function mapPositions(node, transform, guard) {
  if (!Array.isArray(node)) {return null;}
  if (typeof node[0] === 'number') {
    const [sx, sy] = node;
    // Positions outside the projection's own input domain must be rejected
    // before transforming: proj4 maps them onto valid-looking output rather
    // than failing (Web Mercator wraps past the antimeridian and saturates at
    // the poles), so afterwards there is nothing left to detect.
    if (guard?.maxInputAbs !== null && guard?.maxInputAbs !== undefined
      && (!(Math.abs(sx) <= guard.maxInputAbs) || !(Math.abs(sy) <= guard.maxInputAbs))) {
      return null;
    }
    const [x, y] = transform.forward([sx, sy]);
    if (!isLonLat(x, y)) {return null;}
    if (guard?.areaOfUse && !withinAreaOfUse(guard.areaOfUse, x, y)) {return null;}
    // Preserve any third (and further) ordinates untouched; proj4 would pass
    // z through unchanged for these 2D-to-2D transforms anyway.
    return node.length > 2 ? [x, y, ...node.slice(2)] : [x, y];
  }
  const out = [];
  for (const child of node) {
    const mapped = mapPositions(child, transform, guard);
    if (mapped === null) {return null;}
    out.push(mapped);
  }
  return out;
}

/**
 * Reproject a GeoJSON geometry into lon/lat, or return null if any of its
 * positions falls outside the transform's usable domain. `guard` is optional;
 * without it only the lon/lat range of the output is checked.
 */
export function reprojectGeometry(geometry, transform, guard = null) {
  if (!geometry) {return null;}
  if (Array.isArray(geometry.geometries)) {
    const geometries = [];
    for (const member of geometry.geometries) {
      const mapped = reprojectGeometry(member, transform, guard);
      if (mapped === null) {return null;}
      geometries.push(mapped);
    }
    return { ...geometry, geometries };
  }
  if (!geometry.coordinates) {return null;}
  let coordinates;
  try {
    coordinates = mapPositions(geometry.coordinates, transform, guard);
  } catch {
    return null;
  }
  return coordinates === null ? null : { ...geometry, coordinates };
}

