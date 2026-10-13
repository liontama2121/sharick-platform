import { useEffect, useRef, useState } from 'react'

import BookCover from './BookCover'
import { STAGE_H, STAGE_W } from '../page/PageStage'

/**
 * La portada "English Route" ANIMADA fuera del lector: su lienzo de
 * 1600x1000 escalado al ancho del contenedor. La usan la cabecera del Home
 * y la card del libro (`lite`: ruta animada sin el detalle fino del mapa).
 */
export default function LiveCover({ meta, lite = false, className = '' }) {
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
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden bg-azul ${className}`}
      style={{ aspectRatio: `${STAGE_W} / ${STAGE_H}` }}
    >
      {scale > 0 && (
        <div
          className="absolute left-0 top-0"
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <BookCover meta={meta} lite={lite} />
        </div>
      )}
    </div>
  )
}
