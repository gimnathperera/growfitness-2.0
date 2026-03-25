import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@shared/schemas': path.resolve(__dirname, '../../packages/shared-schemas/src/index.ts'),
      // Resolve workspace packages to the TS entrypoint to avoid stale generated JS in src/.
      '@grow-fitness/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@grow-fitness/shared-schemas': path.resolve(__dirname, '../../packages/shared-schemas/src/index.ts'),
      '@grow-fitness/invoice-print': path.resolve(
        __dirname,
        '../../packages/invoice-print/src/index.ts'
      ),
    },
  },
  optimizeDeps: {
    include: [
      '@grow-fitness/shared-types',
      '@grow-fitness/shared-schemas',
      '@grow-fitness/invoice-print',
    ],
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
