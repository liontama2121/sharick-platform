import { useMemo, useRef, useState } from 'react'
import { S } from '../../../study/strings'
import { shuffle } from '../../../study'
import { celebrate, shake } from '../../../hooks/useFeedback'

/**
 * Emparejar frases: { pairs: [["Hello", "Hola"], …] }.
 * Toca la izquierda y luego la derecha. La columna derecha va barajada.
 */
export default function MatchEx({ exercise, onDone }) {
  const pairs = exercise.pairs ?? []
  const rights = useMemo(() => shuffle(pairs.map((p, i) => ({ text: p[1], id: i }))), [pairs])

  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState({})
  const [wrong, setWrong] = useState(null)
  const nodes = useRef({})

  const done = Object.keys(matched).length === pairs.length && pairs.length > 0

  const pickRight = (id) => {
    if (selected == null || matched[id]) return
    const el = nodes.current[`r-${id}`]
    if (selected === id) {
      const next = { ...matched, [id]: true }
      setMatched(next)
      setSelected(null)
      celebrate(el)
      if (Object.keys(next).length === pairs.length) onDone?.()
    } else {
      setWrong(id)
      shake(el)
      setTimeout(() => setWrong(null), 500)
    }
  }

  return (
    <div>
      <p className="mb-3 text-[0.85rem] text-ink-soft">{S.matchHint}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex flex-col gap-2">
          {pairs.map((p, i) => {
            const isDone = matched[i]
            return (
              <button
                key={i}
                type="button"
                disabled={isDone}
                onClick={() => setSelected(selected === i ? null : i)}
                className={`rounded-xl border px-3 py-2 text-left text-[0.95rem] transition-colors
                  ${isDone ? 'border-sage-ink/50 bg-tip text-sage-ink' : ''}
                  ${selected === i ? 'border-gold bg-gold/15 ring-2 ring-gold' : ''}
                  ${!isDone && selected !== i ? 'border-navy/12 bg-white hover:border-coral-ink/55' : ''}`}
              >
                {p[0]}
              </button>
            )
          })}
        </div>
        <div className="flex flex-col gap-2">
          {rights.map((r) => {
            const isDone = matched[r.id]
            return (
              <button
                key={r.id}
                type="button"
                ref={(el) => {
                  nodes.current[`r-${r.id}`] = el
                }}
                disabled={isDone}
                onClick={() => pickRight(r.id)}
                className={`rounded-xl border px-3 py-2 text-left text-[0.95rem] transition-colors
                  ${isDone ? 'border-sage-ink/50 bg-tip text-sage-ink' : ''}
                  ${wrong === r.id ? 'border-coral-ink' : ''}
                  ${!isDone && wrong !== r.id ? 'border-navy/12 bg-white hover:border-coral-ink/55' : ''}`}
              >
                {r.text}
              </button>
            )
          })}
        </div>
      </div>
      {done && <p className="mt-3 text-[0.9rem] font-semibold text-sage-ink">{S.allMatched}</p>}
    </div>
  )
}
