// Drive the download card's *choices* against real catalogs: which table of
// a multi-asset collection, over which dates, and what the card says about
// the cost of each. The sibling verify-download-widget.mjs drives the whole
// flow once on one collection; this one holds the three decisions that
// changed in the card.
//
// Setup: just this app. Every catalog, parquet file and names index comes
// from Source Cooperative over HTTP range requests.
//
//   npx vite --port 8081 --strictPort      # or whatever is already running
//   node verify-download-card.mjs
//
//   APP_BASE    the app          (default http://localhost:8081)
//   SLOW=1      also estimate the FIRMS archive with no date window at
//               all, which is minutes of range requests
//
// Writes three screenshots, which are the committed evidence for the
// branch:
//
//   verify-download-assets.png   the asset picker on a four-table collection
//   verify-download-firms.png    a time-filtered estimate on the FIRMS archive
//   verify-download-success.png  a finished download's success state
//   verify-download-cancel.png   a cancelled run on a FIRMS year item
//   verify-download-formats.png  the seven output formats and their weights
//
// The three things it proves, in order:
//
//   1. Fields of the World's benchmark collections publish four parquet
//      tables with role `data`. The card offers all four by title, with
//      their row counts, and switching to the 14,506-row chip index really
//      estimates the chip index rather than the 2.6M-row field boundaries.
//   2. The FIRMS mirror's 27 yearly files are downloadable from the
//      browser, and naming a month drops 26 of them before a byte of data
//      is read -- which the "why this estimate" narration states.
//   3. A finished download ends in a success state with the filename, the
//      rows, the bytes and the time it took, not in a progress line that
//      stopped moving.

import { chromium } from '@playwright/test'
import { readFileSync } from 'node:fs'

const APP = process.env.APP_BASE || 'http://localhost:8081'
const DATA = process.env.DATA_BASE || 'https://data.source.coop'
const BENCHMARK = `${DATA}/ftw/benchmark-data/at_2021/collection.json`
const FIRMS = `${DATA}/portolan-mirrors/firms-catalog/detections/collection.json`
const FIRMS_ITEM = `${DATA}/portolan-mirrors/firms-catalog/detections/year=2020/2020.json`
const GEOBOUNDARIES = `${DATA}/portolan-mirrors/geoboundaries-catalog/adm2/collection.json`

const externalPath = url => `${APP}/#/external/${url.replace('://', ':/')}`

const browser = await chromium.launch()
const errors = []
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
page.on('console', message => {
  if (message.type() === 'error') {
    errors.push(message.text())
  }
})
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))

const widget = () => page.locator('.area-download')
const card = () => page.locator('.ad-card')
const log = (label, value) => console.log(label, typeof value === 'string' ? value : JSON.stringify(value, null, 2))
const text = async locator => (await locator.textContent()).replace(/\s+/g, ' ').trim()

const estimateRows = async () => {
  const dl = card().locator('dl.estimate').first()
  await dl.waitFor({ timeout: 180000 })
  return dl.evaluate(node => {
    const out = {}
    const terms = [...node.querySelectorAll('dt')]
    terms.forEach((dt, index) => {
      out[dt.textContent.trim()] = node.querySelectorAll('dd')[index]?.textContent.replace(/\s+/g, ' ').trim()
    })
    return out
  })
}

// Drag a box on the page's own map, which is how an area is picked without
// the geocoder.
const drawBox = async (fromX, fromY, toX, toY) => {
  await page.getByRole('button', { name: 'Draw a box' }).click()
  const box = await page.locator('.map').first().boundingBox()
  await page.mouse.move(box.x + box.width * fromX, box.y + box.height * fromY)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * toX, box.y + box.height * toY, { steps: 12 })
  await page.mouse.up()
}

const openCard = async url => {
  await page.goto(externalPath(url), { waitUntil: 'domcontentloaded' })
  await widget().waitFor({ timeout: 90000 })
  await page.waitForTimeout(3000)
  log('COLLECTION', (await page.locator('h1').first().textContent()).trim())
}

// --- 1. Four parquet tables, one choice ---------------------------------
await openCard(BENCHMARK)
await drawBox(0.45, 0.45, 0.56, 0.56)
await card().waitFor({ timeout: 60000 })

