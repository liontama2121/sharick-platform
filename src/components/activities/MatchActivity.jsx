import { useMemo, useRef, useState } from 'react'
import ActivityShell from './ActivityShell'
import SmartImage from '../ui/ImagePlaceholder'
import FeedbackToast from '../ui/FeedbackToast'
import Button from '../ui/Button'
import { celebrate, shake } from '../../hooks/useFeedback'

const LINK_COLORS = ['#003DA5', '#CE1126', '#FFD100', '#2f9e5f']

/** Barajado determinista: mismo orden en cada render/recarga. */
function shuffleStable(list) {
  return [...list]
    .map((item, i) => ({ item, k: ((i + 1) * 2654435761) % 97 }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.item)
}

export default function MatchActivity({ section, activityId, completed, score, onComplete }) {
  const pairs = section.pairs ?? []
  const rights = useMemo(() => shuffleStable(pairs), [pairs])

  const [selected, setSelected] = useState(null) // id del lado izquierdo activo
  const [matched, setMatched] = useState({})     // { pairId: colorIndex }
  const [errors, setErrors] = useState(0)
  const [toast, setToast] = useState(null)
  const nodes = useRef({})

  const done = pairs.length > 0 && Object.keys(matched).length === pairs.length

  const finish = (nextMatched) => {
    const total = pairs.length
    const penalty = Math.min(errors * 10, 60)
    const finalScore = Math.max(40, 100 - penalty)
    setToast({ msg: `¡Muy bien! ${total}/${total} correctos`, type: 'success' })
    onComplete?.(finalScore, nextMatched)
  }

  const clickRight = (pair) => {
    if (!selected || matched[pair.id]) return
    const el = nodes.current[`r-${pair.id}`]

    if (selected === pair.id) {
      const next = { ...matched, [pair.id]: Object.keys(matched).length }
      setMatched(next)
      setSelected(null)
      celebrate(el)
      celebrate(nodes.current[`l-${pair.id}`])
      if (Object.keys(next).length === pairs.length) finish(next)
      else setToast({ msg: '¡Correcto!', type: 'success' })
    } else {
      setErrors((e) => e + 1)
      shake(el)
      setToast({ msg: 'Casi. Inténtalo de nuevo.', type: 'error' })
    }
  }

  const reset = () => {
    setMatched({})
    setSelected(null)
    setErrors(0)
  }

  return (
    <>
      <ActivityShell
        icon="🔗"
        title={section.title}
        instructions={section.instructions}
        completed={completed || done}
        score={score}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-ink/60">
              {Object.keys(matched).length} de {pairs.length} emparejados
            </span>
            <Button variant="ghost" size="sm" onClick={reset}>Reiniciar</Button>
          </div>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Columna izquierda: los diálogos */}
          <div className="flex flex-col gap-3">
            <p className="font-title text-sm font-semibold text-col-blue/70">1. Elige un diálogo</p>
            {pairs.map((p) => {
              const isMatched = matched[p.id] != null
              const isActive = selected === p.id
              return (
                <button
                  key={p.id}
                  ref={(el) => { nodes.current[`l-${p.id}`] = el }}
                  disabled={isMatched}
                  onClick={() => setSelected(isActive ? null : p.id)}
                  style={isMatched ? { borderColor: LINK_COLORS[matched[p.id] % LINK_COLORS.length] } : undefined}
                  className={`rounded-2xl border-2 bg-white px-4 py-3 text-left font-title font-semibold
                    shadow-soft transition-colors
                    ${isMatched ? 'opacity-70' : isActive ? 'border-col-blue bg-col-blue/5' : 'border-col-blue/12 hover:border-col-blue/40'}`}
                >
                  <span className="mr-2 text-lg" aria-hidden="true">{isMatched ? '✅' : '💬'}</span>
                  {p.left}
                </button>
              )
            })}
          </div>

          {/* Columna derecha: las personas / escenas */}
          <div className="flex flex-col gap-3">
            <p className="font-title text-sm font-semibold text-col-blue/70">2. Elige a quién corresponde</p>
            {rights.map((p) => {
              const isMatched = matched[p.id] != null
              return (
                <button
                  key={p.id}
                  ref={(el) => { nodes.current[`r-${p.id}`] = el }}
                  disabled={isMatched || !selected}
                  onClick={() => clickRight(p)}
                  style={isMatched ? { borderColor: LINK_COLORS[matched[p.id] % LINK_COLORS.length] } : undefined}
                  className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-2.5 text-left
                    shadow-soft transition-colors
                    ${isMatched ? 'opacity-70' : selected ? 'border-col-blue/12 hover:border-col-red' : 'border-col-blue/8 opacity-60'}`}
                >
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <SmartImage
                      src={p.rightImage}
                      alt={p.rightLabel}
                      emoji={p.emoji ?? '🧑'}
                      rounded="rounded-xl"
                    />
                  </span>
                  <span className="font-title text-sm font-semibold leading-snug">{p.rightLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      </ActivityShell>

      <FeedbackToast
        message={toast?.msg}
        type={toast?.type}
        onHide={() => setToast(null)}
      />
    </>
  )
}
