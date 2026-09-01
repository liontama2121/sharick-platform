import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { X } from 'lucide-react'
import RoundButton from '../nav/RoundButton'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Contenedor a pantalla completa de un juego del hub.
 * Fuera del flipbook: aquí no hay conflicto de eventos con las esquinas.
 */
export default function GameShell({ icon, title, subtitle, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && !reduced()) {
      animate(ref.current, { opacity: [0, 1], scale: [0.98, 1], duration: 320, ease: 'outQuad' })
    }
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div ref={ref} className="fixed inset-0 z-50 overflow-y-auto bg-paper scrollbar-slim">
      <div className="mx-auto w-full max-w-[900px] px-5 py-6 sm:px-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl" aria-hidden="true">
              {icon}
            </span>
            <div>
              <p className="label-caps text-sage-ink">Game</p>
              <h1 className="mt-0.5">{title}</h1>
              {subtitle && <p className="mt-1 text-[0.9rem] text-ink-soft">{subtitle}</p>}
            </div>
          </div>

          <RoundButton label="Cerrar el juego" onClick={onClose}>
            <X size={20} strokeWidth={2.5} />
          </RoundButton>
        </header>

        {children}
      </div>
    </div>
  )
}
