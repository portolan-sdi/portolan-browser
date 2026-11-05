// Turning a Zarr STAC asset into deck.gl layers.
//
// This module holds everything between "the item has a Zarr asset" and "a
// ZarrLayer is on the map": which variables of the store are listed, which
// render colours each one, and whether the store is laid out well enough to
// draw. The map layer (components/maps/StacMapLayer) owns the deck overlay and
// calls in here; opening the store itself lives in utils/zarrSource.
//
// A Zarr store differs from a COG in two ways that matter to the browser.
//
// A COG asset is one picture, so one asset is one layer. A Zarr store holds a
// named variable per measurement — 5 for GOES fire characterisation, 25 for a
// GFS analysis — and each one is its own picture. So one asset becomes one
// layer per variable, listed in the layer control.
//
// A COG always carries overviews and tiles sized for display, because that is
// what makes it a COG. A Zarr store carries whatever chunking its author chose,
// and a store written for time-series analysis is chunked along time. Reading
// one map tile from such a store fetches every time step in the chunk and
// throws all but one away. See chunkAmplification, which measures that from the
// metadata and refuses the store when it is too wasteful to draw.

import {
  declaresMultiscales, geoZarrAttrsFromCoordinates, isIcechunkAsset, openZarrRoot,
  resolveLevelPaths, unsupportedCodecs, unusableCrs, withMultiscalesLayout, zarrZoomGuard,
} from './zarrSource.js';
import { assetBands, makeZarrRenderTileLoader, withAssetEmptiness } from './renders.js';

/** Notice reasons the map surfaces for a Zarr asset it will not draw. */
export const ZARR_NOTICE_CHUNK_SHAPE = 'zarr-chunk-shape';
export const ZARR_NOTICE_NO_GEO = 'zarr-no-geo';
export const ZARR_NOTICE_CODEC = 'zarr-codec';
export const ZARR_NOTICE_CRS = 'zarr-crs';
export const ZARR_NOTICE_ERROR = 'zarr-error';
export const ZARR_NOTICE_ZOOM_IN = 'zarr-zoom-in';

/**
 * How many samples a tile read fetches for every sample it uses, along the
 * dimensions that are not spatial.
 *
 * A chunk is the smallest unit a Zarr read can fetch, and it is fetched and
 * decompressed whole. Along a non-spatial dimension the renderer wants one
 * index (one time step) or a handful (the colour bands), so a chunk that spans
 * 1440 time steps costs 1440 reads' worth of bytes for the one that is drawn.
 *
 * Measured on dynamical.org's GFS analysis, whose `temperature_2m` is chunked
 * `[1440, 50, 50]`: one 50 by 50 tile transfers 1.05 MB and draws 2,500
 * pixels. A global view of that variable is 435 such tiles, so about 450 MB.
 * The same read against GOES, chunked `[1, 250, 250]`, transfers 0.18 MB and
 * draws 62,500 pixels.
 *
 * @param chunkShape The array's chunk shape.
 * @param used How many indexes the selection uses per non-spatial dimension,
 *   in the same order. A pinned dimension uses 1.
 * @returns The amplification factor, 1 when nothing is wasted.
 */
export function chunkAmplification(chunkShape, used) {
  const nonSpatial = chunkShape.slice(0, Math.max(0, chunkShape.length - 2));
  let factor = 1;
  for (let i = 0; i < nonSpatial.length; i++) {
    const chunk = nonSpatial[i];
    const want = used?.[i] ?? 1;
    if (!(chunk > 0)) {continue;}
    factor *= chunk / Math.min(chunk, Math.max(1, want));
  }
  return factor;
}

/**
 * The most a tile read may over-fetch before the store counts as unsuitable
 * for the map. Eight is well past the 1 that a display-chunked store achieves
 * and well short of the 1440 that a time-series-chunked one costs, so it
 * accepts a store chunked a little coarsely and refuses one chunked for
 * another purpose entirely.
 */
export const MAX_CHUNK_AMPLIFICATION = 8;

// Dimension names a variable may carry that are not measurements. A store
// lists its coordinate arrays beside its data arrays, and they are named after
// the dimensions they label.
// Names that label a grid rather than measure something on it. A variable
// with one of these names is an axis, so it is not offered as a layer.
//
// `variables` is not in this list. It looks like a container, but the FTW
// global prediction store names its one data array exactly that, and
// `cube:variables` marks it `"type": "data"`. The declared type decides.
const COORDINATE_NAMES = new Set([
  'x', 'y', 'lat', 'latitude', 'lon', 'long', 'longitude',
  'time', 'band', 'bands', 'spatial_ref', 'crs',
]);