const picker = card().locator('select.ad-select').first()
log('ASSET PICKER', {
  present: await picker.count(),
  options: await picker.locator('option').allTextContents(),
  selected: await picker.inputValue()
})
log('FIELDS ESTIMATE', await estimateRows())

await picker.selectOption('chips')
await page.waitForTimeout(1500)
log('CHIPS ESTIMATE', await estimateRows())
// The picker is what this frame is of, so the card is wound back to the
// top of itself before the shutter.
await card().evaluate(node => { node.scrollTop = 0 })
await page.screenshot({ path: 'verify-download-assets.png', clip: await page.locator('.map').first().boundingBox() })
await card().locator('.ad-why summary').click()
log('CHIPS WHY', await card().locator('.ad-why-list li').allTextContents()
  .then(lines => lines.map(line => line.replace(/\s+/g, ' ').trim())))

// --- 2. 26 years of fires, one month at a time --------------------------
await openCard(FIRMS)
const search = page.locator('.ad-search input[role="combobox"]')
await search.fill('contra costa')
const options = page.locator('.ad-search [role="option"]')
let searched = true
try {
  await options.first().waitFor({ timeout: 60000 })
  log('SEARCH RESULTS', await options.allTextContents())
  await options.first().click()
} catch {
  searched = false
  log('SEARCH RESULTS', 'none -- falling back to a drawn box over California')
  await drawBox(0.2, 0.3, 0.26, 0.36)
}
await card().waitFor({ timeout: 60000 })
log('AREA', await text(page.locator('.ad-area-name')))
log('TIME ROW', {
  enabled: await card().locator('.ad-time input[type=checkbox]').isChecked(),
  from: await card().locator('.ad-date').first().inputValue(),
  to: await card().locator('.ad-date').last().inputValue(),
  presets: await card().locator('.ad-chip').allTextContents(),
  column: await text(card().locator('.ad-time .ad-note'))
})
const why = async () => ({
  stages: (await card().locator('.ad-why-list li').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim()),
  scanned: (await card().locator('.ad-why .ad-scanned').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim())
})

// The default window is the last 30 days of the *declared* extent, and the
// real mirror's collection extent currently runs about two months past its
// newest published parquet file -- so this is also the empty state, which
// is exactly the case it was written for.
log('FIRMS ESTIMATE (default 30-day window)', await estimateRows())
log('FIRMS EMPTY STATE', {
  shown: await card().locator('.ad-empty').count(),
  text: (await card().locator('.ad-empty').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim()),
  formatButtons: await card().locator('.ad-formats').count()
})
await card().locator('.ad-why summary').click()
await page.waitForTimeout(300)
log('FIRMS WHY (default 30-day window)', await why())

// A month that is in the archive: this is the headline comparison, one
// file against 27, measured in the app.
await card().locator('.ad-date').first().fill('2025-08-01')
await card().locator('.ad-date').first().dispatchEvent('change')
await card().locator('.ad-date').last().fill('2025-08-31')
await card().locator('.ad-date').last().dispatchEvent('change')
await page.waitForTimeout(2000)
// Reading one FIRMS year's footer is 580 row groups of metadata over a
// 1 GB file, and the mirror throttles a client that has been hammering it
// all afternoon. A failure here is reported, not fatal: the run goes on to
// the formats and the success state, which do not need it.
let firmsEstimated = true
try {
  log('FIRMS ESTIMATE (August 2025)', await estimateRows())
  log('FIRMS WHY (August 2025)', await why())
  log('FIRMS WARNINGS', (await card().locator('.ad-warning').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim()))
  log('FIRMS FORMAT HINTS', await card().locator('.ad-formats .ad-button').allTextContents())
} catch (error) {
  firmsEstimated = false
  log('FIRMS ESTIMATE (August 2025)', { failed: error.message.split('\n')[0] })
}
// The card is taller here than anywhere else -- a date range, three
// presets and the estimate -- so the tools collapse to their pill for the
// frame, which is what gives the card the lane's full height.
if (firmsEstimated) {
  await page.locator('.ad-collapse').click()
  await card().evaluate(node => { node.scrollTop = 0 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'verify-download-firms.png', clip: await page.locator('.map').first().boundingBox() })
  await page.locator('.ad-pill').click()
}

