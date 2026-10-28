import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
/// <reference types="vitest" />

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
    watch: {
      usePolling: true,
    },
    // Dev only: uploaded files are served by the API (same domain in production)
    proxy: {
      '/uploads': (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, ''),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  publicDir: 'public',
  // Configuration pour les fichiers statiques
  assetsInclude: ['**/*.json'],
  // Configuration pour servir les fichiers de traduction
  optimizeDeps: {
    exclude: ['i18next-http-backend'],
  },
});
