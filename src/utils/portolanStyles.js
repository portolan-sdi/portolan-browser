import { toAbsolute } from 'stac-js/src/http.js';
import { isMediaType } from 'stac-js/src/mediatypes.js';

// Media types a MapLibre GL style may be published under. `application/json`
// is accepted because catalogs published before the media type was pinned use
// it, and an absent type is accepted because some writers omit it: the `style`
// role is the normative signal, and loadStyleJson still rejects anything that
// is not a GL v8 document.
const STYLE_MEDIA_TYPES = ['application/vnd.mapbox.style+json', 'application/json'];

// Style hrefs come from untrusted catalog JSON and are handed straight to
// fetch(), so restrict them to schemes a style can legitimately live on. This
// keeps `file:`, `data:`, `blob:` and `javascript:` out of the fetch.
const FETCHABLE_SCHEMES = ['http:', 'https:'];

// Works on stac-js Assets (which expose hasRole) and on bare STAC JSON alike,
// and tolerates a malformed `roles` of any shape.
function hasRole(asset, role) {
  if (typeof asset?.hasRole === 'function') {return asset.hasRole(role);}
  return Array.isArray(asset?.roles) && asset.roles.includes(role);
}

// core.md, "Visualization Styles": "each style MUST be registered as a
// collection-level asset carrying the `style` role … A client or agent
// discovers a collection's styles by filtering assets on that role, so no
// separate manifest is needed and this specification defines none."
function isStyleAsset(asset) {
  // isMediaType handles a non-string type, media-type parameters and case;
  // the third argument allows an absent type.
  return hasRole(asset, 'style') && isMediaType(asset?.type ?? undefined, STYLE_MEDIA_TYPES, true);
}

function isFetchableHref(href) {
  if (typeof href !== 'string' || href.length === 0) {return false;}
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(href);
  // Relative and protocol-relative hrefs resolve against the page origin.
  if (!scheme) {return true;}
  return FETCHABLE_SCHEMES.includes(`${scheme[1].toLowerCase()}:`);
}

// toAbsolute throws on a missing or unparseable href, and a style asset with
// no usable href must not take out discovery for the whole collection.
function absoluteHref(href, baseUrl) {
  if (typeof href !== 'string' || href.length === 0) {return null;}
  let absolute;
  try {
    absolute = toAbsolute(href, baseUrl);
  } catch {
    return null;
  }
  return isFetchableHref(absolute) ? absolute : null;
}

// stac-js Assets resolve their own href against the collection; a definition
// or an unresolvable href yields null, so fall back to explicit resolution.
function assetHref(asset, baseUrl) {
  const own = asset?.getAbsoluteUrl?.();
  if (typeof own === 'string' && isFetchableHref(own)) {return own;}
  return absoluteHref(asset?.href, baseUrl);
}

