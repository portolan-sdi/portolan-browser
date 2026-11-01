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
 * @returns An array of `{ name, title, nodata, dataType, unit }`, possibly
 *   empty.
 */
export function zarrVariables(asset, stac) {
  const cubeVars = asset?.['cube:variables']
    ?? asset?.getMetadata?.('cube:variables')
    ?? stac?.['cube:variables']
    ?? stac?.properties?.['cube:variables'];
  if (cubeVars && typeof cubeVars === 'object') {
    return Object.entries(cubeVars)
      .filter(([name, v]) => v?.type === 'data' && !COORDINATE_NAMES.has(name.toLowerCase()))
      // A variable with fewer than two dimensions has no grid to draw.
      .filter(([, v]) => !Array.isArray(v.dimensions) || v.dimensions.length >= 2)
      .map(([name, v]) => ({
        name,
        title: v.long_name || v.description || name,
        unit: v.unit,
        nodata: v.nodata,
        dataType: v.data_type,
        statistics: v.statistics,
      }));
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
    return await zarr.open(group.resolve(path === '.' ? '' : `/${path}`), { kind: 'array' });
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
  const root = await openZarrRoot(url, { icechunk: isIcechunkAsset(asset), deps });

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
  const attrs = withMultiscalesLayout(group.attrs);
  let declared = null;
  let declaredError = null;
  try {
    declared = parseGeoZarrMetadata(attrs);
  } catch (error) {
    declaredError = error;
  }

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

  // `metadata` stays undefined for a store that describes itself, because then
  // there is nothing to override.
  const metadata = declared
    ? undefined
    : await geoZarrAttrsFromCoordinates(root, probe, { crs: stacCrs(asset) });
  if (!declared && !metadata) {
    throw new ZarrUnsuitableError(
      ZARR_NOTICE_NO_GEO,
      'The Zarr store declares no spatial transform and no coordinate arrays to derive one from',
    );
  }
  const meta = declared ?? parseGeoZarrMetadata(metadata);

  // One index per non-spatial dimension. A band axis takes every band, because
  // a colour composite needs them together; every other axis — time, most
  // often — is pinned to its last index, which for an archive that grows
  // forward in time is the most recent slice.
  const dimensionNames = (probe.dimensionNames || []).filter(Boolean);
  const nonSpatial = dimensionNames.slice(0, Math.max(0, dimensionNames.length - 2));
  const selection = {};
  const used = [];
  for (let i = 0; i < nonSpatial.length; i++) {
    const name = nonSpatial[i];
    const length = probe.shape[i];
    if (isBandDim(name)) {
      selection[name] = null;
      used.push(length);
    } else {
      selection[name] = Math.max(0, length - 1);
      used.push(1);
    }
  }

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

  const chunkSizes = meta.levels.map(() => ({
    width: probe.chunks[probe.chunks.length - 1],
    height: probe.chunks[probe.chunks.length - 2],
  }));
  const { minZoom, hasOverviews } = zarrZoomGuard(meta, chunkSizes, bbox);

  // A pyramid's levels may be groups holding the array, so the paths parsed
  // from the metadata are corrected before the layer opens them.
  const levelPaths = await resolveLevelPaths(group, meta.levels, variable?.name);
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
  const effective = withAssetEmptiness(
    render ?? synthesizeZarrRgbRender(probe, asset), asset)
    ?? renderFromStatistics(variable)
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
