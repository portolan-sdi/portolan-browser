// Asset predicates shared between StacMapLayer (which renders assets) and
// HrefActions (which decides whether to offer "Show on map"). One source of
// truth: an asset gets the button exactly when the map layer has a renderer
// for it. This module must stay free of maplibre-gl and hyparquet imports so
// HrefActions can import it without pulling the map bundle into every page.

import { isParquetAsset } from './parquetShared.js';

export const COG_MIME_TYPES = [
  'image/tiff',
  'image/tiff; application=geotiff',
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff',
  'application/x-geotiff',
];

export const PMTILES_MIME_TYPES = [
  'application/vnd.pmtiles',
];

export const MVT_MIME_TYPES = [
  'application/vnd.mapbox-vector-tile',
  'application/x-protobuf',
];

export function assetHref(asset) {
  return asset.getAbsoluteUrl?.() || asset.href || '';
}

export function isCogAsset(asset) {
  const type = asset.type || '';
  return COG_MIME_TYPES.some(mt => type.includes(mt));
}

export function isPmtilesAsset(asset) {
  const type = asset.type || '';
  const href = assetHref(asset);
  return PMTILES_MIME_TYPES.some(mt => type.includes(mt)) || href.endsWith('.pmtiles');
}

export function isXyzVectorAsset(asset) {
  const type = asset.type || '';
  const href = assetHref(asset);
  if (!href.includes('{z}') || !href.includes('{x}') || !href.includes('{y}')) {return false;}
  return MVT_MIME_TYPES.some(mt => type.includes(mt));
}

// A Portolan collection registers its PMTiles visualization derivative through
// a collection-level `rel: "pmtiles"` link (PORTO-FMT-011, MUST). Publishing
// the same archive as an asset is optional, and says something else: that the
// publisher also offers the file as a download (PORTO-FMT-013, MAY). A
// conformant collection can therefore carry the link and no asset, so the link
// is the only place the renderer is guaranteed to find the tiles.
//
// stac-js Link objects extend Reference, so they already answer `href`, `type`,
// `title` and `getAbsoluteUrl()` — everything the tile renderer reads from an
// asset. They pass through as they are rather than being copied into a
// synthetic asset, which would lose the relative-href resolution that
// `getAbsoluteUrl` does against the collection's own URL.
// getLinksWithRels, not getStacLinksWithRel: the latter keeps only links whose
// media type is a STAC one, and `application/vnd.pmtiles` is not, so it drops
// every link this function exists to find.
export function pmtilesLinks(stac) {
  if (!stac || typeof stac.getLinksWithRels !== 'function') {return [];}
  return stac.getLinksWithRels(['pmtiles']).filter(isPmtilesAsset);
}

// Everything a collection offers the map: its assets, plus any PMTiles its
// links register that no asset already covers. When a publisher declares both
// for one archive — which the specification allows, and which means "render
// this and offer it for download" — the asset wins, because it carries the
// roles and the title the layer control reads.
export function renderableSources(stac) {
  if (!stac || typeof stac.getAssets !== 'function') {return [];}
  const assets = stac.getAssets();
  // An unresolvable href reads as the empty string. Keeping it out of the set
  // stops two such entries from cancelling each other as if they named one
  // archive. The set also grows as links are accepted, so a collection that
  // registers the same archive twice still yields one source.
  const covered = new Set(assets.map(asset => assetHref(asset)).filter(Boolean));
  const extra = [];
  for (const link of pmtilesLinks(stac)) {
    const href = assetHref(link);
    if (!href || covered.has(href)) {continue;}
    covered.add(href);
    extra.push(link);
  }
  return assets.concat(extra);
}

export function isTileJsonAsset(asset) {
  const type = asset.type || '';
  const roles = Array.isArray(asset.roles) ? asset.roles : [];
  if (!type.startsWith('application/json')) {return false;}
  return roles.includes('tiles');
}

// Everything StacMapLayer.setAssets can draw: COGs, PMTiles, XYZ vector
// tiles, TileJSON, and GeoParquet. Plain browser images, SVG, GeoJSON, and
// Zarr assets have no renderer in the MapLibre layer, so they must not be
// advertised as showable.
export function isMapRenderableAsset(asset) {
  return isCogAsset(asset)
    || isPmtilesAsset(asset)
    || isXyzVectorAsset(asset)
    || isTileJsonAsset(asset)
    || isParquetAsset(asset);
}
