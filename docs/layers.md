# Layers <!-- omit in toc -->

An item can hold a dozen rasters: a true-colour scene per season, the imagery
they were cut from, and a label mask for every way the data has been encoded.
Portolan Browser has to decide which of them the map opens with, and in what
order they stack. This page records how that decision is made, and how a catalog
can make it instead.

## Table of contents <!-- omit in toc -->

- [What opens by default](#what-opens-by-default)
- [Declaring the stack](#declaring-the-stack)
  - [Why a namespaced field](#why-a-namespaced-field)
- [Which render colours which asset](#which-render-colours-which-asset)
- [True-colour renders](#true-colour-renders)
- [The layer picker](#the-layer-picker)

## What opens by default

Where the catalog says nothing, the browser picks exactly one raster: the first
asset with the `visual` role, or failing that the first COG the item lists. One
layer is the only guess a viewer can make safely, because nothing in the
metadata says how two rasters are meant to sit together.

## Declaring the stack

`portolan:render_order` is an array of keys into the item's own `renders`,
**bottom first**. The browser opens with every asset those renders name, in that
order, drawing each over the one before it.

```json
{
  "properties": {
    "renders": {
      "planting_rgb": {
        "title": "Planting season (true colour)",
        "assets": ["planting_image"],
        "bidx": [1, 2, 3],
        "rescale": [[1067, 7045], [1077, 3400], [1050, 3295]],
        "nodata": 0
      },
      "instance": {
        "title": "Field instances",
        "assets": ["instance_mask"],
        "colormap_name": "viridis",
        "rescale": [[0, 945174]],
        "nodata": 0
      }
    },
    "portolan:render_order": ["planting_rgb", "instance"]
  }
}
```

That item opens showing its true-colour imagery with the field instances drawn
on top. The layer picker lists the two in the same order, and the user can turn
either one off.

Naming renders rather than assets means one key settles both which layer to draw
and how to colour it. A render that lists several assets contributes one layer
per asset, in the render's own asset order — they share a colouring, so they
share a place in the stack.

The field is read from `properties` first and then from the document root, the
same two places `portolan:styles` is read from. It also drives which assets the
item page marks as shown on the map.

Everything about it degrades:

- A catalog that omits the field keeps the single-asset default above.
- A key naming no render in the document is skipped.
- A render whose assets the browser cannot draw contributes nothing.
- An asset named twice is drawn once, at its first position.
- If nothing resolves, the single-asset default applies as though the field were
  absent.
- A value that is not an array is ignored.
- A viewer that has never heard of the field still renders the item.

An explicit "show on map" from the user always wins over the declared stack: the
field says how the item *opens*, not what it is pinned to.

### Why a namespaced field

The tempting alternative is to widen the `visual` role — mark the label mask
`visual` too, and draw every `visual` asset. It is not worth it. STAC defines
`visual` as "an image suitable for display", meaning a picture of the scene; a
one-band instance-id raster is not that, and a catalog that claims it is misleads
every other STAC client that reads the role. Roles also carry no order, so a
two-layer stack would silently depend on the order the assets happen to appear
in.

Leaning on the declaration order of `renders` alone is no better: it is a JSON
object, and object key order is not something a specification can rely on.

STAC genuinely cannot express stacking. A namespaced field is the honest answer,
and it keeps the STAC-defined terms meaning what STAC says they mean.

## Which render colours which asset

An asset can be named by more than one render. The browser resolves the
colouring of each raster layer in this order:

1. **The render `portolan:render_order` named for it**, where the item declares
   a stack. The publisher said which colouring belongs to this layer.
2. **A render that lists the asset** in its `assets`.
3. **The item's first declared render**, stretched to the asset's own band
   statistics — for an 8-bit derivative of an asset a render already covers.

Step 3 applies only to an asset whose band metadata describes exactly one band.
A colormap is a function of one band: running it over an asset with three draws
a true-colour scene as a false-colour ramp of its red band, and running it over
an asset with no band metadata at all is a guess with no statistics to stretch
to. Those assets are drawn through deck.gl's default path instead, which shows
the file as it is.

Band metadata is read from `bands` (STAC 1.1) and from `raster:bands` (the
raster extension), because most published catalogs still use the latter and
nothing migrates between them.

## True-colour renders

A render whose `bidx` names exactly three bands is a true-colour composite
rather than a colormap. The browser reads those three bands in the order given
and stretches each by its own entry in `rescale`; a single `rescale` pair
applies to all three. `bidx` is 1-based, so `[4, 1, 2]` is the usual
false-colour infrared composite.

A pixel is drawn transparent only where *every* named band reads as `nodata` —
one zero channel inside real data is data, and punching it out would perforate
the scene.

Any other `bidx` — one band, two, four — takes the single-band colormap path,
where `bidx[0]` chooses the band and `rescale[0]` stretches it.

## The layer picker

The picker lists every raster asset of the item, up to 16. Listing is cheap —
an asset is only decoded once it is switched on — but a list longer than that
stops being usable. Where an item carries more, the picker says how many it left
out rather than quietly showing a shorter list, and "show on map" on an unlisted
asset swaps it into the list.
