import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate } from 'animejs'
import { Timer, Trophy } from 'lucide-react'

import { S } from '../../study/strings'
import { getStudyModules, shuffle, topicQuestionPool } from '../../study'
import { useSession } from '../../hooks/useSession'
import { useStudyProgress } from '../../hooks/useStudyProgress'
import { celebrate, shake } from '../../hooks/useFeedback'
import StudyShell from '../../components/study/StudyShell'
import Button from '../../components/ui/Button'

const LETTERS = ['a', 'b', 'c', 'd']
const TOTAL = 15
const SECONDS = 20
const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * /study/:bookId/arcade — simulacro: 15 preguntas al azar de los temas
 * DESBLOQUEADOS, 20 s por pregunta con barra animada, puntaje y récord
 * por usuario.
 */
export default function StudyArcade() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const { study, recordArcade, isUnlocked } = useStudyProgress(session?.username)

  /* Temas desbloqueados de todos los módulos con contenido. */
  const unlockedTopics = useMemo(() => {
    const out = []
    getStudyModules(bookId).forEach((mod) => {
      const topics = mod.topics ?? []
      topics.forEach((t, i) => {
        if (isUnlocked(topics, i)) out.push(t)
      })
    })
    return out
  }, [bookId, isUnlocked])

  const [phase, setPhase] = useState('intro') // intro · play · done
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState(null)
  const [isRecord, setIsRecord] = useState(false)

  const barRef = useRef(null)
  const timerRef = useRef(null)
  const optionRefs = useRef({})
  const reportedRef = useRef(false)
  const bestBefore = useRef(study.arcadeBest ?? 0)

  const start = () => {
    const pool = shuffle(unlockedTopics.flatMap(topicQuestionPool))
    const qs = pool.slice(0, TOTAL).map((q) => ({
      ...q,
      options: shuffle(q.options.map((text, i) => ({ text, ok: i === q.correct }))),
    }))
    bestBefore.current = study.arcadeBest ?? 0
    reportedRef.current = false
    setQuestions(qs)
    setIndex(0)
    setCorrect(0)
    setPicked(null)
    setIsRecord(false)
    setPhase('play')
  }

  const stopTimer = () => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const next = useCallback(() => {
    setPicked(null)
    setIndex((i) => i + 1)
  }, [])

  const question = questions[index]

  // Barra de tiempo y salto automático al agotarse
  useEffect(() => {
    if (phase !== 'play' || !question) return
    const bar = barRef.current
    if (bar) {
      bar.style.width = '100%'
      animate(bar, { width: '0%', duration: SECONDS * 1000, ease: 'linear' })
    }
    timerRef.current = setTimeout(() => {
      setPicked({ option: -1, ok: false })
      setTimeout(next, 700)
    }, SECONDS * 1000)
    return stopTimer
  }, [phase, index, question, next])

  // Fin de partida
  useEffect(() => {
    if (phase !== 'play' || questions.length === 0 || index < questions.length) return
    if (reportedRef.current) return
    reportedRef.current = true
    const score = Math.round((correct / questions.length) * 100)
    setIsRecord(score > bestBefore.current)
    recordArcade(score)
    setPhase('done')
  }, [phase, index, questions.length, correct, recordArcade])

  const pick = (oi) => {
    if (picked) return
    stopTimer()
    const ok = question.options[oi].ok
    setPicked({ option: oi, ok })
    if (ok) {
      setCorrect((c) => c + 1)
      celebrate(optionRefs.current[oi])
    } else {
      shake(optionRefs.current[oi])
    }
    setTimeout(next, 800)
  }

  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0

  return (
    <StudyShell bookId={bookId} title={S.arcadeTitle} subtitle={S.arcadeSubtitle(TOTAL, SECONDS)} intro="arcade">
      {phase === 'intro' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-soft">
          <Timer size={44} strokeWidth={2} className="mx-auto text-coral-ink" />
          <h2 className="mt-3">{S.arcadeTitle}</h2>
          <p className="mt-2 text-[0.95rem] text-ink-soft">
            {unlockedTopics.length > 0 ? S.arcadeHint : S.arcadeNoTopics}
          </p>
          {unlockedTopics.length > 0 && (
            <p className="mt-1 text-[0.85rem] text-ink-soft">
              {unlockedTopics.map((t) => t.title).join(' · ')}
            </p>
          )}
          {study.arcadeBest > 0 && (
            <p className="mt-3 font-semibold text-navy">
              🏆 {S.arcadeBest}: {study.arcadeBest}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={start} disabled={unlockedTopics.length === 0}>
              {S.arcadeStart}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate(`/study/${bookId}`)}>
              {S.backToMap}
            </Button>
          </div>
        </div>
      )}

      {phase === 'play' && question && (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <p className="label-caps text-coral-ink">{S.question(index + 1, questions.length)}</p>
            <p className="label-caps text-sage-ink">
              {S.arcadeScore}: {correct}
            </p>
          </div>
          {/* Barra de tiempo */}
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-navy/10">
            <div ref={barRef} className="h-full rounded-full bg-gold" style={{ width: '100%' }} />
          </div>

          <div className="mt-6 rounded-2xl border border-navy/10 bg-white p-7 shadow-soft">
            <p className="font-display text-[1.35rem] text-navy">{question.q}</p>
            <div className="mt-5 flex flex-col gap-2.5">
              {question.options.map((opt, oi) => {
                const chosen = picked?.option === oi
                return (
                  <button
                    key={oi}
                    type="button"
                    ref={(el) => {
                      optionRefs.current[oi] = el
                    }}
                    disabled={!!picked}
                    onClick={() => pick(oi)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[1rem] transition-colors
                      ${chosen && picked.ok ? 'border-sage-ink bg-tip' : ''}
                      ${chosen && !picked.ok ? 'border-coral-ink bg-[#fbeae6]' : ''}
                      ${picked && !chosen && opt.ok ? 'border-sage-ink/60' : ''}
                      ${!chosen ? 'border-navy/12 bg-white hover:border-coral-ink/55' : ''}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy/15 font-display text-[0.85rem] text-coral-ink">
                      {LETTERS[oi]}
                    </span>
                    {opt.text}
                  </button>
                )
              })}
            </div>
            {picked?.option === -1 && <p className="mt-4 font-semibold text-coral-ink">⏰ {S.arcadeTimeUp}</p>}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-navy/10 bg-white p-8 text-center shadow-lift">
          <Trophy size={44} strokeWidth={2} className="mx-auto text-gold" />
          <p className="mt-3 label-caps text-sage-ink">{S.arcadeScore}</p>
          <p className="font-display text-[3.2rem] font-extrabold leading-none text-navy">{score}</p>
          <p className="mt-1 text-[0.9rem] text-ink-soft">{S.score(correct, questions.length)}</p>
          {isRecord ? (
            <p className="mt-3 font-display text-[1.2rem] text-coral-ink">{S.newRecord}</p>
          ) : (
            <p className="mt-3 text-[0.9rem] text-ink-soft">
              🏆 {S.arcadeBest}: {study.arcadeBest}
            </p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={start}>
              {S.playAgain}
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate(`/study/${bookId}`)}>
              {S.backToMap}
            </Button>
          </div>
        </div>
      )}
    </StudyShell>
  )
}
