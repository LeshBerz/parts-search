// Скелетоны повторяют форму будущего контента: пользователь сразу видит, что появится,
// а страница не «прыгает», когда приходят данные. Текст в role="status" озвучит скринридер.
function Skeleton({ label, children }) {
  return (
    <div className="placeholder-glow">
      <div className="small text-body-secondary mb-2" role="status">
        {label}
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

export function BrandsSkeleton() {
  return (
    <Skeleton label="Ищем производителей…">
      <div className="brand-grid">
        {[0, 1, 2].map((index) => (
          <div key={index} className="brand-card">
            <span className="placeholder col-5" />
            <span className="placeholder placeholder-sm col-4" />
            <span className="placeholder placeholder-sm col-9" />
          </div>
        ))}
      </div>
    </Skeleton>
  );
}

export function TableSkeleton() {
  return (
    <Skeleton label="Загружаем предложения и аналоги…">
      {[0, 1, 2, 3].map((index) => (
        <div key={index} className="d-flex align-items-center gap-3 py-3 border-bottom">
          <div className="flex-grow-1">
            <span className="placeholder col-7 d-block mb-2" />
            <span className="placeholder placeholder-sm col-4 d-block" />
          </div>
          <span className="placeholder col-2" />
          <span className="placeholder col-1" />
        </div>
      ))}
    </Skeleton>
  );
}
