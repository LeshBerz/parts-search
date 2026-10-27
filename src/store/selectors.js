import { createSelector } from '@reduxjs/toolkit';

export const selectSearch = (state) => state.search;
export const selectOfferRows = (state) => state.search.offers.items;

// Самое дешёвое предложение, которое можно купить прямо сейчас (есть цена и остаток).
// createSelector пересчитывает его только при новых данных, а не на каждый рендер.
export const selectBestOfferKey = createSelector([selectOfferRows], (rows) => {
  const available = rows.filter((row) => row.price > 0 && row.stock > 0);
  // если купить можно только одно предложение, сравнивать не с чем — метку не ставим
  if (available.length < 2) return null;
  return available.reduce((best, row) => (row.price < best.price ? row : best)).key;
});
