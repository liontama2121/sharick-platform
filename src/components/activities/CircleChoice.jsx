import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

import HandCircle from './HandCircle'
import AudioButton from '../media/AudioButton'
import FeedbackToast from '../ui/FeedbackToast'
import { popIn, shake } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Colores de las opciones, en orden */
const TONES = [
  'var(--color-rojo-ink)',
  'var(--color-azul)',
  'var(--color-verde-ink)',
  'var(--color-morado)',
]

/**
 * Escuchar y encerrar en un círculo (mismo trazo a mano que el listening
 * de 1.1). Dos variantes:
 * - `letters`: rejilla de ítems con DOS letras grandes de colores.
 * - `pills`: una fila por ítem con 3 opciones en píldora de color.
 * Acierto: círculo verde y la opción late; fallo: círculo rojo, shake y se
 * borra para volver a intentar.
 * section: { variant, items: [{ audio, audioText, options: [], correct }] }
 */
export default function CircleChoice({ section, onComplete }) {
  const items = section.items ?? []
  const variant = section.variant ?? 'letters'
  const [answers, setAnswers] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const listRef = useRef(null)
  const nodes = useRef({})
  const reported = useRef(false)

  useEffect(() => {
    if (listRef.current) popIn(listRef.current.querySelectorAll('[data-item]'), 70)
  }, [section.id])

  const pick = (qi, oi) => {
    if (answers[qi]?.ok) return
    const ok = oi === items[qi].correct
    const el = nodes.current[`${qi}-${oi}`]
    const next = { ...answers, [qi]: { picked: oi, ok } }
    setAnswers(next)
    if (ok) {
      if (el && !reduced()) animate(el, { scale: [1, 1.14, 1], duration: 480, ease: 'outQuad' })
      if (items.every((_, i) => next[i]?.ok) && !reported.current) {
        reported.current = true
        setToast({ msg: 'Excellent listening!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 8, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Listen again and try another one.', type: 'error' })
      setTimeout(() => setAnswers((p) => (p[qi]?.ok ? p : { ...p, [qi]: undefined })), 900)
    }
  }

  const option = (qi, oi, text, tone, big) => {
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
        aria-label={`Item ${qi + 1}: ${text}`}
        className={`relative transition-opacity ${state?.ok && !chosen ? 'opacity-35' : ''}
          ${big
            ? 'flex h-[132px] w-[124px] items-center justify-center rounded-2xl font-display text-[92px] leading-none hover:bg-box'
            : 'rounded-full px-6 py-2.5 font-body text-[24px] font-bold text-paper shadow-soft hover:brightness-110'}`}
        style={big ? { color: tone } : { background: tone }}
      >
        {text}
        {chosen && (
          <HandCircle
            key={`${qi}-${oi}-${state.ok}`}
            ok={state.ok}
            inset={big ? '-inset-1' : '-inset-x-3 -inset-y-2'}
            size={big ? 'h-[calc(100%+8px)] w-[calc(100%+8px)]' : undefined}
          />
        )}
      </button>
    )
  }

  const solved = items.filter((_, i) => answers[i]?.ok).length

  return (
    <>
      <div className="flex h-full flex-col gap-4">
        {variant === 'letters' ? (
          <ol ref={listRef} className="grid flex-1 grid-cols-4 content-center gap-x-6 gap-y-8">
            {items.map((item, qi) => (
              <li
                key={qi}
                data-item
                className="flex flex-col items-center gap-2 rounded-[22px] border-[3px] border-azul/12 bg-paper px-4 pb-4 pt-3 shadow-soft"
              >
                <span className="flex w-full items-center justify-between">
                  <span className="font-display text-[34px] leading-none text-rojo-ink">{qi + 1}</span>
                  <AudioButton src={item.audio} text={item.audioText} label={`Listen to item ${qi + 1}`} size={56} />
                </span>
                <span className="flex gap-4">
                  {item.options.map((L, oi) => option(qi, oi, L, TONES[(qi + oi) % TONES.length], true))}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <ol ref={listRef} className="flex flex-1 flex-col justify-center gap-5">
            {items.map((item, qi) => (
              <li
                key={qi}
                data-item
                className="flex items-center gap-6 rounded-[22px] border-[3px] border-azul/12 bg-paper px-6 py-4 shadow-soft"
              >
                <span className="w-9 font-display text-[38px] leading-none text-rojo-ink">{qi + 1}</span>
                <AudioButton src={item.audio} text={item.audioText} label={`Listen to item ${qi + 1}`} size={58} />
                <span className="flex flex-wrap gap-5">
                  {item.options.map((name, oi) => option(qi, oi, name, TONES[oi % TONES.length], false))}
                </span>
                {answers[qi]?.ok && item.spelling && (
                  <span className="ml-auto font-display text-[24px] tracking-[0.12em] text-verde-ink">{item.spelling}</span>
                )}
              </li>
            ))}
          </ol>
        )}

        <p className="font-body text-[24px] font-semibold text-ink-soft">
          <span className="font-bold text-azul">{solved}</span> of {items.length} correct
        </p>
      </div>
      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
