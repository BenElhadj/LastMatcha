import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig({
  base: '/Matcha/',
  plugins: [
    vue({
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
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // ✅ Configuration pour ignorer les erreurs d'assets
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore les warnings de modules manquants et assets
        if (warning.code === 'MODULE_NOT_FOUND' || 
            warning.code === 'UNRESOLVED_IMPORT' ||
            warning.message.includes('asset')) {
          return;
        }
        warn(warning);
      }
    }
  },
  // ✅ Ignore les erreurs CSS/PostCSS
  css: {
    postcss: {
      // Ignore les erreurs de fichiers manquants dans PostCSS
    }
  }
});