// Drive every collection of the wild Zarr/Icechunk catalog through the real
// browser, and report what the map did with each one.
//
// tests/manual/zarr-render-check.mjs does this for the hand-built fixture
// catalog. This script does it for tests/fixtures/catalogs/zarr-wild, whose 18
// collections are real public stores, and it adds the two things a wild run
// needs that a fixture run does not:
//
//   1. An expectation per case. Each collection's description ends with an
//      "Expected browser outcome", and the `tier` here is that sentence as
//      something a script can check: 'draws', 'notice:<substring>', or
//      'error'. The verdict table at the end says which cases met it.
//   2. Network accounting. A guard is only worth anything if it refuses the
//      store *before* fetching it, so every response from the store's own
//      host is weighed. A guard-tier case fails when one response is over
//      MAX_SINGLE_FETCH or the case total is over MAX_TOTAL_FETCH, however
//      correct its notice looks.
//
// Each case also has a hard timeout, because one unreachable store must not
// hang the run.
//
// Start the dev server and the catalog server first, on free ports, then run
// it from the repository root:
//
//   pnpm exec vite --port 8095 --strictPort &
//   node tests/fixtures/serve-catalogs.mjs --port 8096 &
//   BROWSER_URL=http://localhost:8095 CATALOG_URL=http://localhost:8096 \
//     node tests/manual/zarr-wild-check.mjs
//
// Pass collection directory names to check only those:
//
//   node tests/manual/zarr-wild-check.mjs mur-sst wsf-tracker

import { chromium } from '@playwright/test';

const BASE = process.env.BROWSER_URL || 'http://localhost:8080';
const CATALOGS = process.env.CATALOG_URL || 'http://localhost:8082';
const WILD = `${CATALOGS}/zarr-wild`;

/** The most one response from the store host may carry, for a guard case. */
export const MAX_SINGLE_FETCH = 20 * 1024 * 1024;
/** The most one guard case may fetch from the store host in total. */
export const MAX_TOTAL_FETCH = 100 * 1024 * 1024;

// How long one case may take, all in. A dead store would otherwise hold the
// run for as long as the browser is willing to wait on a socket.
const CASE_TIMEOUT = 150_000;
// How long to keep polling the canvas before calling a case blank.
const DRAW_TIMEOUT = 75_000;

// One entry per collection of tests/fixtures/catalogs/zarr-wild, carrying the
// tier its "Expected browser outcome" states.
//
//   draws             the deck.gl canvas must hold more than one colour
//   notice:<text>     the map must show a notice containing <text>
//   error             the map must show a load error, promptly and visibly
//
// `select` names a layer to switch on in place of the default one, for a store
// whose default variable is not the one the expectation is about. `zoomIn` is
// how many times to click the map's zoom-in button, for a store the
// no-overviews guard holds back at a world view: each click is one zoom level
// about the current centre, which `fit` has already put on the item's extent.
const CASES = [
  // --- must render ----------------------------------------------------------
  { name: 'carbonplan-2d-tavg', tier: 'draws' },
  { name: 'carbonplan-v2-2d-tavg', tier: 'draws' },
  { name: 'carbonplan-3d-tavg-prec', tier: 'draws' },
  { name: 'carbonplan-v1-2d-tavg', tier: 'draws', zoomIn: 3 },
  { name: 'tessera-life-biodiversity', tier: 'draws' },
  { name: 'wsf-tracker', tier: 'draws' },
  { name: 'ftw-predictions-zarr', tier: 'draws' },
  { name: 'eopf-s2-l2a-zarr3', tier: 'draws' },
  { name: 'mur-sst', tier: 'draws', zoomIn: 4 },
  { name: 'ctrees-agb-icechunk', tier: 'draws', zoomIn: 7 },
  { name: 'nasa-rasi-icechunk-virtual', tier: 'draws' },
  // --- guards: the right notice, and no large fetch -------------------------
  { name: 'carbonplan-4d-climate', tier: 'notice:not chunked for map display', guard: true },
  { name: 'tessera-global-rgb', tier: 'notice:cannot transpose', guard: true },
  { name: 'gmgsi-icechunk', tier: 'notice:no spatial reference', guard: true },
  { name: 'cbofs-ssh', tier: 'notice:no spatial reference', guard: true },
  { name: 'cmip6-gfdl-tas', tier: 'notice:not chunked for map display', guard: true },
  { name: 'its-live-velocity', tier: 'notice:not chunked for map display', guard: true },
  { name: 'noaa-gefs-analysis', tier: 'notice:not chunked for map display', guard: true },
  { name: 'nwm-streamflow', tier: 'notice:', guard: true },
  { name: 'tessera-utm30-embeddings', tier: 'notice:', guard: true },
  { name: 'eopf-s2-l2a-v2-band', tier: 'notice:', guard: true },
  // --- negative: must fail cleanly and visibly ------------------------------
  { name: 'era5-arco-no-cors', tier: 'error' },
];

