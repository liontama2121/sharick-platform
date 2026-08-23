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

    // número contando de 0..target
    const counter = { n: shown }
    animate(counter, {
      n: target,
      duration: 800,
      ease: 'inOutQuad',
      modifier: Math.round,
      onUpdate: () => setShown(Math.round(counter.n)),
    })
    // shown es intencionalmente el punto de partida, no una dependencia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div className="w-full">
      {!compact && (
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-title text-sm font-semibold text-col-blue">{label}</span>
          <span className="font-title text-sm font-bold text-col-red">{shown}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-col-blue/10"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          ref={fillRef}
          style={{ width: 0 }}
          className="h-full rounded-full bg-gradient-to-r from-[#FFD100] to-[#CE1126]"
        />
      </div>
    </div>
  )
}
