import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { cleanupOutdatedCaches: true, clientsClaim: true, skipWaiting: true },
      includeAssets: ['favicon.svg', 'icon.svg'],
      manifest: {
        name: 'VizinhoLava',
        short_name: 'VizinhoLava',
        description: 'Alguém vai na sua casa lavar a louça.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        theme_color: '#2A9D8F',
        background_color: '#2A9D8F',
        // Ícones provisórios (placeholder) — substituir por PNGs 192/512 definitivos.
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
