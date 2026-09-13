import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Check, Lock, Unlock } from 'lucide-react'

import { S } from '../../study/strings'
import { getDefaultStudyModule, getStudyModule, getStudyModules } from '../../study'
import { useSession } from '../../hooks/useSession'
import { useStudyProgress } from '../../hooks/useStudyProgress'
import StudyShell from '../../components/study/StudyShell'
import Button from '../../components/ui/Button'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Tarjeta de un tema en el camino: ✅ aprobado · 🔓 disponible · 🔒 bloqueado. */
function TopicCard({ topic, index, status, score, manual, prevTitle, onOpen }) {
  const locked = status === 'locked'
  const passed = status === 'passed'

  return (
    <li className="relative flex gap-4">
      {/* Camino: círculo numerado + línea vertical */}
      <div className="flex w-12 shrink-0 flex-col items-center">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white
            font-display text-[1.15rem] font-extrabold shadow-lift
            ${passed ? 'bg-sage-ink text-white' : locked ? 'bg-[#cfc3a9] text-white' : 'bg-coral-ink text-white'}`}
        >
          {passed ? <Check size={22} strokeWidth={3} /> : locked ? <Lock size={18} strokeWidth={2.6} /> : index + 1}
        </span>
        <span aria-hidden="true" className="mt-1 w-0 flex-1 border-l-2 border-dotted border-[#d9cdb5]" />
      </div>

      <div
        data-card
        role={locked ? undefined : 'button'}
        tabIndex={locked ? -1 : 0}
        aria-disabled={locked}
        title={locked ? S.lockedTooltip(prevTitle) : undefined}
        onClick={() => !locked && onOpen(topic)}
        onKeyDown={(e) => {
          if (!locked && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onOpen(topic)
          }
        }}
        className={`group mb-5 flex-1 rounded-2xl border bg-white p-5 shadow-soft transition-[box-shadow,transform]
          ${locked
            ? 'cursor-not-allowed border-navy/8 opacity-70'
            : 'cursor-pointer border-navy/10 hover:-translate-y-0.5 hover:shadow-lift'}
          ${passed ? 'border-sage-ink/40' : ''}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps text-coral-ink">Topic {index + 1}</p>
            <h3 className="mt-0.5 font-display text-[1.25rem] text-navy">{topic.title}</h3>
            <p className="mt-1 text-[0.9rem] text-ink-soft">{topic.summary}</p>
          </div>
          <span
            className={`label-caps shrink-0 rounded-full px-3 py-1 text-[0.66rem]
              ${passed ? 'bg-tip text-sage-ink' : locked ? 'bg-box text-ink-soft' : 'bg-gold/25 text-navy'}`}
          >
            {passed ? S.statusPassed : locked ? S.statusLocked : S.statusOpen}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] font-semibold text-ink-soft">
          <span>📚 Learn · ✏️ {topic.exercises?.length ?? 0} exercises · 🏆 {topic.quiz?.questions?.length ?? 0} questions</span>
          {passed && <span className="text-sage-ink">{S.bestScore(score)}</span>}
          {manual && !passed && (
            <span className="flex items-center gap-1 text-navy">
              <Unlock size={13} /> {S.manualUnlock}
            </span>
          )}
          {locked && <span className="text-coral-ink">🔒 {S.lockedTooltip(prevTitle)}</span>}
        </div>
      </div>
    </li>
  )
}

/** /study/:bookId — mapa de temas con progresión bloqueada. */
export default function StudyMap() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const session = useSession()
  const { study, isPassed, isUnlocked } = useStudyProgress(session?.username)

  const modules = getStudyModules(bookId)
  const [moduleId, setModuleId] = useState(() => getDefaultStudyModule(bookId)?.moduleId ?? 1)
  const mod = getStudyModule(bookId, moduleId)
  const topics = mod?.topics ?? []
  const listRef = useRef(null)

  const passedCount = topics.filter((t) => isPassed(t.id)).length
  const mastered = topics.length > 0 && passedCount === topics.length
  const anyUnlockedPassed = passedCount > 0

  useEffect(() => {
    const cards = listRef.current?.querySelectorAll('[data-card]')
    if (!cards?.length || reduced()) return
    cards.forEach((c) => {
      c.style.opacity = '0'
    })
    animate(cards, { opacity: [0, 1], translateY: [14, 0], duration: 420, ease: 'outQuad', delay: stagger(60) })
  }, [moduleId])

  const pct = topics.length ? (passedCount / topics.length) * 100 : 0

  return (
    <StudyShell bookId={bookId} title={S.mapTitle} subtitle={S.mapSubtitle} intro={`map-${bookId}`}>
      {/* Selector de módulo */}
      <div className="flex flex-wrap items-center gap-2">
        {modules.map((m) => {
          const empty = (m.topics ?? []).length === 0
          const active = m.moduleId === moduleId
          return (
            <button
              key={m.moduleId}
              type="button"
              disabled={empty}
              onClick={() => setModuleId(m.moduleId)}
              title={empty ? S.comingSoon : m.title}
              className={`rounded-full border px-4 py-1.5 font-body text-[0.85rem] font-bold transition-colors
                ${active ? 'border-coral-ink bg-coral-ink text-white' : 'border-navy/15 bg-white text-navy hover:border-coral-ink/60'}
                disabled:cursor-not-allowed disabled:opacity-45`}
            >
              {S.module(m.moduleId)}
              {empty && <span className="ml-1.5 font-normal opacity-80">· {S.comingSoon}</span>}
            </button>
          )
        })}
      </div>

      {/* Cabecera del módulo + progreso + arcade */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps text-coral-ink">{S.module(moduleId)}</p>
          <h2 className="mt-0.5">{mod?.title}</h2>
          <div className="mt-3 w-72 max-w-full">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-sage-ink transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-[0.8rem] font-semibold text-ink-soft">{S.progress(passedCount, topics.length)}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Button variant="navy" onClick={() => navigate(`/study/${bookId}/arcade`)} disabled={!anyUnlockedPassed && topics.length > 0}>
            {S.arcade}
          </Button>
          <span className="text-[0.75rem] text-ink-soft">
            {anyUnlockedPassed ? S.arcadeHint : S.arcadeNoTopics}
            {study.arcadeBest > 0 && ` · ${S.arcadeBest}: ${study.arcadeBest}`}
          </span>
        </div>
      </div>

      {mastered && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-navy px-6 py-5 text-white shadow-lift">
          <div>
            <p className="font-display text-[1.4rem] text-gold">{S.moduleMastered(moduleId)}</p>
            <p className="text-[0.9rem] text-white/80">{S.moduleMasteredHint}</p>
          </div>
          <Button onClick={() => navigate(`/book/${bookId}/module/${moduleId}/games`)}>{S.goToGames}</Button>
        </div>
      )}

      {/* Camino de temas */}
      {topics.length > 0 ? (
        <ol ref={listRef} className="mt-8 flex flex-col">
          {topics.map((t, i) => {
            const passed = isPassed(t.id)
            const unlocked = isUnlocked(topics, i)
            return (
              <TopicCard
                key={t.id}
                topic={t}
                index={i}
                status={passed ? 'passed' : unlocked ? 'open' : 'locked'}
                score={study.passed[t.id]}
                manual={study.manualUnlocks.includes(t.id)}
                prevTitle={topics[i - 1]?.title}
                onOpen={(topic) => navigate(`/study/${bookId}/${topic.id}`)}
              />
            )
          })}
        </ol>
      ) : (
        <p className="mt-10 text-center font-display text-[1.2rem] text-ink-soft">{S.comingSoon}</p>
      )}
    </StudyShell>
  )
}
