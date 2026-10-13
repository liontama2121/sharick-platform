import { useEffect, useId, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Eye, EyeOff, Plus, RotateCcw, Shuffle } from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const shuffle = (list) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* Reversos de naipe, alternados: amarillo, azul y rojo */
const BACKS = [
  { bg: 'var(--color-amarillo)', ink: 'var(--color-azul)' },
  { bg: 'var(--color-azul)', ink: 'var(--color-amarillo)' },
  { bg: 'var(--color-rojo-ink)', ink: 'var(--color-amarillo)' },
]

/** Reverso elegante: marco doble, celosía de rombos y medallón central. */
function CardBack({ tone }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 200 280" className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern id={`${id}-p`} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="20" height="20" fill={tone.bg} />
          <rect width="20" height="2" fill={tone.ink} opacity="0.35" />
          <rect width="2" height="20" fill={tone.ink} opacity="0.35" />
        </pattern>
      </defs>
      <rect width="200" height="280" rx="18" fill={tone.bg} />
      <rect x="12" y="12" width="176" height="256" rx="10" fill={`url(#${id}-p)`} stroke={tone.ink} strokeWidth="3" />
      <rect x="20" y="20" width="160" height="240" rx="7" fill="none" stroke={tone.ink} strokeWidth="1.5" opacity="0.7" />
      <circle cx="100" cy="140" r="38" fill={tone.bg} stroke={tone.ink} strokeWidth="3" />
      <path d="M100 112 L108 132 L130 132 L112 145 L119 166 L100 153 L81 166 L88 145 L70 132 L92 132Z" fill={tone.ink} />
    </svg>
  )
}

/**
 * "Play with your partner. Spell and guess!" Baraja de nombres: al tocar el
 * mazo, la carta de arriba sale volteándose en 3D y muestra un nombre
 * grande. Uno deletrea, el otro adivina; la tabla de puntos suma con +1.
 * Los nombres salen barajados y no se repiten hasta agotar el mazo.
 * Es por partida: los puntos no se guardan.
 * section: { names: [...] }
 */