/**
 * The variables of a Zarr asset, from its STAC metadata alone.
 *
 * Three places describe them, in this order of preference:
 *
 *   1. `cube:variables` from the datacube extension, which names the
 *      dimensions of each one. This is the only form that says which
 *      variables are spatial, so it is preferred.
 *   2. `bands`, which a Portolan catalog writes for a Zarr asset with the
 *      name, unit, data type, and nodata value of each variable.
 *   3. Nothing, for a store that is a single array. The store is then opened
 *      and rendered as one unnamed variable.
 *
 * The first two are read together rather than one instead of the other. The
 * datacube extension describes the shape of a variable and little else: it
 * gained `nodata` only in version 2.3.0 and has never carried `statistics` or
 * `long_name` as required fields, while `bands` carries exactly those. The
 * GOES-18 store is the case in point — its `cube:variables` names the five
 * fire variables and their dimensions, and its `bands` holds the no-data
 * value that picks the variable the render was written for (see
 * defaultVariable) and the statistics a ramp is stretched to.
 *
 * @returns An array of `{ name, title, nodata, dataType, unit }`, possibly
 *   empty.
 */
export function zarrVariables(asset, stac) {
  const cubeVars = asset?.['cube:variables']
    ?? asset?.getMetadata?.('cube:variables')
    ?? stac?.['cube:variables']
    ?? stac?.properties?.['cube:variables'];
  if (cubeVars && typeof cubeVars === 'object') {
    const bands = new Map(assetBands(asset)
      .filter(b => typeof b?.name === 'string' && b.name !== '')
      .map(b => [b.name, b]));
    return Object.entries(cubeVars)
      .filter(([name, v]) => v?.type === 'data' && !COORDINATE_NAMES.has(name.toLowerCase()))
      // A variable with fewer than two dimensions has no grid to draw.
      .filter(([, v]) => !Array.isArray(v.dimensions) || v.dimensions.length >= 2)
      .map(([name, v]) => {
        const band = bands.get(name) ?? {};
        return {
          name,
          title: v.long_name || v.description || band.description || band.title || name,
          unit: v.unit ?? band.unit,
          nodata: v.nodata ?? band.nodata,
          dataType: v.data_type ?? band.data_type,
          statistics: v.statistics ?? band.statistics,
        };
      });
  }
  const bands = assetBands(asset);
  if (bands.length > 0) {
    return bands
      .filter(b => typeof b?.name === 'string' && b.name !== '')
      .map(b => ({
        name: b.name,
        title: b.description || b.title || b.name,
        unit: b.unit,
        nodata: b.nodata,
        dataType: b.data_type,
        statistics: b.statistics,
      }));
  }
  return [];
}

/**
 * Pick the variable a render was written for.
 *
 * The render extension names the assets a render applies to, never a variable
 * inside one, so the link has to be inferred. A render's `nodata` is the
 * strongest signal available: it is the physical no-data value of one
 * variable, and the variables of a store rarely share one. GOES fire
 * characterisation is the case in point — its `frp` render carries
 * `nodata: -9`, which is the nodata of `Power` and of none of the other four.
 *
 * Falls back to the first variable, which is the right answer for a store
 * with only one.
 *
 * @returns The chosen variable, or null when there are none.
 */
export function defaultVariable(variables, render) {
  if (variables.length === 0) {return null;}
  const nodata = render?.nodata;
  if (nodata != null) {
    const values = Array.isArray(nodata) ? nodata : [nodata];
    const matched = variables.find(v => v.nodata != null && values.includes(v.nodata));
    if (matched) {return matched;}
  }
  return variables[0];
}

// A render narrowed to one variable: its own nodata replaces the asset-level
// one, and `bidx` is dropped because the variable is selected by name, not by
// band index.
function renderForVariable(render, variable) {
  if (!render) {
    if (variable.nodata == null) {return null;}
    // Nothing says how to colour it, but its no-data value must still be
    // punched out rather than drawn as the low end of a ramp.
    return { nodata: [variable.nodata] };
  }
  if (variable.nodata == null) {return render;}
  const declared = Array.isArray(render.nodata) ? render.nodata : [render.nodata];
  const nodata = [...new Set([...declared, variable.nodata].filter(v => v != null))];
  return { ...render, nodata };
}