// The same request with the window turned off, which is the other half of
// the comparison: 27 item fetches and 27 parquet footers over ~20 GB of
// files, minutes of range requests against a live mirror. Measured on
// 2026-11-12 as 27 of 27 files and 10.2 GB to read, against 1 file and
// 962 MB for August 2025 above. Off by default because it is slow enough
// to stall a run; SLOW=1 measures it again.
if (process.env.SLOW) {
  await card().locator('.ad-time input[type=checkbox]').uncheck()
  await page.waitForTimeout(1500)
  try {
    log('FIRMS ESTIMATE (no window)', await estimateRows())
    log('FIRMS WHY (no window)', await why())
  } catch (error) {
    log('FIRMS ESTIMATE (no window)', { failed: error.message.split('\n')[0] })
  }
} else {
  log('FIRMS ESTIMATE (no window)', 'skipped -- set SLOW=1 to measure the 27-file read again')
}

// --- 3. A finished download says so -------------------------------------
await openCard(GEOBOUNDARIES)
await page.locator('.ad-search input[role="combobox"]').fill('liechtenstein')
const places = page.locator('.ad-search [role="option"]')
await places.first().waitFor({ timeout: 90000 })
await places.first().click()
await card().locator('dl.estimate').waitFor({ timeout: 120000 })

// The geocoder resolves the full-resolution outline in the background and
// applies it when it lands, which re-renders the card: a click fired in
// that window can lose its element. Waiting for the upgrade to settle is
// what a user does anyway by reading the estimate first.
await page.waitForTimeout(3000)
const started = page.waitForEvent('download', { timeout: 300000 })
await card().getByRole('button', { name: /^GeoJSON/ }).click()
const download = await started
const path = '/tmp/verify-download-card.geojson'
await download.saveAs(path)
await card().locator('.ad-done').waitFor({ timeout: 60000 })
await page.waitForTimeout(500)
log('SUCCESS STATE', {
  head: await text(card().locator('.ad-done-head')),
  numbers: await card().locator('.ad-done dl').evaluate(node => {
    const out = {}
    const terms = [...node.querySelectorAll('dt')]
    terms.forEach((dt, index) => {
      out[dt.textContent.trim()] = node.querySelectorAll('dd')[index]?.textContent.trim()
    })
    return out
  }),
  again: await card().locator('.ad-done .ad-button').textContent(),
  renderedLinks: await card().locator('a[download]').count(),
  savedBytes: readFileSync(path).byteLength,
  features: JSON.parse(readFileSync(path, 'utf8')).features.length
})
await page.screenshot({ path: 'verify-download-success.png', clip: await page.locator('.map').first().boundingBox() })

// --- 4. A FIRMS year item: pause, resume, cancel ------------------------
// The item is the single-file case: one year's detections, 797 MB, beside
// two aggregates of itself -- so it is both the item-level flow and a
// second multi-asset picker. A download of it is long enough to stop
// halfway, which is the only way to see pause and cancel work.
await openCard(FIRMS_ITEM)
await drawBox(0.42, 0.42, 0.48, 0.48)
await card().waitFor({ timeout: 60000 })
log('ITEM ASSET PICKER', {
  options: await card().locator('select.ad-select').first().locator('option').allTextContents(),
  selected: await card().locator('select.ad-select').first().inputValue()
})
log('ITEM TIME ROW', {
  // One year of data is the dataset, not a slice of a bigger one, so the
  // window is offered and not imposed.
  present: await card().locator('.ad-time').count(),
  enabled: await card().locator('.ad-time input[type=checkbox]').isChecked()
})
log('ITEM ESTIMATE', await estimateRows())

await card().getByRole('button', { name: /^GeoParquet/ }).click()
await card().locator('.ad-run').waitFor({ timeout: 60000 })
await page.waitForTimeout(6000)
const runningText = await text(card().locator('.ad-run .ad-status'))
await card().getByRole('button', { name: 'Pause' }).click()
await page.waitForTimeout(2500)
const pausedText = await text(card().locator('.ad-run .ad-status'))
await page.waitForTimeout(2500)
log('PAUSE', {
  progressWhileRunning: runningText,
  atPause: pausedText,
  stillTheSameTwoSecondsLater: (await text(card().locator('.ad-run .ad-status'))) === pausedText,
  resumeOffered: await card().getByRole('button', { name: 'Resume' }).count()
})
await card().getByRole('button', { name: 'Resume' }).click()
await page.waitForTimeout(4000)
log('RESUME', {
  moving: (await text(card().locator('.ad-run .ad-status'))) !== pausedText,
  progress: await text(card().locator('.ad-run .ad-status'))
})

