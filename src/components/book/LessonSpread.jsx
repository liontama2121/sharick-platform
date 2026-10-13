import { useEffect, useRef, useState } from 'react'

import ScreenRenderer from '../page/ScreenRenderer'
import { STAGE_H, STAGE_W } from '../page/PageStage'
import { activityId } from '../../books'
import { INERT_PROGRESS } from './ScreenThumb'

/* Proporción de la miniatura. Las pantallas son apaisadas (16:10), así que
   un spread real sería 3.2:1, demasiado plano para una tarjeta; con 2:1 las
   dos páginas quedan centradas con un margen de papel arriba y abajo. */
export const SPREAD_RATIO = '2 / 1'

/* ── Mosaico ──────────────────────────────────────────────────────────────
   Cada página del spread es cuadrada. Las teselas se dan en fracciones de
   la página: [x, y, w, h]. Izquierda = las dos primeras pantallas del
   mosaico; derecha = el resto (hasta 4), como la doble página de un libro
   de editorial que resume la lección de un vistazo.                      */
const PAD = 0.045
const GAP = 0.035
const IN = 1 - PAD * 2

function rows(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  const free = IN - GAP * (weights.length - 1)
  let y = PAD
  return weights.map((w) => {
    const h = (free * w) / total
    const r = { y, h }
    y += h + GAP
    return r
  })
}

const full = ({ y, h }) => [[PAD, y, IN, h]]
const pair = ({ y, h }) => {
  const w = (IN - GAP) / 2
  return [
    [PAD, y, w, h],
    [PAD + w + GAP, y, w, h],
  ]
}

function pageLayout(n) {
  if (n <= 1) return full(rows([1])[0])
  if (n === 2) return rows([1.1, 1]).flatMap(full)
  if (n === 3) {
    const [a, b] = rows([1, 1])
    return [...full(a), ...pair(b)]
  }
  const [a, b, c] = rows([1, 1, 1])
  return [...full(a), ...pair(b), ...full(c)]
}

/* Recorte tipo "cover": la pantalla se escala hasta llenar la tesela y se
   centra un poco por debajo de la mitad, donde vive el contenido (arriba
   está el rótulo de sección, que se repite en todas). */
function Tile({ screen, rect, pageW, meta, content, flat = false }) {
  const [fx, fy, fw, fh] = rect
  const w = fw * pageW
  const h = fh * pageW
  const scale = Math.max(w / STAGE_W, h / STAGE_H)
  const offX = (w - STAGE_W * scale) / 2
  const offY = (h - STAGE_H * scale) * 0.58

  return (
    <div
      className={`absolute overflow-hidden bg-paper ${flat ? '' : 'rounded-[6px] ring-1 ring-azul/15'}`}
      style={{ left: fx * pageW, top: fy * pageW, width: w, height: h }}
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(${offX}px, ${offY}px) scale(${scale})`,
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
          still
        />
      </div>
    </div>
  )
}

/**
 * Miniatura de una lección como DOBLE PÁGINA de libro.
 * - Con `mosaic` (≥ 3 pantallas): cada página es un mosaico de mini-renders
 *   reales; izquierda = 2 pantallas, derecha = hasta 4. Resume la lección.
 * - Sin mosaico: página izquierda = primera pantalla, derecha = segunda; si
 *   solo hay una, va como página única centrada.
 * Todo se renderiza de verdad (ScreenRenderer) escalado, con
 * `pointer-events: none`, progreso inerte y sin animaciones (`still`).
 */
export default function LessonSpread({
  screens = [],
  mosaic = [],
  meta,
  content,
  className = '',
  frameClassName = 'rounded-lg border border-[#b9c3d0] shadow-lift',
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

  const isMosaic = mosaic.length >= 3
  const single = !isMosaic && screens.length === 1
  const pages = screens.slice(0, 2)
  const halfW = width / 2
  const scale = halfW / STAGE_W
  const pageH = STAGE_H * scale
  const twoPages = isMosaic || pages.length === 2

  const mosaicPages = isMosaic ? [mosaic.slice(0, 2), mosaic.slice(2, 6)] : []

  return (
    <div
      ref={boxRef}
      className={`relative w-full overflow-hidden bg-paper ${frameClassName} ${className}`}
      style={{ aspectRatio: SPREAD_RATIO }}
      aria-hidden="true"
      /* La miniatura renderiza el libro de verdad: sin `inert` el teclado
         entraría en sus botones invisibles. */
      inert=""
    >
      {width > 0 && isMosaic && (
        <div className="absolute inset-0 flex">
          {mosaicPages.map((list, p) => (
            <div key={p} className="relative h-full shrink-0 bg-paper" style={{ width: halfW }}>
              {pageLayout(list.length).map((rect, i) =>
                list[i] ? (
                  <Tile
                    key={list[i].id ?? i}
                    screen={list[i]}
                    rect={rect}
                    pageW={halfW}
                    meta={meta}
                    content={content}
                  />
                ) : null,
              )}
            </div>
          ))}
        </div>
      )}

      {width > 0 && single && (
        <Tile screen={screens[0]} rect={[0, 0, 1, 0.5]} pageW={width} meta={meta} content={content} flat />
      )}

      {!isMosaic && !single && (
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
                  still
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lomo del libro: sombra suave hacia ambos lados + línea fina */}
      {twoPages && (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 left-1/2 w-8 -translate-x-1/2"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(20,30,50,.18) 50%, transparent)',
            }}
          />
          <span className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-azul/25" />
        </>
      )}
    </div>
  )
}
