// Демо-данные в формате API — чтобы приложение можно было запустить без ключа.
// Артикулы: 7160500039S и OC90 — есть данные, ERROR — ошибка API, любой другой — «ничего не найдено».

const wh = (code, price, stock, shipmentDate) => ({ code, price, stock, shipmentDate, own: false });

// Так API отвечает, когда товар не найден: массив с одним пустым элементом
const NOT_FOUND = {
  goods: [
    {
      brand: '',
      number: '',
      name: '',
      goodsID: '00000000-0000-0000-0000-000000000000',
      count: 0,
      price: 0,
      rate: 0,
      warehouses: [],
    },
  ],
};

const CATALOG = {
  // номер в ответе может отличаться от введённого (7160500039/S), как в примере из документации
  '7160500039S': [
    {
      goodsID: 'meyle-1',
      brand: 'MEYLE',
      number: '7160500039/S',
      name: 'Рычаги задней подвески (компл. на 2 стороны)',
      count: 20,
      warehouses: [
        wh('МС2', 12533.62, 12, '2026-10-28T15:30:00+03:00'),
        wh('СПБ', 12710, 8, '2026-10-30T12:00:00+03:00'),
      ],
      analogues: [
        {
          goodsID: 'mapco-1',
          brand: 'MAPCO',
          number: '53612/1',
          name: 'Комплект рычагов задней подвески 6 шт. с болтами',
          count: 10,
          // цена и остаток строкой — встречается в ответах, интерфейс должен это пережить
          warehouses: [wh('ПТ4', '8680.20', '10', '2026-10-29T13:30:00+03:00')],
        },
        {
          // позиция без складов и с нулевым остатком
          goodsID: 'meyle-2',
          brand: 'MEYLE',
          number: '7160500039/SK',
          name: 'Рычаги задней подвески (компл. на 1 сторону)',
          count: 0,
          price: 0,
          warehouses: [],
        },
      ],
    },
    {
      goodsID: 'febi-1',
      brand: 'FEBI',
      number: '7160500039S',
      name: 'Рычаг подвески',
      count: 3,
      warehouses: [wh(undefined, 9120, 3, '2026-10-31T11:00:00+03:00')],
      analogues: [],
    },
  ],
  OC90: [
    {
      goodsID: 'knecht-1',
      brand: 'KNECHT',
      number: 'OC 90',
      name: 'Фильтр масляный',
      count: 45,
      warehouses: [
        wh('МС1', 640, 30, '2026-10-28T18:00:00+03:00'),
        wh('ЕКБ', 615, 15, '2026-10-31T10:00:00+03:00'),
      ],
      analogues: [
        {
          goodsID: 'mann-1',
          brand: 'MANN-FILTER',
          number: 'W 712/75',
          name: 'Фильтр масляный',
          count: 22,
          warehouses: [wh('МС1', 590, 22, '2026-10-28T18:00:00+03:00')],
        },
        {
          goodsID: 'bosch-1',
          brand: 'BOSCH',
          number: '0 451 103 336',
          name: 'Фильтр масляный',
          count: 0,
          warehouses: [wh('МС2', 702.5, 0, '')],
        },
      ],
    },
  ],
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest({ number, brand, analogues }) {
  await delay(600);
  const key = number.trim().toUpperCase();
  if (key === 'ERROR') return { error: ['Request quota exceeded!'] };

  const goods = CATALOG[key];
  if (!goods) return NOT_FOUND;

  if (!brand) return { goods: goods.map(({ analogues: _, ...item }) => item) };

  const found = goods.filter((item) => item.brand === brand);
  if (!found.length) return NOT_FOUND;
  return {
    goods: found.map(({ analogues: list, ...item }) => (analogues ? { ...item, analogues: list } : item)),
  };
}
