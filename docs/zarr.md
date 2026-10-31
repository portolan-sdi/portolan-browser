# Zarr on the map

Portolan Browser draws a Zarr store directly in the browser. It reads the
chunks from object storage, reprojects them to Web Mercator on the GPU, and
colours them with the same `renders` entries that colour a COG. No tile server
takes part.

This page describes what the browser does with a Zarr asset, and what a store
must look like for the browser to draw it well.

## What the browser reads

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

A COG asset is one picture, so it is one map layer. A Zarr store holds a named
variable per measurement, so it becomes one map layer per variable. The layer
control lists them and the user switches between them. A store opens only when
one of its layers is switched on, so listing twenty-five variables of a weather
archive costs no requests.

The browser finds the variables in `cube:variables` from the datacube
extension, and falls back to the asset's `bands`. Prefer `cube:variables`:
it names each variable's dimensions, and it is unambiguous. `bands` is read
as one variable per band, which is right for a store whose bands are separate
measurements and wrong for an RGB image whose bands are colour channels.

The variable shown first is the one the asset's render was written for, matched
by its `nodata` value. A render names the assets it applies to and cannot name
a variable inside one, so this is an inference. Declare one render per variable
to make it exact.

## Requirements for a Zarr store in a Portolan catalog

These are the properties that decide whether a store draws, and whether it
draws quickly at every zoom. The first three are hard requirements. The browser
refuses a store that fails them and says why, rather than hanging or drawing
something wrong.

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

### Ship overviews

A Zarr array with no overviews has one level at full resolution. deck.gl asks a
tiled layer for every tile that meets the viewport, so a world view of the FTW
global store, 4,007,517 pixels across, would ask for its 375,000 chunks.

The browser holds such a store back to the zoom where its coarsest level is
affordable, and says so on the map. The FTW store draws from zoom 11. A store
with a full pyramid draws at every zoom: the italy-aerial store has twelve
levels and its coarsest is two chunks across, so it draws at a world view.

Write the GeoZarr `multiscales` convention, with each level half the previous
one, down to a level that fits in a chunk or two.

### Keep chunks near a screen tile in size

Chunk edges of 256 to 1024 pixels suit display. Each chunk is one request, one
decompression, and one colormap pass on the main thread.

A 4096 by 4096 chunk is 16.7 million samples and a 67 MB image for one tile.
The browser reads every nth sample of a chunk that large so the work per tile
stays bounded, which keeps the map responsive but throws away resolution it
paid to download. Smaller chunks avoid the trade.

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
already display values, so the browser composites them as true colour. It
takes the no-data values from the asset's `bands`, which is what keeps the sea
transparent in an orthophoto rather than black.

### Use a projection the browser can reproject

The browser reprojects with proj4. An EPSG code always works. A WKT2
definition works for the common projections.

A geostationary satellite grid does not work today. `wkt-parser` does not map
the WKT2 method `Geostationary Satellite (Sweep X)` onto proj4's
`Geostationary Satellite View`, and does not carry the satellite height
across, so the GOES store in this catalog cannot be drawn. Declare `proj:code`
where the grid has an EPSG code.

### Check the codecs have JavaScript implementations

zarrita decodes blosc, lz4, zstd, gzip, zlib, shuffle, delta, sharding and the
other codecs in its registry. It has no GRIB decoder.

This decides whether a virtual Zarr store can be drawn. The GOES store's
chunks are byte ranges inside NOAA's netCDF files, compressed with zlib, and
they read fine. dynamical.org's virtual repositories reference GRIB messages
decoded by a `gribberish` codec that exists only in Python and Rust, so the
browser cannot read a single chunk of them.

### Serve the store with CORS

The browser reads the store from the page, so the bucket needs
`Access-Control-Allow-Origin`. A virtual store needs it on the referenced
files too, not only on the store itself.

## Testing

`tests/fixtures/catalogs/zarr` is a local catalog whose collections cover each
outcome above. The dev server serves it at `/test-catalogs/zarr/catalog.json`.
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
node tests/manual/zarr-render-check.mjs
```
