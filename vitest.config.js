import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import path from 'path'

// The @cnmw cloud-native map widget packages are aliased in from a sibling
// cn-geocoding checkout, exactly as in vite.config.js -- see the long note
// there. Kept in sync by hand until the packages are published to npm, at
// which point both blocks go away.
const cnmwPackagesPath = process.env.SB_CNMW_ROOT
  ? path.resolve(__dirname, process.env.SB_CNMW_ROOT)
  : path.resolve(__dirname, '../cn-geocoding/packages')

const cnmwAliases = Object.fromEntries(
  [
    'spec',
    'geocoder-core',
    'upload-core',
    'download-core',
    'maplibre',
    'format-gpkg',
    'format-flatgeobuf',
    'format-shapefile',
    'format-extras',
  ].map((name) => [
    `@cnmw/${name}`,
    path.resolve(cnmwPackagesPath, `${name}/src/index.js`),
  ])
)

export default defineConfig({
  plugins: [vue(), Icons({ compiler: 'vue3' })],
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.spec.js'],
    globals: true,
  },
  resolve: {
    dedupe: ['hyparquet', 'hyparquet-compressors', 'hyparquet-writer'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      ...cnmwAliases,
    },
  },
})
