import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import Button from '../ui/Button'
import FeedbackToast from '../ui/FeedbackToast'
import { popIn } from '../../hooks/useFeedback'

/* Posiciones de los puntos del dado (grid 3x3) */
const PIPS = {
  1: [[2, 2]],
  2: [[1, 1], [3, 3]],
  3: [[1, 1], [2, 2], [3, 3]],
  4: [[1, 1], [1, 3], [3, 1], [3, 3]],
  5: [[1, 1], [1, 3], [2, 2], [3, 1], [3, 3]],
  6: [[1, 1], [1, 2], [1, 3], [3, 1], [3, 2], [3, 3]],
}

function Dice({ value }) {
  return (
    <svg width="104" height="104" viewBox="0 0 120 120" role="img" aria-label={`Dado: ${value}`}>
      <rect
        x="7"
        y="7"
        width="106"
        height="106"
        rx="22"
        fill="#fff"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <rect x="7" y="7" width="106" height="106" rx="22" fill="var(--color-gold)" opacity=".1" />
      {(PIPS[value] ?? []).map(([col, row], i) => (
        <circle key={i} cx={col * 30} cy={row * 30} r="8.5" fill="var(--color-coral-ink)" />
      ))}
    </svg>
  )
}

/** "1-2" -> incluye n */
function inRange(key, n) {
  const [a, b] = key.split('-').map(Number)
  return n >= a && n <= b
}

export default function DiceGame({ section, completed, score, onComplete }) {
  const ranges = section.ranges ?? {}
  const [value, setValue] = useState(1)
  const [current, setCurrent] = useState(null)
  const [seen, setSeen] = useState([])
  const [rolling, setRolling] = useState(false)
  const [toast, setToast] = useState(null)

  const diceRef = useRef(null)
  const phrasesRef = useRef(null)
  const rangeKeys = Object.keys(ranges)

  useEffect(() => {
    if (current && phrasesRef.current) {
      popIn(phrasesRef.current.querySelectorAll('[data-bubble]'), 120)
    }
  }, [current])

  const roll = () => {
    if (rolling) return
    setRolling(true)
    setCurrent(null)

    const result = 1 + Math.floor(Math.random() * 6)
    const spin = setInterval(() => setValue(1 + Math.floor(Math.random() * 6)), 90)

    if (diceRef.current) {
      animate(diceRef.current, {
        rotate: [0, 720],
        scale: [1, 1.18, 1],
        duration: 900,
        ease: 'outElastic(1, .6)',
      })
    }

    setTimeout(() => {
      clearInterval(spin)
      setValue(result)
      const key = rangeKeys.find((k) => inRange(k, result))
      setCurrent(key ?? null)
      setRolling(false)

      if (key && !seen.includes(key)) {
        const nextSeen = [...seen, key]
        setSeen(nextSeen)
        if (nextSeen.length === rangeKeys.length) {
          setToast({ msg: '¡Practicaste las 3 formas de responder!', type: 'success' })
          onComplete?.(100)
        }
      }
    }, 900)
  }

  const active = current ? ranges[current] : null

  return (
    <>
      <ExerciseBlock
        label={section.label}
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
        footer={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Respuestas practicadas: {seen.length} de {rangeKeys.length}
            </span>
            <span className="flex gap-1">
              {rangeKeys.map((k) => (
                <span
                  key={k}
                  title={ranges[k].label}
                  className={`h-2 w-7 rounded-full ${seen.includes(k) ? 'bg-coral-ink' : 'bg-navy/12'}`}
                />
              ))}
            </span>
          </span>
        }
      >
        <div className="box-beige grid grid-cols-[auto_1fr] items-center gap-4 p-3.5">
          <div className="flex flex-col items-center gap-3">
            <div ref={diceRef}>
              <Dice value={value} />
            </div>
            <Button onClick={roll} disabled={rolling} size="sm">
              {rolling ? 'Rodando…' : '🎲 ¡Lanza el dado!'}
            </Button>
          </div>

          <div ref={phrasesRef} className="min-h-[150px]">
            {!active && !rolling && (
              <p className="text-[0.9rem] text-ink-soft">
                Lanza el dado y responde <em>“How are you?”</em> con las frases que te toquen.
              </p>
            )}
            {active && (
              <>
                <p className="label-caps text-sage-ink">Salió {value}</p>
                <h3 className="mb-2.5">{active.label}</h3>
                <ul className="flex flex-col gap-1.5">
                  {active.phrases.map((p, i) => (
                    <li
                      key={i}
                      data-bubble
                      className="rounded-xl border border-navy/12 bg-white px-3 py-2
                        font-display text-[1.05rem] text-navy"
                    >
                      “{p}”
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[0.8rem] italic text-ink-soft">Dilas en voz alta.</p>
              </>
            )}
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
