import { useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function Stars({ n = 0 }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} de 3 estrellas`}>
      {[1, 2, 3].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.6Z"
            fill={i <= n ? 'var(--color-gold)' : 'transparent'}
            stroke={i <= n ? 'var(--color-gold)' : 'var(--color-navy)'}
            strokeOpacity={i <= n ? 1 : 0.22}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </span>
  )
}

/** Tarjeta del hub de juegos. */
export default function GameCard({ game, result, onPlay }) {
  const ref = useRef(null)

  const hover = (on) => {
    if (!ref.current || reduced()) return
    animate(ref.current, { scale: on ? 1.04 : 1, duration: 260, ease: 'outQuad' })
  }

  return (
    <button
      ref={ref}
      onClick={onPlay}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      className="flex h-full flex-col gap-2 rounded-2xl border border-navy/10 bg-box p-5
        text-left shadow-soft transition-shadow hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl" aria-hidden="true">
          {game.icon}
        </span>
        {result?.played && (
          <span className="rounded-full bg-tip px-2.5 py-1 label-caps text-sage-ink">Jugado ✓</span>
        )}
      </div>

      <h3 className="mt-1">{game.title}</h3>
      <p className="label-caps text-coral-ink">Module {game.module}</p>
      {game.blurb && <p className="text-[0.86rem] leading-relaxed text-ink-soft">{game.blurb}</p>}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Stars n={result?.stars ?? 0} />
        {result?.played ? (
          <span className="text-[0.75rem] text-ink-soft">Mejor: {result.bestScore}%</span>
        ) : (
          <span className="label-caps text-navy">Jugar →</span>
        )}
      </div>
    </button>
  )
}
