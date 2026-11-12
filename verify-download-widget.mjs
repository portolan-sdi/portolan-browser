// Drive the on-map "Download data" widget end to end against a real Portolan
// catalog and real GeoParquet files: place-name search -> area outlined on
// the page's own map -> estimate -> direct download, in the app, no mocks.
//
// Setup: just this app. The catalog, the parquet files and the geocoder's
// names index all come from Source Cooperative over HTTP range requests, so
// there is no second server to start any more.
//
//   npx vite --port 8081 --strictPort      # or whatever is already running
//   node verify-download-widget.mjs [screenshot.png]
//
//   APP_BASE    the app          (default http://localhost:8081)
//   DATA_BASE   the catalog host (default https://data.source.coop)
//
// Prints what the user sees at each step, writes the downloaded files to
// /tmp, and re-reads the GeoParquet it produced with hyparquet to prove the
// output is a valid, readable file rather than a blob of the right size.
//
// Two things the redesign has to be held to, and this is where they are:
//
//   * The download is a real browser download event. There is no rendered
//     link to click any more: the widget writes straight to disk through the
//     File System Access API where it exists, and otherwise clicks a Blob
//     anchor it creates and throws away. Under automation it takes the
//     second path on purpose (see the widget's `usePicker`), which is what
//     Playwright sees as a `download`.
//   * The area is drawn on the *page's* map. The widget has no map of its
//     own, so selecting an area moves and repaints the one behind the
//     collection's data -- asserted here by hashing a screenshot of the map
//     element before and after. (Reading the WebGL buffer directly, the way
//     tests/manual/zarr-render-check.mjs does for the deck.gl canvas, does
//     not work here: MapLibre creates its context with
//     `preserveDrawingBuffer: false`, so `readPixels` after the frame has
//     been presented comes back all zeroes.)

import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import * as hyparquet from 'hyparquet'
import { compressors } from 'hyparquet-compressors'

const APP = process.env.APP_BASE || 'http://localhost:8081'
const DATA = process.env.DATA_BASE || 'https://data.source.coop'
const COLLECTION = `${DATA}/portolan-mirrors/geoboundaries-catalog/adm2/collection.json`
const ZARR_COLLECTION = `${DATA}/ftw/global-data/features/zarr/collection.json`
const SCREENSHOT = process.argv[2] || 'verify-download-widget.png'

// The app's hash router wants a single-slashed scheme in the external path.
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

// A signature of what the page's map currently shows: a pan, a zoom or a new
// outline layer all change it.
const mapSignature = async () => {
  const shot = await page.locator('.map').first().screenshot()
  return createHash('sha1').update(shot).digest('hex').slice(0, 12)
}

// --- 1. The widget appears, on the map, on a vector GeoParquet collection
await page.goto(externalPath(COLLECTION), { waitUntil: 'domcontentloaded' })
await widget().waitFor({ timeout: 60000 })
await page.waitForTimeout(3000)
log('COLLECTION', (await page.locator('h1').first().textContent()).trim())
log('ON-MAP TOOLS', {
  insideTheMapContainer: await page.locator('.map .map-overlay-widgets .area-download').count(),
  searchBox: await page.locator('.ad-search input[role="combobox"]').count(),
  buttons: await page.locator('.ad-tools-row .ad-button').allTextContents(),
  hint: await text(page.locator('.ad-tools-head')),
  note: await text(page.locator('.ad-note').first())
})

const before = await mapSignature()

// --- 2. Search for an area, in the box on the map ------------------------
const search = page.locator('.ad-search input[role="combobox"]')
await search.fill('liechtenstein')
const options = page.locator('.ad-search [role="option"]')
await options.first().waitFor({ timeout: 90000 })
log('SEARCH RESULTS', await options.allTextContents())
await options.first().click()

await card().waitFor({ timeout: 60000 })
log('AREA', await text(page.locator('.ad-area-name')))
log('AREA SUMMARY', await text(page.locator('.ad-area-summary')))

// --- 3. The estimate runs by itself, no button to find -------------------
await card().locator('dl.estimate').first().waitFor({ timeout: 120000 })
log('ESTIMATE', await card().locator('dl.estimate').first().evaluate(dl => {
  const out = {}
  const terms = [...dl.querySelectorAll('dt')]
  terms.forEach((dt, index) => {
    out[dt.textContent.trim()] = dl.querySelectorAll('dd')[index]?.textContent.trim()
  })
  return out
}))
// How the estimate got there -- the pruning cascade, stage by stage --
// lives behind "why this estimate" now.
await card().locator('.ad-why summary').click()
log('WHY THIS ESTIMATE', {
  stages: (await card().locator('.ad-why-list li').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim()),
  scanned: (await card().locator('.ad-why .ad-scanned').allTextContents()).map(line => line.replace(/\s+/g, ' ').trim())
})
log('FORMAT BUTTONS', await card().locator('.ad-formats .ad-button').allTextContents())

await page.waitForTimeout(2500)
const after = await mapSignature()
log('THE PAGE MAP MOVED TO THE AREA', { before, after, changed: before !== after })

// --- 4. The generated request + SQL -------------------------------------
await page.getByRole('button', { name: /Show this download as code/ }).click()
await card().locator('.request-code').waitFor({ timeout: 15000 })
const code = await card().locator('.request-code').evaluate(node => (
  [...node.querySelectorAll('h4')].map((heading, index) => ({
    label: heading.textContent.trim(),
    code: node.querySelectorAll('.codebox')[index]?.innerText
  }))
))
for (const entry of code) {
  console.log(`\n--- ${entry.label} ---\n${entry.code}`)
}
await page.getByRole('button', { name: /Hide the request/ }).click()

