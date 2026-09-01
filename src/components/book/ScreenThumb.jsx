import { useEffect, useRef, useState } from 'react'

import ScreenRenderer from '../page/ScreenRenderer'
import { STAGE_H, STAGE_W } from '../page/PageStage'
import { activityId } from '../../books'

/* Las miniaturas no se tocan: progreso inerte para que ninguna actividad
   se marque desde aquí. */
const INERT_PROGRESS = {
  progress: { completedActivities: [], scores: {} },
  completeActivity: () => {},
  isCompleted: () => false,
  getScore: () => null,
}

/**
 * Miniatura real de UNA pantalla, en 16:10 (el lienzo ya es 1600x1000).
 * Se escala al ancho real de la tarjeta, así que sirve igual en la rejilla
 * de 2 columnas del móvil que en la de 5 de un monitor grande.
 */
export default function ScreenThumb({ screen, meta, content, className = '' }) {
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return

    const fit = () => setScale(el.clientWidth / STAGE_W)
    fit()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', fit)
      return () => window.removeEventListener('resize', fit)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!screen) return null

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden rounded-xl border border-navy/10
        bg-paper shadow-soft ${className}`}
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      aria-hidden="true"
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          visibility: scale ? 'visible' : 'hidden',
        }}
      >
        <ScreenRenderer
          screen={screen}
          meta={meta}
          content={content}
          progress={INERT_PROGRESS}
          activityId={activityId}
          resetKey={0}
        />
      </div>
    </div>
  )
}
