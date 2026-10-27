import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchFromApi, parseGoods } from './partsApi';

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('fetchFromApi + parseGoods', () => {
  it('показывает текст ошибки API, даже если он пришёл с HTTP 403', async () => {
    // реальный API на неверный ключ отвечает 403 и { error } — пользователь должен увидеть причину,
    // а не безликое «Сервер ответил ошибкой 403»
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: 'Invalid access key' }, 403)));
    await expect(fetchFromApi({ number: '1' }).then(parseGoods)).rejects.toThrow('Неверный ключ покупателя.');
  });

  it('кодирует спецсимволы в номере и бренде по документации', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ goods: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await fetchFromApi({ number: 'W 712/75#1', brand: 'A&B' });
    // пробел — %20 (а не «+», как сделал бы URLSearchParams), # — %23, & — %26
    expect(fetchMock.mock.calls[0][0]).toBe('/api/?number=W%20712%2F75%231&brand=A%26B');
  });

  it('превращает сбой сети в понятное сообщение', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchFromApi({ number: '1' })).rejects.toThrow('Нет связи с сервером');
  });
});

describe('parseGoods', () => {
  it('«не найдено» (массив с одним пустым товаром) — это пустой список, а не бренд с пустым именем', () => {
    const notFound = { goods: [{ brand: '', number: '', name: '', count: 0, warehouses: [] }] };
    expect(parseGoods(notFound)).toEqual([]);
  });

  it('склеивает несколько ошибок API в одно сообщение', () => {
    expect(() => parseGoods({ error: ['Empty key!', 'Empty number goods!'] })).toThrow(
      'Не указан ключ покупателя. Не указан номер детали.',
    );
  });
});
