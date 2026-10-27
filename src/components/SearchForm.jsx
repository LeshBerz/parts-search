import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBrands } from '../store/searchSlice';

export default function SearchForm() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.search.brands.status === 'loading');
  const [number, setNumber] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = number.trim();
    if (value) dispatch(fetchBrands(value));
  };

  return (
    <form className="d-flex gap-2 mb-3" onSubmit={handleSubmit}>
      <input
        className="form-control"
        placeholder="Артикул, например 7160500039S"
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        aria-label="Артикул"
        autoFocus
      />
      <button type="submit" className="btn btn-primary text-nowrap" disabled={!number.trim() || isLoading}>
        Найти
      </button>
    </form>
  );
}
