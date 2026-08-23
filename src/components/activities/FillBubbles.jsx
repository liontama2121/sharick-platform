import { useEffect, useMemo, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import AnalogClock from '../ui/AnalogClock'
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
        setToast({ msg: '¡Todos los saludos correctos!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      } else {
        setToast({ msg: '¡Correcto!', type: 'success' })
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Mira bien la hora del reloj.', type: 'error' })
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
              {Object.keys(filled).length} de {items.length} completados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilled({})
                setErrors(0)
              }}
            >
              Reiniciar
            </Button>
          </span>
        }
      >
        <div ref={gridRef} className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const solved = filled[idx]
            return (
              <div
                key={idx}
                data-bubble
                ref={(el) => {
                  nodes.current[idx] = el
                }}
                className={`rounded-xl border p-3
                  ${solved ? 'border-sage-ink/50 bg-tip' : 'border-navy/12 bg-white'}`}
              >
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

                {/* Burbuja de diálogo */}
                <div className="relative mt-3 rounded-xl bg-box px-3 py-2">
                  <span
                    className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 bg-box"
                    aria-hidden="true"
                  />
                  {solved ? (
                    <p className="font-display text-[1.05rem] text-navy">“{solved}!”</p>
                  ) : (
                    <p className="font-display text-[1.05rem] text-ink-soft/50">“___________”</p>
                  )}
                </div>

                {!solved && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => answer(idx, opt)}
                        className="rounded-full border border-navy/15 bg-white px-3 py-1
                          text-[0.78rem] font-semibold text-navy transition-colors
                          hover:border-coral-ink hover:text-coral-ink"
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
