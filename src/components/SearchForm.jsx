import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IS_DEMO } from '../api/partsApi';
import { fetchBrands } from '../store/searchSlice';
import Section from './Section';

const DEMO_NUMBERS = ['7160500039S', 'OC90', 'ERROR'];

export default function SearchForm() {
  const dispatch = useDispatch();
  const { number: searchedNumber, brands } = useSelector((state) => state.search);
  const [number, setNumber] = useState('');

  const value = number.trim();
  // Новый артикул можно искать и во время загрузки (старый ответ отбросит стор),
  // а повторно отправить тот же — нельзя, чтобы не тратить квоту запросов.
  const isSearchingThis = brands.status === 'loading' && value === searchedNumber;

  const search = (text) => dispatch(fetchBrands(text));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value) search(value);
  };

  const handleDemoClick = (demoNumber) => {
    setNumber(demoNumber);
    search(demoNumber);
  };

  return (
    <Section step={1} title="Артикул детали">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="part-number" className="visually-hidden">
          Артикул детали
        </label>
        <div className="input-group input-group-lg">
          <input
            id="part-number"
            type="search"
            className="form-control"
            placeholder="Например, 7160500039S"
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            aria-describedby="part-number-hint"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            enterKeyHint="search"
            autoFocus
          />
          <button type="submit" className="btn btn-primary px-4" disabled={!value || isSearchingThis}>
            {isSearchingThis && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
            Найти
          </button>
        </div>
        <div id="part-number-hint" className="form-text">
          Номер детали так, как он указан в каталоге: пробелы и спецсимволы допустимы.
        </div>
      </form>

      {IS_DEMO && (
        <div className="d-flex flex-wrap align-items-center gap-2 mt-3 small">
          <span className="text-body-secondary">Демо-артикулы:</span>
          {DEMO_NUMBERS.map((demoNumber) => (
            <button
              key={demoNumber}
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => handleDemoClick(demoNumber)}
            >
              {demoNumber}
            </button>
          ))}
        </div>
      )}
    </Section>
  );
}
