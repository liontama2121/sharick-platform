import { useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Cada esquina es el mismo doblez, espejado. */
const TRANSFORMS = {
  'bottom-right': 'none',
  'bottom-left': 'scaleX(-1)',
  'top-right': 'scaleY(-1)',
  'top-left': 'scale(-1, -1)',
}

const ORIGINS = {
  'bottom-right': 'bottom right',
  'bottom-left': 'bottom left',
  'top-right': 'top right',
  'top-left': 'top left',
}

/* El área clickeable se recorta al triángulo del doblez: así una esquina
   nunca roba clicks al contenido que quede cerca pero fuera del doblez. */
const CLIPS = {
  'bottom-right': 'polygon(100% 25%, 100% 100%, 35% 100%)',
  'bottom-left': 'polygon(0 25%, 0 100%, 65% 100%)',
  'top-right': 'polygon(100% 75%, 100% 0, 35% 0)',
  'top-left': 'polygon(0 75%, 0 0, 65% 0)',
}

const LABELS = {
  'bottom-right': 'Pasar a la página siguiente',
  'top-right': 'Pasar a la página siguiente',
  'bottom-left': 'Volver a la página anterior',
  'top-left': 'Volver a la página anterior',
}

/**
 * Zona de esquina: el ÚNICO modo de pasar página.
 * Dibuja un doblez de papel sobre la hoja y dispara flipNext/flipPrev.
 * La posición exacta llega por `style` desde BookViewer, que mide el libro.
 * 64x64 en mobile (doblez siempre visible), 90x90 en desktop (aparece al hover).
 */
export default function CornerFlip({ position = 'bottom-right', onFlip, disabled = false, style }) {
  const foldRef = useRef(null)

  const scaleTo = (v) => {
    if (!foldRef.current || disabled || reduced()) return
    animate(foldRef.current, { scale: v, duration: 200, ease: 'outQuad' })
  }

  const handleClick = () => {
    if (disabled) return
    if (foldRef.current && !reduced()) {
      animate(foldRef.current, { scale: [1.15, 0.72, 1], duration: 320, ease: 'outQuad' })
    }
    setTimeout(onFlip ?? (() => {}), reduced() ? 0 : 130)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => scaleTo(1.15)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.15)}
      onBlur={() => scaleTo(1)}
      disabled={disabled}
      aria-label={LABELS[position]}
      style={{ ...style, clipPath: CLIPS[position] }}
      className={`z-30 h-16 w-16 md:h-[90px] md:w-[90px]
        ${disabled ? 'pointer-events-none opacity-0' : 'cursor-pointer'}
        opacity-90 transition-opacity duration-200
        md:opacity-55 md:hover:opacity-100 md:focus-visible:opacity-100`}
    >
      <span
        ref={foldRef}
        className="block h-full w-full"
        style={{ transform: TRANSFORMS[position], transformOrigin: ORIGINS[position] }}
      >
        <svg viewBox="0 0 90 90" fill="none" aria-hidden="true" className="h-full w-full">
          <defs>
            <linearGradient id={`fold-${position}`} x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e3d8c2" />
              <stop offset="55%" stopColor="#ece1cd" />
              <stop offset="100%" stopColor="#f7f2e9" />
            </linearGradient>
          </defs>

          {/* sombra bajo el doblez */}
          <path d="M90 26C68 40 48 60 34 90H90V26Z" fill="#1b3a5c" opacity=".12" />
          {/* doblez */}
          <path d="M90 32C70 44 52 62 40 90H90V32Z" fill={`url(#fold-${position})`} />
          <path
            d="M90 32C70 44 52 62 40 90"
            stroke="#1b3a5c"
            strokeOpacity=".22"
            strokeWidth="1.5"
            fill="none"
          />
          {/* flecha de dirección */}
          <path
            d="M64 74l8-8-8-8"
            stroke="#b23a28"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </span>
    </button>
  )
}
