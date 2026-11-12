/**
 * "Download data" widget presence.
 *
 * The panel is registered in widgets.config.js with a condition, and the
 * design it comes from treats an undownloadable dataset as an *absence* of
 * the panel rather than a panel that explains itself. That contract is what
 * these tests hold: it appears on vector GeoParquet, and it is not there at
 * all on a raster collection.
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

const panel = page => page.locator('.area-download');

test.describe('Download data widget', () => {
  test('offers itself on a collection with vector GeoParquet', async ({ page, worker }) => {
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

    await expect(panel(page)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Download data' })).toBeVisible();
    await expect(page.locator('#areaDownloadSearch')).toBeVisible();
    await expect(panel(page).getByRole('button', { name: 'Estimate' })).toBeVisible();
  });

  test('stays away from a raster collection', async ({ page, worker }) => {
    const { catalog, collection } = catalogWith(COG_ASSET);
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(page.getByRole('heading', { name: 'Example Collection' })).toBeVisible();
    await expect(panel(page)).toHaveCount(0);
  });

  test('explains itself when the data is not reachable from a browser', async ({ page, worker }) => {
    // A hive-partitioned collection whose partitions are published as an
    // s3:// URI: the condition says yes, because this is vector parquet, and
    // the panel then says why it cannot read it.
    const { catalog, collection } = catalogWith(
      { tiles: { href: './x.pmtiles', type: 'application/vnd.pmtiles', roles: ['visual', 'data'] } },
      {
        'partition:scheme': 'hive',
        'partition:glob': 's3://example-bucket/detections/year=*/*.parquet',
        'partition:keys': [{ name: 'year', type: 'int32' }]
      }
    );
    await catalog.createServer(worker);

    await page.goto(collection.getBrowserPath());
    await waitForBrowserReady(page);

    await expect(panel(page)).toBeVisible();
    await expect(panel(page).locator('.refusal')).toContainText('s3://');
  });
});
