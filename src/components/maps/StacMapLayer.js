import { STACReference } from 'stac-js';
import { PMTiles, SharedPromiseCache } from 'pmtiles';
import { pmtilesProtocol } from './MapMixin.js';
import { resolveRenders, makeRenderTileLoader } from '../../utils/renders.js';
// Import the @developmentseed/geotiff decode worker via Vite's `?worker` suffix
// (not a side-effect `import`): the library declares `sideEffects: false`, so a
// bare re-export gets tree-shaken to an empty worker in production builds. The
// `?worker` form makes the library's worker module the bundle entry, preserving
// its top-level `self.addEventListener` handler. Vite emits it as a separate
// chunk loaded only when a Worker is constructed. See getDecoderPool / vite.config.
import CogDecoderWorker from '@developmentseed/geotiff/pool/worker?worker';
// parquetShared is hyparquet-free, so importing it statically keeps hyparquet
// out of the map bundle (it stays behind the lazy _loadParquetDeps chunk).
import {
  isParquetAsset,
  MAX_MAP_FEATURES,
  MAX_MAP_PARQUET_BYTES,
  VECTOR_NOTICE_ERROR,
  VECTOR_NOTICE_REPROJECTION,
  VECTOR_NOTICE_TOO_BIG,
  VECTOR_NOTICE_TOO_LARGE,
} from '../../utils/parquetShared.js';

const sharedCache = new SharedPromiseCache(300);

// A single DecoderPool shared across COGLayers. We decode tiles off the main
// thread via the bundled CogDecoderWorker so codec decompression doesn't block
// the UI. The library's own `defaultDecoderPool()` can't be used because its
// `new Worker(new URL('./worker.js', import.meta.url))` lives inside the dep and
// Vite can't bundle it (the tiles then hang). If the Worker can't be constructed
// (e.g. no `Worker` global, SSR, older browser) we fall back to a worker-less
// pool that decodes on the main thread.
const DECODER_POOL_SIZE = 4;
let _decoderPool = null;
function getDecoderPool(DecoderPool) {
  if (_decoderPool) {return _decoderPool;}
  try {
    _decoderPool = new DecoderPool({
      size: DECODER_POOL_SIZE,
      createWorker: () => new CogDecoderWorker(),
    });
  } catch (err) {
    console.warn('COG decoder worker unavailable; decoding on the main thread', err);
    _decoderPool = new DecoderPool({});
  }
  return _decoderPool;
}

const STAC_SOURCE = 'stac-footprint';
const STAC_FILL_LAYER = 'stac-footprint-fill';
const STAC_LINE_LAYER = 'stac-footprint-line';
const CHILDREN_SOURCE = 'stac-children';
const CHILDREN_FILL_LAYER = 'stac-children-fill';
const CHILDREN_LINE_LAYER = 'stac-children-line';
const CHILDREN_POINT_LAYER = 'stac-children-point';

const COG_MIME_TYPES = [
  'image/tiff',
  'image/tiff; application=geotiff',
  'image/tiff; application=geotiff; profile=cloud-optimized',
  'image/vnd.stac.geotiff',
  'application/x-geotiff',
];

const PMTILES_MIME_TYPES = [
  'application/vnd.pmtiles',
];

const MVT_MIME_TYPES = [
  'application/vnd.mapbox-vector-tile',
  'application/x-protobuf',
];

function assetHref(asset) {
  return asset.getAbsoluteUrl?.() || asset.href || '';
}

