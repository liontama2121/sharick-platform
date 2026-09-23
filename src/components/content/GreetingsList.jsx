import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Plus } from 'lucide-react'
import SectionLabel from '../ui/SectionLabel'
import AudioButton from '../media/AudioButton'
import { popIn } from '../../hooks/useFeedback'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Nota de uso expandible (+): "We use this when we go to sleep." */
function UsageNote({ note }) {
  const [open, setOpen] = useState(false)
  const iconRef = useRef(null)
  const noteRef = useRef(null)

  useEffect(() => {
    if (!open || !noteRef.current || reduced()) return
    animate(noteRef.current, { opacity: [0, 1], translateY: [-6, 0], duration: 320, ease: 'outQuad' })
  }, [open])

  const toggle = (e) => {
    e.stopPropagation()
    setOpen((v) => !v)
    if (iconRef.current && !reduced()) {
      animate(iconRef.current, { rotate: open ? [45, 0] : [0, 45], duration: 260, ease: 'outQuad' })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Hide usage note' : 'Show usage note'}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2
          border-gold bg-white text-navy shadow-soft hover:bg-gold/15"
      >
        <span ref={iconRef} className="flex" style={{ transform: open ? 'rotate(45deg)' : undefined }}>
          <Plus size={20} strokeWidth={2.6} />
        </span>
      </button>
      {open && (
        <p
          ref={noteRef}
          className="col-span-full -mt-1 rounded-xl bg-tip px-4 py-2 font-body text-[18px] italic text-sage-ink"
        >
          {note}
        </p>
      )}
    </>
  )
}

/**
 * Los saludos del día, cada uno con su botón de audífono.
 * block: { label, title, items: [{ time, greeting, emoji, audio, note? }] }
 */
export default function GreetingsList({ block }) {
  const ref = useRef(null)
  const items = block.items ?? []

  useEffect(() => {
    if (ref.current) popIn(ref.current.querySelectorAll('[data-bubble]'), 90)
  }, [block.id])

  return (
    <section className="box-beige px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <SectionLabel tone="sage" leaf>
          {block.label ?? 'Vocabulary'}
        </SectionLabel>
        {block.title && <span className="font-display text-[22px] text-navy">{block.title}</span>}
      </div>

      <ul ref={ref} className="flex flex-col gap-3">
        {items.map((it) => (
          <li
            key={it.greeting}
            data-bubble
            className="grid grid-cols-[56px_1fr_auto_auto] items-center gap-x-4 gap-y-2 rounded-2xl
              border border-navy/10 bg-white px-4 py-3"
          >
            <span
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-sage/55
                bg-paper text-[28px]"
            >
              {it.emoji ?? '•'}
            </span>
            <span className="min-w-0">
              {it.time && <span className="label-caps block text-coral-ink">{it.time}</span>}
              <span className="block font-display text-[32px] leading-tight text-navy">{it.greeting}</span>
            </span>
            {it.note ? <UsageNote note={it.note} /> : <span />}
            {/* Posición fija: la nota abierta ocupa la fila de abajo */}
            <AudioButton
              src={it.audio}
              label={`Listen: ${it.greeting}`}
              size={52}
              className="col-start-4 row-start-1"
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
