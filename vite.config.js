import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // PARTS_API_KEY без префикса VITE_: Vite не встроит его в клиентский бандл
  const key = loadEnv(mode, process.cwd(), '').PARTS_API_KEY;

  // API работает по http и без CORS-заголовков, поэтому браузер ходит в /api,
  // а прокси Vite пересылает запрос на сервер API и сам добавляет ключ.
  const proxy = {
    '/api': {
      target: process.env.PARTS_API_URL,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/?\??/, `/hs/hsprice/?key=${encodeURIComponent(key ?? '')}&`),
    },
  };

  return {
    plugins: [react()],
    define: { __DEMO_MODE__: JSON.stringify(!key) },
    server: { proxy },
    preview: { proxy },
    test: { environment: 'node' },
  };
});
