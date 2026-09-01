import { useCallback, useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import GameResult from './GameResult'
import { celebrate, shake } from '../../hooks/useFeedback'

const LETTERS = ['a', 'b', 'c', 'd']

/**
 * Quiz contrarreloj: una pregunta a la vez con barra de tiempo.
 * Si se acaba el tiempo la pregunta se da por fallada y pasa a la siguiente.
 */
export default function QuickQuiz({ game, onFinish, onExit }) {
  const questions = game.data?.questions ?? []
  const limit = game.data?.seconds ?? 15

  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState(null)
  const [finished, setFinished] = useState(false)

  // Mismo motivo que en Memory: el guard va en ref para no re-entrar.
  const reportedRef = useRef(false)
  const barRef = useRef(null)
  const timerRef = useRef(null)
  const optionRefs = useRef({})

  const question = questions[index]
  const stars = correct >= questions.length * 0.9 ? 3 : correct >= questions.length * 0.7 ? 2 : 1

  const stopTimer = () => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const next = useCallback(() => {
    setPicked(null)
    setIndex((i) => i + 1)
  }, [])

  // Barra de tiempo y salto automático al agotarse
  useEffect(() => {
    if (finished || !question) return
    const bar = barRef.current
    if (bar) {
      bar.style.width = '100%'
      animate(bar, { width: '0%', duration: limit * 1000, ease: 'linear' })
    }
    timerRef.current = setTimeout(() => {
      setPicked({ option: -1, ok: false })
      setTimeout(() => next(), 700)
    }, limit * 1000)

    return stopTimer
  }, [index, finished, question, limit, next])

  // Fin del quiz
  useEffect(() => {
    if (reportedRef.current || questions.length === 0 || index < questions.length) return
    reportedRef.current = true
    setFinished(true)
    const score = Math.round((correct / questions.length) * 100)
    onFinish?.({ score, stars })
  }, [index, questions.length, correct, stars, onFinish])

  const pick = (option) => {
    if (picked) return
    stopTimer()
    const ok = option === question.correct
    setPicked({ option, ok })
    if (ok) {
      setCorrect((c) => c + 1)
      celebrate(optionRefs.current[option])
    } else {
      shake(optionRefs.current[option])
    }
    setTimeout(() => next(), 800)
  }

  const replay = () => {
    stopTimer()
    setIndex(0)
    setCorrect(0)
    setPicked(null)
    setFinished(false)
    reportedRef.current = false
  }

  if (!question && !finished) return null

  return (
    <>
      {question && (
        <div className="box-beige p-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="label-caps text-sage-ink">
              Pregunta {index + 1} de {questions.length}
            </p>
            <p className="label-caps text-coral-ink">Aciertos: {correct}</p>
          </div>

          <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
            <div ref={barRef} className="h-full rounded-full bg-coral-ink" style={{ width: '100%' }} />
          </div>

          <p className="mb-4 font-display text-[1.15rem] text-navy">{question.q}</p>

          <div className="flex flex-col gap-2">
            {question.options.map((opt, i) => {
              const chosen = picked?.option === i
              const isRight = picked && i === question.correct
              const isWrong = chosen && !picked.ok
              return (
                <button
                  key={i}
                  ref={(el) => {
                    optionRefs.current[i] = el
                  }}
                  disabled={!!picked}
                  onClick={() => pick(i)}
                  className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left
                    text-[0.95rem] transition-colors
                    ${isRight ? 'border-sage-ink/60 bg-tip' : ''}
                    ${isWrong ? 'border-coral-ink' : ''}
                    ${!chosen && !isRight ? 'border-navy/12 hover:border-coral-ink/55' : ''}`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                      border border-navy/15 font-display text-[0.85rem] text-coral-ink"
                  >
                    {LETTERS[i]}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>

          {picked?.option === -1 && (
            <p className="mt-3 text-[0.85rem] text-coral-ink">¡Se acabó el tiempo!</p>
          )}
        </div>
      )}

      {finished && (
        <GameResult
          detail={`${correct} de ${questions.length} correctas`}
          stars={stars}
          onReplay={replay}
          onExit={onExit}
        />
      )}
    </>
  )
}
