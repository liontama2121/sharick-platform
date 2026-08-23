import { useEffect, useRef } from 'react'
import { popIn } from '../../hooks/useFeedback'
import AudioPlayer from './AudioPlayer'
import SectionLabel from '../ui/SectionLabel'

const AVATAR_TONES = ['bg-navy text-white', 'bg-coral-ink text-white', 'bg-sage-ink text-white']

function initials(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?'
}

/** Diálogo A/B/C con avatares y burbujas alternadas, en caja beige. */
export default function DialogueBlock({ dialogue }) {
  const listRef = useRef(null)
  const characters = dialogue.characters ?? []

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    popIn(el.querySelectorAll('[data-bubble]'), 120)
  }, [dialogue.id])

  return (
    <article className="box-beige px-4 py-3.5">
      <header className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-baseline gap-2">
          <SectionLabel tone="coral">{dialogue.label}</SectionLabel>
          {dialogue.context && (
            <span className="text-[0.74rem] italic text-ink-soft">{dialogue.context}</span>
          )}
        </span>
        <AudioPlayer src={dialogue.audio} label="Listen" compact />
      </header>

      <div ref={listRef} className="flex flex-col gap-2">
        {(dialogue.lines ?? []).map((line, i) => {
          const idx = Math.max(0, characters.indexOf(line.speaker))
          return (
            <div key={i} data-bubble className="flex items-start gap-2.5">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                  font-body text-[0.72rem] font-bold ${AVATAR_TONES[idx % AVATAR_TONES.length]}`}
                title={line.speaker}
                aria-hidden="true"
              >
                {initials(line.speaker)}
              </span>
              <p className="text-[0.92rem] leading-relaxed">
                <span className="font-semibold text-navy">{line.speaker}: </span>
                {line.text}
              </p>
            </div>
          )
        })}
      </div>
    </article>
  )
}
