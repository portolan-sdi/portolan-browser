# Widgets <!-- omit in toc -->

STAC Browser has a pluggable widget system that lets you inject custom Vue components
into specific locations on the page. Widgets can display pretty much any
content you need - using either the pre-defined widgets or your own Vue components.

- [User Guide](#user-guide)
  - [Configuration File](#configuration-file)
  - [Using Pre-defined Widgets](#using-pre-defined-widgets)
  - [Using Custom Components](#using-custom-components)
  - [Conditional Widgets](#conditional-widgets)
- [Pre-defined Widgets](#pre-defined-widgets)
  - [AlertBox](#alertbox)
  - [AreaDownload](#areadownload)
  - [CustomText](#customtext)
  - [ExternalWarning](#externalwarning)
  - [Featured](#featured)
- [Hooks](#hooks)
  - [components/MapView.vue](#componentsmapviewvue)
  - [StacBrowser.vue](#stacbrowservue)
  - [views/ApiSearch.vue](#viewsapisearchvue)
  - [views/Catalog.vue](#viewscatalogvue)
  - [views/Item.vue](#viewsitemvue)
  - [views/SelectDataSource.vue](#viewsselectdatasourcevue)
- [On-map Widgets](#on-map-widgets)
  - [The map host](#the-map-host)
  - [Positioning on the map](#positioning-on-the-map)
- [Developer Guide](#developer-guide)
  - [Creating a New Widget](#creating-a-new-widget)
  - [Adding a New Hook](#adding-a-new-hook)

## User Guide

### Configuration File

Widgets are configured in [`widgets.config.js`](../widgets.config.js) at the project root.
The file exports an object where each key is a **hook ID** (the location on the page, see [below](#hooks))
and each value is an **array of widget definitions** to render at that location.

Multiple widgets can be added to the same hook — they render in array order.

After editing the file, restart or rebuild STAC Browser for changes to take effect.

### Using Pre-defined Widgets

For pre-defined widgets (located in [`src/widgets`](../src/widgets)), specify the `id`
(filename without the `.vue` extension) and any `props`:

```js
{
  id: 'AlertBox',
  props: {
    title: 'Warning',
    text: 'This catalog is currently under maintenance.'
  }
}
```

### Using Custom Components

To use a component from outside `src/widgets/`, import it with Vue's `defineAsyncComponent`
and assign it to the `component` property:

```js
{
  id: 'MyCustomWidget',
  component: defineAsyncComponent(() => import('../MyCustomWidget.vue')),
  props: {
    myOption: true
  }
}
```

Make sure the beginning of the config file includes:

```js
import { defineAsyncComponent } from 'vue';
```

### Conditional Widgets

By default, a widget renders whenever its hook renders. To limit a widget to
specific situations, add a `condition` function to the widget definition.
The widget is only shown when the function returns `true`. It receives an
object with the currently shown STAC entity (`data`) and the Vuex store
`state` and `getters`.

For example, to show a widget only on the landing page:

```js
{
  id: 'AlertBox',
  condition: ({ data, getters }) => Boolean(data && getters.root && data.is(getters.root)),
  props: {
    text: 'Welcome!'
  }
}
```

Or only for collections:

```js
condition: ({ data }) => Boolean(data?.isCollection)
```

## Pre-defined Widgets

All pre-defined widgets are stored in [`src/widgets`](../src/widgets).

### AlertBox

Renders a dismissible alert banner.

| Props         | Type    | Default     | Description |
| ------------- | ------- | ----------- | ----------- |
| `title`       | String  | `''`        | Bold heading shown before the text. |
| `text`        | String  | `''`        | The alert message body, CommonMark (Markdown) is supported. |
| `variant`     | String  | `'warning'` | Color variant: `'warning'`, `'danger'`, `'success'`, `'info'`, etc. |
| `dismissible` | Boolean | `false`     | Whether the user can close the alert. |
| `allowHTML`   | Boolean | `false`     | Allows HTML tags in the `text`. |

### AreaDownload

An on-map download tool, for the [`map-overlay`](#on-map-widgets) hook. It puts a
"Download data" cluster on the map itself: a place-name search box, a "Draw a box"
button, a "Draw polygon" button and an "Upload" button, side by side. Picking a place,
drawing a box or a polygon, uploading
a GeoJSON or dropping one onto the map outlines that area **on the page's own map**,
over the collection's data, and opens a compact card with the dataset name, a live
estimate (rows, bytes read, warnings, and the safety ceiling with its accept button) and
the output formats, each labelled with its own expected size. Choosing a format saves
the file straight away — through `showSaveFilePicker` where the browser has it,
otherwise as a Blob the widget clicks for you. There is no link to find and click.

GeoJSON and GeoParquet are offered directly; "More formats" adds GeoPackage,
FlatGeobuf, Shapefile, CSV and Esri JSON. The last five are separate `@cng` packages
whose writers load the first time someone picks them, so each button says what its
plugin still has to fetch (`GeoPackage · 133 kB +331 kB`) before anything is downloaded,
and a format that cannot be fetched says so rather than failing silently. Anything a
writer has to change to fit its format — Shapefile renaming a column to dBase's
ten-character limit, for instance — is reported beside the saved file.

**Drawing a polygon.** "Draw polygon" is the box tool's sibling, for a region a
rectangle does not describe. Click each corner; double-click, press <kbd>Enter</kbd>, or
click the first corner again to close the ring; <kbd>Esc</kbd> cancels. While you draw,
the corners placed so far are marked and the edge follows the cursor, and once there are
three the fill shows the shape closing would produce. Arming either draw tool disarms
the other.

**Editing an area.** Once there is an area — however it arrived — the card offers
"Edit shape". Turning it on puts handles on the outline: drag a large one to move a
corner, drag a small one between two corners to add a corner there, double-click a
corner to remove it. The estimate re-runs as you go, so the row count always describes
the shape currently on the map, and a download started afterwards uses that shape.
<kbd>Esc</kbd> or "Done editing" leaves the editor. Editing adjusts the exterior ring of
the largest polygon; holes and any other parts of a multi-polygon are kept as they are.

The card narrows the request as well as placing it:

- **Which table.** A collection that publishes several parquet `data` assets — Fields of
  the World's benchmark collections carry field polygons, boundary lines and a chip
  index side by side — gets a picker labelled with each asset's title, row count and
  file size. Choosing re-derives the dataset from that asset, so its columns, its bbox
  covering and its time column are the ones the rest of the card works from. A
  partitioned collection has no picker: its source is the partition set.
- **When.** A table with a declared time column gets a date range, auto-populated from
  the collection's own temporal extent, with "Last 30 days", "Last year" and "Whole
  range" beside it. It is switched on by default only when the extent is wider than two
  years, where a window saves whole files from being read: on the FIRMS mirror, naming
  one month takes a county-sized request from 27 files and 10.2 GB read to one file and
  962 MB.
- **Which rows.** Column filters built from the table's own columns, ANDed onto the
  `where` prop. They are applied row by row as the data is read, so they lower the rows
  written rather than the bytes read, which the card says.

Every one of those re-runs the estimate. "Why this estimate" expands into the pruning
cascade stage by stage — how many files and row groups each stage looked at, how many
survived, and on what basis — which is where "this dataset has no bbox covering, so
nothing could be pruned" becomes visible.

A running download shows rows matched and bytes read, and can be paused, resumed or
cancelled; cancelling keeps nothing. It ends in a success state naming the file, the
rows, the size and how long it took, or in a failure state that says what went wrong in
words rather than as an error code.

Collapsed, the cluster is a single "Download data" pill, which is the discoverability
affordance: on a downloadable collection it pulses once when the page loads (never under
`prefers-reduced-motion`), so the feature is visible rather than buried in the metadata
column. <kbd>Esc</kbd> inside the tool disarms a draw if one is armed, then leaves the
shape editor if it is open, and otherwise collapses the cluster back to the pill; the search box keeps <kbd>Esc</kbd> for its own
suggestion list. Below 576px the tool starts collapsed to that pill, both
it and the card span the width of the map instead of sitting in a lane down its
right-hand side, and the card is capped at just under half the map's height so the
style picker and its legend stay reachable underneath.

The browser reads only the row groups the area touches, straight from the collection's
parquet files. The widget is built on the `@cng` cloud-native map widget packages,
which are consumed from a sibling `cng-map-widgets` checkout through a Vite alias until
they are published to npm. See
[.github/DOWNLOAD_WIDGET_NOTES.md](../.github/DOWNLOAD_WIDGET_NOTES.md) for the
architecture, the setup it needs, and what is portolan-specific about it.

The widget needs no `condition` of its own: the one in `widgets.config.js` keeps it off
any entity with no downloadable vector data, so a raster, Zarr or PMTiles-only collection
shows nothing at all — no card, no cluster, not even the pill. It must be placed on
`map-overlay`; in any other hook it has no map to draw on and says so in the console.

| Props            | Type   | Default      | Description |
| ---------------- | ------ | ------------ | ----------- |
| `indexUrl`       | String | the published geoBoundaries names index | The place-name index the search box reads, as a `cnmw-index/1.0` manifest URL. `null` hides the search box entirely (no Geocoder is created, no fetch is made for it); draw, upload and download keep working. In `widgets.config.js`, this is wired to the [`areaSearchIndexUrl`](options.md#areasearchindexurl) config option rather than hardcoded. |
| `allowedFormats` | Array  | `null`       | Restricts the format buttons offered to this list of ids: any of `'geojson'`, `'geoparquet'`, `'gpkg'`, `'flatgeobuf'`, `'shapefile'`, `'csv'`, `'esrijson'` (see `src/utils/download/formats.js`). `null` or `[]` offers every registered format. In `widgets.config.js`, this is wired to the [`areaDownloadFormats`](options.md#areadownloadformats) config option. |
| `where`          | Array  | `[]`         | Attribute predicates applied to every download, in `@cng` `FilterSpec` form, e.g. `[{ col: 'confidence', op: '>=', value: 0.9 }]`. The card's own column filters are ANDed onto these, not instead of them. |
| `limit`          | Number | `100000`     | Hard cap on the rows a download writes. Distinct from the safety ceiling, which is a refusal the user can accept. |
| `directSave`     | String | `'auto'`     | How the finished file reaches the disk: `'picker'` always asks the File System Access API for a destination, `'anchor'` always writes a Blob and clicks it, `'auto'` prefers the picker where it exists and is not driven by automation. |

The widget itself is only registered on `map-overlay` when the
[`enableAreaDownload`](options.md#enableareadownload) config option is `true` (the
default); set to `false`, `widgets.config.js` omits it from the hook entirely, so
nothing is registered and nothing renders.

### CustomText

Renders a simple text with a heading.

| Props       | Type    | Default | Description |
| ----------- | ------- | ------- | ----------- |
| `title`     | String  | `''`    | Rendered as an `<h3>` heading. |
| `text`      | String  | `''`    | Rendered as the body, CommonMark (Markdown) is supported. |
| `allowHTML` | Boolean | `false` | Allows HTML tags in the `text`. |

### `ExternalWarning`

Renders a banner indicating that the shown catalog, collection or item is not
part of the configured catalog (external content, see the [`allowExternalAccess`](options.md#allowexternalaccess) option).
This helps users understand that they left the configured catalog and are now looking at
data provided by an external data source.

The widget only renders on external content, so no `condition` is required.
It has no effect if no `catalogUrl` is configured, as in that case there is no catalog
to distinguish external content from.

A typical placement is the `view-catalog-meta-start` and `view-item-secondary-start` hooks,
which show the banner above the description.

| Props     | Type   | Default  | Description |
| --------- | ------ | -------- | ----------- |
| `variant` | String | `'info'` | Color variant: `'info'`, `'warning'`, `'danger'`, etc. |

### Featured

Renders a list of "featured" STAC catalogs or collections.
A typical placement is the `view-catalog-catalogs-start` hook, which shows the featured entities right above the regular collection list.
The widget only renders on the landing page (the root catalog).

| Props      | Type   | Default      | Description |
| ---------- | ------ | ------------ | ----------- |
| `entities` | Array  | **required** | The entities to feature, shown in the given order. See below for the supported types of entries. |
| `title`    | String | `null`       | Rendered as the heading of the list. Can be given as plain text or as the key of a phrase from the locales (e.g. defined in the `custom.json` files, see the [localization docs](localization.md#custom-phrases)). If not given, defaults to a localized version of "Featured". |
| `view`     | String | `'cards'`    | How the entities are shown: `'cards'` or `'list'`. Set to `null` to follow the view mode that the user has chosen for the other lists. |

Each entry in `entities` can be one of the following:

- **A collection ID** (a string without a slash, e.g. `'sentinel-2-l2a'`):
  Only works for STAC APIs.
- **A URL** (a string with a slash, absolute or relative to the catalog,
  e.g. `'https://example.com/api/collections/xyz'` or `'./data/catalog.json'`):
  Works for both STAC APIs and static catalogs.
  Entities that fail to load are not shown.
- **A (partially) complete STAC entity as object**
  (e.g. `{ id: 'xyz', title: 'My Collection', description: '…', links: […] }`):
  Works for both STAC APIs and static catalogs. The object must contain a
  `self` link or (for APIs) an `id`, otherwise the entity is not shown.
  STAC Browser loads the full version of the entity when needed.

## Hooks

Hooks are named insertion points in the STAC Browser UI where widgets get rendered.
Each hook has an ID like `view-catalog-meta-start` that you use as the key in
`widgets.config.js`.

<!-- START HOOKS -->

### StacBrowser.vue

- `footer-start`
- `root-before-content`
- `root-end`
- `root-start`

### components/MapView.vue

- `map-overlay`

### views/ApiSearch.vue

- `view-search-filters-collections-end`
- `view-search-filters-collections-start`
- `view-search-filters-end`
- `view-search-filters-items-end`
- `view-search-filters-items-start`
- `view-search-filters-start`
- `view-search-results-end`
- `view-search-results-start`

### views/Catalog.vue

- `view-catalog-catalogs-end`
- `view-catalog-catalogs-start`
- `view-catalog-items-end`
- `view-catalog-items-start`
- `view-catalog-meta-end`
- `view-catalog-meta-start`

### views/Item.vue

- `view-item-primary-end`
- `view-item-primary-start`
- `view-item-secondary-end`
- `view-item-secondary-start`

### views/SelectDataSource.vue

- `view-select-data-source-start`
<!-- END HOOKS -->

*Note: This list is auto-generated. Run `npm run docs:hooks` to update it after adding new hooks.*

## On-map Widgets

`map-overlay` is not like the other hooks. It renders **inside the map container**, as a
transparent layer over the map, so a widget there can draw on the map and position
itself over the data. It is how [`AreaDownload`](#areadownload) works.

It is opt-in per map: `MapView` only renders the hook when it is given the
`overlayWidgets` prop. The collection and item views pass it; the API search view
deliberately does not, because its map draws other entities' footprints rather than
`state.data`, and a widget whose `condition` was written about the page's own entity has
no business there.

### The map host

A widget in this hook gets the live MapLibre map by injecting the **map host**, a small
object `MapView` provides. The host is stable for the component's whole life; the map
inside it is not, because `MapView` creates it asynchronously and replaces it when the
STAC entity changes.

```js
import { MAP_HOST } from '../components/maps/mapHost.js';

export default {
  inject: {
    mapHost: { from: MAP_HOST, default: null }
  },
  mounted() {
    if (!this.mapHost) {
      return; // not in the map-overlay hook
    }
    this.offMap = this.mapHost.onMap(map => {
      // Called at once if a map already exists, again whenever a new one is
      // created, and with `null` when the current one is torn down.
      this.draw(map);
    });
    this.offStyle = this.mapHost.onStyleReload(map => this.draw(map));
  },
  beforeUnmount() {
    this.offMap?.();
    this.offStyle?.();
  }
};
```

| Member                  | Description |
| ----------------------- | ----------- |
| `map`                   | The current MapLibre map, or `null` before the first one exists. |
| `mapRef`                | The same thing as a `shallowRef`, for `watch`. |
| `onMap(handler)`        | Subscribe to map changes. Called immediately with the current map if there is one, and with `null` on teardown. Returns an unsubscribe function. |
| `onStyleReload(handler)` | Subscribe to re-stackings of the layer list. Returns an unsubscribe function. |

**Always subscribe to `onStyleReload`** if the widget adds sources or layers. Two things
happen that a widget cannot see from the outside:

- `map.setStyle()` — the basemap load right after the map is created, and every basemap
  switch — drops every source and layer added from outside. Without re-adding them, they
  silently never appear.
- Applying a collection's own GL style re-inserts the data layers *below the basemap's
  labels*, which puts them **above** anything the widget added earlier. Re-adding is also
  how a widget raises its layers back to the top; MapLibre orders by insertion, so remove
  before you add or nothing moves.

### Positioning on the map

The hook's container covers the map with `pointer-events: none`, so panning and clicking
the map keep working around a widget. Each piece of chrome has to claim pointer events
back for itself:

```scss
.my-overlay-widget {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .my-panel {
    position: absolute;
    top: var(--sb-map-overlay-top, 10px);
    right: 52px;
    pointer-events: auto;
  }
}
```

`--sb-map-overlay-top` is the layout's answer to "where does the usable top of the map
start". It is `10px` by default; the collection and item views raise it, because the hero
map is pulled up underneath the site header and the top of the map element is behind it.

The map's corners are mostly spoken for, and a widget should stay out of them: the top
left is the map's notice (`.map-textcontrol`, which says why a layer did not draw), the
top right and the right edge are MapLibre's navigation buttons, the bottom left is the
style picker and layer control, and the bottom right corner is the attribution button.
`AreaDownload` uses the lane between the right edge's buttons and the middle of the map,
which is why it insets by 52px rather than 10px.

## Developer Guide

### Creating a New Widget

A widget is a standard Vue single-file component (`.vue` file). To create one:

1. **Create the component file** in `src/widgets/` or at another location of your choice.
   The filename (without extension) must match the component's `name` property exactly (case-sensitive).

   For example, `src/widgets/BannerImage.vue`:

   ```vue
   <template>
     <div class="banner-image">
       <img :src="url" :alt="alt" />
     </div>
   </template>

   <script>
   export default {
     name: "BannerImage",
     props: {
       url: {
         type: String,
         required: true
       },
       alt: {
         type: String,
         default: ''
       }
     }
   };
   </script>

   <style lang="scss" scoped>
   @import "../theme/variables.scss";

   .banner-image {
     margin-bottom: $block-gap;

     img {
       max-width: 100%;
     }
   }
   </style>
   ```

2. **Register it in `widgets.config.js`** under the desired hook:

   ```js
   export default {
     'view-catalog-meta-start': [
       {
         id: 'BannerImage',
         props: {
           url: '/banner.jpg',
           alt: 'Catalog banner'
         }
       },
     ],
   };
   ```

3. **Rebuild** STAC Browser. The widget will be dynamically imported when the hook renders.

**Tips:**

- Use `@import "../theme/variables.scss"` to access shared SCSS variables like `$block-gap`.
- Widgets only receive the `props` defined in `widgets.config.js` — they do not
  automatically receive page data such as the STAC object or items.
  You can import them from the Vuex store.
- You can place the same widget at multiple hooks with different props.

### Adding a New Hook

To add a new widget insertion point to a view:

1. **Add a `<WidgetHook>` tag** in the Vue template of the relevant view or component:

   ```vue
   <WidgetHook id="view-catalog-custom-start" />
   ```

   `WidgetHook` is registered as a global component, so no import is needed.

2. **Update the docs** by running:

   ```bash
   npm run docs:hooks
   ```

   This scans all `.vue` files for `<WidgetHook>` tags and updates the hook list
   in this document automatically.
