# Raster rendering <!-- omit in toc -->

Portolan Browser decodes Cloud-Optimized GeoTIFF assets in the browser through
[deck.gl-geotiff](https://github.com/developmentseed/deck.gl-geotiff). No tile server sits between the
file and the map, so the colour of every pixel is decided from the STAC metadata alone. This page
records where that colour comes from.

## Table of contents <!-- omit in toc -->

- [Precedence](#precedence)
- [Class colour hints](#class-colour-hints)
- [Colormaps in a render](#colormaps-in-a-render)
  - [Discrete colormap](#discrete-colormap)
  - [Interval list](#interval-list)
  - [Linear stops](#linear-stops)
- [Legend](#legend)

## Precedence

The browser resolves the colouring of each COG asset in this order.

1. **Colour hints on the asset's own classes.** Where the first band of the asset holds
   `classification:classes` and every class resolves to a colour or to transparent, the browser
   builds a discrete colormap from the `color_hint` values. A render that lists the asset still
   supplies the layer title and the nodata values, and the browser ignores its colormap and its
   `bidx`. The hints describe band 1, so the browser reads band 1.
2. **A render that lists the asset.** The browser applies the `colormap` or `colormap_name`,
   `rescale`, `nodata`, and `bidx` fields of the first render whose `assets` list holds the asset key.
3. **The first declared render.** Where every render omits the asset, the browser reuses the first
   render in declaration order and stretches it to the band statistics of the asset.

An asset that matches none of these draws through the `viridis` ramp.

Class hints come first because they colour the pixels and name the classes at once. A categorical
mask then draws correctly in a catalog whose items carry no `renders` at all.

## Class colour hints

The [classification extension](https://github.com/stac-extensions/classification) describes the
values of a categorical raster. The browser reads the classes from `bands[0]` of the asset, from
`raster:bands[0]` for a STAC 1.0 asset, or from the asset itself.

```json
{
  "type": "image/tiff; application=geotiff; profile=cloud-optimized",
  "title": "3-class semantic mask",
  "raster:bands": [
    {
      "data_type": "uint8",
      "classification:classes": [
        { "value": 0, "name": "background", "color_hint": "000000" },
        { "value": 1, "name": "field", "color_hint": "009E73" },
        { "value": 2, "name": "boundary", "color_hint": "D55E00" }
      ]
    }
  ]
}
```

A `color_hint` is six hexadecimal digits without a leading `#`, as the extension defines it. The
match is exact. Classes named `background`, `nodata`, `no_data`, or `no-data` draw transparent,
whatever their case, and so does the class whose value matches the `nodata` of the band. A
transparent class needs no hint.

Every other class must carry a readable hint and a numeric `value`. One class without either sends
the whole asset to the render rules below. Partial hints cannot colour a mask. The browser would draw
a transparent hole for each class it cannot read, and it would ignore the render that colours those
classes correctly.

## Colormaps in a render

The [render extension](https://github.com/stac-extensions/render) specifies a colormap for one or
more assets. `colormap_name` selects a built-in ramp. `colormap` holds an explicit table, in any of
three forms.

### Discrete colormap

An object whose keys are pixel values and whose values are `[r, g, b]` or `[r, g, b, a]`. This is
the form the render extension documents, and the form titiler consumes. A key is a decimal integer.
A channel is an integer from 0 to 255.

```json
{
  "renders": {
    "labels": {
      "title": "3-class labels",
      "assets": ["semantic_3class_mask"],
      "rescale": [[0, 2]],
      "nodata": [0],
      "colormap": { "1": [0, 158, 115, 255], "2": [213, 94, 0, 255] }
    }
  }
}
```

The lookup reads the pixel value itself rather than the position of that value within `rescale`. A
value that the table omits draws transparent, as a nodata value does. An entry with an alpha of `0`
also draws transparent. Where the entry gives three channels, the browser reads the pixel as opaque.

### Interval list

A list of `[[min, max], [r, g, b(, a)]]` pairs, which is titiler's other discrete form. A pixel takes
the colour of the interval where `min <= value < max`. The interval with the highest `max` also
accepts a pixel equal to that `max`. The parser sorts the list, so write order does not matter.

The intervals must not overlap, and every `min` must be below its `max`. The browser rejects a list
that breaks either rule and falls back to the ramp. rio-tiler paints the last matching interval of an
overlapping pair, which the browser cannot reproduce, so it declines to guess and draw a different
map from the tile server.

```json
{
  "colormap": [
    [[0, 10], [255, 0, 0]],
    [[10, 20], [0, 255, 0]]
  ]
}
```

### Linear stops

A list of `[t, [r, g, b]]` stops, where `t` runs from 0 to 1 across the `rescale` range. The browser
interpolates between the stops, which suits a continuous band such as a distance map.

```json
{
  "colormap": [[0, [255, 0, 238]], [1, [0, 255, 0]]]
}
```

A colormap that the browser cannot parse falls back to the `viridis` ramp. The parser also rejects
a colormap of more than 1024 entries, because a catalog supplies untrusted input.

## Legend

The layer control lists one row per class under a raster layer that draws from a discrete colormap or
from class colour hints. Each row shows the swatch and the class name. The names come from
`classification:classes` whichever preceding rule chose the colours. A mask with named classes and
colours from a render still gets a named legend. Where the classes define no name for a
value, the row shows the pixel value instead. An interval row shows its range. A continuous ramp gets
no rows, because a list of swatches cannot describe one.

A row appears only for a colour the map draws. The browser leaves out a fully transparent entry, and
an entry whose value the render lists as `nodata`.

The list stops at 32 rows, and a row label stops at 64 characters.
