import { copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const rootDir = dirname(fileURLToPath(import.meta.url))

function githubPagesFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    closeBundle() {
      const distDir = join(rootDir, 'dist')
      copyFileSync(join(distDir, 'index.html'), join(distDir, '404.html'))
    },
  }
}

export default defineConfig(({ command }) => ({
  // setup base path for GitHub Pages based on the command
  // 'build' command will set the base path to '/Mobius/'
  base: command === 'build' ? '/Mobius/' : '/',
  plugins: [
    vue(),
    vueDevTools(),
    githubPagesFallback(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
}))
