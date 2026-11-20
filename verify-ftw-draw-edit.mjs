// Chris's exact repro, plus the two new area tools, against the LIVE Fields
// of the World 2019 collection -- 54 per-UTM-zone GeoParquet files, 129M
// parcels, 84.4 GiB, hive-partitioned behind a collection-mirror.
//
//   npx vite --port 8081 --strictPort        # or whatever is already running
//   node verify-ftw-draw-edit.mjs
//
//   APP_BASE    the app          (default http://localhost:8081)
//
// What it holds the branch to, in order:
//
//   1. FTW ESTIMATE. The failure this run exists for: the widget appeared
//      and the box drew, but Estimate came back red with "This dataset's
//      files could not be read." Root cause was in @cng/download-core --
//      a collection-mirror row's asset href is relative (`./utm01.parquet`)
//      and was handed to `fetch` unresolved, so in a browser all 54 parts
//      resolved against the *page* (http://localhost:8081/utm01.parquet).
//      Fixed in partitions.js's `resolveMirrorPartUrl`. Proof here is a box
//      over Ethiopia producing real numbers, and every parquet request the
//      page makes landing on data.source.coop under a `zone=NN/` path.
//   2. POLYGON DRAW. Click vertices, close with Enter, get an area whose
//      ring has more than a rectangle's five positions.
//   3. EDIT. Turn on "Edit shape", drag a vertex inward, and watch the
//      estimated row count *fall* -- the proof that the edited geometry is
//      what the estimate (and therefore the download) actually filters on,
//      rather than the shape the user started with.
//
// Writes three committed screenshots: the working FTW estimate, a polygon
// mid-draw, and the edit handles up.

import { chromium } from '@playwright/test'

const APP = process.env.APP_BASE || 'http://localhost:8081'
const DATA = process.env.DATA_BASE || 'https://data.source.coop'
const COLLECTION = `${DATA}/ftw/global-data-2e/vector/2019/collection.json`

const externalPath = url => `${APP}/#/external/${url.replace('://', ':/')}`
const log = (label, value) => console.log(label, typeof value === 'string' ? value : JSON.stringify(value, null, 2))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
const parquetRequests = []
page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()) } })
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
page.on('request', r => {
  if (/\.parquet(\?|$)/.test(r.url())) { parquetRequests.push(r.url()) }
})

const widget = () => page.locator('.area-download')
const card = () => page.locator('.ad-card')
const text = async l => (await l.textContent()).replace(/\s+/g, ' ').trim()

