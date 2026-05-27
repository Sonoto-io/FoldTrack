import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true
  },
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({ registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'FoldTrack',
        short_name: 'FoldTrack',
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})

