import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import path from 'path'

export default defineConfig({
  plugins: [vue(), Icons({ compiler: 'vue3' })],
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.spec.js'],
    globals: true,
  },
  define: {
    CONFIG_FROM_ENV: '{}',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // The app build points this at the deployment's own config file and
      // defines CONFIG_FROM_ENV (see vite.config.js). A component spec reaches
      // src/merged-config.js through the auth utilities, so both are supplied
      // here: the shipped defaults, and no environment overrides.
      '@stac-browser-external-config': path.resolve(__dirname, './config.js'),
    },
  },
})
