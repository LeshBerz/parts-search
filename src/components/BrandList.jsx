import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../store/searchSlice';
import Section from './Section';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

function StockBadge({ count, isActive }) {
  if (count == null) return null;
  const inStock = count > 0;
  const tone = isActive
    ? 'text-bg-light'
    : inStock
      ? 'bg-success-subtle text-success-emphasis'
      : 'bg-secondary-subtle text-secondary-emphasis';
  return <span className={`badge rounded-pill ${tone}`}>{inStock ? `${count} шт.` : 'нет в наличии'}</span>;
}

export default function BrandList() {
  const dispatch = useDispatch();
  const { number, selectedBrand, brands } = useSelector((state) => state.search);

  if (brands.status === 'idle') return null;

  let content;
  if (brands.status === 'loading') {
    content = <Loader text="Ищем производителей…" />;
  } else if (brands.status === 'failed') {
    content = <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />;
  } else if (!brands.items.length) {
    content = (
      <div className="alert alert-warning mb-0" role="status">
        По артикулу «{number}» ничего не найдено. Проверьте номер детали.
      </div>
    );
  } else {
    content = (
      <>
        <p className="text-body-secondary small mb-2">
          Найдено производителей: {brands.items.length}. Выберите нужного, чтобы увидеть цены и аналоги.
        </p>
        <div className="list-group">
          {brands.items.map(({ brand, number: foundNumber, name, count }) => {
            const isActive = brand === selectedBrand;
            return (
              <button
                key={brand}
                type="button"
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3 py-2 ${isActive ? 'active' : ''}`}
                aria-pressed={isActive}
                onClick={() => dispatch(fetchOffers({ number, brand }))}
              >
                <span className="text-break">
                  <span className="fw-semibold">{brand}</span>{' '}
                  <span className={isActive ? 'text-white-50' : 'text-body-secondary'}>{foundNumber}</span>
                  {name && <span className="d-block small">{name}</span>}
                </span>
                <StockBadge count={count} isActive={isActive} />
              </button>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <Section step={2} title="Производитель">
      {content}
    </Section>
  );
}
