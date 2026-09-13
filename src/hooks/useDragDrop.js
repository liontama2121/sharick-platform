import { useCallback, useRef, useState } from 'react'

/* Menos de esto y el gesto cuenta como toque, no como arrastre. */
const THRESHOLD = 6

/**
 * Arrastrar y soltar con Pointer Events: sirve igual con mouse, dedo y lápiz.
 * Pensado para el lienzo escalado de 1600x1000: las coordenadas del puntero
 * se traducen a las del contenedor dividiendo por la escala real, así que el
 * "fantasma" que sigue al dedo cae exactamente donde está el puntero.
 *
 * - Un gesto que apenas se mueve dispara `onTap(id)` → modo click-click.
 * - Al soltar se busca debajo del puntero un elemento con `data-drop` y se
 *   llama `onDrop(id, valorDeDataDrop | null)`.
 * - `over` es el `data-drop` que hay bajo el puntero mientras se arrastra,
 *   para resaltar el destino.
 *
 * Los elementos arrastrables deben llevar `touch-none` (touch-action: none)
 * para que el navegador no convierta el gesto en scroll.
 */
export function useDragDrop({ wrapRef, onDrop, onTap, attr = 'data-drop' }) {
  const [drag, setDrag] = useState(null) // { id, x, y, w, h }
  const [over, setOver] = useState(null)
  const startRef = useRef(null)
  const movedRef = useRef(false)

  const toLocal = useCallback(
    (clientX, clientY) => {
      const wrap = wrapRef.current
      if (!wrap) return { x: clientX, y: clientY, s: 1 }
      const box = wrap.getBoundingClientRect()
      const s = box.width / wrap.offsetWidth || 1
      return { x: (clientX - box.left) / s, y: (clientY - box.top) / s, s }
    },
    [wrapRef],
  )

  const targetAt = useCallback(
    (clientX, clientY) => {
      const el = document.elementFromPoint(clientX, clientY)
      const t = el?.closest?.(`[${attr}]`)
      return t ? t.getAttribute(attr) : null
    },
    [attr],
  )

  const bind = (id, disabled = false) => ({
    onPointerDown: (e) => {
      if (disabled || e.button > 0) return
      e.preventDefault()
      try {
        e.currentTarget.setPointerCapture?.(e.pointerId)
      } catch {
        /* sin captura sigue funcionando: los eventos llegan por burbujeo */
      }
      const r = e.currentTarget.getBoundingClientRect()
      const { s } = toLocal(e.clientX, e.clientY)
      startRef.current = {
        id,
        cx: e.clientX,
        cy: e.clientY,
        ox: (e.clientX - r.left) / s,
        oy: (e.clientY - r.top) / s,
        w: r.width / s,
        h: r.height / s,
      }
      movedRef.current = false
    },
    onPointerMove: (e) => {
      const st = startRef.current
      if (!st || st.id !== id) return
      if (!movedRef.current) {
        if (Math.hypot(e.clientX - st.cx, e.clientY - st.cy) < THRESHOLD) return
        movedRef.current = true
      }
      const { x, y } = toLocal(e.clientX, e.clientY)
      setDrag({ id, x: x - st.ox, y: y - st.oy, w: st.w, h: st.h })
      setOver(targetAt(e.clientX, e.clientY))
    },
    onPointerUp: (e) => {
      const st = startRef.current
      if (!st || st.id !== id) return
      startRef.current = null
      if (!movedRef.current) {
        onTap?.(id)
        return
      }
      const target = targetAt(e.clientX, e.clientY)
      setDrag(null)
      setOver(null)
      onDrop?.(id, target)
    },
    onPointerCancel: () => {
      startRef.current = null
      movedRef.current = false
      setDrag(null)
      setOver(null)
    },
  })

  return { drag, over, bind }
}
