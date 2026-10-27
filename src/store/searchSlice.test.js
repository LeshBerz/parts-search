import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestGoods } from '../api/partsApi';
import reducer, { fetchBrands, fetchOffers, initialState } from './searchSlice';

// стор проверяем без сети: подменяем только функцию запроса
vi.mock('../api/partsApi', () => ({ requestGoods: vi.fn() }));

const makeStore = () => configureStore({ reducer: { search: reducer } });

beforeEach(() => vi.mocked(requestGoods).mockReset());

describe('searchSlice', () => {
  it('игнорирует ответ на устаревший поиск', () => {
    // пользователь искал «A», не дождался и начал искать «B»; ответ на «A» пришёл позже
    let state = reducer(initialState, fetchBrands.pending('req-A', 'A'));
    state = reducer(state, fetchBrands.pending('req-B', 'B'));
    state = reducer(state, fetchBrands.fulfilled([{ brand: 'OLD' }], 'req-A', 'A'));

    expect(state.number).toBe('B');
    expect(state.brands.status).toBe('loading');
    expect(state.brands.items).toEqual([]);
  });

  it('после ошибки повторный запрос сбрасывает её и показывает результат', async () => {
    const store = makeStore();
    vi.mocked(requestGoods)
      .mockRejectedValueOnce(new Error('Нет связи с сервером.'))
      .mockResolvedValueOnce([{ brand: 'KNECHT', number: 'OC 90', name: 'Фильтр', count: '45' }]);

    await store.dispatch(fetchBrands('OC90'));
    expect(store.getState().search.brands).toMatchObject({
      status: 'failed',
      error: 'Нет связи с сервером.',
    });

    await store.dispatch(fetchBrands('OC90'));
    expect(store.getState().search.brands).toMatchObject({
      status: 'succeeded',
      error: null,
      items: [{ brand: 'KNECHT', number: 'OC 90', name: 'Фильтр', count: 45 }],
    });
  });

  it('не отправляет тот же запрос, пока предыдущий в полёте', async () => {
    const store = makeStore();
    vi.mocked(requestGoods).mockResolvedValue([]);

    const first = store.dispatch(fetchOffers({ number: 'OC90', brand: 'KNECHT' }));
    store.dispatch(fetchOffers({ number: 'OC90', brand: 'KNECHT' })); // двойной клик
    await first;

    expect(requestGoods).toHaveBeenCalledTimes(1);
  });

  it('строит строки таблицы из складов: числа из строк, товар без складов — «нет в наличии»', async () => {
    const store = makeStore();
    vi.mocked(requestGoods).mockResolvedValue([
      {
        brand: 'MEYLE',
        number: '7160500039/S',
        name: 'Рычаги',
        price: 99999, // цену товара документация использовать запрещает
        warehouses: [{ code: 'МС2', price: '12533.62', stock: '20' }],
        analogues: [{ brand: 'MAPCO', number: '53612/1', name: 'Комплект', warehouses: [] }],
      },
    ]);

    await store.dispatch(fetchOffers({ number: '7160500039S', brand: 'MEYLE' }));
    const rows = store.getState().search.offers.items;

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ isAnalogue: false, warehouse: 'МС2', price: 12533.62, stock: 20 });
    expect(rows[1]).toMatchObject({ isAnalogue: true, noWarehouses: true, price: null, stock: 0 });
    expect(new Set(rows.map((row) => row.key)).size).toBe(rows.length);
  });
});
