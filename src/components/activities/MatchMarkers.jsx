import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import DialogueBubble, { BUBBLE_COLORS } from '../page/DialogueBubble'
import IllustrationWithMarkers from '../page/IllustrationWithMarkers'
import ExerciseInstruction from '../page/ExerciseInstruction'
import FeedbackToast from '../ui/FeedbackToast'
import { celebrate, shake } from '../../hooks/useFeedback'

/**
 * Emparejar cada diálogo (A-C) con la persona señalada en la ilustración.
 * Click en la letra, click en el marcador: se dibuja una línea curva entre
 * los dos. Verde si acierta, roja y efímera si falla.
 */
export default function MatchMarkers({
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
  const [matched, setMatched] = useState({})
  const [wrong, setWrong] = useState(null)
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const [lines, setLines] = useState([])

  const wrapRef = useRef(null)
  const bubbleRefs = useRef({})
  const markerRefs = useRef({})
  const reportedRef = useRef(false)

  // Reinicio desde la toolbar
  useLayoutEffect(() => {
    setSelected(null)
    setMatched({})
    setWrong(null)
    setErrors(0)
    setLines([])
    reportedRef.current = false
  }, [resetKey])

  /* El escenario está escalado, así que las medidas del DOM se dividen por
     la escala real del contenedor para volver a coordenadas de diseño. */
  const measure = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const box = wrap.getBoundingClientRect()
    const s = box.width / wrap.offsetWidth || 1
    const point = (el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: (r.left + r.width / 2 - box.left) / s,
        y: (r.top + r.height / 2 - box.top) / s,
      }
    }

    const next = []
    Object.entries(matched).forEach(([letter, markerN]) => {
      const a = point(bubbleRefs.current[letter])
      const b = point(markerRefs.current[markerN])
      if (a && b) next.push({ key: `${letter}-${markerN}`, a, b, ok: true })
    })
    if (wrong) {
      const a = point(bubbleRefs.current[wrong.letter])
      const b = point(markerRefs.current[wrong.marker])
      if (a && b) next.push({ key: 'wrong', a, b, ok: false })
    }
    setLines(next)
  }, [matched, wrong])

  useLayoutEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const clickMarker = (marker) => {
    if (!selected) {
      setToast({ msg: 'Primero elige un diálogo (A, B o C).', type: 'info' })
      return
    }
    if (Object.values(matched).includes(marker.n)) return

    const pair = pairs.find((p) => p.dialogue === selected)
    if (pair && pair.marker === marker.n) {
      const next = { ...matched, [selected]: marker.n }
      setMatched(next)
      setSelected(null)
      celebrate(markerRefs.current[marker.n])

      if (Object.keys(next).length === pairs.length && !reportedRef.current) {
        reportedRef.current = true
        setToast({ msg: '¡Excelente!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      }
    } else {
      setErrors((e) => e + 1)
      shake(markerRefs.current[marker.n])
      setWrong({ letter: selected, marker: marker.n })
      setTimeout(() => setWrong(null), 600)
    }
  }

  const filled = Object.fromEntries(Object.entries(matched).map(([l, n]) => [n, l]))

  return (
    <>
      <div ref={wrapRef} className="relative grid h-full grid-cols-[1fr_1.1fr] gap-8">
        {/* Líneas de conexión */}
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full" aria-hidden="true">
          {lines.map((l) => {
            const mx = (l.a.x + l.b.x) / 2
            const my = (l.a.y + l.b.y) / 2 - 40
            return (
              <path
                key={l.key}
                d={`M ${l.a.x} ${l.a.y} Q ${mx} ${my} ${l.b.x} ${l.b.y}`}
                fill="none"
                stroke={l.ok ? 'var(--color-sage-ink)' : 'var(--color-coral-ink)'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={l.ok ? '0' : '8 6'}
                opacity={l.ok ? 0.9 : 0.85}
              />
            )
          })}
        </svg>

        {/* Diálogos */}
        <div className="flex flex-col gap-4">
          {dialogues.map((d) => (
            <DialogueBubble
              key={d.letter}
              ref={(el) => {
                bubbleRefs.current[d.letter] = el
              }}
              dialogue={d}
              playing={playingLetter === d.letter}
              selected={selected === d.letter}
              onSelect={() => {
                if (matched[d.letter]) return
                setSelected(selected === d.letter ? null : d.letter)
                onPlayDialogue?.(d)
              }}
            />
          ))}
        </div>

        {/* Ilustración con marcadores */}
        <div className="flex h-full flex-col gap-3">
          {activity.exercise && (
            <ExerciseInstruction
              number={activity.exercise.number}
              skill={activity.exercise.skill}
              instruction={activity.exercise.instruction}
            />
          )}

          <IllustrationWithMarkers
            className="min-h-0 flex-1"
            illustration={screen.illustration}
            markerRefs={markerRefs}
            filled={filled}
            selectedMarker={null}
            onMarkerClick={clickMarker}
          />

          <p className="font-body text-[15px] text-ink-soft">
            {Object.keys(matched).length} de {pairs.length} emparejados
            {selected && (
              <span className="ml-2 font-semibold" style={{ color: BUBBLE_COLORS[selected]?.bg }}>
                · {selected} seleccionado
              </span>
            )}
          </p>
        </div>
      </div>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