// GeoParquet asset hrefs come straight from untrusted STAC metadata and are
// downloaded whole, so only http(s) is allowed — a `data:` URL would inline
// an arbitrary payload and skip the HEAD size probe entirely. Relative URLs
// are fine: they resolve against the page origin (a fixed base keeps the
// check working where `location` is absent, e.g. unit tests in node).
function isHttpHref(url) {
  try {
    const base = typeof location !== 'undefined' ? location.href : 'http://localhost/';
    const protocol = new URL(url, base).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

// Pick the cheapest COG asset to display. Prefers display-optimized assets:
// the `visual`/`overview` role, Web Mercator (EPSG:3857 → no client reprojection),
// and an 8-bit data type (cheap decode). Higher score wins; ties keep input order.
function pickDisplayAsset(cogAssets) {
  const score = (a) => {
    let s = 0;
    const roles = a.roles || [];
    if (roles.includes('visual')) {s += 8;}
    if (roles.includes('overview')) {s += 4;}
    const code = a['proj:code'] || a.proj_code;
    if (code === 'EPSG:3857') {s += 2;}
    const dtype = (a.bands || [])[0]?.data_type;
    if (dtype === 'uint8') {s += 1;}
    return s;
  };
  return [...cogAssets].sort((a, b) => score(b) - score(a))[0];
}

// A near-global dataset spans most of the world's longitude. At the zoom that
// fits such bounds the web-mercator map repeats horizontally and the full
// latitude range fits the viewport, which locks vertical panning. We detect
// this from the bbox alone (driven by longitude span) so fit() can start a
// couple of zoom levels in instead.
export function isGlobalBbox(bbox) {
  if (!Array.isArray(bbox) || bbox.length < 4) {return false;}
  const lonSpan = Math.abs(bbox[2] - bbox[0]);
  return lonSpan >= 300;
}

function isCogAsset(asset) {
  const type = asset.type || '';
  return COG_MIME_TYPES.some(mt => type.includes(mt));
}

function cogKey(asset) {
  return asset.getKey?.() ?? asset.key;
}

// The layer picker lists at most this many COG overlays. "Show on map" for a
// COG beyond the cap swaps it in, evicting the last (non-active) listed entry.
const COG_LAYER_CAP = 8;

// Normalize a PMTiles source URL for comparison. Strips the `pmtiles://`
// prefix and resolves relative URLs to absolute so that a style source URL
// can be matched against a loaded source's URL regardless of form.
function normalizePmtilesUrl(url) {
  if (typeof url !== 'string' || url === '') {return null;}
  let u = url.startsWith('pmtiles://') ? url.slice('pmtiles://'.length) : url;
  try {
    u = new URL(u, typeof window !== 'undefined' ? window.location.href : undefined).href;
  } catch {
    /* leave as-is if it can't be resolved */
  }
  return u;
}

function isPmtilesAsset(asset) {
  const type = asset.type || '';
  const href = assetHref(asset);
  return PMTILES_MIME_TYPES.some(mt => type.includes(mt)) || href.endsWith('.pmtiles');
}

function isXyzVectorAsset(asset) {
  const type = asset.type || '';
  const href = assetHref(asset);
  if (!href.includes('{z}') || !href.includes('{x}') || !href.includes('{y}')) {return false;}
  return MVT_MIME_TYPES.some(mt => type.includes(mt));
}

function isTileJsonAsset(asset) {
  const type = asset.type || '';
  const roles = Array.isArray(asset.roles) ? asset.roles : [];
  if (!type.startsWith('application/json')) {return false;}
  return roles.includes('tiles');
}

// Feature count declared in STAC metadata (asset first, then its collection/
// item via stac-js getMetadata fallback). Lets the size gate run without
// touching the parquet file at all. Null when nothing is declared.
// `geoparquet:feature_count` is a Portolan-catalog convention (this browser
// is Portolan's STAC Browser fork), not a published STAC extension field;
// the published equivalent is the table extension's `table:row_count`,
// checked as a fallback.
function declaredFeatureCount(asset) {
  const count = asset['geoparquet:feature_count']
    ?? asset['table:row_count']
    ?? asset.getMetadata?.('geoparquet:feature_count')
    ?? asset.getMetadata?.('table:row_count');
  return typeof count === 'number' ? count : null;
}

function declaredFileSize(asset) {
  const size = asset['file:size'] ?? asset.getMetadata?.('file:size');
  return typeof size === 'number' ? size : null;
}

// Prefer TileJSON > XYZ > PMTiles. If a server-rendered tile endpoint exists,
// drop the PMTiles asset so we only load one set of tiles.
function preferredTileAssets(assets) {
  const tilejson = assets.filter(isTileJsonAsset);
  const xyz = assets.filter(isXyzVectorAsset);
  if (tilejson.length > 0 || xyz.length > 0) {
    return [...tilejson, ...xyz];
  }
  return assets.filter(isPmtilesAsset);
}

// The tiles-beat-direct-render policy, defined once for both setAssets and
// autoLoadVisualAssets: when any tile asset exists (ranked TileJSON > XYZ >
// PMTiles by preferredTileAssets), tiles are rendered and GeoParquet direct
// rendering is skipped entirely; GeoParquet is only the no-tiles fallback.
function preferredVisualAssets(assets) {
  const tileAssets = preferredTileAssets(assets);
  const parquetAssets = tileAssets.length > 0 ? [] : assets.filter(isParquetAsset);
  return { tileAssets, parquetAssets };
}

export default class StacMapLayer {
  constructor(map, options = {}) {
    this.map = map;
    this.options = options;
    this.stac = null;
    this.children = null;
    this.assets = null;
    this.layerIds = [];
    this.sourceIds = [];
    this._cogList = [];
    this._cogLayerCache = new Map();
    this._assetsSig = null;
    this._deckOverlay = null;
    this._overlayLayerIds = [];
    this._overlaySourceIds = [];
    this._overlayAssetMeta = [];
    // url → loadGeoJsonFromParquet result, for successful and over-cap
    // results (both deterministic per URL); errors are never cached so a
    // transient failure can be retried. Lives for the lifetime of this layer
    // instance (like _cogLayerCache), so readdAfterStyleChange — which
    // re-runs setAssets on the same instance — re-renders from memory
    // instead of re-downloading and re-decoding the file.
    this._parquetResultCache = new Map();
    // AbortController for the in-flight parquet download, if any. Aborted and
    // dropped when the overlay epoch bumps (_removeOverlayLayers): the epoch
    // check alone is cooperative and would let a superseded multi-MB fetch
    // stream to completion just to be discarded.
    this._parquetAbort = null;
    this._overlayEpoch = 0;
    this._glStyleLayerIds = [];
    this._glStyleSourceIds = [];
    this._activeGlStyle = null;
  }

  setStac(stac) {
    this.stac = stac;
    this._clearLayers();

    if (!stac) {return;}

    const geojson = stac.toGeoJSON();
    if (!geojson) {return;}

    let featureCollection;
    if (geojson.type === 'FeatureCollection') {
      featureCollection = geojson;
    } else if (geojson.type === 'Feature') {
      featureCollection = { type: 'FeatureCollection', features: [geojson] };
    } else {
      featureCollection = { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: geojson, properties: {} }] };
    }

    featureCollection.features = featureCollection.features.filter(f => f.geometry);
    if (featureCollection.features.length === 0) {return;}

    this._addSource(STAC_SOURCE, { type: 'geojson', data: featureCollection });

    this._addLayer({
      id: STAC_FILL_LAYER,
      type: 'fill',
      source: STAC_SOURCE,
      paint: {
        'fill-color': '#4163cc',
        'fill-opacity': 0.1,
      },
    });

    this._addLayer({
      id: STAC_LINE_LAYER,
      type: 'line',
      source: STAC_SOURCE,
      paint: {
        'line-color': '#4163cc',
        'line-width': 2,
      },
    });

  }

  async autoLoadVisualAssets(stac) {
    if (!stac || typeof stac.getAssets !== 'function') {return;}
    const { tileAssets, parquetAssets } = preferredVisualAssets(stac.getAssets());
    const visualAssets = tileAssets.length > 0 ? tileAssets : parquetAssets;
    if (visualAssets.length > 0) {
      await this.setAssets(visualAssets);
    }
  }

  setChildren(children) {
    this.children = children;
    this._removeLayersById([CHILDREN_FILL_LAYER, CHILDREN_LINE_LAYER, CHILDREN_POINT_LAYER]);
    this._removeSourceById(CHILDREN_SOURCE);

    if (!children) {return;}

    const geojson = children.toGeoJSON();
    if (!geojson) {return;}

    const featureCollection = geojson.type === 'FeatureCollection'
      ? geojson
      : { type: 'FeatureCollection', features: [geojson] };

    const items = children.isItemCollection
      ? children.features
      : children.collections;

    for (let i = 0; i < featureCollection.features.length; i++) {
      const feature = featureCollection.features[i];
      if (!feature.properties) {feature.properties = {};}
      feature.properties._stacIndex = i;
      const item = items?.[i];
      if (item) {
        feature.properties._stacId = item.id;
        feature.properties._stacTitle = item.getMetadata?.('title') || item.id;
      }
    }

    featureCollection.features = featureCollection.features.filter(f => f.geometry);
    if (featureCollection.features.length === 0) {return;}

    this._addSource(CHILDREN_SOURCE, { type: 'geojson', data: featureCollection });

    this._addLayer({
      id: CHILDREN_FILL_LAYER,
      type: 'fill',
      source: CHILDREN_SOURCE,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': '#4163cc',
        'fill-opacity': 0.15,
      },
    });

    this._addLayer({
      id: CHILDREN_LINE_LAYER,
      type: 'line',
      source: CHILDREN_SOURCE,
      filter: ['any', ['==', '$type', 'Polygon'], ['==', '$type', 'LineString']],
      paint: {
        'line-color': '#4163cc',
        'line-width': 1.5,
      },
    });

    this._addLayer({
      id: CHILDREN_POINT_LAYER,
      type: 'circle',
      source: CHILDREN_SOURCE,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 4,
        'circle-color': '#4163cc',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1,
      },
    });
  }

  async setAssets(assets) {
    // Idempotent: MapView calls this from both addStacLayer() and the `assets`
    // watcher, which would otherwise tear down and recreate the deck overlay and
    // abort in-flight COG tiles. Skip when the asset set is unchanged.
    const sig = (assets || []).map(a => assetHref(a)).sort().join('|');
    if (sig && sig === this._assetsSig) {return;}

    // The layer owns the vector-fallback notice's full lifecycle: clear it at
    // the start of every real run (synchronously, before any await, so it is
    // current-epoch by construction) and let _addParquetAssets re-emit at the
    // end of the run if this run's assets warrant one. Without this, a stale
    // "too large"/error banner from a previous run would outlive the state it
    // described (e.g. after switching to a tile asset, or after a retry
    // succeeds). Skipped-by-signature calls above never reach this: their
    // previous successful run's notice still describes the current map.
    this.options.onVectorNotice?.(null);

    this.assets = assets;
    this._removeCogLayers();
    this._removeOverlayLayers();

    if (!assets || assets.length === 0) {return;}

    // Captured synchronously, right after this call's own teardown bumped it:
    // any later setAssets teardown bumps it again, marking this run stale.
    // The epoch is re-checked after every awaited stage: a stage's internal
    // stale-epoch bail only exits that stage, so without these checks a
    // superseded run would resume here and keep mutating (e.g. rebuild the
    // COG list from its stale asset set) on top of the newer call's state.
    const epoch = this._overlayEpoch;
    // preferredVisualAssets holds the tiles-beat-direct-render policy:
    // parquetAssets is empty whenever any tile asset exists.
    const { tileAssets, parquetAssets } = preferredVisualAssets(assets);
    await this._addTileAssets(tileAssets, epoch);
    if (epoch !== this._overlayEpoch) {return;}
    const parquetLoaded = await this._addParquetAssets(parquetAssets, epoch);
    if (epoch !== this._overlayEpoch) {return;}
    await this._addCogAssets(assets, epoch);
    if (epoch !== this._overlayEpoch) {return;}

    // Teardown cleared `_assetsSig`; only a still-current run that rendered
    // what it attempted re-records it. A failed load (e.g. a transient 503 on
    // the parquet download) must not cache its signature as success, or an
    // identical retry would no-op on the guard above forever. Partial success
    // counts as loaded: a parquet failure doesn't withhold the signature when
    // a COG overlay still made it onto the map.
    if (parquetLoaded || this._cogList.some(d => d.visible)) {
      this._assetsSig = sig;
    }
  }

  // Lazily load the parquet utilities (hyparquet behind them). Split out as an
  // overridable seam so unit tests can inject a test double, mirroring
  // _loadDeckDeps, and so hyparquet stays out of the map bundle.
  async _loadParquetDeps() {
    return import('../../utils/parquet.js');
  }

  // Render a GeoParquet asset as a MapLibre geojson source with the default
  // vector styling. Gates cheapest-first: STAC-declared feature count and file
  // size (no fetch), then the parquet footer's row count (ranged read), before
  // downloading the whole file. Assets are ranked (`data` role first) and the
  // first one that passes the gates wins — the rest are not downloaded, which
  // bounds the worst case of several large parquet assets on one item to a
  // single whole-file download. Over-cap or failed assets surface a notice via
  // options.onVectorNotice instead of rendering. The callback also receives
  // `null`, fired by setAssets at the start of every run, to clear any notice
  // from a previous run — consumers must treat null as "no notice".
  // Concurrent setAssets calls can interleave across the parquet download
  // (e.g. autoLoadVisualAssets racing the `assets` watcher in MapView). The
  // caller must pass the epoch it captured before its first await; the
  // teardown in a newer call bumps the epoch, and when this run sees a stale
  // epoch after an await it must stop touching the map.
  // Returns whether this run counts as loaded: true when nothing was attempted
  // or an asset rendered, false when every attempted asset failed or was
  // over-cap — so the caller knows not to cache the asset signature.
  async _addParquetAssets(parquetAssets, epoch) {
    if (parquetAssets.length === 0) {return true;}

    // Prefer assets with the `data` role, keeping input order otherwise.
    const sorted = [...parquetAssets].sort((a, b) =>
      Number(b.roles?.includes('data') ?? false) - Number(a.roles?.includes('data') ?? false)
    );

    let rendered = 0;
    let firstNotice = null;
    const notice = (n) => { if (!firstNotice) {firstNotice = { format: 'geoparquet', ...n };} };
    // The hyparquet chunk is loaded at most once per call, lazily: the
    // declared-metadata gates must be able to reject every asset without
    // ever downloading it.
    let deps = null;

    for (let i = 0; i < sorted.length && rendered === 0; i++) {
      const asset = sorted[i];
      const url = assetHref(asset);
      const sourceId = `stac-parquet-${i}`;

      try {
        if (!isHttpHref(url)) {
          console.warn('Refusing non-http(s) GeoParquet asset URL', url);
          notice({ reason: VECTOR_NOTICE_ERROR });
          continue;
        }
        // The STAC-declared gates run before _loadParquetDeps so a rejected
        // asset downloads neither the parquet file nor the hyparquet chunk.
        // They are cheap early-outs only; the authoritative bounds on actual
        // byte length and row count live in loadGeoJsonFromParquet.
        const count = declaredFeatureCount(asset);
        if (count !== null && count > MAX_MAP_FEATURES) {
          notice({ reason: VECTOR_NOTICE_TOO_LARGE, totalRows: count, max: MAX_MAP_FEATURES });
          continue;
        }
        const size = declaredFileSize(asset);
        if (size !== null && size > MAX_MAP_PARQUET_BYTES) {
          notice({ reason: VECTOR_NOTICE_TOO_BIG, byteLength: size, maxBytes: MAX_MAP_PARQUET_BYTES });
          continue;
        }

        // Consult the instance cache before downloading anything (or even
        // loading the hyparquet chunk): a basemap switch re-runs setAssets
        // with the same URLs and must not re-fetch the file.
        let result = this._parquetResultCache.get(url);
        // Only a fresh load should report dropped features: a basemap switch
        // re-runs setAssets against the cache, and re-warning there would
        // repeat the same message for every toggle.
        const firstLoad = !result;
        if (!result) {
          if (!deps) {deps = await this._loadParquetDeps();}
          const controller = new AbortController();
          this._parquetAbort = controller;
          result = await deps.loadGeoJsonFromParquet(url, { signal: controller.signal });
          // Cache successful and over-cap results alike — both are
          // deterministic for a given URL. Errors throw past this line and
          // are never cached, so transient failures stay retryable.
          this._parquetResultCache.set(url, result);
        }
        if (epoch !== this._overlayEpoch) {return false;}
        if (result.exceeded) {
          if (result.reason === VECTOR_NOTICE_TOO_BIG) {
            notice({ reason: VECTOR_NOTICE_TOO_BIG, byteLength: result.byteLength, maxBytes: MAX_MAP_PARQUET_BYTES });
          } else {
            notice({ reason: VECTOR_NOTICE_TOO_LARGE, totalRows: result.totalRows, max: MAX_MAP_FEATURES });
          }
          continue;
        }
        if (result.droppedFeatures) {
          // Reprojection put these outside the transform's usable domain, so
          // either the coordinates fall outside the declared CRS's area of use
          // or the declared CRS is wrong for the file. Drawing them would
          // streak shapes across the map rather than fail visibly.
          if (firstLoad) {
            console.warn(
              `Dropped ${result.droppedFeatures} feature(s) from ${url} that could not be reprojected from ${result.reprojectedFrom}`
            );
          }
          if (result.featureCollection.features.length === 0) {
            // Nothing survived — an empty source renders a blank map with no
            // explanation, so surface it as a failure instead. This is not a
            // load error: the file downloaded and parsed fine, so it gets its
            // own reason rather than the generic one.
            notice({ reason: VECTOR_NOTICE_REPROJECTION, crs: result.reprojectedFrom });
            continue;
          }
        }

        this._overlayAssetMeta.push({
          title: asset.title || asset.getKey?.() || asset.key || `GeoParquet ${i + 1}`,
          sourceId,
        });
        this._addOverlaySource(sourceId, { type: 'geojson', data: result.featureCollection });
        this._addDefaultVectorLayers(sourceId, [], { useSourceLayer: false });
        rendered++;
      } catch (err) {
        if (err?.name === 'AbortError') {
          // A newer setAssets (or teardown) aborted this run's download —
          // the run is superseded, so bail silently: no warn, no notice.
          return false;
        }
        console.warn('Failed to render GeoParquet asset', url, err);
        notice({ reason: VECTOR_NOTICE_ERROR });
      }
    }

    if (rendered === 0 && firstNotice && epoch === this._overlayEpoch) {
      this.options.onVectorNotice?.(firstNotice);
    }
    return rendered > 0;
  }

  // Concurrent setAssets calls can interleave across the awaits below (the
  // TileJSON fetch, PMTiles header/metadata reads). Mirrors _addParquetAssets:
  // the caller passes the epoch it captured, and after every await this run
  // must bail before touching meta/sources/layers if a newer setAssets has
  // torn it down — a stale remove-then-add would otherwise clobber the newer
  // call's sources and push duplicate layer ids.
  async _addTileAssets(assets, epoch) {
    for (let i = 0; i < assets.length; i++) {
      // A previous iteration's await may have handed control to a newer call.
      if (epoch !== this._overlayEpoch) {return;}
      const asset = assets[i];
      const url = assetHref(asset);
      const sourceId = `stac-tile-${i}`;

      this._overlayAssetMeta.push({
        title: asset.title || asset.getKey?.() || asset.key || `Tiles ${i + 1}`,
        sourceId,
      });

      try {
        if (isTileJsonAsset(asset)) {
          await this._addTileJsonSource(url, sourceId, epoch);
        } else if (isXyzVectorAsset(asset)) {
          this._addXyzVectorSource(url, sourceId, asset);
        } else if (isPmtilesAsset(asset)) {
          const pm = new PMTiles(url, sharedCache);
          pmtilesProtocol.add(pm);
          const header = await pm.getHeader();
          if (epoch !== this._overlayEpoch) {return;}

          if (header.tileType === 1) {
            await this._addVectorPmtiles(pm, url, sourceId, epoch);
          } else {
            this._addRasterPmtiles(url, sourceId);
          }
        }
      } catch (err) {
        console.warn('Failed to add tile asset', url, err);
      }
    }
  }

  async _addTileJsonSource(url, sourceId, epoch) {
    this._addOverlaySource(sourceId, { type: 'vector', url });

    let layerNames = [];
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        const tj = await resp.json();
        if (Array.isArray(tj.vector_layers)) {
          layerNames = tj.vector_layers.map(l => l.id);
        }
      }
    } catch {
      /* TileJSON metadata may be unavailable; fall back to default layer */
    }
    if (epoch !== this._overlayEpoch) {return;}

    this._addDefaultVectorLayers(sourceId, layerNames);
  }

  _addXyzVectorSource(url, sourceId, asset) {
    const spec = { type: 'vector', tiles: [url] };
    if (typeof asset.minzoom === 'number') {spec.minzoom = asset.minzoom;}
    if (typeof asset.maxzoom === 'number') {spec.maxzoom = asset.maxzoom;}
    this._addOverlaySource(sourceId, spec);

    this._addDefaultVectorLayers(sourceId, []);
  }

  async _addVectorPmtiles(pm, url, sourceId, epoch) {
    this._addOverlaySource(sourceId, {
      type: 'vector',
      url: `pmtiles://${url}`,
    });

    let layerNames = [];
    try {
      const metadata = await pm.getMetadata();
      if (metadata.vector_layers && metadata.vector_layers.length > 0) {
        layerNames = metadata.vector_layers.map(l => l.id);
      }
    } catch {
      /* metadata may not be available */
    }
    if (epoch !== this._overlayEpoch) {return;}

    this._addDefaultVectorLayers(sourceId, layerNames);
  }

  // `useSourceLayer: false` is for geojson sources, which have no source
  // layers — MapLibre rejects a `source-layer` key on them.
  _addDefaultVectorLayers(sourceId, layerNames, { useSourceLayer = true } = {}) {
    const names = layerNames.length > 0 ? layerNames : ['default'];
    const colors = ['#4163cc', '#cc6341', '#41cc63', '#cc41a8', '#ccb341'];

    for (let j = 0; j < names.length; j++) {
      const sourceLayer = names[j];
      const color = colors[j % colors.length];
      const fillLayerId = `${sourceId}-${sourceLayer}-fill`;
      const lineLayerId = `${sourceId}-${sourceLayer}-line`;
      const pointLayerId = `${sourceId}-${sourceLayer}-point`;
      const sourceLayerSpec = useSourceLayer ? { 'source-layer': sourceLayer } : {};

      this.map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        ...sourceLayerSpec,
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': color,
          'fill-opacity': 0.3,
        },
      });
      this._overlayLayerIds.push(fillLayerId);

      this.map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        ...sourceLayerSpec,
        filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
        paint: {
          'line-color': color,
          'line-width': 1,
        },
      });
      this._overlayLayerIds.push(lineLayerId);

      this.map.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        ...sourceLayerSpec,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 3,
          'circle-color': color,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 0.5,
        },
      });
      this._overlayLayerIds.push(pointLayerId);
    }
  }

  _addRasterPmtiles(url, sourceId) {
    this._addOverlaySource(sourceId, {
      type: 'raster',
      url: `pmtiles://${url}`,
      tileSize: 256,
    });

    const layerId = `${sourceId}-raster`;
    this.map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
    });
    this._overlayLayerIds.push(layerId);
  }

  // All COG assets of the current item — the full set the layer picker draws
  // from, independent of which one is selected/active.
  _collectCogAssets() {
    const all = typeof this.stac?.getAssets === 'function'
      ? this.stac.getAssets()
      : (this.assets || []);
    return all.filter(isCogAsset);
  }

  async _addCogAssets(assets, epoch) {
    const allCogs = this._collectCogAssets();
    if (allCogs.length === 0) {
      this._cogList = [];
      await this._syncCogLayers(epoch);
      return;
    }

    // STAC render extension: each render names a colormap/rescale + the asset(s)
    // it applies to. Renders are used only for the colormap. `assets` carries the
    // selection ("show on map"); when none is a COG we default to the
    // display-optimized asset.
    const renders = resolveRenders(this.stac);
    const activeCogs = (assets || []).filter(isCogAsset);
    const active = activeCogs.length ? activeCogs : [pickDisplayAsset(allCogs)];

    this._cogList = this._buildCogList(allCogs, active, renders);
    await this._syncCogLayers(epoch);
  }

  // Build the capped, ordered list of COG descriptors. Item order is preserved;
  // active assets are always kept; remaining slots fill with other COGs in order
  // until COG_LAYER_CAP, dropping trailing ("last") entries. `visible` mirrors
  // the active set, so re-selecting a single asset solos it.
  _buildCogList(allCogs, activeAssets, renders) {
    const activeKeys = new Set(activeAssets.map(cogKey));
    const kept = [];
    let othersBudget = COG_LAYER_CAP - activeKeys.size;
    for (const asset of allCogs) {
      if (kept.length >= COG_LAYER_CAP) {break;}
      if (activeKeys.has(cogKey(asset))) {
        kept.push(asset);
      } else if (othersBudget > 0) {
        kept.push(asset);
        othersBudget--;
      }
    }
    return kept.map(asset => {
      const key = cogKey(asset);
      const resolved = this._resolveCogRender(asset, renders);
      return {
        id: key,
        asset,
        title: resolved.title || asset.title || key,
        render: resolved.render,
        visible: activeKeys.has(key),
      };
    });
  }

  /**
   * Resolve which render (colormap/rescale) to apply to a display asset. Uses a
   * render that explicitly targets the asset; otherwise synthesises one from the
   * item's first render, stretched to the asset's own band statistics so an 8-bit
   * `visual` asset matches the colours of its full-resolution source.
   *
   * "First render" means the first in the render extension's declaration order
   * (`renders` is a JSON object whose key order is preserved through parsing).
   * This is deterministic for a given document; multi-render items where no
   * render targets the display asset fall back to that first declared render.
   */
  _resolveCogRender(asset, renders) {
    const key = cogKey(asset);
    const entries = Object.entries(renders);
    const direct = entries.find(([, r]) => (r.assets || []).includes(key));
    if (direct) {
      return { id: direct[0], asset, render: direct[1], title: direct[1].title || direct[0] };
    }
    const first = entries[0]?.[1];
    if (first) {
      const band0 = (asset.bands || [])[0] || {};
      const min = band0.statistics?.minimum ?? 0;
      const max = band0.statistics?.maximum ?? 255;
      // Drop both the source render's "empty" sentinel (e.g. 0) and the display
      // asset's own physical no-data, so a rescaled 8-bit visual matches the
      // full-res render (otherwise empty cells colour as the ramp's low end).
      const nodata = [...new Set([first.nodata, band0.nodata].flat().filter(v => v != null))];
      const render = {
        colormap_name: first.colormap_name,
        colormap: first.colormap,
        rescale: [[min, max]],
        nodata,
        bidx: [1],
      };
      return { id: null, asset, render, title: asset.title || key };
    }
    return { id: null, asset, render: null, title: asset.title || key };
  }

  // Lazily load the deck.gl backend (overlay + COG layer + decoder pool). Split
  // out as an overridable seam so unit tests can inject a test double and
  // exercise the reconciliation below without WebGL.
  async _loadDeckDeps() {
    const [{ MapboxOverlay }, { COGLayer }, { DecoderPool }] = await Promise.all([
      import('@deck.gl/mapbox'),
      import('@developmentseed/deck.gl-geotiff'),
      import('@developmentseed/geotiff'),
    ]);
    return { MapboxOverlay, COGLayer, DecoderPool };
  }

  // Reconcile the deck.gl overlay with `_cogList`: one COGLayer per visible
  // descriptor, reusing cached instances so toggling one COG doesn't abort
  // another's in-flight tiles. Off descriptors stay in the picker but aren't
  // rendered (lazy), so listing 8 COGs only decodes the ones turned on.
  // Loading the deck backend is async; the caller-captured epoch (same
  // contract as _addParquetAssets) stops a superseded run from repointing a
  // newer call's overlay at its stale layer set.
  // The epoch default exists for genuine non-setAssets callers (setCogVisible
  // toggling a COG from the layer picker): they run outside any teardown, so
  // the current epoch is the correct one by definition. setAssets-driven
  // paths must always pass their captured epoch explicitly.
  async _syncCogLayers(epoch = this._overlayEpoch) {
    // A deck overlay needs a map that can host a control. Tests exercise the
    // reconciliation by supplying such a map plus an injected `_loadDeckDeps`.
    if (!this.map || typeof this.map.addControl !== 'function') {return;}

    const visible = this._cogList.filter(d => d.visible);
    if (visible.length === 0) {
      if (this._deckOverlay) {
        try { this.map.removeControl(this._deckOverlay); } catch { /* already removed */ }
        this._deckOverlay = null;
      }
      this._cogLayerCache.clear();
      return;
    }

    try {
      const { MapboxOverlay, COGLayer, DecoderPool } = await this._loadDeckDeps();
      if (epoch !== this._overlayEpoch) {return;}

      // Drop cached layers no longer listed (e.g. evicted by the cap).
      const liveIds = new Set(this._cogList.map(d => d.id));
      for (const id of [...this._cogLayerCache.keys()]) {
        if (!liveIds.has(id)) {this._cogLayerCache.delete(id);}
      }

      const layers = visible.map(d => {
        let layer = this._cogLayerCache.get(d.id);
        if (!layer) {
          layer = this._makeCogLayer(d, COGLayer, DecoderPool);
          this._cogLayerCache.set(d.id, layer);
        }
        return layer;
      });

      if (this._deckOverlay) {
        this._deckOverlay.setProps({ layers });
      } else {
        this._deckOverlay = new MapboxOverlay({ interleaved: false, layers });
        this.map.addControl(this._deckOverlay);
      }
    } catch (err) {
      console.warn('Failed to load COG layer via deck.gl', err);
    }
  }

  _makeCogLayer(descriptor, COGLayer, DecoderPool) {
    const { asset, render } = descriptor;
    const url = asset.getAbsoluteUrl?.() || asset.href;
    const props = {
      id: `stac-cog-${descriptor.id}`,
      geotiff: url,
      // Off-main-thread codec decode via a first-party worker pool (see
      // getDecoderPool). The CPU colormap loop in makeRenderTileLoader still runs
      // on the main thread, so it stays bounded there (see renders.js).
      pool: getDecoderPool(DecoderPool),
      opacity: 0.9,
      // Keep the best-available coarser tiles visible until the finer level has
      // decoded, rather than blanking the area while decode is in flight.
      refinementStrategy: 'best-available',
      // Bound tile-fetch concurrency per layer so a viewport change across
      // several visible COGs doesn't flood the decoder pool.
      maxRequests: 4,
      // Bound cache by bytes, not tile count: a few large-tile COGs would blow a
      // count-based budget. ~64 MB of decoded RGBA per layer.
      maxCacheByteSize: 64 * 1024 * 1024,
    };
    if (render) {
      const { getTileData, renderTile } = makeRenderTileLoader(render);
      props.getTileData = getTileData;
      props.renderTile = renderTile;
    }
    return new COGLayer(props);
  }

  fit(padding = { top: 160, bottom: 50, left: 50, right: 50 }) {
    if (!this.stac || !this.map) {return;}
    const bbox = this.stac.getBoundingBox();
    if (!bbox || bbox.length < 4) {return;}
    const bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];

    // For global/near-global data, fitBounds lands at z0–1 where the world
    // repeats and vertical panning is locked. Start 2 levels in: compute the
    // fit camera and jump there with a higher zoom.
    if (isGlobalBbox(bbox) && typeof this.map.cameraForBounds === 'function') {
      const cam = this.map.cameraForBounds(bounds, { padding });
      if (cam && cam.center) {
        // Center on the geographic midpoint of the bbox. cameraForBounds'
        // own center sits far north because web-mercator stretches high
        // latitudes, which leaves the view looking too northern.
        const center = [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
        this.map.jumpTo({
          center,
          zoom: Math.min((cam.zoom ?? 0) + 2, 16),
        });
        return;
      }
    }

    this.map.fitBounds(bounds, { padding, maxZoom: 16 });
  }

  isEmpty() {
    return this.layerIds.length === 0 && this._cogList.length === 0 && this._overlayLayerIds.length === 0;
  }

  getChildrenLayerIds() {
    return [CHILDREN_FILL_LAYER, CHILDREN_LINE_LAYER, CHILDREN_POINT_LAYER].filter(id =>
      this.layerIds.includes(id)
    );
  }

  getFootprintLayerIds() {
    return [STAC_FILL_LAYER, STAC_LINE_LAYER].filter(id =>
      this.layerIds.includes(id)
    );
  }

  getAllOverlayLayerIds() {
    return [...this.getFootprintLayerIds(), ...this.getChildrenLayerIds(), ...this._overlayLayerIds];
  }

  getAssetOverlays() {
    const overlays = [];
    for (let i = 0; i < this._overlayAssetMeta.length; i++) {
      const meta = this._overlayAssetMeta[i];
      // The trailing '-' stops e.g. `stac-parquet-1` from also matching
      // `stac-parquet-10-*` layer ids.
      const layerIds = this._overlayLayerIds.filter(id => id.startsWith(meta.sourceId + '-'));
      if (layerIds.length > 0) {
        const vis = this.map?.getLayoutProperty(layerIds[0], 'visibility');
        overlays.push({
          id: meta.sourceId,
          title: meta.title,
          type: 'maplibre',
          visible: vis !== 'none',
          layerIds,
        });
      }
    }
    for (const d of this._cogList) {
      overlays.push({
        id: d.id,
        title: d.title || d.id,
        type: 'deckgl',
        visible: d.visible,
      });
    }
    return overlays;
  }

  setCogVisible(id, visible) {
    const descriptor = this._cogList.find(d => d.id === id);
    if (!descriptor || descriptor.visible === visible) {return;}
    descriptor.visible = visible;
    return this._syncCogLayers();
  }

  setFootprintVisible(visible) {
    const val = visible ? 'visible' : 'none';
    for (const id of this.getFootprintLayerIds()) {
      if (this.map.getLayer(id)) {
        this.map.setLayoutProperty(id, 'visibility', val);
      }
    }
  }

  getVisibleStacReferences() {
    if (!this.children) {return [];}
    const items = this.children.isItemCollection
      ? this.children.features
      : this.children.collections;
    if (!items) {return [];}
    return items.filter(item => item instanceof STACReference);
  }

  remove() {
    this._clearLayers();
    this._removeCogLayers();
    this._removeOverlayLayers();
    // The instance is done for; release the decoded FeatureCollections.
    this._parquetResultCache.clear();
  }

  async readdAfterStyleChange() {
    const { stac, children, assets, _activeGlStyle } = this;
    // A basemap/style change may leave some of our sources and layers behind
    // (MapLibre's setStyle does not always wipe imperatively-added sources).
    // Tear them down through the removal helpers, which both delete the map
    // objects and reset the id-tracking arrays. We must NOT zero those arrays
    // first: the helpers iterate them to know what to remove, so clearing them
    // early leaks the sources and makes the re-add throw "source already
    // exists" (e.g. stac-tile-0 for PMTiles assets).
    // _removeCogLayers() clears the setAssets idempotency signature, so the
    // upcoming setAssets() rebuilds from scratch rather than no-opping on the
    // unchanged asset set (which would leave layers gone — issue #13 regression).
    this._clearLayers();
    this._removeCogLayers();
    this._removeOverlayLayers();
    if (stac) {this.setStac(stac);}
    if (children) {this.setChildren(children);}
    if (assets) {
      await this.setAssets(assets);
    } else if (stac) {
      await this.autoLoadVisualAssets(stac);
    }
    if (_activeGlStyle) {this.applyGlStyle(_activeGlStyle);}
  }

  _addSource(id, spec) {
    if (this.map.getSource(id)) {
      const style = this.map.getStyle();
      if (style?.layers) {
        for (const layer of style.layers) {
          if (layer.source === id) {
            this.map.removeLayer(layer.id);
          }
        }
      }
      this.map.removeSource(id);
    }
    this.map.addSource(id, spec);
    if (!this.sourceIds.includes(id)) {this.sourceIds.push(id);}
  }

  _addLayer(spec) {
    if (this.map.getLayer(spec.id)) {
      this.map.removeLayer(spec.id);
    }
    this.map.addLayer(spec);
    if (!this.layerIds.includes(spec.id)) {this.layerIds.push(spec.id);}
  }

  // Guarded add for tile (PMTiles/TileJSON/XYZ/raster) sources. Like
  // _addSource, but tracks into _overlaySourceIds. Removing any pre-existing
  // source (and its layers) first means a re-add after a style change can
  // never throw "source already exists".
  _addOverlaySource(id, spec) {
    if (this.map.getSource(id)) {
      const style = this.map.getStyle();
      if (style?.layers) {
        for (const layer of style.layers) {
          if (layer.source === id) {
            try { this.map.removeLayer(layer.id); } catch { /* ignore */ }
          }
        }
      }
      try { this.map.removeSource(id); } catch { /* ignore */ }
    }
    this.map.addSource(id, spec);
    if (!this._overlaySourceIds.includes(id)) {this._overlaySourceIds.push(id);}
  }

  _removeLayersById(ids) {
    for (const id of ids) {
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id);
      }
      this.layerIds = this.layerIds.filter(lid => lid !== id);
    }
  }

  _removeSourceById(id) {
    if (this.map.getSource(id)) {
      this.map.removeSource(id);
    }
    this.sourceIds = this.sourceIds.filter(sid => sid !== id);
  }

  _clearLayers() {
    for (const id of [...this.layerIds]) {
      if (this.map.getLayer(id)) {
        this.map.removeLayer(id);
      }
    }
    for (const id of [...this.sourceIds]) {
      if (this.map.getSource(id)) {
        this.map.removeSource(id);
      }
    }
    this.layerIds = [];
    this.sourceIds = [];
  }

  _removeCogLayers() {
    if (this._deckOverlay && this.map) {
      try { this.map.removeControl(this._deckOverlay); } catch { /* already removed */ }
      this._deckOverlay = null;
    }
    this._cogList = [];
    this._cogLayerCache.clear();
    // Invalidate the setAssets idempotency signature here so every teardown path
    // (setAssets, remove, readdAfterStyleChange) forces the next setAssets to
    // rebuild. A successful setAssets run re-records the signature at its end;
    // failed runs leave it cleared so an identical retry actually retries.
    this._assetsSig = null;
  }

  _removeOverlayLayers() {
    // Invalidate in-flight async adds (e.g. a GeoParquet download): they check
    // the epoch after each await and bail if a newer setAssets has taken over,
    // instead of pushing duplicate meta/layers on top of the new state.
    this._overlayEpoch++;
    // The epoch check is cooperative; also abort the superseded run's parquet
    // download outright so it stops consuming bandwidth immediately. The
    // aborted run's fetch rejects with AbortError, which _addParquetAssets
    // swallows silently.
    if (this._parquetAbort) {
      this._parquetAbort.abort();
      this._parquetAbort = null;
    }
    this._clearOverlayLayers();
    for (const id of [...this._overlaySourceIds]) {
      try { if (this.map.getSource(id)) {this.map.removeSource(id);} } catch { /* ignore */ }
    }
    this._overlaySourceIds = [];
    this._overlayAssetMeta = [];
  }

  // `keepSourceIds` (a Set) preserves layers bound to those sources — used by
  // applyGlStyle so the parquet fallback's default geojson layers survive
  // style application instead of being cleared and never re-added.
  _clearOverlayLayers(keepSourceIds = null) {
    const kept = [];
    for (const id of [...this._overlayLayerIds]) {
      let source;
      try { source = this.map.getLayer(id)?.source; } catch { source = undefined; }
      if (keepSourceIds && source && keepSourceIds.has(source)) {
        kept.push(id);
        continue;
      }
      try { if (this.map.getLayer(id)) {this.map.removeLayer(id);} } catch { /* ignore */ }
    }
    this._overlayLayerIds = kept;
    this._clearGlStyleExtras();
  }

  _clearGlStyleExtras() {
    for (const id of [...this._glStyleLayerIds]) {
      try { if (this.map.getLayer(id)) {this.map.removeLayer(id);} } catch { /* ignore */ }
    }
    this._glStyleLayerIds = [];
    for (const id of [...this._glStyleSourceIds]) {
      try { if (this.map.getSource(id)) {this.map.removeSource(id);} } catch { /* ignore */ }
    }
    this._glStyleSourceIds = [];
  }

  applyGlStyle(glStyle) {
    if (!glStyle || !glStyle.layers) {return;}

    // GeoParquet fallback sources are geojson and must not become candidates
    // for style source mapping: styles are authored against tile sources, and
    // their layers carry `source-layer`, which MapLibre rejects on a geojson
    // source — binding them would blank the map. Those sources keep their
    // default vector layers instead.
    const geojsonSourceIds = new Set(
      this._overlaySourceIds.filter(id => this.map.getSource(id)?.type === 'geojson')
    );

    this._clearOverlayLayers(geojsonSourceIds);

    const sources = glStyle.sources || {};
    const styleSourceNames = Object.keys(sources);

    // Add non-PMTiles sources (currently geojson) directly. PMTiles sources
    // in the style are matched positionally to the loaded PMTiles sources.
    const directSourceIds = new Set();
    const pmtilesStyleSourceNames = [];
    for (const name of styleSourceNames) {
      const src = sources[name];
      if (src && src.type === 'geojson') {
        try {
          this.map.addSource(name, src);
          this._glStyleSourceIds.push(name);
          directSourceIds.add(name);
        } catch (err) {
          console.warn(`Failed to add geojson source "${name}" from style`, err);
        }
      } else {
        pmtilesStyleSourceNames.push(name);
      }
    }

    const mappableSourceIds = this._overlaySourceIds.filter(id => !geojsonSourceIds.has(id));
    if (pmtilesStyleSourceNames.length > 0 && pmtilesStyleSourceNames.length !== mappableSourceIds.length) {
      console.warn(`Style defines ${pmtilesStyleSourceNames.length} PMTiles-style source(s) but ${mappableSourceIds.length} PMTiles source(s) are loaded — mapping by position`);
    }

    // Build a lookup from each loaded PMTiles source's underlying URL to its
    // source ID, so style sources can be matched by URL when they specify one.
    const loadedUrlToSourceId = {};
    for (const sourceId of mappableSourceIds) {
      const loaded = this.map.getSource(sourceId);
      const norm = normalizePmtilesUrl(loaded && loaded.url);
      if (norm) {loadedUrlToSourceId[norm] = sourceId;}
    }

    // Match style sources to loaded sources by URL first, falling back to
    // positional mapping for sources that don't carry a matching URL. This
    // matters when an item has multiple PMTiles assets and a style references
    // a specific one by its pmtiles:// URL.
    const sourceMapping = {};
    const usedSourceIds = new Set();
    const unmatchedStyleNames = [];
    for (const name of pmtilesStyleSourceNames) {
      const norm = normalizePmtilesUrl(sources[name] && sources[name].url);
      const matched = norm ? loadedUrlToSourceId[norm] : undefined;
      if (matched) {
        sourceMapping[name] = matched;
        usedSourceIds.add(matched);
      } else {
        unmatchedStyleNames.push(name);
      }
    }
    const remainingSourceIds = mappableSourceIds.filter(id => !usedSourceIds.has(id));
    for (let i = 0; i < unmatchedStyleNames.length; i++) {
      if (i < remainingSourceIds.length) {
        sourceMapping[unmatchedStyleNames[i]] = remainingSourceIds[i];
      }
    }

    for (const layer of glStyle.layers) {
      let layerSpec;
      if (directSourceIds.has(layer.source)) {
        layerSpec = { ...layer };
      } else {
        const mappedSource = sourceMapping[layer.source];
        if (!mappedSource) {continue;}
        layerSpec = { ...layer, source: mappedSource };
      }

      if (this.map.getLayer(layerSpec.id)) {
        this.map.removeLayer(layerSpec.id);
      }
      this.map.addLayer(layerSpec);
      if (directSourceIds.has(layer.source)) {
        this._glStyleLayerIds.push(layerSpec.id);
      } else {
        this._overlayLayerIds.push(layerSpec.id);
      }
    }

    this._activeGlStyle = glStyle;
  }

}
