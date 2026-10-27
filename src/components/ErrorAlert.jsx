export default function ErrorAlert({ message, onRetry }) {
  return (
    <div
      className="alert alert-danger d-flex flex-wrap justify-content-between align-items-center gap-2 mb-0"
      role="alert"
    >
      <span>{message || 'Не удалось загрузить данные.'}</span>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-danger" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  );
}
