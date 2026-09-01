import { useMemo, useRef, useState } from 'react'
import GameResult from './GameResult'
import Button from '../ui/Button'
import { celebrate, shake } from '../../hooks/useFeedback'

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Desordena hasta que quede distinto del original (si se puede). */
function scramble(tokens) {
  if (tokens.length < 2) return tokens
  for (let i = 0; i < 12; i++) {
    const out = shuffle(tokens)
    if (out.join(' ') !== tokens.join(' ')) return out
  }
  return tokens
}

/**
 * Ordena la frase tocando las piezas en el orden correcto.
 * Frases de varias palabras se parten en palabras; una sola palabra, en letras.
 */
export default function WordScramble({ game, onFinish, onExit }) {
  const items = game.data?.items ?? []

  const [index, setIndex] = useState(0)
  const [built, setBuilt] = useState([])
  const [errors, setErrors] = useState(0)
  const [finished, setFinished] = useState(false)
  const [round, setRound] = useState(0)

  const reportedRef = useRef(false)
  const rowRef = useRef(null)
  const item = items[index]

  const tokens = useMemo(() => {
    if (!item) return []
    const words = item.answer.split(' ')
    return words.length > 1 ? words : item.answer.split('')
    // `round` fuerza un barajado nuevo al reintentar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, round])

  const pool = useMemo(() => scramble(tokens), [tokens])
  const joiner = tokens.length && tokens[0].length === 1 ? '' : ' '

  const stars = errors === 0 ? 3 : errors <= items.length ? 2 : 1

  const tap = (token, i) => {
    if (!item) return
    const expected = tokens[built.length]
    if (token === expected) {
      const next = [...built, i]
      setBuilt(next)
      celebrate(rowRef.current)

      if (next.length === tokens.length) {
        setTimeout(() => {
          if (index + 1 >= items.length) {
            setFinished(true)
            if (!reportedRef.current) {
              reportedRef.current = true
              onFinish?.({ score: Math.max(20, 100 - errors * 10), stars })
            }
          } else {
            setIndex((n) => n + 1)
            setBuilt([])
          }
        }, 650)
      }
    } else {
      setErrors((e) => e + 1)
      shake(rowRef.current)
    }
  }

  const replay = () => {
    setIndex(0)
    setBuilt([])
    setErrors(0)
    setFinished(false)
    reportedRef.current = false
    setRound((r) => r + 1)
  }

  return (
    <>
      {item && (
        <div className="box-beige p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-caps text-sage-ink">
              Frase {index + 1} de {items.length}
            </p>
            <p className="label-caps text-coral-ink">Errores: {errors}</p>
          </div>

          {item.hint && <p className="mb-3 text-[0.88rem] italic text-ink-soft">{item.hint}</p>}

          {/* Frase en construcción */}
          <div
            ref={rowRef}
            className="mb-5 flex min-h-[56px] flex-wrap items-center gap-1.5 rounded-xl
              border-2 border-dashed border-navy/20 bg-white px-3 py-2.5"
          >
            {built.length === 0 && (
              <span className="text-[0.85rem] text-ink-soft/70">
                Toca las piezas en el orden correcto…
              </span>
            )}
            {built.map((poolIndex, n) => (
              <span
                key={n}
                className="rounded-lg bg-tip px-2.5 py-1 font-display text-[1rem] text-sage-ink"
              >
                {pool[poolIndex]}
              </span>
            ))}
          </div>

          {/* Piezas disponibles */}
          <div className="flex flex-wrap gap-2">
            {pool.map((token, i) => {
              const used = built.includes(i)
              return (
                <button
                  key={`${token}-${i}`}
                  disabled={used}
                  onClick={() => tap(token, i)}
                  className={`rounded-lg border px-3 py-2 font-display text-[1rem] transition-colors
                    ${used
                      ? 'border-navy/8 bg-box text-ink-soft/40'
                      : 'border-navy/15 bg-white text-navy hover:border-coral-ink hover:text-coral-ink'}`}
                >
                  {token}
                </button>
              )
            })}
          </div>

          <div className="mt-4">
            <Button size="sm" variant="ghost" onClick={() => setBuilt([])}>
              Limpiar
            </Button>
          </div>

          <p className="mt-3 text-[0.78rem] text-ink-soft">
            Respuesta esperada: {tokens.length} {joiner === '' ? 'letras' : 'palabras'}
          </p>
        </div>
      )}

      {finished && (
        <GameResult
          detail={`${items.length} frases · ${errors} errores`}
          stars={stars}
          onReplay={replay}
          onExit={onExit}
        />
      )}
    </>
  )
}
