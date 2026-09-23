import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { MessageCircle } from 'lucide-react'
import ExerciseBlock from './ExerciseBlock'
import AudioButton from '../media/AudioButton'
import FeedbackToast from '../ui/FeedbackToast'
import { popIn } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Color del número de cada bloque, en el orden de la paleta. */
const BLOCK_TONES = ['bg-coral-ink', 'bg-sage-ink', 'bg-navy']

/**
 * Tarjetas de expresiones para hablar con un compañero. Cada expresión
 * lleva su botón de audífono; tocar la frase la marca como dicha.
 * Se completa cuando el estudiante dijo al menos una de cada bloque.
 * section: { blocks: [{ groups: [{ label, items: [{ text, audio }] }] }] }
 */
export default function ExpressionCards({ section, completed, score, onComplete }) {
  const blocks = section.blocks ?? []
  const [said, setSaid] = useState({})
  const [toast, setToast] = useState(null)
  const rootRef = useRef(null)
  const nodes = useRef({})
  const reportedRef = useRef(false)

  useEffect(() => {
    if (rootRef.current) popIn(rootRef.current.querySelectorAll('[data-bubble]'), 40)
  }, [section.id])

  const blockDone = (next, bi) =>
    blocks[bi].groups.some((g, gi) => g.items.some((_, ii) => next[`${bi}-${gi}-${ii}`]))

  const toggle = (key, bi) => {
    const next = { ...said, [key]: !said[key] }
    setSaid(next)
    const el = nodes.current[key]
    if (next[key] && el && !reduced()) {
      animate(el, { scale: [1, 1.06, 1], duration: 380, ease: 'outQuad' })
    }
    if (next[key] && blockDone(next, bi) && !blockDone(said, bi)) {
      setToast({ msg: 'Nice! Now try another block.', type: 'success' })
    }
    if (blocks.every((_, i) => blockDone(next, i)) && !reportedRef.current) {
      reportedRef.current = true
      setToast({ msg: 'Great! You used expressions from every block.', type: 'success' })
      onComplete?.(100)
    }
  }

  const doneBlocks = blocks.filter((_, i) => blockDone(said, i)).length

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
          <span className="text-[16px]">
            Tap an expression after you say it · {doneBlocks} of {blocks.length} blocks practised
          </span>
        }
      >
        <div
          ref={rootRef}
          className="grid items-start gap-6"
          style={{ gridTemplateColumns: `repeat(${blocks.length}, minmax(0, 1fr))` }}
        >
          {blocks.map((block, bi) => (
            <section key={bi} className="box-beige flex flex-col gap-3 px-4 pb-4 pt-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full font-display
                  text-[22px] text-white ${BLOCK_TONES[bi % BLOCK_TONES.length]}`}
              >
                {bi + 1}
              </span>

              {block.groups.map((group, gi) => (
                <div key={gi} className="flex flex-col gap-1.5">
                  <p className="flex items-center gap-2 font-body text-[19px] font-bold text-navy">
                    <MessageCircle size={20} strokeWidth={2.4} className="text-coral-ink" />
                    {group.label}
                  </p>
                  <ul className="flex flex-col gap-1">
                    {group.items.map((it, ii) => {
                      const key = `${bi}-${gi}-${ii}`
                      const on = !!said[key]
                      return (
                        <li
                          key={key}
                          data-bubble
                          ref={(el) => {
                            nodes.current[key] = el
                          }}
                          className={`flex items-center gap-2 rounded-xl border py-1 pl-3 pr-1
                            transition-colors
                            ${on ? 'border-sage-ink/50 bg-tip' : 'border-navy/10 bg-white'}`}
                        >
                          <button
                            type="button"
                            onClick={() => toggle(key, bi)}
                            aria-pressed={on}
                            className="flex min-w-0 flex-1 items-center gap-2 py-0.5 text-left font-body
                              text-[19px] font-semibold text-navy"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                                border text-[12px] font-bold
                                ${on ? 'border-sage-ink bg-sage-ink text-white' : 'border-navy/25 text-transparent'}`}
                            >
                              ✓
                            </span>
                            {it.text}
                          </button>
                          <AudioButton src={it.audio} label={`Listen: ${it.text}`} size={38} />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
