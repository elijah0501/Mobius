import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// // https://vite.dev/config/
// export default defineConfig({
//   base: '/Mobius/',
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     },
//   },

// })


export default defineConfig(({ command }) => ({
  // setup base path for GitHub Pages based on the command
  // 'build' command will set the base path to '/Mobius/'
  base: command === 'build' ? '/Mobius/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
