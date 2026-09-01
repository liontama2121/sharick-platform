import { useLayoutEffect, useRef } from 'react'
import { animate } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Entrada de un nivel de navegación: fade + escala sutil, 350ms.
 * El estado inicial se aplica inline (no con una clase) para que un
 * re-render de React no lo restaure y deje la pantalla invisible.
 */
export function useLevelIntro(key) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    if (reduced()) {
      el.style.opacity = '1'
      return
    }

    el.style.opacity = '0'
    animate(el, {
      opacity: [0, 1],
      scale: [0.985, 1],
      duration: 350,
      ease: 'outQuad',
    })
  }, [key])

  return ref
}

export default useLevelIntro
