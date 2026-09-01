import { forwardRef } from 'react'

/* Color fijo por letra de diálogo. */
export const BUBBLE_COLORS = {
  A: { bg: '#8E7CC3', ink: '#ffffff' },
  B: { bg: '#E05A47', ink: '#ffffff' },
  C: { bg: '#3F86B8', ink: '#ffffff' },
  D: { bg: '#6B9080', ink: '#ffffff' },
  E: { bg: '#E9B44C', ink: '#1b3a5c' },
}

/**
 * Caja de diálogo de color con la letra fuera, arriba a la izquierda.
 * Los nombres van en una columna propia, así todos terminan en la misma
 * vertical y el texto empieza alineado, como en el libro impreso.
 */
const DialogueBubble = forwardRef(function DialogueBubble(
  { dialogue, playing = false, selected = false, onSelect, className = '' },
  ref,
) {
  const color = BUBBLE_COLORS[dialogue.letter] ?? BUBBLE_COLORS.A

  return (
    <div className={`relative pl-9 ${className}`}>
      {/* Letra fuera de la caja */}
      <span
        className="absolute left-0 top-0 font-display text-[38px] leading-none"
        style={{ color: color.bg }}
      >
        {dialogue.letter}
      </span>

      <button
        ref={ref}
        type="button"
        onClick={onSelect}
        className={`relative w-full rounded-[18px] px-6 py-4 text-left transition-shadow
          ${selected ? 'ring-4 ring-gold' : ''}`}
        style={{
          background: color.bg,
          color: color.ink,
          boxShadow: playing
            ? `0 0 0 6px color-mix(in srgb, ${color.bg} 30%, transparent)`
            : '0 4px 14px rgba(27,58,92,.14)',
        }}
      >
        {/* Punta del bocadillo */}
        <span
          aria-hidden="true"
          className="absolute -left-2 top-5 h-4 w-4 rotate-45 rounded-[3px]"
          style={{ background: color.bg }}
        />

        <span className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {(dialogue.lines ?? []).map((line, i) => (
            <span key={i} className="contents">
              <span className="text-right font-body text-[20px] font-semibold leading-[1.5]">
                {line.speaker}:
              </span>
              <span className="font-body text-[20px] leading-[1.5]">{line.text}</span>
            </span>
          ))}
        </span>
      </button>
    </div>
  )
})

export default DialogueBubble
