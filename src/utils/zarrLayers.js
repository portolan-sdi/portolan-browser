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
  geoZarrAttrsFromCoordinates, isIcechunkAsset, openZarrRoot, resolveLevelPaths, zarrZoomGuard,
} from './zarrSource.js';
import { assetBands, makeZarrRenderTileLoader } from './renders.js';

/** Notice reasons the map surfaces for a Zarr asset it will not draw. */
export const ZARR_NOTICE_CHUNK_SHAPE = 'zarr-chunk-shape';
export const ZARR_NOTICE_NO_GEO = 'zarr-no-geo';
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
const COORDINATE_NAMES = new Set([
  'x', 'y', 'lat', 'latitude', 'lon', 'long', 'longitude',
  'time', 'band', 'bands', 'spatial_ref', 'crs', 'variables',
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

// The node a variable lives at. A variable is a group when it has a pyramid
// and an array when it does not, and `ZarrLayer` accepts either.
async function openVariableNode(zarr, root, name) {
  try {
    return await zarr.open(root.resolve(`/${name}`), { kind: 'group' });
  } catch {
    return zarr.open(root.resolve(`/${name}`), { kind: 'array' });
  }
}

// The array whose chunking and dimension names describe the data: the finest
// level of a pyramid, or the node itself when it is already an array.
// `resolveLevelPaths` does the work of finding the array inside a level that
// is a group, so this only has to ask it for the finest level.
async function firstArray(zarr, group, meta) {
  if ('shape' in group) {return group;}
  try {
    const paths = await resolveLevelPaths(group, meta?.levels ?? [{ path: '.' }]);
    const path = paths[0];
    return await zarr.open(group.resolve(path === '.' ? '' : `/${path}`), { kind: 'array' });
  } catch {
    return null;
  }
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

function isBandDim(name) {
  const lower = String(name).toLowerCase();
  return lower === 'band' || lower === 'bands';
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
  let declared = null;
  try {
    declared = parseGeoZarrMetadata(group.attrs);
  } catch {
    /* no spatial conventions: fall through to the coordinate arrays */
  }

  const probe = await firstArray(zarr, group, declared);
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

  // Both guards below read only metadata, so an unsuitable store is refused
  // before a single chunk is fetched.
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
  const levelPaths = await resolveLevelPaths(group, meta.levels);
  const correctedMetadata = levelPaths.some((path, i) => path !== meta.levels[i].path)
    ? withLevelPaths(metadata ?? group.attrs, levelPaths)
    : metadata;

  const props = {
    id: `stac-zarr-${descriptor.id}`,
    node: group,
    selection,
    opacity: 0.9,
    refinementStrategy: 'best-available',
    maxRequests: 4,
    maxCacheByteSize: 64 * 1024 * 1024,
    // Below this zoom the layer draws nothing rather than asking for every
    // chunk of its coarsest level. See zarrMinZoom.
    minZoom,
  };
  if (correctedMetadata) {props.metadata = correctedMetadata;}

  const { getTileData, renderTile } = makeZarrRenderTileLoader(render || {}, { zarr });
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
