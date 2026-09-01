import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import Button from '../ui/Button'
import FeedbackToast from '../ui/FeedbackToast'
import { popIn } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Rellenos de la rueda. Los tres primeros llevan texto blanco y el dorado
   texto navy: así todos los segmentos pasan el contraste AA. */
const FILLS = [
  { bg: 'var(--color-navy)', ink: '#ffffff' },
  { bg: 'var(--color-coral-ink)', ink: '#ffffff' },
  { bg: 'var(--color-sage-ink)', ink: '#ffffff' },
  { bg: 'var(--color-gold)', ink: '#1b3a5c' },
]

const SPIN_MS = 3500
const R = 132
const C = 150

function polar(angleDeg, radius) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [C + radius * Math.cos(a), C + radius * Math.sin(a)]
}

function slicePath(startDeg, endDeg) {
  const [x1, y1] = polar(startDeg, R)
  const [x2, y2] = polar(endDeg, R)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${C} ${C} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`
}

/**
 * Ruleta de speaking. Misma idea que el dado pero con más consignas.
 * Los segmentos vienen del JSON; el progreso cuenta cuántos distintos
 * practicó el estudiante.
 */
export default function RouletteWheel({ section, completed, score, onComplete }) {
  const segments = section.segments ?? []
  const step = segments.length ? 360 / segments.length : 360

  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState(null)
  const [seen, setSeen] = useState([])
  const [toast, setToast] = useState(null)

  const wheelRef = useRef(null)
  const pulseRef = useRef(null)
  const cardRef = useRef(null)
  const rotationRef = useRef(0)

  useEffect(() => {
    if (winner != null && cardRef.current) {
      popIn(cardRef.current.querySelectorAll('[data-bubble]'), 90)
    }
  }, [winner])

  const spin = () => {
    if (spinning || !segments.length) return
    setSpinning(true)
    setWinner(null)

    const pick = Math.floor(Math.random() * segments.length)
    // Centro del segmento elegido, medido en sentido horario desde arriba.
    const center = pick * step + step / 2
    // Un poco de azar dentro del propio segmento para que no caiga siempre igual.
    const jitter = (Math.random() - 0.5) * step * 0.6
    const target = rotationRef.current + 1800 + (360 - ((rotationRef.current + center + jitter) % 360))

    const land = () => {
      rotationRef.current = target
      setWinner(pick)
      setSpinning(false)

      setSeen((prev) => {
        if (prev.includes(pick)) return prev
        const next = [...prev, pick]
        if (next.length === segments.length) {
          setToast({ msg: '¡Practicaste todas las consignas!', type: 'success' })
          onComplete?.(100)
        }
        return next
      })
    }

    if (!wheelRef.current || reduced()) {
      land()
      return
    }

    /* El giro va con una transición CSS y el pulso con anime, cada uno sobre
       un elemento distinto. Mezclarlos en el mismo nodo hacía que anime
       reconstruyera el transform y perdiera la rotación (la rueda acertaba
       el segmento pero se quedaba quieta). El aterrizaje va por temporizador:
       el callback onComplete de anime no llegaba a dispararse. */
    const wheel = wheelRef.current
    wheel.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.16, 0.72, 0.16, 1)`
    wheel.style.transform = `rotate(${target}deg)`

    setTimeout(() => {
      if (pulseRef.current) {
        animate(pulseRef.current, { scale: [1, 1.08, 1], duration: 420, ease: 'outQuad' })
      }
      land()
    }, SPIN_MS)
  }

  const active = winner != null ? segments[winner] : null

  return (
    <>
      <ExerciseBlock
        label={section.label}
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed || seen.length === segments.length}
        score={score}
        footer={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Practicados: {seen.length} de {segments.length}
            </span>
            <span className="flex flex-wrap gap-1">
              {segments.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-5 rounded-full ${seen.includes(i) ? 'bg-coral-ink' : 'bg-navy/12'}`}
                />
              ))}
            </span>
          </span>
        }
      >
        {/* onClick propio: pasar página es solo cosa de las esquinas del libro */}
        <div
          className="box-beige flex flex-col items-center gap-4 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div ref={pulseRef} className="relative">
            {/* Puntero fijo */}
            <svg
              width="26"
              height="20"
              viewBox="0 0 26 20"
              aria-hidden="true"
              className="absolute left-1/2 top-[-9px] z-10 -translate-x-1/2 drop-shadow"
            >
              <path d="M13 20 2 2h22L13 20Z" fill="var(--color-coral-ink)" />
            </svg>

            <div ref={wheelRef} className="w-[240px] md:w-[280px]" style={{ willChange: 'transform' }}>
              <svg viewBox="0 0 300 300" className="h-full w-full" role="img"
                aria-label={`Ruleta con ${segments.length} consignas`}>
                <circle cx={C} cy={C} r={R + 9} fill="var(--color-box)" />
                <circle
                  cx={C}
                  cy={C}
                  r={R + 9}
                  fill="none"
                  stroke="var(--color-navy)"
                  strokeOpacity=".18"
                  strokeWidth="2"
                />

                {segments.map((seg, i) => {
                  const start = i * step
                  const end = start + step
                  const fill = FILLS[i % FILLS.length]
                  const mid = start + step / 2
                  return (
                    <g key={i}>
                      <path d={slicePath(start, end)} fill={fill.bg} />
                      <path
                        d={slicePath(start, end)}
                        fill="none"
                        stroke="var(--color-paper)"
                        strokeWidth="2"
                      />
                      <text
                        x={C}
                        y={C - R * 0.58}
                        transform={`rotate(${mid} ${C} ${C})`}
                        textAnchor="middle"
                        fontSize="13"
                        fontFamily="Nunito Sans, sans-serif"
                        fontWeight="700"
                        fill={fill.ink}
                      >
                        {seg.label}
                      </text>
                    </g>
                  )
                })}

                <circle cx={C} cy={C} r="26" fill="var(--color-paper)" />
                <circle
                  cx={C}
                  cy={C}
                  r="26"
                  fill="none"
                  stroke="var(--color-navy)"
                  strokeOpacity=".2"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <Button onClick={spin} disabled={spinning} size="sm">
            {spinning ? 'Girando…' : '🎡 ¡Girar!'}
          </Button>

          <div ref={cardRef} className="min-h-[74px] w-full">
            {!active && !spinning && (
              <p className="text-center text-[0.88rem] text-ink-soft">
                Gira la ruleta y responde en voz alta la consigna que salga.
              </p>
            )}
            {active && (
              <div
                data-bubble
                className="rounded-xl border border-navy/12 bg-white px-4 py-3 text-center"
              >
                <p className="label-caps text-sage-ink">{active.label}</p>
                <p className="mt-1 font-display text-[1.05rem] text-navy">{active.prompt}</p>
              </div>
            )}
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
