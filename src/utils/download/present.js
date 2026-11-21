// Turning an `Estimate`, a progress event and a `CnmwError` into things a
// person can read. Pure functions, no i18n: each returns the *kind* of
// thing to say and the numbers to say it with, and the card supplies the
// sentence.

/** Human-readable bytes. */
export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  let index = 0;
  let scaled = value;
  while (scaled >= 1024 && index < units.length - 1) {
    scaled /= 1024;
    index += 1;
  }
  return `${index === 0 ? Math.round(scaled) : scaled.toFixed(1)} ${units[index]}`;
}

/** Thousands-separated count. */
export function formatCount(count) {
  return Math.round(Number(count) || 0).toLocaleString();
}

/**
 * O12: how wide is this `Bounded`, and therefore how should it be said?
 *
 * - `exact` — straight from parquet metadata. One number, no hedge.
 * - `range` — modelled, but the model is informative. "≈36,500", with the
 *   bounds behind it.
 * - `wide` — modelled with little to go on (the package's own
 *   `isEstimateWide` threshold, `max/estimate > 10`). Then the honest
 *   headline is the *range*, "0 – 100,000", and the point estimate is the
 *   footnote. A single number here would be a guess wearing a suit.
 *
 * @param {{ min: number, max: number, estimate: number, exact: boolean }|null|undefined} bounded
 * @param {(value: number) => string} [format]
 * @returns {{ kind: 'exact'|'range'|'wide', estimate: string, min: string, max: string }|null}
 */
export function describeBounded(bounded, format = formatCount) {
  if (!bounded) {
    return null;
  }
  const parts = {
    estimate: format(bounded.estimate),
    min: format(bounded.min),
    max: format(bounded.max)
  };
  if (bounded.exact || (parts.min === parts.max)) {
    return { kind: 'exact', ...parts };
  }
  const ratio = bounded.estimate > 0 ? bounded.max / bounded.estimate : Infinity;
  return { kind: ratio > 10 ? 'wide' : 'range', ...parts };
}

/**
 * The pruning cascade as narration: one line per stage that actually ran,
 * each with what it looked at, what survived, and on what basis. This is
 * the answer to "why is this estimate what it is", and it is the only place
 * a user can see that naming a month turned 27 files into one.
 *
 * Stages that neither narrowed anything nor had anything to say are kept
 * too — a stage that could not prune ("no covering — full scan") is exactly
 * what explains a large read.
 *
 * @param {{ prune?: Array<{ stage: string, before: number, after: number, basis?: string }> }} estimate
 */
export function pruneLines(estimate) {
  const stages = estimate?.prune || [];
  return stages.map(stage => ({
    stage: stage.stage,
    unit: stage.stage.startsWith('row-group') ? 'rowGroups' : 'files',
    before: formatCount(stage.before),
    after: formatCount(stage.after),
    dropped: stage.before - stage.after,
    basis: stage.basis || ''
  }));
}

/** `SINK_QUOTA_EXCEEDED` -> `sinkQuotaExceeded`. */
export function camelCode(code) {
  return String(code || '')
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, char) => char.toUpperCase());
}

// Every code in `@cngeo/spec`'s taxonomy that can reach this widget, plus
// `CANCELLED`. The taxonomy's own rule is that the code is the API and the
// message is for humans and may be reworded — so the widget rewords it,
// into something that says what to do next, and falls back to the thrown
// message for anything not listed.
export const ERROR_CODES = [
  'AREA_INVALID_CRS',
  'AREA_UNSUPPORTED_GEOMETRY',
  'AREA_EMPTY',
  'AREA_VERTEX_CEILING',
  'AREA_ANTIMERIDIAN_CLIP',
  'UPLOAD_TOO_LARGE',
  'INDEX_FETCH_FAILED',
  'INDEX_SCHEMA_MISMATCH',
  'INDEX_VERSION_MISMATCH',
  'INDEX_TOO_LARGE',
  'RANGE_NOT_SUPPORTED',
  'GEOMETRY_NOT_FOUND',
  'DATASET_UNRESOLVED',
  'DATASET_UNSUPPORTED',
  'DATASET_NO_GEOMETRY_COLUMN',
  'DATASET_CRS_UNSUPPORTED',
  'FILTER_UNKNOWN_COLUMN',
  'FILTER_UNSUPPORTED_PREDICATE',
  'FILTER_REQUIRES_ENGINE',
  'CEILING_EXCEEDED',
  'FORMAT_UNAVAILABLE',
  'FORMAT_CAPABILITY',
  // Not in `@cngeo/spec`'s own typedef yet: `registerLazyFormat`'s loader
  // throws it when a format plugin cannot be fetched (E10). Listed here so
  // the card says "that format's writer could not be loaded" instead of
  // printing the code.
  'FORMAT_LOAD_FAILED',
  'SINK_PERMISSION_DENIED',
  'SINK_QUOTA_EXCEEDED',
  'SINK_UNSUPPORTED',
  'NETWORK',
  'CORS',
  'HTTP_STATUS',
  'CANCELLED',
  'INTERNAL',
  'GEOCODER_NOT_LOADED'
];

const KNOWN = new Set(ERROR_CODES);

/**
 * How to say an error: the i18n key for a code in the taxonomy, or null
 * when the thrown message is all there is.
 * @param {unknown} error
 * @returns {{ key: string|null, code: string, message: string, retryable: boolean }}
 */
export function describeError(error) {
  const code = error?.code || '';
  const message = error?.message || String(error ?? '');
  return {
    key: KNOWN.has(code) ? `widgets.areaDownload.errors.${camelCode(code)}` : null,
    code,
    message,
    retryable: Boolean(error?.retryable)
  };
}

/**
 * Was the download stopped by the user rather than broken?
 * @param {unknown} error
 */
export function isCancellation(error) {
  return error?.code === 'CANCELLED';
}
