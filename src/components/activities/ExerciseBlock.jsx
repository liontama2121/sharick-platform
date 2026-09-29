/**
 * Envoltura editorial de toda actividad:
 * título + instrucción en bold + contenido. Sin kicker "EXERCISE N": el número
 * grande ya lo pone ExerciseInstruction en la cabecera de la pantalla.
 */
export default function ExerciseBlock({
  number,
  label,
  title,
  instructions,
  completed = false,
  score = null,
  children,
  footer,
}) {
  return (
    <section className="pt-1">
      {(title || completed) && (
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          {title && <h3>{title}</h3>}
          {completed && (
            <span className="ml-auto rounded-full bg-verde-ink px-3 py-0.5 text-[0.8rem] font-semibold text-white">
              Done{score != null ? ` · ${score}%` : ''}
            </span>
          )}
        </div>
      )}
      {instructions && (
        <p className="mb-3 text-[0.92rem] font-semibold text-ink">{instructions}</p>
      )}

      <div>{children}</div>

      {footer && <div className="mt-3 text-[0.82rem] text-ink-soft">{footer}</div>}
    </section>
  )
}
