// Iceberg constants and predicates shared between the map layer and the Iceberg
// loader. This module must stay free of icebird imports so that StacMapLayer
// and mapAssets can import it statically without pulling icebird into the map
// bundle. icebird lives behind utils/iceberg.js, which StacMapLayer loads
// lazily.
//
// The metadata fields follow the Portolan STAC Iceberg extension, which uses
// the `iceberg:` prefix:
// https://github.com/portolan-sdi/stac-iceberg-extension

import { hasGlobPattern } from './parquetShared.js';
import { fetchableAssetHref } from './fetchableHref.js';

export const ICEBERG_MEDIA_TYPE = 'application/vnd.apache.iceberg+json';

// Row cap for the table preview in IcebergViewer.
export const MAX_ICEBERG_PREVIEW_ROWS = 1000;

// Row cap for one map load. The map draws the geometries of the same first rows
// that the preview table shows, so the two views always agree. An Iceberg table
// can hold far more rows than the browser can draw, so the loader stops here
// and reports a truncated result. It does not refuse the table.
export const MAX_ICEBERG_MAP_ROWS = MAX_ICEBERG_PREVIEW_ROWS;

// Read an `iceberg:` field from the asset first, then from its parent
// Collection or Item. The extension allows the field at both levels.
export function icebergField(asset, name) {
  return asset?.[name] ?? asset?.getMetadata?.(name);
}

function hrefOf(asset) {
  return asset.getAbsoluteUrl?.() || asset.href || '';
}

// Substring media-type match, so a parameterized type is detected. The
// `.metadata.json` fallback covers an untyped asset, because every Iceberg
// writer names the table metadata file that way.
export function isIcebergAsset(asset) {
  if (!asset) {return false;}
  const type = asset.type || '';
  if (type.includes(ICEBERG_MEDIA_TYPE)) {return true;}
  const path = hrefOf(asset).split('#')[0].split('?')[0];
  return /\.metadata\.json(\.gz)?$/i.test(path);
}

// The URL of the table's metadata.json that a browser can fetch. The asset
// href is the first choice, because the extension defines it as the
// metadata.json URL. An https alternate covers a non-browser href such as
// `s3://`. The `iceberg:metadata_location` field is the last choice. It is
// used only when it is already an absolute http(s) URL, because a relative
// value would need the Collection URL that an asset does not carry.
export function icebergMetadataUrl(asset) {
  const fromAsset = fetchableAssetHref(asset);
  if (fromAsset) {return fromAsset;}
  const location = icebergField(asset, 'iceberg:metadata_location');
  return typeof location === 'string' && /^https?:\/\//i.test(location) ? location : null;
}

// An Iceberg asset the browser can read: one with a concrete metadata.json URL
// that a browser can fetch. The catalog type does not matter. The browser reads
// the table from its files and never talks to a catalog, so a table in a REST,
// Glue or Hive catalog is as readable as a static one. The extension adds the
// asset to a managed table only when its metadata file is fetchable, and a
// metadata file that needs credentials fails at read time with a message.
export function isLoadableIcebergAsset(asset) {
  if (!isIcebergAsset(asset)) {return false;}
  if (hasGlobPattern(hrefOf(asset))) {return false;}
  return icebergMetadataUrl(asset) !== null;
}

// icebird addresses a table by its base URL plus a metadata file name, and it
// joins them as `<table>/metadata/<file>`. Split a metadata.json URL back into
// those two parts. Returns null for a URL that does not follow that layout.
export function splitMetadataUrl(url) {
  if (typeof url !== 'string' || url.includes('?') || url.includes('#')) {return null;}
  const match = url.match(/^(.+)\/metadata\/([^/]+\.metadata\.json(?:\.gz)?)$/i);
  if (!match) {return null;}
  const [, tableUrl, metadataFileName] = match;
  return { tableUrl, metadataFileName };
}