/**
 * Build the layer descriptors for one Zarr asset: one per variable, or a
 * single unnamed one for a store that STAC does not describe.
 *
 * The descriptors carry no open store and cost no requests. The store is
 * opened when a descriptor is switched on, which is the same laziness the COG
 * path has: listing a variable is cheap, drawing it is not.
 *
 * @param asset The Zarr asset.
 * @param stac The item or collection it belongs to.
 * @param render The render that targets the asset, or null.
 * @returns An array of descriptors.
 */
export function zarrDescriptors(asset, stac, render) {
  const key = asset.getKey?.() ?? asset.key ?? '';
  const variables = zarrVariables(asset, stac);
  if (variables.length === 0) {
    return [{
      kind: 'zarr',
      id: `zarr:${key}`,
      asset,
      variable: null,
      title: asset.title || key,
      render,
    }];
  }
  const preferred = defaultVariable(variables, render);
  return variables.map(variable => ({
    kind: 'zarr',
    id: `zarr:${key}:${variable.name}`,
    asset,
    variable,
    title: variables.length === 1
      ? (asset.title || variable.title)
      : variable.title,
    // Each variable has its own physical no-data value, so the render that
    // targets the asset is narrowed to the variable it is drawn for. Without
    // this, one variable's sentinel would colour as data in another.
    render: renderForVariable(render, variable),
    preferred: variable === preferred,
  }));
}

function isBandDim(name) {
  const lower = String(name).toLowerCase();
  return lower === 'band' || lower === 'bands';
}

// The node a variable lives at.
//
// A store names its variables in one of two layouts, and both are in use:
//
//   variable-first   /Power              one node per variable, pyramid inside
//   level-first      /0/rgba, /1/rgba    one node per level, variables inside
//
// GOES and the CF-style stores are variable-first, and source.coop's
// italy-aerial store is level-first. Returning the root for the second layout
// is what makes it work: the levels are then resolved from the root, and the
// variable name picks the array inside each one (see resolveLevelPaths).
//
// A level-first store puts its finest level at the root, so the variable also
// resolves to an array directly under the root. That array is one level, and
// the root is the pyramid. So a root that declares a pyramid wins over a
// child array of the same name. The FTW global prediction store is this
// shape: `/variables` is the full-resolution level, and `/2x/variables` and
// its twelve coarser siblings are the rest.
async function openVariableNode(zarr, root, name) {
  const node = root.resolve(`/${name}`);
  try {
    return await zarr.open(node, { kind: 'group' });
  } catch {
    /* not a group of its own */
  }
  if (declaresMultiscales(withMultiscalesLayout(root.attrs))) {return root;}
  try {
    return await zarr.open(node, { kind: 'array' });
  } catch {
    /* nor an array: the store is level-first, so the root holds the levels */
  }
  return root;
}

// The array whose chunking and dimension names describe the data: the finest
// level of a pyramid, or the node itself when it is already an array.
// `resolveLevelPaths` does the work of finding the array inside a level that
// is a group, so this only has to ask it for the finest level.
async function firstArray(zarr, group, meta, variable = null) {
  if ('shape' in group) {return group;}
  try {
    const paths = await resolveLevelPaths(group, meta?.levels ?? [{ path: '.' }], variable);
    const path = paths[0];
    // The path is relative to the group, and so is the resolve: zarrita
    // resolves a path the way a URL does, so a leading slash would start again
    // from the store root and miss the levels of a variable that is a group of
    // its own. `.` is the group itself, which is passed through rather than
    // resolved, because resolving an empty path leaves a trailing slash behind.
    return await zarr.open(path === '.' ? group : group.resolve(path), { kind: 'array' });
  } catch {
    return null;
  }
}

/**
 * A true-colour render for a store that declares none, when the array is a
 * picture rather than a measurement.
 *
 * Three or more 8-bit bands on one axis is what an RGB or RGBA orthophoto
 * looks like, and 8-bit samples are already display values, so the stretch is
 * the full byte range. Without this the single-band path would colour the red
 * channel through a ramp and draw an aerial photograph in viridis.
 *
 * The no-data values come from the asset's bands, so a pixel outside coverage
 * draws transparent rather than black. The compositor drops a pixel only where
 * every colour channel is empty, which is exactly what an uncovered pixel of a
 * priority-merged mosaic holds.
 *
 * @returns The render, or null when the array is not a picture.
 */
