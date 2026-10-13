import { useEffect, useRef, useState } from 'react'

import BookCover from '../book/BookCover'
import { STAGE_H, STAGE_W } from '../page/PageStage'

/**
 * Portada de la página principal: la misma portada "English Route" del
 * libro (mapa + ruta animada), dibujada en su lienzo de 1600x1000 y
 * escalada al ancho de la página dentro de una ventana de la chiva.
 */
export default function HomeHero({ meta }) {
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

  return (
    <header className="ventana overflow-hidden rounded-[28px] shadow-page">
      <div
        ref={boxRef}
        className="relative w-full overflow-hidden bg-azul"
        style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
      >
        {scale > 0 && (
          <div
            className="absolute left-0 top-0"
            style={{
              width: STAGE_W,
              height: STAGE_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <BookCover meta={meta} />
          </div>
        )}
      </div>
    </header>
  )
}
