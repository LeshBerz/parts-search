import { IS_DEMO } from './api/partsApi';
import SearchForm from './components/SearchForm';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';
import Icon from './components/Icon';

export default function App() {
  return (
    <main className="container app py-4 py-sm-5">
      <header className="d-flex align-items-center gap-3 mb-4">
        <span className="app-logo" aria-hidden="true">
          <Icon name="package" />
        </span>
        <div>
          <h1 className="h3 fw-bold mb-1">Подбор автозапчастей</h1>
          <p className="text-body-secondary mb-0">
            Введите артикул, выберите производителя — покажем цены, остатки на складах и аналоги.
          </p>
        </div>
      </header>

      {IS_DEMO && (
        <div className="alert alert-info py-2 small" role="note">
          <strong>Демо-режим:</strong> ключ API не задан, данные тестовые. Как подключить ключ — в README.
        </div>
      )}

      <SearchForm />
      <BrandList />
      <OffersTable />
    </main>
  );
}
