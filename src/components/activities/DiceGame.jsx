import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import Button from '../ui/Button'
import FeedbackToast from '../ui/FeedbackToast'
import SmartImage from '../ui/ImagePlaceholder'
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

function Dice({ value, size = 104 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Dice: ${value}`}>
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

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Colores de la pestaña por categoría (texto blanco, contraste AA). */
const TAB_TONES = ['bg-coral-ink', 'bg-sage-ink', 'bg-navy']

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
  /* Sin `phrases` = modo categoría ("Roll and speak!"): al caer el dado solo
     sale una pestaña grande con la consigna. Sharick no quiere frases de
     ejemplo en pantalla: son respuestas posibles del estudiante. */
  const categoryMode = rangeKeys.every((k) => !ranges[k].phrases?.length)
  const tabRef = useRef(null)

  useEffect(() => {
    if (current && phrasesRef.current) {
      popIn(phrasesRef.current.querySelectorAll('[data-bubble]'), 120)
    }
    if (current && tabRef.current && !reducedMotion()) {
      animate(tabRef.current, {
        opacity: [0, 1],
        translateY: [-24, 0],
        scale: [0.85, 1],
        duration: 520,
        ease: 'outBack',
      })
    }
  }, [current, value])

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
          setToast({ msg: categoryMode ? 'You practised all 3 categories!' : 'You practised all 3 answers!', type: 'success' })
          onComplete?.(100)
        }
      }
    }, 900)
  }

  const active = current ? ranges[current] : null

  if (categoryMode) {
    const side = section.sideImages ?? {}
    const tone = TAB_TONES[Math.max(0, rangeKeys.indexOf(current)) % TAB_TONES.length]
    return (
      <>
        <ExerciseBlock
          label={section.label}
          number={section.number}
          title={section.title}
          instructions={section.instructions}
          completed={completed}
          score={score}
        >
          <div className="grid grid-cols-[1fr_480px_1fr] items-stretch gap-8">
            <div className="h-[470px]">
              <SmartImage src={side.left?.src} alt={side.left?.alt ?? ''} emoji={side.left?.emoji ?? '👋'} showPath={false} />
            </div>

            <div className="flex flex-col items-center gap-4">
              <div ref={diceRef}>
                <Dice value={value} size={220} />
              </div>
              <Button onClick={roll} disabled={rolling} size="lg">
                {rolling ? 'Rolling…' : '🎲 Roll the dice!'}
              </Button>

              <div className="flex min-h-[96px] w-full items-center justify-center">
                {active && !rolling ? (
                  <div
                    ref={tabRef}
                    className={`relative w-full rounded-[18px] px-6 py-4 text-center text-white
                      shadow-[0_12px_26px_rgba(27,58,92,.28)] ${tone}`}
                  >
                    <span className="label-caps block text-white/85">You rolled {value}</span>
                    <span className="mt-1 block font-display text-[40px] font-extrabold leading-tight">
                      {active.label}
                    </span>
                  </div>
                ) : (
                  !rolling && (
                    <p className="text-center font-body text-[19px] text-ink-soft">
                      Roll the dice to see your task.
                    </p>
                  )
                )}
              </div>

              {/* Número → consigna, y cuáles ya salieron */}
              <ul className="flex justify-center gap-2">
                {rangeKeys.map((k, i) => (
                  <li
                    key={k}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full border py-1 pl-1 pr-3
                      font-body text-[15px] font-semibold
                      ${seen.includes(k) ? 'border-sage-ink/50 bg-tip text-sage-ink' : 'border-navy/12 bg-white text-navy'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[14px] font-bold text-white
                          ${TAB_TONES[i % TAB_TONES.length]}`}
                      >
                        {k}
                      </span>
                      {ranges[k].label}
                    </span>
                    {seen.includes(k) && <span aria-label="done">✓</span>}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-[470px]">
              <SmartImage src={side.right?.src} alt={side.right?.alt ?? ''} emoji={side.right?.emoji ?? '👋'} showPath={false} />
            </div>
          </div>
        </ExerciseBlock>

        <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
      </>
    )
  }

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
              Answers practised: {seen.length} of {rangeKeys.length}
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
              {rolling ? 'Rolling…' : '🎲 Roll the dice!'}
            </Button>
          </div>

          <div ref={phrasesRef} className="min-h-[150px]">
            {!active && !rolling && (
              <p className="text-[0.9rem] text-ink-soft">
                Roll the dice and answer <em>“How are you?”</em> with the phrases you get.
              </p>
            )}
            {active && (
              <>
                <p className="label-caps text-sage-ink">You rolled {value}</p>
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
                <p className="mt-2 text-[0.8rem] italic text-ink-soft">Say them out loud.</p>
              </>
            )}
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
