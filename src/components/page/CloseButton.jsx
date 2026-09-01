import { useRef } from 'react'
import { animate } from 'animejs'
import { X } from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Botón circular grande de cerrar, esquina superior derecha de la página. */
export default function CloseButton({ onClick, label = 'Cerrar la lección' }) {
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
      className="absolute right-6 top-6 z-30 flex h-16 w-16 items-center justify-center
        rounded-full border-[3px] border-white bg-coral-ink text-white shadow-lift"
    >
      <X size={28} strokeWidth={3} />
    </button>
  )
}
