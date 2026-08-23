import { useEffect, useRef } from 'react'
import { popIn } from '../../hooks/useFeedback'
import AudioPlayer from './AudioPlayer'

const AVATAR_COLORS = ['bg-col-blue', 'bg-col-red', 'bg-col-yellow']

function initials(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?'
}

/**
 * Diálogo A/B/C con avatares y burbujas alternadas.
 * @param {{id,label,audio,characters,lines,context}} dialogue
 */
export default function DialogueBlock({ dialogue, badge }) {
  const listRef = useRef(null)
  const characters = dialogue.characters ?? []

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    popIn(el.querySelectorAll('[data-bubble]'), 120)
  }, [dialogue.id])

  return (
    <article className="card-soft overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-col-blue/8 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-col-yellow font-title text-lg font-bold text-ink">
            {badge ?? dialogue.id}
          </span>
          <div>
            <h3 className="text-base">{dialogue.label}</h3>
            {dialogue.context && (
              <p className="text-xs text-ink/55">{dialogue.context}</p>
            )}
          </div>
        </div>
        <AudioPlayer src={dialogue.audio} label={dialogue.label} />
      </header>

      <div ref={listRef} className="flex flex-col gap-3 px-5 py-5">
        {(dialogue.lines ?? []).map((line, i) => {
          const idx = Math.max(0, characters.indexOf(line.speaker))
          const mine = idx % 2 === 0
          return (
            <div
              key={i}
              data-bubble
              className={`anim-hidden flex items-end gap-2.5 ${mine ? '' : 'flex-row-reverse'}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                  font-title text-sm font-bold text-white ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}
                  ${idx % AVATAR_COLORS.length === 2 ? 'text-ink' : ''}`}
                title={line.speaker}
                aria-hidden="true"
              >
                {initials(line.speaker)}
              </span>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  mine ? 'rounded-bl-sm bg-col-blue/6' : 'rounded-br-sm bg-col-yellow/22'
                }`}
              >
                <p className="font-title text-xs font-semibold text-col-blue/70">{line.speaker}</p>
                <p className="text-[0.95rem] leading-relaxed">{line.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
