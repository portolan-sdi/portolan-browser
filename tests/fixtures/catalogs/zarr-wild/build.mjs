// Build the "wild Zarr/Icechunk" local test catalog.
//
// Unlike tests/fixtures/catalogs/zarr/build.mjs, these collections are not
// derived live from a publisher's own STAC metadata at build time (most of
// these stores have no STAC collection of their own). Instead, every array
// shape, dtype, chunk/shard shape, codec, CRS and extent below was read
// directly from each store's own Zarr/Icechunk metadata (.zattrs/.zarray or
// zarr.json), captured by curl during research for this fixture set, or
// taken from an upstream STAC item (EOPF) where one exists. Facts marked
// "estimated" in a description were not independently confirmed.
//
// Run it from the repository root:
//
//   node tests/fixtures/catalogs/zarr-wild/build.mjs
//
// This script is idempotent and does not hit the network; it just writes
// the hand-verified collection.json files below plus the catalog.json index.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PORTOLAN_EXT = 'https://schemas.portolan-sdi.org/portolan/v0.2.0/schema.json';
const DATACUBE_EXT = 'https://stac-extensions.github.io/datacube/v2.2.0/schema.json';
const RENDER_EXT = 'https://stac-extensions.github.io/render/v2.0.0/schema.json';

const ROOT_LINK = { rel: 'root', href: '../catalog.json', type: 'application/json', title: 'Wild Zarr/Icechunk test catalog' };
const PARENT_LINK = { rel: 'parent', href: '../catalog.json', type: 'application/json' };

function via(href, title) {
  return { rel: 'via', href, type: 'application/json', title };
}

function base(id, { title, description, license, bbox, interval, extensions = [DATACUBE_EXT], extraLinks = [] }) {
  return {
    type: 'Collection',
    stac_version: '1.1.0',
    stac_extensions: [PORTOLAN_EXT, ...extensions],
    id,
    title,
    description,
    license,
    extent: {
      spatial: { bbox: [bbox] },
      temporal: { interval: [interval] },
    },
    links: [ROOT_LINK, PARENT_LINK, ...extraLinks],
  };
}

const COLLECTIONS = [];

// ---------------------------------------------------------------------------
// MUST-RENDER TIER
// ---------------------------------------------------------------------------

// 1. carbonplan-4d-climate
COLLECTIONS.push({
  dir: 'carbonplan-4d-climate',
  doc: {
    ...base('carbonplan-4d-climate', {
      title: 'CarbonPlan 4D climate demo (tavg/prec monthly climatology)',
      description: 'CarbonPlan ndpyramid demo: a Zarr V2, consolidated, carbonplan/ndpyramid "multiscales" (reduce-type) pyramid of 6 levels (path "0" coarsest 128x128 .. "5" finest 4096x4096), each level a `<level>/climate` array with dims [band, month, y, x] in EPSG:3857 (WGS 84 / Pseudo-Mercator), zlib-compressed float32, fill value 9.969209968386869e+36. The `band` coordinate is a 2-element string array; decoding the level-0 chunk confirms the order is `["tavg", "prec"]` (band 0 = mean monthly temperature, band 1 = monthly precipitation) -- this is a demo/example dataset with no documented units, so the render below assumes tavg is already in degrees Celsius, the common CarbonPlan demo convention. License is unclear for this GCS demo bucket; linked via the CarbonPlan maps project.\n\nExpected browser outcome: draws (viridis ramp on the tavg band, finest level).',
      license: 'proprietary',
      bbox: [-179.9, -85.06, 179.9, 85.06],
      interval: [null, null],
      extensions: [DATACUBE_EXT, RENDER_EXT],
      extraLinks: [via('https://storage.googleapis.com/carbonplan-maps/v2/demo/4d/tavg-prec-month/.zattrs', 'Source .zattrs (ndpyramid multiscales)')],
    }),
    'cube:dimensions': {
      band: { type: 'other', values: ['tavg', 'prec'], description: 'band 0 = tavg (mean monthly temperature), band 1 = prec (monthly precipitation), read from the band coordinate array' },
      month: { type: 'other', extent: [1, 12], unit: 'month of year' },
      x: { type: 'spatial', axis: 'x', extent: [-20026376.39, 20026376.39], reference_system: 3857 },
      y: { type: 'spatial', axis: 'y', extent: [-20048966.1, 20048966.1], reference_system: 3857 },
    },
    'cube:variables': {
      climate: {
        dimensions: ['band', 'month', 'y', 'x'],
        type: 'data',
        chunks: [2, 12, 4096, 4096],
        description: 'Finest level (path "5"); chunks equal the full array at each level (one chunk per level, ndpyramid style). Coarser levels 0-4 have shape/chunks [2,12,128*2^n,128*2^n].',
        dtype: 'float32',
        nodata: 9.969209968386869e+36,
      },
    },
    renders: {
      tavg: {
        title: 'Mean monthly temperature (tavg), viridis',
        assets: ['data'],
        bidx: [1],
        rescale: [[-30, 30]],
        colormap_name: 'viridis',
      },
    },
    assets: {
      data: {
        href: 'https://storage.googleapis.com/carbonplan-maps/v2/demo/4d/tavg-prec-month/',
        type: 'application/vnd.zarr',
        title: 'CarbonPlan 4D demo climate pyramid (Zarr V2, consolidated, EPSG:3857)',
        description: 'ndpyramid "reduce" multiscales, levels "0".."5" (6 levels), each level a single `<level>/climate` array covering the full Web Mercator extent at increasing resolution.',
        roles: ['data', 'cloud-optimized'],
      },
    },
  },
});

// 2. carbonplan-2d-tavg
COLLECTIONS.push({
  dir: 'carbonplan-2d-tavg',
  doc: {
    ...base('carbonplan-2d-tavg', {
      title: 'CarbonPlan 2D tavg demo (unconsolidated)',
      description: 'Same CarbonPlan ndpyramid family as carbonplan-4d-climate, but a single-variable store: each level is a `<level>/tavg` array with dims [y, x] only (no band/month axes), same EPSG:3857 pyramid (GeoTransform/origin confirmed identical to the 4D store). The store has **no `.zmetadata`** (confirmed by a 404 on the consolidated-metadata request), so a reader must list each level group individually rather than opening consolidated metadata in one request.\n\nExpected browser outcome: draws (viridis ramp).',
      license: 'proprietary',
      bbox: [-179.9, -85.06, 179.9, 85.06],
      interval: [null, null],
      extensions: [DATACUBE_EXT, RENDER_EXT],
      extraLinks: [via('https://storage.googleapis.com/carbonplan-maps/v3/demo/2d/tavg/0/tavg/.zarray', 'Source .zarray, level 0')],
    }),
    'cube:dimensions': {
      x: { type: 'spatial', axis: 'x', extent: [-20026376.39, 20026376.39], reference_system: 3857 },
      y: { type: 'spatial', axis: 'y', extent: [-20048966.1, 20048966.1], reference_system: 3857 },
    },
    'cube:variables': {
      tavg: {
        dimensions: ['y', 'x'],
        type: 'data',
        description: 'Per-level shape/chunks are equal (one chunk per level, ndpyramid style): level 0 is [128,128], growing by 2x per level.',
        dtype: 'float32',
        nodata: 9.969209968386869e+36,
      },
    },
    renders: {
      tavg: {
        title: 'Mean monthly temperature (tavg), viridis',
        assets: ['data'],
        rescale: [[-30, 30]],
        colormap_name: 'viridis',
      },
    },
    assets: {
      data: {
        href: 'https://storage.googleapis.com/carbonplan-maps/v3/demo/2d/tavg/',
        type: 'application/vnd.zarr',
        title: 'CarbonPlan 2D demo tavg pyramid (Zarr V2, unconsolidated, EPSG:3857)',
        description: 'ndpyramid multiscales, no consolidated metadata (.zmetadata is absent).',
        roles: ['data'],
      },
    },
  },
});

