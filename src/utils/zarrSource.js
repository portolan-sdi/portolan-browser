// How a Zarr store is opened for the map, and what has to be true before it
// can be drawn.
//
// `@developmentseed/deck.gl-zarr` renders a GeoZarr group as a tiled raster.
// It needs three things the browser must supply:
//
//   1. An open zarrita node. The caller owns the store, so the transport
//      (plain HTTP, or an Icechunk repository) and the read optimisations
//      (consolidated metadata, range coalescing) are decided here.
//   2. GeoZarr metadata. A store that follows the `spatial` and `geo-proj`
//      conventions carries it in the group attributes. A CF-style store does
//      not, so this module builds the same metadata from the coordinate
//      arrays. See geoZarrAttrsFromCoordinates.
//   3. A path to one array per resolution level. A multiscale store may put
//      each level in a group rather than in a bare array, so the level paths
//      are checked and corrected. See resolveLevelPaths.
//
// It also answers the question the render path cannot: at which map zoom this
// store is cheap enough to draw. A Zarr array with no overviews is one level
// at full resolution, and drawing a global view of it would ask for every
// chunk in the file. See zarrMinZoom.

import * as zarr from 'zarrita';

import { registerGeostationary } from './projGeostationary.js';

/** Media types that identify a Zarr store. */
export const ZARR_MEDIA_TYPES = [
  'application/vnd.zarr',
  'application/vnd+zarr',
  'application/x-zarr',
];

/**
 * Media types that identify an Icechunk repository. Icechunk is a transaction
 * log over Zarr chunks, so the store reads as Zarr once it is open, but the
 * reader differs. dynamical.org publishes `application/x-icechunk`.
 */
export const ICECHUNK_MEDIA_TYPES = [
  'application/x-icechunk',
  'application/vnd.icechunk',
];

// A Zarr store is a directory, so its href has no file extension to match on.
// These suffixes are the convention publishers follow, and they are the only
// fallback when an asset states no media type.
const ZARR_HREF_SUFFIXES = ['.zarr', '.zarr/'];
const ICECHUNK_HREF_SUFFIXES = ['.icechunk', '.icechunk/', '/icechunk', '/icechunk/'];

function assetType(asset) {
  return typeof asset?.type === 'string' ? asset.type : '';
}

function assetUrl(asset) {
  return asset?.getAbsoluteUrl?.() || asset?.href || '';
}

function matchesSuffix(href, suffixes) {
  const path = href.split('?')[0].split('#')[0];
  return suffixes.some(suffix => path.endsWith(suffix));
}

/** Whether an asset is an Icechunk repository. */
export function isIcechunkAsset(asset) {
  const type = assetType(asset);
  if (ICECHUNK_MEDIA_TYPES.some(mt => type.startsWith(mt))) {return true;}
  if (type) {return false;}
  return matchesSuffix(assetUrl(asset), ICECHUNK_HREF_SUFFIXES);
}

/**
 * Whether an asset is a Zarr store this module can open, Icechunk included.
 *
 * The media type is matched by prefix because the Zarr types carry parameters
 * (`application/vnd.zarr; version=3; profile=multiscales`), and a store is
 * readable whatever its version or profile says.
 */
export function isZarrAsset(asset) {
  if (isIcechunkAsset(asset)) {return true;}
  const type = assetType(asset);
  if (ZARR_MEDIA_TYPES.some(mt => type.startsWith(mt))) {return true;}
  if (type) {return false;}
  return matchesSuffix(assetUrl(asset), ZARR_HREF_SUFFIXES);
}

