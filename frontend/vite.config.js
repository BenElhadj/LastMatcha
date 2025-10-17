import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  // ⚠️ AJOUT - Base path pour la production
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  plugins: [
    vue({
      useRef: true,
      template: { transformAssetUrls }
    }),

    quasar({
      sassVariables: 'src/quasar-variables.sass'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // ⚠️ AJOUT - Configuration build
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});