export function synthesizeZarrRgbRender(array, asset) {
  const dims = (array?.dimensionNames || []).filter(Boolean);
  const axis = dims.findIndex(isBandDim);
  if (axis === -1 || axis >= dims.length - 2) {return null;}
  if (!(array.shape[axis] >= 3)) {return null;}
  if (array.dtype !== 'uint8') {return null;}
  const nodata = [...new Set(
    assetBands(asset).slice(0, 3).map(b => b?.nodata).filter(v => v != null),
  )];
  return { bidx: [1, 2, 3], rescale: [[0, 255]], nodata };
}

// Rewrite the level paths of a GeoZarr attributes object. Only the multiscale
// layout carries them, so a single-level store needs no change.
function withLevelPaths(attrs, levelPaths) {
  const multiscales = attrs?.multiscales;
  const layout = multiscales?.layout;
  if (!Array.isArray(layout) || layout.length !== levelPaths.length) {return attrs;}
  return {
    ...attrs,
    multiscales: {
      ...multiscales,
      layout: layout.map((level, i) => ({ ...level, asset: levelPaths[i] })),
    },
  };
}

// The CRS a STAC asset declares, for a store that does not declare its own.
function stacCrs(asset) {
  const wkt2 = asset?.['proj:wkt2'] ?? asset?.getMetadata?.('proj:wkt2');
  if (typeof wkt2 === 'string' && wkt2 !== '') {return { wkt2 }; }
  const code = asset?.['proj:code'] ?? asset?.proj_code ?? asset?.getMetadata?.('proj:code');
  if (typeof code === 'string' && code !== '') {return { code };}
  return null;
}

// Whether a render says anything about colour.
//
// A render that names a colormap, a stretch, the bands to composite, or an
// expression to evaluate decides how the samples are coloured. One that holds
// only `nodata` decides which samples are drawn at all, and leaves the colour
// to whatever else can state it.
function statesColour(render) {
  if (!render) {return false;}
  return Boolean(
    render.colormap_name || render.colormap || render.rescale
    || render.bidx || render.expression || render.color_formula,
  );
}

// A render with the no-data values of another render folded in, so that
// replacing a coverage-only render with a colour one keeps the sentinels it
// declared.
function withNodataOf(render, source) {
  if (!render) {return null;}
  const extra = source?.nodata;
  if (extra == null) {return render;}
  const declared = Array.isArray(extra) ? extra : [extra];
  const own = Array.isArray(render.nodata) ? render.nodata : [];
  return { ...render, nodata: [...new Set([...own, ...declared].filter(v => v != null))] };
}

/**
 * A ramp stretched to a variable's declared statistics, for a variable with no
 * render of its own.
 */
function renderFromStatistics(variable) {
  const min = variable?.statistics?.minimum;
  const max = variable?.statistics?.maximum;
  if (typeof min !== 'number' || typeof max !== 'number' || !(max > min)) {return null;}
  const nodata = variable.nodata != null ? [variable.nodata] : [];
  return { colormap_name: 'viridis', rescale: [[min, max]], nodata };
}

// Nothing says how to colour this variable and nothing says what range it
// spans. It still draws, because a saturated image is more use than a blank
// map, but the reason is said out loud: the fix belongs in the collection.
function reportMissingRender(descriptor, array) {
  if (array?.dtype !== 'uint8') {
    console.warn(
      `The Zarr variable "${descriptor.variable?.name ?? descriptor.title}" has no render `
      + 'and no band statistics, so the colour ramp spans 0 to 1 and the image may saturate. '
      + 'Declare a `renders` entry on the collection, or statistics on the variable.'
    );
  }
  return {};
}

/**
 * Whether parsed GeoZarr metadata describes the grid of an array.
 *
 * The test is the shape. A description taken from a parent group belongs to
 * the array only when the array's two spatial dimensions match the size the
 * description states. A mismatch means the group describes a different grid.
 *
 * @param meta Parsed GeoZarr metadata.
 * @param array The zarrita array to check against.
 * @returns True when the description fits the array.
 */
