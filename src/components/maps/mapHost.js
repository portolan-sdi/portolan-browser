// The map host: how a widget rendered in the `map-overlay` hook gets hold of
// the page's real MapLibre map.
//
// `MapView` owns its map instance in component data, creates it
// asynchronously, and replaces it whenever the STAC entity changes. Nothing
// outside the component could reach it, so anything that wanted to draw on
// the map had to create a second, smaller map of its own (which is what the
// "Download data" widget used to do, and what `MapSelect.vue` still does for
// the search view's bbox picker).
//
// This is the extension point that fixes that, and it is deliberately the
// smallest one that works:
//
//   * `MapView` calls `createMapHost()` once and `provide()`s it, so the
//     object identity is stable for the component's whole life even though
//     the map inside it is not.
//   * A widget `inject()`s it under `MAP_HOST` and subscribes with
//     `onMap()`. The callback fires immediately if a map already exists,
//     again whenever a new one is created, and with `null` when the current
//     one is torn down -- so a widget never has to care whether it mounted
//     before or after the map.
//   * `onStyleReload()` is the other half, and the one that is easy to
//     forget. Two things happen to the layer list that a widget cannot see:
//     `map.setStyle()` (the basemap load right after creation, and every
//     basemap switch) drops every source and layer added from outside, and
//     applying a collection's own GL style re-inserts the data layers below
//     the basemap's labels -- which puts them *above* whatever the widget
//     added before. So a widget that owns a layer has to be told to re-add
//     it and raise it, or it either disappears or ends up buried under the
//     data it was drawn to frame.
//
// Nothing here is Portolan-specific, and nothing here knows about STAC. An
// upstream host with a different map component can satisfy the same contract
// by calling the same three methods.

import { markRaw, shallowRef } from 'vue';

/** The `provide`/`inject` key for the map host. */
export const MAP_HOST = 'map-host';

/**
 * @typedef {object} MapHost
 * @property {import('vue').ShallowRef<object|null>} mapRef The current map, as a ref, for `watch`.
 * @property {object|null} map The current map, or null before the first one exists.
 * @property {(handler: (map: object|null) => void) => () => void} onMap Subscribe to map changes; called at once with the current map if there is one. Returns an unsubscribe function.
 * @property {(handler: (map: object) => void) => () => void} onStyleReload Subscribe to re-stackings of the layer list, to re-add (and re-raise) sources and layers of your own.
 * @property {(map: object|null) => void} setMap Host-only: publish a new map, or null on teardown.
 * @property {() => void} notifyStyleReload Host-only: announce that the layer list was rebuilt.
 */

/**
 * Create the object a map-owning component provides to its overlay widgets.
 * @returns {MapHost}
 */
export function createMapHost() {
  const mapRef = shallowRef(null);
  /** @type {Set<Function>} */
  const mapHandlers = new Set();
  /** @type {Set<Function>} */
  const styleHandlers = new Set();

  // A listener that throws must not stop the others, and must not reject
  // into whichever of the host's lifecycle methods happened to notify.
  const notify = (handlers, value) => {
    for (const handler of handlers) {
      try {
        handler(value);
      } catch (error) {
        console.error('A map-overlay widget failed to handle a map event:', error);
      }
    }
  };

  return {
    mapRef,
    get map() {
      return mapRef.value;
    },
    setMap(map) {
      // markRaw: a MapLibre map is a large mutable object handed straight to
      // MapLibre's own code, which has no use for a reactive proxy over it.
      // shallowRef would not deep-proxy it anyway, but a widget that puts
      // the map into its own reactive state would.
      mapRef.value = map ? markRaw(map) : null;
      notify(mapHandlers, mapRef.value);
    },
    notifyStyleReload() {
      if (!mapRef.value) {
        return;
      }
      notify(styleHandlers, mapRef.value);
    },
    onMap(handler) {
      mapHandlers.add(handler);
      if (mapRef.value) {
        notify([handler], mapRef.value);
      }
      return () => mapHandlers.delete(handler);
    },
    onStyleReload(handler) {
      styleHandlers.add(handler);
      return () => styleHandlers.delete(handler);
    },
  };
}
