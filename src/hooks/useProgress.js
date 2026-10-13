import { useCallback, useSyncExternalStore } from 'react'
import { getLegacyScreenIds } from '../books'

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

/* ── Migración de ids de pantalla ───────────────────────────────────────
   Cuando se fusionan lecciones (1.2 → 1.1) las pantallas cambian de id.
   `module.legacyScreenIds` dice viejo → nuevo; aquí se reescriben de una
   sola pasada las actividades, puntajes, pantallas vistas y la última
   pantalla. La firma del mapa queda en `legacyMap` para no migrar dos
   veces (el mapa no es idempotente: 1.1-s4 pasa a 1.1-s10 y la nueva
   1.1-s4 es otra pantalla).                                              */

function remapId(id, map) {
  if (typeof id !== 'string') return id
  if (map[id]) return map[id]
  const old = Object.keys(map).find((k) => id.startsWith(`${k}-`))
  return old ? map[old] + id.slice(old.length) : id
}

function migrateBook(bookId, book) {
  const map = getLegacyScreenIds(bookId)
  const sign = Object.keys(map).sort().join('|')
  if (!sign || !book || book.legacyMap === sign) return book
  const ids = (list) => [...new Set((list ?? []).map((id) => remapId(id, map)))]
  return {
    ...book,
    completedActivities: ids(book.completedActivities),
    visitedScreens: ids(book.visitedScreens),
    currentPage: remapId(book.currentPage, map),
    scores: Object.fromEntries(
      Object.entries(book.scores ?? {}).map(([k, v]) => [remapId(k, map), v]),
    ),
    legacyMap: sign,
  }
}

function migrateAll(all) {
  let changed = false
  const out = {}
  for (const [bookId, book] of Object.entries(all)) {
    out[bookId] = migrateBook(bookId, book)
    if (out[bookId] !== book) changed = true
  }
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
    } catch {
      /* sin almacenamiento: la migración vive en memoria */
    }
  }
  return out
}

let snapshot = migrateAll(read())

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

function emptyBook(bookId) {
  return {
    currentPage: null,
    completedActivities: [],
    visitedScreens: [],
    scores: {},
    games: {},
    lastVisit: null,
    legacyMap: Object.keys(getLegacyScreenIds(bookId)).sort().join('|'),
  }
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
  const book = all[bookId] ?? emptyBook(bookId)

  const update = useCallback(
    (mutate) => {
      const current = getSnapshot()
      const prev = current[bookId] ?? emptyBook(bookId)
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
   * Marca una pantalla como vista. Las pantallas sin actividad se dan por
   * completadas al verlas; las que tienen actividad esperan a completarla.
   * Guarda además cuál fue la última, para que el Nivel 2 vuelva a ella.
   */
  const visitScreen = useCallback(
    (screenId) =>
      update((prev) => ({
        currentPage: screenId,
        visitedScreens: (prev.visitedScreens ?? []).includes(screenId)
          ? prev.visitedScreens
          : [...(prev.visitedScreens ?? []), screenId],
      })),
    [update],
  )

  /**
   * Resultado de una partida. El progreso de juegos va POR MÓDULO:
   * games["1"] = { played: [ids], stars: {id: n}, bestScores: {id: n} }
   */
  const recordGame = useCallback(
    (moduleId, gameId, { score = 0, stars = 1 } = {}) =>
      update((prev) => {
        const key = String(moduleId)
        const all = prev.games ?? {}
        const mod = all[key] ?? { played: [], stars: {}, bestScores: {} }
        return {
          games: {
            ...all,
            [key]: {
              played: mod.played.includes(gameId) ? mod.played : [...mod.played, gameId],
              stars: { ...mod.stars, [gameId]: Math.max(mod.stars[gameId] ?? 0, stars) },
              bestScores: {
                ...mod.bestScores,
                [gameId]: Math.max(mod.bestScores[gameId] ?? 0, score),
              },
            },
          },
        }
      }),
    [update],
  )

  const getGameResult = useCallback(
    (moduleId, gameId) => {
      const mod = book.games?.[String(moduleId)]
      if (!mod?.played?.includes(gameId)) return null
      return {
        played: true,
        stars: mod.stars?.[gameId] ?? 0,
        bestScore: mod.bestScores?.[gameId] ?? 0,
      }
    },
    [book.games],
  )

  /** Resumen de un módulo: cuántos jugados y estrellas acumuladas. */
  const getModuleGameStats = useCallback(
    (moduleId, gameIds = []) => {
      const mod = book.games?.[String(moduleId)]
      if (!mod) return { played: 0, total: gameIds.length, stars: 0 }
      const played = gameIds.filter((id) => mod.played?.includes(id)).length
      const stars = gameIds.reduce((sum, id) => sum + (mod.stars?.[id] ?? 0), 0)
      return { played, total: gameIds.length, stars }
    },
    [book.games],
  )

  const resetBook = useCallback(() => {
    const current = getSnapshot()
    write({ ...current, [bookId]: emptyBook(bookId) })
  }, [bookId])

  const isCompleted = useCallback(
    (activityId) => book.completedActivities.includes(activityId),
    [book.completedActivities],
  )

  const getScore = useCallback((activityId) => book.scores[activityId] ?? null, [book.scores])

  const isScreenVisited = useCallback(
    (screenId) => (book.visitedScreens ?? []).includes(screenId),
    [book.visitedScreens],
  )

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
    visitScreen,
    isScreenVisited,
    resetBook,
    isCompleted,
    getScore,
    percent,
    recordGame,
    getGameResult,
    getModuleGameStats,
  }
}

export default useProgress
