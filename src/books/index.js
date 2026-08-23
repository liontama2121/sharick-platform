import registry from './registry.json'
import englishA1 from './english-a1/modules.json'

/* Índice de contenidos. Al agregar un libro nuevo:
   1) añadirlo a registry.json  2) importar su modules.json aquí. */
const CONTENT = {
  'english-a1': englishA1,
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

/** Todas las páginas del libro, en orden, con su módulo. */
export function getAllPages(bookId) {
  return getModules(bookId).flatMap((mod) =>
    (mod.pages ?? []).map((page) => ({ page, module: mod })),
  )
}

/** Página + módulo + vecinos para la navegación anterior/siguiente. */
export function findPage(bookId, pageId) {
  const all = getAllPages(bookId)
  const index = all.findIndex((p) => p.page.id === pageId)
  if (index === -1) return null
  return {
    ...all[index],
    index,
    total: all.length,
    prev: all[index - 1]?.page ?? null,
    next: all[index + 1]?.page ?? null,
  }
}

/** Id canónico de una actividad: "m1-p1-match". */
export function activityId(pageId, section) {
  return `${pageId}-${section.id ?? section.activity}`
}

/** Ids de todas las actividades de una página. */
export function pageActivityIds(page) {
  return (page.sections ?? [])
    .filter((s) => s.type === 'activity')
    .map((s) => activityId(page.id, s))
}

/** Ids de todas las actividades de un módulo. */
export function moduleActivityIds(mod) {
  return (mod.pages ?? []).flatMap(pageActivityIds)
}

/** Ids de todas las actividades del libro (denominador del progreso). */
export function bookActivityIds(bookId) {
  return getModules(bookId).flatMap(moduleActivityIds)
}
