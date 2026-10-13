/* ═══════════════════════════════════════════════════════════════════════
   Geografía de la portada "English Route".

   `latam.json` = todos los países de Latinoamérica (de México a Tierra del
   Fuego, con Centroamérica, las Antillas y las Guayanas) sacados de
   Natural Earth 1:50m (paquete world-atlas@2.0.2) y simplificados con
   Douglas-Peucker a 0.06°. Contornos reales, no dibujados a mano. Cada
   país trae su capital (`capital: { name, lon, lat }`) y `tour` es el orden
   en que la ruta de la portada las recorre.

   Proyección Mercator, la de los mapas escolares: el continente se ve como
   el estudiante lo conoce.
   ═══════════════════════════════════════════════════════════════════════ */
import LATAM from './latam.json'

export const COUNTRIES = LATAM.countries

/* Orden del recorrido por TODAS las capitales: México, Centroamérica, los
   Andes, el Cono Sur, Brasil, las Guayanas y el Caribe. */
export const TOUR = LATAM.tour

const rad = (d) => (d * Math.PI) / 180
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))

/* Límites del mapa (grados). */
const BOUNDS = { w: -118.5, e: -33.5, s: -56, n: 33 }

/**
 * Proyector para un rectángulo del lienzo: encaja los límites en `box` =
 * {x, y, w, h} conservando la proporción, alineado a la derecha y abajo
 * (el Pacífico, a la izquierda, queda libre para el título).
 */
export function makeProjector(box) {
  const x0 = rad(BOUNDS.w)
  const x1 = rad(BOUNDS.e)
  const y0 = mercY(BOUNDS.n)
  const y1 = mercY(BOUNDS.s)
  const k = Math.min(box.w / (x1 - x0), box.h / (y0 - y1))
  const offX = box.x + box.w - (x1 - x0) * k
  const offY = box.y + box.h - (y0 - y1) * k
  return ([lon, lat]) => [offX + (rad(lon) - x0) * k, offY + (y0 - mercY(lat)) * k]
}

const r = (n) => Math.round(n * 10) / 10

/** Anillo cerrado como path SVG (los datos ya traen el detalle real). */
export function ringPath(points) {
  return `${points.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])},${r(p[1])}`).join('')}Z`
}

/** Línea abierta (retícula). */
export function polyline(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])},${r(p[1])}`).join('')
}

/** Área y centroide de un anillo ya proyectado (para colocar etiquetas). */
export function ringCentroid(pts) {
  let a = 0
  let cx = 0
  let cy = 0
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[(i + 1) % pts.length]
    const f = x0 * y1 - x1 * y0
    a += f
    cx += (x0 + x1) * f
    cy += (y0 + y1) * f
  }
  a /= 2
  return { area: Math.abs(a), x: cx / (6 * a), y: cy / (6 * a) }
}

/**
 * Arco entre dos puntos del lienzo, curvado hacia un lado (`bend` en
 * fracción de la distancia; positivo = a la izquierda del sentido de viaje).
 */
export function arc(a, b, bend = 0.25) {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const cx = mx + dy * bend
  const cy = my - dx * bend
  return `M${r(a[0])},${r(a[1])}Q${r(cx)},${r(cy)} ${r(b[0])},${r(b[1])}`
}
