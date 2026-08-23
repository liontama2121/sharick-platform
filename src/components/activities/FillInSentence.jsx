import { useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import FeedbackToast from '../ui/FeedbackToast'
import Button from '../ui/Button'
import { celebrate, shake } from '../../hooks/useFeedback'

const normalize = (s) =>
  s.trim().toLowerCase().replace(/[.!?¡¿,]/g, '').replace(/\s+/g, ' ')

/**
 * Frases con hueco: "I ___ up at 6:30 a.m."
 * El hueco es un input con línea inferior, sin caja.
 * section.items: [{ sentence, answer, accept?[], hint? }]
 */
export default function FillInSentence({ section, completed, score, onComplete }) {
  const items = section.items ?? []
  const [values, setValues] = useState({})
  const [solved, setSolved] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const rows = useRef({})

  const check = (i) => {
    if (solved[i]) return
    const item = items[i]
    const accepted = [item.answer, ...(item.accept ?? [])].map(normalize)
    const ok = accepted.includes(normalize(values[i] ?? ''))
    const el = rows.current[i]

    if (ok) {
      const next = { ...solved, [i]: true }
      setSolved(next)
      celebrate(el)
      if (Object.keys(next).length === items.length) {
        setToast({ msg: '¡Completaste todas las frases!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Revisa la respuesta e inténtalo otra vez.', type: 'error' })
    }
  }

  return (
    <>
      <ExerciseBlock
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed || Object.keys(solved).length === items.length}
        score={score}
        footer={`${Object.keys(solved).length} de ${items.length} completadas`}
      >
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => {
            const [before, after = ''] = item.sentence.split('___')
            const done = solved[i]
            return (
              <li
                key={i}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 rounded-lg px-1 py-0.5 text-[0.95rem]"
              >
                <span className="font-display text-[1.05rem] text-coral-ink">{i + 1}.</span>
                <span>{before}</span>
                {done ? (
                  <span className="border-b-2 border-sage-ink px-1 font-semibold text-sage-ink">
                    {item.answer}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={values[i] ?? ''}
                    onChange={(e) => setValues({ ...values, [i]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && check(i)}
                    onBlur={() => (values[i] ?? '').trim() && check(i)}
                    aria-label={`Respuesta ${i + 1}: ${item.sentence.replace('___', '…')}`}
                    placeholder={item.hint ?? ''}
                    className="rule-fill w-28 px-1 text-center font-semibold text-navy
                      placeholder:font-normal placeholder:text-ink-soft/60"
                  />
                )}
                <span>{after}</span>
              </li>
            )
          })}
        </ol>

        {Object.keys(solved).length < items.length && (
          <div className="mt-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => items.forEach((_, i) => (values[i] ?? '').trim() && check(i))}
            >
              Revisar respuestas
            </Button>
          </div>
        )}
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
