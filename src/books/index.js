import registry from './registry.json'
import englishA1 from './english-a1/modules.json'
import englishA1Games from './english-a1/games.json'

/* Índice de contenidos. Al agregar un libro nuevo:
   1) añadirlo a registry.json  2) importar su modules.json aquí. */
const CONTENT = {
  'english-a1': englishA1,
}

/* Juegos del hub, uno por libro. Agregar un juego = agregar un objeto
   al games.json correspondiente. */
const GAMES = {
  'english-a1': englishA1Games,
}

export const books = registry.books

export function getBookMeta(bookId) {
  return books.find((b) => b.id === bookId) ?? null
}

export function getBookContent(bookId) {
  return CONTENT[bookId] ?? null
}

export function getModules(bookId) {
  return getBookContent(bookId)?.modules ?? []
}

export function getModule(bookId, moduleId) {
  return getModules(bookId).find((m) => String(m.moduleId) === String(moduleId)) ?? null
}

/** Recursos del libro (columna derecha del menú principal). */
export function getResources(bookId) {
  return getBookContent(bookId)?.resources ?? []
}

/** Juegos del libro. `moduleId` opcional para filtrar por módulo. */
export function getGames(bookId, moduleId) {
  const list = GAMES[bookId]?.games ?? []
  if (moduleId == null || moduleId === 'all') return list
  return list.filter((g) => String(g.module) === String(moduleId))
}

export function findGame(bookId, gameId) {
  return (GAMES[bookId]?.games ?? []).find((g) => g.id === gameId) ?? null
}

/** Módulos que tienen al menos un juego. */
export function getGameModules(bookId) {
  const ids = [...new Set((GAMES[bookId]?.games ?? []).map((g) => g.module))]
  return ids.sort((a, b) => a - b)
}

/** Secciones extra de la columna izquierda (Self-Check, Cultural…). */
export function getExtraSections(bookId) {
  return getBookContent(bookId)?.extraSections ?? []
}

/* ── Lecciones ────────────────────────────────────────────────────────────
   Una lección es UNA doble página: `pages` trae la hoja izquierda y la
   derecha. La lección "cover" es la portada, que va sola.                */

export function getLessons(bookId, moduleId) {
  return getModule(bookId, moduleId)?.lessons ?? []
}

/** Lecciones con contenido real (excluye la portada). */
export function getContentLessons(bookId, moduleId) {
  return getLessons(bookId, moduleId).filter((l) => (l.pages ?? []).length > 0)
}

export function findLesson(bookId, moduleId, lessonId) {
  return getLessons(bookId, moduleId).find((l) => l.id === lessonId) ?? null
}

/** Todas las páginas del módulo, en orden, con su módulo y su lección. */
export function getModulePages(bookId, moduleId) {
  const mod = getModule(bookId, moduleId)
  if (!mod) return []
  return (mod.lessons ?? []).flatMap((lesson) =>
    (lesson.pages ?? []).map((page) => ({ page, module: mod, lesson })),
  )
}

/** Todas las páginas del libro (todos los módulos). */
export function getAllPages(bookId) {
  return getModules(bookId).flatMap((mod) =>
    (mod.lessons ?? []).flatMap((lesson) =>
      (lesson.pages ?? []).map((page) => ({ page, module: mod, lesson })),
    ),
  )
}

/** Página + módulo + lección, buscada por id de página. */
export function findPage(bookId, pageId) {
  const all = getAllPages(bookId)
  const index = all.findIndex((p) => p.page.id === pageId)
  if (index === -1) return null
  return { ...all[index], index, total: all.length }
}

/** Lección a la que pertenece una página. */
export function lessonOfPage(bookId, moduleId, pageId) {
  return (
    getLessons(bookId, moduleId).find((l) =>
      (l.pages ?? []).some((p) => p.id === pageId),
    ) ?? null
  )
}

/* ── Actividades y progreso ───────────────────────────────────────────── */

/** Id canónico de una actividad: "m1-p09-match". */
export function activityId(pageId, section) {
  return `${pageId}-${section.id ?? section.activity}`
}

export function pageActivityIds(page) {
  return (page.sections ?? [])
    .filter((s) => s.type === 'activity')
    .map((s) => activityId(page.id, s))
}

export function lessonActivityIds(lesson) {
  return (lesson.pages ?? []).flatMap(pageActivityIds)
}

export function moduleActivityIds(mod) {
  return (mod.lessons ?? []).flatMap(lessonActivityIds)
}

export function bookActivityIds(bookId) {
  return getModules(bookId).flatMap(moduleActivityIds)
}
