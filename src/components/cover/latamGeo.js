/* ═══════════════════════════════════════════════════════════════════════
   Geografía de la portada "English Route".

   Costa de Latinoamérica (de México a la Patagonia) y los cuatro países del
   libro como listas [lon, lat] muy simplificadas. No es cartografía: es un
   mapa pintado, reconocible, que se suaviza con Catmull-Rom.

   Proyección: lente de ojo de pez centrada en el triángulo Colombia /
   Venezuela / Panamá. Sin ella esas tres capitales quedan a 60-90px una de
   otra y los letreros se pisan; con la lente el norte de Suramérica crece
   ~2.5x, la Patagonia se estrecha y el continente sigue leyéndose.
   ═══════════════════════════════════════════════════════════════════════ */

/** Costa continental, en sentido horario desde Tijuana. */
export const COAST = [
  // Pacífico: Baja California y México
  [-117.1, 32.5], [-116.0, 30.2], [-114.2, 28.0], [-112.2, 25.5], [-110.0, 22.9],
  [-110.6, 24.4], [-112.4, 27.2], [-114.6, 30.9], [-112.8, 30.6], [-111.0, 28.0],
  [-109.0, 25.6], [-106.0, 23.0], [-105.3, 20.5], [-104.0, 19.0], [-101.5, 17.6],
  [-99.0, 16.6], [-96.5, 15.7], [-94.2, 16.1], [-92.3, 14.6],
  // Centroamérica
  [-90.5, 13.9], [-88.0, 13.2], [-86.5, 12.0], [-85.7, 11.0], [-85.8, 10.0],
  [-84.8, 9.5], [-83.6, 8.4], [-82.0, 8.2], [-80.4, 7.4], [-79.5, 8.9],
  [-78.4, 8.3], [-77.9, 7.2],
  // Pacífico suramericano
  [-77.4, 6.5], [-77.3, 4.0], [-78.7, 1.6], [-80.1, 0.0], [-80.9, -2.3],
  [-81.3, -4.6], [-79.8, -7.5], [-77.0, -12.0], [-76.2, -14.0], [-71.4, -17.6],
  [-70.3, -18.5], [-70.2, -23.6], [-71.5, -30.0], [-71.6, -33.0], [-73.6, -37.2],
  [-73.8, -41.5], [-74.6, -45.0], [-75.4, -48.5], [-74.4, -52.0], [-71.0, -54.0],
  [-68.6, -55.2], [-65.3, -54.8],
  // Atlántico, de la Patagonia hacia el norte
  [-68.3, -52.3], [-69.0, -51.6], [-67.6, -49.0], [-65.8, -47.7], [-67.5, -46.0],
  [-65.0, -45.0], [-64.0, -42.5], [-62.2, -40.6], [-62.3, -38.8], [-57.6, -38.2],
  [-56.7, -36.4], [-58.4, -34.6], [-56.2, -34.9], [-53.4, -33.7], [-51.0, -31.0],
  [-48.6, -28.2], [-48.5, -25.9], [-46.3, -24.0], [-43.2, -22.9], [-41.0, -22.0],
  [-39.0, -17.7], [-38.9, -13.0], [-35.2, -9.0], [-34.8, -7.1], [-35.3, -5.4],
  [-38.5, -3.7], [-41.8, -2.9], [-44.3, -2.5], [-48.5, -1.0], [-50.0, 0.0],
  [-50.5, 1.8], [-51.6, 4.2], [-54.0, 5.8], [-57.0, 6.0], [-58.2, 6.8],
  [-60.0, 8.5], [-61.6, 9.9],
  // Caribe: Venezuela, Colombia, Panamá
  [-62.3, 10.6], [-64.0, 10.6], [-66.9, 10.6], [-68.4, 10.5], [-70.0, 11.6],
  [-71.3, 11.8], [-71.6, 10.4], [-72.2, 11.0], [-71.7, 12.4], [-73.0, 11.3],
  [-74.2, 11.2], [-75.5, 10.4], [-76.8, 8.6], [-77.3, 8.6], [-78.4, 9.4],
  [-79.9, 9.4], [-81.4, 8.8], [-82.6, 9.5],
  // Caribe centroamericano, Yucatán y golfo de México
  [-83.6, 11.0], [-83.7, 12.5], [-83.4, 15.0], [-85.0, 15.9], [-88.0, 15.7],
  [-88.3, 18.4], [-87.5, 20.0], [-86.8, 21.3], [-88.5, 21.5], [-90.4, 21.0],
  [-90.7, 19.4], [-91.8, 18.6], [-94.0, 18.2], [-95.9, 18.8], [-97.2, 20.6],
  [-97.7, 22.5], [-97.5, 25.9],
  // Frontera norte: sale por arriba del lienzo
  [-99.5, 27.5], [-101.4, 29.7], [-104.5, 29.6], [-106.5, 31.8], [-108.2, 31.3],
  [-111.0, 31.3], [-114.8, 32.5],
]

