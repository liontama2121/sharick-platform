import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ActivityShell from './ActivityShell'
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
    <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Dado: ${value}`}>
      <rect x="6" y="6" width="108" height="108" rx="22" fill="#ffffff" stroke="#003DA5" strokeWidth="4" />
      <rect x="6" y="6" width="108" height="108" rx="22" fill="url(#diceGlow)" opacity="0.18" />
      <defs>
        <linearGradient id="diceGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD100" />
          <stop offset="100%" stopColor="#CE1126" />
        </linearGradient>
      </defs>
      {(PIPS[value] ?? []).map(([col, row], i) => (
        <circle key={i} cx={col * 30} cy={row * 30} r="9" fill="#CE1126" />
      ))}
    </svg>
  )
}

/** "1-2" -> [1,2] */
function inRange(key, n) {
  const [a, b] = key.split('-').map(Number)
  return n >= a && n <= b
}

export default function DiceGame({ section, completed, score, onComplete }) {
  const ranges = section.ranges ?? {}
  const [value, setValue] = useState(1)
  const [current, setCurrent] = useState(null)   // clave del rango actual
  const [seen, setSeen] = useState([])           // rangos ya practicados
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

    // ruleta visual mientras gira
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
          setToast({ msg: '¡Practicaste las 3 formas de responder! 🎲', type: 'success' })
          onComplete?.(100)
        }
      }
    }, 900)
  }

  const active = current ? ranges[current] : null

  return (
    <>
      <ActivityShell
        icon="🎲"
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ink/60">
              Respuestas practicadas: {seen.length} de {rangeKeys.length}
            </span>
            <div className="flex gap-1.5">
              {rangeKeys.map((k) => (
                <span
                  key={k}
                  title={ranges[k].label}
                  className={`h-2.5 w-8 rounded-full ${seen.includes(k) ? 'bg-col-red' : 'bg-col-blue/15'}`}
                />
              ))}
            </div>
          </div>
        }
      >
        <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-4">
            <div ref={diceRef}><Dice value={value} /></div>
            <Button onClick={roll} disabled={rolling}>
              {rolling ? 'Rodando…' : '🎲 ¡Lanza el dado!'}
            </Button>
          </div>

          <div ref={phrasesRef} className="min-h-[180px]">
            {!active && !rolling && (
              <p className="text-ink/55">
                Lanza el dado y responde <em>“How are you?”</em> con las frases que te toquen.
              </p>
            )}
            {active && (
              <>
                <p className="mb-1 font-title text-sm font-semibold text-col-blue/70">
                  Salió {value} → responde así:
                </p>
                <h4 className="mb-4 font-title text-2xl font-bold text-col-red">{active.label}</h4>
                <ul className="flex flex-col gap-2.5">
                  {active.phrases.map((p, i) => (
                    <li
                      key={i}
                      data-bubble
                      className="anim-hidden relative rounded-2xl rounded-bl-sm bg-col-yellow/25 px-4 py-3
                        font-title text-lg font-semibold"
                    >
                      “{p}”
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-ink/55">Dilas en voz alta 🗣️</p>
              </>
            )}
          </div>
        </div>
      </ActivityShell>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
