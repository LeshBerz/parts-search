import { mockRequest } from './mock';

// Флаг задаётся в vite.config.js: ключа нет на сервере → работаем на демо-данных
export const IS_DEMO = __DEMO_MODE__;

const TIMEOUT_MS = 15000;

// Ошибки из документации API — переводим, чтобы пользователь понял, что случилось
const API_ERRORS = {
  'Empty key!': 'Не указан ключ покупателя.',
  'Invalid key client!': 'Неверный ключ покупателя.',
  // нет в документации, но так API отвечает сейчас (HTTP 403) на неверный ключ
  'Invalid access key': 'Неверный ключ покупателя.',
  'Empty number goods!': 'Не указан номер детали.',
  'Request quota exceeded!': 'Превышен лимит запросов. Попробуйте позже.',
};

// Документация требует кодировать спецсимволы в номере и бренде (# → %23, & → %26).
// encodeURIComponent, а не URLSearchParams: тот кодирует пробел как «+», а не %20.
export function buildQuery(params) {
  return Object.entries(params)
    .filter(([, value]) => value != null && value !== '')
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * Разбор ответа API: { goods: [...] } или { error: "..." | ["...", "..."] }.
 * Если товар не найден, API отдаёт массив с одним «пустым» товаром — отфильтровываем его.
 */
export function parseGoods(data) {
  if (data?.error) {
    const messages = [].concat(data.error).map((text) => API_ERRORS[text] || text);
    throw new Error(messages.join(' '));
  }
  const goods = Array.isArray(data) ? data : data?.goods;
  if (!Array.isArray(goods)) return [];
  return goods.filter((item) => item?.number && item?.brand);
}

// Сетевой запрос. Ключ сюда не передаётся — его подставляет прокси (см. vite.config.js)
export async function fetchFromApi(params) {
  let response;
  try {
    response = await fetch(`/api/?${buildQuery(params)}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new Error('Сервер не ответил вовремя. Попробуйте ещё раз.');
    throw new Error('Нет связи с сервером. Проверьте подключение к интернету.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // тело не JSON — решаем ниже по статусу
  }
  // ошибку API показываем, даже если она пришла с HTTP-статусом не 200
  if (data?.error) return data;
  if (!response.ok) throw new Error(`Сервер ответил ошибкой ${response.status}.`);
  if (data === null) throw new Error('Сервер вернул некорректный ответ.');
  return data;
}

/**
 * Запрос к API поиска запчастей.
 * number — артикул, brand — производитель (необязательно), analogues — вернуть аналоги.
 */
export async function requestGoods({ number, brand, analogues = false }) {
  const params = { number, brand };
  // по документации аналоги возвращаются только вместе с брендом
  if (brand && analogues) params.analogues = 'on';

  const data = IS_DEMO ? await mockRequest(params) : await fetchFromApi(params);
  return parseGoods(data);
}
