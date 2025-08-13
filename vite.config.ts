import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      wasm(),
      topLevelAwait(),
      basicSsl({
        /** name of certification */
        name: 'webbed_city',
        /** custom trust domains */
        domains: ['localhost'],
        /** custom certification directory */
        certDir: process.env.VITE_CERT_DIR || './certs',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.VITE_PORT || '5173'),
      // https: {},
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: process.env.VITE_WS_URL,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
      },
    },
  })
}