// --- 5. Download, for real, with nothing to click afterwards -------------
async function downloadAs(format, filename) {
  // The format buttons are hidden while a finished download is on screen,
  // so a second one starts by dismissing the first's success state -- which
  // is also the "Download another" button working.
  if (await card().locator('.ad-done').count() > 0) {
    await card().locator('.ad-done .ad-button').click()
  }
  const started = page.waitForEvent('download', { timeout: 300000 })
  // Each button carries that format's own size hint, so the name is a
  // prefix rather than the whole label.
  await card().getByRole('button', { name: new RegExp(`^${format}`) }).click()
  const download = await started
  const path = `/tmp/${filename}`
  await download.saveAs(path)
  await card().locator('.ad-done').waitFor({ timeout: 60000 })
  log(`${format} SAVED`, {
    path,
    suggestedFilename: download.suggestedFilename(),
    bytes: readFileSync(path).byteLength,
    renderedLinks: await card().locator('a[download]').count(),
    head: await text(card().locator('.ad-done-head')),
    numbers: await card().locator('.ad-done dl').evaluate(node => {
      const out = {}
      const terms = [...node.querySelectorAll('dt')]
      terms.forEach((dt, index) => {
        out[dt.textContent.trim()] = node.querySelectorAll('dd')[index]?.textContent.trim()
      })
      return out
    })
  })
  return path
}

const geojsonPath = await downloadAs('GeoJSON', 'verify-download.geojson')
const geojson = JSON.parse(readFileSync(geojsonPath, 'utf8'))
log('GEOJSON', {
  type: geojson.type,
  features: geojson.features.length,
  firstProperties: geojson.features[0]?.properties,
  firstGeometryType: geojson.features[0]?.geometry?.type
})

const parquetPath = await downloadAs('GeoParquet', 'verify-download.parquet')
const buffer = readFileSync(parquetPath)
const file = {
  byteLength: buffer.byteLength,
  slice: (start, end) => buffer.buffer.slice(buffer.byteOffset + start, buffer.byteOffset + (end ?? buffer.byteLength))
}
const metadata = await hyparquet.parquetMetadataAsync(file, { geoparquet: false })
const rows = await hyparquet.parquetReadObjects({
  file,
  metadata,
  compressors,
  utf8: false,
  rowStart: 0,
  rowEnd: 2
})
log('GEOPARQUET', {
  rows: Number(metadata.num_rows),
  rowGroups: metadata.row_groups.length,
  columns: metadata.schema.filter(element => !element.num_children).map(element => element.name),
  geo: JSON.parse(metadata.key_value_metadata.find(entry => entry.key === 'geo')?.value || 'null'),
  firstRowKeys: Object.keys(rows[0] || {}),
  geometryIsBinary: rows[0]?.geometry instanceof Uint8Array
})

// The screenshots are the evidence for the branch: the on-map search box,
// the draw and upload buttons, the area outlined over the real data, and the
// download card with a finished download in it -- then the same map with the
// cluster collapsed to its "Download data" pill, which is the discovery
// affordance and cannot be in the same frame as the thing it opens.
await card().evaluate(node => { node.scrollTop = 0 })
await page.screenshot({ path: SCREENSHOT, fullPage: false })
await page.locator('.ad-collapse').click()
await page.locator('.ad-pill').waitFor({ timeout: 5000 })
await page.screenshot({ path: SCREENSHOT.replace(/\.png$/, '-pill.png'), clip: await page.locator('.map').first().boundingBox() })
await page.locator('.ad-pill').click()

// --- 6. The other two ways to pick an area ------------------------------
// Draw: arm the button, then drag on the page's own map -- no Shift needed.
await card().locator('.ad-icon-button').first().click()
await page.getByRole('button', { name: 'Draw a box' }).click()
const mapBox = await page.locator('.map').first().boundingBox()
await page.mouse.move(mapBox.x + mapBox.width * 0.45, mapBox.y + mapBox.height * 0.45)
await page.mouse.down()
await page.mouse.move(mapBox.x + mapBox.width * 0.58, mapBox.y + mapBox.height * 0.58, { steps: 12 })
await page.mouse.up()
await card().locator('dl.estimate').first().waitFor({ timeout: 120000 })
log('DRAWN AREA', await text(page.locator('.ad-area-name')))
log('DRAWN AREA ESTIMATE', await text(card().locator('dl.estimate dd').first()))

// Upload: a GeoJSON area file, through the button beside the search box.
await card().locator('.ad-icon-button').first().click()
const uploaded = '/tmp/verify-download-area.geojson'
writeFileSync(uploaded, JSON.stringify({
  type: 'Feature',
  properties: { name: 'Vaduz box' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[9.50, 47.12], [9.56, 47.12], [9.56, 47.16], [9.50, 47.16], [9.50, 47.12]]]
  }
}))
await page.locator('.ad-file').setInputFiles(uploaded)
await card().locator('dl.estimate').first().waitFor({ timeout: 120000 })
log('UPLOADED AREA', await text(page.locator('.ad-area-name')))
log('UPLOADED AREA ESTIMATE', await text(card().locator('dl.estimate dd').first()))

// --- 7. No widget, and no hint, on a zarr collection --------------------
await page.goto(externalPath(ZARR_COLLECTION), { waitUntil: 'domcontentloaded' })
await page.locator('.map').first().waitFor({ timeout: 60000 })
await page.waitForTimeout(5000)
log('ZARR COLLECTION', (await page.locator('h1').first().textContent()).trim())
log('WIDGET PRESENT ON ZARR', await widget().count())
log('HINT PRESENT ON ZARR', await page.locator('.ad-pill, .ad-tools').count())

console.log('\nCONSOLE ERRORS', JSON.stringify(errors, null, 2))
await browser.close()
