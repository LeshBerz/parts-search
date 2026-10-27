import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands, fetchOffers } from '../store/searchSlice';
import Loader from './Loader';
import ErrorAlert from './ErrorAlert';

export default function BrandList() {
  const dispatch = useDispatch();
  const { number, selectedBrand, brands } = useSelector((state) => state.search);

  if (brands.status === 'idle') return null;
  if (brands.status === 'loading') return <Loader text="Ищем производителей…" />;
  if (brands.status === 'failed') {
    return <ErrorAlert message={brands.error} onRetry={() => dispatch(fetchBrands(number))} />;
  }
  if (!brands.items.length) {
    return <div className="alert alert-warning my-3">По артикулу «{number}» ничего не найдено.</div>;
  }

  return (
    <div className="mb-4">
      <h2 className="h6 text-muted mb-2">Производители с артикулом «{number}»</h2>
      <div className="list-group">
        {brands.items.map(({ brand, name }) => (
          <button
            key={brand}
            type="button"
            className={`list-group-item list-group-item-action ${brand === selectedBrand ? 'active' : ''}`}
            onClick={() => dispatch(fetchOffers({ number, brand }))}
          >
            <b>{brand}</b> <span className={brand === selectedBrand ? '' : 'text-muted'}>— {name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
