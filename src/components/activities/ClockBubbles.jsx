import { useEffect, useMemo, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import DigitalClock from '../ui/DigitalClock'
import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'
import Button from '../ui/Button'
import DayArc from '../content/DayArc'
import { celebrate, shake, popIn } from '../../hooks/useFeedback'

/**
 * "Look at the clock. Say the greeting." — 4 viñetas: reloj LCD arriba,
 * personaje saludando y bocadillo numerado vacío que se completa con los
 * chips. Abajo a la izquierda, el mini arco del día como ayuda.
 * section: { options, items: [{ clockTime, scene, sceneLabel, emoji, answer }],
 *            helper: { zones } }
 */
export default function ClockBubbles({ section, completed, score, onComplete }) {
  const items = section.items ?? []
  const options = useMemo(
    () => section.options ?? [...new Set(items.map((i) => i.answer))],
    [section.options, items],
  )

  const [filled, setFilled] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const gridRef = useRef(null)
  const bubbles = useRef({})
  const reportedRef = useRef(false)

  useEffect(() => {
    if (gridRef.current) popIn(gridRef.current.querySelectorAll('[data-bubble]'), 120)
  }, [section.id])

  const answer = (idx, value) => {
    if (filled[idx]) return
    const el = bubbles.current[idx]
    if (value === items[idx].answer) {
      const next = { ...filled, [idx]: value }
      setFilled(next)
      celebrate(el)
      if (Object.keys(next).length === items.length && !reportedRef.current) {
        reportedRef.current = true
        setToast({ msg: 'All the greetings are correct!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      } else {
        setToast({ msg: 'Correct!', type: 'success' })
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Look at the clock again.', type: 'error' })
    }
  }

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
        <div
          ref={gridRef}
          className="grid gap-5"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, idx) => {
            const solved = filled[idx]
            return (
              <div key={idx} data-bubble className="flex flex-col items-center gap-2.5">
                <DigitalClock time={item.clockTime} />

                <div className="h-[165px] w-full">
                  <SmartImage
                    src={item.scene}
                    alt={item.sceneLabel ?? ''}
                    emoji={item.emoji ?? '👋'}
                    rounded="rounded-2xl"
                    showPath={false}
                  />
                </div>

                {/* Bocadillo numerado, con la cola hacia el personaje */}
                <div
                  ref={(el) => {
                    bubbles.current[idx] = el
                  }}
                  className={`relative mt-1 flex h-[60px] w-full items-center justify-center rounded-[22px]
                    border-[3px] bg-white px-4
                    ${solved ? 'border-sage-ink' : 'border-navy/20'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute -top-[11px] left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 border-l-[3px]
                      border-t-[3px] bg-white ${solved ? 'border-sage-ink' : 'border-navy/20'}`}
                  />
                  <span
                    className="absolute -left-3 -top-3 flex h-9 w-9 items-center justify-center rounded-full
                      border-[3px] border-white bg-coral-ink font-display text-[18px] text-white shadow-soft"
                  >
                    {idx + 1}
                  </span>
                  {solved ? (
                    <p className="font-display text-[24px] text-navy">{solved}!</p>
                  ) : (
                    <p className="font-display text-[24px] tracking-[0.2em] text-navy/25">…………</p>
                  )}
                </div>

                <div className="grid w-full grid-cols-2 gap-2">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!!solved}
                      onClick={() => answer(idx, opt)}
                      className={`rounded-full border px-2 py-1.5 font-body text-[16px] font-semibold
                        transition-colors
                        ${solved === opt
                          ? 'border-sage-ink bg-tip text-sage-ink'
                          : solved
                            ? 'border-navy/10 bg-white text-navy/35'
                            : 'border-navy/15 bg-white text-navy hover:border-coral-ink hover:text-coral-ink'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Ayuda visual + progreso */}
        <div className="mt-4 flex items-end gap-6">
          {section.helper && (
            <div className="w-[420px] shrink-0">
              <DayArc block={section.helper} compact />
            </div>
          )}
          <div className="flex flex-1 items-center justify-between gap-4 pb-1 font-body text-[17px] text-ink-soft">
            <span>
              {Object.keys(filled).length} of {items.length} done
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilled({})
                setErrors(0)
                reportedRef.current = false
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
