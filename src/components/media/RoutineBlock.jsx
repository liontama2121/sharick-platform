import { useEffect, useRef } from 'react'
import SmartImage from '../ui/ImagePlaceholder'
import AnalogClock from '../ui/AnalogClock'
import { popIn } from '../../hooks/useFeedback'

/** Rutina del día: mañana, tarde, noche y al dormir, con su saludo. */
export default function RoutineBlock({ section }) {
  const ref = useRef(null)
  const items = section.items ?? []

  useEffect(() => {
    if (ref.current) popIn(ref.current.querySelectorAll('[data-bubble]'), 120)
  }, [section.title])

  return (
    <section className="card-soft overflow-hidden">
      <header className="border-b border-col-blue/8 px-5 py-4 sm:px-7">
        <h3>{section.title}</h3>
        {section.instructions && (
          <p className="mt-0.5 text-sm text-ink/65">{section.instructions}</p>
        )}
      </header>

      <div ref={ref} className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-7">
        {items.map((item) => (
          <article
            key={item.time}
            data-bubble
            className="anim-hidden overflow-hidden rounded-2xl border-2 border-col-blue/10"
          >
            <div className="h-32 w-full">
              <SmartImage
                src={item.image}
                alt={item.label ?? item.time}
                emoji={item.emoji ?? '🇨🇴'}
                rounded="rounded-none"
              />
            </div>
            <div className="flex items-center gap-4 p-4">
              {item.clockTime && <AnalogClock time={item.clockTime} size={72} showDigital={false} />}
              <div>
                <p className="font-title text-xs font-semibold uppercase tracking-wide text-col-red">
                  {item.label ?? item.time}
                </p>
                <p className="font-title text-xl font-bold text-col-blue">{item.greeting}</p>
                {item.note && <p className="mt-1 text-sm text-ink/65">{item.note}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
