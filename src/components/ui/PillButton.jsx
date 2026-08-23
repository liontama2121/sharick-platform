import { useRef } from 'react'
import { animate } from 'animejs'

const ICONS = {
  listen: '🔊',
  record: '🎙️',
  practice: '▶️',
  translate: '🌐',
  none: null,
}

/**
 * Botón pill blanco con borde suave e icono — Listen / Record / Practice.
 */
export default function PillButton({
  icon = 'none',
  children,
  active = false,
  className = '',
  disabled = false,
  ...props
}) {
  const ref = useRef(null)

  const scaleTo = (v) => {
    if (!ref.current || disabled) return
    animate(ref.current, { scale: v, duration: 200, ease: 'outQuad' })
  }

  return (
    <button
      ref={ref}
      disabled={disabled}
      onMouseEnter={() => scaleTo(1.04)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.04)}
      onBlur={() => scaleTo(1)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2
        font-body text-sm font-semibold shadow-soft transition-colors
        disabled:cursor-not-allowed disabled:opacity-45
        ${active
          ? 'border-coral-ink bg-coral-ink text-white'
          : 'border-navy/15 bg-white text-navy hover:border-coral-ink/60 hover:text-coral-ink'}
        ${className}`}
      {...props}
    >
      {ICONS[icon] && <span aria-hidden="true">{ICONS[icon]}</span>}
      {children}
    </button>
  )
}
