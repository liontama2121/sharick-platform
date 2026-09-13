import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BookOpen, PenLine, Trophy } from 'lucide-react'

import { S } from '../../study/strings'
import { findStudyTopic } from '../../study'
import { useSession } from '../../hooks/useSession'
import { useStudyProgress } from '../../hooks/useStudyProgress'
import StudyShell from '../../components/study/StudyShell'
import StudyExercise from '../../components/study/StudyExercise'
import Button from '../../components/ui/Button'
import SunBurst from '../../components/decor/SunBurst'
import { BUBBLE_COLORS } from '../../components/page/DialogueBubble'

const TABS = [
  { id: 'learn', label: S.tabLearn, Icon: BookOpen },
  { id: 'practice', label: S.tabPractice, Icon: PenLine },
  { id: 'quiz', label: S.tabQuiz, Icon: Trophy },
]

/* ── Bloques de la pestaña Learn ─────────────────────────────────────── */

function LearnBlock({ block }) {
  if (block.type === 'text') {
    return <p className="text-[1.02rem] leading-relaxed text-ink">{block.text}</p>
  }

  if (block.type === 'phrases') {
    return (
      <div className="rounded-2xl bg-box p-5">
        <p className="label-caps text-sage-ink">{block.title ?? S.keyPhrases}</p>
        <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex flex-col border-b border-dotted border-[#d9cdb5] pb-1.5">
              <span className="font-display text-[1.05rem] text-navy">{it.en}</span>
              <span className="text-[0.85rem] text-ink-soft">
                {it.es}
                {it.note && <span className="ml-1.5 italic text-sage-ink">· {it.note}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (block.type === 'dialogue') {
    const color = BUBBLE_COLORS[block.letter] ?? BUBBLE_COLORS.A
    return (
      <div className="relative pl-9">
        <span className="absolute left-0 top-0 font-display text-[2rem] leading-none" style={{ color: color.bg }}>
          {block.letter}
        </span>
        <div className="rounded-[18px] px-5 py-4 shadow-soft" style={{ background: color.bg, color: color.ink }}>
          {block.title && <p className="mb-2 label-caps text-[0.66rem] opacity-90">{block.title}</p>}
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {block.lines.map((l, i) => (
              <span key={i} className="contents">
                <span className="text-right text-[1rem] font-semibold">{l.speaker}:</span>
                <span className="text-[1rem]">{l.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (block.type === 'tip') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-tip p-5 pr-16">
        <SunBurst size={64} className="absolute -right-2 -top-2 opacity-60" />
        <p className="label-caps text-sage-ink">{block.title ?? 'Tip'}</p>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink">{block.text}</p>
      </div>
    )
  }
  return null
}

/** /study/:bookId/:topicId — Learn · Practice · Final Quiz. */
export default function StudyTopic() {
  const { bookId, topicId } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const session = useSession()
  const { study, isPassed, isUnlocked } = useStudyProgress(session?.username)
  const [done, setDone] = useState({})

  const found = findStudyTopic(bookId, topicId)
  if (!found) return <Navigate to={`/study/${bookId}`} replace />
  const { topic, index, module: mod } = found
  const topics = mod.topics

  // Tema bloqueado → de vuelta al mapa
  if (!isUnlocked(topics, index)) return <Navigate to={`/study/${bookId}`} replace />

  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'learn'
  const setTab = (id) => setParams({ tab: id }, { replace: true })

  const exercises = topic.exercises ?? []
  const doneCount = Object.keys(done).length
  const passed = isPassed(topic.id)
  const next = topics[index + 1]

  return (
    <StudyShell bookId={bookId} title={topic.title} subtitle={topic.summary} intro={`topic-${topic.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={() => navigate(`/study/${bookId}`)} className="text-[0.88rem] font-semibold text-navy hover:text-coral-ink">
          {S.backToMap}
        </button>
        <p className="label-caps text-coral-ink">
          {S.module(mod.moduleId)} · Topic {index + 1} of {topics.length}
          {passed && <span className="ml-2 text-sage-ink">✓ {S.topicPassed(study.passed[topic.id])}</span>}
        </p>
      </div>

      {/* Tabs */}
      <div role="tablist" className="mt-5 flex gap-2 border-b-2 border-dotted border-[#d9cdb5]">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-[2px] flex items-center gap-2 rounded-t-xl border-b-[3px] px-4 py-2.5 font-body text-[0.92rem] font-bold transition-colors
              ${tab === id ? 'border-coral-ink text-coral-ink' : 'border-transparent text-ink-soft hover:text-navy'}`}
          >
            <Icon size={17} strokeWidth={2.4} />
            {label}
            {id === 'practice' && exercises.length > 0 && (
              <span className="rounded-full bg-box px-2 py-0.5 text-[0.7rem] text-ink-soft">
                {doneCount}/{exercises.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'learn' && (
        <div className="mt-6 flex max-w-3xl flex-col gap-5">
          {(topic.learn ?? []).map((b, i) => (
            <LearnBlock key={i} block={b} />
          ))}
          <div className="mt-2">
            <Button onClick={() => setTab('practice')}>{S.tabPractice} →</Button>
          </div>
        </div>
      )}

      {tab === 'practice' && (
        <div className="mt-6 max-w-3xl">
          <p className="text-[0.9rem] text-ink-soft">
            {S.practiceIntro} · <span className="font-semibold">{S.practiceDone(doneCount, exercises.length)}</span>
          </p>
          <ol className="mt-4 flex flex-col gap-4">
            {exercises.map((ex, i) => (
              <StudyExercise
                key={i}
                exercise={ex}
                number={i + 1}
                done={!!done[i]}
                onDone={() => setDone((d) => ({ ...d, [i]: true }))}
              />
            ))}
          </ol>
          <div className="mt-6">
            <Button variant="navy" onClick={() => setTab('quiz')}>
              {S.tabQuiz} →
            </Button>
          </div>
        </div>
      )}

      {tab === 'quiz' && (
        <div className="mt-6 max-w-2xl rounded-2xl border border-navy/10 bg-white p-7 text-center shadow-soft">
          <Trophy size={40} strokeWidth={2} className="mx-auto text-gold" />
          <h2 className="mt-3">{S.tabQuiz}</h2>
          <p className="mt-2 text-[0.95rem] text-ink-soft">
            {S.quizIntro(topic.quiz?.questions?.length ?? 0, topic.quiz?.passScore ?? 80)}
          </p>
          <p className="mt-1 text-[0.85rem] italic text-ink-soft">{S.quizNoFeedback}</p>
          {passed && (
            <p className="mt-3 font-semibold text-sage-ink">✓ {S.topicPassed(study.passed[topic.id])}</p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button size="lg" onClick={() => navigate(`/study/${bookId}/${topic.id}/quiz`)}>
              {passed ? S.retakeQuiz : S.startQuiz}
            </Button>
            {passed && next && (
              <Button size="lg" variant="sage" onClick={() => navigate(`/study/${bookId}/${next.id}`)}>
                {S.nextTopic}
              </Button>
            )}
          </div>
        </div>
      )}
    </StudyShell>
  )
}
