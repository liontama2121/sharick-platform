import { useEffect, useRef } from 'react'
import SmartImage from '../ui/ImagePlaceholder'
import AnalogClock from '../ui/AnalogClock'
import SectionLabel from '../ui/SectionLabel'
import { popIn } from '../../hooks/useFeedback'

/**
 * Rutina del día: mañana, tarde, noche y al dormir, con su saludo.
 * Una fila por momento: dentro de la hoja del libro no cabe una rejilla.
 */
export default function RoutineBlock({ section }) {
  const ref = useRef(null)
  const items = section.items ?? []

  useEffect(() => {
    if (ref.current) popIn(ref.current.querySelectorAll('[data-bubble]'), 120)
  }, [section.title])

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <SectionLabel tone="sage" leaf>
          {section.label ?? 'Through the day'}
        </SectionLabel>
        {section.title && <h3>{section.title}</h3>}
      </div>
      {section.instructions && (
        <p className="mb-3 text-[0.9rem] text-ink-soft">{section.instructions}</p>
      )}

      <div ref={ref} className="flex flex-col gap-2.5">
        {items.map((item) => (
          <article key={item.time} data-bubble className="box-beige flex items-center gap-3 p-2.5">
            {item.clockTime && <AnalogClock time={item.clockTime} size={54} showDigital={false} />}

            <div className="min-w-0 flex-1">
              <p className="label-caps text-coral-ink">{item.label ?? item.time}</p>
              <p className="font-display text-[1.15rem] leading-tight text-navy">{item.greeting}</p>
              {item.note && (
                <p className="mt-0.5 text-[0.76rem] leading-snug text-ink-soft">{item.note}</p>
              )}
            </div>

            {item.image && (
              <div className="h-12 w-14 shrink-0">
                <SmartImage
                  src={item.image}
                  alt={item.label ?? item.time}
                  emoji={item.emoji ?? '🌿'}
                  rounded="rounded-lg"
                  compact
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
