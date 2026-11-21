/**
 * The "Download data" tool, on the map.
 *
 * It is registered on the `map-overlay` hook, so its DOM is a child of the
 * map container and the area it picks is drawn on the page's own map. These
 * tests hold three things about that:
 *
 *   1. On vector GeoParquet it is there, inside the map, with the three ways
 *      of picking an area side by side: the @cngeo/maplibre geocoder's search
 *      box, a draw button and an upload button.
 *   2. On a raster collection it is not there at all -- the design it comes
 *      from treats an undownloadable dataset as an *absence*, not as a panel
 *      that explains itself -- and neither is the "Download data" hint.
 *   3. When the data is vector parquet the browser cannot reach, it says so
 *      on the map rather than offering tools that would fail.
 *
 * The end-to-end flow -- search, area, estimate, real download -- needs a
 * real GeoParquet file and a real place index, so it lives in
 * verify-download-widget.mjs at the repo root rather than here.
 */
import { test, expect } from './fixtures.js';
import { waitForBrowserReady } from './helpers.js';
import StaticCatalog from '../fixtures/instances/static.js';

const PARQUET_ASSET = {
  data: {
    href: './fields.parquet',
    type: 'application/vnd.apache.parquet',
    roles: ['data']
  }
};

const COG_ASSET = {
  data: {
    href: './elevation.tif',
    type: 'image/tiff; application=geotiff; profile=cloud-optimized',
    roles: ['data']
  }
};

// Four parquet tables with role `data`, as Fields of the World's benchmark
// collections publish them: the first is 889 MB of field boundaries, the
// third a 1.4 MB chip index. Taking the first silently was the wrong
// answer; so was refusing all four.
const MULTI_ASSETS = {
  fields: {
    href: './at_2021_fields.parquet',
    type: 'application/vnd.apache.parquet',
    title: 'Field boundary polygons',
    'file:size': 888904336,
    'table:row_count': 2610511,
    roles: ['data']
  },
  boundary_lines: {
    href: './at_2021_boundary_lines.parquet',
    type: 'application/vnd.apache.parquet',
    title: 'Field boundary lines',
    'table:row_count': 1836737,
    roles: ['data']
  },
  chips: {
    href: './at_2021_chips.parquet',
    type: 'application/vnd.apache.parquet',
    title: 'Chip definitions with field coverage',
    'file:size': 1458742,
    'table:row_count': 14506,
    roles: ['data']
  },
  items: {
    href: './items.parquet',
    type: 'application/vnd.apache.parquet',
    title: 'STAC items in GeoParquet format',
    roles: ['collection-mirror']
  }
};

const VECTOR_TABLE = {
  'table:primary_geometry': 'geometry',
  'table:columns': [
    { name: 'id', type: 'string' },
    { name: 'crop_name', type: 'varchar' },
    { name: 'area_ha', type: 'double' },
    { name: 'bbox', type: 'struct' },
    { name: 'geometry', type: 'geometry' }
  ]
};

// A table with a time column, and an extent wide enough that a default
// window earns its place (the 26-year FIRMS archive's shape, not the
// one-year benchmark collections').
const TIME_TABLE = {
  'table:primary_geometry': 'geometry',
  'table:columns': [
    { name: 'geometry', type: 'geometry' },
    { name: 'acq_datetime', type: 'timestamp' },
    { name: 'frp', type: 'double' }
  ]
};

const WIDE_EXTENT = {
  spatial: { bbox: [[-180, -90, 180, 90]] },
  temporal: { interval: [['2000-11-01T00:13:00Z', '2026-11-12T11:29:00Z']] }
};

// An area the widget can take without a drag on the map: an uploaded
// GeoJSON runs the same `setArea` as the geocoder and the draw box, so it
// is how these tests get a card on screen. The estimate it kicks off then
// fails, because there is no parquet behind these fixtures -- which is the
// error state one of the tests is about.
const AREA_FILE = {
  name: 'area.geojson',
  mimeType: 'application/geo+json',
  buffer: Buffer.from(JSON.stringify({
    type: 'Feature',
    properties: { name: 'Test area' },
    geometry: {
      type: 'Polygon',
      coordinates: [[[9.5, 47.1], [9.6, 47.1], [9.6, 47.2], [9.5, 47.2], [9.5, 47.1]]]
    }
  }))
};

function catalogWith(assets, extra = {}) {
  const catalog = new StaticCatalog({ url: 'https://stac.example/catalog.json' });
  const collection = catalog.addCollection({ url: 'https://stac.example/collection.json' });
  collection.setMetadata({
    title: 'Example Collection',
    description: 'A collection.',
    assets,
    ...extra
  });
  return { catalog, collection };
}

