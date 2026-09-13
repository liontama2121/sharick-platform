import { useEffect, useRef, useState } from 'react'

import ScreenRenderer from '../page/ScreenRenderer'
import { STAGE_H, STAGE_W } from '../page/PageStage'
import { activityId } from '../../books'
import { INERT_PROGRESS } from './ScreenThumb'

/* Proporción de la miniatura. Las pantallas son apaisadas (16:10), así que
   un spread real sería 3.2:1, demasiado plano para una tarjeta; con 2:1 las
   dos páginas quedan centradas con un margen de papel arriba y abajo. */
export const SPREAD_RATIO = '2 / 1'

/**
 * Miniatura de una lección como DOBLE PÁGINA de libro: página izquierda =
 * primera pantalla, página derecha = segunda, con línea de lomo al centro.
 * Si solo hay una pantalla, va como página única centrada. Las páginas se
 * renderizan de verdad (ScreenRenderer) escaladas al ancho de media tarjeta,
 * con `pointer-events: none` y progreso inerte.
 */
export default function LessonSpread({
  screens = [],
  meta,
  content,
  className = '',
  frameClassName = 'rounded-lg border border-[#cfc3a9] shadow-lift',
}) {
  const boxRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return

    const fit = () => setWidth(el.clientWidth)
    fit()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', fit)
      return () => window.removeEventListener('resize', fit)
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pages = screens.slice(0, 2)
  const halfW = width / 2
  const scale = halfW / STAGE_W
  const pageH = STAGE_H * scale

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden bg-paper ${frameClassName} ${className}`}
      style={{ aspectRatio: SPREAD_RATIO }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ visibility: width ? 'visible' : 'hidden' }}
      >
        {pages.map((screen, i) => (
          <div
            key={screen.id ?? i}
            className="relative shrink-0 overflow-hidden bg-paper"
            style={{ width: halfW, height: pageH }}
          >
            <div
              style={{
                width: STAGE_W,
                height: STAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                pointerEvents: 'none',
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
        ))}
      </div>

      {/* Lomo del libro: sombra suave hacia ambos lados + línea fina */}
      {pages.length === 2 && (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 left-1/2 w-6 -translate-x-1/2"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(27,58,92,.16) 50%, transparent)',
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-navy/20" />
        </>
      )}
    </div>
  )
}
