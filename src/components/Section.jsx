// Карточка шага подбора: номер шага, заголовок и содержимое
export default function Section({ step, title, children }) {
  const headingId = `step-${step}-title`;
  return (
    <section className="card border-0 shadow-sm mb-3" aria-labelledby={headingId}>
      <div className="card-body p-3 p-sm-4">
        <h2 id={headingId} className="h5 d-flex align-items-center gap-2 mb-3">
          <span className="step-number" aria-hidden="true">
            {step}
          </span>
          <span className="text-break">{title}</span>
        </h2>
        {children}
      </div>
    </section>
  );
}
