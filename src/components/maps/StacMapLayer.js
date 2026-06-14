import { STACReference } from 'stac-js';
import { PMTiles, SharedPromiseCache } from 'pmtiles';
import { pmtilesProtocol } from './MapMixin.js';
import { resolveRenders, makeRenderTileLoader } from '../../utils/renders.js';

const sharedCache = new SharedPromiseCache(300);

// A single worker-less DecoderPool, shared across COGLayers. Passing `{}` (no
// `createWorker`) makes the library decode tiles on the main thread instead of
// spawning a worker it can't load under Vite. See `_makeCogLayer`.
let _mainThreadPool = null;
function getMainThreadPool(DecoderPool) {
  if (!_mainThreadPool) {_mainThreadPool = new DecoderPool({});}
  return _mainThreadPool;
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

function isTileAsset(asset) {
  return isTileJsonAsset(asset) || isXyzVectorAsset(asset) || isPmtilesAsset(asset);
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
    this._cogRenderOptions = [];
    this._activeRenderId = null;
    this._assetsSig = null;
    this._deckOverlay = null;
    this._pmtilesLayerIds = [];
    this._pmtilesSourceIds = [];
    this._pmtilesAssetMeta = [];
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
    const visualAssets = stac.getAssets().filter(isTileAsset);
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
    this._assetsSig = sig;

    this.assets = assets;
    this._removeCogLayers();
    this._removePmtilesLayers();

    if (!assets || assets.length === 0) {return;}

    await this._addTileAssets(preferredTileAssets(assets));
    await this._addCogAssets(assets);
  }

  async _addTileAssets(assets) {
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const url = assetHref(asset);
      const sourceId = `stac-tile-${i}`;

      this._pmtilesAssetMeta.push({
        title: asset.title || asset.key || `Tiles ${i + 1}`,
        sourceId,
      });

      try {
        if (isTileJsonAsset(asset)) {
          await this._addTileJsonSource(url, sourceId);
        } else if (isXyzVectorAsset(asset)) {
          this._addXyzVectorSource(url, sourceId, asset);
        } else if (isPmtilesAsset(asset)) {
          const pm = new PMTiles(url, sharedCache);
          pmtilesProtocol.add(pm);
          const header = await pm.getHeader();

          if (header.tileType === 1) {
            await this._addVectorPmtiles(pm, url, sourceId);
          } else {
            this._addRasterPmtiles(url, sourceId);
          }
        }
      } catch (err) {
        console.warn(`Failed to add tile asset ${url}`, err);
      }
    }
  }

  async _addTileJsonSource(url, sourceId) {
    this._addPmtilesSource(sourceId, { type: 'vector', url });

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

    this._addDefaultVectorLayers(sourceId, layerNames);
  }

  _addXyzVectorSource(url, sourceId, asset) {
    const spec = { type: 'vector', tiles: [url] };
    if (typeof asset.minzoom === 'number') {spec.minzoom = asset.minzoom;}
    if (typeof asset.maxzoom === 'number') {spec.maxzoom = asset.maxzoom;}
    this._addPmtilesSource(sourceId, spec);

    this._addDefaultVectorLayers(sourceId, []);
  }

  async _addVectorPmtiles(pm, url, sourceId) {
    this._addPmtilesSource(sourceId, {
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

    this._addDefaultVectorLayers(sourceId, layerNames);
  }

  _addDefaultVectorLayers(sourceId, layerNames) {
    const names = layerNames.length > 0 ? layerNames : ['default'];
    const colors = ['#4163cc', '#cc6341', '#41cc63', '#cc41a8', '#ccb341'];

    for (let j = 0; j < names.length; j++) {
      const sourceLayer = names[j];
      const color = colors[j % colors.length];
      const fillLayerId = `${sourceId}-${sourceLayer}-fill`;
      const lineLayerId = `${sourceId}-${sourceLayer}-line`;
      const pointLayerId = `${sourceId}-${sourceLayer}-point`;

      this.map.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        'source-layer': sourceLayer,
        filter: ['==', '$type', 'Polygon'],
        paint: {
          'fill-color': color,
          'fill-opacity': 0.3,
        },
      });
      this._pmtilesLayerIds.push(fillLayerId);

      this.map.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        'source-layer': sourceLayer,
        filter: ['any', ['==', '$type', 'LineString'], ['==', '$type', 'Polygon']],
        paint: {
          'line-color': color,
          'line-width': 1,
        },
      });
      this._pmtilesLayerIds.push(lineLayerId);

      this.map.addLayer({
        id: pointLayerId,
        type: 'circle',
        source: sourceId,
        'source-layer': sourceLayer,
        filter: ['==', '$type', 'Point'],
        paint: {
          'circle-radius': 3,
          'circle-color': color,
          'circle-stroke-color': '#fff',
          'circle-stroke-width': 0.5,
        },
      });
      this._pmtilesLayerIds.push(pointLayerId);
    }
  }

  _addRasterPmtiles(url, sourceId) {
    this._addPmtilesSource(sourceId, {
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
    this._pmtilesLayerIds.push(layerId);
  }

  // All COG assets of the current item — the full set the layer picker draws
  // from, independent of which one is selected/active.
  _collectCogAssets() {
    const all = typeof this.stac?.getAssets === 'function'
      ? this.stac.getAssets()
      : (this.assets || []);
    return all.filter(isCogAsset);
  }

  async _addCogAssets(assets) {
    const allCogs = this._collectCogAssets();
    if (allCogs.length === 0) {
      this._cogList = [];
      await this._syncCogLayers();
      return;
    }

    // STAC render extension: each render names a colormap/rescale + the asset(s)
    // it applies to. Renders are used only for the colormap; the picker lists
    // named renders. `assets` carries the selection ("show on map"); when none
    // is a COG we default to the display-optimized asset.
    const renders = resolveRenders(this.stac);
    this._cogRenderOptions = Object.entries(renders)
      .map(([id, render]) => ({ id, title: render.title || id, render }));
    this._activeRenderId = null;

    const activeCogs = (assets || []).filter(isCogAsset);
    const active = activeCogs.length ? activeCogs : [pickDisplayAsset(allCogs)];

    this._cogList = this._buildCogList(allCogs, active, renders);
    await this._syncCogLayers();
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
   */
  _resolveCogRender(asset, renders) {
    const key = asset.getKey();
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

  // Reconcile the deck.gl overlay with `_cogList`: one COGLayer per visible
  // descriptor, reusing cached instances so toggling one COG doesn't abort
  // another's in-flight tiles. Off descriptors stay in the picker but aren't
  // rendered (lazy), so listing 8 COGs only decodes the ones turned on.
  async _syncCogLayers() {
    // No deck.gl/WebGL under unit tests (the fake map has no addControl); the
    // `_cogList` state is what the layer picker reads, so skip rendering.
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
      const [{ MapboxOverlay }, { COGLayer }, { DecoderPool }] = await Promise.all([
        import('@deck.gl/mapbox'),
        import('@developmentseed/deck.gl-geotiff'),
        import('@developmentseed/geotiff'),
      ]);

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
      // Decode on the main thread. The library's default pool spawns a worker
      // via `new Worker(new URL('./worker.js', import.meta.url))`, which Vite
      // can't serve from a pre-bundled dep (404 -> tiles silently never decode).
      pool: getMainThreadPool(DecoderPool),
      opacity: 0.9,
      // Drop ancestor/overview tiles once the current level loads, instead of
      // leaving blurry coarse tiles layered under the data.
      refinementStrategy: 'no-overlap',
      maxCacheSize: 64,
    };
    if (render) {
      const { getTileData, renderTile } = makeRenderTileLoader(render);
      props.getTileData = getTileData;
      props.renderTile = renderTile;
    }
    return new COGLayer(props);
  }

  /** Render options (named STAC renders) available for the current COG assets. */
  getCogRenderOptions() {
    return (this._cogRenderOptions || []).map(o => ({
      id: o.id, title: o.title, active: o.id === this._activeRenderId,
    }));
  }

  /** Switch the active render (style picker): solo the render's target asset. */
  async setActiveRender(id) {
    const opt = (this._cogRenderOptions || []).find(o => o.id === id);
    if (!opt) {return;}
    const byKey = new Map(this._collectCogAssets().map(a => [cogKey(a), a]));
    const targetKey = (opt.render.assets || []).find(k => byKey.has(k));
    const asset = targetKey ? byKey.get(targetKey) : null;
    if (!asset) {return;}
    await this._addCogAssets([asset]);
    this._activeRenderId = id;
  }

  fit(padding = { top: 160, bottom: 50, left: 50, right: 50 }) {
    if (!this.stac || !this.map) {return;}
    const bbox = this.stac.getBoundingBox();
    if (!bbox || bbox.length < 4) {return;}
    this.map.fitBounds(
      [[bbox[0], bbox[1]], [bbox[2], bbox[3]]],
      { padding, maxZoom: 16 }
    );
  }

  isEmpty() {
    return this.layerIds.length === 0 && this._cogList.length === 0 && this._pmtilesLayerIds.length === 0;
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
    return [...this.getFootprintLayerIds(), ...this.getChildrenLayerIds(), ...this._pmtilesLayerIds];
  }

  getAssetOverlays() {
    const overlays = [];
    for (let i = 0; i < this._pmtilesAssetMeta.length; i++) {
      const meta = this._pmtilesAssetMeta[i];
      const layerIds = this._pmtilesLayerIds.filter(id => id.startsWith(meta.sourceId));
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
    this._syncCogLayers();
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
    this._removePmtilesLayers();
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
    this._clearLayers();
    this._removeCogLayers();
    this._removePmtilesLayers();
    // We've just torn everything down, so the upcoming setAssets() must rebuild
    // from scratch. Clear the idempotency signature it uses to skip unchanged
    // asset sets — otherwise re-adding the same assets after a style change is a
    // no-op and the tile/COG layers never come back (issue #13 regression).
    this._assetsSig = null;
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
  // _addSource, but tracks into _pmtilesSourceIds. Removing any pre-existing
  // source (and its layers) first means a re-add after a style change can
  // never throw "source already exists".
  _addPmtilesSource(id, spec) {
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
    if (!this._pmtilesSourceIds.includes(id)) {this._pmtilesSourceIds.push(id);}
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
    this._cogRenderOptions = [];
    this._activeRenderId = null;
  }

  _removePmtilesLayers() {
    this._clearPmtilesLayers();
    for (const id of [...this._pmtilesSourceIds]) {
      try { if (this.map.getSource(id)) {this.map.removeSource(id);} } catch { /* ignore */ }
    }
    this._pmtilesSourceIds = [];
    this._pmtilesAssetMeta = [];
  }

  _clearPmtilesLayers() {
    for (const id of [...this._pmtilesLayerIds]) {
      try { if (this.map.getLayer(id)) {this.map.removeLayer(id);} } catch { /* ignore */ }
    }
    this._pmtilesLayerIds = [];
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

    this._clearPmtilesLayers();

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

    if (pmtilesStyleSourceNames.length > 0 && pmtilesStyleSourceNames.length !== this._pmtilesSourceIds.length) {
      console.warn(`Style defines ${pmtilesStyleSourceNames.length} PMTiles-style source(s) but ${this._pmtilesSourceIds.length} PMTiles source(s) are loaded — mapping by position`);
    }

    // Build a lookup from each loaded PMTiles source's underlying URL to its
    // source ID, so style sources can be matched by URL when they specify one.
    const loadedUrlToSourceId = {};
    for (const sourceId of this._pmtilesSourceIds) {
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
    const remainingSourceIds = this._pmtilesSourceIds.filter(id => !usedSourceIds.has(id));
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
        this._pmtilesLayerIds.push(layerSpec.id);
      }
    }

    this._activeGlStyle = glStyle;
  }

}