export function describesArray(meta, array) {
  const level = meta?.levels?.[0];
  const shape = array?.shape;
  if (!level || !Array.isArray(shape) || shape.length < 2) {return false;}
  const height = shape[shape.length - 2];
  const width = shape[shape.length - 1];
  return level.arrayWidth === width && level.arrayHeight === height;
}

/**
 * Which index of each non-spatial dimension the map draws.
 *
 * A band axis takes every band, because a colour composite needs them
 * together. Every other axis — time, most often — is pinned to its last index,
 * which for an archive that grows forward in time is the most recent slice.
 *
 * The names are walked at their true positions, never filtered first. The
 * position of a name is also its position in the shape and in the chunk shape,
 * so dropping the unnamed dimensions of a Zarr v3 array would pin a named one
 * to another axis's length: `[null, 'time', 'y', 'x']` over a shape of
 * `[3, 100, 500, 500]` would ask for time index 2 instead of 99, and would
 * cost the chunk waste of the wrong axis.
 *
 * An unnamed dimension gets no entry of its own. `ZarrLayer` keys each slice
 * by dimension name, so it cannot read an axis that has none and refuses the
 * array outright — see zarrDimensionFault, which reports that before a chunk
 * is fetched.
 *
 * @param dimensionNames The array's `dimension_names`, nulls and all.
 * @param shape The array's shape.
 * @returns `selection` for `ZarrLayer`, and `used` for chunkAmplification.
 */
export function zarrSelection(dimensionNames, shape) {
  const names = Array.isArray(dimensionNames) ? dimensionNames : [];
  const lengths = Array.isArray(shape) ? shape : [];
  const selection = {};
  const used = [];
  for (let i = 0; i < Math.max(0, names.length - 2); i++) {
    const name = names[i];
    const length = lengths[i] ?? 1;
    if (typeof name !== 'string' || name === '') {
      used.push(1);
    } else if (isBandDim(name)) {
      selection[name] = null;
      used.push(length);
    } else {
      selection[name] = Math.max(0, length - 1);
      used.push(1);
    }
  }
  return { selection, used };
}

/**
 * Why `ZarrLayer` will refuse this array, or null when it will accept it.
 *
 * The layer has a hard contract on the dimensions of the array it draws: every
 * dimension must be named, and the two spatial ones must be the last two, in y
 * then x order. It checks this itself and throws — but it throws inside
 * deck.gl's layer update, where nothing surfaces the message, so the map goes
 * blank and says nothing. Checked here, the same refusal becomes a notice.
 *
 * Only the metadata is read, so no chunk is fetched to find this out.
 *
 * The check needs the parsed metadata because `meta.axes` is what names the
 * spatial dimensions. A store described from its coordinate arrays cannot fail
 * it: those names are taken from the array's own last two dimensions (see
 * spatialDimNames).
 *
 * @param meta Parsed GeoZarr metadata.
 * @param array The probed zarrita array.
 * @returns A sentence naming the dimensions at fault, or null.
 */
export function zarrDimensionFault(meta, array) {
  const shape = Array.isArray(array?.shape) ? array.shape : null;
  if (!shape || shape.length < 2) {
    return `the array has ${shape?.length ?? 0} dimensions, so it holds no grid to draw`;
  }
  const axes = meta?.axes;
  if (!Array.isArray(axes) || axes.length === 0) {return null;}
  const names = array.dimensionNames;
  if (!Array.isArray(names) || names.length !== shape.length) {
    return 'the array names none of its dimensions, so its spatial axes cannot be told apart';
  }
  const unnamed = names.findIndex(name => typeof name !== 'string' || name === '');
  if (unnamed !== -1) {
    return `dimension ${unnamed} of the array has no name, and every dimension must be named`;
  }
  const y = axes[meta.yAxisIndex ?? 0];
  const x = axes[meta.xAxisIndex ?? 1];
  const [lastY, lastX] = names.slice(-2);
  if (lastY !== y || lastX !== x) {
    return `the spatial dimensions "${y}" and "${x}" are not the last two of `
      + `[${names.join(', ')}], and the browser cannot transpose an array`;
  }
  return null;
}