// Scoped through `.map`, so the assertion is "inside the map container",
// which is the whole point of the redesign.
const widget = page => page.locator('.map .map-overlay-widgets .area-download');

test.describe('Download data widget', () => {
  test('puts the area tools on the map for a vector GeoParquet collection', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, {
      'table:primary_geometry': 'geometry',
      'table:row_count': 1000,
      'table:columns': [
        { name: 'id', type: 'string' },
        { name: 'bbox', type: 'struct' },
        { name: 'geometry', type: 'geometry' }
      ]
    });
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(widget(page)).toBeVisible();
    // The affordance, in words, on the map.
    await expect(widget(page).locator('.ad-tools-head')).toContainText('Download data');
    // The @cngeo geocoder control, mounted on the real map.
    await expect(widget(page).locator('.ad-search input[role="combobox"]')).toBeVisible();
    await expect(widget(page).getByRole('button', { name: 'Draw a box' })).toBeVisible();
    // The box tool's sibling: @cngeo/maplibre's shared draw tool in polygon mode.
    await expect(widget(page).getByRole('button', { name: 'Draw polygon' })).toBeVisible();
    await expect(widget(page).getByRole('button', { name: 'Upload' })).toBeVisible();
    // Nothing to download yet, so no card.
    await expect(widget(page).locator('.ad-card')).toHaveCount(0);
  });

  test('collapses to a hint pill and back', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, {
      'table:primary_geometry': 'geometry',
      'table:columns': [{ name: 'geometry', type: 'geometry' }]
    });
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await widget(page).locator('.ad-collapse').click();
    const pill = widget(page).locator('.ad-pill');
    await expect(pill).toBeVisible();
    await expect(pill).toContainText('Download data');
    await expect(widget(page).locator('.ad-search input[role="combobox"]')).toBeHidden();

    await pill.click();
    await expect(widget(page).locator('.ad-search input[role="combobox"]')).toBeVisible();
  });

  test('stays away from a raster collection, hint and all', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(COG_ASSET);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(page.getByRole('heading', { name: 'Example Collection' })).toBeVisible();
    await expect(page.locator('.area-download')).toHaveCount(0);
    await expect(page.locator('.ad-pill')).toHaveCount(0);
  });

  test('explains itself on the map when the data is not reachable from a browser', async ({ page, worker }) => {
    // A collection whose one parquet file is published as an s3:// URI:
    // the condition says yes, because this is vector parquet, and the
    // widget then says why it cannot read it -- instead of offering a
    // search box that leads nowhere. DuckDB and the QGIS plugin can open
    // that href; fetch() cannot.
    const { catalog, collection } = catalogWith(
      {
        data: {
          href: 's3://example-bucket/fields.parquet',
          type: 'application/vnd.apache.parquet',
          roles: ['data']
        }
      },
      VECTOR_TABLE
    );
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(widget(page)).toBeVisible();
    await expect(widget(page).locator('.area-download-refusal')).toContainText('s3://');
    await expect(widget(page).locator('.ad-tools')).toHaveCount(0);
  });

  test('offers a partitioned collection whose glob is s3://, because the glob is never fetched', async ({ page, worker }) => {
    // The real FIRMS mirror's shape: a hive `partition:glob` on s3:// with
    // no `collection-mirror` asset, so §2.4 derives a `stac-items`
    // enumeration and every concrete file URL comes from an item's own
    // asset over https. Refusing on the glob alone turned a 632M-row
    // archive away over a string published for DuckDB's benefit.
    const { catalog, collection } = catalogWith(
      { tiles: { href: './x.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual', 'data'] } },
      {
        extent: WIDE_EXTENT,
        'partition:scheme': 'hive',
        'partition:glob': 's3://example-bucket/detections/year=*/detections.parquet',
        'partition:keys': [{ name: 'year', type: 'int32' }],
        ...TIME_TABLE
      }
    );
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(widget(page)).toBeVisible();
    await expect(widget(page).locator('.area-download-refusal')).toHaveCount(0);
    await expect(widget(page).locator('.ad-search input[role="combobox"]')).toBeVisible();
  });
});

