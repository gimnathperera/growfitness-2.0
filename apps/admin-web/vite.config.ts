import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/types': path.resolve(__dirname, '../../packages/shared-types/src'),
      '@shared/schemas': path.resolve(__dirname, '../../packages/shared-schemas/src'),
    },
  },
  optimizeDeps: {
    include: ['@grow-fitness/shared-types', '@grow-fitness/shared-schemas'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    commonjsOptions: {
      include: [/@grow-fitness\/shared-/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});

