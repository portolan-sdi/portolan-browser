// Support for the STAC `render` extension on raster (COG) assets.
//
// The portolan-browser renders COGs directly with deck.gl (no tile server), so a
// raster "style" is a colormap + rescale + nodata applied to a band — exactly the
// render extension's fields. `renders` is a map of named render objects, each with a
// `title` and an `assets` list, so it natively supports multiple pickable styles.
//
// We colormap on the CPU in a custom COGLayer `getTileData` (band -> ImageData),
// which is robust and avoids GPU shader wiring. See portolan-cli#521.

/** Built-in colormaps as [t(0..1), [r,g,b]] stops. */
const COLORMAPS = {
  // FTW inference-app confidence ramp (RdYlGn, weighted toward the top like the app).
  rdylgn: [
    [0.0, [215, 25, 28]],
    [0.7, [254, 195, 121]],
    [0.8, [243, 250, 187]],
    [0.9, [207, 236, 176]],
    [1.0, [51, 160, 44]],
  ],
  // FTW field-density ramp: magenta (low) -> green (high).
  ftw_density: [
    [0.0, [255, 0, 238]],
    [1.0, [0, 255, 0]],
  ],
  viridis: [
    [0.0, [68, 1, 84]], [0.25, [59, 82, 139]], [0.5, [33, 145, 140]],
    [0.75, [94, 201, 98]], [1.0, [253, 231, 37]],
  ],
  magma: [
    [0.0, [0, 0, 4]], [0.25, [81, 18, 124]], [0.5, [183, 55, 121]],
    [0.75, [252, 137, 97]], [1.0, [252, 253, 191]],
  ],
  ylgn: [
    [0.0, [255, 255, 229]], [0.5, [120, 198, 121]], [1.0, [0, 104, 55]],
  ],
};

// `COLORMAPS` is an object literal, so a bare `COLORMAPS[name]` also answers
// every `Object.prototype` key. A catalog that names its colormap `toString`
// would hand `buildLut` a function and throw out of layer construction, which
// drops every COG on the item. Read own properties only.
function builtinStops(name) {
  return typeof name === 'string' && Object.hasOwn(COLORMAPS, name) ? COLORMAPS[name] : null;
}

/** Read `renders` from a STAC Item or Collection (top-level per the render extension). */
export function resolveRenders(stac) {
  const renders = stac?.renders || stac?.properties?.renders || {};
  return renders && typeof renders === 'object' ? renders : {};
}

// A colormap is well-formed when every stop is [t:number, [r, g, b, ...]] with a
// color array of at least three channels. Catalog-supplied colormaps are
// untrusted, so a malformed one must fall back to a built-in rather than produce
// NaN channels (which silently clamp to black).
function isValidStops(stops) {
  return Array.isArray(stops) && stops.length > 0 && stops.every(s =>
    Array.isArray(s) && typeof s[0] === 'number' && Array.isArray(s[1]) && s[1].length >= 3
    && s[1].slice(0, 3).every(c => typeof c === 'number'));
}

// --- Discrete colormaps -----------------------------------------------------
//
// Besides the linear stops list above, the render extension carries titiler's
// two discrete colormap forms:
//
//   { "1": [0, 158, 115, 255], "2": [213, 94, 0, 255] }   value -> RGBA
//   [ [[0, 1], [0, 158, 115]], [[1, 2], [213, 94, 0]] ]   interval -> RGBA
//
// Both look up by pixel VALUE, not by the rescaled 0..1 position a ramp uses. A
// value with no entry draws transparent, exactly like nodata. An interval
// matches when `min <= v < max`; the last interval also matches its own `max`.

// Catalog colormaps are untrusted, so cap the table and reject non-numeric
// channels rather than build NaN colours or an unbounded map.
const MAX_COLORMAP_ENTRIES = 1024;
// Values at or below this bound get a dense array instead of a Map, which keeps
// the per-pixel cost of a class mask (values 0..255) to one array index.
const MAX_DENSE_VALUE = 4095;
// A swatch list longer than this is not a legend any more.
const MAX_LEGEND_ROWS = 32;

