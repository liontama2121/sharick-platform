/** Marco común de todas las actividades: título, instrucciones y estado. */
export default function ActivityShell({
  title,
  instructions,
  icon = '✏️',
  completed = false,
  score = null,
  children,
  footer,
}) {
  return (
    <section className="card-soft overflow-hidden">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-col-blue/8 px-5 py-4 sm:px-7">
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <div>
            <h3>{title}</h3>
            {instructions && <p className="mt-0.5 text-sm text-ink/65">{instructions}</p>}
          </div>
        </div>
        {completed && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f8ee] px-3 py-1.5
            font-title text-xs font-semibold text-[#1d6b3f]">
            ✓ Completada{score != null ? ` · ${score}%` : ''}
          </span>
        )}
      </header>

      <div className="px-5 py-6 sm:px-7">{children}</div>

      {footer && <div className="border-t border-col-blue/8 px-5 py-4 sm:px-7">{footer}</div>}
    </section>
  )
}
