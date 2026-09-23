import { useEffect, useMemo, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import AnalogClock from '../ui/AnalogClock'
import DigitalClock from '../ui/DigitalClock'
import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'
import Button from '../ui/Button'
import { celebrate, shake, popIn } from '../../hooks/useFeedback'

export default function FillBubbles({ section, completed, score, onComplete }) {
  const items = section.items ?? []
  const options = useMemo(
    () => section.options ?? [...new Set(items.map((i) => i.answer))],
    [section.options, items],
  )

  /* `clock: "digital"` = relojes LCD en rejilla (1.2-s2); si no, la lista
     con reloj analógico de siempre. */
  const digital = section.clock === 'digital'
  const cols = section.columns ?? items.length

  const [filled, setFilled] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const gridRef = useRef(null)
  const nodes = useRef({})

  useEffect(() => {
    if (gridRef.current) popIn(gridRef.current.querySelectorAll('[data-bubble]'), 120)
  }, [section.id])

  const answer = (idx, value) => {
    if (filled[idx]) return
    const el = nodes.current[idx]
    if (value === items[idx].answer) {
      const next = { ...filled, [idx]: value }
      setFilled(next)
      celebrate(el)
      if (Object.keys(next).length === items.length) {
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
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
        footer={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {Object.keys(filled).length} of {items.length} done
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilled({})
                setErrors(0)
              }}
            >
              Reset
            </Button>
          </span>
        }
      >
        <div
          ref={gridRef}
          className={digital ? 'grid gap-5' : 'flex flex-col gap-3'}
          style={digital ? { gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` } : undefined}
        >
          {items.map((item, idx) => {
            const solved = filled[idx]
            return (
              <div
                key={idx}
                data-bubble
                ref={(el) => {
                  nodes.current[idx] = el
                }}
                className={`rounded-xl border
                  ${digital ? 'flex flex-col gap-3 p-4' : 'p-3'}
                  ${solved ? 'border-sage-ink/50 bg-tip' : 'border-navy/12 bg-white'}`}
              >
                {digital ? (
                  <>
                    {item.scene && (
                      <div className="h-[190px] w-full">
                        <SmartImage
                          src={item.scene}
                          alt={item.sceneLabel ?? ''}
                          emoji={item.emoji ?? '🌿'}
                          rounded="rounded-lg"
                          showPath={false}
                        />
                      </div>
                    )}
                    <div className="flex justify-center">
                      <DigitalClock time={item.clockTime} />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <AnalogClock time={item.clockTime} size={64} showDigital={false} />
                    <div className="min-w-0 flex-1">
                      <p className="label-caps text-coral-ink">{item.clockTime}</p>
                      {item.sceneLabel && (
                        <p className="mt-0.5 text-[0.78rem] leading-snug text-ink-soft">
                          {item.sceneLabel}
                        </p>
                      )}
                    </div>
                    {item.scene && (
                      <div className="hidden h-12 w-12 shrink-0 sm:block">
                        <SmartImage
                          src={item.scene}
                          alt={item.sceneLabel}
                          emoji={item.emoji ?? '🌿'}
                          rounded="rounded-lg"
                          compact
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Burbuja de diálogo */}
                <div className={`relative rounded-xl bg-box px-3 py-2 ${digital ? 'text-center' : 'mt-3'}`}>
                  <span
                    className={`absolute -top-1.5 h-3 w-3 rotate-45 bg-box ${digital ? 'left-1/2 -ml-1.5' : 'left-6'}`}
                    aria-hidden="true"
                  />
                  {solved ? (
                    <p className={`font-display text-navy ${digital ? 'text-[24px]' : 'text-[1.05rem]'}`}>
                      “{solved}!”
                    </p>
                  ) : (
                    <p className={`font-display text-ink-soft/50 ${digital ? 'text-[24px]' : 'text-[1.05rem]'}`}>
                      “___________”
                    </p>
                  )}
                </div>

                {!solved && (
                  <div className={digital ? 'grid grid-cols-2 gap-2' : 'mt-2 flex flex-wrap gap-1.5'}>
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => answer(idx, opt)}
                        className={`rounded-full border border-navy/15 bg-white font-semibold text-navy
                          transition-colors hover:border-coral-ink hover:text-coral-ink
                          ${digital ? 'px-2 py-2 text-[16px]' : 'px-3 py-1 text-[0.78rem]'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