/** Normalize `[r, g, b]` or `[r, g, b, a]` to RGBA, or null when malformed. */
function toRgba(color) {
  if (!Array.isArray(color) || color.length < 3 || color.length > 4) {return null;}
  // 8-bit integers, as titiler writes them. `Uint8ClampedArray` would round a
  // 0..1 float silently, so `[0.5, 0.5, 0.5, 1]` would draw an invisible black
  // pixel instead of falling back to the ramp.
  if (!color.every(c => Number.isInteger(c) && c >= 0 && c <= 255)) {return null;}
  return new Uint8ClampedArray([
    color[0], color[1], color[2], color.length === 4 ? color[3] : 255,
  ]);
}

// A colormap key is a pixel value, which titiler writes as a decimal integer.
// Bare `Number()` would also accept `"0x10"`, `" 1 "`, and `"1e3"`, and would
// collide `"1"` with `"1.0"` on one dense-table slot. Match the exact form.
const DECIMAL_INT = /^-?\d+$/;

/** Parse the `{ "<value>": [r, g, b(, a)] }` form into [value, RGBA] pairs. */
function parseDiscreteEntries(colormap) {
  if (!colormap || typeof colormap !== 'object' || Array.isArray(colormap)) {return null;}
  const keys = Object.keys(colormap);
  if (keys.length === 0 || keys.length > MAX_COLORMAP_ENTRIES) {return null;}
  const entries = [];
  for (const key of keys) {
    const rgba = toRgba(colormap[key]);
    if (!DECIMAL_INT.test(key) || !Number.isSafeInteger(Number(key)) || !rgba) {return null;}
    entries.push([Number(key), rgba]);
  }
  return entries;
}

/**
 * Parse the `[[[min, max], [r, g, b(, a)]], ...]` form into intervals, sorted by
 * `min`. Returns null unless the intervals are a disjoint partition.
 *
 * Sorting is what makes the lookup safe as well as correct. A per-pixel linear
 * scan of the 1024 intervals the cap allows costs 2.3s for one 1024x1024 tile
 * on the main thread; a binary search over sorted intervals costs 10 comparisons
 * per pixel whatever the entry count. Sorting also decouples the "last interval
 * also matches its own max" rule from declaration order, so a list written
 * high-to-low no longer drops the top value of the raster.
 *
 * Overlapping intervals are rejected rather than resolved. rio-tiler paints the
 * last matching interval and this code cannot binary-search that, so a guess
 * either way would draw a different map from the tile server for the same
 * catalog. A malformed colormap falls back to the ramp, as everywhere else.
 */
function parseIntervalEntries(colormap) {
  if (!Array.isArray(colormap) || colormap.length === 0
    || colormap.length > MAX_COLORMAP_ENTRIES) {return null;}
  const intervals = [];
  for (const entry of colormap) {
    if (!Array.isArray(entry) || entry.length !== 2) {return null;}
    const [range, color] = entry;
    if (!Array.isArray(range) || range.length !== 2) {return null;}
    if (!range.every(Number.isFinite)) {return null;}
    // A reversed range matches no value at all, so it would punch a silent
    // transparent hole in the raster.
    if (range[0] >= range[1]) {return null;}
    const rgba = toRgba(color);
    if (!rgba) {return null;}
    intervals.push({ min: range[0], max: range[1], rgba });
  }
  intervals.sort((a, b) => a.min - b.min);
  if (intervals.some((iv, i) => i > 0 && intervals[i - 1].max > iv.min)) {return null;}
  return intervals;
}

/**
 * Build a `value -> RGBA` sampler for a discrete or interval colormap. Returns
 * null when the colormap is neither, so the caller falls back to the ramp path.
 * The sampler returns null for a value the colormap does not cover.
 */
