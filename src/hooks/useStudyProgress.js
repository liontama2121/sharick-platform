import { useCallback, useSyncExternalStore } from 'react'

/**
 * Progreso de la Study Zone, POR USUARIO: localStorage `sharick-study-{username}`.
 *   { passed: { t1: 95 }, attempts: { t1: 2 }, manualUnlocks: ['t3'],
 *     arcadeBest: 0, updatedAt: 'YYYY-MM-DD' }
 * Store de módulo + useSyncExternalStore (sin Redux). El modo profe usa
 * `readStudy` / `writeStudy` / `toggleManualUnlock` para otros usuarios.
 *
 * Con Cloudflare D1 este módulo pasa a leer/escribir por API con la misma
 * interfaz; los componentes no cambian.
 */
const PREFIX = 'sharick-study-'
const listeners = new Set()
const cache = {}

export function emptyStudy() {
  return { passed: {}, attempts: {}, manualUnlocks: [], arcadeBest: 0, updatedAt: null }
}

export function readStudy(username) {
  if (!username) return EMPTY
  if (cache[username]) return cache[username]
  try {
    const raw = localStorage.getItem(PREFIX + username)
    cache[username] = raw ? { ...emptyStudy(), ...JSON.parse(raw) } : emptyStudy()
  } catch {
    cache[username] = emptyStudy()
  }
  return cache[username]
}

/* Snapshot estable para "sin usuario": useSyncExternalStore exige la misma
   referencia mientras nada cambie. */
const EMPTY = emptyStudy()

export function writeStudy(username, next) {
  if (!username) return
  const value = { ...next, updatedAt: new Date().toISOString().slice(0, 10) }
  cache[username] = value
  try {
    localStorage.setItem(PREFIX + username, JSON.stringify(value))
  } catch {
    /* modo privado / cuota llena: se mantiene en memoria */
  }
  listeners.forEach((l) => l())
}

export function subscribeStudy(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Hook reactivo del progreso del usuario con sesión. */
export function useStudyProgress(username) {
  const study = useSyncExternalStore(
    subscribeStudy,
    () => readStudy(username),
    () => EMPTY,
  )

  const update = useCallback(
    (mutate) => {
      const prev = readStudy(username)
      writeStudy(username, { ...prev, ...mutate(prev) })
    },
    [username],
  )

  /** Guarda el intento de quiz; conserva la mejor nota aprobada. */
  const recordQuiz = useCallback(
    (topicId, score, passScore) =>
      update((prev) => ({
        attempts: { ...prev.attempts, [topicId]: (prev.attempts[topicId] ?? 0) + 1 },
        passed:
          score >= passScore
            ? { ...prev.passed, [topicId]: Math.max(prev.passed[topicId] ?? 0, score) }
            : prev.passed,
      })),
    [update],
  )

  const recordArcade = useCallback(
    (score) => update((prev) => ({ arcadeBest: Math.max(prev.arcadeBest ?? 0, score) })),
    [update],
  )

  const isPassed = useCallback((topicId) => study.passed[topicId] != null, [study.passed])

  /**
   * Un tema está abierto si es el primero, si el anterior está aprobado o
   * si el profe lo desbloqueó a mano.
   */
  const isUnlocked = useCallback(
    (topics, index) => {
      const topic = topics[index]
      if (!topic) return false
      if (index === 0) return true
      if (study.manualUnlocks.includes(topic.id)) return true
      return study.passed[topics[index - 1].id] != null
    },
    [study.passed, study.manualUnlocks],
  )

  return { study, recordQuiz, recordArcade, isPassed, isUnlocked }
}

/** Alterna el desbloqueo manual de un tema para OTRO usuario (modo profe). */
export function toggleManualUnlock(username, topicId) {
  const prev = readStudy(username)
  const has = prev.manualUnlocks.includes(topicId)
  writeStudy(username, {
    ...prev,
    manualUnlocks: has
      ? prev.manualUnlocks.filter((t) => t !== topicId)
      : [...prev.manualUnlocks, topicId],
  })
}
