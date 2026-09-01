import { Gamepad2, Home, X } from 'lucide-react'
import RoundButton from '../nav/RoundButton'

/** Barra mínima del Nivel 3, transparente sobre el papel. */
export default function ReaderBar({ title, onHome, onGames, onClose }) {
  return (
    <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-3 px-5 py-3 sm:px-8">
      <RoundButton label="Ir al menú del libro" onClick={onHome}>
        <Home size={19} strokeWidth={2.4} />
      </RoundButton>

      <p className="min-w-0 truncate text-center font-display text-[0.95rem] text-navy">{title}</p>

      <span className="flex items-center gap-2">
        {onGames && (
          <RoundButton label="Juegos de este módulo" onClick={onGames}>
            <Gamepad2 size={19} strokeWidth={2.2} />
          </RoundButton>
        )}
        <RoundButton label="Volver a las lecciones del módulo" onClick={onClose}>
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </span>
    </div>
  )
}