// Run a call that may fail for a reason of its own — a store that is not
// there, a metadata document that will not parse — and give the failure a
// notice reason.
//
// A `ZarrUnsuitableError` carries its reason, and the map turns that into a
// sentence. A bare `Error` carries none, so the map used to drop it: the layer
// was switched on, nothing drew, and nothing said why. The generic reason
// stands in for the ones that name a specific fault.
async function orZarrError(message, run) {
  try {
    return await run();
  } catch (error) {
    if (error instanceof ZarrUnsuitableError) {throw error;}
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_ERROR,
      `${message}: ${error?.message ?? error}`,
    );
  }
}

// One pyramid level's array, or null when it cannot be opened.
//
// The path is resolved relative to the group, which is how `ZarrLayer` opens
// its own levels, so the chunking read here is the chunking of the array the
// layer will read. A leading slash would resolve from the store root instead
// — zarrita resolves a path the way a URL does — and would miss the levels of
// a variable that is a group of its own.
function openLevelArray(zarr, group, path) {
  if (path === '.') {return Promise.resolve(group);}
  return zarr.open(group.resolve(path), { kind: 'array' }).catch(() => null);
}

/**
 * Open a Zarr descriptor's store and build the `ZarrLayer` props for it.
 *
 * This is where the store is first touched, so it is also where a store that
 * cannot be drawn is detected. It throws a `ZarrUnsuitableError` carrying a
 * notice reason, which the caller turns into a message, rather than failing
 * silently or drawing something wrong.
 *
 * @param descriptor A descriptor from zarrDescriptors.
 * @param options.ZarrLayer The layer class, for reading its defaults.
 * @param options.zarr The zarrita module.
 * @param options.bbox The item's bounding box in EPSG:4326.
 * @param options.deps Injected loaders, for tests.
 * @returns The props for a `ZarrLayer`.
 */
