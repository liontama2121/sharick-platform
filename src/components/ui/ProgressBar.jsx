import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

/**
 * Barra de progreso con relleno animado + número contando.
 * @param {number} value  0-100
 */
export default function ProgressBar({ value = 0, label = 'Progreso', compact = false }) {
  const fillRef = useRef(null)
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const el = fillRef.current
    if (!el) return

    const target = Math.max(0, Math.min(100, value))
    animate(el, { width: `${target}%`, duration: 800, ease: 'inOutQuad' })

    const counter = { n: shown }
    animate(counter, {
      n: target,
      duration: 800,
      ease: 'inOutQuad',
      modifier: Math.round,
      onUpdate: () => setShown(Math.round(counter.n)),
    })
    // shown es el punto de partida, no una dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="label-caps text-sage-ink">{label}</span>
          <span className="font-display text-sm text-coral-ink">{shown}%</span>
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-navy/10"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          ref={fillRef}
          style={{ width: 0 }}
          className="h-full rounded-full bg-gradient-to-r from-[#e9b44c] to-[#b23a28]"
        />
      </div>
    </div>
  )
}
