# Layers <!-- omit in toc -->

An item can list many rasters. A benchmark chip stores one true-colour scene
per season beside the source imagery and a label mask for each encoding of its
labels. Portolan Browser decides which of those rasters the map opens with and
how they stack. This page records that decision and the field a catalog can
use to make it instead.

## Table of contents <!-- omit in toc -->

- [Status of `portolan:render_order`](#status-of-portolanrender_order)
- [What opens by default](#what-opens-by-default)
- [Declaring the stack](#declaring-the-stack)
  - [Reasons for a separate field](#reasons-for-a-separate-field)
- [Which render colours which asset](#which-render-colours-which-asset)
- [True-colour renders](#true-colour-renders)
- [The layer picker](#the-layer-picker)

## Status of `portolan:render_order`

`portolan:render_order` is a browser-side hint that the Portolan specification
does not define. Raster styling is an open question in portolan-spec, tracked in
[issue #41](https://github.com/portolan-sdi/portolan-spec/issues/41) and the
[raster styling
note](https://github.com/portolan-sdi/portolan-spec/blob/main/specs/incubating/raster-styling.md).
The field can change or disappear once the specification defines raster
styling. A catalog that uses it today loses nothing if it goes away, because
every reader that does not know the field still renders the item.

## What opens by default

Where the catalog says nothing, the browser opens one raster. On the item page
that is the first asset with the `visual` role, or the first COG the item lists
when no asset has that role. When the map receives a selection with no COG in
it, as after the user shows a GeoParquet asset on an item that also has
rasters, the map layer chooses for itself. It prefers, in order, the
`visual` role, the `overview` role, an EPSG:3857 projection, and 8-bit samples.

One layer is the safe guess, because the metadata says nothing about how two
rasters are meant to sit together.

Where the catalog declares no order, the layer picker lists the pictures first
and the masks after them, each group in item order. A mask is a raster whose
band metadata describes one band, or one that carries classification classes.
List order is draw order, bottom first, so a mask the user turns on draws above
the scene rather than under it.

## Declaring the stack

`portolan:render_order` is an array of keys into the item's own `renders`,
**bottom first**. The browser opens with the assets those renders reference, in
that order, and draws each over the one before it.

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

That item opens with its true-colour imagery under the field instances. The
layer picker lists both in the same order, and the user can turn either one off.

Because the field references renders rather than assets, one key settles both
which layer to draw and how to colour it. A render that lists several assets
contributes one layer per asset, in the render's own asset order, since those
assets share a colouring.

The browser reads the field from `properties` first and then from the document
root. The item page marks the same assets as shown on the map.

The field degrades in every case where it cannot apply:

- A catalog that omits the field keeps the single-asset default above.
- A key that references no render in the document is skipped.
- A render whose assets the browser cannot draw contributes nothing.
- An asset referenced twice is drawn once, at its first position.
- If nothing resolves, the single-asset default applies as though the field were
  absent.
- A value that is not an array is ignored.
- A stack longer than 16 layers is cut at 16, which is the layer picker's cap.

An explicit "show on map" from the user replaces the declared stack. The field
says how the item opens, not what it is pinned to.

### Reasons for a separate field

Widening the `visual` role would mean marking the label mask `visual` too and
drawing every `visual` asset. STAC defines `visual` as an image suitable for
display, which describes a picture of the scene. A one-band instance-id raster
is not a picture, and a catalog that claims it is misleads every other STAC
client that reads the role. Roles also have no order, so a two-layer stack
would depend on the order the assets happen to appear in.

The declaration order of `renders` is no better as a signal. `renders` is a
JSON object, and a specification cannot rely on object key order.

STAC has no way to express stacking, so the browser reads a separate field and
keeps the STAC-defined terms meaning what STAC says they mean. Whether that
field becomes part of the Portolan specification is decided in portolan-spec,
not here.

## Which render colours which asset

An asset can be referenced by more than one render. The browser resolves the
colouring of each raster layer in this order:

1. **The asset's own classification colour hints**, where every class has one.
   They colour the pixels and name the classes, so a categorical mask draws and
   legends itself with no render at all. The render chosen in step 2 still
   supplies the title and the nodata sentinels.
2. **The render `portolan:render_order` references for the asset**, where the
   item declares a stack. Otherwise, the first render that lists the asset in
   its `assets`.
3. **A true-colour render synthesized from the asset's own band statistics**,
   where three or more bands each carry a minimum and a maximum. See
   [True-colour renders](#true-colour-renders).
4. **The item's first declared render**, stretched to the asset's own band
   statistics. This suits an 8-bit derivative of an asset a render already
   covers.

Step 4 applies only to an asset whose band metadata describes exactly one band.
A colormap is a function of one band. Applied to an asset with three, it draws
a true-colour scene as a false-colour ramp of its red band. Applied to an asset
with no band metadata, it has no statistics to stretch to. Steps 3 and 4 cannot
both apply to one asset, so their order does not matter.

An asset that matches none of the four steps, such as a two-band raster or a
three-band raster without statistics, draws through the deck.gl default path,
which shows the file as it is.

Band metadata comes from `bands` (STAC 1.1) or from `raster:bands` (raster
extension 1.x). The STAC migration step folds `raster:bands` into `bands` for a
document older than STAC 1.1. A STAC 1.1 document that still uses the raster
extension keeps `raster:bands`, so the browser reads both fields.

## True-colour renders

A render whose `bidx` references exactly three bands is a true-colour composite
rather than a colormap. The browser reads those three bands in the order given
and stretches each by its own entry in `rescale`. A `rescale` with one pair
applies that pair to all three. A band with no entry of its own is left at
`[0, 255]`. `bidx` is 1-based, so `[4, 1, 2]` is the usual false-colour infrared composite.

A pixel is drawn transparent only where all three bands read as `nodata`. One
zero channel inside real data is data, and making it transparent would
perforate the scene.

A `bidx` of any other length takes the single-band colormap path, where
`bidx[0]` chooses the band and `rescale[0]` stretches it.

A `bidx` that references a band the file does not have draws nothing. Reading
past the last band would take the next pixel's samples as data.

## The layer picker

The picker lists the raster assets of the item, up to 16. Listing is cheap,
because an asset is decoded only after it is switched on, but a longer list
stops being usable. Where an item has more rasters, the picker says how many it
left out, and "show on map" on an unlisted asset swaps it into the list.
