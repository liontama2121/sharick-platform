import module1 from './english-a1/module1.json'

/**
 * Contenido de la Study Zone. Un libro = varios módulos; cada módulo trae
 * temas con { id, title, summary, learn[], exercises[], quiz }.
 * Los módulos sin temas salen como "Coming soon" en el mapa.
 * Agregar un módulo = crear `<libro>/moduleN.json` y registrarlo aquí.
 */
const STUDY = {
  'english-a1': {
    modules: [
      module1,
      { moduleId: 2, title: 'Numbers and Personal Information', topics: [] },
      { moduleId: 3, title: 'Family and Home', topics: [] },
      { moduleId: 4, title: 'Food and Daily Routine', topics: [] },
    ],
  },
}

export function getStudyModules(bookId) {
  return STUDY[bookId]?.modules ?? []
}

export function getStudyModule(bookId, moduleId) {
  return getStudyModules(bookId).find((m) => String(m.moduleId) === String(moduleId)) ?? null
}

/** Primer módulo con temas (el activo por defecto en el mapa). */
export function getDefaultStudyModule(bookId) {
  return getStudyModules(bookId).find((m) => (m.topics ?? []).length > 0) ?? null
}

/** Tema por id, buscando en todos los módulos del libro. */
export function findStudyTopic(bookId, topicId) {
  for (const mod of getStudyModules(bookId)) {
    const i = (mod.topics ?? []).findIndex((t) => t.id === topicId)
    if (i >= 0) return { topic: mod.topics[i], index: i, module: mod }
  }
  return null
}

/** Baraja una copia (Fisher-Yates). */
export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Preguntas de opción múltiple de un tema para el Arcade: las del quiz más
 * las de práctica de tipo multipleChoice, con el tema de origen.
 */
export function topicQuestionPool(topic) {
  const quiz = (topic.quiz?.questions ?? []).map((q) => ({ ...q, topicId: topic.id }))
  const practice = (topic.exercises ?? [])
    .filter((e) => e.type === 'multipleChoice')
    .map((e) => ({ q: e.q, options: e.options, correct: e.correct, topicId: topic.id }))
  return [...quiz, ...practice]
}
