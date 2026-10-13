/**
 * NOTE: caja de nota con borde punteado verde (como las del libro de
 * referencia). block: { type: "note", title?, text, rows?: [{ label, text }], extra? }
 */
export default function NoteBox({ block, className = '' }) {
  return (
    <aside
      className={`rounded-[18px] border-[3px] border-dashed border-verde-ink bg-tip px-6 py-4 ${className}`}
    >
      <p className="font-display text-[22px] leading-none text-verde-ink">{block.title ?? 'Note'}</p>
      {block.text && <p className="mt-2.5 font-body text-[19px] leading-snug text-ink">{block.text}</p>}
      {block.rows?.length > 0 && (
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-body text-[19px]">
          {block.rows.map((r) => (
            <div key={r.label} className="flex gap-2">
              <dt className="font-bold text-azul">{r.label}:</dt>
              <dd className="text-ink">{r.text}</dd>
            </div>
          ))}
        </dl>
      )}
      {block.extra && (
        <p className="mt-2 font-body text-[19px] font-semibold leading-snug text-azul">{block.extra}</p>
      )}
    </aside>
  )
}
