import { useRef } from 'react'
import { animate } from 'animejs'
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Home,
  LayoutGrid,
  Maximize,
  Minimize,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function ToolButton({ label, onClick, disabled, big = false, children }) {
  const ref = useRef(null)
  const scaleTo = (v) => {
    if (!ref.current || reduced() || disabled) return
    animate(ref.current, { scale: v, duration: 180, ease: 'outQuad' })
  }

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseEnter={() => scaleTo(1.1)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.1)}
      onBlur={() => scaleTo(1)}
      className={`flex items-center justify-center rounded-full text-white shadow-soft
        ${big ? 'h-[68px] w-[68px]' : 'h-[60px] w-[60px]'}
        ${disabled ? 'cursor-not-allowed bg-ink-soft/35' : 'bg-coral-ink'}`}
    >
      {children}
    </button>
  )
}

/** Barra inferior: toda la navegación de la lección vive aquí. */
export default function BottomToolbar({
  onHome,
  onReset,
  onPrevScreen,
  onNextScreen,
  onIndex,
  onGames,
  onFullscreen,
  isFullscreen,
  onPrevLesson,
  onNextLesson,
  canPrevScreen,
  canNextScreen,
  canPrevLesson,
  canNextLesson,
  hidden = false,
}) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex h-[88px] items-center justify-between
        border-t border-box bg-paper px-6 transition-opacity duration-300
        ${hidden ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <ToolButton label="Menú del libro" onClick={onHome}>
        <Home size={24} strokeWidth={2.2} />
      </ToolButton>

      <div className="flex items-center gap-3">
        <ToolButton label="Reiniciar el ejercicio" onClick={onReset}>
          <RotateCcw size={22} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton label="Página anterior" onClick={onPrevScreen} disabled={!canPrevScreen}>
          <ChevronLeft size={26} strokeWidth={2.4} />
        </ToolButton>
        <ToolButton label="Página siguiente" onClick={onNextScreen} disabled={!canNextScreen}>
          <ChevronRight size={26} strokeWidth={2.4} />
        </ToolButton>
        <ToolButton label="Índice de lecciones" onClick={onIndex}>
          <LayoutGrid size={22} strokeWidth={2.2} />
        </ToolButton>
        {onGames && (
          <ToolButton label="Juegos del módulo" onClick={onGames}>
            <Gamepad2 size={22} strokeWidth={2.2} />
          </ToolButton>
        )}
        <ToolButton label="Pantalla completa" onClick={onFullscreen}>
          {isFullscreen ? <Minimize size={22} strokeWidth={2.2} /> : <Maximize size={22} strokeWidth={2.2} />}
        </ToolButton>
      </div>

      <div className="flex items-center gap-3">
        <ToolButton label="Lección anterior" onClick={onPrevLesson} disabled={!canPrevLesson}>
          <SkipBack size={22} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton label="Lección siguiente" onClick={onNextLesson} disabled={!canNextLesson} big>
          <SkipForward size={26} strokeWidth={2.4} />
        </ToolButton>
      </div>
    </div>
  )
}