// Titles reach the DOM and commonPrefix, so they must be strings. The `styles/`
// prefix is stripped anchored — an unanchored strip would mangle a key like
// `basemap/styles/dark`.
function styleTitle(key, asset) {
  const title = asset?.title;
  if (typeof title === 'string' && title.length > 0) {return title;}
  return String(key).replace(/^styles\//, '');
}

// The single constructor for a style record, so the three discovery paths
// cannot drift apart. Returns null for anything not renderable.
function styleRecord(key, asset, href) {
  if (typeof key !== 'string' || key.length === 0 || !href) {return null;}
  return { name: key, title: styleTitle(key, asset), href };
}

// stac-js hydrates Collection.assets into {key: Asset}, so Object.entries
// yields the very Asset instances getAssets() returns, with their keys — and
// the same expression still works on bare STAC JSON.
function assetEntries(stac) {
  return stac?.assets ? Object.entries(stac.assets) : [];
}

function styleAssetEntries(stac) {
  return assetEntries(stac).filter(([, asset]) => isStyleAsset(asset));
}

function hasDefaultStyleAsset(stac) {
  return styleAssetEntries(stac).some(([, asset]) => hasRole(asset, 'default'));
}

// Styles declared the spec way: collection assets carrying the `style` role.
//
// core.md: "Because STAC assets are an unordered JSON object … the default
// style is identified by a second role rather than by position or key: when a
// collection provides more than one style, exactly one style asset MUST carry
// both `style` and `default` in its `roles`." Catalogs published before that
// rule carry no marker, so document order is the fallback.
function stylesFromAssets(stac, baseUrl) {
  const entries = styleAssetEntries(stac);
  const defaultIndex = entries.findIndex(([, asset]) => hasRole(asset, 'default'));
  if (defaultIndex > 0) {entries.unshift(...entries.splice(defaultIndex, 1));}

  return entries
    .map(([key, asset]) => styleRecord(key, asset, assetHref(asset, baseUrl)))
    .filter(Boolean);
}

// Pre-spec Portolan catalogs listed their styles in a `portolan:styles`
// manifest instead of tagging the assets. The spec defines no manifest, so it
// is consulted only to fill in styles the asset scan did not already find —
// keeping already-published and half-migrated catalogs rendering.
function stylesFromLegacyManifest(stac, baseUrl) {
  const styleEntries = stac.properties?.['portolan:styles']
    || stac['portolan:styles']
    || [];

  if (!Array.isArray(styleEntries) || styleEntries.length === 0) {return [];}

  return styleEntries
    .map(entry => {
      if (typeof entry === 'string') {
        const asset = stac.assets?.[entry];
        if (!asset) {return null;}
        return styleRecord(entry, asset, assetHref(asset, baseUrl));
      }

      if (entry && typeof entry === 'object' && typeof entry.href === 'string') {
        const key = entry.name || entry.href;
        const matchingAsset = stac.assets?.[`styles/${entry.name}`];
        return styleRecord(String(key), matchingAsset, absoluteHref(entry.href, baseUrl));
      }

      return null;
    })
    .filter(Boolean);
}

export function resolveStyles(stac) {
  if (!stac) {return [];}
  const baseUrl = stac.getAbsoluteUrl?.() || '';

  const fromAssets = stylesFromAssets(stac, baseUrl);
  const legacy = stylesFromLegacyManifest(stac, baseUrl);

  // Merge rather than replace. A half-migrated catalog can tag some styles as
  // assets while others are still only named in the manifest; letting a single
  // tagged asset suppress the manifest would silently drop the rest.
  const seen = new Set(fromAssets.map(s => s.name));
  const styles = fromAssets.concat(legacy.filter(s => !seen.has(s.name)));
  if (styles.length === 0) {return [];}

  // Last resort for the default: with no `default` role anywhere, a legacy
  // manifest's first entry is the publisher's curated choice, so it outranks
  // asset document order — but only if it is itself a tagged asset. A
  // manifest-only entry must not leapfrog the styles the spec path found.
  if (legacy.length > 0 && !hasDefaultStyleAsset(stac)) {
    const preferred = legacy[0].name;
    const index = styles.findIndex(s => s.name === preferred);
    if (index > 0 && seen.has(preferred)) {styles.unshift(...styles.splice(index, 1));}
  }

  if (styles.length > 1) {
    const prefix = commonPrefix(styles.map(s => s.title));
    if (prefix.length > 0) {
      return styles.map(s => ({ ...s, title: s.title.slice(prefix.length) }));
    }
  }

  return styles;
}

function commonPrefix(strings) {
  if (strings.length === 0) {return '';}
  let prefix = strings[0];
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix.length === 0) {return '';}
    }
  }
  // Trim to last separator (space, dash, colon) so we don't cut mid-word
  const lastSep = Math.max(prefix.lastIndexOf(' '), prefix.lastIndexOf('—'), prefix.lastIndexOf('-'), prefix.lastIndexOf(':'));
  if (lastSep > 0) {prefix = prefix.slice(0, lastSep + 1);}
  else {prefix = '';}
  return prefix;
}

export function extractLegend(glStyle) {
  if (!glStyle?.layers) {return [];}

  const fillLayer = glStyle.layers.find(l => l.type === 'fill');
  if (!fillLayer) {return [];}

  const fillColor = fillLayer.paint?.['fill-color'];
  if (!fillColor || typeof fillColor === 'string') {return [];}
  if (!Array.isArray(fillColor)) {return [];}

  const type = fillColor[0];

  if (type === 'step') {
    // ["step", ["get", field], defaultColor, stop1, color1, stop2, color2, ...]
    const items = [];
    const defaultColor = fillColor[2];
    const stops = fillColor.slice(3);
    items.push({ color: defaultColor, label: `< ${stops[0]}` });
    for (let i = 0; i < stops.length; i += 2) {
      const value = stops[i];
      const color = stops[i + 1];
      const nextValue = stops[i + 2];
      items.push({
        color,
        label: nextValue != null ? `${value}–${nextValue}` : `${value}+`,
      });
    }
    return items;
  }

  if (type === 'match') {
    // ["match", ["get", field], val1, color1, val2, color2, ..., fallback]
    const items = [];
    const pairs = fillColor.slice(2, -1);
    for (let i = 0; i < pairs.length; i += 2) {
      items.push({ color: pairs[i + 1], label: String(pairs[i]) });
    }
    return items;
  }

  return [];
}

export async function loadStyleJson(href) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(href, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Failed to fetch style: ${response.status} ${href}`);
    }
    // The signal stays armed across the body read: clearing it once the
    // headers arrive leaves response.json() unbounded, so a slow-drip or
    // endless body could buffer without limit.
    const data = await response.json();
    if (!data || data.version !== 8) {
      throw new Error(`Invalid Mapbox GL style (version !== 8) at ${href}`);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
