import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// API работает по http и без CORS-заголовков,
// поэтому в dev-режиме ходим к нему через прокси Vite: /api → сервер API
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.PARTS_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/hs/hsprice'),
      },
    },
  },
});
