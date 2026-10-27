import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { requestGoods } from '../api/partsApi';

// Цена и остаток иногда приходят строкой («8680.20», «1 200,5») — приводим к числу или null
export function toNumber(value) {
  if (value == null || value === '') return null;
  const number = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

// Не отправляем тот же запрос, пока предыдущий ещё в полёте (двойной клик, Enter + кнопка)
const isSameLoading = (request, isSame) => request.status === 'loading' && isSame;

// Этап 1: по артикулу получаем список производителей
export const fetchBrands = createAsyncThunk(
  'search/fetchBrands',
  async (number) => {
    const goods = await requestGoods({ number });
    const brands = new Map();
    goods.forEach(({ brand, number: found, name, count }) => {
      if (!brands.has(brand)) brands.set(brand, { brand, number: found, name, count: toNumber(count) });
    });
    return [...brands.values()];
  },
  {
    condition: (number, { getState }) => {
      const { search } = getState();
      return !isSameLoading(search.brands, search.number === number);
    },
  },
);

// Одна строка таблицы = товар на конкретном складе: цена и остаток в API указаны по складам,
// а поле price у товара документация использовать запрещает.
function toRows(item, isAnalogue, itemIndex) {
  const base = { brand: item.brand, number: item.number, name: item.name, isAnalogue };
  const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];

  // складов нет — товар есть в каталоге, но купить его негде
  if (!warehouses.length) {
    return [
      { ...base, key: `${itemIndex}`, noWarehouses: true, warehouse: null, shipmentDate: null, price: null, stock: 0 },
    ];
  }
  return warehouses.map((warehouse, index) => ({
    ...base,
    // brand+number не уникальны (один товар на нескольких складах, дубли в аналогах),
    // а порядок строк не меняется — поэтому ключ из позиции в ответе
    key: `${itemIndex}-${index}`,
    warehouse: warehouse.code || null,
    shipmentDate: warehouse.shipmentDate || null,
    price: toNumber(warehouse.price),
    stock: toNumber(warehouse.stock),
  }));
}

// Этап 2: по артикулу и бренду получаем предложения вместе с аналогами
export const fetchOffers = createAsyncThunk(
  'search/fetchOffers',
  async ({ number, brand }) => {
    const goods = await requestGoods({ number, brand, analogues: true });
    const rows = [];
    goods.forEach((item) => {
      rows.push(...toRows(item, false, rows.length));
      (item.analogues || []).forEach((analogue) => rows.push(...toRows(analogue, true, rows.length)));
    });
    return rows;
  },
  {
    condition: ({ brand }, { getState }) => {
      const { search } = getState();
      return !isSameLoading(search.offers, search.selectedBrand === brand);
    },
  },
);

const emptyRequest = { status: 'idle', error: null, items: [], requestId: null };

export const initialState = {
  number: '',
  selectedBrand: null,
  brands: { ...emptyRequest },
  offers: { ...emptyRequest },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
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
