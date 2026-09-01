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

/* ── Juegos ───────────────────────────────────────────────────────────────
   Los juegos van POR MÓDULO: cada uno usa solo el contenido de su módulo.  */

/** Juegos de un módulo concreto. */
export function getModuleGames(bookId, moduleId) {
  return GAMES[bookId]?.modules?.[String(moduleId)]?.games ?? []
}

export function findGame(bookId, moduleId, gameId) {
  return getModuleGames(bookId, moduleId).find((g) => g.id === gameId) ?? null
}

/** Módulos del libro con al menos un juego publicado. */
export function getModulesWithGames(bookId) {
  const byModule = GAMES[bookId]?.modules ?? {}
  return Object.keys(byModule)
    .filter((k) => (byModule[k].games ?? []).length > 0)
    .map(Number)
    .sort((a, b) => a - b)
}

/** Secciones extra de la columna izquierda (Self-Check, Cultural…). */
export function getExtraSections(bookId) {
  return getBookContent(bookId)?.extraSections ?? []
}

/* ── Lecciones y pantallas ────────────────────────────────────────────────
   Una lección son varias PANTALLAS completas (`screens`); cada pantalla es
   lo que cabe sin scroll en el lienzo de 1600x1000.                        */

export function getLessons(bookId, moduleId) {
  return getModule(bookId, moduleId)?.lessons ?? []
}

/** Lecciones con contenido real (excluye la portada). */
export function getContentLessons(bookId, moduleId) {
  return getLessons(bookId, moduleId).filter((l) => l.type !== 'cover')
}

export function findLesson(bookId, moduleId, lessonId) {
  return getLessons(bookId, moduleId).find((l) => l.id === lessonId) ?? null
}

export function getScreens(lesson) {
  return lesson?.screens ?? []
}

/** Índice de una lección dentro de su módulo (para anterior/siguiente). */
export function lessonIndex(bookId, moduleId, lessonId) {
  return getLessons(bookId, moduleId).findIndex((l) => l.id === lessonId)
}

/* ── Actividades y progreso ───────────────────────────────────────────── */

/** Id canónico de una actividad: "1.1-s1-matchMarkers". */
export function activityId(screenId, activity) {
  return `${screenId}-${activity.id ?? activity.activity}`
}

export function screenActivityIds(screen) {
  return screen.activity ? [activityId(screen.id, screen.activity)] : []
}

export function lessonActivityIds(lesson) {
  return getScreens(lesson).flatMap(screenActivityIds)
}

export function moduleActivityIds(mod) {
  return (mod.lessons ?? []).flatMap(lessonActivityIds)
}

export function bookActivityIds(bookId) {
  return getModules(bookId).flatMap(moduleActivityIds)
}
