/**
 * GRAMMAR · Personal subject pronouns. Tabla de 2 columnas, SINGULAR (1) y
 * PLURAL (2 or more): cada fila trae el pronombre grande y su ejemplo
 * visual (emoji en círculo + texto opcional "Diego → he").
 * block: { type: "pronounTable", columns: [..2], rows: [{ singular: {word, emoji, example}, plural: {...} }] }
 */
function Cell({ cell, tone }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5">
      <span className="flex h-[60px] min-w-[60px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-box px-2.5 text-[30px]" aria-hidden="true">
        {cell.emoji}
      </span>
      <span className="min-w-[96px] font-display text-[46px] leading-none" style={{ color: tone }}>
        {cell.word}
      </span>
      {cell.example && <span className="font-body text-[21px] font-medium text-ink-soft">{cell.example}</span>}
    </div>
  )
}

export default function PronounTable({ block }) {
  const [c1, c2] = block.columns ?? ['Singular', 'Plural']
  return (
    <div className="overflow-hidden rounded-[22px] border-[4px] border-azul bg-paper shadow-lift">
      <div className="grid grid-cols-2 bg-azul">
        {[c1, c2].map((c) => (
          <p key={c} className="px-5 py-2.5 font-display text-[24px] text-amarillo">
            {c}
          </p>
        ))}
      </div>
      {(block.rows ?? []).map((row, i) => (
        <div key={i} className={`grid grid-cols-2 ${i % 2 ? 'bg-box/60' : ''}`}>
          <div className="border-r-[3px] border-azul/12">
            <Cell cell={row.singular} tone="var(--color-rojo-ink)" />
          </div>
          <Cell cell={row.plural} tone="var(--color-verde-ink)" />
        </div>
      ))}
    </div>
  )
}
