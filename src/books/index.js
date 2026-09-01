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

/* ── Pantallas del módulo (Nivel 2: una miniatura por pantalla) ──────────
   El Nivel 2 ya no muestra una tarjeta por lección sino una por PANTALLA,
   en el orden real del libro: portada → 1.1-s1 → 1.1-s2 → … → 1.2-s1 → …  */

/** Título corto de una pantalla. Usa `screen.title`; si falta, lo deduce. */
export function screenTitle(screen, lesson) {
  if (screen?.title) return screen.title
  if (screen?.layout === 'cover') return 'Portada del libro'
  if (screen?.activity?.title) return screen.activity.title

  const partes = []
  if (screen?.section) partes.push(screen.section)
  if (screen?.exercise?.number) partes.push(`Exercise ${screen.exercise.number}`)
  if (!partes.length) partes.push(lesson?.shortTitle ?? lesson?.title ?? 'Pantalla')
  return partes.join(' · ')
}

/* Qué badge le toca a cada actividad. */
const ACTIVITY_BADGE = {
  matchMarkers: 'written',
  match: 'written',
  fillBubbles: 'written',
  fillInSentence: 'written',
  multipleChoice: 'written',
  listening: 'audio',
  speaking: 'speaking',
  recordPrompt: 'speaking',
  diceGame: 'game',
  roulette: 'game',
}

/** Badges de UNA pantalla: audio · game · video · written · speaking. */
export function screenBadges(screen) {
  const set = new Set()
  if (screen?.audio !== undefined) set.add('audio')
  if ((screen?.dialogues ?? []).some((d) => d.audio)) set.add('audio')
  if (screen?.video) set.add('video')
  const badge = ACTIVITY_BADGE[screen?.activity?.activity]
  if (badge) set.add(badge)
  return [...set]
}

/**
 * Todas las pantallas del módulo aplanadas, con el contexto que necesita
 * la tarjeta del Nivel 2.
 */
export function getModuleScreens(bookId, moduleId) {
  const lessons = getLessons(bookId, moduleId)
  const out = []

  lessons.forEach((lesson, lessonPos) => {
    const screens = getScreens(lesson)
    screens.forEach((screen, i) => {
      out.push({
        key: screen.id ?? `${lesson.id}-${i}`,
        screen,
        lesson,
        lessonPos,
        /** 0-based dentro de la lección */
        index: i,
        /** 1-based: el "2" de "2/5" y el de la URL /screen/2 */
        number: i + 1,
        total: screens.length,
        isFirstOfLesson: i === 0,
        isCover: lesson.type === 'cover',
        title: screenTitle(screen, lesson),
        badges: screenBadges(screen),
      })
    })
  })

  return out
}
