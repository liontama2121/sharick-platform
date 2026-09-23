import { useLayoutEffect, useRef, useState } from 'react'
import DialogueBubble from '../page/DialogueBubble'
import IllustrationWithMarkers from '../page/IllustrationWithMarkers'
import FeedbackToast from '../ui/FeedbackToast'
import { celebrate, shake } from '../../hooks/useFeedback'
import { useDragDrop } from '../../hooks/useDragDrop'

/* Colores de las etiquetas, tal como los pidió Sharick. */
export const HEADING_COLORS = {
  red: { bg: '#CE3B2C', ink: '#ffffff' },
  yellow: { bg: '#E9B44C', ink: '#1B3A5C' },
  blue: { bg: '#3F86B8', ink: '#ffffff' },
  purple: { bg: '#8E7CC3', ink: '#ffffff' },
  sage: { bg: '#4F6F60', ink: '#ffffff' },
}

/** Píldora con el título de un diálogo. */
function HeadingPill({ heading, className = '', style, ...rest }) {
  const color = HEADING_COLORS[heading.color] ?? HEADING_COLORS.red
  return (
    <span
      className={`flex h-12 select-none items-center justify-center whitespace-nowrap rounded-full
        px-6 font-body text-[19px] font-bold shadow-lift ${className}`}
      style={{ background: color.bg, color: color.ink, ...style }}
      {...rest}
    >
      {heading.text}
    </span>
  )
}

/**
 * Emparejar los títulos con los diálogos. Cada caja de diálogo lleva encima
 * un slot gris redondeado; a la izquierda están las etiquetas de colores.
 * Se arrastran (mouse o dedo) o se toca etiqueta → slot.
 * Acierto: la etiqueta encaja, pop y borde salvia. Fallo: shake y vuelve.
 */
export default function MatchHeadings({
  screen,
  activity,
  playingLetter,
  onPlayDialogue,
  resetKey = 0,
  onComplete,
}) {
  const headings = activity.headings ?? []
  const dialogues = screen.dialogues ?? []

  const [selected, setSelected] = useState(null) // índice del heading
  const [filled, setFilled] = useState({}) // { [letter]: headingIdx }
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)

  const wrapRef = useRef(null)
  const slotRefs = useRef({})
  const reportedRef = useRef(false)

  useLayoutEffect(() => {
    setSelected(null)
    setFilled({})
    setErrors(0)
    reportedRef.current = false
  }, [resetKey])

  const placed = new Set(Object.values(filled))

  const attempt = (idx, letter) => {
    if (idx == null || !letter) return
    if (filled[letter] != null) return
    const slot = slotRefs.current[letter]
    const heading = headings[idx]

    if (heading && heading.target === letter) {
      const next = { ...filled, [letter]: idx }
      setFilled(next)
      setSelected(null)
      celebrate(slot)
      if (Object.keys(next).length === headings.length && !reportedRef.current) {
        reportedRef.current = true
        setToast({ msg: 'Excellent!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      setSelected(null)
      shake(slot)
      setToast({ msg: "That heading doesn't go there. Try again.", type: 'error' })
    }
  }

  const { drag, over, bind } = useDragDrop({
    wrapRef,
    onTap: (id) => {
      const idx = Number(id)
      if (placed.has(idx)) return
      setSelected(selected === idx ? null : idx)
    },
    onDrop: (id, target) => {
      if (target == null) return
      attempt(Number(id), target)
    },
  })

  const clickSlot = (letter) => {
    if (filled[letter] != null) return
    if (selected == null) {
      setToast({ msg: 'First tap a heading.', type: 'info' })
      return
    }
    attempt(selected, letter)
  }

  return (
    <>
      <div ref={wrapRef} className="relative grid h-full grid-cols-[0.85fr_1.15fr] gap-8">
        {/* Etiquetas + ilustración */}
        <div className="flex min-h-0 flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-[14px] bg-box px-5 py-4">
            <span className="label-caps text-sage-ink">Headings</span>
            {headings.map((h, idx) => {
              const done = placed.has(idx)
              const dragging = drag?.id === String(idx)
              return (
                <HeadingPill
                  key={idx}
                  heading={h}
                  role="button"
                  tabIndex={done ? -1 : 0}
                  aria-label={`Heading: ${h.text}`}
                  aria-disabled={done}
                  onKeyDown={(e) => {
                    if (done) return
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(selected === idx ? null : idx)
                    }
                  }}
                  className={`touch-none transition-transform
                    ${done ? 'cursor-default opacity-25 shadow-none' : 'cursor-grab active:cursor-grabbing'}
                    ${dragging ? 'opacity-30' : ''}
                    ${selected === idx ? 'scale-105 ring-4 ring-gold' : ''}`}
                  {...bind(String(idx), done)}
                />
              )
            })}
            <span className="font-body text-[14px] text-ink-soft">
              {selected != null
                ? 'Now tap the grey space above the dialogue.'
                : 'Drag each heading to its dialogue, or tap the heading and then the grey space.'}
              {' · '}
              {Object.keys(filled).length} of {headings.length}
            </span>
          </div>

          {screen.illustration && (
            <IllustrationWithMarkers
              className="min-h-0 flex-1"
              illustration={{ ...screen.illustration, markers: [] }}
            />
          )}
        </div>

        {/* Diálogos, cada uno con su slot gris encima */}
        <div className="flex min-h-0 flex-col gap-3">
          {dialogues.map((d) => {
            const idx = filled[d.letter]
            const heading = idx != null ? headings[idx] : null
            const isOver = over === d.letter && !heading
            return (
              <div key={d.letter} className="flex flex-col">
                <div className="relative z-10 -mb-2 ml-9 flex justify-center">
                  <button
                    ref={(el) => {
                      slotRefs.current[d.letter] = el
                    }}
                    type="button"
                    data-drop={d.letter}
                    onClick={() => clickSlot(d.letter)}
                    aria-label={
                      heading
                        ? `Dialogue ${d.letter}: ${heading.text}`
                        : `Dialogue ${d.letter}: drop a heading here`
                    }
                    className={`flex h-12 min-w-[320px] items-center justify-center rounded-full
                      border-2 transition-colors
                      ${heading
                        ? 'border-sage-ink bg-white'
                        : isOver
                          ? 'border-gold bg-gold/20'
                          : 'border-transparent bg-[#E3DED4] shadow-[inset_0_2px_6px_rgba(27,58,92,.18)]'}
                      ${selected != null && !heading ? 'cursor-pointer' : ''}`}
                  >
                    {heading ? (
                      <HeadingPill heading={heading} className="h-11 shadow-none" />
                    ) : (
                      <span className="font-body text-[16px] text-ink-soft/60">…</span>
                    )}
                  </button>
                </div>
                <DialogueBubble
                  dialogue={d}
                  compact
                  playing={playingLetter === d.letter}
                  onSelect={() => onPlayDialogue?.(d)}
                />
              </div>
            )
          })}
        </div>

        {/* Etiqueta fantasma que sigue al puntero */}
        {drag && headings[Number(drag.id)] && (
          <HeadingPill
            heading={headings[Number(drag.id)]}
            aria-hidden="true"
            className="pointer-events-none absolute z-50 scale-105"
            style={{ left: drag.x, top: drag.y, width: drag.w, height: drag.h }}
          />
        )}
      </div>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
