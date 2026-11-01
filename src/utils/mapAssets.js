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
