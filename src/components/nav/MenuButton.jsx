import { useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Barra horizontal del menú principal: cuadro de color a la izquierda
 * (número de módulo o icono de recurso) y nombre a la derecha.
 * Los que aún no tienen contenido se ven atenuados y avisan "Próximamente".
 */
export default function MenuButton({
  badge,
  tone = 'coral',
  label,
  hint,
  available = true,
  onClick,
}) {
  const ref = useRef(null)

  const hover = (on) => {
    if (!ref.current || reduced()) return
    animate(ref.current, {
      translateX: on && available ? 6 : 0,
      duration: 260,
      ease: 'outQuad',
    })
  }

  const badgeTone = tone === 'sage' ? 'bg-sage-ink' : 'bg-coral-ink'

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      aria-disabled={!available}
      className={`flex w-full items-center gap-4 overflow-hidden rounded-xl bg-box
        text-left transition-shadow
        ${available ? 'shadow-soft hover:shadow-lift' : 'opacity-55 shadow-none'}`}
      style={{ minHeight: 90 }}
    >
      <span
        className={`flex h-[90px] w-[74px] shrink-0 items-center justify-center
          font-display text-2xl font-bold text-white ${badgeTone}`}
      >
        {badge}
      </span>
      <span className="min-w-0 flex-1 py-3 pr-4">
        <span className="block font-display text-[1.05rem] leading-tight text-navy">{label}</span>
        {hint && <span className="mt-0.5 block text-[0.78rem] text-ink-soft">{hint}</span>}
        {!available && (
          <span className="mt-1 inline-block label-caps text-coral-ink">Próximamente</span>
        )}
      </span>
    </button>
  )
}
