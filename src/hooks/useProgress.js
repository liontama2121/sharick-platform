import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sharick-progress'

/* ── Store mínimo compartido ────────────────────────────────────────────
   Sin Redux (prohibido por CLAUDE.md). Un store de módulo + useSyncExternalStore
   basta para que el ProgressBar del sidebar reaccione cuando una actividad
   se completa dentro del contenido principal.                            */

const listeners = new Set()

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

let snapshot = read()

function write(next) {
  snapshot = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* modo privado / cuota llena: el progreso se mantiene solo en memoria */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

function emptyBook() {
  return { currentPage: null, completedActivities: [], scores: {}, games: {}, lastVisit: null }
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Progreso del estudiante para un libro, persistido en localStorage.
 * @param {string} bookId  p.ej. "english-a1"
 */
export function useProgress(bookId) {
  const all = useSyncExternalStore(subscribe, getSnapshot, () => ({}))
  const book = all[bookId] ?? emptyBook()

  const update = useCallback(
    (mutate) => {
      const current = getSnapshot()
      const prev = current[bookId] ?? emptyBook()
      const next = { ...prev, ...mutate(prev), lastVisit: today() }
      write({ ...current, [bookId]: next })
    },
    [bookId],
  )

  const completeActivity = useCallback(
    (activityId, score = 100) =>
      update((prev) => ({
        completedActivities: prev.completedActivities.includes(activityId)
          ? prev.completedActivities
          : [...prev.completedActivities, activityId],
        // se conserva el mejor puntaje obtenido
        scores: { ...prev.scores, [activityId]: Math.max(prev.scores[activityId] ?? 0, score) },
      })),
    [update],
  )

  const setCurrentPage = useCallback(
    (pageId) => update(() => ({ currentPage: pageId })),
    [update],
  )

  /**
   * Resultado de una partida del hub de juegos.
   * Se conserva el mejor puntaje y las mejores estrellas.
   */
  const recordGame = useCallback(
    (gameId, { score = 0, stars = 1 } = {}) =>
      update((prev) => {
        const before = prev.games?.[gameId] ?? { plays: 0, bestScore: 0, stars: 0 }
        return {
          games: {
            ...(prev.games ?? {}),
            [gameId]: {
              played: true,
              plays: before.plays + 1,
              bestScore: Math.max(before.bestScore, score),
              stars: Math.max(before.stars, stars),
            },
          },
        }
      }),
    [update],
  )

  const getGameResult = useCallback(
    (gameId) => book.games?.[gameId] ?? null,
    [book.games],
  )

  const playedGames = useCallback(
    (ids = []) => ids.filter((id) => book.games?.[id]?.played).length,
    [book.games],
  )

  const resetBook = useCallback(() => {
    const current = getSnapshot()
    write({ ...current, [bookId]: emptyBook() })
  }, [bookId])

  const isCompleted = useCallback(
    (activityId) => book.completedActivities.includes(activityId),
    [book.completedActivities],
  )

  const getScore = useCallback((activityId) => book.scores[activityId] ?? null, [book.scores])

  /** % de actividades completadas sobre el total de actividades del libro */
  const percent = useCallback(
    (totalActivities) => {
      if (!totalActivities) return 0
      return Math.min(100, Math.round((book.completedActivities.length / totalActivities) * 100))
    },
    [book.completedActivities.length],
  )

  return {
    progress: book,
    completeActivity,
    setCurrentPage,
    resetBook,
    isCompleted,
    getScore,
    percent,
    recordGame,
    getGameResult,
    playedGames,
  }
}

export default useProgress
