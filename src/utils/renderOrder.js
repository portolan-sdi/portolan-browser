// Which layers an item opens with, and the order they stack in.
//
// STAC says which assets exist and how each one should be coloured, but nothing
// about which of them a viewer should draw, or on top of which. Picking one
// asset is a guess a viewer can make on its own — the `visual` role, an
// overview, a cheap data type. Picking several, in a deliberate order, is an
// editorial decision, and only the publisher can make it: a benchmark chip
// wants its true-colour scene with the label mask over it, not either alone.
//
// `portolan:render_order` is that decision, written down: an array of keys into
// the item's own `renders`, bottom first.
//
//   "renders": {
//     "planting_rgb": { "assets": ["planting_image"], "bidx": [1, 2, 3], ... },
//     "instance":     { "assets": ["instance_mask"], "colormap_name": "viridis", ... }
//   },
//   "portolan:render_order": ["planting_rgb", "instance"]
//
// That item opens showing its true-colour scene with the field instances drawn
// over it. Naming renders rather than assets means one key settles both which
// layer to draw and how to colour it, and it reuses the vocabulary the render
// extension already gave the publisher.
//
// It is a hint, never a requirement. A key naming no render is skipped, a
// render naming no loadable asset contributes nothing, a document that omits
// the field keeps the single-asset default, and a viewer that has never heard
// of the field still renders the item — which is why it is a namespaced field
// rather than a reinterpretation of `roles`. See docs/layers.md.

export const RENDER_ORDER_FIELD = 'portolan:render_order';

// An order longer than this is not a default stack any more. Bounds the lookup
// below over untrusted catalog input.
const MAX_ORDERED_RENDERS = 16;

function assetKey(asset) {
  return asset?.getKey?.() ?? asset?.key;
}

/** The raw `portolan:render_order` value of a STAC document, or null. */
export function renderOrderKeys(stac) {
  const keys = stac?.properties?.[RENDER_ORDER_FIELD] ?? stac?.[RENDER_ORDER_FIELD];
  return Array.isArray(keys) ? keys.slice(0, MAX_ORDERED_RENDERS) : null;
}

/**
 * Resolve `portolan:render_order` against an item's renders and the assets a
 * caller can actually draw. Returns `[{ id, render, asset }]` in draw order,
 * bottom first — empty whenever the document declares no usable order, which
 * means "fall back to the usual single pick".
 *
 * A render listing several assets contributes one entry per asset, in the
 * render's own asset order: they share a colouring, so they share a place in
 * the stack.
 */
export function orderedRenderLayers(stac, renders, assets) {
  const keys = renderOrderKeys(stac);
  if (!keys) {return [];}
  const byKey = new Map((assets || []).map(a => [assetKey(a), a]));
  const layers = [];
  const seen = new Set();
  for (const id of keys) {
    const render = typeof id === 'string' ? renders?.[id] : undefined;
    if (!render || typeof render !== 'object') {continue;}
    for (const key of (Array.isArray(render.assets) ? render.assets : [])) {
      const asset = byKey.get(key);
      if (!asset || seen.has(key)) {continue;}
      seen.add(key);
      layers.push({ id, render, asset });
    }
  }
  return layers;
}
