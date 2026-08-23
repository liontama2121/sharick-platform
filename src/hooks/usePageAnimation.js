import { useLayoutEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Entrada de página: fadeIn + translateY [20,0], 600ms outQuad,
 * stagger de 80ms sobre los hijos marcados con [data-anim].
 *
 * El estado inicial (opacity 0) se aplica como estilo inline desde aquí,
 * NO como clase en el JSX: react-pageflip provoca re-renders que
 * restaurarían la clase y dejarían la página invisible.
 *
 * @param {any} key  cambiar este valor re-dispara la animación (p.ej. el id de página)
 */
export function usePageAnimation(key) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = root.querySelectorAll('[data-anim]')
    if (!targets.length) return

    if (reduced()) {
      targets.forEach((el) => {
        el.style.opacity = '1'
      })
      return
    }

    targets.forEach((el) => {
      el.style.opacity = '0'
    })

    animate(targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      ease: 'outQuad',
      delay: stagger(80),
    })
  }, [key])

  return ref
}

/** Transición entre páginas del libro: entrada translateX [30,0] + fade. */
export function usePageSlide(key) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    animate(el, {
      opacity: [0, 1],
      translateX: [30, 0],
      duration: 450,
      ease: 'outQuad',
    })
  }, [key])

  return ref
}

export default usePageAnimation
