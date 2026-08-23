import { useRef, useState } from 'react'
import { celebrate, shake } from '../../hooks/useFeedback'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

/**
 * Bloque de preguntas de opción múltiple reutilizable
 * (lo usa ListeningActivity y puede usarse como actividad suelta).
 */
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

    const answered = questions.every((q, i) => next[i]?.ok)
    if (answered) {
      const attempts = Object.values(next).length
      const score = Math.max(40, Math.round((questions.length / Math.max(attempts, questions.length)) * 100))
      onAllAnswered?.(score)
    }
  }

  return (
    <ol className="flex flex-col gap-6">
      {questions.map((q, qi) => (
        <li key={qi}>
          <p className="mb-3 font-title font-semibold">
            <span className="mr-2 text-col-red">{qi + 1}.</span>
            {q.q}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(q.options ?? []).map((opt, oi) => {
              const state = answers[qi]
              const chosen = state?.picked === oi
              const isRight = chosen && state.ok
              const isWrong = chosen && !state.ok
              return (
                <button
                  key={oi}
                  ref={(el) => { nodes.current[`${qi}-${oi}`] = el }}
                  id={`${idPrefix}-${qi}-${oi}`}
                  disabled={state?.locked}
                  onClick={() => pick(qi, oi, q.correct)}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3
                    text-left text-[0.95rem] shadow-soft transition-colors
                    ${isRight ? 'border-[#2f9e5f] bg-[#e8f8ee]' : ''}
                    ${isWrong ? 'border-col-red' : ''}
                    ${!chosen ? 'border-col-blue/12 hover:border-col-blue/45' : ''}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                    bg-col-blue/8 font-title text-xs font-bold text-col-blue">
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
