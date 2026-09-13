import { useLayoutEffect, useRef, useState } from 'react'
import DialogueBubble, { BUBBLE_COLORS } from '../page/DialogueBubble'
import IllustrationWithMarkers from '../page/IllustrationWithMarkers'
import FeedbackToast from '../ui/FeedbackToast'
import { celebrate, shake } from '../../hooks/useFeedback'
import { useDragDrop } from '../../hooks/useDragDrop'

/** Ficha con la letra del diálogo, en el color de su caja. */
function LetterChip({ letter, className = '', style, ...rest }) {
  const color = BUBBLE_COLORS[letter] ?? BUBBLE_COLORS.A
  return (
    <span
      className={`flex h-12 w-14 select-none items-center justify-center rounded-[10px]
        font-display text-[26px] leading-none shadow-lift ${className}`}
      style={{ background: color.bg, color: color.ink, ...style }}
      {...rest}
    >
      {letter}
    </span>
  )
}

/**
 * Emparejar los diálogos (A-C) con los grupos de la ilustración (1-3),
 * al estilo del libro: junto a cada grupo hay dos cajitas pegadas [1][ _ ].
 * La de la izquierda lleva el número fijo; en la derecha cae la letra.
 *
 * El estudiante arrastra las fichas A/B/C desde la bandeja (mouse o dedo)
 * o, si prefiere, toca la ficha y luego el slot. Acierto: la letra se
 * asienta, borde salvia y pop. Fallo: shake y la ficha vuelve a la bandeja.
 */
export default function MatchSlots({
  screen,
  activity,
  playingLetter,
  onPlayDialogue,
  resetKey = 0,
  onComplete,
}) {
  const pairs = activity.pairs ?? []
  const dialogues = screen.dialogues ?? []

  const [selected, setSelected] = useState(null)
  const [filled, setFilled] = useState({}) // { [marker]: letter }
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

  const attempt = (letter, markerN) => {
    if (!letter || markerN == null) return
    if (filled[markerN]) return
    const slot = slotRefs.current[markerN]
    const pair = pairs.find((p) => p.marker === markerN)

    if (pair && pair.dialogue === letter) {
      const next = { ...filled, [markerN]: letter }
      setFilled(next)
      setSelected(null)
      celebrate(slot)
      if (Object.keys(next).length === pairs.length && !reportedRef.current) {
        reportedRef.current = true
        setToast({ msg: '¡Excelente!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      setSelected(null)
      shake(slot)
      setToast({ msg: 'Esa no es. Inténtalo de nuevo.', type: 'error' })
    }
  }

  const { drag, over, bind } = useDragDrop({
    wrapRef,
    onTap: (letter) => {
      if (placed.has(letter)) return
      setSelected(selected === letter ? null : letter)
      const d = dialogues.find((x) => x.letter === letter)
      if (d) onPlayDialogue?.(d)
    },
    onDrop: (letter, target) => {
      if (target == null) return
      attempt(letter, Number(target))
    },
  })

  const clickSlot = (markerN) => {
    if (filled[markerN]) return
    if (!selected) {
      setToast({ msg: 'Primero toca una letra (A, B o C).', type: 'info' })
      return
    }
    attempt(selected, markerN)
  }

  /* Cajitas [1][ _ ] sobre la ilustración. */
  const renderMarker = (m) => {
    const letter = filled[m.n]
    const isOver = over === String(m.n) && !letter
    return (
      <div
        key={m.n}
        className="absolute flex -translate-x-1/2 -translate-y-1/2 items-stretch"
        style={{ left: `${m.x}%`, top: `${m.y}%` }}
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-l-[10px] border-2 border-r-0
            border-navy/25 bg-white font-display text-[24px] text-navy shadow-soft"
        >
          {m.n}
        </span>
        <button
          ref={(el) => {
            slotRefs.current[m.n] = el
          }}
          type="button"
          data-drop={m.n}
          onClick={() => clickSlot(m.n)}
          aria-label={
            letter ? `Grupo ${m.n}: diálogo ${letter}` : `Grupo ${m.n}: suelta aquí una letra`
          }
          className={`flex h-12 w-14 items-center justify-center rounded-r-[10px] border-2 bg-white
            shadow-soft transition-colors
            ${letter ? 'border-sage-ink' : isOver ? 'border-gold bg-gold/15' : 'border-dashed border-navy/35'}
            ${selected && !letter ? 'cursor-pointer' : ''}`}
        >
          {letter ? (
            <LetterChip letter={letter} className="h-9 w-11 text-[22px] shadow-none" />
          ) : (
            <span className="font-body text-[18px] text-navy/30">_</span>
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      <div ref={wrapRef} className="relative grid h-full grid-cols-[1fr_1.1fr] gap-8">
        {/* Diálogos + bandeja de fichas */}
        <div className="flex min-h-0 flex-col gap-3">
          {dialogues.map((d) => (
            <DialogueBubble
              key={d.letter}
              dialogue={d}
              compact
              playing={playingLetter === d.letter}
              onSelect={() => onPlayDialogue?.(d)}
            />
          ))}

          <div className="mt-auto flex items-center gap-4 rounded-[14px] bg-box px-5 py-3">
            <span className="label-caps text-sage-ink">Arrastra</span>
            <div className="flex gap-3">
              {dialogues.map((d) => {
                const done = placed.has(d.letter)
                const dragging = drag?.id === d.letter
                return (
                  <LetterChip
                    key={d.letter}
                    letter={d.letter}
                    role="button"
                    tabIndex={done ? -1 : 0}
                    aria-label={`Letra ${d.letter}`}
                    aria-disabled={done}
                    onKeyDown={(e) => {
                      if (done) return
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(selected === d.letter ? null : d.letter)
                      }
                    }}
                    className={`touch-none transition-transform
                      ${done ? 'cursor-default opacity-25 shadow-none' : 'cursor-grab active:cursor-grabbing'}
                      ${dragging ? 'opacity-30' : ''}
                      ${selected === d.letter ? 'scale-110 ring-4 ring-gold' : ''}`}
                    {...bind(d.letter, done)}
                  />
                )
              })}
            </div>
            <span className="ml-auto font-body text-[15px] text-ink-soft">
              {Object.keys(filled).length} de {pairs.length}
            </span>
          </div>
        </div>

        {/* Ilustración con las cajitas numeradas */}
        <div className="flex h-full min-h-0 flex-col gap-3">
          <IllustrationWithMarkers
            className="min-h-0 flex-1"
            illustration={screen.illustration}
            renderMarker={renderMarker}
          />
          <p className="font-body text-[15px] text-ink-soft">
            {selected ? (
              <>
                Letra{' '}
                <span className="font-semibold" style={{ color: BUBBLE_COLORS[selected]?.bg }}>
                  {selected}
                </span>{' '}
                elegida · toca la cajita del grupo.
              </>
            ) : (
              'Arrastra cada letra hasta su grupo, o toca la letra y luego la cajita.'
            )}
          </p>
        </div>

        {/* Ficha fantasma que sigue al puntero */}
        {drag && (
          <LetterChip
            letter={drag.id}
            aria-hidden="true"
            className="pointer-events-none absolute z-50 scale-110"
            style={{ left: drag.x, top: drag.y, width: drag.w, height: drag.h }}
          />
        )}
      </div>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
