import Icon from './Icon';

// Иконка и текст держатся вместе, на узком экране под них переносится только кнопка
export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex flex-wrap align-items-center gap-2 mb-0" role="alert">
      <div className="d-flex align-items-start gap-2 flex-grow-1">
        <Icon name="alert" className="fs-5 flex-shrink-0" />
        <span>{message || 'Не удалось загрузить данные.'}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-sm btn-danger d-inline-flex align-items-center gap-1"
          onClick={onRetry}
        >
          <Icon name="refresh" />
          Повторить
        </button>
      )}
    </div>
  );
}
