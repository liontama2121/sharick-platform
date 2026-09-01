import SectionLabel from '../ui/SectionLabel'

/**
 * Envoltura editorial de toda actividad:
 * label "EXERCISE N" verde con hojita + instrucción en bold + contenido.
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
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <SectionLabel tone="sage" leaf>
          {label ?? 'Exercise'}
          {number != null ? ` ${number}` : ''}
        </SectionLabel>
        {completed && (
          <span className="label-caps text-sage-ink">
            ✓ Hecho{score != null ? ` · ${score}%` : ''}
          </span>
        )}
      </div>

      {title && <h3 className="mb-1">{title}</h3>}
      {instructions && (
        <p className="mb-3 text-[0.92rem] font-semibold text-ink">{instructions}</p>
      )}

      <div>{children}</div>

      {footer && <div className="mt-3 text-[0.82rem] text-ink-soft">{footer}</div>}
    </section>
  )
}
