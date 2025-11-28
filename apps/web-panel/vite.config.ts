import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  const base = process.env.VITE_BASE_URL || "/";

  return {
    base,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: {
          name: 'TerraHub Web Panel',
          short_name: 'TerraHub',
          description: 'Mobile-friendly control surface for TerraHub controllers',
          theme_color: '#0f172a',
          background_color: '#0b1224',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: withBase('icons/icon.svg'),
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable any'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /\/api\/controllers\/(discover|status).*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'controller-api',
                networkTimeoutSeconds: 4,
                cacheableResponse: { statuses: [0, 200] }
              }
            }
          ]
        }
      })
    ],
    server: {
      host: '0.0.0.0'
    }
  };
});
