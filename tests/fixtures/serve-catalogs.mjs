// Serve local test catalogs over HTTP, on their own port.
//
// A catalog is a separate origin from the browser in every real deployment,
// so the test catalogs are served separately too. Same-origin hosting hides
// the CORS mistakes that stop a real Zarr store from drawing.
//
// Run it from the repository root, beside `pnpm start`:
//
//   node tests/fixtures/serve-catalogs.mjs
//
// It serves tests/fixtures/catalogs on port 8082. Mount another catalog that
// lives outside the repository by passing `name=path`:
//
//   node tests/fixtures/serve-catalogs.mjs italy=~/repos/italy-aerial-catalog/catalog
//
// Options:
//   --port <n>   Port to listen on. Default 8082.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const HERE = dirname(fileURLToPath(import.meta.url));

const TYPES = {
  '.json': 'application/json',
  '.geojson': 'application/geo+json',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.txt': 'text/plain; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.pmtiles': 'application/vnd.pmtiles',
  '.parquet': 'application/vnd.apache.parquet',
};

const args = process.argv.slice(2);
let port = 8082;
const extra = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port') {
    port = Number(args[++i]);
    continue;
  }
  const eq = args[i].indexOf('=');
  if (eq < 1) {
    console.error(`Ignored argument "${args[i]}". Expected name=path or --port <n>.`);
    continue;
  }
  const name = args[i].slice(0, eq);
  const raw = args[i].slice(eq + 1);
  const expanded = raw.startsWith('~') ? join(homedir(), raw.slice(1)) : raw;
  extra.push([name, resolve(expanded)]);
}

// Mount points, longest prefix first so /italy wins over /.
const mounts = [
  ...extra,
  ['', resolve(HERE, 'catalogs')],
].sort((a, b) => b[0].length - a[0].length);

// Resolve a request path inside its mount, and refuse anything that climbs
// out. `new URL` already collapses every `..`, including `%2e%2e`. The prefix
// check is a second line only, in case that stops being true.
function locate(pathname) {
  for (const [name, root] of mounts) {
    const prefix = name ? `/${name}` : '';
    if (prefix && pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {continue;}
    const rest = pathname.slice(prefix.length) || '/';
    const file = resolve(root, `.${rest}`);
    if (file !== root && !file.startsWith(root + sep)) {return null;}
    return file;
  }
  return null;
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  // A browser reads a Zarr store with range requests, so the range headers
  // have to survive the cross-origin check.
  res.setHeader('Access-Control-Expose-Headers', 'content-range, content-length, accept-ranges');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const file = locate(decodeURIComponent(pathname));
  if (!file) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  let info;
  try {
    info = await stat(file);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  // A directory lists the catalogs it holds, so the mount is browsable.
  if (info.isDirectory()) {
    const index = join(file, 'catalog.json');
    try {
      const body = await readFile(index);
      res.setHeader('Content-Type', 'application/json');
      res.end(body);
    } catch {
      res.statusCode = 404;
      res.end('No catalog.json here');
    }
    return;
  }

  res.setHeader('Content-Type', TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Accept-Ranges', 'bytes');
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const size = info.size;
    let start;
    let end;
    // `bytes=-` matches with both groups empty. RFC 9110 14.1.1 requires a
    // range-spec to carry a start, an end, or a suffix length; one with
    // neither is unsatisfiable, not a request for the whole file.
    if (!range[1] && !range[2]) {
      start = Infinity;
      end = -Infinity;
    } else if (range[1]) {
      // `bytes=START-` or `bytes=START-END`.
      start = Number(range[1]);
      end = range[2] ? Number(range[2]) : size - 1;
    } else {
      // `bytes=-N`: a suffix range, the last N bytes of the file.
      const suffix = Number(range[2]);
      start = Math.max(0, size - suffix);
      end = size - 1;
    }
    // Clamp like a real object store would, so Content-Range and
    // Content-Length describe the bytes actually sent, not the request.
    end = Math.min(end, size - 1);
    if (size === 0 || start > end || start >= size) {
      res.statusCode = 416;
      res.setHeader('Content-Range', `bytes */${size}`);
      res.end();
      return;
    }
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Content-Length', end - start + 1);
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.setHeader('Content-Length', info.size);
  createReadStream(file).pipe(res);
});

server.listen(port, () => {
  console.log(`Test catalogs on http://localhost:${port}`);
  for (const [name, root] of mounts) {
    console.log(`  /${name || ''}`.padEnd(14) + `-> ${root}`);
  }
  console.log('\nOpen one in a browser running on another port, for example:');
  console.log(`  http://localhost:8081/#/external/http://localhost:${port}/zarr/catalog.json`);
});