function buildValueSampler(colormap) {
  const discrete = parseDiscreteEntries(colormap);
  if (discrete) {
    const dense = discrete.every(([v]) => Number.isInteger(v) && v >= 0 && v <= MAX_DENSE_VALUE);
    if (dense) {
      const table = new Array(Math.max(...discrete.map(([v]) => v)) + 1).fill(null);
      for (const [value, rgba] of discrete) {table[value] = rgba;}
      return v => table[v] || null;
    }
    const map = new Map(discrete);
    return v => map.get(v) || null;
  }
  const intervals = parseIntervalEntries(colormap);
  if (!intervals) {return null;}
  // `parseIntervalEntries` sorts and proves the intervals disjoint, so the last
  // interval whose `min` is at or below the value is the only one that can hold
  // it. Binary search for that interval, then confirm the upper bound.
  const last = intervals.length - 1;
  return (v) => {
    let lo = 0, hi = last, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (intervals[mid].min <= v) {found = mid; lo = mid + 1;}
      else {hi = mid - 1;}
    }
    if (found < 0) {return null;}
    const { max, rgba } = intervals[found];
    return (v < max || (found === last && v === max)) ? rgba : null;
  };
}

/** Build a 256x RGBA lookup table (Uint8ClampedArray) from a render definition. */
function buildLut(render) {
  let stops = builtinStops(render.colormap_name);
  // Allow an explicit linear-gradient colormap: [[t,[r,g,b(,a)]], ...]
  if (!stops && isValidStops(render.colormap)) {
    stops = render.colormap;
  }
  if (!stops) {stops = COLORMAPS.viridis;}

  const lut = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { lo = stops[s]; hi = stops[s + 1]; break; }
    }
    const span = (hi[0] - lo[0]) || 1;
    const f = (t - lo[0]) / span;
    lut[i * 4] = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * f);
    lut[i * 4 + 1] = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * f);
    lut[i * 4 + 2] = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * f);
    lut[i * 4 + 3] = 255;
  }
  return lut;
}

/**
 * Build COGLayer `getTileData`/`renderTile` callbacks that colormap a single band
 * on the CPU into an ImageData, per a STAC render definition.
 */
// The CPU colormap loop runs on the main thread (only tile *decode* is offloaded
// to the decoder worker), so cap the per-tile pixel budget. Normal COG internal
// tiles are 256–1024px square; anything past ~2048² (or an untiled/striped COG
// returning a giant block) would freeze the UI or OOM the tab, so we skip it
// (renders transparent) rather than trust the tile dimensions from the file.
const MAX_TILE_PIXELS = 2048 * 2048;
// A render's nodata list is untrusted; a real one has a handful of sentinels.
// Cap it so a hostile/garbage array can't build a huge Set.
const MAX_NODATA_VALUES = 256;

