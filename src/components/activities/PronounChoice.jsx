import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'
import { popIn, shake } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * "Look at the pictures. Complete with he, she, it or they." Una tarjeta
 * por imagen con un hueco y chips con las opciones. Acierto: el hueco se
 * llena en verde con pop; fallo: el chip tiembla.
 * section: { options: ["he","she","it","they"], items: [{ image, alt, emoji, label, answer }] }
 */
export default function PronounChoice({ section, onComplete }) {
  const items = section.items ?? []
  const options = section.options ?? ['he', 'she', 'it', 'they']
  const [done, setDone] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const gridRef = useRef(null)
  const slots = useRef({})
  const reported = useRef(false)

  useEffect(() => {
    if (gridRef.current) popIn(gridRef.current.querySelectorAll('[data-card]'), 80)
  }, [section.id])

  const choose = (i, word, chip) => {
    if (done[i]) return
    if (word === items[i].answer) {
      const next = { ...done, [i]: true }
      setDone(next)
      const slot = slots.current[i]
      if (slot && !reduced()) animate(slot, { scale: [0.7, 1.15, 1], duration: 480, ease: 'outBack(2)' })
      if (items.every((_, k) => next[k]) && !reported.current) {
        reported.current = true
        setToast({ msg: 'Perfect! You know your pronouns.', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(chip)
      setToast({ msg: `Not "${word}". Look at the picture again.`, type: 'error' })
    }
  }

  return (
    <>
      <ol ref={gridRef} className="grid h-full grid-cols-3 gap-6">
        {items.map((item, i) => (
          <li
            key={i}
            data-card
            className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border-[3px] border-azul/12 bg-paper shadow-soft"
          >
            <div className="relative min-h-0 flex-1">
              <span className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-rojo-ink font-display text-[20px] text-paper">
                {i + 1}
              </span>
              <SmartImage src={item.image} alt={item.alt ?? ''} emoji={item.emoji ?? '🖼️'} className="h-full" rounded="rounded-none" />
            </div>
            <div className="flex flex-col gap-2 border-t-[3px] border-azul/10 px-4 py-3">
              {item.label && <span className="font-body text-[21px] font-bold text-azul">{item.label}</span>}
              <div className="flex items-center gap-3">
              <span
                ref={(el) => {
                  slots.current[i] = el
                }}
                className={`flex h-11 min-w-[86px] items-center justify-center rounded-full px-3 font-display text-[24px]
                  ${done[i] ? 'bg-verde-ink text-paper' : 'border-[3px] border-dashed border-azul/30 text-azul/30'}`}
              >
                {done[i] ? item.answer : '?'}
              </span>
              {!done[i] && (
                <span className="ml-auto flex gap-1.5">
                  {options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={(e) => choose(i, o, e.currentTarget)}
                      className="h-14 min-w-14 rounded-full bg-box px-4 font-body text-[22px] font-bold text-azul transition-colors hover:bg-amarillo"
                    >
                      {o}
                    </button>
                  ))}
                </span>
              )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