test.describe('Download card: what to download', () => {
  test('offers every parquet table of a multi-asset collection, labelled and costed', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(MULTI_ASSETS, VECTOR_TABLE);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const picker = widget(page).locator('select.ad-select').first();
    await expect(picker).toBeVisible();
    // Titles, row counts and file sizes come from the assets themselves, so
    // choosing costs no request.
    await expect(picker.locator('option')).toHaveText([
      'Field boundary polygons (2,610,511 rows, 847.7 MB)',
      'Field boundary lines (1,836,737 rows)',
      'Chip definitions with field coverage (14,506 rows, 1.4 MB)'
    ]);
    // The collection mirror is not one of the dataset's tables.
    await expect(picker.locator('option', { hasText: 'STAC items' })).toHaveCount(0);
    // It starts on the table the derivation would have taken anyway.
    await expect(picker).toHaveValue('fields');

    await picker.selectOption('chips');
    await expect(picker).toHaveValue('chips');
  });

  test('offers no picker when there is only one table to download', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    await expect(widget(page).locator('.ad-card')).toBeVisible();
    await expect(widget(page).locator('select.ad-select')).toHaveCount(0);
  });
});

test.describe('Download card: when and which rows', () => {
  test('opens a wide archive on a 30-day window, and lets go of it', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, {
      extent: WIDE_EXTENT,
      ...TIME_TABLE
    });
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const card = widget(page).locator('.ad-card');
    const limit = card.locator('.ad-time input[type="checkbox"]');
    await expect(limit).toBeChecked();
    // Auto-populated from the collection's own temporal extent, and inside
    // it: 30 days ending at the end of the data.
    const from = card.locator('.ad-date').first();
    const to = card.locator('.ad-date').last();
    await expect(from).toHaveValue(/^20\d\d-\d\d-\d\d$/);
    await expect(to).toHaveValue(/^20\d\d-\d\d-\d\d$/);
    expect(await from.inputValue() < await to.inputValue()).toBe(true);
    await expect(card.locator('.ad-time .ad-note')).toContainText('acq_datetime');
    await expect(card.locator('.ad-chip')).toHaveText(['Last 30 days', 'Last year', 'Whole range']);

    // The whole range is one click away, and it really is the extent.
    await card.locator('.ad-chip', { hasText: 'Whole range' }).click();
    await expect(from).toHaveValue('2000-11-01');

    // And the filter itself is one click away from being gone.
    await limit.uncheck();
    await expect(card.locator('.ad-date')).toHaveCount(0);
  });

  test('leaves a one-year collection whole, and does not filter dates nobody asked to filter', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, {
      extent: {
        spatial: { bbox: [[9, 46, 18, 50]] },
        temporal: { interval: [['2021-01-01T00:00:00Z', '2021-12-31T23:59:59Z']] }
      },
      ...TIME_TABLE
    });
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const card = widget(page).locator('.ad-card');
    await expect(card).toBeVisible();
    // The row is there -- the table declares a time column -- but a
    // one-year collection is the dataset, not a slice of a bigger one, so
    // nothing is filtered until the user asks.
    await expect(card.locator('.ad-time input[type="checkbox"]')).not.toBeChecked();
    await expect(card.locator('.ad-date')).toHaveCount(0);
  });

  test('builds a column filter from the table\'s own columns', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const card = widget(page).locator('.ad-card');
    await card.getByRole('button', { name: '+ Add a column filter' }).click();
    const row = card.locator('.ad-where-row');
    await expect(row).toHaveCount(1);
    // Geometry and the bbox struct are not offered: one is the area's job,
    // the other has no single value to type into a box.
    await expect(row.locator('select').first().locator('option')).toHaveText(['id', 'crop_name', 'area_ha']);
    // A text column gets pattern operators; a number column gets
    // comparisons, and the operator follows the column.
    await expect(row.locator('select').nth(1).locator('option')).toContainText(['is', 'contains']);
    await row.locator('select').first().selectOption('area_ha');
    await expect(row.locator('select').nth(1).locator('option')).toContainText(['is at least']);

    await row.locator('.ad-icon-button').click();
    await expect(card.locator('.ad-where-row')).toHaveCount(0);
  });
});

test.describe('Download card: saying what went wrong', () => {
  test('says a failed estimate in words, not as an error code', async ({ page, worker }) => {
    // Nothing serves the parquet these fixtures name, so the estimate's
    // first range request fails. The taxonomy's rule is that the code is
    // the API and the message is for humans: the card has to carry the
    // sentence.
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const error = widget(page).locator('.ad-card .ad-error');
    await expect(error).toBeVisible({ timeout: 30000 });
    await expect(error).toContainText(/could not be fetched|could not be read/);
    await expect(error).not.toContainText('NETWORK:');
    await expect(error).not.toContainText('DATASET_UNRESOLVED');
  });
});

