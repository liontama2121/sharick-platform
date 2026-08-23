import { useEffect, useMemo, useRef, useState } from 'react'
import ActivityShell from './ActivityShell'
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
      setToast({ msg: 'Mira bien la hora del reloj 🕐', type: 'error' })
    }
  }

  return (
    <>
      <ActivityShell
        icon="💬"
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ink/60">
              {Object.keys(filled).length} de {items.length} completados
            </span>
            <Button variant="ghost" size="sm" onClick={() => { setFilled({}); setErrors(0) }}>
              Reiniciar
            </Button>
          </div>
        }
      >
        <div ref={gridRef} className="grid gap-5 sm:grid-cols-2">
          {items.map((item, idx) => {
            const solved = filled[idx]
            return (
              <div
                key={idx}
                data-bubble
                ref={(el) => { nodes.current[idx] = el }}
                className={`anim-hidden rounded-2xl border-2 bg-white p-4 shadow-soft
                  ${solved ? 'border-[#2f9e5f]' : 'border-col-blue/10'}`}
              >
                <div className="flex items-center gap-4">
                  <AnalogClock time={item.clockTime} size={96} />
                  <div className="h-20 flex-1 overflow-hidden rounded-xl">
                    <SmartImage
                      src={item.scene}
                      alt={item.sceneLabel}
                      emoji={item.emoji ?? '🇨🇴'}
                      rounded="rounded-xl"
                    />
                  </div>
                </div>

                {/* Burbuja de diálogo */}
                <div className="relative mt-5 rounded-2xl bg-col-yellow/22 px-4 py-3">
                  <span
                    className="absolute -top-2 left-7 h-4 w-4 rotate-45 bg-col-yellow/22"
                    aria-hidden="true"
                  />
                  {solved ? (
                    <p className="font-title text-lg font-bold text-col-blue">{solved}!</p>
                  ) : (
                    <p className="font-title text-lg font-semibold text-ink/35">_______________</p>
                  )}
                  {item.sceneLabel && (
                    <p className="mt-1 text-xs text-ink/60">{item.sceneLabel}</p>
                  )}
                </div>

                {!solved && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => answer(idx, opt)}
                        className="rounded-full border-2 border-col-blue/15 bg-white px-3.5 py-1.5
                          font-title text-sm font-semibold text-col-blue transition-colors
                          hover:border-col-red hover:text-col-red"
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
      </ActivityShell>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