const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
const cases = only.length ? CASES.filter(c => only.includes(c.name)) : CASES;

// The hosts a case may legitimately read its data from, taken from the
// collection's own assets. Everything else a page fetches — the app bundle
// from the dev server, the basemap tiles — is not the store, and counting it
// would make every budget meaningless.
//
// A virtual store is the one case this undercounts: its chunks are byte ranges
// inside files on whatever host the references name, which the asset href does
// not. The RASI repository reads from `nasa-waterinsight.s3.amazonaws.com`
// while its asset names `...s3.us-west-2.amazonaws.com`, so those reads are not
// weighed here. No guard-tier case is a virtual store, so no budget rests on
// it.
async function storeHosts(name) {
  const resp = await fetch(`${WILD}/${name}/collection.json`);
  if (!resp.ok) {throw new Error(`collection.json: HTTP ${resp.status}`);}
  const collection = await resp.json();
  const hosts = new Set();
  for (const asset of Object.values(collection.assets || {})) {
    try {
      hosts.add(new URL(asset.href).host);
    } catch { /* an s3:// href has no host the browser would read */ }
  }
  return hosts;
}

// Whether the deck.gl canvas holds anything but one flat colour. Copied from
// zarr-render-check.mjs, including why it must be that canvas by id: deck.gl
// draws into its own `#deckgl-overlay` canvas stacked over MapLibre's, and
// MapLibre's always shows colourful basemap tiles, so sampling "any canvas"
// reports a draw for a Zarr layer that drew nothing.
async function canvasDrew(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('deckgl-overlay');
    if (!canvas) {
      return { drew: false, canvas: null, reason: 'no #deckgl-overlay canvas on the page' };
    }
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      return { drew: false, canvas: '#deckgl-overlay', reason: 'no WebGL context on it' };
    }
    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
    if (!w || !h) {
      return { drew: false, canvas: '#deckgl-overlay', reason: 'zero-sized drawing buffer' };
    }
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const first = pixels.slice(0, 4).join(',');
    let distinct = 0;
    for (let i = 0; i < pixels.length; i += 4 * 97) {
      if (pixels.slice(i, i + 4).join(',') !== first) {distinct++;}
    }
    return { drew: distinct > 0, distinct, size: `${w}x${h}`, canvas: '#deckgl-overlay' };
  });
}

function readNotice(page) {
  return page.evaluate(() => {
    const el = document.querySelector('.map-textcontrol');
    return el ? el.textContent.trim().replace(/\s+/g, ' ') : null;
  });
}

function readLayers(page) {
  return page.evaluate(() => [
    ...document.querySelectorAll('.layercontrol li'),
  ].map(el => el.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean));
}