test.describe('Drawing a polygon, and editing an area', () => {
  // Both tools are @cngeo/maplibre's, consumed through the Vite alias:
  // `createDrawTool` in polygon mode and `createEditTool`. These tests are
  // about this app's half of the wiring -- that the buttons arm and disarm
  // the right tool, that the two draw modes are mutually exclusive, and
  // that Escape and the card's toggle get the user back out again.
  const mapPoint = async (page, fx, fy) => {
    const box = await page.locator('.map').first().boundingBox();
    return [box.x + box.width * fx, box.y + box.height * fy];
  };

  test('draws a polygon from clicked vertices and closes it with Enter', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);
    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    const polygon = widget(page).getByRole('button', { name: 'Draw polygon' });
    await polygon.click();
    // Armed: the button says what to do next, and the hint changes with it.
    await expect(widget(page).getByRole('button', { name: 'Click to add points' })).toBeVisible();
    await expect(widget(page).locator('.ad-note').first()).toContainText('Double-click or press Enter');

    for (const [fx, fy] of [[0.30, 0.30], [0.55, 0.28], [0.58, 0.62], [0.33, 0.66]]) {
      await page.mouse.click(...(await mapPoint(page, fx, fy)));
    }
    await page.keyboard.press('Enter');

    const card = widget(page).locator('.ad-card');
    await expect(card).toBeVisible({ timeout: 30000 });
    await expect(card.locator('.ad-area-name')).toHaveText('Drawn area');
    // Four clicked corners, not a rectangle's four-from-two-drag.
    await expect(card.locator('.ad-area-summary')).toContainText('5 filter vertices');
    // One shape per arming: the tool disarms itself afterwards.
    await expect(widget(page).getByRole('button', { name: 'Draw polygon' })).toBeVisible();
  });

  test('Escape cancels a polygon mid-draw, and arming one tool disarms the other', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);
    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await widget(page).getByRole('button', { name: 'Draw polygon' }).click();
    await page.mouse.click(...(await mapPoint(page, 0.3, 0.3)));
    await page.mouse.click(...(await mapPoint(page, 0.5, 0.3)));
    await page.keyboard.press('Escape');
    await expect(widget(page).getByRole('button', { name: 'Draw polygon' })).toBeVisible();
    await expect(widget(page).locator('.ad-card')).toHaveCount(0);

    // Two armed tools would race for the same clicks on the map.
    await widget(page).getByRole('button', { name: 'Draw polygon' }).click();
    await expect(widget(page).getByRole('button', { name: 'Click to add points' })).toBeVisible();
    await widget(page).getByRole('button', { name: 'Draw a box' }).click();
    await expect(widget(page).getByRole('button', { name: 'Drag on the map' })).toBeVisible();
    await expect(widget(page).getByRole('button', { name: 'Draw polygon' })).toBeVisible();
  });

  test('offers "Edit shape" on an area, and leaves the editor on Escape', async ({ page, worker }) => {
    // Four editor toggles on top of a page load and an upload. Each toggle
    // adds and removes three map layers, and under six parallel workers
    // against an on-demand dev server that is comfortably past the default
    // 30s budget -- the same pressure the `expect.timeout` in
    // playwright.config.js is raised for. Passes in ~4s run on its own.
    test.slow();
    const { catalog, collection } = catalogWith(PARQUET_ASSET, VECTOR_TABLE);
    await catalog.createServer(worker);
    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);
    // An uploaded area, so this test does not depend on a drag landing.
    await widget(page).locator('.ad-file').setInputFiles(AREA_FILE);

    const card = widget(page).locator('.ad-card');
    await expect(card).toBeVisible({ timeout: 30000 });
    const edit = card.getByRole('button', { name: 'Edit shape' });
    await expect(edit).toBeVisible();

    await edit.click();
    await expect(card.getByRole('button', { name: 'Done editing' })).toBeVisible();
    await expect(card.locator('.ad-edit-hint')).toContainText('Drag a handle');

    await page.keyboard.press('Escape');
    await expect(card.getByRole('button', { name: 'Edit shape' })).toBeVisible();

    // And the toggle closes it too.
    await edit.click();
    await expect(card.getByRole('button', { name: 'Done editing' })).toBeVisible();
    await card.getByRole('button', { name: 'Done editing' }).click();
    await expect(card.getByRole('button', { name: 'Edit shape' })).toBeVisible();
  });
});
