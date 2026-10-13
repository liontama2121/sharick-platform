import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Círculo "a mano" alrededor de la opción marcada; se dibuja con Anime.js.
 * Verde si acierta, rojo si falla. Lo comparten ListenAndCircle y
 * CircleChoice. El padre debe ser `relative`.
 */
export default function HandCircle({ ok, inset = '-inset-x-3 -inset-y-2', size = 'h-[calc(100%+16px)] w-[calc(100%+24px)]' }) {
  const ref = useRef(null)
  useEffect(() => {
    const path = ref.current
    if (!path || reduced()) return
    const len = path.getTotalLength()
    path.style.strokeDasharray = `${len}`
    animate(path, { strokeDashoffset: [len, 0], duration: 420, ease: 'outQuad' })
  }, [])
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 60"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute ${inset} ${size}`}
    >
      <path
        ref={ref}
        d="M30 8 C 90 -2, 190 4, 195 28 C 199 52, 110 60, 50 55 C 8 51, 2 30, 12 18 C 20 9, 40 5, 60 6"
        fill="none"
        stroke={ok ? 'var(--color-verde-ink)' : 'var(--color-rojo-ink)'}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
