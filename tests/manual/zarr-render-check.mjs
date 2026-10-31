// Verify Zarr rendering in a real browser, against the live stores.
//
// It drives the running dev server with Playwright, opens each collection of
// the local Zarr test catalog, and reports what the map did: which layers the
// picker lists, whether the deck.gl canvas drew any non-blank pixels, and what
// notice the map showed. The stores are public, so this reads real data over
// the network and is slow by nature.
//
// Start the dev server first, then run it from the repository root:
//
//   pnpm start &
//   node tests/manual/zarr-render-check.mjs
//
// Pass a collection directory name to check one case only:
//
//   node tests/manual/zarr-render-check.mjs goes

import { chromium } from '@playwright/test';

const BASE = process.env.BROWSER_URL || 'http://localhost:8080';
const CATALOG = `${BASE}/test-catalogs/zarr/catalog.json`;

const CASES = [
  {
    name: 'italy',
    title: 'Italy AGEA orthophoto (12-level pyramid, RGBA)',
    path: '/test-catalogs/italy/agea-orthophoto/collection.json',
    expect: 'draws true colour over Italy at every zoom',
  },
  {
    name: 'goes',
    title: 'GOES-18 fire characterisation (virtual Zarr over netCDF)',
    url: 'https://data.source.coop/mmidzik/goes-fdc/goes-18-fdcc/collection.json',
    expect: 'draws at the collection extent; lists 5 variables; Power is the default',
  },
  {
    name: 'ftw',
    title: 'FTW global composites (no overviews)',
    url: 'https://data.source.coop/ftw/global-data/features/zarr/collection.json',
    expect: 'lists the variable and reports a zoom-in notice at the world view',
  },
  {
    name: 'ftw-rendered',
    title: 'FTW global composites, with a render declared',
    path: '/test-catalogs/zarr/ftw-global-rendered/collection.json',
    expect: 'same store as ftw; draws in true colour once past zoom 11',
  },
  {
    name: 'dynamical-native',
    title: 'NOAA GFS analysis (chunked for time series)',
    path: '/test-catalogs/zarr/dynamical-gfs-analysis/collection.json',
    expect: 'refuses with the chunk-shape notice',
  },
  {
    name: 'dynamical-virtual',
    title: 'NOAA GFS analysis, virtual (GRIB codec)',
    path: '/test-catalogs/zarr/dynamical-gfs-analysis-virtual/collection.json',
    expect: 'refuses with the codec notice',
  },
];

const only = process.argv[2];
const cases = only ? CASES.filter(c => c.name === only) : CASES;

// Whether the deck.gl canvas holds anything but one flat colour. A map that
// loaded no raster is a single colour; one that drew a raster is not.
async function canvasDrew(page) {
  return page.evaluate(() => {
    const canvases = [...document.querySelectorAll('canvas')];
    for (const canvas of canvases) {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {continue;}
      const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
      if (!w || !h) {continue;}
      const pixels = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const first = pixels.slice(0, 4).join(',');
      let distinct = 0;
      for (let i = 0; i < pixels.length; i += 4 * 97) {
        if (pixels.slice(i, i + 4).join(',') !== first) {distinct++;}
      }
      if (distinct > 0) {return { drew: true, distinct, size: `${w}x${h}` };}
    }
    return { drew: false };
  });
}

const browser = await chromium.launch();
const results = [];

for (const testCase of cases) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      if (/zarr|icechunk|codec|deck/i.test(text)) {consoleErrors.push(text);}
    }
  });

  const target = testCase.url
    ? `${BASE}/#/external/${testCase.url.replace(/^https?:\/\//, '')}`
    : `${BASE}/#/external/${BASE}${testCase.path}`;

  console.log(`\n=== ${testCase.name}: ${testCase.title}`);
  console.log(`    expect: ${testCase.expect}`);
  console.log(`    url: ${target}`);

  try {
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // The map mounts, resolves the assets, then opens the store. Give the
    // network time: these are real reads from public object stores.
    await page.waitForSelector('.map', { timeout: 60000 });
    await page.waitForTimeout(25000);

    // Open the layer picker and read what it lists. Its popover teleports out
    // of the control, so the list is queried from the document.
    const button = page.locator('.map-layercontrol .layer-btn').first();
    if (await button.count() > 0) {
      await button.click();
      await page.waitForTimeout(1200);
    }
    const layers = await page.evaluate(() => [
      ...document.querySelectorAll('.layercontrol li'),
    ].map(el => el.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean));
    const notice = await page.evaluate(() => {
      const el = document.querySelector('.map-textcontrol');
      return el ? el.textContent.trim() : null;
    });
    const drew = await canvasDrew(page);

    results.push({ name: testCase.name, layers, notice, drew, consoleErrors });
    console.log(`    layers: ${layers.length ? layers.join(' | ') : '(none listed)'}`);
    console.log(`    notice: ${notice || '(none)'}`);
    console.log(`    canvas: ${drew.drew ? `drew content (${drew.distinct} differing samples, ${drew.size})` : 'blank'}`);
    if (consoleErrors.length) {
      console.log(`    console: ${consoleErrors.slice(0, 4).join(' // ')}`);
    }
    await page.screenshot({ path: `/tmp/zarr-${testCase.name}.png`, fullPage: false });
    console.log(`    screenshot: /tmp/zarr-${testCase.name}.png`);
  } catch (err) {
    console.log(`    FAILED: ${String(err.message).slice(0, 200)}`);
    results.push({ name: testCase.name, error: err.message });
  } finally {
    await context.close();
  }
}

await browser.close();
console.log(`\n${JSON.stringify(results, null, 1)}`);
