// Drive the "Download data" widget end to end against a real Portolan
// catalog and a real GeoParquet file: place-name search -> area -> estimate
// -> download, in the app, with no mocks.
//
// Setup (both servers are outside this repo; see
// .github/DOWNLOAD_WIDGET_NOTES.md):
//
//   # 1. a static server with HTTP Range support, serving a catalog and the
//   #    geocoder's names index from one origin on :8000
//   #      <root>/demo-root/geoboundaries/{catalog.json,adm*/...}
//   #      <root>/examples/geocoder-demo/data/index.json
//   python3 serve.py 8000
//
//   # 2. this app
//   npx vite --port 8123 --strictPort
//
//   node verify-download-widget.mjs [screenshot.png]
//
// Prints what the user sees at each step, writes the downloaded files to
// /tmp, and re-reads the GeoParquet it produced with hyparquet to prove the
// output is a valid, readable file rather than just a blob of the right
// size.

import { chromium } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import * as hyparquet from 'hyparquet'
import { compressors } from 'hyparquet-compressors'

const APP = process.env.APP_BASE || 'http://localhost:8123'
const DATA = process.env.DATA_BASE || 'http://localhost:8000'
const COLLECTION = `${DATA}/demo-root/geoboundaries/adm2/collection.json`
const ZARR_COLLECTION = `${DATA}/demo-root/zarr-example/collection.json`
const SCREENSHOT = process.argv[2] || 'verify-download-widget.png'

// The app's hash router wants a single-slashed scheme in the external path.
const externalPath = url => `${APP}/#/external/${url.replace('://', ':/')}`

const browser = await chromium.launch()
const errors = []
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } })
page.on('console', message => {
  if (message.type() === 'error') {
    errors.push(message.text())
  }
})
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`))

const widget = () => page.locator('.area-download')
const log = (label, value) => console.log(label, typeof value === 'string' ? value : JSON.stringify(value, null, 2))

// --- 1. The widget appears on a vector GeoParquet collection -------------
await page.goto(externalPath(COLLECTION), { waitUntil: 'networkidle' })
await widget().waitFor({ timeout: 30000 })
log('COLLECTION', await page.locator('h1').first().textContent())
log('WIDGET INTRO', (await widget().locator('.intro').textContent()).trim())

// --- 2. Search for an area ----------------------------------------------
await page.fill('#areaDownloadSearch', 'liechtenstein')
const results = widget().locator('.results .list-group-item')
await results.first().waitFor({ timeout: 60000 })
log('SEARCH RESULTS', await results.allTextContents())
await results.first().click()

const summary = widget().locator('.area-summary')
await summary.waitFor({ timeout: 60000 })
log('AREA', (await summary.textContent()).replace(/\s+/g, ' ').trim())

// --- 3. Estimate ---------------------------------------------------------
await page.getByRole('button', { name: 'Estimate' }).click()
await widget().locator('dl.estimate').waitFor({ timeout: 120000 })
log('ESTIMATE', await widget().locator('dl.estimate').evaluate(dl => {
  const out = {}
  const terms = [...dl.querySelectorAll('dt')]
  terms.forEach((dt, index) => {
    out[dt.textContent.trim()] = dl.querySelectorAll('dd')[index]?.textContent.trim()
  })
  return out
}))

// --- 4. The generated request + SQL -------------------------------------
await page.getByRole('button', { name: /Show this download as code/ }).click()
await widget().locator('.request-code').waitFor({ timeout: 15000 })
const code = await widget().locator('.request-code').evaluate(node => (
  [...node.querySelectorAll('h4')].map((heading, index) => ({
    label: heading.textContent.trim(),
    code: node.querySelectorAll('.codebox')[index]?.innerText
  }))
))
for (const entry of code) {
  console.log(`\n--- ${entry.label} ---\n${entry.code}`)
}

// --- 5. Download, for real ----------------------------------------------
async function downloadAs(format, filename) {
  await page.getByRole('button', { name: format, exact: true }).click()
  const link = widget().locator('.download-ready a')
  await link.waitFor({ timeout: 300000 })
  log(`${format} PROGRESS`, (await widget().locator('.progress-note').textContent()).trim())
  const bytes = await link.evaluate(async anchor => {
    const response = await fetch(anchor.href)
    const buffer = await response.arrayBuffer()
    return [...new Uint8Array(buffer)]
  })
  const path = `/tmp/${filename}`
  writeFileSync(path, Buffer.from(bytes))
  log(`${format} SAVED`, { path, bytes: bytes.length, link: await link.textContent() })
  return path
}

const geojsonPath = await downloadAs('GeoJSON', 'verify-download.geojson')
const geojson = JSON.parse(Buffer.from(await import('node:fs').then(fs => fs.readFileSync(geojsonPath))).toString('utf8'))
log('GEOJSON', {
  type: geojson.type,
  features: geojson.features.length,
  firstProperties: geojson.features[0]?.properties,
  firstGeometryType: geojson.features[0]?.geometry?.type
})

const parquetPath = await downloadAs('GeoParquet', 'verify-download.parquet')
const buffer = (await import('node:fs')).readFileSync(parquetPath)
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

// The screenshot is the evidence for the branch: the panel with its map,
// the outline of the searched area, the estimate, and a finished download.
await widget().scrollIntoViewIfNeeded()
await page.screenshot({ path: SCREENSHOT, fullPage: false })

// --- 6. The other two ways to pick an area ------------------------------
// Draw: shift-drag on the widget's own map.
const mapBox = await widget().locator('.map').boundingBox()
await page.keyboard.down('Shift')
await page.mouse.move(mapBox.x + mapBox.width * 0.35, mapBox.y + mapBox.height * 0.35)
await page.mouse.down()
await page.mouse.move(mapBox.x + mapBox.width * 0.6, mapBox.y + mapBox.height * 0.6, { steps: 12 })
await page.mouse.up()
await page.keyboard.up('Shift')
await summary.waitFor({ timeout: 15000 })
log('DRAWN AREA', (await summary.textContent()).replace(/\s+/g, ' ').trim())
await page.getByRole('button', { name: 'Estimate' }).click()
await widget().locator('dl.estimate').waitFor({ timeout: 120000 })
log('DRAWN AREA ESTIMATE', await widget().locator('dl.estimate dd').first().textContent())

// Upload: a GeoJSON area file.
const uploaded = '/tmp/verify-download-area.geojson'
writeFileSync(uploaded, JSON.stringify({
  type: 'Feature',
  properties: { name: 'Vaduz box' },
  geometry: {
    type: 'Polygon',
    coordinates: [[[9.50, 47.12], [9.56, 47.12], [9.56, 47.16], [9.50, 47.16], [9.50, 47.12]]]
  }
}))
await page.setInputFiles('#areaDownloadUpload', uploaded)
await page.waitForTimeout(1500)
log('UPLOADED AREA', (await summary.textContent()).replace(/\s+/g, ' ').trim())
await page.getByRole('button', { name: 'Estimate' }).click()
await widget().locator('dl.estimate').waitFor({ timeout: 120000 })
log('UPLOADED AREA ESTIMATE', await widget().locator('dl.estimate dd').first().textContent())

// --- 7. No widget on a zarr collection ----------------------------------
await page.goto(externalPath(ZARR_COLLECTION), { waitUntil: 'networkidle' })
await page.waitForTimeout(4000)
log('ZARR COLLECTION', await page.locator('h1').first().textContent())
log('WIDGET PRESENT ON ZARR', await widget().count())

console.log('\nCONSOLE ERRORS', JSON.stringify(errors, null, 2))
await browser.close()
