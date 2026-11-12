// One hyparquet on the page.
//
// The @cnmw packages are built to run with no bundler, so they load
// hyparquet with `import(CDN.hyparquet)` from a pinned jsdelivr URL (their
// design doc §4.2: a bare specifier would not resolve in a zero-build page
// and an inlined copy would blow their size budget). That specifier is
// computed at runtime, so no bundler can rewrite it -- which means inside
// this app the default behaviour would be to fetch a *second* hyparquet,
// version 1.33.0, from the network, next to the 1.26.0 this app already
// bundles for ParquetViewer and the map's GeoParquet layer. Two parsers,
// two module caches, two sets of bytes, no benefit.
//
// So we hand the packages our own modules through their documented
// injection seam, once, before the first read. Both packages have the seam;
// a host with both calls both.
//
// Verified against hyparquet 1.26.0 (see tests/unit/downloadHyparquet.spec.js
// and the notes in .github/DOWNLOAD_WIDGET_NOTES.md):
//   - `geoparquet: false` is honoured. It is not cosmetic and it is not a
//     no-op on this version: 1.26.0 marks a GeoParquet geometry column with
//     a GEOMETRY logical type by default, and download-core needs the raw
//     BYTE_ARRAY so it can decode WKB itself.
//   - `utf8: false` is honoured, so WKB stays a Uint8Array instead of being
//     mangled into a String.
// hyparquet-writer is pinned to the app's hyparquet by a pnpm override, so
// the reader and the writer agree on metadata shapes.

import * as hyparquet from 'hyparquet';
import { compressors } from 'hyparquet-compressors';
import { setHyparquetModules as setDownloadHyparquet } from '@cnmw/download-core';
import { setHyparquetModules as setGeocoderHyparquet } from '@cnmw/geocoder-core';

let writerPromise = null;
let injected = false;

function inject(writer) {
  setDownloadHyparquet({ hyparquet, compressors, writer });
  setGeocoderHyparquet({ hyparquet, compressors });
  injected = true;
}

/**
 * Point the @cnmw packages at this app's hyparquet.
 *
 * @param {{ writer?: boolean }} [options] `writer: true` also loads
 *   hyparquet-writer, which only GeoParquet *output* needs -- it is a
 *   separate ~30 KB that a GeoJSON download should not pay for, so it is
 *   imported on demand.
 */
export async function useAppHyparquet(options = {}) {
  if (!options.writer) {
    if (!injected) {
      inject(undefined);
    }
    return;
  }
  if (!writerPromise) {
    writerPromise = import('hyparquet-writer');
  }
  inject(await writerPromise);
}
