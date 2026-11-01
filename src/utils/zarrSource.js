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
  if (dims.length < 2 || dims.some(d => typeof d !== 'string' || d === '')) {return null;}
  const [yName, xName] = dims.slice(-2);
  const known = (name, list) => list.includes(String(name).toLowerCase());
  if (!known(yName, Y_DIM_NAMES) || !known(xName, X_DIM_NAMES)) {return null;}
  return [yName, xName];
}

/**
 * The origin and spacing of a coordinate array, or null when its spacing is
 * not constant. `values` holds the cell centres in storage order.
 */
export function coordinateSpacing(values) {
  const n = values?.length ?? 0;
  if (n < 2) {return null;}
  const origin = Number(values[0]);
  const step = Number(values[1]) - origin;
  if (!Number.isFinite(origin) || !Number.isFinite(step) || step === 0) {return null;}
  const expectedLast = origin + step * (n - 1);
  const actualLast = Number(values[n - 1]);
  if (!Number.isFinite(actualLast)) {return null;}
  if (Math.abs(actualLast - expectedLast) > Math.abs(step) * SPACING_TOLERANCE) {return null;}
  return { origin, step };
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
 * @param options.crs The CRS as `{ code }` or `{ wkt2 }`. Defaults to
 *   EPSG:4326, which is what CF latitude and longitude coordinates are in.
 * @returns The attributes, or null when the grid cannot be described.
 */
export async function geoZarrAttrsFromCoordinates(root, array, { crs = null } = {}) {
  const names = spatialDimNames(array?.dimensionNames);
  if (!names) {return null;}
  const [yName, xName] = names;

  const read = async (name) => {
    try {
      const coord = await zarr.open(root.resolve(`/${name}`), { kind: 'array' });
      if (coord.shape.length !== 1) {return null;}
      const chunk = await zarr.get(coord, [null]);
      return coordinateSpacing(chunk.data);
    } catch {
      // A store that names a spatial dimension but ships no coordinate array
      // for it cannot be placed on the map. The caller reports it.
      return null;
    }
  };

  const [y, x] = await Promise.all([read(yName), read(xName)]);
  if (!y || !x) {return null;}

  const [height, width] = array.shape.slice(-2);
  const attrs = {
    'spatial:dimensions': [yName, xName],
    'spatial:transform': [x.step, 0, x.origin, 0, y.step, y.origin],
    'spatial:transform_type': 'affine',
    'spatial:shape': [height, width],
    // CF coordinates mark cell centres, which GeoZarr calls `node`.
    'spatial:registration': 'node',
  };
  if (crs?.wkt2) {attrs['proj:wkt2'] = crs.wkt2;}
  else {attrs['proj:code'] = crs?.code || 'EPSG:4326';}
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
  try {
    const [{ default: proj4 }, { default: wktParser }] = await Promise.all([
      import('proj4'),
      import('wkt-parser'),
    ]);
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
// Codecs are not on zarrita's public `Array`, so the array's own metadata
// document is read back through the store. It costs one small request, which
// the store has usually cached from opening the array.

// Every codec name in an array's metadata, including the ones nested inside a
// sharding codec's configuration.
async function codecNames(array) {
  const path = array.path === '/' ? '' : array.path;
  const raw = await array.store.get(`${path}/zarr.json`);
  if (!raw) {return [];}
  const meta = JSON.parse(new TextDecoder().decode(raw));
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
// The `zarr-conventions/multiscales` v1 convention makes `multiscales` an
// object with a `layout` array. Each entry names its level in `asset`. The
// GeoZarr v1 mini spec adopts this form, and the italy-aerial store declares
// it by schema URL in `zarr_conventions`.
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

/**
 * The attributes with any array-form `multiscales` rewritten to the object
 * form the convention defines.
 *
 * Returns the attributes unchanged when they need no rewrite, so a caller can
 * compare by identity.
 */
export function withMultiscalesLayout(attrs) {
  const multiscales = attrs?.multiscales;
  if (!Array.isArray(multiscales)) {return attrs;}
  const source = multiscales.find(entry => Array.isArray(entry?.datasets) && entry.datasets.length > 0);
  if (!source) {return attrs;}
  const layout = source.datasets
    .filter(dataset => typeof dataset?.path === 'string')
    .map(dataset => {
      const level = { asset: dataset.path };
      if (dataset['spatial:transform']) {level['spatial:transform'] = dataset['spatial:transform'];}
      if (dataset['spatial:shape']) {level['spatial:shape'] = dataset['spatial:shape'];}
      return level;
    });
  if (layout.length === 0) {return attrs;}
  const rewritten = { layout };
  if (source.resampling_method) {rewritten.resampling_method = source.resampling_method;}
  return { ...attrs, multiscales: rewritten };
}

// --- Level paths -------------------------------------------------------------

// Child array names of a group. A store with consolidated metadata lists them
// without a request; one without it cannot be listed over plain HTTP, so there
// is nothing to return.
function childArrayNames(group) {
  const contents = typeof group.store?.contents === 'function' ? group.store.contents() : null;
  if (!contents) {return [];}
  const prefix = group.path === '/' ? '/' : `${group.path}/`;
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
  try {
    await zarr.open(group.resolve(first === '.' ? '' : `/${first}`), { kind: 'array' });
    return paths;
  } catch {
    /* not an array: fall through and look for one inside it */
  }
  const levelGroup = await zarr.open(group.resolve(first === '.' ? '' : `/${first}`), { kind: 'group' });
  const name = soleArrayName(levelGroup, variable);
  if (!name) {
    throw new Error(`Zarr level "${first}" is a group with no single data array to render`);
  }
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

/**
 * The minimum zoom for a parsed GeoZarr pyramid, and whether the store needs
 * one at all.
 *
 * @param meta Parsed GeoZarr metadata.
 * @param chunkSizes The chunk width and height per level, finest first.
 * @param bbox The data's bounding box in EPSG:4326, used to tell how much of
 *   the world the data covers.
 * @returns `{ minZoom, hasOverviews }`.
 */
export function zarrZoomGuard(meta, chunkSizes, bbox) {
  const levels = meta?.levels || [];
  const hasOverviews = levels.length > 1;
  // The coarsest level is the last one: `meta.levels` is finest first.
  const coarsest = levels[levels.length - 1];
  const chunk = chunkSizes[chunkSizes.length - 1];
  if (!coarsest || !chunk?.width) {return { minZoom: 0, hasOverviews };}
  const chunksAcross = Math.ceil(coarsest.arrayWidth / chunk.width);
  const lonSpan = Array.isArray(bbox) && bbox.length >= 4
    ? Math.abs(bbox[2] - bbox[0])
    : 360;
  const minZoom = zarrMinZoom({
    chunksAcross,
    worldFraction: Math.min(lonSpan / 360, 1) || 1,
    chunkPixels: chunk.width * (chunk.height || chunk.width),
  });
  return { minZoom, hasOverviews };
}
