/**
 * Authentication tests.
 *
 * Baseline coverage for the global `authConfig` behavior: a request that fails
 * with 401 asks the user to log in and is retried with the credentials applied
 * as header or query parameter. Also covers the STAC Authentication extension
 * UI (unsupported schemes) and login cancellation.
 */
import { test, expect } from './fixtures.js';
import {
  configureBrowser,
  hasBasicAuth,
  hasHeader,
  hasQuery,
  requireAuth,
  submitApiKey,
  submitBasicAuth,
  waitForBrowserReady,
} from './helpers.js';
import StaticCatalog from '../fixtures/instances/static.js';

const ROOT_URL = 'https://stac.example/catalog.json';

function createStaticCatalog() {
  return new StaticCatalog({ url: ROOT_URL });
}

// The login modal appears during the initial page load (before the app is
// "ready"), so it must absorb the full cold-load latency and needs a longer
// wait than the global assertion default under parallel load.
async function expectLoginModal(page) {
  await expect(page.locator('#stac-browser-auth-modal')).toBeVisible({ timeout: 15000 });
}

test.describe('Global authConfig (legacy single scheme)', () => {
  test('apiKey in header: 401 shows login, retry succeeds with header', async ({ page, worker }) => {
    await configureBrowser(page, {
      authConfig: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    });
    const catalog = createStaticCatalog();
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasHeader('x-api-key', 'secret'));

    await page.goto(catalog.root.getBrowserPath());

    // The 401 must trigger the login form
    await expectLoginModal(page);

    // The retried request must carry the API key header
    const retried = page.waitForRequest(req => req.url().startsWith(ROOT_URL) && Boolean(req.headers()['x-api-key']));
    await submitApiKey(page, 'secret');
    expect((await retried).headers()['x-api-key']).toBe('secret');

    await waitForBrowserReady(page);
    await expect(page.getByRole('heading', { name: /Example Catalog/ })).toBeVisible();
    // Logged in: the header button offers logout
    await expect(page.getByRole('button', { name: /log out/i })).toBeVisible();
  });

  test('apiKey in query: retry succeeds with query parameter', async ({ page, worker }) => {
    await configureBrowser(page, {
      authConfig: { type: 'apiKey', in: 'query', name: 'API_KEY' },
    });
    const catalog = createStaticCatalog();
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasQuery('API_KEY', 'secret'));

    await page.goto(catalog.root.getBrowserPath());
    await expectLoginModal(page);

    const retried = page.waitForRequest(req => req.url().startsWith(ROOT_URL) && req.url().includes('API_KEY='));
    await submitApiKey(page, 'secret');
    expect((await retried).url()).toContain('API_KEY=secret');

    await waitForBrowserReady(page);
    await expect(page.getByRole('heading', { name: /Example Catalog/ })).toBeVisible();
  });

  test('http basic: retry succeeds with Authorization header', async ({ page, worker }) => {
    await configureBrowser(page, {
      authConfig: { type: 'http', scheme: 'basic' },
    });
    const catalog = createStaticCatalog();
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasBasicAuth('jane', 'doe'));

    await page.goto(catalog.root.getBrowserPath());
    await expectLoginModal(page);

    const retried = page.waitForRequest(req => req.url().startsWith(ROOT_URL) && Boolean(req.headers().authorization));
    await submitBasicAuth(page, 'jane', 'doe');
    expect((await retried).headers().authorization).toBe(`Basic ${btoa('jane:doe')}`);

    await waitForBrowserReady(page);
    await expect(page.getByRole('heading', { name: /Example Catalog/ })).toBeVisible();
  });

  test('credentials are not sent to external domains', async ({ page, worker }) => {
    await configureBrowser(page, {
      catalogUrl: ROOT_URL,
      authConfig: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    });
    const catalog = createStaticCatalog();
    const external = catalog.addCatalog({ url: 'https://other.example/catalog.json' });
    external.setMetadata({ title: 'External Catalog' });
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasHeader('x-api-key', 'secret'));

    // Record every request to the external domain for the whole test. The child
    // is often fetched during the initial render, to resolve its title, rather
    // than on the click below — a listener armed just before the click then
    // waits for a request that already happened and never comes again.
    const externalRequests = [];
    page.on('request', req => {
      if (req.url().startsWith('https://other.example/catalog.json')) {
        externalRequests.push(req);
      }
    });

    await page.goto('/');
    await expectLoginModal(page);
    await submitApiKey(page, 'secret');
    await waitForBrowserReady(page);

    // Navigate to the external child
    await page.getByRole('link', { name: /External Catalog/ }).click();
    await waitForBrowserReady(page);
    await expect(page.getByRole('heading', { name: /External Catalog/ })).toBeVisible();

    // However it was reached, no request to the external domain may carry the
    // credentials — assert over all of them, not just the first.
    expect(externalRequests.length).toBeGreaterThan(0);
    for (const req of externalRequests) {
      expect(req.headers()['x-api-key']).toBeUndefined();
    }
  });

  test('logout clears the credentials', async ({ page, worker }) => {
    await configureBrowser(page, {
      authConfig: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    });
    const catalog = createStaticCatalog();
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasHeader('x-api-key', 'secret'));

    await page.goto(catalog.root.getBrowserPath());
    await expectLoginModal(page);
    await submitApiKey(page, 'secret');
    await waitForBrowserReady(page);

    await page.getByRole('button', { name: /log out/i }).click();
    await expect(page.getByText(/logged out successfully/i)).toBeVisible();

    // Without the credentials the catalog asks for a login again.
    // In hash history mode navigating to the path we are already on only
    // rewrites the fragment, so force a real reload to refetch the catalog.
    await page.goto(catalog.root.getBrowserPath());
    await page.reload();
    await expectLoginModal(page);
  });

  test('cancelling the login dismisses the form', async ({ page, worker }) => {
    await configureBrowser(page, {
      authConfig: { type: 'apiKey', in: 'header', name: 'X-API-Key' },
    });
    const catalog = createStaticCatalog();
    await catalog.createServer(worker);
    await requireAuth(worker, ROOT_URL, hasHeader('x-api-key', 'secret'));

    await page.goto(catalog.root.getBrowserPath());
    await expectLoginModal(page);

    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.locator('#stac-browser-auth-modal')).not.toBeVisible();
    // The catalog was not loaded
    await expect(page.getByRole('heading', { name: /Example Catalog/ })).not.toBeVisible();
  });
});

test.describe('STAC Authentication extension', () => {
  test('unsupported scheme on an asset shows an error on login attempt', async ({ page, worker }) => {
    const catalog = createStaticCatalog();
    const item = catalog.addItem({ url: 'https://stac.example/item.json' });
    item.setMetadata({
      'auth:schemes': {
        oauth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://auth.example/authorize',
              tokenUrl: 'https://auth.example/token',
              scopes: {},
            },
          },
        },
      },
    });
    item.data.assets.data['auth:refs'] = ['oauth'];
    await catalog.createServer(worker);

    await page.goto(item.getBrowserPath());
    await waitForBrowserReady(page);

    // Expand the accordion of the asset that requires authentication
    await page.getByRole('button', { name: /measurements/i }).click();

    const authButton = page.getByRole('button', { name: /authentication required/i }).first();
    await expect(authButton).toBeVisible();
    await authButton.click();
    await expect(page.getByText(/is not supported by STAC Browser/i)).toBeVisible();
  });
});
