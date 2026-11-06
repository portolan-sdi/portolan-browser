# Zarr on the map

Portolan Browser draws a Zarr store directly in the browser. It reads the
chunks from object storage, reprojects them to Web Mercator on the GPU, and
colours them with the same `renders` entries that colour a COG. The browser
reads the store directly, without a tile server.

This page describes what the browser does with a Zarr asset, and what a store
must look like for the browser to draw it well.

## Libraries

| Part | Library |
| ---- | ------- |
| The map layer | [`@developmentseed/deck.gl-zarr`](https://developmentseed.org/deck.gl-raster/api/deck-gl-zarr/) |
| Store access | [zarrita](https://zarrita.dev/) |
| Icechunk repositories | [icechunk-js](https://github.com/EarthyScience/icechunk-js) |
| GeoZarr metadata | [`@developmentseed/geozarr`](https://developmentseed.org/deck.gl-raster/api/geozarr/) |

The browser recognises a Zarr asset by its media type: `application/vnd.zarr`,
`application/vnd+zarr`, `application/x-zarr` with any parameters, and
`application/x-icechunk`. An asset with no media type is recognised by an href
that ends in `.zarr` or `.icechunk`. An `s3://` href is skipped, because a
browser cannot read one.

Zarr v2 and v3 both work. A plain store and an Icechunk repository both work,
and the browser tries the other reader when the first one fails, because
catalogs label Icechunk repositories both ways.

## One layer per variable

A COG asset is one picture, so it is one map layer. Every variable in a Zarr
store measures something different, so each one becomes a map layer of its
own. The layer control lists them and the user switches between them. A store opens only when
one of its layers is switched on, so listing twenty-five variables of a weather
archive costs no requests.

The browser finds the variables in `cube:variables` from the datacube
extension, and falls back to the asset's `bands`. Prefer `cube:variables`:
it states the dimensions of each variable, and it is unambiguous. `bands` is read
as one variable per band, which is right for a store whose bands are separate
measurements and wrong for an RGB image whose bands are colour channels.

The variable shown first is the one the asset's render was written for, matched
by its `nodata` value. A render specifies the assets it applies to, and it
cannot reference a variable inside one, so this is an inference. Declare one render per variable
to make it exact.

## Requirements for a Zarr store in a Portolan catalog

The browser checks these properties before it draws a store. They also govern
how quickly it draws at every zoom. Most of them are hard requirements. The
browser refuses a store that fails one and says why, rather than hanging or
drawing something wrong.

The last three are about the array's own layout rather than about the metadata
a publisher can fix, so they are where the browser's limits are, not the
store's.

### Chunk one map tile per chunk

A chunk is the smallest unit a reader can fetch, and it is fetched and
decompressed whole. A store chunked along time costs one chunk of every time
step to draw one of them.

dynamical.org's GFS analysis is chunked `[1440, 50, 50]`. One 50 by 50 map tile
transfers 1.05 MB and draws 2,500 pixels, and a global view of one variable is
435 such tiles, so about 450 MB. The same read against the GOES store, chunked
`[1, 250, 250]`, transfers 0.18 MB and draws 62,500 pixels.

Chunk the non-spatial dimensions to 1. The browser measures the waste from the
chunk shape alone, before it fetches anything, and refuses a store that reads
more than 8 times the data it draws.

A store chunked for time-series analysis is not wrong. It is chunked for a
different reader. Publish a second, display-chunked copy, or publish COGs
beside it.

### Publish overviews

A Zarr array with no overviews has one level at full resolution. deck.gl asks a
tiled layer for every tile that meets the viewport, so a world view of the FTW
global store, 4,007,517 pixels across, would ask for its 375,000 chunks.

The browser holds such a store back to the zoom where its coarsest level is
affordable, and says so on the map. The FTW store draws from zoom 11. A store
with a full pyramid draws at every zoom: the italy-aerial store has twelve
levels and its coarsest is two chunks across, so it draws at a world view.

Write the GeoZarr `multiscales` convention, with each level half the previous
one, down to a level that fits in a chunk or two.

The browser reads two spellings of `multiscales`, because publishers write
both:

| Spelling | Shape | Levels under | Named by |
| -------- | ----- | ------------ | -------- |
| [zarr-conventions/multiscales](https://github.com/zarr-conventions/multiscales) v0.1 | object | `layout` | `asset` |
| earlier GeoZarr drafts | array | `datasets` | `path` |

The object form is the current convention. Its maturity is Pilot, and its own
README expects breaking changes before a stable v1. The italy-aerial store
writes it and names the schema in `zarr_conventions`.

The array form comes from the earlier drafts, after OME-NGFF. The browser
reads it when each level's transform and shape are stated outright. It also
reads them when they are derivable from a `factor` relative to the base
level, plus the group's own `spatial:transform` and `spatial:shape`. The FTW
global prediction store writes this derivable form.

A GeoZarr 0.4-style entry names its level by index, with no `factor` and no
per-level `spatial:transform` or `spatial:shape`. The browser has nothing to
derive from, so it reports such a pyramid as one it cannot read. The browser
rewrites a readable array form to the object form before it reads the levels.

Declare the convention in `zarr_conventions`. A store that declares a pyramid
the browser cannot read reports that on the map. The browser then stops,
instead of a fall back to the coordinate arrays. That fall back would describe
a 14-level store as a store with no overviews.

### Keep chunks near a screen tile in size

Chunk edges of 256 to 1024 pixels suit display. Each chunk is one request, one
decompression, and one colormap pass on the main thread.

A 4096 by 4096 chunk is 16.7 million samples and a 67 MB image for one tile.
The browser reads every nth sample of a chunk that large, which caps the work
per tile. This keeps the map responsive, but it throws away resolution it paid
to download. Smaller chunks avoid the trade.

Very small chunks cost the other way: a level of 250-pixel chunks needs 60
requests to cover a grid the 4096-pixel chunking covers in one.

### Declare a render, or declare statistics

A colour ramp has to know the range it spans. With neither a `renders` entry
nor band statistics, the browser stretches 0 to 1, and a Sentinel-2
reflectance band saturates to one flat colour.

The same FTW store draws as a flat yellow rectangle without a render, and as a
true-colour Sentinel-2 mosaic with this one:

```json
{
  "renders": {
    "true-colour": {
      "title": "Sentinel-2 true colour, harvest composite",
      "assets": ["data"],
      "bidx": [3, 2, 1],
      "rescale": [[0, 3000]]
    }
  }
}
```

An 8-bit store with three or more bands needs no render: its samples are
already display values, so the browser composites them as true colour.

A render states colour, not coverage. The asset's `bands` state coverage, and
the browser reads them next to any render. This is what keeps the sea
transparent in an orthophoto rather than black. These mark a pixel as empty:

- A band named `alpha`. The browser writes its 8-bit value straight to the
  alpha channel. A partial value at a mosaic seam keeps its exact opacity.
- The `nodata` value of the colour bands, for a store with no alpha band. The
  browser drops a pixel only where every colour band reads as no-data.

Prefer an alpha band. A no-data value infers coverage from the colour, so it
also punches out a black roof.

### Use a projection the browser can reproject

The browser reprojects with proj4. An EPSG code always works. A WKT2
definition works for the common projections.

A geostationary satellite grid needs help from the browser. `wkt-parser` does
not map the WKT2 method `Geostationary Satellite (Sweep X)` onto proj4's
`Geostationary Satellite View`. It also drops the satellite height, which the
projection needs. `src/utils/projGeostationary.js` registers an alias of
proj4's own `geos` projection that closes both gaps. The repair belongs in
`wkt-parser`, which maps the other WKT2 parameter names already.

Declare `proj:code` where the grid has an EPSG code. EPSG defines no code for
the GOES-R ABI fixed grid, so that store declares WKT2 alone.

### Check the codecs have JavaScript implementations

zarrita decodes blosc, lz4, zstd, gzip, zlib, shuffle, delta, sharding and the
other codecs in its registry. It has no GRIB decoder.

This decides whether a virtual Zarr store can be drawn. The GOES store's
chunks are byte ranges inside NOAA's netCDF files, compressed with zlib, and
they read fine. dynamical.org's virtual repositories reference GRIB messages
decoded by a `gribberish` codec that exists only in Python and Rust, so the
browser cannot read one chunk of them.

### Serve the store with CORS

The browser reads the store from the page, so the bucket needs
`Access-Control-Allow-Origin`. A virtual store needs it on the referenced
files too, not only on the store itself.

### Put the spatial axes last, in y then x order

`ZarrLayer` reads the last two axes of the array as y then x. No part of the
stack transposes an array. A store that puts its spatial dimensions on other
axes does not draw, whatever colour rule applies. The browser refuses such a
store, and the notice states the axis order that the renderer needs.

Tessera's global RGB mosaic is the case to know about: its array is
`[lat, lon, band]`, so the band axis sits where the renderer looks for the x
axis. Writing the band axis first, `[band, lat, lon]`, is what every other
multi-band store in the test catalogs does.

A column-major array is the same fault in another spelling. The colormap loop
walks the trailing two axes as rows of pixels, so a Zarr v2 array that declares
`order: "F"`, or a v3 array whose `transpose` codec permutes its axes, is
refused up front. zarrita decodes both perfectly well — the refusal is about
what the renderer can index, not about what the reader can decode.

### Describe the grid with 1-D coordinate arrays, or with a transform

A store without a `spatial:transform` is described from its coordinate arrays.
That route reads one 1-D array per spatial axis (see
`geoZarrAttrsFromCoordinates`). It reads the first, the second and the last
cell centre of the axis. A regular axis needs no more than those samples, so
each axis costs three small reads rather than a read of the whole array.

A curvilinear or swath grid writes its coordinates as 2-D arrays instead, one
value per cell, and no affine describes it. The browser cannot place such a
store and says so. NOAA's CBOFS (a ROMS model on an SGRID curvilinear grid)
and the GMGSI geostationary mosaic are both refused for this, and both are in
`tests/fixtures/catalogs/zarr-wild`. Reprojecting a curvilinear grid in the
browser is the missing capability, not a metadata fix the publisher can make.

A coordinate array stored as float32 is fine. The spacing is measured across
the whole axis rather than between its first two cells, because a float32
value near 90 degrees is quantised to about a thousandth of a 0.01-degree
cell and the error of one such step, multiplied out over 18,000 cells, lands
ten cells away from the truth. MUR SST is the store that showed this.

### A pyramid may describe itself in its levels

The `multiscales` convention lets a level state its own `spatial:transform` and
`spatial:shape`, and the browser derives the ones a level leaves out from the
group's transform and the level's scale (see `withMultiscalesLayout`).

An `ndpyramid` store states none of it. Its `multiscales` uses the array
spelling, and each level entry gives a path and a `pixels_per_tile`. The root
group omits the transform, the shape and the CRS. Each level is a group that
stores its data array beside its own `x`, `y` and `spatial_ref` arrays, in CF
style. The pyramid and the spatial description are both present in the store.
They live in different places. `geoZarrAttrsFromLevelCoordinates` joins them by reading each
level's own coordinates. CarbonPlan's climate pyramids are this shape, and four
of them are in `tests/fixtures/catalogs/zarr-wild`.

Level order is not assumed anywhere. GeoZarr 0.4 mandates coarsest first, the
multiscales convention states no order, `ndpyramid` writes coarsest first and
the convention's own DEM example puts its finest level last. The browser
measures the levels and orders them finest first, which is the order
`ZarrLayer` reads them in — and it passes the reordered attributes to the layer
rather than letting it read the store's own, because a layer that read a
coarsest-first store as finest-first would map a world view onto the
full-resolution level.

## Testing

There are two local catalogs.

`tests/fixtures/catalogs/zarr` holds collections built to cover each outcome
above, one per rule.

`tests/fixtures/catalogs/zarr-wild` holds 22 collections over real public
stores. No publisher wrote any of them for a demo. The sources are:

- Operational weather models.
- Research datacubes.
- Visualization mosaics.
- Satellite archives.
- Icechunk repositories.

A collection description in this catalog ends with an "Expected browser
outcome". Some descriptions also end with a `CORRECTION` paragraph, which
records where the first browser run disagreed with the metadata research.

The catalog sorts its collections into three tiers:

- A store that the browser must draw.
- A store that a guard must refuse. The notice must state the reason, and the
  browser must not fetch the bulk data.
- A store that must fail cleanly.

Serve either with:

```sh
node tests/fixtures/serve-catalogs.mjs
```

That puts the catalogs on port 8082, which is a different origin from the dev
server on port 8080. A catalog is a separate origin in every real deployment,
and serving it from the browser's own origin hides the CORS mistakes that stop
a real Zarr store from drawing.

Open one by its full URL:

```
http://localhost:8080/#/external/http://localhost:8082/zarr/catalog.json
```

Mount a catalog that lives outside the repository under a name of its own:

```sh
node tests/fixtures/serve-catalogs.mjs italy=/path/to/italy-aerial-catalog/catalog
```

Rebuild the derived collections from the publishers' own metadata with:

```sh
node tests/fixtures/catalogs/zarr/build.mjs
```

`tests/manual/zarr-render-check.mjs` drives a real browser over the catalog and
reports, for each collection, what the layer control listed, what the map said,
and whether the canvas drew anything. It reads the live stores, so it is slow
and it needs the network.

```sh
pnpm start &
node tests/fixtures/serve-catalogs.mjs &
node tests/manual/zarr-render-check.mjs
```

`tests/manual/zarr-wild-check.mjs` does the same for the wild catalog, and adds
the two things a wild run needs that a fixture run does not: an expectation per
case, checked (`draws`, `notice:<text>`, `error`), and per-case network
accounting from the store's own host. A guard-tier case fails if one response
exceeds 20 MB or the case total exceeds 100 MB, however correct its notice
looks — a guard that refuses a store after fetching it has not guarded
anything. Each case has a hard timeout, so one unreachable store cannot hang
the run, and the script prints a verdict table at the end.

```sh
pnpm exec vite --port 8095 --strictPort &
node tests/fixtures/serve-catalogs.mjs --port 8096 &
BROWSER_URL=http://localhost:8095 CATALOG_URL=http://localhost:8096 \
  node tests/manual/zarr-wild-check.mjs
```

Pass collection directory names to check only those.
