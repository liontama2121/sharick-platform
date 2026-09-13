import { useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const SIZES = {
  md: 'h-11 w-11 shadow-soft',
  /* grande, con borde blanco: para superponerlo al marco de la vista */
  lg: 'h-14 w-14 border-[3px] border-white shadow-lift',
}

/** Botón circular coral: cerrar [X] o volver al inicio [🏠]. */
export default function RoundButton({ children, label, onClick, size = 'md', className = '' }) {
  const ref = useRef(null)

  const scaleTo = (v) => {
    if (!ref.current || reduced()) return
    animate(ref.current, { scale: v, duration: 200, ease: 'outQuad' })
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={label}
      title={label}
      onMouseEnter={() => scaleTo(1.1)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.1)}
      onBlur={() => scaleTo(1)}
      className={`flex items-center justify-center rounded-full bg-coral-ink text-white
        ${SIZES[size] ?? SIZES.md} ${className}`}
    >
      {children}
    </button>
  )
}
