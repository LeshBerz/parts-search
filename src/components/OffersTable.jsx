import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../store/searchSlice';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

const formatPrice = (value) =>
  Number(value).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 });

// Одна строка таблицы = товар на конкретном складе (цена и остаток в API указаны по складам)
function toRows(items) {
  return items.flatMap((item) => {
    const warehouses = item.warehouses?.length ? item.warehouses : [{}];
    return warehouses.map((warehouse, index) => ({ item, warehouse, key: `${item.brand}-${item.number}-${index}` }));
  });
}

export default function OffersTable() {
  const dispatch = useDispatch();
  const { number, selectedBrand, offers } = useSelector((state) => state.search);

  if (offers.status === 'idle') return null;
  if (offers.status === 'loading') return <Loader text="Загружаем предложения и аналоги…" />;
  if (offers.status === 'failed') {
    return (
      <ErrorAlert message={offers.error} onRetry={() => dispatch(fetchOffers({ number, brand: selectedBrand }))} />
    );
  }
  if (!offers.items.length) {
    return <div className="alert alert-warning my-3">Предложений по {selectedBrand} {number} нет.</div>;
  }

  return (
    <>
      <h2 className="h6 text-muted mb-2">Предложения и аналоги для {selectedBrand} {number}</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle bg-white">
          <thead className="table-light">
            <tr>
              <th>Название / Производитель</th>
              <th>Артикул</th>
              <th>Склад</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            {toRows(offers.items).map(({ item, warehouse, key }) => {
              const stock = warehouse.stock ?? item.count ?? 0;
              return (
                <tr key={key}>
                  <td>
                    <div>{item.name}</div>
                    <small className="text-muted">
                      {item.brand}
                      {item.isAnalogue && <span className="badge text-bg-secondary ms-2">аналог</span>}
                    </small>
                  </td>
                  <td>{item.number}</td>
                  <td>{warehouse.code || '—'}</td>
                  <td className="text-end text-nowrap">{warehouse.price != null ? formatPrice(warehouse.price) : '—'}</td>
                  <td className={`text-end ${Number(stock) > 0 ? '' : 'text-danger'}`}>
                    {Number(stock) > 0 ? `${stock} шт.` : 'нет в наличии'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
