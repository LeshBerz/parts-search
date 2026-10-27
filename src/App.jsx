import { IS_DEMO } from './api/partsApi';
import SearchForm from './components/SearchForm';
import BrandList from './components/BrandList';
import OffersTable from './components/OffersTable';

export default function App() {
  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <h1 className="h3 mb-1">Подбор автозапчастей</h1>
      <p className="text-muted mb-4">Введите артикул, выберите производителя и получите предложения с аналогами.</p>

      {IS_DEMO && (
        <div className="alert alert-info py-2">
          Демо-режим: ключ API не задан. Попробуйте артикулы <b>7160500039S</b> или <b>OC90</b>.
        </div>
      )}

      <SearchForm />
      <BrandList />
      <OffersTable />
    </div>
  );
}
