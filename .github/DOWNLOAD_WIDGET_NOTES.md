<!-- lint disable no-shortcut-reference-link -->

# The "Download data" widget: architecture notes

Notes for the reviewer of the `download-widget` branch, and for whoever
later extracts this into a widget for upstream STAC Browser. Written against
the cloud-native map widgets design document in `cn-geocoding`
(`docs/design/widgets-architecture.md`), whose section numbers are cited
throughout.

- [What it does](#what-it-does)
  - [The on-map redesign](#the-on-map-redesign)
  - [The card's choices](#the-cards-choices)
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
2. **A choice of what, when and which rows.** Which parquet table, when the
   collection publishes several; a date range, when it declares a time
   column; and column predicates built from the table's own columns. Every
   one of them re-estimates. See [The card's choices](#the-cards-choices).
3. **An estimate.** Rows, bytes read, per-format output size, and the
   pruning cascade behind the numbers, from parquet footer metadata alone —
   no row data is read to produce it. It runs by itself as soon as there is
   an area: metadata-only estimation is cheap enough that making the user
   press a button for it was the wrong trade.
4. **A download.** GeoJSON or GeoParquet, written in the browser from the row
   groups the area actually intersects, with progress in rows and bytes,
   pause, resume and cancel, a success state that says what landed where,
   and a refusal when the request exceeds the safety ceiling. The save starts
   immediately — `showSaveFilePicker` where the browser has it, otherwise a
   Blob anchor the widget creates, clicks and throws away. There is no
   rendered link to find.
5. **The request as code.** The portable `DownloadRequest` JSON and the
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

### The card's choices

The first cut asked one question — *where* — and answered everything else
by taking the first thing it found. Against real catalogs that produced two
bad outcomes: a 1.4 MB chip index silently became an 889 MB field-boundary
read, and a 26-year fire archive offered a 10.2 GB one. The card now asks
three questions, each of which re-runs the estimate.

**Which table.** A Fields of the World benchmark collection publishes four
parquet assets with role `data` (`fields`, `fields_filtered`,
`boundary_lines`, `chips`), each with its own `table:columns` and
`table:row_count`; a FIRMS year item publishes its detections beside two
`aggregate` tables of itself. §2.4 has no asset-choice step — it takes the
first `data`-role parquet asset — so the choice is made *before* the
derivation, in `src/utils/download/assets.js`:
`narrowToAsset(collectionJson, key)` hands the derivation a copy of the
collection with the other candidates removed and the chosen asset's own
`table:`/`geoparquet:`/`proj:` fields lifted to where §2.4 reads them.

Narrowing rather than patching the derived descriptor, because the choice
changes the *table*, not just the URL: its columns, its bbox covering and
its time column all come from the asset. Two rules follow from real data:

- An asset with no `table:` fields of its own keeps the entity's **only if
  it is the primary (first) one** — the entity's fields describe that asset.
  A FIRMS item's `table:columns` describe `detections.parquet`, and handing
  them to `aggregate-r5`, whose schema is daily columns, would have
  projected columns that are not in it. With nothing declared, `estimate()`
  infers the table from the parquet footer, which costs no extra request.
- An asset that declares **no roles at all** counts as a candidate, and the
  narrowed copy gives it role `data`. §2.4 only looks at role-`data` assets,
  so a catalog that omits `roles` — plenty do — used to be refused with "no
  parquet data asset found" even though the cheap condition had said yes.

The picker labels each table with its title, `table:row_count` and
`file:size`, all of which are in the collection JSON already, so choosing
costs nothing. A partitioned collection gets no picker: its source is the
partition set, not an asset.

**When.** `FilterSpec.time` is the cheapest filter a partitioned dataset
has — `partitionPruneCascade` drops whole files whose declared interval
misses the window before a footer is read. Measured in the app against the
live FIRMS mirror, for Contra Costa County:

| Window | Files | Read from storage |
| --- | --- | --- |
| none | 27 of 27 | 10.2 GB (over the 4 GB ceiling) |
| August 2025 | 1 of 27 | 962 MB |

So the card carries a date range for any table whose derived
`table.timeColumn` is set, auto-populated from the entity's own temporal
extent, with `Last 30 days` / `Last year` / `Whole range` beside it.
`src/utils/download/time.js` holds the policy, and the one judgement call
in it is when the window should be **on** by default: only when the extent
is wider than two years. A benchmark collection covering 2021 *is* the
dataset, and defaulting it to December would silently drop eleven months of
what the user asked for by name; a 26-year archive is never meant to be
taken whole from a browser.

Within one file the window does nothing for FIRMS: its row groups are not
sorted by time, so every row group's `acq_datetime` statistics span the
whole year and `pruneRowGroupsByTime` honestly selects all of them. The win
is entirely at the file level, which is what the narration shows.

**Which rows.** Column predicates are built from the chosen table's own
`table:columns` — numeric columns get comparisons, text columns get
`contains`, everything gets the two null tests — and are ANDed onto the
`where` prop's. They do not change the estimate's byte count, because
`evaluateWhere` runs per row after the read; the card says so rather than
leaving an unchanged "read from storage" looking like a filter that did
nothing.

**Saying the numbers honestly.** O12's `Bounded` has three readings and the
card now distinguishes them: an `exact` number is said plainly, a modelled
one is `≈36,469` with its bounds behind it, and a *wide* one
(`max/estimate > 10`, the package's own threshold) leads with the range —
`0 – 768` with `likely ≈15` as the footnote — because a point estimate
there is a guess wearing a suit. A fourth case is the row cap: when
`capBounded` has pushed the estimate up against `limit`, the card says `up
to 100,000` and names the limit, instead of claiming a measurement.
Output size is per format, from each format plugin's own `estimateBytes`
(GeoJSON text of the same rows runs roughly three times a GeoParquet file),
shown on the button that would produce it. "Why this estimate" expands into
the pruning cascade stage by stage, with each stage's own basis sentence
from `@cnmw/download-core`, plus the files, row groups, requests, output
columns and whether the row cap bound.

**Seven formats, two of which cost something to offer.** GeoJSON and
GeoParquet are built into `@cnmw/download-core`. GeoPackage, FlatGeobuf,
Shapefile, CSV and Esri JSON are separate packages (E10) that register a
*descriptor* — id, label, extension, media type, a synchronous
`estimateBytes` and an `approxBytes` weight — through
`registerLazyFormat`, and whose `load()` is not called until a download for
that id starts. That is what makes offering GeoPackage honest: the button
can say `+331 kB` before sql.js's wasm is fetched, and a user who wanted
GeoParquet never fetches it. `src/utils/download/formats.js` does the
registration and the listing; `listFormats()` never resolves a plugin.

Two consequences in the card. The format row is two primary buttons and a
"More formats" toggle, because seven buttons is 200 pixels of a card that
has to fit on a hero map. And a lazy load is a phase of the run: the
`loading-format` progress event becomes "Loading the GeoPackage writer…",
and a failure is `FORMAT_LOAD_FAILED`, which the card says in words and
points at the two formats that need nothing. The CDN fetch for GeoPackage
and FlatGeobuf is the only code this widget loads at runtime; a deployment
with no outbound internet keeps the other five.

Shapefile's limits arrive as `warning` events from the plugin's `close()`
— "Column `country_units` was renamed to `COUNTRY_UN` to fit dBase's
10-character field-name limit" — and land in the success state beside the
file they are about, deduplicated and capped at four. `download()` also
re-emits every *estimate* warning on the same channel, so those are
filtered out by code; they are already on screen above.

Verified against `geoboundaries-catalog/adm2` (Liechtenstein, 17 rows),
written and saved from the browser: `.geojson` 385 kB, `.parquet` 82 kB,
`.gpkg` 320 kB, `.shp.zip` 278 kB, `.csv` 618 kB, `.fgb` 270 kB.

**Output-size models are about columns, not geometry.** Those measured
sizes are also the clearest open problem: every `estimateBytes` is
bytes-per-row from the *column count*, so for boundary polygons with
thousands of vertices the models are low by a lot (GeoJSON modelled at most
334 kB and wrote 385 kB; CSV modelled 134 kB and wrote 618 kB). The card
says so in "why this estimate" rather than pretending the bound is one.
`download()` checks the same model against `ceiling.blobBytes`, so the
under-count is upstream's to fix — `estimate()`'s own
`genericOutputBytesModel` (compressed read bytes per row × 1.6) is better
calibrated for this data and could be the floor every format model is
clamped to. **Worth passing upstream.**

**Empty results are a state, not a zero.** An estimate whose upper bound is
zero shows what emptied it and, when it was the dates, a one-click way out.
This is not hypothetical: the FIRMS collection's temporal extent currently
runs two months past its newest published parquet file, so the default
"last 30 days" window selects 27 files and then drops all of them.

**The run and the end of it.** Progress is rows matched and bytes read, not
just a bar, because with no bbox covering the bar sits still for a long
time while the numbers move. Pause and resume are the handle's own, which
means they take effect at a row-group boundary (the engine awaits the
progress hook between row groups) — the button therefore follows the
handle's `state` events rather than the widget's idea of what it did.
Cancel, success and failure are three separate end states:

- **Cancel** reports the rows read when it stopped and that nothing was
  kept. The sinks do the keeping-nothing: `blobSink` drops its chunks, and
  `fileSystemSink` removes the partial file where the browser allows it.
- **Success** carries the filename, the rows, the bytes and the elapsed
  time — measured in the widget, because `DownloadHandle.result.elapsedMs`
  is the *estimate's* elapsed time (`download.js` builds the result with
  `elapsedMs: est.elapsedMs`), which on a one-minute read is the one number
  a user would never mean.
- **Failure** is the error taxonomy in words. The taxonomy's own rule is
  that the `code` is the API and the message is for humans and may be
  reworded, so all 31 codes have an i18n key saying what happened and what
  to do; an unknown code still falls back to `CODE: message`.

**The `s3://` refusal was too wide, and that mattered.** The widget used to
refuse any descriptor whose `source.url` *or* `source.glob` was not
`http(s)`. FIRMS publishes its `partition:glob` as an `s3://` URI, so the
whole 632M-row archive was refused — but the browser never fetches that
glob. With no `collection-mirror` asset, §2.4 derives a `stac-items`
enumeration, and each year's concrete file URL comes from that item's own
`data` asset over https. `fetchTargets()` in `descriptor.js` now reports
only what would actually be fetched (the glob for `declared`/`values`
enumeration, the mirror URL, the collection URL, the bucket endpoint), and
the refusal applies to that. A single-file `parquet` source with an `s3://`
href still refuses, which is the case the message was written for.

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

Two scripts at the repo root drive the real thing against real catalogs,
with no mocks and no second server (the catalogs, the parquet files and the
names index all come from Source Cooperative):

- `verify-download-widget.mjs` — the whole flow once, on
  `geoboundaries-catalog/adm2`: search, area on the page's own map,
  estimate, both downloads, and the files read back with hyparquet to prove
  they are valid. Writes `verify-download-widget.png` and
  `verify-download-widget-pill.png`.
- `verify-download-card.mjs` — the card's choices, on three catalogs:
  the four-table picker on `ftw/benchmark-data/at_2021`, the date window on
  the 27-file FIRMS archive (with the empty state its stale extent
  produces), a finished download's success state, and pause / resume /
  cancel on the FIRMS 2020 item. Writes `verify-download-assets.png`,
  `verify-download-firms.png`, `verify-download-success.png` and
  `verify-download-cancel.png`, which are the committed evidence for this
  branch.

Both take `APP_BASE` (default `http://localhost:8081`) and expect
`npx vite --port 8081` to be running.

The automated suites split the same way the flow does. `tests/unit/`
(`downloadWidget`, `downloadFilters`, `downloadHyparquet`) holds everything
that is a pure function of a collection JSON: the support gate, the §2.4
derivation and its asset narrowing, the time window policy, the `Bounded`
readings, the error taxonomy mapping and both code generators.
`tests/e2e/downloadWidget.spec.js` holds what the DOM does — the tool on
the map, the picker, the date row, the column filters and the human error
sentence — driving an uploaded GeoJSON area so a card appears without a
parquet file behind it. Anything that needs real bytes (a real estimate, a
real download, pause and cancel) is in the two verify scripts, because an
MSW fixture cannot serve range requests over a 797 MB file.

## What is reusable and what is portolan glue

Everything that understands areas, parquet, pruning, estimates and output
formats lives in the `@cnmw` packages and is host-agnostic. This repo adds
about 3,500 lines, of which the widget itself is most:

| File | Lines | Portolan-specific? |
| --- | --- | --- |
| `src/widgets/AreaDownload.vue` | 2,398 | **Partly.** The flow is generic; the Vue, the i18n keys and the on-map positioning (which corners this app's own map controls already own) are this app's. Roughly 670 of those lines are the scoped stylesheet the on-map chrome needs. |
| `src/codegen/DuckDbSqlGenerator.js` | 346 | **No.** A pure `DownloadRequest` → SQL translation of design §2.9. Moves anywhere. |
| `src/utils/download/descriptor.js` | 192 | **No.** stac-js object → dataset descriptor, plus which of its URLs a browser would actually fetch. stac-js is upstream's object model too. |
| `src/utils/download/assets.js` | 165 | **No**, apart from importing this app's parquet predicates. Enumerating a collection's parquet tables and narrowing it to one is §2.4's missing asset-choice step. |
| `src/utils/download/time.js` | 157 | **No.** STAC temporal extent → a default window and a `FilterSpec.time`. |
| `src/utils/download/formats.js` | 129 | **No.** Registers the five optional format packages lazily and lists what the card can offer, with each one's weight. |
| `src/utils/download/present.js` | 155 | **No.** `Bounded`, the pruning cascade and the error taxonomy, turned into things to say. No i18n in it: it returns the kind and the numbers, the card supplies the sentence. |
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

Since then the card has also come to depend on **E10's lazy format
registry** — `registerLazyFormat`, `resolveFormat`, `getFormat`,
`formatLoadState`, the `loading-format` progress event and the
`FORMAT_LOAD_FAILED` code — and on four new packages:
`@cnmw/format-gpkg`, `@cnmw/format-flatgeobuf`, `@cnmw/format-shapefile`
and `@cnmw/format-extras`. They are in the same sibling checkout and are
aliased the same way; a checkout without them fails to build the widget's
chunk, which is why the alias list in `vite.config.js` and
`vitest.config.js` names all nine packages.

## Known gaps

- **A cancel inside a row-group read is reported as a dataset failure.**
  Aborting the signal rejects the in-flight range request, and
  `download-core`'s `readRows` wraps any hyparquet throw as
  `DATASET_UNRESOLVED`, so `download()` ends in `failed` rather than
  `cancelled`. The widget works around it — it knows it asked — but the fix
  belongs in `parquet-io.js`, which can see `signal.aborted` and rethrow a
  `CancelledError`. **Worth passing upstream.**
- **Column filters cannot prune.** `where` predicates run per row after the
  read, so adding `frp >= 50` lowers the rows written and not the bytes
  read. Row-group min/max statistics could exclude row groups for a
  comparison on a plain column, exactly as the time filter does — a
  `pruneRowGroupsByPredicate` in `download-core` would make the card's
  column filters as cheap as its dates. **Worth passing upstream.**
- **No column projection in the card.** A FIRMS request reads all 19
  columns because the output takes all of them; most users want geometry,
  time and a couple of others. `FilterSpec.columns` already supports
  `include`/`exclude`/`dropGeometry`/`includeBbox`, and `readBytes` is
  computed from the read columns, so a projection row in the card would cut
  the largest number on screen. It is the obvious next thing.
- **FIRMS' temporal extent is ahead of its files.** The collection declares
  data to 2026-11-12; the newest published partition ends 2026-09-15. The
  default "last 30 days" window therefore selects nothing, and the card
  shows its empty state with a one-click "Whole range". The widget's
  behaviour is right either way, but the metadata is wrong at the source and
  is worth reporting to that catalog.
- **The format registry's load state is not reactive.** `formats()` is a
  plain function over module-scoped maps, so a Vue computed built on it
  cannot know that a lazy plugin has finished loading. The card bumps a
  counter after every run to re-read it, which works because that is the
  only moment a load can have happened. A registry event (`format-loaded`)
  would be the honest fix. **Worth passing upstream.**
- **Two formats fetch code from a CDN.** GeoPackage's sql.js wasm and
  FlatGeobuf's writer come from pinned jsdelivr URLs inside their
  packages' own `load()`. That is the design's zero-build path, and it is
  the one thing in this widget that fetches code at runtime: a deployment
  behind a strict CSP or with no outbound internet keeps the other five
  formats and sees `FORMAT_LOAD_FAILED` for these two. Both packages
  export an injection seam (`setSqlJsModule`, `setFlatGeobufModule`) if
  this app ever wants to bundle them instead, exactly as it already does
  for hyparquet.
- **Shared boundaries are intersections.** Downloading ADM2 units for
  Liechtenstein returns 17 rows, not the 11 municipalities: six neighbouring
  Swiss and Austrian units share a boundary line, and `ST_Intersects` is true
  for a shared boundary. That is correct and documented behaviour (§2.2), but
  it will surprise users. The `clip` spatial mode is the answer and is not
  implemented yet (design §O7).
- **Estimates are wide.** Metadata-only estimation reports "0 – 768, likely
  ≈15" for the Liechtenstein download that produces 17. That is the honest
  number from row-group statistics, and the card now leads with the range
  rather than the point estimate when the two are that far apart — but the
  design's opt-in one-row-group sampling (§O12) is what would actually
  narrow it, and is not implemented.
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
