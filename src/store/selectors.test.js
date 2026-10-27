import { describe, expect, it } from 'vitest';
import { selectBestOfferKey } from './selectors';

const stateWith = (items) => ({ search: { offers: { items } } });
const row = (key, price, stock) => ({ key, price, stock });

describe('selectBestOfferKey', () => {
  it('выбирает самое дешёвое предложение среди тех, что есть в наличии', () => {
    // самая низкая цена у «нет в наличии» — её купить нельзя, значит это не лучшая цена
    const items = [row('a', 3450, 12), row('b', 2980, 0), row('c', 3100, 5), row('d', null, 0)];
    expect(selectBestOfferKey(stateWith(items))).toBe('c');
  });

  it('не ставит метку, если сравнивать не с чем', () => {
    expect(selectBestOfferKey(stateWith([row('a', 640, 30), row('b', 590, 0)]))).toBeNull();
  });

  it('не пересчитывается, пока данные те же (мемоизация)', () => {
    const state = stateWith([row('a', 640, 30), row('b', 590, 22)]);
    selectBestOfferKey.resetRecomputations();
    selectBestOfferKey(state);
    selectBestOfferKey(state);
    expect(selectBestOfferKey.recomputations()).toBe(1);
  });
});