// 3. tessera-life-biodiversity
COLLECTIONS.push({
  dir: 'tessera-life-biodiversity',
  doc: {
    ...base('tessera-life-biodiversity', {
      title: 'LIFE: land-cover change impacts on future extinctions, v1.01',
      description: 'Global 1 arc-minute (1/60 deg, EPSG:4326) maps of the change in expected number of extinctions per km2 of land converted to arable, or restored to natural habitat, under five persistence-habitat loss curves (Eyres et al. 2025, Phil. Trans. R. Soc. B). Zarr V3, consolidated, zarr-conventions multiscales v0.1 with 5 levels (0 finest 10800x21600 at 1/60 deg .. 4 coarsest 675x1350), zstd level-5 codec, float32. 12 data variables total: 5 "score" arrays per scenario (arable_0.1/0.25/0.5/1.0/gompertz, restore_0.1/0.25/0.5/1.0/gompertz) plus one area-changed array per scenario (arable_area_changed, restore_area_changed). Score arrays have a leading taxon dim of size 5 (all, AMPHIBIA, AVES, MAMMALIA, REPTILIA); area arrays are [lat, lon] only. Values are NaN where no land changes under the scenario.\n\nThe brief for this fixture assumed LIFE scores were "proportions-like" and suggested a [0,1] rescale; the store\'s own per-variable statistics show otherwise: arable_0.25 (taxon "all") ranges about [-0.37, 0.76] extinctions/km2 and restore_0.25 ranges about [-0.69, 0.12] -- a signed, roughly-symmetric-about-zero impact score, not a bounded proportion. The render below uses a diverging colormap and the arable_0.25 (the paper\'s main analysis) real range instead.\n\nTerms of reference prohibit commercial use and redistribution without permission from IBAT; license is declared "proprietary" with a link to the Zenodo record rather than a standard open license.\n\nExpected browser outcome: draws (diverging ramp on arable_0.25, taxon "all").',
      license: 'proprietary',
      bbox: [-180, -90, 180, 90],
      interval: [null, null],
      extensions: [DATACUBE_EXT, RENDER_EXT],
      extraLinks: [
        via('https://zenodo.org/records/14945383', 'Zenodo record v1.01'),
        via('https://data.source.coop/tessera/life/v1.01/zarr.json', 'Source zarr.json'),
      ],
    }),
    'cube:dimensions': {
      taxon: { type: 'other', values: ['all', 'AMPHIBIA', 'AVES', 'MAMMALIA', 'REPTILIA'] },
      lat: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326, unit: 'degree_north' },
      lon: { type: 'spatial', axis: 'x', extent: [-180, 180], reference_system: 4326, unit: 'degree_east' },
    },
    'cube:variables': {
      'arable_0.25': {
        dimensions: ['taxon', 'lat', 'lon'],
        type: 'data',
        chunks: [1, 1024, 1024],
        dtype: 'float32',
        unit: 'extinctions km-2',
        long_name: "LIFE score, arable scenario, power-law persistence curve, exponent z = 0.25 (the paper's main analysis)",
        statistics: { minimum: -0.3735502362251282, maximum: 0.7603037357330322 },
      },
      'restore_0.25': {
        dimensions: ['taxon', 'lat', 'lon'],
        type: 'data',
        chunks: [1, 1024, 1024],
        dtype: 'float32',
        unit: 'extinctions km-2',
        long_name: "LIFE score, restore scenario, power-law persistence curve, exponent z = 0.25 (the paper's main analysis)",
        statistics: { minimum: -0.6929922699928284, maximum: 0.12316499650478363 },
      },
      arable_area_changed: {
        dimensions: ['lat', 'lon'],
        type: 'data',
        chunks: [1024, 1024],
        dtype: 'float32',
        unit: 'm2',
        long_name: 'area of land changed per pixel, arable scenario',
      },
      restore_area_changed: {
        dimensions: ['lat', 'lon'],
        type: 'data',
        chunks: [1024, 1024],
        dtype: 'float32',
        unit: 'm2',
        long_name: 'area of land changed per pixel, restore scenario',
      },
    },
    renders: {
      'arable-0.25': {
        title: "LIFE score, arable scenario, z=0.25, taxon 'all'",
        assets: ['data'],
        bidx: [1],
        rescale: [[-0.4, 0.8]],
        colormap_name: 'rdbu_r',
      },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/tessera/life/v1.01/',
        type: 'application/vnd.zarr; version=3',
        title: 'LIFE v1.01 (Zarr V3, consolidated, EPSG:4326, 1/60 deg)',
        description: '12 data variables under group "0" (finest level); groups "1".."4" are coarser visualisation overviews (mean of finite values per 2x2 block).',
        roles: ['data', 'cloud-optimized'],
      },
    },
  },
});

// 4. tessera-global-rgb
COLLECTIONS.push({
  dir: 'tessera-global-rgb',
  doc: {
    ...base('tessera-global-rgb', {
      title: 'Tessera global RGB visualization mosaic',
      description: 'A true-colour RGBA visualization mosaic derived from the Tessera geospatial embeddings (geoemb convention), global, EPSG:4326, 0.0001 deg (~10 m). Zarr V3, zarr-conventions multiscales v0.1, 10 levels (path "0" finest 1,800,000 x 3,600,000 .. "9" coarsest 3,000 x 7,827 -- actually shape[0] x shape[1]; see cube:dimensions), blosc/zstd with bitshuffle. Each level group holds an array `rgb` with shape [lat, lon, band(4)] uint8 (RGBA) plus a 4-element `band` coordinate -- **the band axis is last**, not leading as in most of the other fixtures in this catalog; a reader that assumes band-first will misread the array. The store is sparse near the poles (requests there 404; coverage follows the Tessera embeddings footprint, not a filled global grid).\n\nLicense for this GeoTessera-derived product is not published on the source.coop listing at the time of writing; declared "proprietary" with a via link.\n\nExpected browser outcome: draws (RGBA, no render block needed -- the asset is already 3/4-band uint8 colour).',
      license: 'proprietary',
      bbox: [-180, -90, 180, 90],
      interval: [null, null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://data.source.coop/tessera/tessera/zarr/v1/zarr.json', 'Source store root zarr.json')],
    }),
    'cube:dimensions': {
      lat: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326 },
      lon: { type: 'spatial', axis: 'x', extent: [-180, 180], reference_system: 4326 },
      band: { type: 'other', size: 4, description: 'RGBA, trailing axis: array shape is [lat, lon, band], not [band, lat, lon].' },
    },
    'cube:variables': {
      rgb: {
        dimensions: ['lat', 'lon', 'band'],
        type: 'data',
        chunks: [512, 512, 4],
        dtype: 'uint8',
        description: 'Level 0 (finest); shape [1800000, 3600000, 4]. Band is the LAST axis.',
      },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/tessera/tessera/zarr/v1/global_rgb/',
        type: 'application/vnd.zarr; version=3',
        title: 'Tessera global RGB mosaic (Zarr V3, EPSG:4326, ~10 m)',
        description: '10-level multiscales pyramid, group-per-level, trailing band axis, blosc-zstd-bitshuffle codec. Sparse coverage: tiles near the poles return 404.',
        roles: ['data', 'cloud-optimized', 'visual'],
      },
    },
  },
});

