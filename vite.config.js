import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, pathToFileURL, URL } from "node:url";
import { accessSync, readFileSync } from "fs";
import { resolve } from "node:path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import Components from "unplugin-vue-components/vite";
import { FileSystemIconLoader } from "unplugin-icons/loaders";
import { BootstrapVueNextResolver } from "bootstrap-vue-next/resolvers";

import { ViteEjsPlugin } from "vite-plugin-ejs";
import { visualizer } from "rollup-plugin-visualizer";

import yargs from "yargs";

// Read JSON files using fs instead of require
const configSchema = JSON.parse(
  readFileSync(new URL("./config.schema.json", import.meta.url), "utf-8")
);
const package_ = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

const isSchemaType = (schema, type) =>
  Array.isArray(schema.type) ? schema.type.includes(type) : (schema.type === type);

const optionsForType = (type) =>
  Object.entries(configSchema.properties)
    .filter(([, schema]) => isSchemaType(schema, type))
    .map(([key]) => key);

const defaultConfigPath = fileURLToPath(new URL("./config.js", import.meta.url));

// The @cng cloud-native map widget packages (geocoder/upload/download cores
// and the MapLibre adapter) that the "Download data" widget is built on.
//
// They are not published to npm yet, so this branch consumes them from a
// sibling checkout of the cng-map-widgets workspace rather than from
// node_modules: a Vite alias, not an npm `file:` dependency. The alias is
// one reviewable file and leaves pnpm-lock.yaml untouched, where `file:`
// links would rewrite the lockfile with paths that only resolve on a
// machine that has the sibling repo anyway.
//
// WHEN THESE PACKAGES ARE PUBLISHED, this block and SB_CNG_ROOT go away and
// these names become ordinary version-pinned dependencies in package.json.
// Nothing else in the app changes: every import is by package name already.
//
// Override the location with SB_CNG_ROOT (absolute, or relative to this
// file's directory).
const cngPackagesPath = (() => {
  const fromEnv = process.env.SB_CNG_ROOT;
  if (fromEnv) {
    return resolve(fileURLToPath(new URL(".", import.meta.url)), fromEnv);
  }
  return fileURLToPath(new URL("../cng-map-widgets/packages", import.meta.url));
})();

const cngAvailable = (() => {
  try {
    accessSync(resolve(cngPackagesPath, "download-core/src/index.js"));
    return true;
  } catch {
    return false;
  }
})();

if (!cngAvailable) {
  // Fail loudly here rather than as an unresolved-import error 200 lines
  // into a build log.
  console.warn(
    `[portolan-browser] The @cng widget packages were not found at ${cngPackagesPath}. ` +
      "The \"Download data\" widget will not build. Check out cng-map-widgets beside this repo, " +
      "or point SB_CNG_ROOT at it, or remove the widget from widgets.config.js."
  );
}

const cngAliases = Object.fromEntries(
  [
    "spec",
    "geocoder-core",
    "upload-core",
    "download-core",
    "maplibre",
    // The optional output formats. Each package is a small descriptor plus
    // its writer; anything heavy inside one (sql.js's wasm for GeoPackage)
    // is fetched by that descriptor's own `load()`, only once the user
    // picks the format.
    "format-gpkg",
    "format-flatgeobuf",
    "format-shapefile",
    "format-extras",
  ].map((name) => [
    `@cng/${name}`,
    resolve(cngPackagesPath, `${name}/src/index.js`),
  ])
);

// Parse an array-typed option from a single environment variable value.
// A full JSON array (e.g. '[{"label":"a","url":"b"}]') is used as-is, which
// allows arrays of objects. For convenience, a plain comma-separated list
// (e.g. 'en,de,fr') is also accepted and split into an array of strings.
const parseArrayEnv = (value) => {
  const raw = Array.isArray(value) ? value.join(" ") : String(value);
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }
  return trimmed
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
};

const parseEnvConfig = (rawEnv) => {
  const envArgs = Object.entries(rawEnv)
    .filter(([key]) => key.startsWith("SB_") && key !== "SB_CONFIG")
    .flatMap(([key, value]) => [`--${key.slice(3)}`, value]);

  const env = yargs(envArgs)
    .parserConfiguration({ "camel-case-expansion": false })
    .boolean(optionsForType("boolean"))
    .number(optionsForType("number").concat(optionsForType("integer")))
    .option(
      Object.fromEntries([
        ...optionsForType("array").map((k) => [k, { coerce: parseArrayEnv }]),
        ...optionsForType("object").map((k) => [k, { coerce: JSON.parse }]),
      ])
    ).argv;

  delete env._;
  delete env.$0;

  return env;
};

const resolveExternalConfigPath = (configFile) => {
  if (!configFile) {
    return defaultConfigPath;
  }

  const configPath = resolve(process.cwd(), configFile);

  try {
    accessSync(configPath);
  } catch {
    throw new Error(`The config file "${configFile}" could not be found.`);
  }

  return configPath;
};

