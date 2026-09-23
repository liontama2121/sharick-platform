import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import AudioButton from '../media/AudioButton'
import FeedbackToast from '../ui/FeedbackToast'
import { shake, popIn } from '../../hooks/useFeedback'

const LETTERS = ['a', 'b', 'c', 'd']

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Círculo "a mano" alrededor de la opción marcada; se dibuja con Anime.js. */
function HandCircle({ ok }) {
  const ref = useRef(null)
  useEffect(() => {
    const path = ref.current
    if (!path || reduced()) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    animate(path, { strokeDashoffset: [len, 0], duration: 420, ease: 'outQuad' })
  }, [])
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]"
    >
      <path
        ref={ref}
        d="M30 8 C 90 -2, 190 4, 195 28 C 199 52, 110 60, 50 55 C 8 51, 2 30, 12 18 C 20 9, 40 5, 60 6"
        fill="none"
        stroke={ok ? 'var(--color-sage-ink)' : 'var(--color-coral-ink)'}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * "Listen and circle the correct answer." Cada ítem trae su botón de
 * audífono y dos opciones (a / b) en píldoras; al tocar una se dibuja un
 * círculo a mano: verde si acierta, coral y efímero si falla.
 * section: { items: [{ audio, audioText, options: [..], correct }] }
 */
export default function ListenAndCircle({ section, completed, score, onComplete }) {
  const items = section.items ?? []
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const listRef = useRef(null)
  const nodes = useRef({})
  const reportedRef = useRef(false)

  useEffect(() => {
    if (listRef.current) popIn(listRef.current.querySelectorAll('[data-bubble]'), 90)
  }, [section.id])

  const pick = (qi, oi) => {
    if (answers[qi]?.ok) return
    const ok = oi === items[qi].correct
    const el = nodes.current[`${qi}-${oi}`]
    const next = { ...answers, [qi]: { picked: oi, ok } }
    setAnswers(next)

    if (ok) {
      // Solo escala: celebrate() deja un fondo blanco inline encima del verde
      if (el && !reduced()) animate(el, { scale: [1, 1.12, 1], duration: 500, ease: 'outQuad' })
      const done = items.every((_, i) => next[i]?.ok)
      if (done && !reportedRef.current) {
        reportedRef.current = true
        setToast({ msg: 'Great listening! All 5 correct.', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Listen again and try the other one.', type: 'error' })
      // El círculo rojo se borra solo para poder volver a intentarlo
      setTimeout(() => {
        setAnswers((prev) => (prev[qi]?.ok ? prev : { ...prev, [qi]: undefined }))
      }, 900)
    }
  }

  const solved = items.filter((_, i) => answers[i]?.ok).length

  return (
    <>
      <ExerciseBlock
        label={section.label}
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
        footer={
          <span className="flex items-center justify-between gap-2 text-[16px]">
            <span>
              {solved} of {items.length} correct
            </span>
            <span className="flex gap-1">
              {items.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-7 rounded-full ${answers[i]?.ok ? 'bg-sage-ink' : 'bg-navy/12'}`}
                />
              ))}
            </span>
          </span>
        }
      >
        <ol ref={listRef} className="flex flex-col gap-3">
          {items.map((item, qi) => (
            <li
              key={qi}
              data-bubble
              className="grid grid-cols-[48px_56px_1fr_1fr] items-center gap-5 rounded-2xl
                border border-navy/10 bg-white px-5 py-3"
            >
              <span className="font-display text-[40px] leading-none text-coral-ink">{qi + 1}</span>
              <AudioButton src={item.audio} label={`Listen to item ${qi + 1}`} size={52} />
              {(item.options ?? []).map((opt, oi) => {
                const state = answers[qi]
                const chosen = state?.picked === oi
                return (
                  <button
                    key={oi}
                    ref={(el) => {
                      nodes.current[`${qi}-${oi}`] = el
                    }}
                    type="button"
                    disabled={!!state?.ok}
                    onClick={() => pick(qi, oi)}
                    className={`relative flex items-center gap-3 rounded-full border-2 px-5 py-2.5
                      text-left font-body text-[21px] font-semibold text-navy transition-colors
                      ${chosen && state.ok ? 'border-sage-ink/40 bg-tip' : 'border-navy/12 bg-paper'}
                      ${!state?.ok ? 'hover:border-coral-ink/50' : ''}
                      ${state?.ok && !chosen ? 'opacity-45' : ''}`}
                  >
                    <span className="font-display text-[22px] text-coral-ink">{LETTERS[oi]})</span>
                    {opt}
                    {chosen && <HandCircle key={`${qi}-${oi}-${state.ok}`} ok={state.ok} />}
                  </button>
                )
              })}
            </li>
          ))}
        </ol>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