// 5. wsf-tracker
COLLECTIONS.push({
  dir: 'wsf-tracker',
  doc: {
    ...base('wsf-tracker', {
      title: 'WSF Tracker: built-up area emergence index, 2016-2026',
      description: 'World Settlement Footprint (WSF) Tracker, mindearth: a categorical int8 index encoding the earliest biannual epoch at which built-up area was first detected per pixel (0 = none/nodata, 1 = 2016-07-01 ... 20 = 2026-01-01, stepping 6 months). Zarr V3, consolidated, zarr-conventions multiscales v1, 13 levels (0 finest 1,536,433 x 4,007,502 .. 12 coarsest 375 x 978), `sharding_indexed` codec (shard 8192x8192, inner chunk 256x256, blosc/zstd, crc32c index), EPSG:4326, bbox [-180.00001, -60.0101, 180.00001, 78.0101]. License confirmed from the source.coop listing: CC BY 3.0 IGO.\n\nExpected browser outcome: draws (categorical ramp, nodata=0, values 1-20).',
      license: 'CC-BY-3.0-IGO',
      bbox: [-180.00001, -60.0101, 180.00001, 78.0101],
      interval: ['2016-07-01T00:00:00Z', '2026-01-01T00:00:00Z'],
      extensions: [DATACUBE_EXT, RENDER_EXT],
      extraLinks: [via('https://data.source.coop/mindearth/wsf/World_WSF_20160701-20260101.zarr/zarr.json', 'Source store root zarr.json')],
    }),
    'cube:dimensions': {
      y: { type: 'spatial', axis: 'y', extent: [-60.0101, 78.0100585990529], reference_system: 4326 },
      x: { type: 'spatial', axis: 'x', extent: [-180.00001488697754, 180.0000148869776], reference_system: 4326 },
    },
    'cube:variables': {
      wsf_tracker: {
        dimensions: ['y', 'x'],
        type: 'data',
        chunks: [8192, 8192],
        shards: [256, 256],
        dtype: 'int8',
        nodata: 0,
        long_name: 'WSF Tracker built-up emergence index',
        description: '0 = no detected built-up area / nodata. Values 1-20 correspond to biannual WSF epochs (1 = 2016-07-01 .. 20 = 2026-01-01).',
        statistics: { minimum: 1, maximum: 20 },
      },
    },
    renders: {
      'wsf-epoch': {
        title: 'WSF built-up emergence epoch',
        assets: ['data'],
        rescale: [[1, 20]],
        colormap_name: 'plasma',
        nodata: 0,
      },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/mindearth/wsf/World_WSF_20160701-20260101.zarr/',
        type: 'application/vnd.zarr; version=3',
        title: 'WSF Tracker (Zarr V3, consolidated, EPSG:4326)',
        description: '13-level multiscales pyramid (min-aggregation overviews), sharded, int8.',
        roles: ['data', 'cloud-optimized'],
      },
    },
  },
});

