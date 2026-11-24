import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = '/Mana-Farming/';

export default defineConfig({
  css: { postcss: {} }, 
  base: basePath,
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
