import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Check, X } from 'lucide-react'

import { S } from '../../study/strings'
import { findStudyTopic, shuffle } from '../../study'
import { useSession } from '../../hooks/useSession'
import { useStudyProgress } from '../../hooks/useStudyProgress'
import StudyShell from '../../components/study/StudyShell'
import Button from '../../components/ui/Button'

const LETTERS = ['a', 'b', 'c', 'd']
const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Confeti de la paleta sobre la tarjeta de resultado (solo al aprobar). */
function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    animate(el.querySelectorAll('span'), {
      translateY: [-20, 140],
      translateX: () => Math.random() * 80 - 40,
      rotate: () => Math.random() * 360,
      opacity: [1, 0],
      duration: 1400,
      ease: 'outQuad',
      delay: stagger(40),
    })
  }, [])
  const colors = ['#E05A47', '#6B9080', '#E9B44C', '#1B3A5C']
  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-2">
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i % 4] }} />
      ))}
    </div>
  )
}

/** /study/:bookId/:topicId/quiz — una pregunta a la vez, sin feedback hasta el final. */
export default function StudyQuiz() {
  const { bookId, topicId } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const { recordQuiz, isUnlocked } = useStudyProgress(session?.username)

  const found = findStudyTopic(bookId, topicId)
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([]) // índice elegido por pregunta
  const [picked, setPicked] = useState(null)
  const reportedRef = useRef(false)
  const cardRef = useRef(null)

  /* Preguntas barajadas (y opciones barajadas) en cada intento. */
  const questions = useMemo(() => {
    if (!found) return []
    return shuffle(found.topic.quiz?.questions ?? []).map((q) => {
      const opts = shuffle(q.options.map((text, i) => ({ text, ok: i === q.correct })))
      return { q: q.q, options: opts }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found?.topic.id, round])

  useEffect(() => {
    const el = cardRef.current
    if (!el || reduced()) return
    animate(el, { opacity: [0, 1], translateX: [40, 0], duration: 320, ease: 'outQuad' })
  }, [index, round])

  /* Al terminar se guarda UNA vez por intento (el guard va en ref, como en
     los juegos: el store notifica en síncrono). */
  const total = questions.length
  const finishedNow = total > 0 && index >= total
  useEffect(() => {
    if (!finishedNow || reportedRef.current || !found) return
    reportedRef.current = true
    const ok = answers.filter((a, i) => questions[i]?.options[a]?.ok).length
    recordQuiz(found.topic.id, Math.round((ok / total) * 100), found.topic.quiz?.passScore ?? 80)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedNow])

  if (!found) return <Navigate to={`/study/${bookId}`} replace />
  const { topic, index: topicIndex, module: mod } = found
  const topics = mod.topics
  if (!isUnlocked(topics, topicIndex)) return <Navigate to={`/study/${bookId}`} replace />

  const passScore = topic.quiz?.passScore ?? 80
  const finished = index >= questions.length && questions.length > 0
  const right = answers.filter((a, i) => questions[i]?.options[a]?.ok).length
  const score = questions.length ? Math.round((right / questions.length) * 100) : 0
  const passed = score >= passScore
  const next = topics[topicIndex + 1]

  const confirm = () => {
    if (picked == null) return
    setAnswers((a) => [...a, picked])
    setPicked(null)
    setIndex((i) => i + 1)
  }

  const retry = () => {
    reportedRef.current = false
    setAnswers([])
    setPicked(null)
    setIndex(0)
    setRound((r) => r + 1)
  }

  const question = questions[index]

  return (
    <StudyShell bookId={bookId} title={`${S.tabQuiz} · ${topic.title}`} intro={`quiz-${topic.id}`}>
      {!finished && question && (
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between">
            <p className="label-caps text-coral-ink">{S.question(index + 1, questions.length)}</p>
            <p className="text-[0.8rem] text-ink-soft">{S.quizNoFeedback}</p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
            <div className="h-full rounded-full bg-coral-ink transition-[width] duration-500" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>

          <div ref={cardRef} className="mt-6 rounded-2xl border border-navy/10 bg-white p-7 shadow-soft">
            <p className="font-display text-[1.35rem] text-navy">{question.q}</p>
            <div className="mt-5 flex flex-col gap-2.5">
              {question.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setPicked(oi)}
                  aria-pressed={picked === oi}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[1rem] transition-colors
                    ${picked === oi ? 'border-coral-ink bg-coral-ink/8 ring-2 ring-coral-ink/40' : 'border-navy/12 bg-white hover:border-coral-ink/55'}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-navy/15 font-display text-[0.85rem] text-coral-ink">
                    {LETTERS[oi]}
                  </span>
                  {opt.text}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={confirm} disabled={picked == null}>
                {index + 1 === questions.length ? S.finish : S.next}
              </Button>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="relative mx-auto max-w-2xl">
          {passed && <Confetti />}
          <div className="rounded-2xl border border-navy/10 bg-white p-7 text-center shadow-lift">
            <p className="label-caps text-sage-ink">{S.quizResult}</p>
            <p className={`mt-2 font-display text-[3.2rem] font-extrabold leading-none ${passed ? 'text-sage-ink' : 'text-coral-ink'}`}>
              {score}%
            </p>
            <p className="mt-1 text-[0.9rem] text-ink-soft">{S.score(right, questions.length)}</p>
            <h2 className="mt-4">{passed ? S.quizPassed : S.quizFailed}</h2>
            {passed && next && (
              <p className="mt-2 inline-block rounded-full bg-gold/25 px-4 py-1.5 font-semibold text-navy">
                🔓 {S.topicUnlocked(next.title)}
              </p>
            )}
            {passed && !next && (
              <p className="mt-2 inline-block rounded-full bg-gold/25 px-4 py-1.5 font-semibold text-navy">
                {S.moduleMastered(mod.moduleId)}
              </p>
            )}
            {!passed && <p className="mt-2 text-[0.9rem] text-ink-soft">{S.quizFailedHint(passScore)}</p>}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {!passed && <Button size="lg" onClick={retry}>{S.retakeQuiz}</Button>}
              {passed && next && (
                <Button size="lg" variant="sage" onClick={() => navigate(`/study/${bookId}/${next.id}`)}>
                  {S.nextTopic}
                </Button>
              )}
              {passed && !next && (
                <Button size="lg" onClick={() => navigate(`/book/${bookId}/module/${mod.moduleId}/games`)}>
                  {S.goToGames}
                </Button>
              )}
              <Button size="lg" variant="ghost" onClick={() => navigate(`/study/${bookId}`)}>
                {S.backToMap}
              </Button>
            </div>
          </div>

          {/* Revisión de respuestas, ya con feedback */}
          <div className="mt-6 rounded-2xl bg-box p-5">
            <p className="label-caps text-sage-ink">{S.yourAnswers}</p>
            <ol className="mt-3 flex flex-col gap-2.5">
              {questions.map((q, i) => {
                const a = q.options[answers[i]]
                const ok = a?.ok
                const correctText = q.options.find((o) => o.ok)?.text
                return (
                  <li key={i} className="flex items-start gap-3 text-[0.9rem]">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white ${ok ? 'bg-sage-ink' : 'bg-coral-ink'}`}>
                      {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="font-semibold text-navy">{q.q}</span>
                      <br />
                      <span className={ok ? 'text-sage-ink' : 'text-coral-ink line-through'}>{a?.text}</span>
                      {!ok && <span className="ml-2 text-sage-ink">→ {correctText}</span>}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      )}
    </StudyShell>
  )
}
