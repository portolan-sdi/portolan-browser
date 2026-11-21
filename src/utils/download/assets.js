// Which parquet asset does "download this dataset" mean?
//
// For most Portolan collections the answer is "the one data asset", and
// `@cngeo/extract-core`'s §2.4 derivation finds it. But a real catalog
// routinely publishes several: Fields of the World's benchmark collections
// carry `fields` (2.6M polygons, 889 MB), `fields_filtered`,
// `boundary_lines` and `chips` (14,506 rows, 1.4 MB), all with role `data`
// and all parquet. The derivation takes the first one it sees, which is how
// a user asking for the 1.4 MB chip index silently got a 889 MB field
// boundary read.
//
// So this module enumerates the candidates for the widget to offer, and
// narrows a collection JSON to the one the user picked before handing it to
// the derivation. Narrowing rather than patching the derived descriptor:
// the choice of asset changes the table too (its columns, its bbox
// covering, its time column), and the derivation is the thing that knows
// how to read those.
//
// Host-agnostic apart from importing this app's parquet predicates; the
// §2.4 derivation itself stays in `@cngeo/extract-core`.

import { isParquetAsset, hasGlobPattern } from '../parquetShared.js';

// Asset-level extension fields that describe *that asset's* table rather
// than the collection's. Lifted to the top level when the asset is the one
// being downloaded, because §2.4 reads them there.
const ASSET_TABLE_PREFIXES = ['table:', 'geoparquet:', 'proj:'];

function rolesOf(asset) {
  return Array.isArray(asset?.roles) ? asset.roles : [];
}

/** Does this asset carry its own `table:`/`geoparquet:`/`proj:` fields? */
export function hasOwnTableFields(asset) {
  return Object.keys(asset || {}).some(key => ASSET_TABLE_PREFIXES.some(prefix => key.startsWith(prefix)));
}

/**
 * The parquet assets a download could read, in document order.
 *
 * An asset qualifies when it is parquet (by media type or `.parquet` href,
 * this app's shared predicate) and either declares role `data` or declares
 * no roles at all. The roleless case matters: plenty of catalogs omit
 * `roles`, and §2.4 only looks at role-`data` assets, so without this a
 * single untyped-role parquet asset would be refused as "no parquet data
 * asset found" — `narrowToAsset` adds the role that makes the derivation
 * see it.
 *
 * A wildcard href (the `year=` glob a partitioned collection publishes) is
 * not a candidate: it names a partition set, not a file, and such a
 * collection is downloaded through its `partition:glob` and its item or
 * mirror enumeration instead.
 *
 * @param {object} json a plain STAC Collection/Item JSON with absolute hrefs
 * @returns {Array<{ key: string, title: string, href: string, rowCount: number|undefined,
 *   bytes: number|undefined, columns: object[]|undefined, aggregate: boolean, ownTable: boolean }>}
 */
export function parquetDataAssets(json) {
  const assets = json?.assets;
  if (!assets || typeof assets !== 'object') {
    return [];
  }
  const out = [];
  for (const [key, asset] of Object.entries(assets)) {
    if (!asset || typeof asset !== 'object') {
      continue;
    }
    const roles = rolesOf(asset);
    if (roles.length > 0 && !roles.includes('data')) {
      continue;
    }
    if (!isParquetAsset(asset)) {
      continue;
    }
    if (hasGlobPattern(asset.href)) {
      continue;
    }
    out.push({
      key,
      title: asset.title || key,
      href: asset.href,
      rowCount: asset['table:row_count'],
      bytes: asset['file:size'],
      columns: asset['table:columns'],
      // `data` + `aggregate` and `data` + `overview` are the Portolan
      // spellings for a derived table beside the detail one: FIRMS
      // publishes three aggregates of its detections, and every
      // geoBoundaries collection publishes a simplified `display` geometry
      // aligned row-for-row with its data. Worth marking, so a picker does
      // not leave two plausible "data" entries looking interchangeable.
      aggregate: roles.includes('aggregate'),
      overview: roles.includes('overview'),
      ownTable: hasOwnTableFields(asset)
    });
  }
  return out;
}

/**
 * The asset §2.4 would pick on its own: the first candidate. It is also the
 * one the *entity-level* `table:` fields describe, which is why
 * `narrowToAsset` keeps those only for it.
 * @param {object} json
 */
export function primaryAssetKey(json) {
  return parquetDataAssets(json)[0]?.key;
}

/**
 * A copy of `json` that can only derive to `key`.
 *
 * Three things happen:
 *
 *  1. Every other parquet data candidate is dropped from `assets`, so the
 *     derivation cannot pick one. Non-candidates (styles, PMTiles, the
 *     `collection-mirror`, thumbnails) stay: the derivation reads the
 *     mirror for partition enumeration and the attribution for licensing.
 *  2. The chosen asset is given role `data` if it had no roles, which is
 *     what makes an unroled parquet asset downloadable at all.
 *  3. The table description is made to be *this* asset's. An asset with its
 *     own `table:columns`/`table:row_count` wins over the entity's; an
 *     asset with none keeps the entity's only when it is the primary one,
 *     because that is the asset the entity's fields describe. A FIRMS year
 *     item's `table:columns` describes `detections.parquet`, not the
 *     `aggregate-r5` beside it with its own daily-column schema, and
 *     handing the aggregate those columns would project columns that are
 *     not in it. With nothing declared, `estimate()` infers the table from
 *     the parquet footer, which is honest and costs no extra request.
 *
 * @param {object} json
 * @param {string} [key] the asset to keep; defaults to the primary one
 */
export function narrowToAsset(json, key) {
  const candidates = parquetDataAssets(json);
  if (candidates.length === 0) {
    return json;
  }
  const chosen = candidates.find(candidate => candidate.key === key) || candidates[0];
  const assets = {};
  for (const [assetKey, asset] of Object.entries(json.assets)) {
    if (assetKey === chosen.key) {
      const roles = rolesOf(asset);
      assets[assetKey] = roles.includes('data') ? asset : { ...asset, roles: [...roles, 'data'] };
    } else if (!candidates.some(candidate => candidate.key === assetKey)) {
      assets[assetKey] = asset;
    }
  }

  const narrowed = { ...json, assets };
  const assetFields = Object.entries(json.assets[chosen.key]).filter(
    ([field]) => ASSET_TABLE_PREFIXES.some(prefix => field.startsWith(prefix))
  );
  if (assetFields.length > 0) {
    for (const [field, value] of assetFields) {
      narrowed[field] = value;
    }
  } else if (chosen.key !== candidates[0].key) {
    for (const field of Object.keys(narrowed)) {
      if (ASSET_TABLE_PREFIXES.some(prefix => field.startsWith(prefix))) {
        delete narrowed[field];
      }
    }
  }
  return narrowed;
}
