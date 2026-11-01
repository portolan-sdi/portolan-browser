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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
