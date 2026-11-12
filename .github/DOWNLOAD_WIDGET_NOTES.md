<!-- lint disable no-shortcut-reference-link -->

# The "Download data" widget: architecture notes

Notes for the reviewer of the `download-widget` branch, and for whoever
later extracts this into a widget for upstream STAC Browser. Written against
the cloud-native map widgets design document in `cn-geocoding`
(`docs/design/widgets-architecture.md`), whose section numbers are cited
throughout.

- [What it does](#what-it-does)
  - [The on-map redesign](#the-on-map-redesign)
- [Running it](#running-it)
- [What is reusable and what is portolan glue](#what-is-reusable-and-what-is-portolan-glue)
- [The hyparquet version reconciliation](#the-hyparquet-version-reconciliation)
- [Where the design's hosting section met the real codebase](#where-the-designs-hosting-section-met-the-real-codebase)
- [The path to a stac-browser widget](#the-path-to-a-stac-browser-widget)
- [Known gaps](#known-gaps)

## What it does

On any collection or item that holds vector GeoParquet, a tool **on the map**
offers:

1. **An area.** Searched by place name in a search box on the map, drawn with
   a "Draw a box" button (or Shift-drag), uploaded as GeoJSON with an
   "Upload" button, or dropped onto the map. Whichever way, the area is
   outlined on the page's own map, over the collection's data.
2. **An estimate.** Rows, bytes read, output size, and how many files and row
   groups the request touches, from parquet footer metadata alone — no row
   data is read to produce it. It runs by itself as soon as there is an area:
   metadata-only estimation is cheap enough that making the user press a
   button for it was the wrong trade.
3. **A download.** GeoJSON or GeoParquet, written in the browser from the row
   groups the area actually intersects, with a progress bar and cancellation,
   and a refusal when the request exceeds the safety ceiling. The save starts
   immediately — `showSaveFilePicker` where the browser has it, otherwise a
   Blob anchor the widget creates, clicks and throws away. There is no
   rendered link to find.
4. **The request as code.** The portable `DownloadRequest` JSON and the
   equivalent DuckDB SQL, both for the area and filters the user picked,
   behind a toggle in the card.

No server converts anything; the browser range-reads the collection's parquet
files directly.

### The on-map redesign

The first cut was a panel in the metadata column with a 240px map of its own,
because the page's map was unreachable from a widget — recorded below as a
gap in ["Where the design's hosting section met the real codebase"][hosting].
Direct user feedback turned that gap into the thing to fix ("I was imagining
it to be an on-map widget that was more fluid… on the map lets you see what
the data is"), so the branch adds the missing extension point rather than
working around it:

- **`map-overlay`**, a widget hook rendered *inside* the map container as a
  transparent overlay. `MapView` renders it when given `overlayWidgets`; the
  collection and item views pass it, the API search view deliberately does
  not, because its map draws other entities' footprints and not `state.data`.
- **The map host** (`src/components/maps/mapHost.js`), a small object
  `MapView` `provide()`s. `onMap()` hands a widget the live map — at once if
  one already exists, again on replacement, `null` on teardown — and
  `onStyleReload()` says when the layer list was rebuilt. Both are documented
  for widget authors in [docs/widgets.md][on-map-widgets].

Neither piece knows anything about STAC or about downloads, which is the
point: a host with a different map component satisfies the same contract by
calling the same three methods, so this is the shape to offer upstream.

Two consequences worth knowing:

- **The search box is now the adapter's control, not the app's.** Design §5.3
  always said to mount `@cnmw/maplibre`'s `GeocoderControl` on the map; the
  panel could not, so it drove `@cnmw/geocoder-core` from a `b-form-input`
  instead and the note below argued for that. With a real map to mount on,
  the decision reverses. The control's element is appended into the widget's
  cluster rather than handed to `map.addControl`, which would only put it in
  a MapLibre corner container stacked *above* the draw and upload buttons
  instead of beside them; it still holds the real map, reads the real
  viewport to bias ranking, and brings its own combobox a11y and debounce.
- **`onStyleReload` has to raise, not just re-add.** `map.setStyle()` drops
  outside layers, which was already known. What was not: applying a
  collection's GL style re-inserts the data layers below the basemap's labels
  and therefore *above* anything added before them. The area outline was
  invisible until `MapView.applyStyleAtIndex` started notifying and the
  widget's `attachMapLayers` started removing before adding. Any future
  overlay widget that owns a layer has the same problem.

[hosting]: #where-the-designs-hosting-section-met-the-real-codebase

[on-map-widgets]: ../docs/widgets.md#on-map-widgets

## Running it

The widget's packages are not published to npm yet, so the branch consumes
them from a sibling checkout:

```sh
git clone <cn-geocoding> ../cn-geocoding   # beside this repo
pnpm install && pnpm start
```

`vite.config.js` aliases `@cnmw/*` to `../cn-geocoding/packages/*/src/index.js`
and allows the dev server to serve from there. `SB_CNMW_ROOT` overrides the
location. **When the packages are published this becomes a version pin:** the
alias block and `SB_CNMW_ROOT` are deleted, the four names move into
`package.json` dependencies with exact versions, and no import changes,
because every import is already by package name. `vitest.config.js` carries
the same alias and has to be kept in step until then.

The place-name search needs a `cnmw-index/1.0` index. The default
`indexUrl` in `widgets.config.js` points at a locally served copy of the
provisional geoBoundaries index (49,530 rows, 2.5 MB) from cn-geocoding's
`examples/geocoder-demo/data/`. **It flips to the published
`portolan-mirrors/geoboundaries-catalog` names index on Source Cooperative
once that catalog is live**, and it is a widget prop, so a deployment can
point at any index that satisfies §6 of the design.

`verify-download-widget.mjs` at the repo root drives the whole flow against a
real catalog; its header comment has the one server it expects (just this
app -- the catalog, the parquet files and the names index all come from
Source Cooperative now).

## What is reusable and what is portolan glue

Everything that understands areas, parquet, pruning, estimates and output
formats lives in the `@cnmw` packages and is host-agnostic. This repo adds
about 2,000 lines, of which the widget itself is most:

| File | Lines | Portolan-specific? |
| --- | --- | --- |
| `src/widgets/AreaDownload.vue` | 1,258 | **Partly.** The flow is generic; the Vue, the i18n keys and the on-map positioning (which corners this app's own map controls already own) are this app's. Roughly 375 of those lines are the scoped stylesheet the on-map chrome needs. |
| `src/codegen/DuckDbSqlGenerator.js` | 346 | **No.** A pure `DownloadRequest` → SQL translation of design §2.9. Moves anywhere. |
| `src/utils/download/descriptor.js` | 119 | **No.** stac-js object → dataset descriptor. stac-js is upstream's object model too. |
| `src/components/maps/mapHost.js` | 105 | **No.** Knows nothing about STAC or downloads; this is the piece to offer upstream. |
| `src/utils/download/support.js` | 63 | **No**, apart from importing this app's parquet predicates. |
| `src/utils/download/hyparquet.js` | 61 | **No.** Any bundler-hosted app needs this. |
| `src/codegen/DownloadRequestGenerator.js` | 57 | **No.** |
| `widgets.config.js` | 32 | **Yes**, by definition: this is the registration. |

Plus small edits to app code: `MapView.vue` provides the map host and renders
the `map-overlay` hook, the collection and item views pass `overlayWidgets`
and the hero-map offset, and `BboxDrawInteraction` gained a `setArmed()` mode
so a button can start a draw without teaching Shift-drag.

The genuinely portolan-specific lines are: reading the current entity from
this app's Vuex store, `BboxDrawInteraction` for the draw box, the i18n keys,
the widget-hook registration, and the CSS that keeps the tool clear of this
app's own map controls. That is the list a port has to revisit — a few dozen
lines inside one component, not a fork of the logic.

### Why the search box is the adapter's control

Design §5.3 says to mount `@cnmw/maplibre`'s `GeocoderControl` on the map,
and now that there is a map to mount it on, that is what happens. (The first
cut drove `@cnmw/geocoder-core` from a `b-form-input` and a `b-list-group`
instead, on the argument that a search box belongs in a panel's flow rather
than floating over a 240px map. That argument died with the 240px map.)

The control is DOM and event wiring only — the core carries the ranking, the
index loading and the progressive geometry resolution either way — but it is
DOM worth not rewriting: an ARIA 1.2 combobox with arrow-key navigation, a
debounce, and loading and empty states.

Two options are passed that are worth noting, because they move
responsibility back to this app:

- `outline: false` and `fitBounds: false`. The widget owns one
  `addAreaLayer` and one fit for all three ways of picking an area; the
  control must not add a second of each.
- `geometry: { resolution: 'both' }` on the `Geocoder`, not per `select()`
  call, because the control owns the call. Without it the download would
  filter on the display-simplified outline, which is drawn deliberately
  *outward* of the true boundary, and would over-select at the edges.

The control's `document.addEventListener('click', …)` (for closing the
listbox) is not removed by its `onRemove`. One listener per map instance,
and `Catalog.vue` keys its root on `data.id` so navigating rebuilds the
whole widget anyway — but it is a real leak and a one-line fix in
`@cnmw/maplibre`.

## The hyparquet version reconciliation

This app pins **hyparquet 1.26.0**. The `@cnmw` packages pin **1.33.0**, as
exact CDN URLs they `import()` at runtime so they work with no bundler at all
(design §4.2). Those specifiers are computed at runtime, so **no bundler can
rewrite them**: left alone, a page would fetch a second hyparquet from
jsdelivr and run two parsers side by side.

A Vite alias cannot fix that. What does is the packages' module-injection
seam: `src/utils/download/hyparquet.js` hands both packages this app's own
hyparquet once, before the first read. The CDN path stays the default for
zero-build pages and is never taken here.

Three facts were measured rather than assumed, and are pinned by
`tests/unit/downloadHyparquet.spec.js`:

- **`geoparquet: false` is live on 1.26.0, not a no-op.** 1.26.0 already
  marks a GeoParquet geometry column with a `GEOMETRY` logical type by
  default; the flag turns that off so download-core decodes the WKB itself.
  It was worth checking, because a silently ignored flag here would have
  meant geometry decoded twice, differently.
- **`utf8: false` is honoured**, so WKB stays a `Uint8Array` instead of being
  mangled into a string.
- **hyparquet-writer 0.18.0 works against 1.26.0.** It declares hyparquet
  1.32.0 as its own dependency, which would have put a third copy in the
  tree, so `pnpm-workspace.yaml` overrides `hyparquet-writer>hyparquet` to
  1.26.0. It uses two functions from it, `parquetSchema` and `toJson`, both
  present. The spec writes a GeoParquet file and reads it back.

`resolve.dedupe` lists the three packages as a second line of defence, so an
import originating inside the aliased cn-geocoding tree still resolves here.

The one thing to re-check when this app's hyparquet moves: run
`tests/unit/downloadHyparquet.spec.js`, and bump the override.

## Where the design's hosting section met the real codebase

Design §5.3 mapped the widget onto this repo's four extension points. Against
the code:

**Right.**

- `widgets.config.js` is the correct home, and `condition` does give
  "unsupported is an absence" for free (design call #8).
- Rejecting `assetActions.config.js` was correct: those produce a link-out,
  and this is not a link. (It is not a link at either end now: the download
  itself starts without one.)
- The app really does already depend on hyparquet, so the widget adds no new
  heavy dependency — only hyparquet-writer, ~30 KB, loaded on demand and only
  for GeoParquet output.

**Wrong, and worth correcting in the design document.**

- **There is no `@cnmw/stac` package.** §5.3 and §5.4 both assume a
  `stacToDescriptor` from one. The §2.4 derivation lives in
  `@cnmw/download-core`'s `dataset-resolve.js` and was not exported. E7 added
  `descriptorFromCollection` and `collectionDownloadSupport` there rather
  than reimplementing the mapping in this app — reimplementing it is exactly
  what §5.4 says keeps a stac-browser port a small diff.
- **The page's map instance was not reachable from a widget** — *fixed on
  this branch; see [The on-map redesign](#the-on-map-redesign).* §5.3 says to
  mount onto "the existing `MapView.vue` map instance, obtained via the
  store". It was not on the store, not `provide()`d and not emitted, and
  `WidgetHook` renders widgets with no context and no event channel. The
  branch adds both halves of the missing seam: a `map-overlay` hook rendered
  inside the map container, and a `provide()`d map host. §5.4's advice to
  take the map as a prop is right in spirit, but a prop cannot express
  "the map does not exist yet, and will be replaced" — which is why the host
  is a subscription rather than a value. `MapSelect.vue` still renders its
  own small map for the search view's bbox picker; nothing here changes that.
- **`condition` runs in the main bundle.** `WidgetHook` imports
  `widgets.config.js` eagerly, so §5.3's `condition: ({data}) =>
  Boolean(stacToDescriptor(data))` would pull download-core and spec into
  every page's initial bundle to decide not to render a panel. The condition
  is a cheap app-local predicate instead; the authoritative derivation runs
  inside the widget's lazy chunk and renders a refusal if the two disagree.
- **`codeGenerators.config.js` is search-only.** §5.3 calls it "the
  reproducibility seam". In this codebase a generator is
  `new Gen(catalogHref, searchLink)` rendered from `generate(searchFilters)`
  into a per-language tab of the STAC API *search* view's example-code modal.
  A download request has no search link and is not on that view, so adding
  entries to the default export would have put empty tabs in that modal. The
  two download generators live in `src/codegen/` and are registered in that
  config under a separate `downloadGenerators` export; they implement the same
  interface, so `CodeBox.vue` renders them unchanged. That reuse is the part
  §5.3 got right.

**One real bug found in the §2.4 derivation**, fixed in cn-geocoding: a
collection whose only `data`-role asset was a COG or PMTiles file came back as
`{ kind: 'parquet' }` with the raster's href, because of an unconditional
"first data asset" fallback. Design call #8's graceful refusal became a parquet
parse error several seconds later. Raster and Zarr collections now refuse up
front, which is what makes the widget genuinely absent on them.

## The path to a stac-browser widget

Upstream STAC Browser shares the widget, action and codegen systems verbatim,
and uses the same stac-js object model and the same Vuex `state.data`. The
port is:

1. **Keep** `descriptor.js`, `support.js`, `hyparquet.js` and both generators
   as they are. They touch nothing portolan-specific except this app's parquet
   predicates in `support.js` (about ten lines to inline).
2. **Carry the map host and the `map-overlay` hook.** They are the structural
   change, and they are deliberately host-agnostic: `mapHost.js` is 105 lines
   that know nothing about STAC or downloads, and the hook is five lines in
   the map component plus a `pointer-events: none` overlay in its stylesheet.
   Upstream's map is OpenLayers, not MapLibre, so this widget does not port
   as-is — but the seam does, and it is the thing worth proposing first. A
   host that cannot supply a map gets `mapHost: null` and the widget declines
   to render rather than failing.
3. **Swap `BboxDrawInteraction`** for whatever upstream has, or carry the
   class: it is ~160 dependency-free lines, including the armed mode.
   cn-geocoding's `@cnmw/openlayers` adapter may be the better answer for an
   OpenLayers host.
4. **Expect poorer metadata.** Upstream catalogs rarely carry `partition:*`,
   `table:*` or a GeoParquet 1.1 covering. The derivation already falls back
   (§2.4's chain), and the estimate fills what is missing from the parquet
   footer — but with no covering there is no row-group pruning, and the
   widget should say so rather than appear to offer the same thing.
5. **Drop nothing else.** No Portolan styles or render-order code is involved.

## What this branch needs from cn-geocoding

The widget depends on four additions to the `@cnmw` packages, made while
building it and committed there as `E7: host seams for a bundler, and the
§2.4 derivation on an in-memory collection`. They are additive — every
existing test in that repo still passes (237) — but this branch does not
build without them, so a reviewer needs a cn-geocoding checkout that
includes that commit.

1. `@cnmw/download-core` exports `descriptorFromCollection` and
   `collectionDownloadSupport`: the §2.4 derivation run against a collection
   JSON already in memory, and its non-throwing form. The design assumed a
   `@cnmw/stac` package for this; the mapping has always lived in
   download-core.
2. `@cnmw/download-core` exports `setHyparquetModules` / `loadHyparquet` /
   `loadHyparquetWriter`, and its injection seam is documented as a host
   path rather than test-only.
3. `@cnmw/geocoder-core` gains the same seam. It had two private copies of
   the CDN loader, in `index-loader.js` and `geometry-resolver.js`; both now
   use one in `cdn.js`.
4. Asset hrefs are resolved against the collection's own URL during
   derivation, and a declared non-parquet `data` asset no longer passes as
   parquet (the bug described above).

Files touched: `packages/download-core/src/{cdn,dataset-resolve,index}.js`,
`packages/geocoder-core/src/{cdn,index-loader,geometry-resolver,index}.js`,
and a new `packages/download-core/test/descriptor-from-collection.test.js`
(9 tests, built from real catalog fixtures).

## Known gaps

- **A collection with several parquet `data` assets** (benchmark-data-catalog
  publishes `fields`, `boundary_lines` and `chips` side by side) silently
  downloads the first. §2.4 has no asset-choice step and the widget offers no
  picker. This needs a design answer before it needs code.
- **`s3://` partition globs.** The FIRMS collection publishes its
  `partition:glob` as an `s3://` URI, which DuckDB and the QGIS plugin can
  read and a browser cannot. The widget refuses with a message naming the
  scheme rather than failing mid-estimate, but the right fix is upstream: a
  collection that wants browser downloads should publish an HTTPS glob, or a
  `collection-mirror` asset to enumerate from.
- **Shared boundaries are intersections.** Downloading ADM2 units for
  Liechtenstein returns 17 rows, not the 11 municipalities: six neighbouring
  Swiss and Austrian units share a boundary line, and `ST_Intersects` is true
  for a shared boundary. That is correct and documented behaviour (§2.2), but
  it will surprise users. The `clip` spatial mode is the answer and is not
  implemented yet (design §O7).
- **Estimates are wide.** Metadata-only estimation reports "15 rows (between
  0 and 768)" for the Liechtenstein download that produces 17. That is the
  honest number from row-group statistics, and the design's opt-in
  one-row-group sampling (§O12) would narrow it. It is now shown without the
  user asking for it, so it is read more often than it used to be.
- **`MapSelect.vue` probably has the layer-ordering bug this branch fixes for
  its own map:** `BboxDrawInteraction` adds its source in its constructor, and
  `MapMixin.createMap` replaces the whole style immediately afterwards to load
  the basemap, which drops it. `setExtent` then silently does nothing. Not
  touched here; worth a separate issue.
- **The tool owns two of the map's corners.** It is positioned against this
  app's own map chrome (notice top left, navigation right, style picker and
  layer control bottom left, attribution bottom right). A deployment that
  adds another map control, or a second `map-overlay` widget, has nothing
  stopping the two from overlapping. The hook exposes `--sb-map-overlay-top`
  but no layout, which is the honest state of it: one overlay widget works,
  several would need a real lane system.
- **The native save dialog is skipped under automation.** `directSave: 'auto'`
  checks `navigator.webdriver`, because a WebDriver session cannot dismiss a
  modal the page did not draw and every test would hang on it. A deployment
  that wants the picker regardless can set `directSave: 'picker'`. Worth a
  second look if a better signal appears.
