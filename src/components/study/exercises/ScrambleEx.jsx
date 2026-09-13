import { useMemo, useRef, useState } from 'react'
import { S } from '../../../study/strings'
import { shuffle } from '../../../study'
import { celebrate, shake } from '../../../hooks/useFeedback'
import Button from '../../ui/Button'

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
 * Ordenar palabras: { answer: "Nice to meet you", hint? }.
 * Se tocan las piezas en orden; una pieza equivocada hace shake.
 */
export default function ScrambleEx({ exercise, onDone }) {
  const tokens = useMemo(() => exercise.answer.split(' '), [exercise.answer])
  const pool = useMemo(() => scramble(tokens), [tokens])
  const [built, setBuilt] = useState([])
  const rowRef = useRef(null)
  const done = built.length === tokens.length

  const tap = (i) => {
    if (done || built.includes(i)) return
    if (pool[i] === tokens[built.length]) {
      const next = [...built, i]
      setBuilt(next)
      celebrate(rowRef.current)
      if (next.length === tokens.length) onDone?.()
    } else {
      shake(rowRef.current)
    }
  }

  return (
    <div>
      {exercise.hint && <p className="mb-2 text-[0.85rem] italic text-ink-soft">{exercise.hint}</p>}
      <div
        ref={rowRef}
        className={`mb-3 flex min-h-[52px] flex-wrap items-center gap-1.5 rounded-xl border-2 border-dashed
          bg-white px-3 py-2 ${done ? 'border-sage-ink/60' : 'border-navy/20'}`}
      >
        {built.length === 0 && <span className="text-[0.85rem] text-ink-soft/70">{S.tapInOrder}</span>}
        {built.map((i, n) => (
          <span key={n} className="rounded-lg bg-tip px-2.5 py-1 font-display text-[1rem] text-sage-ink">
            {pool[i]}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((token, i) => {
          const used = built.includes(i)
          return (
            <button
              key={i}
              type="button"
              disabled={used}
              onClick={() => tap(i)}
              className={`rounded-lg border px-3 py-1.5 font-display text-[1rem] transition-colors
                ${used
                  ? 'border-navy/8 bg-box text-ink-soft/40'
                  : 'border-navy/15 bg-white text-navy hover:border-coral-ink hover:text-coral-ink'}`}
            >
              {token}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {!done && built.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setBuilt([])}>
            {S.clear}
          </Button>
        )}
        {done && <span className="text-[0.9rem] font-semibold text-sage-ink">{S.correct}</span>}
      </div>
    </div>
  )
}
