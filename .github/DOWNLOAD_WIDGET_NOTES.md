<!-- lint disable no-shortcut-reference-link -->

# The "Download data" widget: architecture notes

Notes for the reviewer of the `download-widget` branch, and for whoever
later extracts this into a widget for upstream STAC Browser. Written against
the cloud-native map widgets design document in `cn-geocoding`
(`docs/design/widgets-architecture.md`), whose section numbers are cited
throughout.

- [What it does](#what-it-does)
- [Running it](#running-it)
- [What is reusable and what is portolan glue](#what-is-reusable-and-what-is-portolan-glue)
- [The hyparquet version reconciliation](#the-hyparquet-version-reconciliation)
- [Where the design's hosting section met the real codebase](#where-the-designs-hosting-section-met-the-real-codebase)
- [The path to a stac-browser widget](#the-path-to-a-stac-browser-widget)
- [Known gaps](#known-gaps)

## What it does

On any collection or item that holds vector GeoParquet, a panel offers:

1. **An area.** Searched by place name against a names index, drawn on the
   panel's map with Shift-drag, or uploaded as GeoJSON.
2. **An estimate.** Rows, bytes read, output size, and how many files and row
   groups the request touches, from parquet footer metadata alone — no row
   data is read to produce it.
3. **A download.** GeoJSON or GeoParquet, written in the browser from the row
   groups the area actually intersects, with progress and cancellation, and a
   refusal when the request exceeds the safety ceiling.
4. **The request as code.** The portable `DownloadRequest` JSON and the
   equivalent DuckDB SQL, both for the area and filters the user picked.

No server converts anything; the browser range-reads the collection's parquet
files directly.

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
real catalog; its header comment has the two servers it expects.

## What is reusable and what is portolan glue

Everything that understands areas, parquet, pruning, estimates and output
formats lives in the `@cnmw` packages and is host-agnostic. This repo adds
1,270 lines, of which the panel itself is half:

| File | Lines | Portolan-specific? |
| --- | --- | --- |
| `src/widgets/AreaDownload.vue` | 657 | **Partly.** The flow is generic; the Vue, bootstrap-vue-next markup and `MapMixin` use are this app's. |
| `src/codegen/DuckDbSqlGenerator.js` | 346 | **No.** A pure `DownloadRequest` → SQL translation of design §2.9. Moves anywhere. |
| `src/utils/download/descriptor.js` | 119 | **No.** stac-js object → dataset descriptor. stac-js is upstream's object model too. |
| `src/utils/download/support.js` | 63 | **No**, apart from importing this app's parquet predicates. |
| `src/utils/download/hyparquet.js` | 61 | **No.** Any bundler-hosted app needs this. |
| `src/codegen/DownloadRequestGenerator.js` | 57 | **No.** |
| `widgets.config.js` | 29 | **Yes**, by definition: this is the registration. |

The genuinely portolan-specific lines are: reading the current entity from
this app's Vuex store, `MapMixin`/`BboxDrawInteraction` for the map, the
bootstrap-vue-next components, the i18n keys, and the widget-hook
registration. That is the list a port has to revisit — about 30 lines inside
one component, not a fork of the logic.

### Why the search box is this app's and not the adapter's control

Design §5.3 says to mount `@cnmw/maplibre`'s `GeocoderControl` on the map.
The panel instead drives `@cnmw/geocoder-core` directly from a
`b-form-input` and a `b-list-group`, and uses the adapter only for
`addAreaLayer` — drawing the outline, which is what a map adapter is for.
Reasons: the search box belongs in the panel's flow next to "or upload a
GeoJSON", not floating over a 240px map; it inherits the app's theme, focus
styles and i18n for free; and the results list is where the app's own
conventions (`SearchBox.vue`) already live. The core carries the ranking,
the index loading and the progressive geometry resolution either way — the
control is only DOM.

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
- `view-catalog-meta-end` and `view-item-secondary-end` are the right hooks.
- Rejecting `assetActions.config.js` was correct: those produce a link-out,
  and this is not a link.
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
- **The page's map instance is not reachable from a widget.** §5.3 says to
  mount onto "the existing `MapView.vue` map instance, obtained via the
  store". `MapView` holds it in component data; it is not on the store, not
  `provide()`d, and not emitted, and `WidgetHook` renders widgets with no
  context and no event channel. The panel therefore renders its own small map,
  which is what `MapSelect.vue` does for the search view's bbox picker. §5.4's
  advice to take the map as a prop is right in spirit and is how a host that
  *can* supply one should do it.
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
front, which is what makes the panel genuinely absent on them.

## The path to a stac-browser widget

Upstream STAC Browser shares the widget, action and codegen systems verbatim,
and uses the same stac-js object model and the same Vuex `state.data`. The
port is:

1. **Keep** `descriptor.js`, `support.js`, `hyparquet.js` and both generators
   as they are. They touch nothing portolan-specific except this app's parquet
   predicates in `support.js` (about ten lines to inline).
2. **Change the map acquisition.** Take the map as an optional prop and fall
   back to creating one, instead of mixing in `MapMixin`; upstream's `Map.vue`
   differs. This is the one structural change, and designing for it is why the
   map work is isolated in `initMap`/`attachMapLayers`.
3. **Swap `BboxDrawInteraction`** for whatever upstream has, or carry the
   class: it is 136 dependency-free lines.
4. **Expect poorer metadata.** Upstream catalogs rarely carry `partition:*`,
   `table:*` or a GeoParquet 1.1 covering. The derivation already falls back
   (§2.4's chain), and the estimate fills what is missing from the parquet
   footer — but with no covering there is no row-group pruning, and the panel
   should say so rather than appear to offer the same thing.
5. **Drop nothing else.** No Portolan styles or render-order code is involved.

## Known gaps

- **A collection with several parquet `data` assets** (benchmark-data-catalog
  publishes `fields`, `boundary_lines` and `chips` side by side) silently
  downloads the first. §2.4 has no asset-choice step and the panel offers no
  picker. This needs a design answer before it needs code.
- **`s3://` partition globs.** The FIRMS collection publishes its
  `partition:glob` as an `s3://` URI, which DuckDB and the QGIS plugin can
  read and a browser cannot. The panel refuses with a message naming the
  scheme rather than failing mid-estimate, but the right fix is upstream: a
  collection that wants browser downloads should publish an HTTPS glob, or a
  `collection-mirror` asset to enumerate from.
- **Shared boundaries are intersections.** Downloading ADM2 units for
  Liechtenstein returns 17 rows, not the 11 municipalities: six neighbouring
  Swiss and Austrian units share a boundary line, and `ST_Intersects` is true
  for a shared boundary. That is correct and documented behaviour (§2.2), but
  it will surprise users. The `clip` spatial mode is the answer and is not
  implemented yet (design §O7).
- **Estimates are wide.** Metadata-only estimation reported "31 rows (between
  0 and 1,536)" for a download that produced 17. That is the honest number
  from row-group statistics, and the design's opt-in one-row-group sampling
  (§O12) would narrow it.
- **`MapSelect.vue` probably has the layer-ordering bug this branch fixes for
  its own map:** `BboxDrawInteraction` adds its source in its constructor, and
  `MapMixin.createMap` replaces the whole style immediately afterwards to load
  the basemap, which drops it. `setExtent` then silently does nothing. Not
  touched here; worth a separate issue.
