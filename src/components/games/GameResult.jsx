import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import Button from '../ui/Button'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const CONFETTI_COLORS = [
  'var(--color-coral)',
  'var(--color-gold)',
  'var(--color-sage)',
  'var(--color-navy)',
]

function Star({ filled }) {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" data-star>
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.6Z"
        fill={filled ? 'var(--color-gold)' : 'transparent'}
        stroke={filled ? 'var(--color-gold)' : 'var(--color-navy)'}
        strokeOpacity={filled ? 1 : 0.25}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Pantalla final de cualquier juego: estrellas, puntaje y confeti suave.
 * `stars` va de 1 a 3.
 */
export default function GameResult({ title = '¡Bien hecho!', detail, stars = 1, onReplay, onExit }) {
  const cardRef = useRef(null)
  const confettiRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card || reduced()) return

    animate(card, { opacity: [0, 1], scale: [0.94, 1], duration: 380, ease: 'outBack' })
    animate(card.querySelectorAll('[data-star]'), {
      scale: [0, 1],
      rotate: [-40, 0],
      duration: 520,
      ease: 'outBack',
      delay: stagger(140, { start: 220 }),
    })

    const pieces = confettiRef.current?.querySelectorAll('span')
    if (pieces?.length) {
      animate(pieces, {
        translateY: [-20, 220],
        translateX: () => (Math.random() - 0.5) * 180,
        rotate: () => Math.random() * 540,
        opacity: [1, 0],
        duration: 1900,
        ease: 'outQuad',
        delay: stagger(28),
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/35 px-6">
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-paper p-7 text-center shadow-lift"
      >
        <div ref={confettiRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-0">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className="absolute block h-2 w-2 rounded-[2px]"
              style={{
                left: `${(i * 5.5 + 4) % 96}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              }}
            />
          ))}
        </div>

        <h2>{title}</h2>

        <div className="mt-3 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <Star key={n} filled={n <= stars} />
          ))}
        </div>

        {detail && <p className="mt-3 text-[0.92rem] text-ink-soft">{detail}</p>}

        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Button size="sm" onClick={onReplay}>
            Jugar otra vez
          </Button>
          <Button size="sm" variant="ghost" onClick={onExit}>
            Volver a Games
          </Button>
        </div>
      </div>
    </div>
  )
}