// A store href comes from untrusted STAC metadata and is read over the
// network, so only http(s) is allowed. `s3://` is the other form publishers
// write (dynamical.org lists both); the browser cannot read it, so an asset
// that only offers one is skipped rather than reported as broken.
export function isHttpZarrHref(url) {
  try {
    const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
    const protocol = new URL(url, base).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Open a Zarr store for the map and return its root node.
 *
 * Plain Zarr stores read through two wrappers. `withMaybeConsolidatedMetadata`
 * uses the store's consolidated metadata when it has it, which replaces one
 * HTTP request per array with one for the whole store. `withRangeCoalescing`
 * merges the reads that a sharded store issues close together, which matters
 * because reading one inner chunk of a shard costs an index read and a chunk
 * read.
 *
 * Which of the two readers a store needs is decided by trying one and falling
 * back to the other, because the metadata does not reliably say. An Icechunk
 * repository is a transaction log whose chunks are Zarr chunks, so catalogs
 * describe one either way: dynamical.org types its repositories
 * `application/x-icechunk`, while the GOES catalog on source.coop types its
 * own `application/vnd.zarr; version=3` and names the repository in the href.
 * Reading a repository as a plain store finds no `zarr.json` at the root and
 * fails at once, so the fallback costs one failed request in the case where
 * the declaration misleads, and nothing in the case where it does not.
 *
 * @param url The store root.
 * @param options.icechunk Try the Icechunk reader first.
 * @param options.deps Injected module loaders, for tests.
 * @returns The opened root `zarr.Group` or `zarr.Array`.
 */
export async function openZarrRoot(url, { icechunk = false, deps = null } = {}) {
  const openIcechunk = async () => {
    const { IcechunkStore } = deps?.icechunk ?? await import('icechunk-js');
    return zarr.open(await IcechunkStore.open(url));
  };
  const openPlain = async () => {
    const store = await zarr.withMaybeConsolidatedMetadata(
      zarr.withRangeCoalescing(new zarr.FetchStore(url)),
    );
    return zarr.open(store);
  };

  const [first, second] = icechunk ? [openIcechunk, openPlain] : [openPlain, openIcechunk];
  try {
    return await first();
  } catch (err) {
    try {
      return await second();
    } catch {
      // Report the failure of the reader the metadata asked for, which is the
      // one whose error describes what the catalog said the store was.
      throw err;
    }
  }
}

// --- GeoZarr metadata from CF coordinates ------------------------------------
//
// A CF-style store (dynamical.org's, and most of what xarray writes) describes
// its grid with one coordinate array per spatial dimension and no affine
// transform. The coordinates hold cell centres, so the grid is regular when
// the spacing between them is constant, and the affine follows from the first
// coordinate and the spacing.
//
// Reading the coordinates is what settles the row direction, which STAC cannot
// state: `cube:dimensions` gives a `[min, max]` extent either way, while a
// latitude array that runs north to south needs a negative y spacing and one
// that runs south to north needs a positive one. Drawing the second as the
// first flips the image.

/** Dimension names that identify the x and y axes of a CF-style store. */
const Y_DIM_NAMES = ['y', 'lat', 'latitude'];
const X_DIM_NAMES = ['x', 'lon', 'long', 'longitude'];

// The subset of those names that states the axis is geographic. Only these
// settle the CRS on their own: `lat` and `lon` hold degrees by the CF
// conventions, while `y` and `x` hold whatever the grid's projection uses.
// rioxarray writes a UTM grid with dimensions named `y` and `x`, and reading
// its metres as degrees puts the data at longitude 499980.
const GEOGRAPHIC_Y_DIM_NAMES = ['lat', 'latitude'];
const GEOGRAPHIC_X_DIM_NAMES = ['lon', 'long', 'longitude'];

// Names a CF grid-mapping variable is written under. The variable carries no
// data; its attributes hold the CRS. rioxarray writes `spatial_ref`.
const GRID_MAPPING_NAMES = ['spatial_ref', 'crs'];

// The spacing between coordinates is floating point, so it is never exactly
// constant. A grid counts as regular when the last coordinate lands within
// this fraction of one cell of where constant spacing puts it.
const SPACING_TOLERANCE = 0.01;

/**
 * The y and x dimension names of an array, taken from the last two of its
 * named dimensions.
 *
 * The order is fixed, not guessed: `deck.gl-zarr` requires the two spatial
 * dimensions to be the last two, in y, x order, and rejects an array that
 * breaks that. The names are then checked against the CF conventions so a
 * store whose last two dimensions are not spatial at all is rejected here,
 * with a message that says so, rather than drawn as a picture of two
 * unrelated axes.
 */
export function spatialDimNames(dimensionNames) {
  const dims = Array.isArray(dimensionNames) ? dimensionNames : [];
  if (dims.length < 2) {return null;}
  const [yName, xName] = dims.slice(-2);
  // Zarr v3 allows a null entry in `dimension_names`, which names one axis and
  // leaves another unnamed. Only the last two axes are read here, so an
  // unnamed time or band axis in front of them is no reason to refuse the
  // store.
  if ([yName, xName].some(d => typeof d !== 'string' || d === '')) {return null;}
  const known = (name, list) => list.includes(String(name).toLowerCase());
  if (!known(yName, Y_DIM_NAMES) || !known(xName, X_DIM_NAMES)) {return null;}
  return [yName, xName];
}

// The origin and spacing implied by three cell centres of an axis of `length`
// cells: the first two give the step, and the last says whether that step held
// all the way along. Only those three are needed, which is why the reader
// below fetches three slices rather than the whole axis.
function spacingFromSamples({ first, second, last, length }) {
  if (!(length >= 2)) {return null;}
  const origin = Number(first);
  const step = Number(second) - origin;
  if (!Number.isFinite(origin) || !Number.isFinite(step) || step === 0) {return null;}
  const expectedLast = origin + step * (length - 1);
  const actualLast = Number(last);
  if (!Number.isFinite(actualLast)) {return null;}
  if (Math.abs(actualLast - expectedLast) > Math.abs(step) * SPACING_TOLERANCE) {return null;}
  return { origin, step };
}

/**
 * The origin and spacing of a coordinate array, or null when its spacing is
 * not constant. `values` holds the cell centres in storage order.
 */
export function coordinateSpacing(values) {
  const length = values?.length ?? 0;
  return spacingFromSamples({
    first: values?.[0],
    second: values?.[1],
    last: values?.[length - 1],
    length,
  });
}

// The group paths a coordinate array may live under, nearest first.
//
// CF puts the coordinate arrays beside the variable they label, so a store
// that holds one variable per group keeps them in that group rather than at
// the store root. The root is tried second because a store that writes its
// coordinates once at the top is also common.
function coordinateBases(array) {
  const path = String(array?.path || '/').replace(/\/+$/, '');
  const cut = path.lastIndexOf('/');
  const parent = cut <= 0 ? '/' : path.slice(0, cut);
  return [...new Set([parent, '/'])];
}

function childPath(base, name) {
  return base === '/' ? `/${name}` : `${base}/${name}`;
}

/**
 * The CRS of a CF-style store that STAC does not declare one for.
 *
 * Geographic dimension names settle it: `lat` and `lon` hold degrees, so the
 * grid is EPSG:4326. Dimensions named `y` and `x` say nothing about the
 * projection, so the CF grid-mapping variable is read instead. A store that
 * offers neither is left undescribed, because guessing EPSG:4326 for a
 * projected grid draws it on the other side of the world.
 *
 * @returns `{ code }` or `{ wkt2 }`, or null when the CRS is unknown.
 */
async function inferCrs(root, array, [yName, xName]) {
  const geographic = GEOGRAPHIC_Y_DIM_NAMES.includes(String(yName).toLowerCase())
    && GEOGRAPHIC_X_DIM_NAMES.includes(String(xName).toLowerCase());
  if (geographic) {return { code: 'EPSG:4326' };}

  // The array may name its grid-mapping variable, which is the CF way; the
  // conventional names are tried after it.
  const declared = typeof array?.attrs?.grid_mapping === 'string' ? [array.attrs.grid_mapping] : [];
  const names = [...new Set([...declared, ...GRID_MAPPING_NAMES])];
  for (const base of coordinateBases(array)) {
    for (const name of names) {
      try {
        // The names are tried in order of preference, and the first one that
        // answers settles the CRS.
        // eslint-disable-next-line no-await-in-loop -- see above
        const node = await zarr.open(root.resolve(childPath(base, name)), { kind: 'array' });
        const wkt2 = node.attrs?.crs_wkt ?? node.attrs?.spatial_ref;
        if (typeof wkt2 === 'string' && wkt2 !== '') {return { wkt2 };}
      } catch {
        /* no grid-mapping variable under this name: try the next */
      }
    }
  }
  return null;
}

/**
 * Build GeoZarr group attributes for a store that carries no spatial
 * conventions, by reading its coordinate arrays.
 *
 * The result is the `metadata` override that `ZarrLayer` accepts in place of
 * the group's own attributes. Registration is `node`, because CF coordinates
 * are cell centres and the renderer has to shift them by half a cell to get
 * the cell edges an affine describes.
 *
 * @param root The opened root group.
 * @param array The data array to describe.
 * @param options.crs The CRS as `{ code }` or `{ wkt2 }`. Omitted, it is read
 *   from the store. See inferCrs.
 * @returns The attributes, or null when the grid cannot be described.
 */
export async function geoZarrAttrsFromCoordinates(root, array, { crs = null } = {}) {
  const names = spatialDimNames(array?.dimensionNames);
  if (!names) {return null;}
  const [yName, xName] = names;
  const [height, width] = (array.shape || []).slice(-2);
  const bases = coordinateBases(array);

  // The coordinate array has to label this array's grid, so its length has to
  // match the spatial dimension it names. A store that holds a coarser copy of
  // an axis under the same name would otherwise give full-resolution spacing
  // over half the extent, which places every pixel wrongly and says nothing
  // about it.
  const read = async (name, cells) => {
    for (const base of bases) {
      try {
        // The places a coordinate array may live are tried nearest first, and
        // the nearest one that labels this array wins.
        // eslint-disable-next-line no-await-in-loop -- see above
        const coord = await zarr.open(root.resolve(childPath(base, name)), { kind: 'array' });
        if (coord.shape.length !== 1 || coord.shape[0] !== cells) {continue;}
        const n = coord.shape[0];
        if (n < 2) {return null;}
        // Three cell centres settle a regular axis, so three slices are read
        // rather than the axis itself: a 4-million-cell float64 axis is 32 MB.
        // eslint-disable-next-line no-await-in-loop -- see above
        const [head, tail] = await Promise.all([
          zarr.get(coord, [zarr.slice(0, 2)]),
          zarr.get(coord, [zarr.slice(n - 1, n)]),
        ]);
        return spacingFromSamples({
          first: head.data[0], second: head.data[1], last: tail.data[0], length: n,
        });
      } catch {
        /* no usable coordinate array here: try the next place it may live */
      }
    }
    // A store that names a spatial dimension but ships no coordinate array
    // for it cannot be placed on the map. The caller reports it.
    return null;
  };

  const [y, x] = await Promise.all([read(yName, height), read(xName, width)]);
  if (!y || !x) {return null;}

  const projection = (crs?.wkt2 || crs?.code) ? crs : await inferCrs(root, array, names);
  if (!projection) {return null;}

  const attrs = {
    'spatial:dimensions': [yName, xName],
    'spatial:transform': [x.step, 0, x.origin, 0, y.step, y.origin],
    'spatial:transform_type': 'affine',
    'spatial:shape': [height, width],
    // CF coordinates mark cell centres, which GeoZarr calls `node`.
    'spatial:registration': 'node',
  };
  if (projection.wkt2) {attrs['proj:wkt2'] = projection.wkt2;}
  else {attrs['proj:code'] = projection.code;}
  return attrs;
}

// --- Coordinate reference systems --------------------------------------------

/**
 * Whether the browser can build a transform from a GeoZarr CRS.
 *
 * `ZarrLayer` reprojects every chunk with proj4, so a CRS proj4 cannot
 * understand stops the layer inside its own metadata parse. Checked here, the
 * same failure becomes one message naming the projection.
 *
 * An EPSG code is resolved by the layer over the network, so it is taken on
 * trust. A WKT2 or PROJJSON definition is parsed now, because that is where
 * the gap is: `wkt-parser` maps the common WKT2 projection methods onto
 * proj4's names, and a method it does not know yields a definition proj4
 * rejects.
 *
 * A geostationary satellite grid was that case. `registerGeostationary` now
 * closes it, so the guard runs after the registration and passes such a
 * grid. See `utils/projGeostationary.js`.
 *
 * @param crs The `crs` of parsed GeoZarr metadata.
 * @returns The projection name when it cannot be used, or null when it can.
 */
export async function unusableCrs(crs) {
  if (!crs || crs.code) {return null;}
  const definition = crs.wkt2 ?? crs.projjson;
  if (!definition) {return 'none';}
  // The imports sit outside the try on purpose. A chunk that fails to load is
  // a deployment fault, not a fault in the store's CRS, and reporting it as
  // one would name a projection that is perfectly usable.
  const [{ default: proj4 }, { default: wktParser }] = await Promise.all([
    import('proj4'),
    import('wkt-parser'),
  ]);
  try {
    registerGeostationary(proj4);
    const parsed = wktParser(definition);
    // Building the transform is the test: proj4 throws when the definition
    // names no projection it implements, or lacks a parameter the projection
    // needs.
    proj4(parsed, 'EPSG:4326').forward([0, 0]);
    return null;
  } catch {
    const name = typeof definition === 'string'
      ? definition.match(/METHOD\["([^"]+)"/)?.[1]
      : definition?.conversion?.method?.name;
    return name || 'the declared projection';
  }
}

// --- Codecs ------------------------------------------------------------------
//
// A chunk is compressed with a chain of codecs the store names, and zarrita
// decodes a chunk only when it has every one of them. A store written for a
// Python reader may name a codec that exists only there.
//
// The case this exists for is virtual Zarr over GRIB. dynamical.org publishes
// an Icechunk repository whose chunks point into NOAA's GRIB files and are
// decoded by a `gribberish` codec, which has no JavaScript implementation. The
// store opens, the metadata parses, and every tile read then fails with
// "Unknown codec: gribberish". Checked up front, that becomes one message
// about the store instead of a map of failed tiles.
//
// Codecs are not on zarrita's public `Array` — the metadata is a private field
// and the normalised codec list sits behind an internal symbol — so the
// array's own metadata document is read back through the store. It costs one
// small request, which the store has usually cached from opening the array.
//
// Both Zarr versions are read, because a v2 store names its codecs in a
// different document and under different keys. zarrita normalises a v2
// `compressor` or `filter` to a `numcodecs.<id>` codec and looks that name up
// in the same registry, so naming them the same way here puts both versions
// through one check. Reading `zarr.json` alone would pass every v2 store
// whatever it compresses with.

function metadataDocumentPath(array, document) {
  const path = String(array.path || '/').replace(/\/+$/, '');
  return `${path}/${document}`;
}

async function readJson(store, path) {
  const raw = await store.get(path);
  if (!raw) {return null;}
  return JSON.parse(new TextDecoder().decode(raw));
}

// Every codec name in a v3 array's metadata, including the ones nested inside
// a sharding codec's configuration.
function v3CodecNames(meta) {
  const names = [];
  const walk = (codecs) => {
    if (!Array.isArray(codecs)) {return;}
    for (const codec of codecs) {
      if (typeof codec?.name !== 'string') {continue;}
      names.push(codec.name);
      // `sharding_indexed` holds the codecs of the inner chunks.
      walk(codec.configuration?.codecs);
      walk(codec.configuration?.index_codecs);
    }
  };
  walk(meta.codecs);
  return names;
}

// The same, for a v2 array, named as zarrita names them after conversion.
function v2CodecNames(meta) {
  const names = [];
  if (meta.order === 'F') {names.push('transpose');}
  const numcodec = (spec) => {
    if (typeof spec?.id !== 'string') {return;}
    // zarrita translates this one filter into native v3 codecs it implements,
    // so naming it `numcodecs.fixedscaleoffset` would report a store it can
    // read as unreadable.
    if (spec.id === 'fixedscaleoffset') {names.push('scale_offset');}
    else {names.push(`numcodecs.${spec.id}`);}
  };
  for (const filter of Array.isArray(meta.filters) ? meta.filters : []) {numcodec(filter);}
  numcodec(meta.compressor);
  return names;
}

async function codecNames(array) {
  const v3 = await readJson(array.store, metadataDocumentPath(array, 'zarr.json'));
  if (v3) {return v3CodecNames(v3);}
  const v2 = await readJson(array.store, metadataDocumentPath(array, '.zarray'));
  return v2 ? v2CodecNames(v2) : [];
}

// Codecs zarrita implements in its chunk pipeline rather than in the codec
// registry, so a registry lookup alone would report them missing. Sharding is
// the one that matters: both source.coop stores shard, and a false report
// would refuse the stores this feature exists to draw.
const BUILT_IN_CODECS = new Set(['sharding_indexed']);

/**
 * The codec names an array uses that zarrita cannot decode.
 *
 * @param array The opened array.
 * @returns The unsupported codec names, empty when every one is available.
 */
export async function unsupportedCodecs(array) {
  let names;
  try {
    names = await codecNames(array);
  } catch {
    // The metadata could not be read back. Let the tile reads decide rather
    // than refusing a store that may be fine.
    return [];
  }
  return names.filter(name => !zarr.registry.has(name) && !BUILT_IN_CODECS.has(name));
}

// --- Multiscale spellings ----------------------------------------------------

// Publishers write a pyramid two ways, and a reader meets both.
//
// The `zarr-conventions/multiscales` convention (v0.1, Pilot) makes
// `multiscales` an object with a `layout` array. Each entry names its level in
// `asset`. The GeoZarr v1 mini spec adopts this form, and the italy-aerial
// store declares it by schema URL in `zarr_conventions`.
//
// Earlier GeoZarr drafts make `multiscales` an array, after OME-NGFF. Each
// entry carries a `datasets` array, and each dataset names its level in
// `path`. The FTW global prediction store writes this form.
//
// `@developmentseed/geozarr` reads the object form only, and its schema
// rejects the array as the wrong type. So the array form is rewritten to the
// object form before the parser sees it. The two carry the same facts per
// level: a path, an affine transform, and a shape.

/** Whether the attributes declare a pyramid, in either spelling. */
export function declaresMultiscales(attrs) {
  const multiscales = attrs?.multiscales;
  if (!multiscales) {return false;}
  if (Array.isArray(multiscales)) {
    return multiscales.some(entry => Array.isArray(entry?.datasets) && entry.datasets.length > 0);
  }
  return Array.isArray(multiscales.layout) && multiscales.layout.length > 0;
}

// --- Per-level spatial metadata the convention leaves out --------------------
//
// The convention marks the per-level `spatial:shape` and `spatial:transform`
// optional: "at each resolution level, the spatial:* metadata can be
// overridden with level-specific values as needed". The vendored parser
// requires both of them on every level, so a store that leaves them out is
// refused with "a pyramid the browser cannot read" — which is four of the
// convention's own five geospatial examples.
//
// What a level leaves out is often still arithmetic. A level states its
// resampling in `transform.scale`, "the coordinate transformation from the
// source level (derived_from) to this level", so the scale from the base level
// is the product along the `derived_from` chain. With the group's own
// `spatial:shape` and `spatial:transform`, that gives the level's shape and
// transform. A level that states its transform but no shape can take the
// shape from the group's `spatial:bbox` instead.
//
// The earlier array form states the same thing as `factor`, which is already
// counted from the base level.
//
// Nothing is guessed. A level whose arithmetic is not well defined is left as
// it is, and the caller's "pyramid the browser cannot read" notice still
// reports it.

const SOURCE_SCALE = 1;

// Where the y and x axes sit in a per-axis array of length `length`. The
// convention orders such an array by `spatial:dimensions`.
function spatialAxisIndices(dimensions, length) {
  if (Array.isArray(dimensions) && dimensions.length === length) {
    const find = list => dimensions.findIndex(d => list.includes(String(d).toLowerCase()));
    const y = find(Y_DIM_NAMES);
    const x = find(X_DIM_NAMES);
    return y >= 0 && x >= 0 ? [y, x] : null;
  }
  // A two-element array can only be [y, x]: the convention's spatial
  // conventions put y before x.
  return length === 2 ? [0, 1] : null;
}

// The y and x scale of one level relative to its source level, or null when
// the level states none that can be used.
function relativeScale(entry, dimensions) {
  const scale = entry?.transform?.scale;
  if (!Array.isArray(scale)) {return null;}
  const axes = spatialAxisIndices(dimensions, scale.length);
  if (!axes) {return null;}
  const [sy, sx] = axes.map(axis => Number(scale[axis]));
  if (!(sy > 0) || !(sx > 0)) {return null;}
  // A translation moves the level's origin, and the convention states it in
  // the source level's coordinates rather than in the grid's. Deriving an
  // origin from it would be a guess, so such a level is left alone.
  const translation = entry?.transform?.translation;
  if (Array.isArray(translation) && translation.some(value => Number(value) !== 0)) {return null;}
  return [sy, sx];
}

// The y and x scale of every level counted from the base level, by asset.
function scalesFromBase(entries, dimensions) {
  const byAsset = new Map(entries.map(entry => [entry.asset, entry]));
  const resolved = new Map();
  const walk = (entry, seen) => {
    if (!entry) {return null;}
    if (resolved.has(entry.asset)) {return resolved.get(entry.asset);}
    // A `derived_from` cycle is malformed metadata, and following it would not
    // terminate.
    if (seen.has(entry.asset)) {return null;}
    seen.add(entry.asset);
    let scale = null;
    const factor = Number(entry.factor);
    if (Number.isFinite(factor) && factor > 0) {
      // The array form counts `factor` from the base level already.
      scale = [factor, factor];
    } else {
      const relative = relativeScale(entry, dimensions);
      if (relative) {
        const source = typeof entry.derived_from === 'string'
          ? walk(byAsset.get(entry.derived_from), seen)
          : [SOURCE_SCALE, SOURCE_SCALE];
        if (source) {scale = [relative[0] * source[0], relative[1] * source[1]];}
      }
    }
    resolved.set(entry.asset, scale);
    return scale;
  };
  for (const entry of entries) {walk(entry, new Set());}
  return resolved;
}

function affine(value) {
  return Array.isArray(value) && value.length === 6 && value.every(n => Number.isFinite(Number(n)))
    ? value.map(Number)
    : null;
}

function shape2d(value) {
  return Array.isArray(value) && value.length === 2
    && value.every(n => Number.isInteger(Number(n)) && Number(n) >= 1)
    ? value.map(Number)
    : null;
}

// The group's affine scaled by a level's own scale. An affine maps column and
// row to x and y, so a level whose cells are `sx` by `sy` of the base's
// multiplies the column terms by `sx` and the row terms by `sy`.
function scaledAffine(base, [sy, sx]) {
  const [a, b, c, d, e, f] = base;
  return [a * sx, b * sy, c, d * sx, e * sy, f];
}

function scaledShape([height, width], [sy, sx]) {
  const scaled = [Math.ceil(height / sy), Math.ceil(width / sx)];
  return scaled.every(n => Number.isFinite(n) && n >= 1) ? scaled : null;
}

// A level's shape from the group's bounding box and the level's own affine.
// Only a `pixel`-registered grid can be measured this way, because its box
// covers whole cells; a `node`-registered box covers one cell less.
function shapeFromBbox(bbox, transform, registration) {
  if (registration !== 'pixel') {return null;}
  if (!Array.isArray(bbox) || bbox.length < 4) {return null;}
  const [west, south, east, north] = bbox.slice(0, 4).map(Number);
  const [a, b, , d, e] = transform;
  // A rotated or skewed affine does not measure a box axis by axis.
  if (b !== 0 || d !== 0 || a === 0 || e === 0) {return null;}
  const width = Math.round(Math.abs((east - west) / a));
  const height = Math.round(Math.abs((north - south) / e));
  return [height, width].every(n => Number.isFinite(n) && n >= 1) ? [height, width] : null;
}

// The source `multiscales`, read out of either spelling, or null when it
// declares no pyramid this module can rewrite.
function multiscalesSource(multiscales) {
  if (Array.isArray(multiscales)) {
    const source = multiscales.find(entry => Array.isArray(entry?.datasets) && entry.datasets.length > 0);
    if (!source) {return null;}
    const entries = source.datasets
      .filter(dataset => typeof dataset?.path === 'string')
      .map(dataset => ({ ...dataset, asset: dataset.path }));
    if (entries.length === 0) {return null;}
    return { entries, minimal: true, resamplingMethod: source.resampling_method };
  }
  const layout = multiscales?.layout;
  if (!Array.isArray(layout) || layout.length === 0) {return null;}
  if (!layout.every(entry => typeof entry?.asset === 'string')) {return null;}
  return { entries: layout, minimal: false, resamplingMethod: multiscales.resampling_method };
}

/**
 * The attributes with their `multiscales` in the object form the convention
 * defines, every per-level `spatial:shape` and `spatial:transform` that is
 * derivable filled in, and the levels ordered finest first.
 *
 * Returns the attributes unchanged when they need no rewrite, so a caller can
 * compare by identity.
 */
export function withMultiscalesLayout(attrs) {
  const source = multiscalesSource(attrs?.multiscales);
  if (!source) {return attrs;}

  const dimensions = attrs['spatial:dimensions'];
  const baseAffine = affine(attrs['spatial:transform']);
  const baseShape = shape2d(attrs['spatial:shape']);
  const bbox = attrs['spatial:bbox'];
  const registration = attrs['spatial:registration'] ?? 'pixel';
  const scales = scalesFromBase(source.entries, dimensions);

  let changed = Array.isArray(attrs.multiscales);
  const layout = source.entries.map((entry) => {
    const level = source.minimal ? { asset: entry.asset } : { ...entry };
    const scale = scales.get(entry.asset);
    let transform = affine(entry['spatial:transform']);
    if (transform) {level['spatial:transform'] = entry['spatial:transform'];}
    else if (baseAffine && scale) {
      transform = scaledAffine(baseAffine, scale);
      level['spatial:transform'] = transform;
      changed = true;
    }
    const declaredShape = shape2d(entry['spatial:shape']);
    if (declaredShape) {level['spatial:shape'] = entry['spatial:shape'];}
    else {
      const derived = (baseShape && scale && scaledShape(baseShape, scale))
        || (transform && shapeFromBbox(bbox, transform, registration));
      if (derived) {
        level['spatial:shape'] = derived;
        changed = true;
      }
    }
    return level;
  });

  // The levels are ordered finest first, which is what the parser and every
  // consumer of `meta.levels` reads them as. No order is safe to assume:
  // GeoZarr 0.4 mandates coarsest first, this convention states no order at
  // all, and its own DEM example puts its finest level last.
  const widths = layout.map(level => shape2d(level['spatial:shape']));
  if (widths.every(Boolean)) {
    const order = layout.map((level, i) => i)
      .sort((a, b) => widths[b][1] - widths[a][1] || widths[b][0] - widths[a][0]);
    if (order.some((i, at) => i !== at)) {
      changed = true;
      const sorted = order.map(i => layout[i]);
      layout.length = 0;
      layout.push(...sorted);
    }
  }

  if (!changed) {return attrs;}
  const rewritten = { layout };
  if (source.resamplingMethod) {rewritten.resampling_method = source.resamplingMethod;}
  return { ...attrs, multiscales: rewritten };
}

// --- Level paths -------------------------------------------------------------

// Child array names of a group. A store with consolidated metadata lists them
// without a request; one without it cannot be listed over plain HTTP, so there
// is nothing to return.
function childArrayNames(group) {
  const contents = typeof group.store?.contents === 'function' ? group.store.contents() : null;
  if (!contents) {return [];}
  // A group reached through `resolve('')` carries a trailing slash in its
  // path, because that is what URL resolution leaves there. Appending another
  // separator would make a prefix no listed path starts with.
  const prefix = `${String(group.path || '/').replace(/\/+$/, '')}/`;
  return contents
    .filter(entry => entry.kind === 'array' && entry.path.startsWith(prefix))
    .map(entry => entry.path.slice(prefix.length))
    .filter(name => name !== '' && !name.includes('/'));
}

// The data array inside a level group. A level group holds the data array and
// the coordinate arrays that label it, so the coordinate arrays are discarded
// by name: they are named after the dimensions, and the data array is not.
//
// `preferred` is the variable the caller wants, which settles a level group
// holding more than one. In a level-first pyramid the variable names the array
// inside each level rather than a group of its own, so `rgba` picks `0/rgba`.
function soleArrayName(levelGroup, preferred = null) {
  const names = childArrayNames(levelGroup);
  if (names.length === 0) {return null;}
  if (preferred && names.includes(preferred)) {return preferred;}
  if (names.length === 1) {return names[0];}
  const dimLike = new Set([...Y_DIM_NAMES, ...X_DIM_NAMES, 'band', 'bands', 'time', 'spatial_ref']);
  const data = names.filter(name => !dimLike.has(name.toLowerCase()));
  return data.length === 1 ? data[0] : null;
}

// The data array inside a level group, including the case where the group
// cannot be listed.
//
// Nothing lists the children of an Icechunk repository through zarrita — the
// repository offers `listChildren` and `listNodes`, not `contents` — and plain
// HTTP without consolidated metadata lists nothing at all. The caller already
// knows which variable it wants in those cases, so the name is tried against
// the store instead of looked up in a listing. One failed request settles it.
async function levelArrayName(levelGroup, variable, level) {
  const name = soleArrayName(levelGroup, variable);
  if (name) {return name;}
  if (variable) {
    try {
      await zarr.open(levelGroup.resolve(variable), { kind: 'array' });
      return variable;
    } catch {
      /* the variable is not an array inside this level either */
    }
  }
  throw new Error(`Zarr level "${level}" is a group with no single data array to render`);
}

// Where a level path points.
//
// The convention states that "all paths are relative to the group containing
// the multiscales metadata", and `.` names that group. The paths are resolved
// that way: zarrita's `Location.resolve` reads a leading slash as a path from
// the store root, so a pyramid in a variable group would probe `/0` instead of
// `/temperature/0` — which finds nothing, or finds an unrelated array of the
// same name at the root.
function levelLocation(group, path) {
  return path === '.' ? group : group.resolve(path);
}

/**
 * Correct the level paths of parsed GeoZarr metadata so each one names an
 * array.
 *
 * A multiscale store may write each level as a group that holds the data array
 * beside its coordinate arrays, which is how source.coop's italy-aerial store
 * is laid out: level `0` is a group and the pixels are in `0/rgba`. GeoZarr
 * permits it, and `ZarrLayer` opens each level path as an array, so the paths
 * need the array name appended before it sees them.
 *
 * Every level of a pyramid holds the same variable, so the name is resolved
 * once from the finest level and applied to all of them. A level that is
 * already an array is left alone.
 *
 * @param group The group the level paths are relative to.
 * @param levels The parsed `meta.levels`, finest first.
 * @param variable The variable to pick inside a level group, when the level
 *   holds more than one array.
 * @returns The level paths to use, in the same order.
 */
export async function resolveLevelPaths(group, levels, variable = null) {
  const paths = levels.map(level => level.path);
  if (paths.length === 0) {return paths;}
  const first = paths[0];
  const location = levelLocation(group, first);
  try {
    await zarr.open(location, { kind: 'array' });
    return paths;
  } catch {
    /* not an array: fall through and look for one inside it */
  }
  const levelGroup = await zarr.open(location, { kind: 'group' });
  const name = await levelArrayName(levelGroup, variable, first);
  return paths.map(path => (path === '.' ? name : `${path}/${name}`));
}


// --- The zoom at which a store is cheap enough to draw -----------------------

// A view costs two things, and a Zarr store can be expensive in either one.
//
// Every chunk is a separate HTTP request, so a level with many small chunks is
// expensive in round trips however little data it holds. Every chunk is also
// decompressed and colormapped on the main thread, so a level with few large
// chunks is expensive in pixels however few requests it takes. A budget on one
// alone misjudges the other: 48 chunks is miserly for the 250-pixel chunks of
// the GOES store, whose whole CONUS grid is 60 of them and 3.75 megapixels, and
// generous for the 4096-pixel chunks of a global store, where 48 of them is
// 800 megapixels.
//
// So both are bounded, and the stricter of the two sets the zoom.

/** How many chunk requests one view may cost. */
export const MAX_CHUNKS_PER_VIEW = 256;

/**
 * How many pixels one view may decode. A map window is about one megapixel, so
 * this allows a view to be built from some tens of times the pixels it shows,
 * which covers a partly-covered viewport and the edge chunks around it.
 */
export const MAX_PIXELS_PER_VIEW = 32 * 1024 * 1024;

// How many Web Mercator tiles fit across a typical map window. deck.gl works
// in 512-pixel tiles, so a window around 1,300 pixels wide holds about this
// many, and the viewport spans that many tiles' worth of the world.
export const TILES_ACROSS_SCREEN = 2.5;

/**
 * The lowest map zoom at which a Zarr store may be drawn.
 *
 * deck.gl asks a tiled layer for every tile that meets the viewport at the
 * level it picks for the current zoom, and it picks the coarsest level when
 * zoomed out. A Zarr array with no overviews has one level at full
 * resolution, so a world view of a 4,000,000 by 1,500,000 pixel array asks
 * for its ~375,000 chunks at once. The request never completes and the tab
 * does not survive it.
 *
 * `ZarrLayer` takes `minZoom` and returns no tiles below it, so the guard is a
 * zoom rather than a refusal: the store stays listed, draws nothing while the
 * view is too wide, and draws normally once the view is narrow enough.
 *
 * The derivation. At zoom z the viewport spans `TILES_ACROSS_SCREEN / 2^z` of
 * the world's width, never more than all of it. The data holds `chunksAcross`
 * chunks over `worldFraction` of that width, so it holds
 * `chunksAcross / worldFraction` of them per full world width, and the
 * viewport meets that many times the fraction it spans — but never more than
 * the `chunksAcross` that exist, which is what keeps a small dataset cheap at
 * every zoom however finely it is chunked. A view is square enough that its
 * chunk count is the square of the count across it, so each budget becomes a
 * number of chunks allowed across the view, and the zoom follows from the
 * smaller of the two.
 *
 * @param options.chunksAcross How many chunks the coarsest level spans across
 *   the full width of the data.
 * @param options.worldFraction How much of the world's width the data spans,
 *   from 0 to 1.
 * @param options.chunkPixels How many pixels one chunk holds. Omitted, only
 *   the request budget applies.
 * @returns The minimum zoom, 0 when the level is already cheap at a world view.
 */
export function zarrMinZoom({
  chunksAcross,
  worldFraction,
  chunkPixels = 0,
  maxChunks = MAX_CHUNKS_PER_VIEW,
  maxPixels = MAX_PIXELS_PER_VIEW,
  tilesAcrossScreen = TILES_ACROSS_SCREEN,
}) {
  if (!(chunksAcross > 0) || !(worldFraction > 0)) {return 0;}
  // Each budget, as a number of chunks the view may span.
  const byRequests = Math.sqrt(maxChunks);
  const byPixels = chunkPixels > 0 ? Math.sqrt(maxPixels / chunkPixels) : Infinity;
  const allowedAcross = Math.min(byRequests, byPixels);
  // A chunk bigger than the whole pixel budget can never be afforded by
  // zooming, because one chunk is the least a view can ask for. Hold it to the
  // request budget alone rather than returning an unreachable zoom.
  if (!(allowedAcross >= 1)) {
    return zarrMinZoom({ chunksAcross, worldFraction, maxChunks, tilesAcrossScreen });
  }
  // The whole dataset is already within budget, so no zoom can make it worse.
  if (chunksAcross <= allowedAcross) {return 0;}
  const chunksPerWorld = chunksAcross / Math.min(worldFraction, 1);
  // Chunks across the viewport at zoom z, before the cap:
  //   chunksPerWorld * tilesAcrossScreen / 2^z <= allowedAcross
  const zoom = Math.log2(chunksPerWorld * tilesAcrossScreen / allowedAcross);
  return Math.max(0, Math.ceil(zoom));
}

// How many degrees of longitude a bounding box spans, from 0 exclusive to 360.
function longitudeSpan(bbox) {
  if (!Array.isArray(bbox) || bbox.length < 4) {return 360;}
  // A box with elevation is [west, south, low, east, north, high].
  const west = Number(bbox[0]);
  const east = Number(bbox.length >= 6 ? bbox[3] : bbox[2]);
  if (!Number.isFinite(west) || !Number.isFinite(east)) {return 360;}
  const span = west > east ? east - west + 360 : east - west;
  return span > 0 && span <= 360 ? span : 360;
}

/**
 * The minimum zoom for a parsed GeoZarr pyramid, and whether the store needs
 * one at all.
 *
 * @param meta Parsed GeoZarr metadata.
 * @param chunkSizes The chunk width and height per level, in the same order as
 *   `meta.levels`.
 * @param bbox The data's bounding box in EPSG:4326, used to tell how much of
 *   the world the data covers.
 * @returns `{ minZoom, hasOverviews }`.
 */
export function zarrZoomGuard(meta, chunkSizes, bbox) {
  const levels = meta?.levels || [];
  const hasOverviews = levels.length > 1;
  // The coarsest level is the narrowest one, found by measuring rather than by
  // position: GeoZarr 0.4 orders its levels coarsest first, the multiscales
  // convention states no order at all, and a store may list them either way.
  // `chunkSizes` runs parallel to `levels`, so the chunk comes from the same
  // index as the level it belongs to.
  let at = -1;
  levels.forEach((level, i) => {
    if (!(level?.arrayWidth > 0)) {return;}
    if (at < 0 || level.arrayWidth < levels[at].arrayWidth) {at = i;}
  });
  const coarsest = at >= 0 ? levels[at] : null;
  const chunk = at >= 0 ? chunkSizes[at] : null;
  if (!coarsest || !chunk?.width) {return { minZoom: 0, hasOverviews };}
  const chunksAcross = Math.ceil(coarsest.arrayWidth / chunk.width);
  // A bounding box that crosses the antimeridian has its west edge east of its
  // east edge, which RFC 7946 states and both GeoJSON and STAC follow. Taking
  // the difference then measures the rest of the world instead of the data,
  // and the guard lets a global-resolution store draw at a world view.
  const lonSpan = longitudeSpan(bbox);
  const minZoom = zarrMinZoom({
    chunksAcross,
    worldFraction: Math.min(lonSpan / 360, 1) || 1,
    chunkPixels: chunk.width * (chunk.height || chunk.width),
  });
  return { minZoom, hasOverviews };
}
