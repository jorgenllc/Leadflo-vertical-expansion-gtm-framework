import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In local dev there is no Vercel serverless runtime, so `vercel dev` is the
    // recommended way to run the proxy. If you prefer plain `vite dev`, point this
    // proxy at a locally running `vercel dev` on 3000.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
