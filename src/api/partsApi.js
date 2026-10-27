import { mockRequest } from './mock';

const API_KEY = import.meta.env.VITE_PARTS_API_KEY;
export const IS_DEMO = !API_KEY;

// Ошибки API приходят как { error: "..." } или { error: ["...", "..."] }
function extractError(data) {
  if (!data || !data.error) return null;
  return Array.isArray(data.error) ? data.error.join(' ') : String(data.error);
}

// Ответ — { goods: [...] }; если товар не найден, API отдаёт массив с одним пустым элементом
function extractGoods(data) {
  const goods = Array.isArray(data) ? data : data?.goods;
  if (!Array.isArray(goods)) return [];
  return goods.filter((item) => item && item.number && item.brand);
}

/**
 * Запрос к API поиска запчастей.
 * number — артикул, brand — производитель (необязательно), analogues — вернуть аналоги.
 */
export async function requestGoods({ number, brand, analogues = false }) {
  const params = { number };
  if (brand) params.brand = brand;
  if (brand && analogues) params.analogues = 'on';

  if (IS_DEMO) return extractGoods(await mockRequest(params));

  // URLSearchParams сам кодирует спецсимволы (#, & и т. п.), как требует документация
  const query = new URLSearchParams({ key: API_KEY, ...params });

  let response;
  try {
    response = await fetch(`/api/?${query}`);
  } catch {
    throw new Error('Нет связи с сервером. Проверьте подключение к интернету.');
  }
  if (!response.ok) throw new Error(`Сервер ответил ошибкой ${response.status}.`);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ.');
  }

  const apiError = extractError(data);
  if (apiError) throw new Error(apiError);

  return extractGoods(data);
}
