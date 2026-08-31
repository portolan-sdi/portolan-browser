<!-- Release headings are shortcut reference links (`## [5.0.0]`), the Keep a
     Changelog convention. package.json disables this rule by name, but under
     pnpm's strict layout that registers a second copy of the rule rather than
     turning off the one remark-preset-lint-recommended already enabled, so the
     disable never takes effect. This directive works by rule name instead. -->
<!-- lint disable no-shortcut-reference-link -->

# Changelog

All notable changes to Portolan Browser are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Portolan Browser is a fork of [STAC Browser](https://github.com/radiantearth/stac-browser) and versions
independently of it. Entries above [Upstream STAC Browser History](#upstream-stac-browser-history) belong
to this fork. The upstream history is kept below for reference, and its version numbers are upstream's.
Portolan Browser 0.1.0 forked from upstream 5.1.0-dev.

## [Unreleased][]

## [0.1.0][] - 2026-08-31

First release of the Portolan fork, and the reference implementation for
[Portolan 0.1](https://github.com/portolan-sdi/portolan-spec).

### Fork Highlights

These are the differences from upstream STAC Browser, accumulated since the fork.

- Collection MapLibre GL styles carried as `style`-role assets are discovered and applied, with a style
  picker and legend when a collection ships more than one
- GeoParquet assets are read in the browser with hyparquet and drawn on the map without a tile server,
  including reprojection to lon/lat for files in a projected CRS
- A data preview panel lists GeoParquet rows with a per-column filter
- COG assets decode client-side through deck.gl-geotiff in a Web Worker, and the STAC `render` extension
  supplies colormap, rescale, and nodata values as switchable named styles
- PMTiles archives and XYZ/TileJSON vector tiles render as collection layers
- The start page is built from the Portolan registry rather than a list held in this repository
- MapLibre GL replaces OpenLayers as the mapping library, and basemaps are MapLibre style documents
- The map expands in place instead of entering fullscreen

### Detailed Changes

The sections below list every change since upstream 5.0.0. Some arrived through upstream syncs rather
than fork work.

#### Added

- The catalog list on the start page is pulled from the [Portolan registry](https://github.com/portolan-sdi/portolan-registry), configurable via the new `registryUrl` option
- Catalogs on the start page show the publisher's logo where the registry has one
- Search filters are now preserved for collection and item searches
- Opening a collection from the collection search results carries the search criteria over into its item filters
- An indicator on the item filter toggle shows when the filters were changed but not applied yet
- Added basic support for the STAC API extensions Transactions (for Items) and Collection Transactions, including validation
  - Adds three new config options: `transactions`, `transactionsRequireLogin` and `transactionsRequirePreflight`
  - Support for external management UIs via `create-form` and `edit-form` links ([RFC 6861](https://www.rfc-editor.org/rfc/rfc6861.html)) in the "Manage" menu

#### Changed

- The catalog list on the start page names the Portolan registry and links to it

#### Removed

- The "Static Catalog" badge on the start page; only API entries carry a badge now
- The host line under each catalog on the start page, which repeated the same host down the whole list

#### Fixed

- Basemap place and street labels draw above collection data, and basemap buildings draw below it
- Collapsible section headers follow the theme palette instead of hardcoded colours, so a rebrand reaches them
- The map style picker lists each style once when a collection declares it both as an asset and in a `portolan:styles` manifest
- The GeoParquet data preview no longer freezes the tab on a wide table: rendering is paginated within a fixed cell budget and filtering is debounced
- The Search page restores the previous results when returning to it

## Upstream STAC Browser History

Everything below is the changelog of [STAC Browser](https://github.com/radiantearth/stac-browser), the
project this fork is based on. These version numbers are upstream's, not Portolan Browser's.

## [5.0.0] - 2026-07-31

### Added

- New Widget: `Featured`
- Allow widgets to be shown conditionally
- Added `relationTypes.config.js` to allow configuring link relation types that
  - are specifically STAC and should be used to navigate to and display in STAC Browser
  - should be hidden

### Changed

- Renamed SCSS variable `$logo-image-height` to `$logo-height` and CSS variable `--sb-logo-max-height` to `--sb-logo-height`
- Added SCSS variable `$header-background` to allow overriding the gradient background of the header via SCSS as well
- `buildTileUrlTemplate` can return `null` to not pass an asset to the tile server and use client-side rendering or no rendering at all

### Fixed

- URLs that were entered with a "wrong" trailing slash (e.g. `.../v1` although the server reports `.../v1/` as its URL) are corrected based on the self link of the server response and redirected.
- Widgets that provide a custom `component` without an `id` render correctly; widget definitions with neither are skipped with an error
- Use the Bootstrap z-index values to avoid overlay issues with the sticky header
- Fix logo size calculation, avoiding the site title wrapping into multiple lines
- Share button correctly shows with rounded borders on the right side
- Web-Optimized GeoZarr assets have "Show on Map" button
- The item filter panel reacts to programmatic open/close after the page has loaded

## [5.0.0-rc.2] - 2026-06-23

### Added

- The Browse menu also loads additional Collections on demand
- Minimal Docker build test and CI workflow.
- Docker: `pathPrefix` can be set at container startup via `SB_pathPrefix` when `DYNAMIC_CONFIG` is enabled (default)

### Changed

- `getBrowserPath` for STAC Objects is not available any longer, use `toBrowserPath` or other URL comparison mechanisms instead.
  **Note:** This is commonly used in `preprocessSTAC` config option, ensure to update your `config.js`.
- Internal rewrite of how API children are maintained
- Loaded collections are cached and no longer re-fetched when returning to a page
- Header stays at the top by default and has a different design. You can disable the sticky header in the `variables.scss` by setting `$header-position` to `static`.

### Fixed

- Alternate assets are considered as thumbnail and preview candidates if the original asset can't be shown in a browser
- Redirect bare `pathPrefix` URLs to their trailing-slash form in the Docker/nginx image (e.g. `/browser` → `/browser/`)
- Geometries that cross the antimeridian are split into multi-geometries so that footprints render correctly on the map
- Fix global error handling in certain edge-cases
- Improve speed of catalog/collection duplicate detection
- Fix search link detection
- The configured default collection and item sort is also applied to the Browse menu
- More requests that fail due to missing authentication are retried after login (incl. searches and downloads)
- A failed background load no longer switches the page after login

## [5.0.0-rc.1] - 2026-06-27

### Added
- Adding `extent`s to the root catalog will restrict the Search filters
- Support free-text search for Collections in list of collections
- Add a link to Collection Search from the Collections overview page for advanced filters
- New locales:
  - Swedish
  - Russian
- New config options:
  - `catalogTitleAfterImage`: Set a different title in the header after a logo.
  - `defaultCollectionSort`: Default sort order for Collections (replaces `cardViewSort`). The new default is different from the old default behaviour.
  - `defaultItemSort`: Default sort order for Items (replaces `cardViewSort`). The new default is different from the old default behaviour.
  - `preferredAssets`: Configure which (alternate) asset is shown by default. Defaults to preferring HTTP(S) alternates; set to `false` to revert back to the previous behaviour.

### Changed

- Only show language chooser when more than one locale is available
- Restrict Collection item search date picker to collection's temporal extent
- Focus temporal extent filter for Collection item search on end of temporal extent
- Disable temporal extent filter when a single date/time is provided as temporal extent in the Collection metadata
- Better default STAC title detection within not fully loaded lists where only a URL is available
- No search / sort functionality available when a static catalog has only a subset of children loaded
- The default value for `catalogTitle` is `null` instead of `STAC Browser`.
- Improved how the title is handled

### Removed

- Removed `cardViewSort` config option in favor of `defaultCollectionSort` and `defaultItemSort`

### Fixed

- Link color on data source list selection improved
- Improve the background color for dark mode on the map text controls.
- Improve the map control background colors on dark mode.
- CQL2 text representation of array operators (`a_overlaps`, `a_contains`, `a_equals`, `a_contained_by`) now uses function-call syntax as defined by the CQL2 text grammar
- Fix loading the root route when a `catalogUrl` is set
- Fix that in some cases the `catalogUrl` is lost

## [5.0.0-beta.1] - 2026-05-12

**THIS IS A BREAKING RELEASE - MAKE SURE TO UPDATE ALL YOUR CONFIG FILES!**

### Added

- Allow manually entering bounding boxes for search
- Generate code examples for Global Item Search, Collection Search, and collection-scoped Item Search
- Inputs to enter bounding boxes for search manually
- Plugin system for widgets
- Support for Sortables
- Support `SB_CONFIG` for loading a custom config module
  - Expose `SB_CONFIG` as a Docker build argument
- Support Vite `loadEnv` for `.env` config overrides
- CQL2 / Queryables:
  - Allow negating CQL2 filters (globally and per filter)
  - Support CQL2 Advanced Comparison Operators
  - Support CQL2 Array Functions
- Ignored metadata fields can be configured in `fields.config.js`
- PlayWright tests
- Add config option `displayOverviewsForChildren` to toggle visualizing overviews for maps showing many STAC Items
- Render GeoParquet files in a projected CRS by reprojecting them to lon/lat, using the PROJJSON definition in the file's own GeoParquet metadata. Positions outside the projection's input domain, or far outside the CRS's declared area of use, are dropped along with their feature and reported rather than drawn in the wrong place; a file that identifies a CRS but supplies no usable definition is refused outright.
- Apply a collection's MapLibre styles to GeoParquet assets rendered directly on the map, not just to its tiled assets. Only the attribute columns the styles reference are read from the file.
- Color modes:
  - Support for dark mode (defaults to auto-detection based on system settings of the user)
  - Added `enforcedColorMode` config option to enforce a specific color mode (e.g. always show "light" mode)
  - Added a color mode switch in the header (next to the language chooser)
  - Portolan pins `enforcedColorMode` to `light` for now: the MapLibre map stack does not follow the color mode yet
- Added more documentation around styling

### Changed

- Migrated from Vue.js 2 to 3 (incl. vue-router, vuex, vue-i18n, etc.)
- Migrated from vue-cli to Vite
- Migrated from BootstrapVue (Bootstrap 4) to BootstrapVueNext (Bootstrap 5)
  - Boostrap CSS variables might have been renamed, make sure to check your custom CSS
- Replaced the timepicker component, make sure to update the `datepicker.js` in any custom locales
- The config.js file needs to be updated, replace `module.exports =` with `export default`.
- The main HTML file (`public/index.html`) has moved to `index.html` and has various changes. Make sure to check any changes you made.
- The runtime config file (`public/config.js`) has been renamed to `public/runtime-config.js`
- Replaced `v-clipboard` with `@vueuse/core` clipboard support
- All link and asset actions must be updated, similarly also check all the config files for changes:
  - `i18n.t` must be replaced with `i18n.global.t`
  - You may also have to update imports of `Utils` or other constants.
    Most imports have moved to stac-js.
    For example, `Utils.isObject` is now `isObject` and can be imported from `stac-js/src/utils.js`.
- It is not needed any longer to update the path to the `runtime-config.js`, the `pathPrefix` is added automatically in the build process.
- User stay logged in across sessions (for OpenID Connect only)
- CSS declarations have been updated to reuse existing variables in favor of hardcoding certain colors etc.
- `configureBasemap` accepts an additional parameter, the VueX Store (e.g. for different basemaps depending on the color mode).

### Removed

- CLI parameters for npm commands (e.g. `npm run build -- --catalogUrl="https://example.com"`) as they are not supported by Vite. Make sure to check your CI scripts and Docker files.
- Support for customizing `authConfig` through the root catalog has been removed. Use the STAC Authentication extension instead.

### Fixed

- Discover MapLibre styles from assets carrying the `style` role, as Portolan's spec defines, instead of a `portolan:styles` manifest the spec no longer defines. The default style is the asset that also carries the `default` role, falling back to a `portolan:styles` manifest's order and then to asset document order for catalogs published before that rule; manifest entries the asset scan misses are still merged in, so half-migrated catalogs keep all their styles
- Handle state of downloads better and confirm leaving the page when downloading
- Better error on request to the `/collections` or `.../items` endpoints
- Collection list on Global Item Search was empty in certain situations
- Show an error message when no operator is supported for a queryable
- Don't show an "unsupported" error when only Collection Search is supported by the API
- Remove download button for ZARR assets
- Fixed authentication for assets when authentication methods is not configured in STAC Browser

## [4.0.1][] - 2026-02-11

- Added a config option `footerLinks` to add links to the footer (e.g. imprint, privacy policy, etc.)
- Alphabetical sorting of badges
- Update F3D preview URL in F3D action plugin
- Prevent item and catalog cards from stretching to the entire grid width
- Prevent keywords from overlapping with temporal extent in item and catalog cards
- Improved list layout for catalogs/collections
- Fix map layer title detection for STAC Links
- Fix resolving auth and storage schemes
- Small UI improvements (e.g. icons, spacing)
- Updated dependencies and translations

## [4.0.0][] - 2025-12-15

**THIS IS A BREAKING RELEASE - MAKE SURE TO UPDATE ALL YOUR CONFIG FILES!**

- Migrated from Leaflet (and stac-layer) to OpenLayers (and ol-stac)
  - New layer switcher
  - Support for multiple projections
  - Support for more advanced basemaps (e.g. Vector Tiles) - make sure to update your `basemap.config.js`, see new documentation for details
  - Support for more web-map-link types (WMS, WMTS KVP & REST, XYZ, PMTiles)
  - Read additional metadata for better default COG rendering
  - New or updated config options: `displayPreview`, `displayOverview`, `buildTileUrlTemplate`, `getMapSourceOptions`, `crs`
  - Removed config options: `geoTiffResolution`, `maxPreviewsOnMap`
  - and much more...
- Integration of stac-js into the codecase
  - Allows for more flexibility in Link and Asset actions
- Improved layout / design:
  - New header design with custom logo option (please provide feedback, we plan an even better version for v5.0)
  - New grid system for the item and catalog cards
- Locales:
  - Added Polish
  - Updated locales for several languages
- Collection Search shows a map of the results
- Support showing GeoJSON assets on the map (with a detail view)
- Improved sorting behavious in search requests with some small UI tweaks
- Show license for catalogs, if provided
- Sort the languages in the chooser using the native names
- Improved request error handling, e.g. show server error messages from response
- **BREAKING:** Configuration (in `config.js`) - see the documentation for details:
  - Removed deprecated options and related functionality for `redirectLegacyUrls` and `stacProxyUrl`
  - Renamed `maxItemsPerPage` to `maxEntriesPerPage`
  - Split config option `itemsPerPage` into `searchResultsPerPage`, `itemsPerPage`, `collectionsPerPage`
  - `allowedDomains` accepts more patterns
  - Config option `preprocessSTAC` now receives a stac-js object as parameter
  - New config option `catalogImage` to provide an logo for the header
- **Deprecation:** CLI parameters for npm commands (e.g. `npm run build -- --catalogUrl="https://example.com"`) are deprecated and will be removed in v5 as they are not supported by Vite
- Bug fixes, for example:
  - Search results display order did not match API response order #621
  - Fix number formatting in international English #639
  - Fix compatibility for OGC APIs #646
  - Make popovers work on MacOS (Safari) #655
  - Show links to prev/next/latest versions if deprecated is not set
  - CSS improvements for catalog/collection list layout
  - Handle thumbnails von S3 storage better
  - Fixed geojson.io action
  - Fixed the ability to define custom logos in the header
  - Avoid language reset after data source selection
  - Fixed item asset rendering
  - Fixed downloading of assets with relative URLs
  - `file:local_path` is correctly applied in alternative download mode
  - Fix confusing number representation in bullet point listings
  - Removed command `i18n:report`, which was not working anymore
  - Fix the default basemap config
  - Show only storage schemes that actually apply

## [3.3.5][] - 2025-07-05

For releases prior to v4.0.0, please refer to the
[release notes in the GitHub Releases](https://github.com/radiantearth/stac-browser/releases).

[Unreleased]: https://github.com/portolan-sdi/portolan-browser/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/portolan-sdi/portolan-browser/releases/tag/v0.1.0
[5.0.0]: https://github.com/radiantearth/stac-browser/compare/v5.0.0-rc.2...v5.0.0
[5.0.0-rc.2]: https://github.com/radiantearth/stac-browser/compare/v5.0.0-rc.1...v5.0.0-rc.2
[5.0.0-rc.1]: https://github.com/radiantearth/stac-browser/compare/v5.0.0-beta.1...v5.0.0-rc.1
[5.0.0-beta.1]: https://github.com/radiantearth/stac-browser/compare/v4.0.1...v5.0.0-beta.1
[4.0.1]: https://github.com/radiantearth/stac-browser/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/radiantearth/stac-browser/compare/v3.3.5...v4.0.0
[3.3.5]: https://github.com/radiantearth/stac-browser/releases/tag/v3.3.5