const estimateRows = async () => {
  const dl = card().locator('dl.estimate').first()
  await dl.waitFor({ timeout: 180000 })
  return dl.evaluate(node => {
    const out = {}
    ;[...node.querySelectorAll('dt')].forEach((dt, i) => {
      out[dt.textContent.trim()] = node.querySelectorAll('dd')[i]?.textContent.trim()
    })
    return out
  })
}
// Where are the edit tool's handles on screen?
//
// Nothing in the page exposes the MapLibre map (the map host is a Vue
// `provide`, not a global), and the handles are WebGL-rendered circles, not
// DOM nodes -- so there is no selector to click and no `map.project()` to
// call. They do have a very particular look, though: a white disc with a
// 2px #e8731a ring, radius 6, which nothing else on the map draws. So this
// screenshots the map, hands the PNG back into the page to be read through
// a 2D canvas (the WebGL context itself is created with
// `preserveDrawingBuffer: false`, so it cannot be read directly), and
// returns the centre of every white disc that has orange on all four sides
// at ring distance.
//
// Vertices (radius 6) and midpoints (radius 4) both match; the larger ones
// are the draggable corners, so they come back first.
// A viewport screenshot, not an element one: Playwright scrolls an element
// into view before shooting it and clips it to what is visible, so an
// element screenshot's pixel coordinates are not the page coordinates
// `page.mouse` takes. The map element here starts at y = -9.45, and an
// earlier version of this that corrected by the element's bounding box
// missed every 6px handle by exactly that offset. A viewport shot is 1:1
// with the mouse.
const findHandles = async () => {
  const shot = (await page.screenshot()).toString('base64')
  return page.evaluate(async b64 => {
    const image = new Image()
    image.src = `data:image/png;base64,${b64}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
    const at = (x, y) => {
      const i = (y * width + x) * 4
      return [data[i], data[i + 1], data[i + 2]]
    }
    const isWhite = ([r, g, b]) => r > 236 && g > 236 && b > 236
    // #e8731a with generous tolerance: the ring is antialiased and sits
    // over whatever the basemap paints underneath it.
    const isOrange = ([r, g, b]) => r > 180 && g > 80 && g < 170 && b < 90
    // How far out, in one direction, before orange is reached? `null` if
    // the scan runs past MAX first.
    //
    // Pixels between the white fill and the solid ring are neither white
    // nor orange -- MapLibre antialiases that boundary, so the blend is
    // something like (240, 200, 150) -- and an earlier version of this
    // that required white all the way out found nothing at all. So the
    // in-between is simply skipped, and it is the symmetry checks below
    // that decide whether this really is the centre of a disc.
    const MAX = 11
    const reach = (x, y, dx, dy) => {
      for (let d = 2; d <= MAX; d++) {
        const px = x + dx * d
        const py = y + dy * d
        if (px < 0 || py < 0 || px >= width || py >= height) { return null }
        if (isOrange(at(px, py))) { return d }
      }
      return null
    }
    const hits = []
    for (let y = MAX; y < height - MAX; y++) {
      for (let x = MAX; x < width - MAX; x++) {
        if (!isWhite(at(x, y))) { continue }
        // Four axes and both diagonals: a disc's ring is equidistant on
        // opposite sides of its centre in every direction, which a white
        // gap lying alongside the outline is not.
        const probes = [
          [reach(x, y, -1, 0), reach(x, y, 1, 0)],
          [reach(x, y, 0, -1), reach(x, y, 0, 1)],
          [reach(x, y, -1, -1), reach(x, y, 1, 1)],
          [reach(x, y, -1, 1), reach(x, y, 1, -1)]
        ]
        if (probes.some(([a, b]) => a === null || b === null || Math.abs(a - b) > 1)) { continue }
        const radius = (probes[0][0] + probes[0][1] + probes[1][0] + probes[1][1]) / 4
        if (radius < 3) { continue }
        if (hits.some(h => Math.abs(h.x - x) <= MAX && Math.abs(h.y - y) <= MAX)) { continue }
        hits.push({ x, y, radius })
      }
    }
    // Somewhere reliably *inside* the ring, to drag a corner towards. The
    // centroid of the outline's own orange pixels: no projection maths, no
    // guess about where `fitBounds` put the shape, and it stays inside for
    // any convex-ish polygon. (It is biased towards whichever part of the
    // outline is not hidden behind the download card, which only makes the
    // drag below shorter, never outward.)
    let ox = 0
    let oy = 0
    let on = 0
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isOrange(at(x, y))) { ox += x; oy += y; on++ }
      }
    }
    // Vertices are the bigger discs; midpoints the smaller ones. Sorting by
    // radius puts the draggable corners first.
    return {
      handles: hits.sort((a, b) => b.radius - a.radius),
      inside: on ? { x: Math.round(ox / on), y: Math.round(oy / on) } : null
    }
  }, shot)
}

// The leading number out of a "~328 rows" style cell, for the shrink proof.
const rowNumber = estimate => {
  const cell = Object.entries(estimate).find(([k]) => /row/i.test(k))?.[1] || ''
  const match = cell.replace(/[, ]/g, '').match(/\d+/)
  return match ? Number(match[0]) : null
}

// --- 1. The FTW collection, and a box over Ethiopia ----------------------
await page.goto(externalPath(COLLECTION), { waitUntil: 'domcontentloaded' })
await widget().waitFor({ timeout: 90000 })
await page.waitForTimeout(4000)
log('COLLECTION', (await page.locator('h1').first().textContent()).trim())
log('TOOL BUTTONS', await page.locator('.ad-tools-row .ad-button').allTextContents())

// Ethiopian farmland, the region Chris drew over. The geocoder is how the
// map gets there: searching flies the page's own map to the country, and
// the box is then drawn inside that view. (Coordinates below are fractions
// of the map element, which is ~1408x555 here, not of the viewport.)
const search = page.locator('.ad-search input[role="combobox"]')
await search.fill('ethiopia')
const options = page.locator('.ad-search [role="option"]')
await options.first().waitFor({ timeout: 120000 })
log('SEARCH RESULTS', await options.allTextContents())
await options.first().click()
await card().waitFor({ timeout: 90000 })
log('FLEW TO', await text(page.locator('.ad-area-name')))
await page.waitForTimeout(3500)

const at = async (fx, fy) => {
  const box = await page.locator('.map').first().boundingBox()
  return [box.x + box.width * fx, box.y + box.height * fy]
}
const drawBox = async (fx1, fy1, fx2, fy2) => {
  await page.getByRole('button', { name: /^Draw a box$/ }).click()
  await page.mouse.move(...(await at(fx1, fy1)))
  await page.mouse.down()
  await page.mouse.move(...(await at(fx2, fy2)), { steps: 12 })
  await page.mouse.up()
}
// A small box inside the Ethiopia view -- Chris's "box over Ethiopia".
await drawBox(0.46, 0.42, 0.54, 0.58)
await card().waitFor({ timeout: 60000 })
log('AREA', await text(page.locator('.ad-area-name')))
log('AREA SUMMARY', await text(page.locator('.ad-area-summary')))

const boxEstimate = await estimateRows()
log('FTW ESTIMATE (the bug: this used to be a red error)', boxEstimate)
await card().locator('.ad-why summary').click()
log('WHY THIS ESTIMATE', (await card().locator('.ad-why-list li').allTextContents())
  .map(l => l.replace(/\s+/g, ' ').trim()))
await card().locator('.ad-why summary').click()

log('PARQUET REQUESTS THE PAGE MADE', {
  total: parquetRequests.length,
  allOnDataHost: parquetRequests.every(u => u.startsWith(DATA)),
  resolvedIntoZoneDirs: parquetRequests.filter(u => /zone=\d+\//.test(u)).length,
  // The bug's signature: anything fetched off the app's own origin.
  wronglyResolvedAgainstThePage: parquetRequests.filter(u => u.startsWith(APP)),
  sample: [...new Set(parquetRequests)].slice(0, 3)
})
const red = await card().locator('.ad-error, .estimate-error').count()
log('RED ERROR ON THE CARD', red)
await page.screenshot({ path: 'verify-ftw-estimate.png' })

// --- 2. Draw polygon -----------------------------------------------------
await page.locator('.ad-card-head .ad-icon-button').click() // clear the area
await page.waitForTimeout(800)
await page.getByRole('button', { name: /^Draw polygon$/ }).click()
log('POLYGON HINT', await text(page.locator('.ad-note').first()))
const pts = [[0.40, 0.30], [0.60, 0.26], [0.66, 0.62], [0.50, 0.76], [0.36, 0.56]]
for (const [fx, fy] of pts) {
  await page.mouse.click(...(await at(fx, fy)))
  await page.waitForTimeout(220)
}
// Mid-draw: vertices placed, rubber band following the cursor.
await page.mouse.move(...(await at(0.38, 0.40)), { steps: 6 })
await page.waitForTimeout(500)
await page.screenshot({ path: 'verify-polygon-draw.png' })
await page.keyboard.press('Enter')

await card().waitFor({ timeout: 60000 })
const polygonSummary = await text(page.locator('.ad-area-summary'))
log('POLYGON AREA', { name: await text(page.locator('.ad-area-name')), summary: polygonSummary })
const polygonEstimate = await estimateRows()
log('POLYGON ESTIMATE', polygonEstimate)
log('POLYGON HAS MORE THAN A RECTANGLE\'S CORNERS', {
  vertices: polygonSummary.match(/(\d+)\s+filter vertices/)?.[1],
  moreThanFour: Number(polygonSummary.match(/(\d+)\s+filter vertices/)?.[1]) > 4
})

// --- 3. Edit the shape, and watch the estimate follow it -----------------
const beforeRows = rowNumber(polygonEstimate)
await page.getByRole('button', { name: /^Edit shape$/ }).click()
await page.waitForTimeout(1200)
log('EDIT MODE', {
  buttonNowSays: await text(page.getByRole('button', { name: /Done editing/ })),
  hint: await text(page.locator('.ad-edit-hint'))
})
await page.screenshot({ path: 'verify-edit-handles.png' })

// Drag a corner hard inward: a strictly smaller polygon, so a correct
// implementation can only report fewer rows (or the same, if the corner it
// gave up happened to hold none).
const { handles, inside } = await findHandles()
// The radius-6 vertices against the radius-4 midpoints: split at the
// midpoint of the two measured sizes rather than a hardcoded number, since
// the measured radius includes the antialiased ring.
const widest = handles[0]?.radius ?? 0
const corners = handles.filter(h => h.radius > widest - 1.5)
log('EDIT HANDLES FOUND ON THE MAP', {
  // Not all of them: the download card covers the right of the map, and
  // only the handles actually painted can be found this way. One is enough
  // for the proof below.
  visible: handles.length,
  corners: corners.length,
  midpoints: handles.length - corners.length,
  at: handles.map(h => `${h.x},${h.y} r${h.radius}`),
  insideTheRing: inside
})
if (corners.length === 0 || !inside) {
  throw new Error('no edit handles rendered -- the editor is not on the map')
}
// The visible corner furthest from the ring's interior: dragging that one
// inward is the biggest, least ambiguous shrink available, and -- because
// it is an extreme of the shape -- it moves the Area's bbox, which is what
// the row-group pruning that produces the estimate reads.
const far = corners.reduce((best, h) => (
  Math.hypot(h.x - inside.x, h.y - inside.y) > Math.hypot(best.x - inside.x, best.y - inside.y) ? h : best
), corners[0])
log('DRAGGING THE OUTERMOST CORNER INWARD', { from: far, towards: inside })

await page.mouse.move(far.x, far.y)
await page.waitForTimeout(300)
log('CURSOR OVER THE HANDLE', JSON.stringify(
  await page.evaluate(() => document.querySelector('.maplibregl-canvas').style.cursor)
))
await page.mouse.down()
// Most of the way in: a big, unambiguous shrink.
await page.mouse.move(
  inside.x + (far.x - inside.x) * 0.1,
  inside.y + (far.y - inside.y) * 0.1,
  { steps: 25 }
)
await page.mouse.up()
await page.waitForTimeout(3000)

const editedEstimate = await estimateRows()
const afterRows = rowNumber(editedEstimate)
log('AFTER SHRINKING ONE CORNER', {
  areaName: await text(page.locator('.ad-area-name')),
  summary: await text(page.locator('.ad-area-summary')),
  estimate: editedEstimate,
  rowsBefore: beforeRows,
  rowsAfter: afterRows,
  rowCountFellOrHeld: beforeRows !== null && afterRows !== null && afterRows <= beforeRows
})

log('CONSOLE ERRORS', errors)
await browser.close()