export default function SpellingCards({ section, onComplete }) {
  const names = section.names ?? []
  const [deck, setDeck] = useState(() => shuffle(names))
  const [drawn, setDrawn] = useState(0)
  const [current, setCurrent] = useState(null)
  const [score, setScore] = useState([0, 0])
  /* Pantalla compartida: el que adivina no debe leer el nombre */
  const [hidden, setHidden] = useState(false)
  const cardRef = useRef(null)
  const deckRef = useRef(null)
  const scoreRefs = useRef([])
  const reported = useRef(false)

  const left = deck.length - drawn

  /* Cada carta nueva sale del mazo y se voltea */
  useEffect(() => {
    const el = cardRef.current
    if (!el || current == null || reduced()) return
    const a = animate(el, {
      translateX: [-300, 0],
      translateY: [10, 0],
      rotateY: [180, 0],
      rotateZ: [-8, 0],
      duration: 820,
      ease: 'outQuart',
    })
    return () => a.revert()
  }, [current])

  const draw = () => {
    if (left <= 0) return
    if (deckRef.current && !reduced()) animate(deckRef.current, { translateY: [0, -6, 0], duration: 260, ease: 'outQuad' })
    setCurrent(deck[drawn])
    const next = drawn + 1
    setDrawn(next)
    if (next === deck.length && !reported.current) {
      reported.current = true
      onComplete?.(100)
    }
  }

  const reshuffle = () => {
    setDeck(shuffle(names))
    setDrawn(0)
    setCurrent(null)
  }

  const add = (p) => {
    setScore((s) => s.map((v, i) => (i === p ? v + 1 : v)))
    const el = scoreRefs.current[p]
    if (el && !reduced()) animate(el, { scale: [1, 1.45, 1], duration: 460, ease: 'outBack(2)' })
  }

  const tone = BACKS[drawn % BACKS.length]

  return (
    /* Contenedor con consultas de tamaño: en el lienzo del libro va a dos
       columnas; en la ventana más estrecha del hub de Games, apilado. */
    <div className="@container h-full">
    <div className="grid h-full grid-cols-1 gap-8 @4xl:grid-cols-[1fr_330px]">
      {/* Mesa: mazo + carta volteada */}
      <div className="relative flex flex-wrap items-center justify-center gap-x-16 gap-y-14 rounded-[26px] border-[4px] border-verde-ink bg-verde-ink/90 px-10 py-8 shadow-lift"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, color-mix(in srgb, var(--color-verde) 80%, var(--color-paper)), var(--color-verde-ink))' }}
      >
        <button
          ref={deckRef}
          type="button"
          onClick={draw}
          disabled={left <= 0}
          aria-label={left > 0 ? `Pick a card. ${left} left` : 'No cards left'}
          className="relative h-[300px] w-[214px] shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-amarillo disabled:opacity-40"
        >
          {/* Cartas apiladas */}
          {Array.from({ length: Math.min(4, Math.max(left, 1)) }, (_, k) => (
            <span
              key={k}
              className="absolute inset-0 rounded-[18px] shadow-lift"
              style={{ transform: `translate(${k * -4}px, ${k * -5}px) rotate(${(k - 1.5) * 1.6}deg)` }}
            >
              <CardBack tone={BACKS[(drawn + 3 - k) % BACKS.length]} />
            </span>
          ))}
          <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper px-4 py-1.5 font-body text-[18px] font-bold text-azul shadow-soft">
            {left > 0 ? `Pick a card · ${left} left` : 'No cards left'}
          </span>
        </button>

        <div className="relative h-[330px] w-full max-w-[440px]" style={{ perspective: 1200 }}>
          {current ? (
            <div
              key={`${current}-${drawn}`}
              ref={cardRef}
              className="relative h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Cara */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-[22px] border-[5px] border-amarillo bg-paper px-8 text-center shadow-page"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="absolute left-4 top-3 font-display text-[28px] text-rojo-ink">★</span>
                <span className="absolute bottom-3 right-4 rotate-180 font-display text-[28px] text-rojo-ink">★</span>
                <p className="font-body text-[20px] font-semibold text-ink-soft">Spell this name:</p>
                {hidden ? (
                  <p className="font-display text-[54px] leading-[1.05] tracking-[0.2em] text-azul/25">? ? ? ?</p>
                ) : (
                  current.split(' ').map((w) => (
                    <p key={w} className="font-display text-[54px] leading-[1.05] text-azul">
                      {w}
                    </p>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => setHidden((h) => !h)}
                  className="mt-4 flex items-center gap-2 rounded-full bg-box px-4 py-2 font-body text-[18px] font-bold text-azul hover:bg-amarillo"
                >
                  {hidden ? <Eye size={20} strokeWidth={2.4} /> : <EyeOff size={20} strokeWidth={2.4} />}
                  {hidden ? 'Show name' : 'Hide name'}
                </button>
              </div>
              {/* Reverso */}
              <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <CardBack tone={tone} />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[22px] border-[4px] border-dashed border-paper/60 px-8 text-center">
              <p className="font-display text-[30px] leading-tight text-paper">Tap the deck to pick a card!</p>
            </div>
          )}
        </div>

        {left <= 0 && (
          <button
            type="button"
            onClick={reshuffle}
            className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-amarillo px-5 py-2.5 font-body text-[18px] font-bold text-azul shadow-lift"
          >
            <Shuffle size={20} strokeWidth={2.4} /> Shuffle again
          </button>
        )}
      </div>

      {/* Tabla de puntos */}
      <aside className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-[22px] border-[4px] border-azul bg-paper shadow-lift">
          <p className="bg-azul px-5 py-2.5 font-display text-[24px] text-amarillo">Score</p>
          {['Player 1', 'Player 2'].map((p, i) => (
            <div key={p} className={`flex items-center gap-4 px-5 py-4 ${i ? 'border-t-[3px] border-azul/10' : ''}`}>
              <span className="flex-1 font-body text-[22px] font-bold text-azul">{p}</span>
              <span
                ref={(el) => {
                  scoreRefs.current[i] = el
                }}
                className="w-14 text-center font-display text-[46px] leading-none text-rojo-ink"
                aria-live="polite"
              >
                {score[i]}
              </span>
              <button
                type="button"
                onClick={() => add(i)}
                aria-label={`${p}: plus one point`}
                className="flex h-12 items-center gap-1 rounded-full bg-verde-ink px-4 font-display text-[20px] text-paper shadow-soft hover:brightness-110"
              >
                <Plus size={18} strokeWidth={3} />1
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setScore([0, 0])}
            className="flex w-full items-center justify-center gap-2 border-t-[3px] border-azul/10 py-3 font-body text-[17px] font-semibold text-ink-soft hover:bg-box"
          >
            <RotateCcw size={17} strokeWidth={2.4} /> Reset
          </button>
        </div>
        <ol className="rounded-[18px] bg-box px-5 py-4 font-body text-[18px] leading-snug text-ink">
          <li>
            <b className="text-azul">1.</b> Player 1 picks a card and spells the name.
          </li>
          <li>
            <b className="text-azul">2.</b> Player 2 listens and guesses.
          </li>
          <li>
            <b className="text-azul">3.</b> Correct? +1 point. Change roles!
          </li>
        </ol>
      </aside>
    </div>
    </div>
  )
}
