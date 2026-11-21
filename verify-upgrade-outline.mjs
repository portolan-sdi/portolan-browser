// Chris's report, 2026-11-13: picking Poland showed the "full detail
// loaded" notice, but the drawn outline stayed visibly simplified. Root
// cause: the widget's Geocoder asked for `resolution: 'both'` without
// `upgradeDisplay: true`, so the background upgrade only ever replaced the
// (invisible) filterGeometry -- the notice told the truth about the fetch
// and the map never showed it.
//
//   npx vite --port 8081 --strictPort        # or whatever is already running
//   node verify-upgrade-outline.mjs
//
//   APP_BASE    the app          (default http://localhost:8081)
//
// What it holds the branch to, against the LIVE FTW 2019 collection and the
// LIVE geoBoundaries gazetteer (Liechtenstein: 44 display vertices, 2,570
// full -- the smallest country with a real display/full contrast, so the
// run costs ~50 KB, not Canada's megabytes):
//
//   1. The widget's own `area` swaps to the full-resolution geometry
//      (geometryVariant 'full', display vertexCount rising from 44 into the
//      thousands) after the background upgrade.
//   2. The VISIBLE outline follows: the `area-download-display` GeoJSON
//      source holds the same full-resolution ring, not the 44-vertex one
//      it was given on select.
//   3. The estimate shown before the upgrade landed is still on the card
//      afterwards -- an upgrade must never take a result away.
//
// State is read through Vue's dev-build `__vueParentComponent` handle on
// the widget root (the map itself is a `provide`, not a global). That
// handle only exists in dev builds, which is what this script -- like every
// verify-*.mjs here -- runs against.
//
// Writes one committed screenshot: the full-resolution outline on the map.

import { chromium } from '@playwright/test'

const APP = process.env.APP_BASE || 'http://localhost:8081'
const DATA = process.env.DATA_BASE || 'https://data.source.coop'
const COLLECTION = `${DATA}/ftw/global-data-2e/vector/2019/collection.json`

const externalPath = url => `${APP}/#/external/${url.replace('://', ':/')}`
const log = (label, value) => console.log(label, typeof value === 'string' ? value : JSON.stringify(value))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()) } })
page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))

// The widget's reactive state, through the dev-build component handle.
const widgetState = () => page.evaluate(() => {
  const ctx = document.querySelector('.area-download')?.__vueParentComponent?.ctx
  if (!ctx) { return null }
  const area = ctx.area
  const count = g => (g ? (JSON.stringify(g.coordinates).match(/\[-?\d/g) || []).length : 0)
  // serialize(), not the source's private `_data`: the latter is not
  // populated at every moment this reads it, serialize() always answers.
  const source = ctx.map?.getSource('area-download-display')
  const feature = source?.serialize?.().data?.features?.[0]
  return {
    areaDisplayVertices: area?.vertexCount?.display ?? null,
    geometryVariant: area?.provenance?.geometryVariant ?? null,
    pendingUpgrade: area?.provenance?.pendingUpgrade ?? null,
    mapSourceVertices: feature ? count(feature.geometry) : 0,
    estimateShown: Boolean(ctx.estimateResult)
  }
})

await page.goto(externalPath(COLLECTION), { waitUntil: 'domcontentloaded' })
await page.waitForSelector('.area-download', { timeout: 120000 })
await page.waitForTimeout(4000)
// The cluster may greet collapsed (the pill) or already open.
const pill = page.locator('.ad-pill')
if (await pill.isVisible().catch(() => false)) { await pill.click() }
const input = page.locator('.ad-search input[role="combobox"]')
await input.waitFor({ timeout: 30000 })
await input.fill('liechtenstein')
const options = page.locator('.ad-search [role="option"]')
await options.first().waitFor({ timeout: 120000 })
await options.first().click()

// The select lands the display-simplified outline first.
await page.waitForFunction(() => {
  const ctx = document.querySelector('.area-download')?.__vueParentComponent?.ctx
  return Boolean(ctx?.area)
}, undefined, { timeout: 60000 })
const before = await widgetState()
log('after select:', before)
if (before.areaDisplayVertices > 500) {
  throw new Error(`expected the display-simplified outline first, got ${before.areaDisplayVertices} vertices`)
}

// The background upgrade swaps Area.geometry to full resolution...
await page.waitForFunction(() => {
  const ctx = document.querySelector('.area-download')?.__vueParentComponent?.ctx
  return ctx?.area?.provenance?.geometryVariant === 'full'
}, undefined, { timeout: 120000 })
// ...and the control's deferred idle callback hands it to upgradeArea.
await page.waitForFunction(() => {
  const ctx = document.querySelector('.area-download')?.__vueParentComponent?.ctx
  const feature = ctx?.map?.getSource('area-download-display')?.serialize?.().data?.features?.[0]
  const n = feature ? (JSON.stringify(feature.geometry.coordinates).match(/\[-?\d/g) || []).length : 0
  return n > 1000
}, undefined, { timeout: 30000 })
const after = await widgetState()
log('after upgrade:', after)

if (after.mapSourceVertices <= before.mapSourceVertices * 2) {
  throw new Error(`visible outline did not upgrade: ${before.mapSourceVertices} -> ${after.mapSourceVertices}`)
}
if (after.mapSourceVertices !== after.areaDisplayVertices) {
  throw new Error(`map source (${after.mapSourceVertices}) and Area (${after.areaDisplayVertices}) disagree`)
}
console.log(`PASS: visible outline upgraded ${before.mapSourceVertices} -> ${after.mapSourceVertices} vertices.`)

// The estimate that was on the card before the upgrade must still be there.
await page.locator('.ad-card dl.estimate').first().waitFor({ timeout: 180000 })
const final = await widgetState()
if (!final.estimateShown) { throw new Error('estimate disappeared after the upgrade') }
console.log('PASS: estimate still on the card after the upgrade.')

await page.screenshot({ path: 'verify-upgrade-outline.png' })
console.log('Screenshot: verify-upgrade-outline.png')

console.log('Console errors:', errors.length)
errors.slice(0, 5).forEach(e => console.log(' -', e))
await browser.close()
if (errors.length > 0) { process.exitCode = 1 }