/** Antillas mayores: dan la pista del Caribe aunque no sean del libro. */
export const ISLANDS = [
  // Cuba
  [[-84.9, 21.9], [-82.5, 23.1], [-80.0, 23.1], [-77.0, 21.6], [-74.2, 20.2],
   [-75.6, 19.9], [-77.7, 19.9], [-78.6, 21.5], [-80.5, 22.0], [-83.0, 22.0]],
  // La Española
  [[-74.4, 18.4], [-72.8, 19.9], [-70.0, 19.7], [-68.4, 18.6], [-70.0, 18.2],
   [-71.4, 17.6], [-73.0, 18.0]],
  // Jamaica
  [[-78.3, 18.4], [-77.0, 18.5], [-76.2, 18.0], [-77.2, 17.8]],
  // Puerto Rico
  [[-67.2, 18.5], [-65.6, 18.4], [-65.7, 18.0], [-67.1, 18.0]],
]

/** Los cuatro países del libro (clave = `name` de registry.json). */
export const COUNTRY_SHAPES = {
  Panamá: [
    [-82.9, 8.1], [-82.6, 9.5], [-81.4, 8.8], [-79.9, 9.4], [-78.4, 9.4],
    [-77.3, 8.6], [-77.9, 7.2], [-78.4, 8.3], [-79.5, 8.9], [-80.4, 7.4], [-81.7, 8.0],
  ],
  Colombia: [
    [-77.3, 8.6], [-75.5, 10.4], [-74.2, 11.2], [-71.7, 12.4], [-72.2, 11.0],
    [-72.5, 9.0], [-72.4, 8.4], [-72.0, 7.0], [-70.1, 7.0], [-67.8, 6.2],
    [-67.4, 3.8], [-67.8, 2.0], [-66.9, 1.2], [-69.8, 1.0], [-69.4, -1.2],
    [-70.0, -4.2], [-72.9, -2.5], [-75.2, -0.2], [-77.2, 0.8], [-78.7, 1.6],
    [-77.3, 4.0], [-77.4, 6.5], [-77.9, 7.2],
  ],
  Venezuela: [
    [-71.3, 11.8], [-70.0, 11.6], [-68.4, 10.5], [-66.9, 10.6], [-64.0, 10.6],
    [-62.3, 10.6], [-61.6, 9.9], [-60.0, 8.5], [-61.4, 5.9], [-60.7, 4.9],
    [-62.8, 4.0], [-64.6, 4.1], [-64.0, 2.3], [-65.5, 0.8], [-66.9, 1.2],
    [-67.8, 2.0], [-67.4, 3.8], [-67.8, 6.2], [-70.1, 7.0], [-72.0, 7.0],
    [-72.4, 8.4], [-72.5, 9.0], [-72.2, 11.0], [-71.6, 10.4],
  ],
  Bolivia: [
    [-69.6, -10.9], [-68.6, -11.1], [-66.0, -9.8], [-65.3, -10.9], [-63.7, -12.5],
    [-60.5, -13.8], [-60.2, -16.3], [-58.3, -16.4], [-57.6, -19.0], [-59.0, -19.3],
    [-62.3, -20.5], [-62.8, -22.0], [-64.4, -22.7], [-66.2, -21.8], [-67.2, -22.8],
    [-68.2, -21.4], [-68.8, -19.5], [-69.5, -17.6], [-69.4, -15.3], [-68.9, -12.9],
  ],
}

/* ── Proyección ─────────────────────────────────────────────────────────
   Ojo de pez de Sarkar-Brown: g(x) = (m+1)x / (mx+1), con x = d/D.
   Aumento en el foco = m+1; en d = D el punto no se mueve.            */
const FOCUS = [-72, 2]
const D = 60
const M = 1.7

function fisheye([lon, lat]) {
  const dx = lon - FOCUS[0]
  const dy = lat - FOCUS[1]
  const d = Math.hypot(dx, dy)
  if (!d) return [0, 0]
  const x = d / D
  const g = (((M + 1) * x) / (M * x + 1)) * D
  return [(dx / d) * g, (dy / d) * g]
}

/**
 * Proyector para un rectángulo del lienzo. Encaja la costa completa en
 * `box` = {x, y, w, h} conservando la proporción y alineándola a la
 * derecha y abajo (el océano Pacífico queda libre para el título).
 */
export function makeProjector(box) {
  const pts = COAST.map(fisheye)
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => -p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const k = Math.min(box.w / (maxX - minX), box.h / (maxY - minY))
  const offX = box.x + box.w - (maxX - minX) * k
  const offY = box.y + box.h - (maxY - minY) * k

  return (lonlat) => {
    const [fx, fy] = fisheye(lonlat)
    return [offX + (fx - minX) * k, offY + (-fy - minY) * k]
  }
}

const r = (n) => Math.round(n * 10) / 10

/** Contorno cerrado y suavizado (Catmull-Rom → Bézier cúbicas). */
export function smoothClosedPath(points, tension = 0.5) {
  const n = points.length
  if (n < 3) return ''
  const t = tension / 3
  let d = `M${r(points[0][0])},${r(points[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t]
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t]
    d += `C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`
  }
  return `${d}Z`
}

/** Línea abierta muestreada (para la retícula curva de la lente). */
export function polyline(points) {
  return points.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])},${r(p[1])}`).join('')
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

/** Punto y rumbo (grados, 0 = este) en la fracción `t` de un `arc()`. */
export function arcPoint(a, b, bend = 0.25, t = 0.5) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const c = [(a[0] + b[0]) / 2 + dy * bend, (a[1] + b[1]) / 2 - dx * bend]
  const u = 1 - t
  const x = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0]
  const y = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]
  const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0])
  const ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1])
  return { x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI }
}
