import { useRef, useState } from 'react'
import { celebrate, shake } from '../../hooks/useFeedback'

const LETTERS = ['a', 'b', 'c', 'd', 'e']

/** Preguntas de opción múltiple reutilizables (listening y actividades sueltas). */
export default function MultipleChoice({ questions = [], onAllAnswered, idPrefix = 'q' }) {
  const [answers, setAnswers] = useState({})
  const nodes = useRef({})

  const pick = (qi, oi, correct) => {
    if (answers[qi]?.locked) return
    const ok = oi === correct
    const el = nodes.current[`${qi}-${oi}`]
    if (ok) celebrate(el)
    else shake(el)

    const next = { ...answers, [qi]: { picked: oi, ok, locked: ok } }
    setAnswers(next)

    if (questions.every((_, i) => next[i]?.ok)) {
      const attempts = Object.values(next).length
      const score = Math.max(
        40,
        Math.round((questions.length / Math.max(attempts, questions.length)) * 100),
      )
      onAllAnswered?.(score)
    }
  }

  return (
    <ol className="flex flex-col gap-4">
      {questions.map((q, qi) => (
        <li key={qi}>
          <p className="mb-2 text-[0.95rem]">
            <span className="mr-1.5 font-display text-[1.05rem] text-coral-ink">{qi + 1}.</span>
            {q.q}
          </p>
          <div className="flex flex-col gap-1.5">
            {(q.options ?? []).map((opt, oi) => {
              const state = answers[qi]
              const chosen = state?.picked === oi
              const isRight = chosen && state.ok
              const isWrong = chosen && !state.ok
              return (
                <button
                  key={oi}
                  ref={(el) => {
                    nodes.current[`${qi}-${oi}`] = el
                  }}
                  id={`${idPrefix}-${qi}-${oi}`}
                  disabled={state?.locked}
                  onClick={() => pick(qi, oi, q.correct)}
                  className={`flex items-center gap-2.5 rounded-xl border bg-white px-3 py-2
                    text-left text-[0.88rem] transition-colors
                    ${isRight ? 'border-sage-ink/60 bg-tip' : ''}
                    ${isWrong ? 'border-coral-ink' : ''}
                    ${!chosen ? 'border-navy/12 hover:border-coral-ink/55' : ''}`}
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                      border border-navy/15 font-display text-[0.8rem] text-coral-ink"
                  >
                    {LETTERS[oi]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </li>
      ))}
    </ol>
  )
}
