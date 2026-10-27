import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../store/searchSlice';
import { selectSearch } from '../store/selectors';
import Section from './Section';
import ErrorAlert from './ErrorAlert';
import Icon from './Icon';
import { BrandsSkeleton } from './Skeleton';

function StockBadge({ count }) {
  if (count == null) return null;
  const inStock = count > 0;
  const tone = inStock
    ? 'bg-success-subtle text-success-emphasis'
    : 'bg-secondary-subtle text-secondary-emphasis';
  return <span className={`badge rounded-pill ${tone}`}>{inStock ? `${count} шт.` : 'нет в наличии'}</span>;
}

export default function BrandList() {
  const dispatch = useDispatch();
  const { number, selectedBrand, brands } = useSelector(selectSearch);

  if (brands.status === 'idle') return null;

  let content;
  if (brands.status === 'loading') {
    content = <BrandsSkeleton />;
  } else if (brands.status === 'failed') {
    content = <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />;
  } else if (!brands.items.length) {
    content = (
      <div className="alert alert-warning d-flex align-items-center gap-2 mb-0" role="status">
        <Icon name="search" className="fs-5 flex-shrink-0" />
        <span>По артикулу «{number}» ничего не найдено. Проверьте номер детали.</span>
      </div>
    );
  } else {
    content = (
      <>
        <p className="text-body-secondary small mb-3">
          Найдено производителей: {brands.items.length}. Выберите нужного, чтобы увидеть цены и аналоги.
        </p>
        {/* CSS Grid: карточки сами раскладываются в 1–3 колонки в зависимости от ширины, без медиазапросов */}
        <div className="brand-grid">
          {brands.items.map(({ brand, number: foundNumber, name, count }) => (
            <button
              key={brand}
              type="button"
              className="brand-card"
              aria-pressed={brand === selectedBrand}
              onClick={() => dispatch(fetchOffers({ number, brand }))}
            >
              <span className="d-flex justify-content-between align-items-start gap-2">
                <span className="fw-semibold text-break">{brand}</span>
                <StockBadge count={count} />
              </span>
              <span className="small text-body-secondary text-break">{foundNumber}</span>
              {name && <span className="small text-break">{name}</span>}
            </button>
          ))}
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
