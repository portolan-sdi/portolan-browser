// Count the HTTP range requests it takes to open a COG and read a block of
// tiles, before and after the coalescing data source in src/utils/cogSource.js.
//
// This talks to a real COG over the network, so it is not part of `npm test`.
// Run it by hand:
//
//   node tests/manual/cog-request-count.mjs \
//     https://data.source.coop/ftw/global-data-beta/raster/2025/overview.tif 16 2 72 8
//
// Arguments: <url> [grid] [overview level or "full"] [tile x] [tile y]
//
// It repeats the I/O that @developmentseed/geotiff's `fetchTile` does, without
// the codec decode, which needs a browser: resolve each tile's byte range
// through the cached header source, then read the data tile and the mask tile
// at the same time through the data source. Each tile gets its own AbortSignal
// and at most four tiles are read at once, as deck.gl does.

import { Window } from 'happy-dom';

// The library parses the GDALMetadata tag with DOMParser, which node lacks.
// Both imports are dynamic so this runs before the library loads.
globalThis.DOMParser = new Window().DOMParser;

const { GeoTIFF } = await import('@developmentseed/geotiff');
const { openCog } = await import('../../src/utils/cogSource.js');

const url = process.argv[2];
if (!url) {
  console.error('usage: node tests/manual/cog-request-count.mjs <url> [grid] [level] [x] [y]');
  process.exit(2);
}
const grid = Number(process.argv[3] ?? 16);
const levelArg = process.argv[4] ?? 'full';
const x0 = Number(process.argv[5] ?? 0);
const y0 = Number(process.argv[6] ?? 0);

const nativeFetch = globalThis.fetch;
let requests = 0;
let bytes = 0;
globalThis.fetch = async (input, init) => {
  requests += 1;
  const response = await nativeFetch(input, init);
  bytes += Number(response.headers.get('content-length') ?? 0);
  return response;
};

async function measure(mode) {
  requests = 0;
  bytes = 0;
  const started = Date.now();
  const cog = mode === 'after' ? await openCog(GeoTIFF, url) : await GeoTIFF.fromUrl(url);
  const openRequests = requests;

  const level = levelArg === 'full' ? cog : cog.overviews[Number(levelArg)];
  const image = level.image ?? level;
  const mask = level.maskImage ?? null;

  const tiles = [];
  for (let y = y0; y < y0 + grid; y++) {
    for (let x = x0; x < x0 + grid; x++) {tiles.push([x, y]);}
  }

  let payload = 0;
  const readTile = async ([x, y]) => {
    const { signal } = new AbortController(); // deck gives each tile its own
    const read = async (ifd) => {
      if (!ifd) {return;}
      const range = await ifd.getTileSize(x, y);
      if (!range || range.offset <= 0 || range.imageSize <= 0) {return;} // sparse
      payload += range.imageSize;
      await cog.dataSource.fetch(range.offset, range.imageSize, { signal });
    };
    await Promise.all([read(image), read(mask)]);
  };

  const queue = [...tiles];
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (;;) {
      const next = queue.shift();
      if (!next) {return;}
      await readTile(next);
    }
  }));

  return {
    mode,
    tiles: tiles.length,
    openRequests,
    tileRequests: requests - openRequests,
    totalRequests: requests,
    mb: +(bytes / 1048576).toFixed(2),
    tilePayloadMb: +(payload / 1048576).toFixed(2),
    seconds: +((Date.now() - started) / 1000).toFixed(1),
  };
}

const before = await measure('before');
const after = await measure('after');

console.log(`${url}`);
console.log(`${grid}x${grid} tiles at (${x0},${y0}), level ${levelArg}, ${before.tiles} tiles\n`);
const row = (r) => [
  r.mode.padEnd(7),
  String(r.openRequests).padStart(5),
  String(r.tileRequests).padStart(6),
  String(r.totalRequests).padStart(6),
  String(r.mb).padStart(7),
  String(r.tilePayloadMb).padStart(8),
  String(r.seconds).padStart(6),
].join(' ');
console.log('mode     open  tiles  total      MB  payload       s');
console.log(row(before));
console.log(row(after));
