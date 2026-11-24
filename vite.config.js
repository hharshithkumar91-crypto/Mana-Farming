import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const basePath = '/Smart-Crop-Advisor-AI/';

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
