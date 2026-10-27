// Демо-данные в формате API — чтобы приложение можно было запустить без ключа.
// Попробуйте артикулы 7160500039S или OC90. Любой другой вернёт «ничего не найдено».

const wh = (code, price, stock, shipmentDate) => ({ code, price, stock, shipmentDate });

const CATALOG = {
  '7160500039S': [
    {
      brand: 'MEYLE', number: '7160500039S', name: 'Тормозные колодки передние', count: 20,
      warehouses: [wh('МС2', 3450, 12, '2026-10-28 14:00'), wh('СПБ', 3520, 8, '2026-10-29 12:00')],
      analogues: [
        {
          brand: 'FEBI', number: '16290', name: 'Колодки тормозные дисковые', count: 6,
          warehouses: [wh('МС1', 2980, 6, '2026-10-28 16:00')],
        },
        {
          brand: 'TRW', number: 'GDB1550', name: 'Комплект тормозных колодок', count: 0,
          warehouses: [wh('МС2', 3100, 0, '')],
        },
      ],
    },
    {
      brand: 'FEBI', number: '7160500039S', name: 'Колодки тормозные', count: 3,
      warehouses: [wh('МС1', 3010, 3, '2026-10-30 11:00')], analogues: [],
    },
  ],
  OC90: [
    {
      brand: 'KNECHT', number: 'OC90', name: 'Фильтр масляный', count: 45,
      warehouses: [wh('МС1', 640, 30, '2026-10-28 18:00'), wh('ЕКБ', 615, 15, '2026-10-31 10:00')],
      analogues: [
        {
          brand: 'MANN-FILTER', number: 'W 712/75', name: 'Фильтр масляный', count: 22,
          warehouses: [wh('МС1', 590, 22, '2026-10-28 18:00')],
        },
      ],
    },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest({ number, brand, analogues }) {
  await delay(600);
  const goods = CATALOG[number.trim().toUpperCase()];
  if (!goods) return { goods: [{}] }; // так API отвечает, когда товар не найден

  if (!brand) return { goods: goods.map(({ analogues: _, ...item }) => item) };

  const found = goods.filter((item) => item.brand === brand);
  if (!found.length) return { goods: [{}] };
  return {
    goods: found.map(({ analogues: list, ...item }) => ({ ...item, analogues: analogues ? list : [] })),
  };
}
