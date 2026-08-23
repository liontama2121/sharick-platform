import { useMemo, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'
import Button from '../ui/Button'
import { celebrate, shake } from '../../hooks/useFeedback'

/** Barajado determinista: mismo orden en cada render/recarga. */
function shuffleStable(list) {
  return [...list]
    .map((item, i) => ({ item, k: ((i + 1) * 2654435761) % 97 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item)
}

export default function MatchActivity({ section, completed, score, onComplete }) {
  const pairs = section.pairs ?? []
  const rights = useMemo(() => shuffleStable(pairs), [pairs])

  const [selected, setSelected] = useState(null)
  const [matched, setMatched] = useState({})
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const nodes = useRef({})

  const done = pairs.length > 0 && Object.keys(matched).length === pairs.length

  const clickRight = (pair) => {
    if (!selected || matched[pair.id]) return
    const el = nodes.current[`r-${pair.id}`]

    if (selected === pair.id) {
      const next = { ...matched, [pair.id]: Object.keys(matched).length }
      setMatched(next)
      setSelected(null)
      celebrate(el)
      celebrate(nodes.current[`l-${pair.id}`])
      if (Object.keys(next).length === pairs.length) {
        setToast({ msg: '¡Todos los pares correctos!', type: 'success' })
        onComplete?.(Math.max(40, 100 - Math.min(errors * 10, 60)))
      } else {
        setToast({ msg: '¡Correcto!', type: 'success' })
      }
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Casi. Inténtalo de nuevo.', type: 'error' })
    }
  }

  return (
    <>
      <ExerciseBlock
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed || done}
        score={score}
        footer={
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span>
              {Object.keys(matched).length} de {pairs.length} emparejados
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMatched({})
                setSelected(null)
                setErrors(0)
              }}
            >
              Reiniciar
            </Button>
          </span>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="label-caps text-ink-soft">1 · Elige un diálogo</p>
            {pairs.map((p, i) => {
              const isMatched = matched[p.id] != null
              const isActive = selected === p.id
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    nodes.current[`l-${p.id}`] = el
                  }}
                  disabled={isMatched}
                  onClick={() => setSelected(isActive ? null : p.id)}
                  className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-left
                    text-[0.92rem] font-semibold transition-colors
                    ${isMatched
                      ? 'border-sage-ink/45 bg-tip text-sage-ink'
                      : isActive
                        ? 'border-coral-ink bg-white text-coral-ink'
                        : 'border-navy/12 bg-white text-navy hover:border-coral-ink/55'}`}
                >
                  <span className="font-display text-[1.05rem] text-coral-ink">{i + 1}.</span>
                  {p.left}
                  {isMatched && <span className="ml-auto">✓</span>}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <p className="label-caps text-ink-soft">2 · Elige a quién corresponde</p>
            {rights.map((p) => {
              const isMatched = matched[p.id] != null
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    nodes.current[`r-${p.id}`] = el
                  }}
                  disabled={isMatched || !selected}
                  onClick={() => clickRight(p)}
                  className={`flex items-center gap-2.5 rounded-xl border bg-white p-2 text-left
                    transition-colors
                    ${isMatched
                      ? 'border-sage-ink/45 bg-tip'
                      : selected
                        ? 'border-navy/12 hover:border-coral-ink/55'
                        : 'border-navy/8 opacity-60'}`}
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <SmartImage
                      src={p.rightImage}
                      alt={p.rightLabel}
                      emoji={p.emoji ?? '🧑'}
                      rounded="rounded-lg"
                      compact
                    />
                  </span>
                  <span className="text-[0.84rem] leading-snug text-ink">{p.rightLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