export async function makeZarrLayerProps(descriptor, { zarr, bbox, deps = null }) {
  const { asset, variable, render } = descriptor;
  const url = asset.getAbsoluteUrl?.() || asset.href;
  const root = await orZarrError(
    `Could not open the Zarr store at ${url}`,
    () => openZarrRoot(url, { icechunk: isIcechunkAsset(asset), deps }),
  );

  const parseGeoZarrMetadata = deps?.parseGeoZarrMetadata
    ?? (await import('@developmentseed/geozarr')).parseGeoZarrMetadata;

  // The variable is a child group of the store (a multiscale pyramid) or a
  // child array (a single level). `ZarrLayer` resolves a group itself, so the
  // path is only needed here to find the array whose chunking and dimensions
  // decide whether the store is drawable.
  const group = variable?.name
    ? await openVariableNode(zarr, root, variable.name)
    : root;

  // A store that follows the spatial conventions describes itself. One that
  // does not is described from its coordinate arrays — see
  // geoZarrAttrsFromCoordinates — which is what a CF-style store needs.
  //
  // The attributes are normalised first, because a pyramid has two spellings
  // in the wild. See withMultiscalesLayout.
  const ownAttrs = withMultiscalesLayout(group.attrs);
  let declaredError = null;
  const parse = (candidate) => {
    try {
      return parseGeoZarrMetadata(candidate);
    } catch (error) {
      declaredError = error;
      return null;
    }
  };

  let declared = parse(ownAttrs);

  // A store may describe its grid once on the root group and hold each
  // variable in a child array. The child array then carries no spatial
  // attributes of its own. Read the root's description in that case.
  //
  // The description must also reach the layer. The layer reads the GeoZarr
  // attributes of the node it is given, and that node is the child array, so
  // the root's attributes are passed as the override below.
  //
  // The GOES-18 store has this shape. It puts `spatial:transform` and
  // `proj:wkt2` on the root and holds one array per fire variable.
  let inherited = null;
  if (!declared && group !== root) {
    const rootAttrs = withMultiscalesLayout(root.attrs);
    const fromRoot = parse(rootAttrs);
    if (fromRoot) {
      declared = fromRoot;
      inherited = rootAttrs;
    }
  }

  const attrs = inherited ?? ownAttrs;

  // A store that declares a pyramid the parser cannot read must say so. The
  // coordinate arrays describe one level, so falling back to them silently
  // would report a store with 14 levels as a store with no overviews.
  if (!declared && declaresMultiscales(attrs)) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_NO_GEO,
      `The Zarr store declares a multiscale pyramid the browser cannot read: ${declaredError?.message ?? 'unknown reason'}`,
    );
  }

  const probe = await firstArray(zarr, group, declared, variable?.name);
  if (!probe) {
    throw new ZarrUnsuitableError(ZARR_NOTICE_NO_GEO, 'The Zarr store has no array to render');
  }

  // An inherited description must fit the array it describes. A root that
  // describes a different grid would put every chunk in the wrong place, so
  // the coordinate arrays are the safer source then.
  if (inherited && !describesArray(declared, probe)) {
    declared = null;
    inherited = null;
  }

  // `metadata` stays undefined for a store that describes itself, because then
  // there is nothing to override. An inherited description is always passed,
  // because the layer cannot read it off the array it is given.
  const metadata = declared
    ? inherited ?? undefined
    : await geoZarrAttrsFromCoordinates(root, probe, { crs: stacCrs(asset) });
  if (!declared && !metadata) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_NO_GEO,
      'The Zarr store declares no spatial transform and no coordinate arrays to derive one from',
    );
  }
  const meta = declared ?? await orZarrError(
    'The Zarr store describes a grid the browser cannot read',
    () => parseGeoZarrMetadata(metadata),
  );

  // The layer's own contract on the array's dimensions, checked where the
  // answer can be reported. See zarrDimensionFault.
  const fault = zarrDimensionFault(meta, probe);
  if (fault) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_NO_GEO,
      `The Zarr store cannot be drawn: ${fault}`,
    );
  }

  const { selection, used } = zarrSelection(probe.dimensionNames, probe.shape);

  // Every guard below reads metadata only, so an unsuitable store is refused
  // before a single chunk is fetched.
  const missing = await unsupportedCodecs(probe);
  if (missing.length > 0) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_CODEC,
      `The Zarr store uses codecs this browser cannot decode: ${missing.join(', ')}`,
      { codecs: missing.join(', ') },
    );
  }

  const projection = await unusableCrs(meta.crs);
  if (projection) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_CRS,
      `The browser cannot build a transform for the projection "${projection}"`,
      { projection },
    );
  }

  const amplification = chunkAmplification(probe.chunks, used);
  if (amplification > MAX_CHUNK_AMPLIFICATION) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_CHUNK_SHAPE,
      `Reading one map tile would fetch ${Math.round(amplification)} times the data it draws`,
      { amplification: Math.round(amplification), max: MAX_CHUNK_AMPLIFICATION },
    );
  }

  // A pyramid's levels may be groups holding the array, so the paths parsed
  // from the metadata are corrected before the layer opens them.
  const levelPaths = await orZarrError(
    'The Zarr store declares levels the browser cannot resolve to arrays',
    () => resolveLevelPaths(group, meta.levels, variable?.name),
  );

  // The chunking of each level, which the zoom guard pairs with that level's
  // width to count the chunks a view of it costs.
  //
  // The probe describes the finest level only, and a pyramid may chunk its
  // coarse levels differently: a store written with a fixed 512-pixel chunk
  // puts its whole top level in one chunk, while one written with a fixed
  // chunk count keeps a 4096-pixel chunk there. Repeating the finest level's
  // chunking would then move the minimum zoom in either direction. So the
  // coarsest level's own array is opened for its chunk shape, which is one
  // metadata read on the store that is already open and no chunk fetches.
  const chunkOf = array => ({
    width: array.chunks[array.chunks.length - 1],
    height: array.chunks[array.chunks.length - 2],
  });
  const chunkSizes = meta.levels.map(() => chunkOf(probe));
  // The entry stays parallel to `meta.levels`, so the guard can pair a level
  // with its own chunking. Index 0 is the probe's level, whichever end of the
  // pyramid that is; the coarsest is the narrowest.
  const coarsest = meta.levels.reduce(
    (best, level, i) => (level.arrayWidth < meta.levels[best].arrayWidth ? i : best),
    0,
  );
  if (coarsest !== 0) {
    const array = await openLevelArray(zarr, group, levelPaths[coarsest]);
    if (Array.isArray(array?.chunks) && array.chunks.length >= 2) {
      chunkSizes[coarsest] = chunkOf(array);
    }
  }
  const { minZoom, hasOverviews } = zarrZoomGuard(meta, chunkSizes, bbox);
  const correctedMetadata = levelPaths.some((path, i) => path !== meta.levels[i].path)
    ? withLevelPaths(metadata ?? attrs, levelPaths)
    : metadata;

  // Which node the layer gets, and the attributes it reads them with.
  //
  // A single-level store whose data sits in a child array is the case the
  // level paths cannot express: there is no `multiscales` layout to correct,
  // so the layer would resolve the level as `.` and try to open the group
  // itself as an array. `ZarrLayer` takes a pre-opened array for exactly this,
  // and then never resolves a path — but it reads the GeoZarr attributes off
  // whatever node it is given, and the spatial conventions live on the parent
  // group, so they are passed explicitly. The FTW global store is this shape.
  const singleLevelChild = meta.levels.length === 1 && !('shape' in group) && probe !== group;
  const node = singleLevelChild ? probe : group;
  const metadataOverride = singleLevelChild
    ? (metadata ?? attrs)
    : correctedMetadata;

  const props = {
    id: `stac-zarr-${descriptor.id}`,
    node,
    selection,
    opacity: 0.9,
    // Keep the coarser tiles on the map until the finer level decodes.
    refinementStrategy: 'best-available',
    // The cap on tile requests in flight.
    //
    // deck.gl aborts a tile request when the viewport no longer selects that
    // tile. It does this as soon as the number of requests in flight is more
    // than this cap. One viewport of a 1024-pixel chunked store selects 4 to
    // 6 chunks, so a cap of 4 sits below one viewport. Each frame of a zoom
    // then aborts the chunks of the frame before it. No level completes, so
    // 'best-available' finds no loaded ancestor to stand in. The map drops
    // straight to the basemap, with no coarse image in between.
    //
    // 16 holds two viewports of a large window. A fast zoom from zoom 9 to
    // zoom 16 over the italy-aerial mosaic gives 81 blank frames at a cap of
    // 4, and 0 at a cap of 16.
    //
    // The COG path keeps its lower cap. A COG tile is 256 to 512 pixels and
    // reads from one open file, so its levels complete inside the cap.
    maxRequests: 16,
    maxCacheByteSize: 64 * 1024 * 1024,
    // Below this zoom the layer draws nothing rather than asking for every
    // chunk of its coarsest level. See zarrMinZoom.
    minZoom,
  };
  if (metadataOverride) {props.metadata = metadataOverride;}

  // What to colour the variable with, when the collection declares nothing.
  //
  // An orthophoto needs no render: its bands are already display values, so a
  // picture is recognised and composited as true colour. A measurement does
  // need one, because a ramp has to know the range it spans. Declared
  // statistics supply that range, which is the same source the COG path
  // stretches an un-rendered asset from (see synthesizeRgbRender).
  //
  // A measurement with neither a render nor statistics is drawn against the
  // default 0 to 1 range, which for anything else saturates to one flat
  // colour. That is a gap in the collection's metadata, so it is reported
  // rather than guessed at.
  // A declared render states colour, not coverage. The asset's own bands say
  // where the store holds no data, so they are folded into either render. The
  // italy-aerial mosaic is the case: it declares a true-colour render with no
  // `nodata`, and its fourth band is the coverage mask that keeps the sea
  // transparent. See withAssetEmptiness.
  //
  // The descriptor's render may hold no colour at all. A variable with a
  // no-data value and no render of its own gets `{ nodata: [...] }`, so that
  // its sentinel is punched out (see renderForVariable), and that is a
  // statement about coverage only. Taking it as the colour source would leave
  // the ramp on its default 0 to 1 range and skip the statistics that state
  // the real one, which is what a variable carrying both used to draw.
  const base = statesColour(render)
    ? render
    : (synthesizeZarrRgbRender(probe, asset) ?? withNodataOf(renderFromStatistics(variable), render) ?? render);
  const effective = withAssetEmptiness(base, asset)
    ?? reportMissingRender(descriptor, probe);
  const { getTileData, renderTile } = makeZarrRenderTileLoader(effective, { zarr });
  props.getTileData = getTileData;
  props.renderTile = renderTile;

  return { props, minZoom, hasOverviews, amplification };
}

/** A store that cannot be drawn, with the notice reason that says why. */
export class ZarrUnsuitableError extends Error {
  constructor(reason, message, detail = {}) {
    super(message);
    this.name = 'ZarrUnsuitableError';
    this.reason = reason;
    this.detail = detail;
  }
}
