import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffers } from '../store/searchSlice';
import Section from './Section';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });

// Цена 0 или её отсутствие — не цена: показываем прочерк, а не «0 ₽»
const formatPrice = (price) => (price > 0 ? priceFormat.format(price) : '—');

// shipmentDate приходит как «2019-05-31T15:30:00+03:00»: дата отгрузки и время, до которого надо заказать.
// Берём дату из строки как есть, без перевода в часовой пояс браузера.
function formatShipment(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  return match ? `отгрузка ${match[3]}.${match[2]}` : null;
}

function Stock({ stock }) {
  if (stock == null) return <span className="text-body-secondary">—</span>;
  if (stock <= 0) return <span className="text-body-secondary">нет</span>;
  return <span className="text-success fw-semibold">{stock} шт.</span>;
}

function WarehouseInfo({ row }) {
  const shipment = formatShipment(row.shipmentDate);
  return (
    <>
      {/* код есть не у всех складов (см. документацию) */}
      {row.noWarehouses ? 'нет на складах' : row.warehouse || 'склад без кода'}
      {shipment && <span className="d-block small text-body-secondary">{shipment}</span>}
    </>
  );
}

function OfferRow({ row }) {
  return (
    <tr>
      <td>
        <div className="fw-semibold text-break">{row.name || 'Без названия'}</div>
        <div className="small text-body-secondary text-break">
          {row.brand} · {row.number}
        </div>
        {/* на телефоне колонка «Склад» скрыта — показываем склад под названием */}
        <div className="small text-body-secondary d-sm-none mt-1">
          <WarehouseInfo row={row} />
        </div>
      </td>
      <td className="d-none d-sm-table-cell">
        <WarehouseInfo row={row} />
      </td>
      <td className="text-end text-nowrap">{formatPrice(row.price)}</td>
      <td className="text-end text-nowrap">
        <Stock stock={row.stock} />
      </td>
    </tr>
  );
}

function Group({ title, rows }) {
  if (!rows.length) return null;
  return (
    <tbody>
      <tr className="offers-group">
        <th colSpan={4} scope="colgroup">
          {title} <span className="fw-normal">· {rows.length}</span>
        </th>
      </tr>
      {rows.map((row) => (
        <OfferRow key={row.key} row={row} />
      ))}
    </tbody>
  );
}

export default function OffersTable() {
  const dispatch = useDispatch();
  const { number, selectedBrand, offers } = useSelector((state) => state.search);
  const sectionRef = useRef(null);

  // на телефоне таблица ниже экрана — после выбора бренда прокручиваем к ней
  useEffect(() => {
    if (offers.status !== 'loading' || !sectionRef.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    sectionRef.current.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }, [offers.status, offers.requestId]);

  if (offers.status === 'idle') return null;

  const title = `Предложения: ${selectedBrand} ${number}`;
  let content;
  if (offers.status === 'loading') {
    content = <Loader text="Загружаем предложения и аналоги…" />;
  } else if (offers.status === 'failed') {
    content = (
      <ErrorAlert message={offers.error} onRetry={() => dispatch(fetchOffers({ number, brand: selectedBrand }))} />
    );
  } else if (!offers.items.length) {
    content = (
      <div className="alert alert-warning mb-0" role="status">
        Предложений по {selectedBrand} {number} нет.
      </div>
    );
  } else {
    const originals = offers.items.filter((row) => !row.isAnalogue);
    const analogues = offers.items.filter((row) => row.isAnalogue);
    content = (
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 offers-table">
          <caption className="visually-hidden">
            Цены и остатки по складам для {selectedBrand} {number} и аналогов
          </caption>
          <thead>
            <tr>
              <th scope="col">Товар</th>
              <th scope="col" className="d-none d-sm-table-cell">
                Склад
              </th>
              <th scope="col" className="text-end">
                Цена
              </th>
              <th scope="col" className="text-end">
                Остаток
              </th>
            </tr>
          </thead>
          <Group title="Запрошенная деталь" rows={originals} />
          <Group title="Аналоги" rows={analogues} />
        </table>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="offers-anchor">
      <Section step={3} title={title}>
        {content}
      </Section>
    </div>
  );
}
