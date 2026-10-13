import AudioButton from '../media/AudioButton'

/**
 * Diálogo en caja amarilla (como la referencia): hablante A / B en placas,
 * frase al lado, 🎧 opcional arriba a la derecha.
 * block: { type: "dialogueCard", audio?, lines: [{ speaker, text }] }
 */
export default function DialogueCard({ block }) {
  return (
    <section className="relative rounded-[22px] border-[4px] border-azul bg-amarillo px-7 py-5 shadow-lift">
      {block.audio !== undefined && (
        <AudioButton src={block.audio} label="Listen to the dialogue" size={48} tone="azul" className="absolute -right-4 -top-4" />
      )}
      <ul className="flex flex-col gap-2.5">
        {(block.lines ?? []).map((l, i) => (
          <li key={i} className="grid grid-cols-[40px_1fr] items-start gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-[18px]
                ${l.speaker === 'A' ? 'bg-azul text-paper' : 'bg-rojo-ink text-paper'}`}
            >
              {l.speaker}
            </span>
            <span className="pt-0.5 font-body text-[24px] font-semibold leading-snug text-azul">{l.text}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
