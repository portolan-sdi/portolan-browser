/**
 * The "Download data" tool, on the map.
 *
 * It is registered on the `map-overlay` hook, so its DOM is a child of the
 * map container and the area it picks is drawn on the page's own map. These
 * tests hold three things about that:
 *
 *   1. On vector GeoParquet it is there, inside the map, with the three ways
 *      of picking an area side by side: the @cnmw/maplibre geocoder's search
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
    // The @cnmw geocoder control, mounted on the real map.
    await expect(widget(page).locator('.ad-search input[role="combobox"]')).toBeVisible();
    await expect(widget(page).getByRole('button', { name: 'Draw a box' })).toBeVisible();
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
      {
        'table:primary_geometry': 'geometry',
        'table:columns': [{ name: 'geometry', type: 'geometry' }]
      }
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
        'partition:scheme': 'hive',
        'partition:glob': 's3://example-bucket/detections/year=*/detections.parquet',
        'partition:keys': [{ name: 'year', type: 'int32' }],
        'table:primary_geometry': 'geometry',
        'table:columns': [
          { name: 'geometry', type: 'geometry' },
          { name: 'acq_datetime', type: 'timestamp' }
        ]
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
