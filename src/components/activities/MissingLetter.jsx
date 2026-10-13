import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

import FeedbackToast from '../ui/FeedbackToast'
import { popIn, shake } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/* Una píldora de color por secuencia (como la referencia) */
const TONES = [
  'var(--color-rojo-ink)',
  'color-mix(in srgb, var(--color-amarillo) 55%, var(--color-rojo-ink))',
  'var(--color-morado)',
  'var(--color-verde-ink)',
]

/**
 * "Look at the wall. Write the missing letter." Cada secuencia es una
 * píldora de color con ladrillos de letras y un hueco (input de 1 letra
 * con forma de ladrillo). Acierto: pop verde; fallo: shake y se borra.
 * Arriba, el muro del alfabeto en pequeño como referencia.
 * section: { items: [{ sequence: ["F","G","_","I","J"], answer: "H" }] }
 */
export default function MissingLetter({ section, onComplete }) {
  const items = section.items ?? []
  const [values, setValues] = useState({})
  const [ok, setOk] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const listRef = useRef(null)
  const inputs = useRef({})
  const reported = useRef(false)

  useEffect(() => {
    if (listRef.current) popIn(listRef.current.querySelectorAll('[data-pill]'), 110)
  }, [section.id])

  const check = (i, raw) => {
    const v = raw.slice(-1).toUpperCase()
    setValues((p) => ({ ...p, [i]: v }))
    if (!v) return
    const el = inputs.current[i]
    if (v === items[i].answer.toUpperCase()) {
      const next = { ...ok, [i]: true }
      setOk(next)
      if (el && !reduced()) animate(el, { scale: [1, 1.25, 1], duration: 480, ease: 'outBack(2)' })
      const nextEmpty = items.findIndex((_, k) => !next[k])
      if (nextEmpty >= 0) inputs.current[nextEmpty]?.focus()
      if (items.every((_, k) => next[k]) && !reported.current) {
        reported.current = true
        setToast({ msg: 'Great! You know the alphabet.', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: `Not ${v}. Look at the wall again.`, type: 'error' })
      setTimeout(() => setValues((p) => (p[i] === v ? { ...p, [i]: '' } : p)), 600)
    }
  }

  return (
    <>
      <div className="flex h-full flex-col gap-7">
        {/* El muro en pequeño: la pista */}
        <div
          className="flex justify-between rounded-[16px] border-[4px] border-madera bg-azul px-5 py-3 shadow-soft"
          aria-label="The alphabet wall"
        >
          {ALPHABET.map((L, i) => (
            <span
              key={L}
              className="font-display text-[30px] leading-none"
              style={{
                color: ['var(--color-amarillo)', 'var(--color-paper)'][i % 2],
              }}
            >
              {L}
            </span>
          ))}
        </div>

        <ol ref={listRef} className="grid flex-1 grid-cols-2 content-center gap-x-10 gap-y-12 pb-6">
          {items.map((item, i) => (
            <li
              key={i}
              data-pill
              className="flex items-center gap-5 rounded-[36px] py-5 pl-5 pr-7 shadow-lift"
              style={{ background: TONES[i % TONES.length] }}
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-paper font-display text-[32px] text-azul">
                {i + 1}
              </span>
              <span className="flex flex-1 justify-between gap-2.5">
                {item.sequence.map((L, k) =>
                  L === '_' ? (
                    <input
                      key={k}
                      ref={(el) => {
                        inputs.current[i] = el
                      }}
                      value={values[i] ?? ''}
                      onChange={(e) => check(i, e.target.value)}
                      disabled={!!ok[i]}
                      maxLength={2}
                      aria-label={`Sequence ${i + 1}: missing letter`}
                      autoComplete="off"
                      spellCheck={false}
                      className={`h-[100px] w-[88px] rounded-[14px] text-center font-display text-[54px] uppercase
                        outline-none transition-colors focus:ring-4 focus:ring-amarillo
                        ${ok[i]
                          ? 'border-[3px] border-verde-ink bg-tip text-verde-ink'
                          : 'border-[3px] border-dashed border-paper bg-paper/20 text-paper placeholder:text-paper/50'}`}
                      placeholder="?"
                    />
                  ) : (
                    <span
                      key={k}
                      className="flex h-[100px] w-[88px] items-center justify-center rounded-[14px] bg-paper font-display text-[54px] shadow-soft"
                      style={{ color: TONES[i % TONES.length] }}
                    >
                      {L}
                    </span>
                  ),
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>
      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
