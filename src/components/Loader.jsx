// role="status" — скринридер озвучит текст загрузки; сам спиннер декоративный
export default function Loader({ text = 'Загрузка…' }) {
  return (
    <div className="d-flex align-items-center gap-2 text-body-secondary py-2" role="status">
      <span className="spinner-border spinner-border-sm text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
