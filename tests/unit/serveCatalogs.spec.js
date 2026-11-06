// @vitest-environment node
//
// This spec drives a real Node HTTP server and reads real HTTP responses,
// which happy-dom's fetch polyfill (the project's default test environment)
// does not reproduce faithfully. Running it under the plain `node`
// environment avoids that layer entirely.
//
// Exercises tests/fixtures/serve-catalogs.mjs over real HTTP, on an
// ephemeral port of its own. The server is a script, not a module with an
// exported handler, so it is driven as a child process, the way a developer
// or `zarr-render-check.mjs` actually runs it.
//
// This guards the range-request handling in particular: an unsatisfiable
// `Range` header used to throw inside `createReadStream` and crash the
// whole process (see docs/zarr.md history / PR #92 review). A regression
// there would otherwise only surface as a flaky Playwright run.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const SCRIPT = resolve(ROOT, 'tests/fixtures/serve-catalogs.mjs');

// A port of its own, offset by the process id, so two vitest workers (or a
// developer's own `serve-catalogs.mjs`) do not fight over 8082.
const PORT = 20000 + (process.pid % 10000);
const BASE = `http://localhost:${PORT}`;
const FILE_URL = `${BASE}/zarr/catalog.json`;
const FILE_SIZE = 1902;

let child;

beforeAll(async () => {
  child = spawn(process.execPath, [SCRIPT, '--port', String(PORT)], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await new Promise((resolvePromise, reject) => {
    let out = '';
    const onData = (chunk) => {
      out += chunk.toString();
      if (out.includes('Test catalogs on')) {
        child.stdout.off('data', onData);
        resolvePromise();
      }
    };
    child.stdout.on('data', onData);
    child.once('error', reject);
    child.once('exit', (code) => reject(new Error(`serve-catalogs.mjs exited early (code ${code})`)));
    setTimeout(() => reject(new Error('serve-catalogs.mjs did not start in time')), 10000);
  });
}, 15000);

afterAll(() => {
  child?.kill();
});

// The fixture holds non-ASCII text (for example an accented word in a
// description), so its byte length and its JS string length differ. Every
// assertion below compares raw bytes, via Buffer, rather than decoded text.
async function bytesOf(resp) {
  return Buffer.from(await resp.arrayBuffer());
}

describe('serve-catalogs.mjs range handling', () => {
  it('serves the whole file with no Range header', async () => {
    const resp = await fetch(FILE_URL);
    expect(resp.status).toBe(200);
    expect(resp.headers.get('content-length')).toBe(String(FILE_SIZE));
    const body = await bytesOf(resp);
    expect(body.length).toBe(FILE_SIZE);
  });

  it('refuses "bytes=-" as unsatisfiable, without crashing the server', async () => {
    const resp = await fetch(FILE_URL, { headers: { Range: 'bytes=-' } });
    expect(resp.status).toBe(416);
    expect(resp.headers.get('content-range')).toBe(`bytes */${FILE_SIZE}`);

    // The regression this guards against: a bad Range header used to throw
    // inside the request handler and take the whole process down. A normal
    // request right after proves the process is still alive.
    const follow = await fetch(FILE_URL);
    expect(follow.status).toBe(200);
  });

  it('refuses a range that starts past the end of the file', async () => {
    const resp = await fetch(FILE_URL, {
      headers: { Range: `bytes=${FILE_SIZE}-${FILE_SIZE + 10}` },
    });
    expect(resp.status).toBe(416);
    expect(resp.headers.get('content-range')).toBe(`bytes */${FILE_SIZE}`);
  });

  it('clamps an over-long range to the bytes actually sent', async () => {
    const resp = await fetch(FILE_URL, {
      headers: { Range: 'bytes=0-99999' },
    });
    expect(resp.status).toBe(206);
    expect(resp.headers.get('content-range')).toBe(`bytes 0-${FILE_SIZE - 1}/${FILE_SIZE}`);
    expect(resp.headers.get('content-length')).toBe(String(FILE_SIZE));
    const body = await bytesOf(resp);
    expect(body.length).toBe(FILE_SIZE);
  });

  it('serves a suffix range ("bytes=-N") as the last N bytes', async () => {
    const whole = await bytesOf(await fetch(FILE_URL));
    const resp = await fetch(FILE_URL, { headers: { Range: 'bytes=-5' } });
    expect(resp.status).toBe(206);
    expect(resp.headers.get('content-range')).toBe(`bytes ${FILE_SIZE - 5}-${FILE_SIZE - 1}/${FILE_SIZE}`);
    expect(resp.headers.get('content-length')).toBe('5');
    const body = await bytesOf(resp);
    expect(body.equals(whole.subarray(-5))).toBe(true);
  });

  it('clamps a suffix range longer than the file to the whole file', async () => {
    const resp = await fetch(FILE_URL, { headers: { Range: 'bytes=-999999' } });
    expect(resp.status).toBe(206);
    expect(resp.headers.get('content-range')).toBe(`bytes 0-${FILE_SIZE - 1}/${FILE_SIZE}`);
    expect(resp.headers.get('content-length')).toBe(String(FILE_SIZE));
  });

  it('serves a normal bounded range exactly', async () => {
    const whole = await bytesOf(await fetch(FILE_URL));
    const resp = await fetch(FILE_URL, { headers: { Range: 'bytes=0-9' } });
    expect(resp.status).toBe(206);
    expect(resp.headers.get('content-range')).toBe(`bytes 0-9/${FILE_SIZE}`);
    expect(resp.headers.get('content-length')).toBe('10');
    const body = await bytesOf(resp);
    expect(body.equals(whole.subarray(0, 10))).toBe(true);
  });
});
