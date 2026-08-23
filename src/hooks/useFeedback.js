import { animate, stagger } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Respuesta correcta: scale [1, 1.15, 1] + destello verde suave, 500ms. */
export function celebrate(el) {
  if (!el || reduced()) return
  animate(el, {
    scale: [1, 1.15, 1],
    duration: 500,
    ease: 'outQuad',
  })
  animate(el, {
    backgroundColor: ['#ffffff', '#e8f8ee', '#ffffff'],
    duration: 900,
    ease: 'inOutQuad',
  })
}

/** Respuesta incorrecta: shake horizontal, 400ms. */
export function shake(el) {
  if (!el || reduced()) return
  animate(el, {
    translateX: [0, -8, 8, -5, 5, 0],
    duration: 400,
    ease: 'inOutQuad',
  })
}

/**
 * Pop-in de burbujas / frases: scale [0.8, 1] + fade, stagger 120ms.
 * Igual que usePageAnimation, el estado inicial se aplica inline y no con
 * una clase: React lo restauraría en cada re-render.
 */
export function popIn(targets, delay = 120) {
  if (!targets) return
  const list = Array.from(targets)
  if (!list.length) return

  if (reduced()) {
    list.forEach((el) => {
      el.style.opacity = '1'
    })
    return
  }

  list.forEach((el) => {
    el.style.opacity = '0'
  })

  animate(list, {
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 400,
    ease: 'outBack',
    delay: stagger(delay),
  })
}

/** Hover float de cards: scale 1.05 + translateY -8, 300ms. */
export function hoverFloat(el, active) {
  if (!el || reduced()) return
  animate(el, {
    scale: active ? 1.05 : 1,
    translateY: active ? -8 : 0,
    duration: 300,
    ease: 'outQuad',
  })
}
