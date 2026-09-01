import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate } from 'animejs'
import GameResult from './GameResult'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildDeck(pairs) {
  return shuffle(
    pairs.flatMap(([en, es], i) => [
      { key: `${i}-a`, pair: i, text: en, side: 'en' },
      { key: `${i}-b`, pair: i, text: es, side: 'es' },
    ]),
  )
}

function fmtTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * Memory de parejas inglés ↔ español.
 * El giro 3D va con Anime.js sobre la cara interna; el pulso del acierto va
 * sobre la carta externa, para no pisar el transform de la rotación.
 */
export default function MemoryGame({ game, onFinish, onExit }) {
  const pairs = game.data?.pairs ?? []
  const [deck, setDeck] = useState(() => buildDeck(pairs))
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [attempts, setAttempts] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [finished, setFinished] = useState(false)

  /* El aviso de fin va detrás de un ref, no del estado: el store de progreso
     notifica de forma síncrona, así que el efecto se re-entraba antes de que
     `finished` estuviera commiteado y se disparaba un bucle de renders. */
  const reportedRef = useRef(false)
  const innerRefs = useRef({})
  const cardRefs = useRef({})
  const lockRef = useRef(false)

  const done = matched.length === pairs.length && pairs.length > 0

  useEffect(() => {
    if (done || finished) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [done, finished])

  const stars = useMemo(() => {
    if (!pairs.length) return 1
    if (attempts <= pairs.length + 2) return 3
    if (attempts <= pairs.length * 2) return 2
    return 1
  }, [attempts, pairs.length])

  useEffect(() => {
    if (!done || reportedRef.current) return
    reportedRef.current = true
    setFinished(true)
    const score = Math.max(20, Math.round((pairs.length / Math.max(attempts, pairs.length)) * 100))
    onFinish?.({ score, stars })
  }, [done, attempts, pairs.length, stars, onFinish])

  const spin = useCallback((key, deg) => {
    const el = innerRefs.current[key]
    if (!el) return
    if (reduced()) {
      el.style.transform = `rotateY(${deg}deg)`
      return
    }
    animate(el, { rotateY: deg, duration: 400, ease: 'outQuad' })
  }, [])

  const reveal = (card) => {
    if (lockRef.current) return
    if (matched.includes(card.pair) || flipped.some((f) => f.key === card.key)) return

    const next = [...flipped, card]
    setFlipped(next)
    spin(card.key, 180)

    if (next.length < 2) return

    lockRef.current = true
    setAttempts((a) => a + 1)
    const [first, second] = next

    if (first.pair === second.pair) {
      setMatched((m) => [...m, first.pair])
      setFlipped([])
      lockRef.current = false
      if (!reduced()) {
        ;[first, second].forEach((c) => {
          const el = cardRefs.current[c.key]
          if (el) animate(el, { scale: [1, 1.08, 1], duration: 420, ease: 'outQuad' })
        })
      }
    } else {
      setTimeout(() => {
        spin(first.key, 0)
        spin(second.key, 0)
        setFlipped([])
        lockRef.current = false
      }, 800)
    }
  }

  const replay = () => {
    Object.keys(innerRefs.current).forEach((k) => {
      const el = innerRefs.current[k]
      if (el) el.style.transform = 'rotateY(0deg)'
    })
    setDeck(buildDeck(pairs))
    setFlipped([])
    setMatched([])
    setAttempts(0)
    setSeconds(0)
    setFinished(false)
    reportedRef.current = false
    lockRef.current = false
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="label-caps text-sage-ink">
          Parejas: {matched.length} de {pairs.length}
        </p>
        <p className="label-caps text-ink-soft">
          Intentos: {attempts} · Tiempo: {fmtTime(seconds)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {deck.map((card) => {
          const isMatched = matched.includes(card.pair)
          const isUp = isMatched || flipped.some((f) => f.key === card.key)
          return (
            <button
              key={card.key}
              ref={(el) => {
                cardRefs.current[card.key] = el
              }}
              onClick={() => reveal(card)}
              aria-label={isUp ? card.text : 'Carta boca abajo'}
              className="relative h-[92px] w-full"
              style={{ perspective: 800 }}
            >
              <span
                ref={(el) => {
                  innerRefs.current[card.key] = el
                }}
                className="absolute inset-0 block"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Reverso: tricolor suave */}
                <span
                  className="absolute inset-0 flex items-center justify-center rounded-xl
                    border border-navy/12 shadow-soft"
                  style={{
                    backfaceVisibility: 'hidden',
                    background:
                      'linear-gradient(150deg, rgba(0,61,165,.14), rgba(255,209,0,.16) 55%, rgba(206,17,38,.14))',
                  }}
                >
                  <span className="text-xl opacity-70" aria-hidden="true">
                    🌎
                  </span>
                </span>

                {/* Cara */}
                <span
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border
                    px-2 text-center font-display text-[0.86rem] leading-tight shadow-soft
                    ${isMatched
                      ? 'border-sage-ink/50 bg-tip text-sage-ink'
                      : 'border-navy/12 bg-white text-navy'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {card.text}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {finished && (
        <GameResult
          detail={`${pairs.length} parejas en ${attempts} intentos · ${fmtTime(seconds)}`}
          stars={stars}
          onReplay={replay}
          onExit={onExit}
        />
      )}
    </>
  )
}
