// The time window the download card offers, and what it means.
//
// A `FilterSpec.time` window is the cheapest filter a partitioned dataset
// has: `partitionPruneCascade` drops whole files whose declared interval
// misses the window before a single footer is read. Measured against the
// live FIRMS mirror (27 yearly files, 632M detections), a Contra Costa
// request goes from 27 files and 10.9 GB read to 1 file and 1.0 GB read by
// naming one month. That is the difference this module exists to make
// reachable without the user having to think of it.
//
// Nothing here is portolan-specific beyond reading STAC's own temporal
// extent spellings.

/** A calendar day in milliseconds. */
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The window to offer by default, in days, and the extent width above which
 * offering it is the right thing to do.
 *
 * Two years is the line, measured against real catalogs rather than taste:
 * Fields of the World's benchmark collections cover one year each and are
 * meant to be taken whole (their one-year extent is the dataset, not a
 * slice of a bigger one), while the FIRMS mirror covers 26 years and 632M
 * rows and is never meant to be taken whole from a browser. A default
 * window on the first of those would silently drop eleven months of a
 * dataset the user asked for by name.
 */
export const DEFAULT_WINDOW_DAYS = 30;
export const NARROW_EXTENT_DAYS = 730;

/**
 * The entity's temporal extent as an ISO pair, or null when it declares
 * none. Collections carry `extent.temporal.interval` (a list of intervals;
 * the first is the overall one by STAC's own rule); items carry
 * `start_datetime`/`end_datetime`, or a single `datetime`.
 * @param {object} json a plain STAC Collection or Item JSON
 * @returns {{ start: string|null, end: string|null }|null}
 */
export function temporalExtent(json) {
  if (!json || typeof json !== 'object') {
    return null;
  }
  const intervals = json.extent?.temporal?.interval;
  if (Array.isArray(intervals) && Array.isArray(intervals[0])) {
    const [start, end] = intervals[0];
    return start || end ? { start: start || null, end: end || null } : null;
  }
  const properties = json.properties || {};
  const start = properties.start_datetime || properties.datetime || null;
  const end = properties.end_datetime || properties.datetime || null;
  return start || end ? { start, end } : null;
}

/** `2020-01-01T00:00:00Z` -> `2020-01-01`, for an `<input type="date">`. */
export function toDateInput(iso) {
  if (!iso) {
    return '';
  }
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return '';
  }
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * How wide an extent is, in days. `Infinity` when either end is open: an
 * unbounded extent is the widest there is, and the one most in need of a
 * default window.
 * @param {{ start: string|null, end: string|null }|null} extent
 */
export function extentDays(extent) {
  if (!extent) {
    return 0;
  }
  const start = extent.start ? Date.parse(extent.start) : NaN;
  const end = extent.end ? Date.parse(extent.end) : NaN;
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return Infinity;
  }
  return Math.max(0, (end - start) / DAY_MS);
}

/**
 * The window the card starts with: the last `days` of the extent, clamped
 * to it. An extent narrower than `NARROW_EXTENT_DAYS` gets no window at all
 * — there is nothing to save by slicing a fortnight into a fortnight, and a
 * filter the user did not ask for should earn its place.
 *
 * Returned as `<input type="date">` values, which is what the card binds to.
 * @param {{ start: string|null, end: string|null }|null} extent
 * @param {{ days?: number, now?: number }} [options]
 * @returns {{ start: string, end: string }|null}
 */
export function defaultWindow(extent, options = {}) {
  if (!extent) {
    return null;
  }
  const days = options.days ?? DEFAULT_WINDOW_DAYS;
  if (extentDays(extent) <= NARROW_EXTENT_DAYS) {
    return null;
  }
  const now = options.now ?? Date.now();
  const extentEnd = extent.end ? Date.parse(extent.end) : NaN;
  const extentStart = extent.start ? Date.parse(extent.start) : NaN;
  // The end of the data, not today: a mirror that stopped updating in 2024
  // would otherwise default to an empty window.
  const end = Number.isNaN(extentEnd) ? now : Math.min(extentEnd, now);
  let start = end - days * DAY_MS;
  if (!Number.isNaN(extentStart)) {
    start = Math.max(start, extentStart);
  }
  return { start: toDateInput(new Date(start).toISOString()), end: toDateInput(new Date(end).toISOString()) };
}

function nextMidnight(date) {
  const ms = Date.parse(`${date}T00:00:00Z`);
  if (Number.isNaN(ms)) {
    return null;
  }
  return new Date(ms + DAY_MS).toISOString().replace('.000Z', 'Z');
}

/**
 * A card window (`<input type="date">` values) as a `FilterSpec.time`.
 *
 * `[)` — start inclusive, end exclusive — with the end pushed to the next
 * midnight, so that picking the same day for both ends means "that whole
 * day" rather than "the instant it began". Returns null when neither end is
 * set, because a window with no bounds is not a filter.
 * @param {{ start?: string, end?: string }} window
 */
export function toTimeFilter(window) {
  const start = window?.start ? `${window.start}T00:00:00Z` : null;
  const end = window?.end ? nextMidnight(window.end) : null;
  if (!start && !end) {
    return null;
  }
  return {
    ...(start ? { start } : {}),
    ...(end ? { end } : {}),
    closed: '[)'
  };
}

/**
 * Is the window inside out? Said in the card rather than sent to the
 * estimator, which would answer "no rows" without saying why.
 * @param {{ start?: string, end?: string }} window
 */
export function windowInverted(window) {
  if (!window?.start || !window?.end) {
    return false;
  }
  return Date.parse(window.start) > Date.parse(window.end);
}
