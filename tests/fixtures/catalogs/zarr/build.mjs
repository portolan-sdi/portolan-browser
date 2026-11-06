// Build the local Zarr test catalog from the publishers' own STAC metadata.
//
// Run it from the repository root:
//
//   node tests/fixtures/catalogs/zarr/build.mjs
//
// The collections are derived, not written by hand, so the dimensions, the
// variables and the extents are the publishers' and stay checkable against
// their source. What this script adds is what a Portolan catalog has to add
// for the data to draw: a Zarr media type on the asset, and a render.
//
// The four collections cover the four outcomes the browser has to produce.
// See docs/zarr.md.
//
// It fetches each publisher's own STAC metadata live, so it needs network
// access, and it only has to be re-run when that upstream metadata changes.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORTOLAN_EXT = 'https://schemas.portolan-sdi.org/portolan/v0.2.0/schema.json';
const DATACUBE_EXT = 'https://stac-extensions.github.io/datacube/v2.2.0/schema.json';
const RENDER_EXT = 'https://stac-extensions.github.io/render/v2.0.0/schema.json';

const SOURCES = [
  {
    dir: 'dynamical-gfs-analysis',
    source: 'https://stac.dynamical.org/noaa-gfs-analysis/collection.json',
    title: 'NOAA GFS analysis (chunked for time series)',
    // Expected outcome: refused. The store is chunked [1440, 50, 50], so one
    // map tile reads 1440 time steps and draws one.
    expect: 'refused: chunk shape',
    variables: ['temperature_2m', 'precipitation_surface'],
    render: {
      temperature: {
        title: 'Temperature at 2 m (°C)',
        assets: ['icechunk-https'],
        rescale: [[-40, 40]],
        colormap_name: 'magma',
      },
    },
  },
  {
    dir: 'ftw-global-rendered',
    source: 'https://data.source.coop/ftw/global-data/features/zarr/collection.json',
    title: 'FTW global composites, with a render declared',
    // Expected outcome: the same store as the plain FTW collection, drawn in
    // true colour instead of a saturated ramp. The only difference is the
    // render below, which is the point: the store was always drawable and the
    // metadata is what was missing.
    expect: 'draws in true colour from zoom 11',
    variables: [],
    render: {
      // Band order in the store, read from its `band` coordinate:
      // 0 B02, 1 B03, 2 B04, 3 B08 for the harvest composite. `bidx` is
      // 1-based, so B04, B03, B02 is 3, 2, 1. The range is the usual
      // Sentinel-2 surface-reflectance stretch.
      'true-colour': {
        title: 'Sentinel-2 true colour, harvest composite',
        assets: ['data'],
        bidx: [3, 2, 1],
        rescale: [[0, 3000]],
      },
    },
  },
  {
    dir: 'dynamical-gfs-analysis-virtual',
    source: 'https://stac.dynamical.org/noaa-gfs-analysis-virtual/collection.json',
    title: 'NOAA GFS analysis, virtual (GRIB codec)',
    // Expected outcome: refused. The chunks are references into NOAA's GRIB
    // files, decoded by a `gribberish` codec that has no JavaScript build.
    expect: 'refused: codec',
    variables: ['temperature_2m'],
    render: {
      temperature: {
        title: 'Temperature at 2 m (°C)',
        assets: ['icechunk-https'],
        rescale: [[-40, 40]],
        colormap_name: 'magma',
      },
    },
  },
];

// The two source.coop stores have Portolan catalogs already, so they are
// referenced rather than rebuilt. They are listed here for the record.
const EXTERNAL = [
  {
    dir: 'goes-18-fdcc',
    source: 'https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc/collection.json',
    title: 'GOES-18 fire characterisation, CONUS (virtual Zarr over netCDF)',
    expect: 'refused: the browser cannot reproject a geostationary grid',
  },
  {
    dir: 'ftw-global',
    source: 'https://data.source.coop/ftw/global-data/features/zarr/collection.json',
    title: 'Fields of The World global composites (no overviews, no render)',
    expect: 'held back to zoom 11, and saturates because nothing says how to colour it',
  },
];