export default defineConfig(async ({ mode }) => {
  const rawEnv = {
    ...loadEnv(mode, process.cwd(), ""),
    ...process.env,
  };
  const env = parseEnvConfig(rawEnv);
  const externalConfigPath = resolveExternalConfigPath(rawEnv.SB_CONFIG);
  const defaultConfig = (await import(pathToFileURL(defaultConfigPath).href)).default ?? {};
  const externalConfig = (await import(pathToFileURL(externalConfigPath).href)).default ?? {};
  const config = Object.assign({}, defaultConfig, externalConfig, env);
  const dynamicConfig = ["true", "1", "yes"].includes(
    String(rawEnv.DYNAMIC_CONFIG || "").toLowerCase()
  );
  const configFromEnv = dynamicConfig
    ? Object.fromEntries(Object.entries(env).filter(([k]) => k !== "pathPrefix"))
    : env;

  return ({
    base: dynamicConfig ? "./" : config.pathPrefix,
    build: {
      sourcemap: mode !== "minimal",
      rollupOptions: {
        external: ["fs/promises"],
      },
    },
    // @developmentseed/geotiff's decoder pool ships a code-split worker, which
    // the production build can't bundle with Vite's default IIFE worker format
    // ("UMD and IIFE output formats are not supported for code-splitting
    // builds"). ES-format workers support code splitting.
    worker: {
      format: "es",
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          // todo: remove in STAC Browser V6 or if resolved by bootstrap-vue-next.
          silenceDeprecations: ["color-functions", "global-builtin", "import", "if-function"],
        },
      },
    },
    define: {
      STAC_BROWSER_VERSION: JSON.stringify(package_.version),
      // JSON.stringify removes e.g. functions from the config,
      // but from env we do not accept functions anyway.
      CONFIG_FROM_ENV: JSON.stringify(configFromEnv),
      // Expose Vue component internals in the e2e build so end-to-end tests can
      // reach the OpenLayers map (see tests/e2e/helpers.js). Only enabled when the
      // e2e web server sets STAC_BROWSER_E2E; real production builds are unaffected.
      __VUE_PROD_DEVTOOLS__: process.env.STAC_BROWSER_E2E === "true",
    },
    // See https://github.com/vitejs/vite/discussions/14801#discussioncomment-15550931 for details
    optimizeDeps: {
      include: [
        "bootstrap-vue-next/components/*",
        "commonmark",
        "@radiantearth/stac-fields/*",
        "content-type",
        "json-source-map",
        "stac-node-validator",
        "stac-node-validator/src/baseValidator.js",
        "@musement/iso-duration"
      ],
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // Preserve whitespace behavior from Vue 2
            whitespace: "preserve",
          },
        },
      }),
      ViteEjsPlugin(config),
      Components({
        dirs: [],
        globs: [],
        resolvers: [
          BootstrapVueNextResolver({
            components: {
              BContainer: true,
              BRow: true,
              BCol: true,
              BAlert: true,
              BButton: true,
              BButtonGroup: true,
              BBadge: true,
              BForm: true,
              BFormGroup: true,
              BFormInput: true,
              BFormInvalidFeedback: true,
              BFormSelect: true,
              BFormCheckbox: true,
              BFormRadio: true,
              BFormRadioGroup: true,
              BInputGroup: true,
              BListGroup: true,
              BListGroupItem: true,
              BSpinner: true,
            },
          }), // Auto-register Bootstrap components
          IconsResolver({
            prefix: false,
            enabledCollections: ["bi"],
            alias: {
              "b-icon": "bi",
            },
            customCollections: ["share"],
          }),
        ],
      }),
      Icons({
        compiler: "vue3",
        customCollections: {
          share: FileSystemIconLoader("./src/media/"),
        },
      }),
      nodePolyfills({
        include: ["buffer", "path", "process"],
        globals: {
          Buffer: true,
          process: true,
        },
      }),
      mode === "report" &&
        visualizer({
          filename: "./dist/report.html",
          gzipSize: true,
          brotliSize: true,
          open: true,
        }),
    ],
    resolve: {
      // Ensure a single instance of OpenLayers (and stac-js) is used even when
      // ol-stac is symlinked (npm link) during development. Otherwise ol-stac
      // resolves its own copy of `ol`, and adding its LayerGroup to the app's
      // Map breaks OpenLayers' internal map wiring (the layer never gets a map).
      //
      // proj4 holds its registry of projections on the module instance. The
      // Zarr and COG layers build their own transforms, so a second instance
      // would not hold the geostationary alias that registerGeostationary
      // adds. See src/utils/projGeostationary.js.
      //
      // wkt-parser is deduped for the same reason the app pins it: the CRS
      // guard in utils/zarrSource and the layers' own reprojection must parse
      // a WKT definition the same way. @developmentseed/proj pins an older
      // copy, and two parsers can disagree once one of them gains a fix.
      // hyparquet is deduped for the same class of reason: the app pins
      // hyparquet 1.26.0, and the @cng packages are aliased in from outside
      // this project's node_modules, where a stray second copy would
      // otherwise be resolvable. The parquet reader must be one instance --
      // two would mean two WASM-less decoders, two module caches, and twice
      // the bytes for no benefit. hyparquet-writer bare-imports hyparquet
      // internally, so it has to agree as well.
      dedupe: ["ol", "stac-js", "proj4", "wkt-parser", "hyparquet", "hyparquet-compressors", "hyparquet-writer"],
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@stac-browser-external-config": externalConfigPath,
        ...cngAliases,
      },
    },
    server: {
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          externalConfigPath,
          // The aliased @cng packages live outside this project, so the dev
          // server must be allowed to serve them. Drops out with the alias
          // once the packages are published.
          cngPackagesPath
        ],
      },
      port: 8080,
      // During e2e runs, pre-transform the lazily-imported route views and
      // async components on server start. Otherwise the first in-app navigation
      // to them (Search view, Sidebar tree, item filter, …) races the cold vite
      // transform and can take many seconds under parallel worker load, causing
      // intermittent timeouts. Warmup runs in the background and does not delay
      // server readiness. Scoped to e2e so normal dev startup is unaffected.
      warmup: process.env.STAC_BROWSER_E2E === "true"
        ? { clientFiles: ["./src/**/*.vue"] }
        : undefined,
    },
  });
});
