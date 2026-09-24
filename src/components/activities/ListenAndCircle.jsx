import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import AudioButton from '../media/AudioButton'
import AudioPlayer from '../media/AudioPlayer'
import SmartImage from '../ui/ImagePlaceholder'
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
      >
        <div className="grid grid-cols-[1fr_440px] gap-10">
          {/* Lista numerada: audio del ítem + opciones a / b en líneas separadas */}
          <ol ref={listRef} className="flex flex-col gap-2.5">
            {items.map((item, qi) => (
              <li
                key={qi}
                data-bubble
                className="grid grid-cols-[40px_52px_1fr] items-center gap-4 rounded-2xl border
                  border-navy/10 bg-white px-5 py-2"
              >
                <span className="font-display text-[36px] leading-none text-coral-ink">{qi + 1}</span>
                <AudioButton src={item.audio} label={`Listen to item ${qi + 1}`} size={46} />
                <div className="flex flex-col items-start gap-1">
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
                        className={`relative flex items-center gap-3 rounded-full px-4 py-1 text-left
                          font-body text-[21px] font-semibold text-navy transition-colors
                          ${!state?.ok ? 'hover:bg-box' : ''}
                          ${state?.ok && !chosen ? 'opacity-40' : ''}`}
                      >
                        <span className="font-display text-[22px] text-coral-ink">{LETTERS[oi]}</span>
                        {opt}
                        {chosen && <HandCircle key={`${qi}-${oi}-${state.ok}`} ok={state.ok} />}
                      </button>
                    )
                  })}
                </div>
              </li>
            ))}
          </ol>

          {/* Reproductor general + progreso */}
          <div className="flex flex-col gap-5">
            {section.audio !== undefined && (
              <AudioPlayer src={section.audio} label={section.audioLabel ?? 'Listening'} />
            )}
            <div className="rounded-2xl bg-box px-5 py-4 font-body text-[18px] text-ink-soft">
              <p className="mb-2">
                {solved} of {items.length} correct
              </p>
              <span className="flex gap-1.5">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 flex-1 rounded-full ${answers[i]?.ok ? 'bg-sage-ink' : 'bg-navy/12'}`}
                  />
                ))}
              </span>
            </div>
            {section.illustration && (
              <div className="min-h-0 flex-1">
                <SmartImage
                  src={section.illustration.src}
                  alt={section.illustration.alt ?? ''}
                  emoji={section.illustration.emoji ?? '🎧'}
                  showPath={false}
                />
              </div>
            )}
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