export function makeRenderTileLoader(render) {
  // A discrete or interval colormap colours by pixel value, so it bypasses the
  // rescaled ramp entirely. `colormap_name` still wins, as it always did.
  const sampler = builtinStops(render.colormap_name) ? null : buildValueSampler(render.colormap);
  const lut = sampler ? null : buildLut(render);
  const [min, max] = (render.rescale && render.rescale[0]) || [0, 1];
  const span = (max - min) || 1;
  const band = ((render.bidx && render.bidx[0]) || 1) - 1; // 1-based -> 0-based
  // nodata may be a single value or an array (e.g. a display asset that should
  // drop both "empty" (0) and its physical no-data sentinel).
  const nodataSet = new Set(
    (Array.isArray(render.nodata) ? render.nodata : [render.nodata])
      .filter(v => v != null)
      .slice(0, MAX_NODATA_VALUES));

  // Chosen once, outside the per-pixel loop. A value the colormap does not
  // cover leaves alpha at 0, which is the same "draw nothing" the nodata list
  // gives — the only sane result for a class mask with an unlabelled value.
  const writePixel = sampler
    ? (v, out, o) => {
      const c = sampler(v);
      if (!c) {return;}
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = c[3];
    }
    : (v, out, o) => {
      let t = (v - min) / span;
      if (t < 0) {t = 0;}
      else if (t > 1) {t = 1;}
      const idx = (t * 255 + 0.5 | 0) * 4;
      out[o] = lut[idx];
      out[o + 1] = lut[idx + 1];
      out[o + 2] = lut[idx + 2];
      out[o + 3] = lut[idx + 3];
    };

  // deck.gl-geotiff 0.7 COGLayer callbacks. The default GPU pipeline only supports
  // unsigned-integer COGs, so for float (and to apply a colormap) we read the tile
  // ourselves and CPU-colormap a single band into an ImageData, returned via the
  // RenderTileResult `image` field (which accepts any TextureSource).
  const getTileData = async (image, { x, y, signal }) => {
    const tile = await image.fetchTile(x, y, { boundless: false, signal });
    const arr = tile.array;
    const { data, width: w, height: h } = arr;
    if (arr.layout === 'band-separate') {
      throw new Error('band-separate COGs are not supported by the render colormap loader');
    }
    const npix = w * h;
    // Guard against degenerate or pathologically large tiles before allocating
    // or looping (see MAX_TILE_PIXELS) — render nothing rather than freeze.
    if (!(w > 0) || !(h > 0) || npix > MAX_TILE_PIXELS) {
      if (npix > MAX_TILE_PIXELS) {
        console.warn(`COG tile ${w}x${h} exceeds the colormap budget; skipping`);
      }
      return null;
    }
    const stride = Math.max(1, Math.round(data.length / npix)); // samples per pixel (interleaved)
    const out = new Uint8ClampedArray(npix * 4);
    for (let i = 0; i < npix; i++) {
      const v = data[i * stride + band];
      if (nodataSet.has(v) || Number.isNaN(v)) { continue; } // alpha stays 0
      writePixel(v, out, i * 4);
    }
    return { colorImage: new ImageData(out, w, h), width: w, height: h, byteLength: out.byteLength };
  };

  const renderTile = (data) => (data ? { image: data.colorImage } : null);
  return { getTileData, renderTile };
}

// --- Classification-derived renders -----------------------------------------
//
// A categorical COG usually names its own colours. The classification extension
// puts a `color_hint` next to the name of every class, on the band the mask
// stores. Because that names the class as well as colouring it, a mask drawn
// from hints also legends itself, and it needs no `renders` entry on the item.
// The browser therefore reads the hints first and treats `renders[].colormap`
// as the fallback for an asset that carries none.

// The classification extension writes `color_hint` as 6 hex digits, RRGGBB,
// with no leading "#".
const COLOR_HINT = /^[0-9a-fA-F]{6}$/;
// A class that means "nothing here". Painting it opaque hides the basemap under
// every empty pixel, which no label mask wants.
const TRANSPARENT_CLASS_NAMES = new Set(['background', 'nodata', 'no_data', 'no-data']);

/** The band a single-band render reads. STAC 1.0 assets name it `raster:bands`. */
function firstBand(asset) {
  // `bands` is checked for length, not truth: an asset that writes `"bands": []`
  // beside a populated `raster:bands` would otherwise lose its classes.
  const bands = asset?.bands?.length ? asset.bands : (asset?.['raster:bands'] || []);
  return bands[0] || {};
}

/** Classification classes on the asset's first band, or on the asset itself. */
export function classificationClasses(asset) {
  const classes = firstBand(asset)['classification:classes']
    || asset?.['classification:classes'];
  return Array.isArray(classes) ? classes.slice(0, MAX_COLORMAP_ENTRIES) : [];
}