async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {throw new Error(`${resp.status} ${resp.statusText} for ${url}`);}
  return resp.json();
}

// The collection's Zarr data asset, over https.
//
// It is matched on the media type rather than taken as the first asset,
// because a collection lists its thumbnail and its documentation beside the
// data. The https form is required: publishers list an `s3://` twin that a
// browser cannot read, and dynamical.org lists both.
function zarrAsset(source) {
  const isZarr = (a) => typeof a.type === 'string'
    && (a.type.startsWith('application/vnd.zarr')
      || a.type.startsWith('application/vnd+zarr')
      || a.type.startsWith('application/x-zarr')
      || a.type.startsWith('application/x-icechunk'));
  const entry = Object.entries(source.assets)
    .find(([, a]) => typeof a.href === 'string' && a.href.startsWith('https://') && isZarr(a));
  if (!entry) {
    throw new Error(`No https Zarr asset in ${source.id}`);
  }
  const [key, asset] = entry;
  return [key, { ...asset, roles: asset.roles || ['data'] }];
}

function keepVariables(cubeVariables, names) {
  const kept = {};
  for (const name of names) {
    if (cubeVariables[name]) {kept[name] = cubeVariables[name];}
  }
  // Keep the coordinates, which name the grid.
  for (const [name, v] of Object.entries(cubeVariables)) {
    if (v.type !== 'data') {kept[name] = v;}
  }
  return kept;
}

function bboxFrom(dimensions) {
  const lon = dimensions.longitude || dimensions.x;
  const lat = dimensions.latitude || dimensions.y;
  if (!lon?.extent || !lat?.extent) {return [-180, -90, 180, 90];}
  return [lon.extent[0], lat.extent[0], lon.extent[1], lat.extent[1]];
}

async function buildCollection(spec) {
  const source = await fetchJson(spec.source);
  const [assetKey, asset] = zarrAsset(source);
  const dimensions = source['cube:dimensions'] || {};
  const bbox = bboxFrom(dimensions);
  const renders = Object.fromEntries(
    Object.entries(spec.render).map(([key, r]) => [key, { ...r, assets: [assetKey] }]),
  );

  const collection = {
    type: 'Collection',
    stac_version: '1.1.0',
    stac_extensions: [PORTOLAN_EXT, DATACUBE_EXT, RENDER_EXT],
    id: `${source.id}-zarr-test`,
    title: spec.title,
    description: `${source.description || source.title}\n\nLocal test collection built from ${spec.source} by tests/fixtures/catalogs/zarr/build.mjs. Expected browser outcome: ${spec.expect}.`,
    license: source.license || 'other',
    extent: {
      spatial: { bbox: [bbox] },
      temporal: source.extent?.temporal || { interval: [[null, null]] },
    },
    'cube:dimensions': dimensions,
    'cube:variables': keepVariables(source['cube:variables'] || {}, spec.variables),
    renders,
    links: [
      {
        rel: 'root',
        href: '../catalog.json',
        type: 'application/json',
        title: 'Zarr rendering test catalog',
      },
      { rel: 'parent', href: '../catalog.json', type: 'application/json' },
      { rel: 'via', href: spec.source, type: 'application/json', title: 'Source collection' },
    ],
    assets: { [assetKey]: asset },
  };

  const dir = join(HERE, spec.dir);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'collection.json'), `${JSON.stringify(collection, null, 2)}\n`);
  const variables = Object.values(collection['cube:variables']).filter(v => v.type === 'data');
  console.log(`${spec.dir}: ${variables.length} data variable(s), asset "${assetKey}" (${asset.type}), expect ${spec.expect}`);
}

for (const spec of SOURCES) {
  await buildCollection(spec);
}
console.log('\nReferenced directly, no local collection needed:');
for (const spec of EXTERNAL) {
  console.log(`  ${spec.dir}: ${spec.source} — expect ${spec.expect}`);
}
