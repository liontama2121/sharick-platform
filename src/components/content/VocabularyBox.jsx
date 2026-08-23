import { useEffect, useRef } from 'react'
import SectionLabel from '../ui/SectionLabel'
import PillButton from '../ui/PillButton'
import { popIn } from '../../hooks/useFeedback'

/**
 * Caja beige de vocabulario: label verde + grid de palabras con icono.
 * section: { title, label, columns, items:[{word, translation, icon}], actions:[...] }
 */
export default function VocabularyBox({ section, onListen }) {
  const ref = useRef(null)
  const items = section.items ?? []
  const cols = section.columns ?? 3

  useEffect(() => {
    if (ref.current) popIn(ref.current.querySelectorAll('[data-bubble]'), 60)
  }, [section.title])

  return (
    <section className="box-beige px-5 py-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <SectionLabel tone="sage" leaf>
          {section.label ?? 'Vocabulary'}
        </SectionLabel>
        {section.title && (
          <span className="font-display text-base text-navy">{section.title}</span>
        )}
      </div>

      <ul
        ref={ref}
        className="grid gap-x-3 gap-y-2.5"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map((it) => (
          <li key={it.word} data-bubble className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                border border-sage/55 bg-white text-[13px]"
            >
              {it.icon ?? '•'}
            </span>
            <span className="min-w-0">
              <span className="block text-[0.88rem] font-semibold leading-tight text-navy">{it.word}</span>
              {it.translation && (
                <span className="block text-[0.7rem] leading-tight text-ink-soft">{it.translation}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {(section.actions ?? []).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {section.actions.map((a) => (
            <PillButton key={a.label} icon={a.icon} onClick={() => onListen?.(a)}>
              {a.label}
            </PillButton>
          ))}
        </div>
      )}
    </section>
  )
}