const downloadsBefore = []
page.on('download', entry => downloadsBefore.push(entry.suggestedFilename()))
await card().getByRole('button', { name: 'Cancel' }).click()
await card().locator('.ad-outcome').waitFor({ timeout: 60000 })
await page.waitForTimeout(1000)
await page.screenshot({ path: 'verify-download-cancel.png', clip: await page.locator('.map').first().boundingBox() })
log('CANCEL', {
  outcome: await text(card().locator('.ad-outcome')),
  filesSaved: downloadsBefore,
  formatsBackOnOffer: await card().locator('.ad-formats').count()
})

// --- 5. Seven formats, two of which have to fetch a writer first -------
// Back on a small collection, because this is about the formats and not
// about the bytes: open "More formats", read what each one says it will
// cost, then take the one that costs the most to offer (GeoPackage's
// sql.js wasm) all the way to a file on disk.
await openCard(GEOBOUNDARIES)
await page.locator('.ad-search input[role="combobox"]').fill('liechtenstein')
await page.locator('.ad-search [role="option"]').first().waitFor({ timeout: 90000 })
await page.locator('.ad-search [role="option"]').first().click()
await card().locator('dl.estimate').first().waitFor({ timeout: 120000 })
await page.waitForTimeout(3000)
log('PRIMARY FORMATS', await card().locator('.ad-formats .ad-button').allTextContents())
await card().getByRole('button', { name: 'More formats' }).click()
log('MORE FORMATS', await card().locator('.ad-formats-more .ad-button').allTextContents())
log('FORMAT TITLES', await card().locator('.ad-formats-more .ad-button')
  .evaluateAll(nodes => nodes.map(node => node.title)))
await page.screenshot({ path: 'verify-download-formats.png', clip: await page.locator('.map').first().boundingBox() })

const gpkgStarted = page.waitForEvent('download', { timeout: 300000 })
await card().getByRole('button', { name: /^GeoPackage/ }).click()
let loadingSeen = ''
try {
  await card().locator('.ad-run .ad-status', { hasText: /writer/ }).waitFor({ timeout: 10000 })
  loadingSeen = await text(card().locator('.ad-run .ad-status'))
} catch {
  loadingSeen = '(not seen -- loaded faster than the first poll)'
}
const gpkg = await gpkgStarted
await gpkg.saveAs('/tmp/verify-download-card.gpkg')
await card().locator('.ad-done').waitFor({ timeout: 120000 })
log('GEOPACKAGE', {
  whileLoadingThePlugin: loadingSeen,
  outcome: (await card().locator('.ad-done').innerText()).replace(/\s+/g, ' ').trim(),
  bytesOnDisk: readFileSync('/tmp/verify-download-card.gpkg').byteLength,
  // SQLite's own file header, so this is a GeoPackage and not 320 kB of
  // something that merely has the right name.
  sqliteHeader: readFileSync('/tmp/verify-download-card.gpkg').subarray(0, 15).toString('latin1'),
  weightGoneOnceLoaded: (await card().locator('.ad-formats-more .ad-button').allTextContents()).join(' ').includes('+331')
})

// Shapefile says what it had to change to fit dBase, beside the file it
// changed it in.
await card().locator('.ad-done .ad-button').click()
const shpStarted = page.waitForEvent('download', { timeout: 300000 })
await card().getByRole('button', { name: /^Shapefile/ }).click()
const shp = await shpStarted
await shp.saveAs('/tmp/verify-download-card.shp.zip')
await card().locator('.ad-done').waitFor({ timeout: 120000 })
log('SHAPEFILE', {
  outcome: (await card().locator('.ad-done').innerText()).replace(/\s+/g, ' ').trim(),
  warnings: (await card().locator('.ad-done .ad-warning').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim()),
  bytesOnDisk: readFileSync('/tmp/verify-download-card.shp.zip').byteLength
})

log('SEARCH USED FOR FIRMS', searched ? 'place-name index' : 'drawn box')
console.log('\nCONSOLE ERRORS', JSON.stringify(errors, null, 2))
await browser.close()
