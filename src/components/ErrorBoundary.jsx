import { Component } from 'react';

// Ловит ошибки рендера (например, неожиданный формат данных), чтобы вместо белого экрана
// пользователь увидел сообщение. Классовый компонент: у хуков нет аналога getDerivedStateFromError.
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Ошибка интерфейса:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="container app py-5">
        <div className="alert alert-danger" role="alert">
          <h1 className="h5">Что-то пошло не так</h1>
          <p>Интерфейс не смог отобразить данные. Обновите страницу и повторите поиск.</p>
          <button type="button" className="btn btn-danger" onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      </main>
    );
  }
}
