import { useEffect, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import ExerciseBlock from './ExerciseBlock'
import AudioButton from '../media/AudioButton'
import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Semicírculos de fondo, suaves (solo relleno, nunca texto encima). */
const TONES = {
  pink: '#F6D5CE',
  blue: '#D3E4F1',
  yellow: '#F8E4B0',
}

/** Un bocadillo de habla con su título y frases, cada una con 🎧. */
function Bubble({ bubble, bi, said, onSay, tail }) {
  const cols = bubble.columns ?? [bubble.items ?? []]
  return (
    <div
      data-scene
      className="relative rounded-[28px] border-[3px] border-navy/15 bg-white px-5 pb-4 pt-3
        shadow-[0_10px_24px_rgba(27,58,92,.14)]"
    >
      {/* Cola del bocadillo hacia la persona */}
      <span
        aria-hidden="true"
        className={`absolute bottom-[-15px] h-7 w-7 rotate-45 border-b-[3px] border-r-[3px] border-navy/15
          bg-white ${tail === 'right' ? 'right-12' : 'left-12'}`}
      />
      <p className="mb-2 font-display text-[26px] font-extrabold text-coral-ink">{bubble.label}</p>
      <div className="grid gap-x-6" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
        {cols.map((col, ci) => (
          <ul key={ci} className="flex flex-col gap-1.5">
            {col.map((it, ii) => {
              const key = `${bi}-${ci}-${ii}`
              const on = !!said[key]
              return (
                <li key={key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSay(key, bi)}
                    aria-pressed={on}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-left
                      font-body text-[21px] font-semibold transition-colors
                      ${on ? 'bg-tip text-sage-ink' : 'text-navy hover:bg-box'}`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border
                        text-[12px] font-bold
                        ${on ? 'border-sage-ink bg-sage-ink text-white' : 'border-navy/25 text-transparent'}`}
                    >
                      ✓
                    </span>
                    {it.text}
                  </button>
                  <AudioButton src={it.audio} label={`Listen: ${it.text}`} size={38} />
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </div>
  )
}

/**
 * Escena de speaking: ilustración central sobre un semicírculo de color y
 * uno o dos bocadillos de habla superpuestos, uno por persona. Tocar una
 * frase = dicha; se completa con una frase de cada bocadillo.
 * section: { tone, image: { src, alt, emoji },
 *            bubbles: [{ label, items: [{ text, audio }] } | { label, columns: [[…], […]] }] }
 */
export default function SpeechScene({ section, completed, score, onComplete }) {
  const bubbles = section.bubbles ?? []
  const [said, setSaid] = useState({})
  const [toast, setToast] = useState(null)
  const rootRef = useRef(null)
  const reportedRef = useRef(false)

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('[data-scene]')
    if (!els?.length || reduced()) return
    els.forEach((el) => {
      el.style.opacity = '0'
    })
    animate(els, {
      opacity: [0, 1],
      scale: [0.85, 1],
      duration: 480,
      ease: 'outBack',
      delay: stagger(160),
    })
  }, [section.id])

  const bubbleDone = (next, bi) => Object.keys(next).some((k) => next[k] && k.startsWith(`${bi}-`))

  const say = (key, bi) => {
    const next = { ...said, [key]: !said[key] }
    setSaid(next)
    if (bubbles.every((_, i) => bubbleDone(next, i)) && !reportedRef.current) {
      reportedRef.current = true
      setToast({ msg: 'Great! Now say them to your classmate.', type: 'success' })
      onComplete?.(100)
    }
  }

  const single = bubbles.length === 1
  const bg = TONES[section.tone] ?? TONES.pink
  const image = section.image ?? {}

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
        <div ref={rootRef} className="relative h-[540px]">
          {/* Semicírculo de color de fondo */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 h-[420px] w-[840px] -translate-x-1/2 rounded-t-full"
            style={{ background: bg, left: single ? '34%' : '50%' }}
          />

          {/* Ilustración central */}
          <div
            data-scene
            className="absolute bottom-0 h-[400px] w-[520px] -translate-x-1/2"
            style={{ left: single ? '34%' : '50%' }}
          >
            <SmartImage
              src={image.src}
              alt={image.alt ?? ''}
              emoji={image.emoji ?? '👋'}
              rounded="rounded-t-[200px] rounded-b-2xl"
              showPath={false}
            />
          </div>

          {/* Bocadillos superpuestos */}
          {single ? (
            <div className="absolute right-0 top-4 w-[640px]">
              <Bubble bubble={bubbles[0]} bi={0} said={said} onSay={say} tail="left" />
            </div>
          ) : (
            bubbles.slice(0, 2).map((b, bi) => (
              <div key={bi} className={`absolute top-0 w-[450px] ${bi === 0 ? 'left-0' : 'right-0'}`}>
                <Bubble bubble={b} bi={bi} said={said} onSay={say} tail={bi === 0 ? 'right' : 'left'} />
              </div>
            ))
          )}
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
