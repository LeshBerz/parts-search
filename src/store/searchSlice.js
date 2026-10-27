import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { requestGoods } from '../api/partsApi';

// Этап 1: по артикулу получаем список производителей
export const fetchBrands = createAsyncThunk('search/fetchBrands', async (number) => {
  const goods = await requestGoods({ number });
  const brands = new Map();
  goods.forEach((item) => {
    if (!brands.has(item.brand)) brands.set(item.brand, { brand: item.brand, name: item.name });
  });
  return [...brands.values()];
});

// Этап 2: по артикулу и бренду получаем предложения вместе с аналогами
export const fetchOffers = createAsyncThunk('search/fetchOffers', async ({ number, brand }) => {
  const goods = await requestGoods({ number, brand, analogues: true });
  const items = [];
  goods.forEach((item) => {
    items.push({ ...item, isAnalogue: false });
    (item.analogues || []).forEach((analogue) => items.push({ ...analogue, isAnalogue: true }));
  });
  return items;
});

const emptyRequest = { status: 'idle', error: null, items: [], requestId: null };

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    number: '',
    selectedBrand: null,
    brands: { ...emptyRequest },
    offers: { ...emptyRequest },
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.number = action.meta.arg;
        state.selectedBrand = null;
        state.brands = { ...emptyRequest, status: 'loading', requestId: action.meta.requestId };
        state.offers = { ...emptyRequest };
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        // игнорируем ответ на устаревший запрос, если пользователь успел начать новый поиск
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = 'succeeded';
        state.brands.items = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = 'failed';
        state.brands.error = action.error.message;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedBrand = action.meta.arg.brand;
        state.offers = { ...emptyRequest, status: 'loading', requestId: action.meta.requestId };
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return;
        state.offers.status = 'succeeded';
        state.offers.items = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return;
        state.offers.status = 'failed';
        state.offers.error = action.error.message;
      });
  },
});

export default searchSlice.reducer;
