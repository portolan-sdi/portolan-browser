// Portolan v0.3 (PORTO-CORE-023 / PORTO-CORE-087) lets an asset's primary
// href use a non-browser scheme such as s3:// as long as the asset carries
// an https entry in `alternate` (the STAC alternate-assets extension: an
// object map of `{ href, title?, … }` records). This module is the single
// place that resolves "what URL can actually be fetched from the browser"
// for an asset, so every renderer/gate (StacMapLayer, zarr collection,
// HrefActions, …) shares one answer instead of four ad-hoc checks.
//
// Kept import-light on purpose: no stac-js or map-stack imports, so any
// consumer (including the non-map HrefActions path) can pull this in
// without dragging in heavier bundles.

// Same base-fallback trick as StacMapLayer's isHttpHref: a fixed base keeps
// URL parsing working where `location` is absent (e.g. unit tests in node).
export function isHttpUrl(url) {
  try {
    const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
    const protocol = new URL(url, base).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// Scans asset.alternate for the first entry whose href is (or resolves to)
// an absolute http(s) URL. Works on stac-js Asset instances and on plain
// objects alike: it only ever reads `entry.href`, never calls methods on
// the alternate entry itself.
export function httpsAlternateHref(asset) {
  const alternates = asset?.alternate;
  if (!alternates || typeof alternates !== 'object') {
    return null;
  }

  const base = asset.getAbsoluteUrl?.() || undefined;
  for (const entry of Object.values(alternates)) {
    const href = entry?.href;
    if (!href) {
      continue;
    }
    try {
      const resolved = new URL(href, base).href;
      if (isHttpUrl(resolved)) {
        return resolved;
      }
    } catch {
      // Relative href with no base to resolve against, or malformed URL:
      // not a usable alternate, try the next one.
    }
  }
  return null;
}

// The URL a renderer/gate should actually fetch: the asset's own absolute
// href when it is already http(s), otherwise the first https alternate,
// otherwise null (nothing fetchable from a browser).
export function fetchableAssetHref(asset) {
  const primary = asset?.getAbsoluteUrl?.() || asset?.href || '';
  if (primary && isHttpUrl(primary)) {
    return primary;
  }
  return httpsAlternateHref(asset);
}
