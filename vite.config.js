import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Переменные без префикса VITE_: Vite не встроит их в клиентский бандл
  const env = loadEnv(mode, process.cwd(), '');
  const key = env.PARTS_API_KEY;
  const apiUrl = env.PARTS_API_URL ? new URL(env.PARTS_API_URL) : null;
  const isDemo = !key || !apiUrl;

  // API работает по http и без CORS-заголовков, поэтому браузер ходит в /api,
  // а прокси Vite пересылает запрос на сервер API и сам добавляет ключ.
  const apiPath = apiUrl?.pathname.replace(/\/?$/, '/');
  const proxy = isDemo
    ? undefined
    : {
        '/api': {
          target: apiUrl.origin,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/?\??/, `${apiPath}?key=${encodeURIComponent(key)}&`),
        },
      };

  return {
    plugins: [react()],
    define: { __DEMO_MODE__: JSON.stringify(isDemo) },
    server: { proxy },
    preview: { proxy },
    test: { environment: 'node' },
  };
});