function hintToRgb(hint) {
  if (typeof hint !== 'string' || !COLOR_HINT.test(hint)) {return null;}
  return [
    parseInt(hint.slice(0, 2), 16),
    parseInt(hint.slice(2, 4), 16),
    parseInt(hint.slice(4, 6), 16),
  ];
}

function isTransparentClass(cls, bandNodata) {
  if (TRANSPARENT_CLASS_NAMES.has(String(cls.name || '').toLowerCase())) {return true;}
  return bandNodata != null && cls.value === bandNodata;
}

/**
 * Synthesize a discrete render from an asset's `classification:classes` colour
 * hints. Background, nodata, and the band's own nodata value draw transparent.
 *
 * Every class must resolve, to a colour or to transparent. One class that does
 * not returns null for the whole asset, and the caller falls back to a render.
 * The common mistake is a hint written as `#RRGGBB`, which the extension does
 * not allow. Skipping only that class draws a mask full of transparent holes,
 * and discards the render that could have coloured it.
 */
export function renderFromClassification(asset) {
  const classes = classificationClasses(asset);
  const bandNodata = firstBand(asset).nodata;
  const colormap = {};
  const nodata = [];
  for (const cls of classes) {
    if (!cls || typeof cls.value !== 'number') {return null;}
    // Tested before the hint, so a `background` class needs no hint to be read.
    if (isTransparentClass(cls, bandNodata)) {nodata.push(cls.value); continue;}
    const rgb = hintToRgb(cls.color_hint);
    if (!rgb) {return null;}
    colormap[String(cls.value)] = [...rgb, 255];
  }
  if (Object.keys(colormap).length === 0) {return null;}
  if (bandNodata != null && !nodata.includes(bandNodata)) {nodata.push(bandNodata);}
  return { colormap, nodata, bidx: [1] };
}

// A class name comes from the catalog, at whatever length the catalog chose. A
// row has to stay a row, so cut it here as well as clipping it in the CSS.
const MAX_LEGEND_LABEL = 64;

function legendLabel(name) {
  return String(name ?? '').slice(0, MAX_LEGEND_LABEL);
}

function cssColor(rgba) {
  const [r, g, b, a] = rgba;
  return a >= 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(2)})`;
}

/**
 * Legend rows, `[{ color, label }]`, for a render that colours by value. Class
 * names label the rows where the caller passes the asset's classification
 * classes. A continuous ramp gets no rows: a swatch list cannot describe one.
 *
 * The `colormap_name` test repeats the one `makeRenderTileLoader` makes. Keep
 * the two in step, or the legend will describe a different colouring from the
 * one the pixels take.
 */
export function discreteLegend(render, classes = []) {
  if (!render || builtinStops(render.colormap_name)) {return [];}
  const names = new Map((Array.isArray(classes) ? classes : [])
    .filter(c => c && typeof c.value === 'number')
    .map(c => [c.value, c.name]));
  // The loader drops a nodata value before it reaches the colormap, so a swatch
  // for one would advertise a colour that never lands on the map.
  const nodata = new Set((Array.isArray(render.nodata) ? render.nodata : [render.nodata])
    .filter(v => v != null));
  const discrete = parseDiscreteEntries(render.colormap);
  if (discrete) {
    return discrete
      .filter(([value, rgba]) => rgba[3] > 0 && !nodata.has(value))
      .sort((a, b) => a[0] - b[0])
      .slice(0, MAX_LEGEND_ROWS)
      .map(([value, rgba]) => ({
        color: cssColor(rgba),
        label: legendLabel(names.has(value) ? names.get(value) : value),
      }));
  }
  const intervals = parseIntervalEntries(render.colormap);
  if (!intervals) {return [];}
  return intervals
    .filter(iv => iv.rgba[3] > 0)
    .slice(0, MAX_LEGEND_ROWS)
    .map(iv => ({ color: cssColor(iv.rgba), label: `${iv.min}-${iv.max}` }));
}
