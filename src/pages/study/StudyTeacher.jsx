import { useSyncExternalStore } from 'react'
import { Check, Lock, Unlock } from 'lucide-react'

import { S } from '../../study/strings'
import { getStudyModules } from '../../study'
import { listUsers } from '../../services/authService'
import { readStudy, subscribeStudy, toggleManualUnlock } from '../../hooks/useStudyProgress'
import StudyShell from '../../components/study/StudyShell'

const BOOK = 'english-a1'

/**
 * /study/teacher — MODO PROFE (role: teacher). Lista de estudiantes con su
 * progreso y switches "Unlock manually" por tema.
 *
 * ⚠️ Con localStorage el profe solo ve el progreso de ESTE navegador (los
 * estudiantes que hayan entrado aquí). Con Cloudflare D1 será progreso real,
 * multi-dispositivo: `readStudy` / `toggleManualUnlock` pasarán a llamar a la
 * API con la misma firma.
 */
export default function StudyTeacher() {
  const students = listUsers().filter((u) => u.role === 'student')
  const modules = getStudyModules(BOOK).filter((m) => (m.topics ?? []).length > 0)

  /* Re-render cuando cambie cualquier progreso (los toggles escriben en el
     store; el snapshot es un contador de versión barato). */
  useSyncExternalStore(subscribeStudy, () => JSON.stringify(students.map((s) => readStudy(s.username))), () => '')

  return (
    <StudyShell bookId={BOOK} title={S.teacherTitle} subtitle={S.teacherSubtitle} intro="teacher">
      <p className="rounded-2xl bg-tip px-5 py-3 text-[0.85rem] text-ink">ℹ️ {S.teacherNote}</p>

      {modules.map((mod) => (
        <section key={mod.moduleId} className="mt-8">
          <p className="label-caps text-coral-ink">{S.module(mod.moduleId)}</p>
          <h2 className="mt-0.5">{mod.title}</h2>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-navy/10 bg-white shadow-soft">
            <table className="w-full min-w-[720px] border-collapse text-[0.88rem]">
              <thead>
                <tr className="bg-box text-left">
                  <th className="label-caps px-4 py-3 text-[0.66rem] text-sage-ink">{S.student}</th>
                  {mod.topics.map((t, i) => (
                    <th key={t.id} className="px-2 py-3 text-center" title={t.title}>
                      <span className="label-caps text-[0.66rem] text-navy">T{i + 1}</span>
                      <span className="block text-[0.7rem] font-normal text-ink-soft">{t.title}</span>
                    </th>
                  ))}
                  <th className="label-caps px-4 py-3 text-right text-[0.66rem] text-sage-ink">{S.lastActivity}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const st = readStudy(s.username)
                  const hasAny = Object.keys(st.passed).length > 0 || st.manualUnlocks.length > 0 || st.updatedAt
                  return (
                    <tr key={s.username} className="border-t border-navy/8">
                      <td className="px-4 py-3">
                        <span className="font-display text-[1rem] text-navy">{s.name ?? s.username}</span>
                        <span className="block text-[0.72rem] text-ink-soft">@{s.username}</span>
                        {!hasAny && <span className="block text-[0.7rem] italic text-ink-soft">{S.noProgress}</span>}
                      </td>
                      {mod.topics.map((t, i) => {
                        const score = st.passed[t.id]
                        const manual = st.manualUnlocks.includes(t.id)
                        const prevPassed = i === 0 || st.passed[mod.topics[i - 1].id] != null
                        const open = prevPassed || manual
                        return (
                          <td key={t.id} className="px-2 py-3 text-center align-top">
                            <span
                              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-white
                                ${score != null ? 'bg-sage-ink' : open ? 'bg-gold text-navy' : 'bg-[#cfc3a9]'}`}
                              title={score != null ? `${score}%` : open ? S.statusOpen : S.statusLocked}
                            >
                              {score != null ? <Check size={15} strokeWidth={3} /> : open ? <Unlock size={14} /> : <Lock size={14} />}
                            </span>
                            {score != null && <span className="mt-1 block text-[0.72rem] font-semibold text-sage-ink">{score}%</span>}
                            {i > 0 && score == null && (
                              <label className="mt-1.5 flex cursor-pointer items-center justify-center gap-1 text-[0.68rem] text-ink-soft">
                                <input
                                  type="checkbox"
                                  checked={manual}
                                  onChange={() => toggleManualUnlock(s.username, t.id)}
                                  className="accent-coral-ink"
                                  aria-label={`${S.unlockManually}: ${s.username} · ${t.title}`}
                                />
                                {S.unlockManually}
                              </label>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-right text-[0.78rem] text-ink-soft">
                        {st.updatedAt ?? '—'}
                        {st.arcadeBest > 0 && <span className="block">🎮 {st.arcadeBest}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </StudyShell>
  )
}
