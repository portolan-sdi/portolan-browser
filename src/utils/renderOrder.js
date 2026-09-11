// Which layers an item opens with, and the order they stack in.
//
// STAC says which assets exist and how each one is coloured, but nothing about
// which of them a viewer draws, or on top of which. `portolan:render_order` is
// the publisher's answer: an array of keys into the item's own `renders`,
// bottom first. It is a hint, never a requirement: a key naming no render is
// skipped, a render naming no loadable asset contributes nothing, and a
// document without the field keeps the single-asset default.
//
// The field is a browser-side convention pending a proposal in portolan-spec
// (raster styling is open there as issue #41). See docs/layers.md.

const RENDER_ORDER_FIELD = 'portolan:render_order';

// A stack longer than this is not a default stack any more. Bounds both the
// key lookup and the resolved layers over untrusted catalog input; it matches
// the layer picker's cap, so a declared stack always fits the list.
const MAX_ORDERED_LAYERS = 16;

function assetKey(asset) {
  return asset?.getKey?.() ?? asset?.key;
}

/** The raw `portolan:render_order` value of a STAC document, or null. */
export function renderOrderKeys(stac) {
  const keys = stac?.properties?.[RENDER_ORDER_FIELD] ?? stac?.[RENDER_ORDER_FIELD];
  return Array.isArray(keys) ? keys.slice(0, MAX_ORDERED_LAYERS) : null;
}

/**
 * Resolve `portolan:render_order` against an item's renders and the assets a
 * caller can actually draw. Returns `[{ id, render, asset }]` in draw order,
 * bottom first — empty whenever the document declares no usable order, which
 * means "fall back to the usual single pick".
 *
 * A render listing several assets contributes one entry per asset, in the
 * render's own asset order: they share a colouring, so they share a place in
 * the stack. At most MAX_ORDERED_LAYERS layers are returned.
 */
export function orderedRenderLayers(stac, renders, assets) {
  const keys = renderOrderKeys(stac);
  if (!keys) {return [];}
  const byKey = new Map((assets || []).map(a => [assetKey(a), a]));
  const layers = [];
  const seen = new Set();
  for (const id of keys) {
    const render = typeof id === 'string' ? renders?.[id] : undefined;
    if (!Array.isArray(render?.assets)) {continue;}
    for (const key of render.assets) {
      const asset = byKey.get(key);
      if (!asset || seen.has(key)) {continue;}
      seen.add(key);
      layers.push({ id, render, asset });
      if (layers.length >= MAX_ORDERED_LAYERS) {return layers;}
    }
  }
  return layers;
}
