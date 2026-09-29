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
  tone = 'rojo',
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

  const badgeTone = tone === 'verde' ? 'bg-verde-ink' : 'bg-rojo-ink'

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => hover(true)}
      onMouseLeave={() => hover(false)}
      onFocus={() => hover(true)}
      onBlur={() => hover(false)}
      aria-disabled={!available}
      className={`flex w-full items-center gap-4 overflow-hidden rounded-2xl border-[3px] bg-paper
        text-left transition-shadow
        ${available ? 'border-azul shadow-soft hover:shadow-lift' : 'border-azul/20 shadow-none'}`}
      style={{ minHeight: 90 }}
    >
      <span
        className={`flex h-[90px] w-[74px] shrink-0 items-center justify-center
          rotulo text-[1.8rem] text-white grain ${badgeTone} ${available ? '' : 'opacity-50'}`}
        style={{ '--rotulo-sombra': 'var(--color-azul)' }}
      >
        {badge}
      </span>
      <span className="min-w-0 flex-1 py-3 pr-4">
        <span className={`block font-display text-[1.1rem] leading-tight ${available ? 'text-azul' : 'text-ink-soft'}`}>{label}</span>
        {hint && <span className="mt-0.5 block text-[0.78rem] text-ink-soft">{hint}</span>}
        {!available && (
          <span className="mt-1 inline-block text-[0.8rem] font-semibold text-rojo-ink">Próximamente</span>
        )}
      </span>
    </button>
  )
}