// 6. eopf-s2-l2a-zarr3
{
  const itemId = 'S2A_MSIL2A_20261105T133251_N0513_R024_T27WWR_20261105T175156';
  const itemBase = 'https://data.eodc.eu/collections/EOPF_ZARR/products/cpm_v300/S02MSIL2A/2026/11/05';
  COLLECTIONS.push({
    dir: 'eopf-s2-l2a-zarr3',
    doc: {
      ...base('eopf-s2-l2a-zarr3', {
        title: 'EOPF Sentinel-2 L2A (GeoZarr, Zarr V3), one pinned item',
        description: `EOPF (ESA/EODC) Sentinel-2 L2A GeoZarr-samples collection "sentinel-2-l2a-zarr3". The EOPF STAC collection rotates its items constantly (new items arrive continuously), so this fixture pins one current item, ${itemId} (datetime 2026-11-05T13:32:51Z, UTM zone EPSG:32627, bbox from the item itself), fetched from \`/collections/sentinel-2-l2a-zarr3/items?limit=1\` on build. The \`reflectance\` asset is a GeoZarr multiscales group \`r10m\`..\`r720m\` (EPSG:32627 via proj:code, confirmed per-level in the group's own spatial:* attributes), sharded (inner chunk 1024x1024 within an 11264x11264 shard at r10m), uint16 scale 1e-4, offset -0.1 (BOA reflectance, _FillValue 0). b02/b03/b04 statistics below are in raw DN (not reflectance units) so a single-variable ramp has something to rescale against.\n\nLicense: ESA/Copernicus Sentinel Data Legal Notice (not a standard SPDX license); declared "proprietary" with a via link.\n\nExpected browser outcome: draws (true colour, r10m).`,
        license: 'proprietary',
        bbox: [-21.000488008726094, 67.52533091973571, -19.75806232798863, 68.45226977831176],
        interval: ['2026-11-05T13:32:51.024000Z', '2026-11-05T13:32:51.024000Z'],
        extensions: [DATACUBE_EXT, RENDER_EXT],
        extraLinks: [
          via('https://stac.core.eopf.eodc.eu/collections/sentinel-2-l2a-zarr3', 'EOPF STAC collection (items rotate)'),
          via(`https://stac.core.eopf.eodc.eu/collections/sentinel-2-l2a-zarr3/items/${itemId}`, 'Pinned EOPF STAC item'),
          { rel: 'license', href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice', type: 'application/pdf', title: 'Legal notice on the use of Copernicus Sentinel Data and Service Information' },
        ],
      }),
      'cube:dimensions': {
        y: { type: 'spatial', axis: 'y', reference_system: 32627 },
        x: { type: 'spatial', axis: 'x', reference_system: 32627 },
      },
      'cube:variables': {
        b02: { dimensions: ['y', 'x'], type: 'data', dtype: 'uint16', unit: '1', statistics: { minimum: 0, maximum: 3000 }, long_name: 'BOA reflectance from MSI acquisition at spectral band 02 490 nm' },
        b03: { dimensions: ['y', 'x'], type: 'data', dtype: 'uint16', unit: '1', statistics: { minimum: 0, maximum: 3000 }, long_name: 'BOA reflectance from MSI acquisition at spectral band 03 560 nm' },
        b04: { dimensions: ['y', 'x'], type: 'data', dtype: 'uint16', unit: '1', statistics: { minimum: 0, maximum: 3000 }, long_name: 'BOA reflectance from MSI acquisition at spectral band 04 665 nm' },
      },
      renders: {
        'true-colour': {
          title: 'Sentinel-2 true colour (r10m)',
          assets: ['reflectance'],
          bidx: [3, 2, 1],
          rescale: [[0, 3000]],
        },
      },
      assets: {
        reflectance: {
          href: `${itemBase}/${itemId}.zarr/measurements/reflectance`,
          type: 'application/vnd.zarr; version=3; profile=multiscales',
          title: 'Surface reflectance, GeoZarr multiscales r10m..r720m',
          description: 'UTM zone EPSG:32627 (pinned item), sharded, uint16 scale 1e-4 offset -0.1.',
          roles: ['data', 'reflectance', 'cloud-optimized'],
        },
      },
    },
  });
}

// 7. mur-sst
COLLECTIONS.push({
  dir: 'mur-sst',
  doc: {
    ...base('mur-sst', {
      title: 'MUR SST: multi-scale ultra-high resolution sea surface temperature',
      description: 'JPL MUR-JPL-L4-GLOB-v04.1 daily SST, Zarr V2, consolidated, single level (no multiscales), global 0.01 deg, CF coordinates only (no spatial_ref/CRS array -- lat/lon are plain degree arrays, EPSG:4326 implied). `analysed_sst` is [time, lat, lon], chunks [5, 1799, 3600], int16, scale_factor 0.001, add_offset 298.15, fill -32768, blosc-lz4. Decoded physical range is roughly 271-305 K (-2 to 32 degC); if the browser does NOT apply scale/offset before rendering, the raw int16 values it actually reads span about [-27150, 6850] ((kelvin-298.15)/0.001 over 271-305K) -- the statistics below are declared in those RAW units, and the render rescale matches, since the store itself does not expose decoded values without a CF-aware reader.\n\nLicense is the store\'s own non-SPDX text: "These data are available free of charge under data policy of JPL PO.DAAC."; declared "proprietary" with a via link.\n\nExpected browser outcome: draws (ramp on raw analysed_sst values).',
      license: 'proprietary',
      bbox: [-180, -90, 180, 90],
      interval: ['2002-06-01T09:00:00Z', null],
      extensions: [DATACUBE_EXT, RENDER_EXT],
      extraLinks: [via('https://mur-sst.s3.us-west-2.amazonaws.com/zarr-v1/.zattrs', 'Source root .zattrs')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['2002-06-01T09:00:00Z', null], unit: 'days since 2002-06-01 09:00:00' },
      lat: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326, unit: 'degrees_north' },
      lon: { type: 'spatial', axis: 'x', extent: [-180, 180], reference_system: 4326, unit: 'degrees_east' },
    },
    'cube:variables': {
      analysed_sst: {
        dimensions: ['time', 'lat', 'lon'],
        type: 'data',
        chunks: [5, 1799, 3600],
        dtype: 'int16',
        nodata: -32768,
        long_name: 'analysed sea surface temperature',
        description: 'Raw int16; decode with scale_factor 0.001, add_offset 298.15 (kelvin) to get physical units. Statistics below are RAW values.',
        statistics: { minimum: -27150, maximum: 6850 },
      },
      mask: {
        dimensions: ['time', 'lat', 'lon'],
        type: 'data',
        chunks: [5, 1799, 3600],
        dtype: 'int8',
        long_name: 'sea/land field composite mask',
      },
      sea_ice_fraction: {
        dimensions: ['time', 'lat', 'lon'],
        type: 'data',
        chunks: [5, 1799, 3600],
        dtype: 'int8',
        nodata: -128,
        long_name: 'sea ice area fraction',
      },
    },
    renders: {
      sst: {
        title: 'Analysed SST (raw int16, scale 0.001, offset 298.15 K)',
        assets: ['data'],
        rescale: [[-27150, 6850]],
        colormap_name: 'thermal',
        nodata: -32768,
      },
    },
    assets: {
      data: {
        href: 'https://mur-sst.s3.us-west-2.amazonaws.com/zarr-v1/',
        type: 'application/vnd.zarr',
        title: 'MUR SST (Zarr V2, consolidated, global 0.01 deg)',
        description: 'Single level, no multiscales. CF coordinates only, no explicit CRS array.',
        roles: ['data'],
      },
    },
  },
});

// 8. cbofs-ssh
{
  const publicationId = '20261105T194935Z-a52a';
  COLLECTIONS.push({
    dir: 'cbofs-ssh',
    doc: {
      ...base('cbofs-ssh', {
        title: 'CBOFS sea surface height (ROMS curvilinear, kerchunk-indexed)',
        description: `NOAA/NOS Chesapeake Bay Operational Forecast System (CBOFS), published via NODD's rolling kerchunk Zarr V3 index. The pointer at \`zarr3/cbofs/refs/main.json\` names the current publication's \`zarr_uri\`; resolved at build time to publication \`${publicationId}\` (**this URL rotates on every model cycle** -- it will not be the same tomorrow). The store is ROMS/TOMS output, SGRID-0.3 convention: a 2-D curvilinear grid (\`lat_rho\`/\`lon_rho\`, each [eta_rho, xi_rho], float64, no CRS/grid_mapping variable at all) rather than a regular or affine-mapped grid. \`zeta\` (free-surface / sea surface height) is [ocean_time, eta_rho, xi_rho], shape [769, 291, 332], chunks [14, 73, 166], zstd. bbox is an estimate for Chesapeake Bay (the actual footprint requires reading the full lat_rho/lon_rho arrays, not just their metadata).\n\nLicense: NOAA operational model output, public domain (US government work).\n\nExpected browser outcome: refused with a clear notice -- no affine transform and 2-D (non-1-D) spatial coordinates, which this browser's Zarr map support does not handle.`,
        license: 'public-domain',
        bbox: [-77.2, 36.0, -75.0, 40.5],
        interval: ['2026-11-05T18:00:00Z', '2026-11-05T18:00:00Z'],
        extensions: [DATACUBE_EXT, RENDER_EXT],
        extraLinks: [via('https://noaa-nodd-kerchunk-pds.s3.amazonaws.com/zarr3/cbofs/refs/main.json', 'Rolling publication pointer (resolved at build time)')],
      }),
      'cube:dimensions': {
        ocean_time: { type: 'temporal', unit: 'seconds since 2016-01-01' },
        eta_rho: { type: 'other', size: 291 },
        xi_rho: { type: 'other', size: 332 },
      },
      'cube:variables': {
        zeta: {
          dimensions: ['ocean_time', 'eta_rho', 'xi_rho'],
          type: 'data',
          chunks: [14, 73, 166],
          dtype: 'float32',
          unit: 'meter',
          long_name: 'free-surface',
          description: 'Curvilinear grid: no affine transform, coordinates are 2-D lat_rho/lon_rho arrays, not 1-D axes.',
        },
      },
      renders: {
        ssh: {
          title: 'Sea surface height (zeta)',
          assets: ['data'],
          rescale: [[-1, 1]],
          colormap_name: 'rdbu',
        },
      },
      assets: {
        data: {
          href: `https://noaa-nodd-kerchunk-pds.s3.amazonaws.com/zarr3/cbofs/versions/${publicationId}/data.zarr`,
          type: 'application/vnd.zarr; version=3',
          title: 'CBOFS fields (Zarr V3, resolved publication, rotates)',
          description: 'ROMS curvilinear grid, zstd codec. The href above was correct when this fixture was built; refetch refs/main.json for the current publication.',
          roles: ['data'],
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// ICECHUNK TIER
// ---------------------------------------------------------------------------

// 9. ctrees-agb-icechunk
COLLECTIONS.push({
  dir: 'ctrees-agb-icechunk',
  doc: {
    ...base('ctrees-agb-icechunk', {
      title: 'CTrees global aboveground biomass, 100 m annual (Icechunk)',
      description: 'ctrees.org global annual aboveground biomass (AGB) at 100 m, 2000-2025, published as a bare Icechunk 2.x repository (a `repo` config object plus `chunks/`, `manifests/`, `snapshots/` prefixes -- confirmed by a 200 on the `repo` object; there is no `zarr.json`/`.zattrs` at this path because Icechunk stores its own metadata inside the repo, not as plain Zarr files). CORS confirmed (`Access-Control-Allow-Origin: *` on the S3 bucket). Per-array shapes/chunks/dtype were not independently inspected (that needs the Icechunk manifest format, not a plain HTTP GET), so none are declared here. bbox is estimated (global biomass coverage, excluding high latitudes where AGB is not mapped).\n\nLicense unknown; declared "proprietary" with a via link.\n\nExpected browser outcome: draws if the Icechunk client in this browser can open a bare-repo-object 2.x layout; otherwise refused with a notice.',
      license: 'proprietary',
      bbox: [-180, -60, 180, 80],
      interval: ['2000-01-01T00:00:00Z', '2025-12-31T23:59:59Z'],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://ctrees.org/', 'CTrees')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', '2025-12-31T23:59:59Z'], description: 'Annual, 2000-2025 (26 years); not independently confirmed from the manifest.' },
      x: { type: 'spatial', axis: 'x', reference_system: 4326 },
      y: { type: 'spatial', axis: 'y', reference_system: 4326 },
    },
    assets: {
      data: {
        href: 'https://ctrees-agb-100m-global.s3.us-west-2.amazonaws.com/agb_100m_global/',
        type: 'application/x-icechunk',
        title: 'CTrees AGB 100m global (Icechunk 2.x repository)',
        description: 'Bare `repo` object confirmed reachable with CORS enabled; array-level metadata not independently inspected.',
        roles: ['data'],
      },
    },
  },
});

// 10. gmgsi-icechunk
COLLECTIONS.push({
  dir: 'gmgsi-icechunk',
  doc: {
    ...base('gmgsi-icechunk', {
      title: 'GMGSI global geostationary mosaic, hourly (Icechunk)',
      description: 'NOAA Global Mosaic of Geostationary Satellite Imagery (GMGSI), a composite of GOES, Meteosat and Himawari imagery, published as an Icechunk 2.x repository at `gmgsi_v3.icechunk` on source.coop. Confirmed reachable (200 on the `repo` object, which is binary -- an Icechunk config/snapshot object, not a plain Zarr file) with CORS enabled (`access-control-allow-origin: *`). Note: an earlier probe path for this fixture (`bkr/gmgi/gmgsi.zarr/zarr.json`, without the `_v3.icechunk` suffix and as plain Zarr) 404s -- that path does not exist; the real store is the Icechunk repo at the URL below, which does. Per-array shapes/dtypes were not independently inspected; bbox is estimated for a global geostationary composite.\n\nLicense unknown; declared "proprietary" with a via link.\n\nExpected browser outcome: draws if the Icechunk client can open this 2.x layout; otherwise refused with a notice.',
      license: 'proprietary',
      bbox: [-180, -70, 180, 70],
      interval: [null, null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://data.source.coop/bkr/gmgi/gmgsi_v3.icechunk/repo', 'Icechunk repo object (binary, confirms the store exists)')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', description: 'Hourly; not independently confirmed from the manifest.' },
      x: { type: 'spatial', axis: 'x', reference_system: 4326 },
      y: { type: 'spatial', axis: 'y', reference_system: 4326 },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/bkr/gmgi/gmgsi_v3.icechunk/',
        type: 'application/x-icechunk',
        title: 'GMGSI (Icechunk 2.x repository)',
        description: 'Confirmed reachable with CORS enabled; array-level metadata not independently inspected.',
        roles: ['data'],
      },
    },
  },
});

// 11. nasa-rasi-icechunk-virtual
COLLECTIONS.push({
  dir: 'nasa-rasi-icechunk-virtual',
  doc: {
    ...base('nasa-rasi-icechunk-virtual', {
      title: 'NASA Water Insight RASI, historical (virtual Icechunk)',
      description: 'A NASA Water Insight dataset ("RASI", historical) published as an Icechunk store with VIRTUAL chunk references into source NetCDF files rather than native Icechunk chunks. Unlike the 2.x bare-`repo`-object layout used by ctrees-agb-icechunk and gmgsi-icechunk, this store uses an older v1-style layout: a top-level `config.yaml` plus `chunks/` and `manifests/` prefixes (confirmed via a bucket listing; there is no `repo` object at this path -- a direct GET for one 404s). CORS confirmed on the bucket. CONUS bbox is estimated.\n\nLicense unknown; declared "proprietary" with a via link.\n\nExpected browser outcome: opens only if the Icechunk client in this browser supports this older v1-layout and virtual chunk refs; and even then, reading a chunk depends on the CORS/reachability of whatever NetCDF object the virtual ref points at, not just this store\'s own bucket.',
      license: 'proprietary',
      bbox: [-125, 25, -67, 53],
      interval: [null, null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://nasa-waterinsight.s3.us-west-2.amazonaws.com/virtual-zarr-store/icechunk/RASI/HISTORICAL/config.yaml', 'Icechunk v1-layout config.yaml (confirms the store exists)')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', description: 'Not independently confirmed from the manifest.' },
      x: { type: 'spatial', axis: 'x', reference_system: 4326 },
      y: { type: 'spatial', axis: 'y', reference_system: 4326 },
    },
    assets: {
      data: {
        href: 'https://nasa-waterinsight.s3.us-west-2.amazonaws.com/virtual-zarr-store/icechunk/RASI/HISTORICAL/',
        type: 'application/x-icechunk',
        title: 'NASA Water Insight RASI, historical (virtual Icechunk, v1 layout)',
        description: 'config.yaml + chunks/ + manifests/ layout (not the 2.x bare `repo` object); chunk refs point at source NetCDFs.',
        roles: ['data'],
      },
    },
  },
});

// ---------------------------------------------------------------------------
// GUARD TIER
// ---------------------------------------------------------------------------

// 12. cmip6-gfdl-tas
COLLECTIONS.push({
  dir: 'cmip6-gfdl-tas',
  doc: {
    ...base('cmip6-gfdl-tas', {
      title: 'CMIP6 GFDL-ESM4 historical tas (monthly, 1850-2014)',
      description: "NOAA-GFDL GFDL-ESM4 historical, r1i1p1f1, Amon table, near-surface air temperature (`tas`), gr1 grid (regridded from the model's cubed-sphere to 180x288, ~100 km nominal resolution). Zarr V2, consolidated. `tas` is [time, lat, lon], shape [1980, 180, 288], chunks [600, 180, 288] -- confirmed directly from the store's own `.zarray` (matches this fixture's brief exactly). A single map tile needs one (lat, lon) pixel at one time step, but the chunk spans 600 of the 1980 time steps, so decoding one tile pulls roughly 600x the data actually needed.\n\nLicense confirmed from the store's own `.zattrs`: CC-BY-4.0.\n\nExpected browser outcome: refused by the chunk-amplification guard (~600x on the time axis).",
      license: 'CC-BY-4.0',
      bbox: [-180, -90, 180, 90],
      interval: ['1850-01-16T12:00:00Z', '2014-12-16T12:00:00Z'],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://storage.googleapis.com/cmip6/CMIP6/CMIP/NOAA-GFDL/GFDL-ESM4/historical/r1i1p1f1/Amon/tas/gr1/v20190726/.zattrs', 'Source root .zattrs')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['1850-01-16T12:00:00Z', '2014-12-16T12:00:00Z'], unit: 'hours since 1850-01-16 12:00:00.000000', size: 1980 },
      lat: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326, size: 180 },
      lon: { type: 'spatial', axis: 'x', extent: [-180, 180], reference_system: 4326, size: 288 },
    },
    'cube:variables': {
      tas: {
        dimensions: ['time', 'lat', 'lon'],
        type: 'data',
        chunks: [600, 180, 288],
        dtype: 'float32',
        nodata: 1.0000000200408773e+20,
        unit: 'K',
        long_name: 'Near-Surface Air Temperature',
        standard_name: 'air_temperature',
      },
    },
    assets: {
      data: {
        href: 'https://storage.googleapis.com/cmip6/CMIP6/CMIP/NOAA-GFDL/GFDL-ESM4/historical/r1i1p1f1/Amon/tas/gr1/v20190726/',
        type: 'application/vnd.zarr',
        title: 'CMIP6 GFDL-ESM4 historical tas (Zarr V2, consolidated)',
        description: 'Single array, chunked [600,180,288] -- amplification guard should refuse.',
        roles: ['data'],
      },
    },
  },
});

// 13. its-live-velocity
COLLECTIONS.push({
  dir: 'its-live-velocity',
  doc: {
    ...base('its-live-velocity', {
      title: 'ITS_LIVE ice velocity datacube, N60W140 (polar stereographic)',
      description: 'ITS_LIVE (NASA MEaSUREs) image-pair ice velocity datacube for tile N60W140, Zarr V2, consolidated. `v` (velocity magnitude) is [mid_date, y, x], shape [16314, 834, 833], chunks [16315, 10, 10] -- the time chunk (16315) covers the entire mid_date axis (16314 image pairs) in a single chunk, confirmed from the store\'s own `.zarray`. Grid is EPSG:3413 (NSIDC Sea Ice Polar Stereographic North), with the CRS carried as `crs_wkt` on a non-dimension coordinate variable named `mapping` (not `spatial_ref`). bbox is estimated from the store\'s `geo_polygon` attribute (northern Yukon/Alaska border area).\n\nLicense not stated in the store\'s own metadata; declared "proprietary" with a via link to the ITS_LIVE project.\n\nExpected browser outcome: refused by the chunk-amplification guard (~16000x: one tile needs one time step, the chunk holds all 16314).',
      license: 'proprietary',
      bbox: [-142.8, 68.9, -140.0, 69.8],
      interval: [null, null],
      extensions: [DATACUBE_EXT],
      extraLinks: [
        via('https://its-live-data.s3.amazonaws.com/datacubes/v2/N60W140/ITS_LIVE_vel_EPSG3413_G0120_X-2250000_Y250000.zarr/.zattrs', 'Source root .zattrs'),
        via('https://its-live.jpl.nasa.gov/', 'ITS_LIVE project'),
      ],
    }),
    'cube:dimensions': {
      mid_date: { type: 'temporal', size: 16314 },
      x: { type: 'spatial', axis: 'x', reference_system: 3413 },
      y: { type: 'spatial', axis: 'y', reference_system: 3413 },
    },
    'cube:variables': {
      v: {
        dimensions: ['mid_date', 'y', 'x'],
        type: 'data',
        chunks: [16315, 10, 10],
        dtype: 'int16',
        nodata: -32767,
        unit: 'meter/year',
        long_name: 'velocity magnitude',
        standard_name: 'land_ice_surface_velocity',
      },
    },
    assets: {
      data: {
        href: 'https://its-live-data.s3.amazonaws.com/datacubes/v2/N60W140/ITS_LIVE_vel_EPSG3413_G0120_X-2250000_Y250000.zarr/',
        type: 'application/vnd.zarr',
        title: 'ITS_LIVE velocity datacube N60W140 (Zarr V2, consolidated, EPSG:3413)',
        description: 'Chunked [16315,10,10] -- amplification guard should refuse.',
        roles: ['data'],
      },
    },
  },
});

// 14. noaa-gefs-analysis
COLLECTIONS.push({
  dir: 'noaa-gefs-analysis',
  doc: {
    ...base('noaa-gefs-analysis', {
      title: 'NOAA GEFS analysis (dynamical.org), v0.1.2',
      description: 'NOAA Global Ensemble Forecast System (GEFS) analysis, processed by dynamical.org, global, 0.25 deg, 3-hourly, 2000-01-01 to present. Zarr V3, 27 data variables (confirmed by listing the consolidated metadata), all sharded [2880, 384, 384] outer / [1440, 32, 32] inner (blosc-zstd), confirmed directly from a representative variable\'s own metadata. One map tile needs 32x32 pixels at one time step; the inner chunk already covers 1440 time steps, so decoding one tile pulls about 1440x the time range actually needed.\n\nLicense confirmed from the store\'s own root attributes: CC-BY-4.0.\n\nExpected browser outcome: refused by the chunk-amplification guard (~1440x on the time axis).',
      license: 'CC-BY-4.0',
      bbox: [-180, -90, 179.75, 90],
      interval: ['2000-01-01T00:00:00Z', null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://data.source.coop/dynamical/noaa-gefs-analysis/v0.1.2.zarr/zarr.json', 'Source root zarr.json')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['2000-01-01T00:00:00Z', null], unit: 'seconds since 1970-01-01' },
      latitude: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326, size: 721 },
      longitude: { type: 'spatial', axis: 'x', extent: [-180, 179.75], reference_system: 4326, size: 1440 },
    },
    'cube:variables': {
      temperature_2m: {
        dimensions: ['time', 'latitude', 'longitude'],
        type: 'data',
        chunks: [2880, 384, 384],
        shards: [1440, 32, 32],
        dtype: 'float32',
        unit: 'degree_Celsius',
        long_name: 'Temperature',
        standard_name: 'air_temperature',
        short_name: '2t',
      },
      precipitation_surface: {
        dimensions: ['time', 'latitude', 'longitude'],
        type: 'data',
        chunks: [2880, 384, 384],
        shards: [1440, 32, 32],
        dtype: 'float32',
        unit: 'kg m-2 s-1',
        long_name: 'Precipitation rate',
        standard_name: 'precipitation_flux',
      },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/dynamical/noaa-gefs-analysis/v0.1.2.zarr/',
        type: 'application/vnd.zarr; version=3',
        title: 'NOAA GEFS analysis v0.1.2 (Zarr V3, sharded)',
        description: '27 variables, all sharded [2880,384,384] outer / [1440,32,32] inner -- amplification guard should refuse.',
        roles: ['data'],
      },
    },
  },
});

// 15. eopf-s2-l2a-v2-band
{
  const itemId = 'S2C_MSIL2A_20261105T105221_N0513_R051_T33WWN_20261105T121505';
  COLLECTIONS.push({
    dir: 'eopf-s2-l2a-v2-band',
    doc: {
      ...base('eopf-s2-l2a-v2-band', {
        title: 'EOPF Sentinel-2 L2A (unconsolidated Zarr V2), one pinned band group',
        description: `EOPF (ESA/EODC) Sentinel-2 L2A collection "sentinel-2-l2a" (Zarr V2, unconsolidated, no overviews -- the older, pre-GeoZarr EOPF layout, distinct from eopf-s2-l2a-zarr3's V3/multiscales collection). The collection rotates its items; this fixture pins a current one, ${itemId} (datetime 2026-11-05T10:52:21Z, UTM zone EPSG:32633), fetched from \`/collections/sentinel-2-l2a/items?limit=1\` on build. The \`SR_10m\` asset is the 10 m reflectance group itself (bands B02/B03/B04/B08), declared by the item with media type \`application/vnd+zarr\` exactly as published -- a non-standard but real value, kept as-is rather than corrected to \`application/vnd.zarr\`. No multiscales/overviews exist at this level, so the browser must read full-resolution native pixels at every zoom.\n\nLicense: ESA/Copernicus Sentinel Data Legal Notice; declared "proprietary".\n\nExpected browser outcome: refused or held back by the zoom/no-overviews guard -- there is no coarser level to fall back to, so either it is refused outright or held back to a high minimum zoom.`,
        license: 'proprietary',
        bbox: [14.999563824910416, 64.8262656763221, 16.875271971487273, 65.73394402556501],
        interval: ['2026-11-05T10:52:21.025000Z', '2026-11-05T10:52:21.025000Z'],
        extensions: [DATACUBE_EXT],
        extraLinks: [
          via('https://stac.core.eopf.eodc.eu/collections/sentinel-2-l2a', 'EOPF STAC collection (items rotate)'),
          via(`https://stac.core.eopf.eodc.eu/collections/sentinel-2-l2a/items/${itemId}`, 'Pinned EOPF STAC item'),
          { rel: 'license', href: 'https://sentinel.esa.int/documents/247904/690755/Sentinel_Data_Legal_Notice', type: 'application/pdf', title: 'Legal notice on the use of Copernicus Sentinel Data and Service Information' },
        ],
      }),
      'cube:dimensions': {
        y: { type: 'spatial', axis: 'y', reference_system: 32633 },
        x: { type: 'spatial', axis: 'x', reference_system: 32633 },
      },
      'cube:variables': {
        B02: { dimensions: ['y', 'x'], type: 'data', description: 'Blue, 490 nm, 10 m GSD, no overviews.' },
        B03: { dimensions: ['y', 'x'], type: 'data', description: 'Green, 560 nm, 10 m GSD, no overviews.' },
        B04: { dimensions: ['y', 'x'], type: 'data', description: 'Red, 665 nm, 10 m GSD, no overviews.' },
        B08: { dimensions: ['y', 'x'], type: 'data', description: 'NIR 1, 842 nm, 10 m GSD, no overviews.' },
      },
      assets: {
        SR_10m: {
          href: `https://data.eodc.eu/collections/EOPF_ZARR/products/cpm_v270/S02MSIL2A/2026/11/05/${itemId}.zarr/measurements/reflectance/r10m`,
          type: 'application/vnd+zarr',
          title: 'Surface Reflectance - 10m',
          description: 'Zarr V2, unconsolidated, no multiscales/overviews. Media type copied verbatim from the EOPF item (non-standard application/vnd+zarr).',
          roles: ['data', 'reflectance', 'dataset'],
        },
      },
    },
  });
}

// 16. nwm-streamflow
COLLECTIONS.push({
  dir: 'nwm-streamflow',
  doc: {
    ...base('nwm-streamflow', {
      title: 'NOAA National Water Model retrospective streamflow (CONUS reach network)',
      description: 'NOAA NWM Retrospective v2.1, `chrtout.zarr`: streamflow at every NHDPlusV2 reach (plus arbitrary reach IDs outside CONUS), 1979-02-01 hourly onward. `streamflow` is [time, feature_id], shape [367439, 2776738] -- confirmed from the store\'s own `.zarray` -- chunked [672, 30000]. This is a 1-D, per-feature time series over a river-network graph, not a 2-D raster: there is no x/y/lat-lon grid to read a tile from at all (feature_id indexes a reach, not a pixel), and a lat/lon-looking `latitude`/`longitude` pair exists only as per-feature point coordinates (`coordinates: lat lon` on the variable), not an affine grid.\n\nLicense: NOAA operational model output, public domain (US government work).\n\nExpected browser outcome: refused cleanly as not a raster; must never attempt to fetch an 80MB-class chunk ([672,30000] int32 = ~80MB) just to probe shape.',
      license: 'public-domain',
      bbox: [-180, -90, 180, 90],
      interval: ['1979-02-01T01:00:00Z', null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://noaa-nwm-retrospective-2-1-zarr-pds.s3.amazonaws.com/chrtout.zarr/.zattrs', 'Source root .zattrs')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['1979-02-01T01:00:00Z', null], unit: 'hours since 1979-02-01T01:00:00' },
      feature_id: { type: 'other', size: 2776738, description: 'NHDPlusV2 ComID (reach identifier), not a spatial grid axis.' },
    },
    'cube:variables': {
      streamflow: {
        dimensions: ['time', 'feature_id'],
        type: 'data',
        chunks: [672, 30000],
        dtype: 'int32',
        nodata: -999900,
        unit: 'm3 s-1',
        long_name: 'River Flow',
        description: 'Per-reach time series, not a raster. coordinates: latitude longitude (point locations per feature, not a grid).',
      },
    },
    assets: {
      data: {
        href: 'https://noaa-nwm-retrospective-2-1-zarr-pds.s3.amazonaws.com/chrtout.zarr/',
        type: 'application/vnd.zarr',
        title: 'NWM retrospective v2.1 CHRTOUT (Zarr V2, consolidated)',
        description: '1-D feature_id network, not a 2-D grid -- not renderable as a raster tile.',
        roles: ['data'],
      },
    },
  },
});

// ---------------------------------------------------------------------------
// NEGATIVE TIER
// ---------------------------------------------------------------------------

// 17. era5-arco-no-cors
COLLECTIONS.push({
  dir: 'era5-arco-no-cors',
  doc: {
    ...base('era5-arco-no-cors', {
      title: 'ERA5 ARCO (Google/ECMWF), no CORS',
      description: 'The Google/ECMWF ARCO-ERA5 full-resolution (0.25 deg, hourly) Zarr V2 archive, 1940-01-01 to present. Confirmed by `curl -I` with an `Origin` header: the GCS bucket returns no `Access-Control-Allow-Origin` header at all, so a browser `fetch()` for this store\'s metadata is blocked by CORS before any data request happens. `2m_temperature` is [time, latitude, longitude], shape [1323648, 721, 1440], chunked [1, 721, 1440] (well-chunked -- one time step per chunk; the amplification guard is not what blocks this store).\n\nLicense: Copernicus/ECMWF data licence (not a standard SPDX license); declared "proprietary".\n\nExpected browser outcome: a clear load error (CORS failure), surfaced promptly -- never a hang.',
      license: 'proprietary',
      bbox: [-180, -90, 180, 90],
      interval: ['1940-01-01T00:00:00Z', '2026-06-30T23:00:00Z'],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://cloud.google.com/storage/docs/public-datasets/era5', 'ARCO-ERA5 on Google Cloud (no CORS configured on the bucket)')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', extent: ['1940-01-01T00:00:00Z', '2026-06-30T23:00:00Z'] },
      latitude: { type: 'spatial', axis: 'y', extent: [-90, 90], reference_system: 4326, size: 721 },
      longitude: { type: 'spatial', axis: 'x', extent: [-180, 180], reference_system: 4326, size: 1440 },
    },
    'cube:variables': {
      '2m_temperature': {
        dimensions: ['time', 'latitude', 'longitude'],
        type: 'data',
        chunks: [1, 721, 1440],
        dtype: 'float32',
        unit: 'K',
        long_name: '2 metre temperature',
        short_name: 't2m',
      },
    },
    assets: {
      data: {
        href: 'https://storage.googleapis.com/gcp-public-data-arco-era5/ar/full_37-1h-0p25deg-chunk-1.zarr-v3/',
        type: 'application/vnd.zarr',
        title: 'ARCO-ERA5 full 37-level, 1h, 0.25deg (Zarr V2)',
        description: 'No Access-Control-Allow-Origin header on the bucket -- confirmed by curl with an Origin header.',
        roles: ['data'],
      },
    },
  },
});

// 18. tessera-utm30-embeddings
COLLECTIONS.push({
  dir: 'tessera-utm30-embeddings',
  doc: {
    ...base('tessera-utm30-embeddings', {
      title: 'Tessera UTM zone 30 geospatial embeddings',
      description: 'Tessera (geoemb convention) 128-band geospatial embeddings for UTM zone 30N, Zarr V3, single level, EPSG:32630, 10 m GSD. `embeddings` is [time(9), band(128), y(1011712), x(69632)], int8, sharded: the shard ("chunk_grid" chunk_shape) is [1, 128, 4096, 4096] -- 128 x 4096 x 4096 x 1 byte = 2,147,483,648 bytes (2 GiB) per shard, uncompressed -- considerably larger than this fixture\'s brief estimated ("shard 390MB"); the real on-disk shard is about 5x that estimate. The inner chunk within each shard is [1, 128, 32, 32] (blosc-zstd-bitshuffle).\n\nLicense for this GeoTessera-derived product is not published on the source.coop listing; declared "proprietary".\n\nExpected browser outcome: guards must prevent any large fetch -- whether via the amplification guard (the shard holds all 128 bands and a 4096x4096 spatial footprint for one request) or a dedicated shard-size guard, no client should ever pull a 2 GiB shard to render one tile.',
      license: 'proprietary',
      // Native grid is UTM zone 30N (EPSG:32630), bbox [167130, -2159030, 863450, 7958090] in
      // metres (from the store's own spatial:bbox). Converted to an approximate WGS84 bbox for
      // the STAC extent (UTM zone 30N spans roughly -6 to 0 degrees longitude; latitude is a
      // rough equatorial approximation from the northing, not a proper inverse projection) --
      // estimated.
      bbox: [-6, -19.5, 0, 71.7],
      interval: [null, null],
      extensions: [DATACUBE_EXT],
      extraLinks: [via('https://data.source.coop/tessera/tessera/zarr/v1/zarr.json', 'Source store root zarr.json')],
    }),
    'cube:dimensions': {
      time: { type: 'temporal', size: 9 },
      band: { type: 'other', size: 128, description: '128-band int8 embedding vector per pixel.' },
      y: { type: 'spatial', axis: 'y', reference_system: 32630, size: 1011712 },
      x: { type: 'spatial', axis: 'x', reference_system: 32630, size: 69632 },
    },
    'cube:variables': {
      embeddings: {
        dimensions: ['time', 'band', 'y', 'x'],
        type: 'data',
        chunks: [1, 128, 4096, 4096],
        shards: [1, 128, 32, 32],
        dtype: 'int8',
        description: 'Shard (outer chunk) is [1,128,4096,4096] = 2 GiB uncompressed per shard, far larger than a single map tile needs.',
      },
    },
    assets: {
      data: {
        href: 'https://data.source.coop/tessera/tessera/zarr/v1/utm30/embeddings',
        type: 'application/vnd.zarr; version=3',
        title: 'Tessera UTM30 embeddings (Zarr V3, sharded, EPSG:32630)',
        description: '2 GiB shards -- any guard must refuse before fetching one.',
        roles: ['data'],
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Write everything out
// ---------------------------------------------------------------------------

async function writeCollection({ dir, doc }) {
  const outDir = join(HERE, dir);
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'collection.json'), `${JSON.stringify(doc, null, 2)}\n`);
  console.log(`wrote ${dir}/collection.json (id ${doc.id})`);
}

const catalog = {
  type: 'Catalog',
  stac_version: '1.1.0',
  id: 'zarr-wild-test-catalog',
  title: 'Wild Zarr/Icechunk test catalog',
  description: 'Local Portolan catalog of real-world public Zarr and Icechunk stores, gathered to stress the Zarr map rendering work against data nobody built for a demo: production operational models, research datacubes, satellite archives and visualization mosaics. Each collection names the outcome the browser is expected to produce: draw, hold back, refuse, or error. Facts in each collection (shapes, dtypes, chunks, codecs, CRS, extents) were read from the store\'s own metadata or an upstream STAC item; anything not independently confirmed is marked "estimated" in its description. Run `node tests/fixtures/catalogs/zarr-wild/build.mjs` to rebuild. See docs/zarr.md.',
  links: [
    { rel: 'root', href: './catalog.json', type: 'application/json', title: 'Wild Zarr/Icechunk test catalog' },
    ...COLLECTIONS.map(({ dir, doc }) => ({
      rel: 'child',
      href: `./${dir}/collection.json`,
      type: 'application/json',
      title: doc.title,
    })),
  ],
};

for (const entry of COLLECTIONS) {
  await writeCollection(entry);
}
await writeFile(join(HERE, 'catalog.json'), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`wrote catalog.json (${COLLECTIONS.length} collections)`);
