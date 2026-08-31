# Portolan Browser <!-- omit in toc -->

Portolan Browser is a web viewer for [Portolan](https://www.portolan-sdi.org/) catalogs. Point it at a
catalog and it draws the data on a map, renders the tables behind that data, and lets you walk the
metadata without installing anything.

A live instance runs at <https://browser.portolan-sdi.org>. It opens on the catalogs listed in the
[Portolan registry](https://github.com/portolan-sdi/portolan-registry), so you can browse published data
straight away.

This is a fork of [STAC Browser](https://github.com/radiantearth/stac-browser), maintained by the
Portolan project. STAC Browser already handles STAC well. Portolan catalogs carry more than STAC
requires, including cartography, cloud-optimized files, and registry metadata that a generic STAC client
has no reason to understand. This fork uses all of it. Everything upstream does still works, and a plain
STAC catalog opens here too.

## Table of Contents <!-- omit in toc -->

- [What This Fork Adds](#what-this-fork-adds)
- [Quick Start](#quick-start)
- [Browse Your Own Catalog](#browse-your-own-catalog)
- [Deploy an Instance](#deploy-an-instance)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [Relationship to STAC Browser](#relationship-to-stac-browser)
- [Development](#development)
- [Contributing](#contributing)
- [License and Credits](#license-and-credits)

## What This Fork Adds

**The publisher's own cartography.** A Portolan collection registers MapLibre GL styles as assets with
the `style` role. The browser discovers them, applies them to the collection's data, and offers a picker
with a legend when a collection ships more than one. Data looks the way whoever published it meant it to
look, rather than taking a default colour the client picked.

**GeoParquet drawn directly on the map.** The browser reads GeoParquet in the browser with
[hyparquet](https://github.com/hyparam/hyparquet) and hands the geometries to MapLibre. No tile server
sits in between. Files in a projected CRS are reprojected to lon/lat through proj4 first. Size limits
stop a large file from locking up the tab, and the browser says so when it declines to draw one.

**A table view of that same GeoParquet.** A data preview panel lists the rows with a per-column filter.
Reading the attributes no longer means downloading the file and opening something else.

**Cloud-Optimized GeoTIFF rendered client-side.** COG assets decode through
[deck.gl-geotiff](https://github.com/developmentseed/deck.gl-geotiff) in a Web Worker, which keeps decompression
off the main thread. Where a collection uses the STAC [render extension](https://github.com/stac-extensions/render),
the browser applies its colormap, rescale, and nodata values, and lists each named render as a style you
can switch between.

**A start page built from the registry.** The catalog list comes from the Portolan registry's nightly
crawl rather than a list hardcoded in this repository. Entries show the publisher's logo and the
collection and feature counts the crawl measured. Point [`registryUrl`](docs/options.md#registryurl)
somewhere else to offer a different list.

**MapLibre GL throughout.** Upstream maps with OpenLayers. This fork replaced it with MapLibre GL so that
publisher styles, PMTiles, and deck.gl layers all run on one renderer. Basemaps are MapLibre style
documents, and the map expands in place instead of going fullscreen.

## Quick Start

Clone the repository and install dependencies. The project uses [pnpm](https://pnpm.io/) and commits a
lockfile.

```bash
git clone https://github.com/portolan-sdi/portolan-browser.git
cd portolan-browser
pnpm install
```

Start the development server:

```bash
pnpm start
```

This serves the browser on <http://localhost:8080>, opening on the registry catalog list. Vite moves to
the next free port when 8080 is already taken, and prints the one it chose.

## Browse Your Own Catalog

Set `catalogUrl` to pin the browser to a single catalog. It then skips the start page and opens there.

```bash
# Linux / macOS
SB_catalogUrl="https://data.source.coop/ftw/global-data/catalog.json" pnpm start
# Windows (PowerShell)
$env:SB_catalogUrl="https://data.source.coop/ftw/global-data/catalog.json"; pnpm start
```

Any STAC catalog or STAC API works, not only Portolan ones:

```bash
SB_catalogUrl="https://earth-search.aws.element84.com/v1/" pnpm start
```

To open a catalog from your own disk, see [Using Local Files](docs/local_files.md).

## Deploy an Instance

Build the static site:

```bash
SB_catalogUrl="https://data.source.coop/ftw/global-data/catalog.json" pnpm run build
```

`dist/` then holds everything needed to serve the browser. Copy it to any static host. There is no
server-side component and nothing to keep running.

Two settings usually need attention:

- Serving from a subdirectory rather than a domain root requires [`pathPrefix`](docs/options.md#pathprefix).
- The default [`historyMode`](docs/options.md#historymode) in this fork is `hash`, which works on any
  static host. Switching it to `history` gives cleaner URLs but needs URL rewriting configured on the host.

A [Docker image](docs/docker.md) is also available.

## Configuration

Options can be set in [`config.js`](config.js), in an external file via `SB_CONFIG`, through `SB_*`
environment variables, or in a runtime config file read after the build. Vite also loads `.env` and
`.env.local`, which is a convenient place for local overrides.

```bash
SB_CONFIG=./config.local.mjs pnpm start
```

The full list is in the **[options documentation](docs/options.md)**.

## Documentation

| Topic | Document |
| ----- | -------- |
| Every configuration option | [options.md](docs/options.md) |
| Basemaps and projections | [basemaps.md](docs/basemaps.md) |
| Styling and theming | [styling.md](docs/styling.md) |
| Translations and locales | [localization.md](docs/localization.md) |
| Metadata rendering and custom fields | [metadata.md](docs/metadata.md) |
| Widgets | [widgets.md](docs/widgets.md) |
| Actions on links and assets | [actions.md](docs/actions.md) |
| Code snippet generators | [code-generators.md](docs/code-generators.md) |
| Running under Docker | [docker.md](docs/docker.md) |
| Opening catalogs from disk | [local_files.md](docs/local_files.md) |

To publish a catalog this browser can read, start with the
[Portolan specification](https://github.com/portolan-sdi/portolan-spec) and the
[Portolan CLI](https://github.com/portolan-sdi/portolan-cli).

## Relationship to STAC Browser

Upstream STAC Browser is the foundation, and this fork tracks it. Fixes and features from upstream come
in through periodic sync pull requests, and fixes that are not Portolan-specific go back upstream where
they apply.

The two projects version independently. Portolan Browser starts at 0.1.0, matching the Portolan
specification release it implements. Upstream's version is recorded in the changelog when a sync lands.
The changelog keeps upstream's history below the fork's own entries.

## Development

```bash
pnpm run test:unit         # Vitest unit tests
pnpm run test:e2e          # Playwright end-to-end tests
pnpm run lint              # ESLint, with fixes applied
pnpm run docs:lint         # Markdown linting
pnpm test                  # Everything
```

[CONTRIBUTING.md](CONTRIBUTING.md) covers the test suites in more detail.

## Contributing

Issues and pull requests are welcome. Portolan is an evolving standard and the browser is the reference
implementation, so gaps between the two are worth reporting.

- Bugs and feature requests: [GitHub issues](https://github.com/portolan-sdi/portolan-browser/issues)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Agent norms for this repository: [AGENTS.md](AGENTS.md)
- Discussion: the [Portolan Google Group](https://groups.google.com/g/portolan) and the
  [Portolan channel](https://cloudnativegeo.slack.com/archives/C0A1JBH9529) in Cloud-Native Geo Slack

Changes to the standard itself belong in [portolan-spec](https://github.com/portolan-sdi/portolan-spec).

## License and Credits

ISC, inherited from STAC Browser. See [LICENSE](LICENSE).

STAC Browser is built by [moreGeo](https://moregeo.it) and contributors, with funding from swisstopo,
Radiant Earth, Natural Resources Canada, EOEPCA / ESA, Spacebel, Planet, CloudFerro, and Geobeyond. The
[upstream repository](https://github.com/radiantearth/stac-browser) lists what each of them funded.
Portolan Browser is built on that work.