function mb(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function openLayerControl(page) {
  const button = page.locator('.map-layercontrol .layer-btn').first();
  if (await button.count() === 0) {return false;}
  // The popover may already be open from an earlier read; clicking then shuts
  // it, so only open it when the list is not on the page.
  const open = await page.evaluate(() => Boolean(document.querySelector('.layercontrol li')));
  if (!open) {
    await button.click();
    await page.waitForTimeout(1000);
  }
  return true;
}

// Run one case: open its collection, wait for the map to settle, and report
// what the layer picker, the notice and the canvas say.
async function runCase(browser, testCase) {
  const hosts = await storeHosts(testCase.name);
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const messages = [];
  page.on('console', msg => {
    if (msg.type() !== 'error' && msg.type() !== 'warning') {return;}
    const text = msg.text();
    if (/zarr|icechunk|codec|deck|CORS|Failed to fetch/i.test(text)) {messages.push(text);}
  });
  page.on('pageerror', err => messages.push(`pageerror: ${err.message}`));

  // Network accounting. `requestfinished` is the event that has the transfer
  // sizes: a `response` handler only has the headers, and a store that omits
  // content-length (every chunked response does) would then weigh nothing.
  const net = { total: 0, largest: 0, largestUrl: null, requests: 0, failed: [] };
  const sizing = [];
  page.on('requestfinished', request => {
    let host;
    try { host = new URL(request.url()).host; } catch { return; }
    if (!hosts.has(host)) {return;}
    net.requests++;
    sizing.push(request.sizes()
      .then(sizes => {
        const bytes = (sizes.responseBodySize || 0) + (sizes.responseHeadersSize || 0);
        net.total += bytes;
        if (bytes > net.largest) {
          net.largest = bytes;
          net.largestUrl = request.url();
        }
      })
      .catch(() => { /* the request went away before its sizes were readable */ }));
  });
  page.on('requestfailed', request => {
    let host;
    try { host = new URL(request.url()).host; } catch { return; }
    if (hosts.has(host) && net.failed.length < 4) {
      net.failed.push(`${request.failure()?.errorText ?? 'failed'} ${request.url().slice(0, 90)}`);
    }
  });

  const target = `${BASE}/#/external/${WILD}/${testCase.name}/collection.json`;
  try {
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('.map', { timeout: 60_000 });

    if (testCase.select) {
      await openLayerControl(page);
      const entry = page.locator('.layercontrol li', { hasText: testCase.select }).first();
      if (await entry.count() > 0) {
        await entry.locator('input[type="checkbox"], input[type="radio"]').first().click();
      }
    }
    if (testCase.zoomIn) {
      // The Map instance is not reachable from the page — MapLibre leaves no
      // back-reference on its container — so the view is moved the way a user
      // moves it, through the NavigationControl. Each click is one zoom level
      // about the current centre, and `StacMapLayer.fit` has already centred
      // the item's extent, so this zooms into the middle of the data.
      await page.waitForTimeout(6000);
      const zoomIn = page.locator('.maplibregl-ctrl-zoom-in').first();
      for (let i = 0; i < testCase.zoomIn; i++) {
        await zoomIn.click();
        await page.waitForTimeout(900);
      }
    }

    // Wait for the map to say something, either way: pixels on the deck.gl
    // canvas or a notice. Polling beats a fixed wait because a store that
    // refuses on metadata alone answers in a second and one that reads chunks
    // over a slow link takes a minute.
    const deadline = Date.now() + DRAW_TIMEOUT;
    let drew = await canvasDrew(page);
    let notice = await readNotice(page);
    while (Date.now() < deadline && !drew.drew && !notice) {
      await page.waitForTimeout(2500);
      drew = await canvasDrew(page);
      notice = await readNotice(page);
    }
    // A notice can appear before the tiles do, and a store that draws while
    // holding a zoom notice is still drawing. Give the canvas the rest of the
    // budget when only the notice arrived.
    if (!drew.drew) {
      const extra = Math.min(deadline - Date.now(), 25_000);
      if (extra > 0) {
        await page.waitForTimeout(extra);
        drew = await canvasDrew(page);
        notice = await readNotice(page) ?? notice;
      }
    }

    await openLayerControl(page);
    const layers = await readLayers(page);
    await page.screenshot({ path: `/tmp/zarr-wild-${testCase.name}.png` });
    await Promise.all(sizing);

    return { layers, notice, drew, net, messages, target };
  } finally {
    await context.close();
  }
}

// Whether a case met its tier, and why not when it did not.
function verdict(testCase, result) {
  if (result.error) {return { pass: false, why: `run failed: ${result.error}` };}
  const { tier } = testCase;
  const notice = result.notice || '';

  if (testCase.guard) {
    if (result.net.largest > MAX_SINGLE_FETCH) {
      return { pass: false, why: `one fetch of ${mb(result.net.largest)} exceeds ${mb(MAX_SINGLE_FETCH)}` };
    }
    if (result.net.total > MAX_TOTAL_FETCH) {
      return { pass: false, why: `total ${mb(result.net.total)} exceeds ${mb(MAX_TOTAL_FETCH)}` };
    }
  }

  if (tier === 'draws') {
    return result.drew.drew
      ? { pass: true, why: `drew (${result.drew.distinct} differing samples)` }
      : { pass: false, why: `blank canvas${result.drew.reason ? `: ${result.drew.reason}` : ''}${notice ? ` (notice: ${notice.slice(0, 70)})` : ''}` };
  }
  if (tier === 'error') {
    // A load error must be visible on the map, not only in the console. The
    // notice is the only thing the user sees.
    return notice
      ? { pass: true, why: 'notice shown' }
      : { pass: false, why: 'no notice: the failure is console-only' };
  }
  if (tier.startsWith('notice:')) {
    const want = tier.slice('notice:'.length);
    if (!notice) {return { pass: false, why: 'no notice shown' };}
    if (want && !notice.toLowerCase().includes(want.toLowerCase())) {
      return { pass: false, why: `notice does not mention "${want}"` };
    }
    return { pass: true, why: 'notice matches' };
  }
  return { pass: false, why: `unknown tier "${tier}"` };
}

const browser = await chromium.launch();
const results = [];

for (const testCase of cases) {
  console.log(`\n=== ${testCase.name} [${testCase.tier}]${testCase.guard ? ' (guard)' : ''}`);
  let result;
  try {
    result = await Promise.race([
      runCase(browser, testCase),
      new Promise((_, reject) => setTimeout(
        () => reject(new Error(`case timed out after ${CASE_TIMEOUT / 1000}s`)),
        CASE_TIMEOUT,
      )),
    ]);
  } catch (err) {
    result = { error: String(err.message).slice(0, 200), net: { total: 0, largest: 0, requests: 0, failed: [] }, drew: { drew: false }, layers: [], messages: [] };
  }
  const outcome = verdict(testCase, result);
  results.push({ testCase, result, outcome });

  console.log(`    layers: ${result.layers?.length ? result.layers.join(' | ').slice(0, 220) : '(none listed)'}`);
  console.log(`    notice: ${result.notice || '(none)'}`);
  console.log(`    canvas: ${result.drew?.drew ? `drew (${result.drew.distinct} samples, ${result.drew.size})` : `blank${result.drew?.reason ? ` — ${result.drew.reason}` : ''}`}`);
  console.log(`    store:  ${result.net.requests} requests, ${mb(result.net.total)} total, largest ${mb(result.net.largest)}`);
  if (result.net.failed?.length) {console.log(`    failed: ${result.net.failed.join(' // ')}`);}
  if (result.messages?.length) {console.log(`    console: ${result.messages.slice(0, 3).join(' // ').slice(0, 400)}`);}
  console.log(`    VERDICT: ${outcome.pass ? 'PASS' : 'FAIL'} — ${outcome.why}`);
}

await browser.close();

// --- the verdict table -------------------------------------------------------

const pad = (text, width) => String(text).padEnd(width).slice(0, width);
const rows = results.map(({ testCase, result, outcome }) => [
  testCase.name,
  testCase.tier.startsWith('notice:') ? 'notice' : testCase.tier,
  String(result.layers?.length ?? 0),
  (result.notice || '-').slice(0, 44),
  result.drew?.drew ? `drew/${result.drew.distinct}` : 'blank',
  mb(result.net.total),
  outcome.pass ? 'PASS' : 'FAIL',
]);
const widths = [30, 6, 3, 44, 11, 9, 4];
const header = ['case', 'tier', 'lyr', 'notice', 'canvas', 'bytes', 'ok'];
console.log('\n');
console.log(header.map((h, i) => pad(h, widths[i])).join('  '));
console.log(widths.map(w => '-'.repeat(w)).join('  '));
for (const row of rows) {console.log(row.map((c, i) => pad(c, widths[i])).join('  '));}

const drawing = results.filter(r => r.testCase.tier === 'draws' && r.result.drew?.drew).length;
const passed = results.filter(r => r.outcome.pass).length;
console.log(`\n${passed}/${results.length} cases met their expectation; ${drawing} wild stores drew pixels.`);
for (const { testCase, outcome } of results) {
  if (!outcome.pass) {console.log(`  FAIL ${testCase.name}: ${outcome.why}`);}
}
