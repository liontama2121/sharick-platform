import { forwardRef } from 'react'

/* Color fijo por letra de diálogo: la pintura de la chiva.
   `letter` es el color de la letra de fuera (legible sobre blanco). */
export const BUBBLE_COLORS = {
  A: { bg: '#2A5CA8', ink: '#ffffff', letter: '#2A5CA8' },
  B: { bg: '#C8283C', ink: '#ffffff', letter: '#C8283C' },
  C: { bg: '#0F7A6E', ink: '#ffffff', letter: '#0F7A6E' },
  D: { bg: '#6D3B8E', ink: '#ffffff', letter: '#6D3B8E' },
  E: { bg: '#F5B700', ink: '#1f3354', letter: '#1f3354' },
}

/**
 * Caja de diálogo de color con la letra fuera, arriba a la izquierda.
 * Los nombres van en una columna propia, así todos terminan en la misma
 * vertical y el texto empieza alineado, como en el libro impreso.
 */
const DialogueBubble = forwardRef(function DialogueBubble(
  { dialogue, playing = false, selected = false, compact = false, onSelect, className = '' },
  ref,
) {
  const color = BUBBLE_COLORS[dialogue.letter] ?? BUBBLE_COLORS.A
  /* `compact`: mismo cuerpo de 20px pero interlineado y padding más cortos,
     para las pantallas que llevan los tres diálogos más una actividad. */
  const lineCls = compact ? 'leading-[1.4]' : 'leading-[1.5]'

  return (
    <div className={`relative pl-9 ${className}`}>
      {/* Letra fuera de la caja */}
      <span
        className="rotulo absolute left-0 top-0 text-[38px] leading-none"
        style={{ color: color.letter ?? color.bg }}
      >
        {dialogue.letter}
      </span>

      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        className={`relative w-full rounded-[18px] px-6 text-left transition-shadow
          ${compact ? 'py-3' : 'py-4'} ${selected ? 'ring-4 ring-amarillo' : ''}`}
        style={{
          background: color.bg,
          color: color.ink,
          boxShadow: playing
            ? `0 0 0 6px color-mix(in srgb, ${color.bg} 30%, transparent)`
            : '0 4px 14px rgba(20,30,50,.16)',
        }}
      >
        {/* Filete pintado por dentro del panel */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6px] rounded-[13px] border-2"
          style={{ borderColor: `color-mix(in srgb, ${color.ink} 40%, transparent)` }}
        />
        {/* Punta del bocadillo */}
        <span
          aria-hidden="true"
          className="absolute -left-2 top-12 h-4 w-4 rotate-45 rounded-[3px]"
          style={{ background: color.bg }}
        />

        <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {(dialogue.lines ?? []).map((line, i) => (
            <span key={i} className="contents">
              <span className={`text-right font-body text-[20px] font-semibold ${lineCls}`}>
                {line.speaker}:
              </span>
              <span className={`font-body text-[20px] ${lineCls}`}>{line.text}</span>
            </span>
          ))}
        </span>
      </button>
    </div>
  )
})

export default DialogueBubble
