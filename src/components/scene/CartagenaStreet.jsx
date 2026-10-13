import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Pintura de fachada: los colores de la chiva aclarados como la cal vieja
   de las casas del Centro Histórico. Todo sale de tokens. */
const tint = (token, pct) => `color-mix(in srgb, var(--color-${token}) ${pct}%, white)`
const FACHADAS = [
  tint('amarillo', 78),
  tint('rojo', 55),
  tint('verde', 55),
  tint('morado', 45),
  tint('amarillo', 50),
  'color-mix(in srgb, var(--color-rojo) 45%, var(--color-amarillo))',
  tint('azul', 35),
]

const W = 1600
const H = 420

/* Casas de la calle: ancho, alto (fracción de H) y detalles. Fijas, para
   que la calle no cambie entre visitas. */
const CASAS = [
  { w: 190, h: 0.78, balcon: true, flores: true },
  { w: 150, h: 0.64, balcon: false, flores: false },
  { w: 220, h: 0.86, balcon: true, flores: false },
  { w: 170, h: 0.7, balcon: true, flores: true },
  { w: 140, h: 0.6, balcon: false, flores: true },
  { w: 210, h: 0.82, balcon: true, flores: false },
  { w: 160, h: 0.68, balcon: true, flores: true },
  { w: 200, h: 0.76, balcon: false, flores: false },
  { w: 180, h: 0.88, balcon: true, flores: true },
]

function Casa({ x, w, h, color, balcon, flores }) {
  const top = H - h
  const vents = Math.max(2, Math.round(w / 70))
  const gap = w / vents
  const winW = Math.min(34, gap * 0.5)
  const altoPlanta = h / 2
  return (
    <g data-casa>
      {/* Muro y cornisa */}
      <rect x={x} y={top} width={w} height={h} fill={color} />
      <rect x={x - 4} y={top - 8} width={w + 8} height={10} fill="var(--color-paper)" opacity="0.9" />
      <rect x={x} y={top + 2} width={w} height={6} fill="var(--color-ink)" opacity="0.08" />

      {/* Ventanas altas con postigos de madera, en las dos plantas */}
      {[0, 1].map((planta) =>
        Array.from({ length: vents }, (_, i) => {
          const cx = x + gap * (i + 0.5)
          const wy = top + 22 + planta * altoPlanta
          const wh = Math.min(70, altoPlanta - 44)
          if (planta === 1 && i === Math.floor(vents / 2)) {
            /* Puerta con arco en la planta baja */
            const dw = winW + 10
            return (
              <path
                key={`d${i}`}
                d={`M${cx - dw / 2},${H} V${H - wh - 14} a${dw / 2},${dw / 2} 0 0 1 ${dw},0 V${H} Z`}
                fill="var(--color-madera)"
              />
            )
          }
          return (
            <g key={`${planta}-${i}`}>
              <rect x={cx - winW / 2} y={wy} width={winW} height={wh} rx={winW / 2} ry={winW / 2} fill="var(--color-madera)" />
              <rect x={cx - 1} y={wy + 6} width="2" height={wh - 6} fill="var(--color-ink)" opacity="0.25" />
            </g>
          )
        }),
      )}

      {/* Balcón de madera corrido en la planta alta */}
      {balcon && (
        <g>
          <rect x={x + 8} y={top + 22 + Math.min(70, altoPlanta - 44) - 6} width={w - 16} height={8} fill="var(--color-madera)" />
          {Array.from({ length: Math.floor((w - 16) / 9) }, (_, i) => (
            <rect
              key={i}
              x={x + 10 + i * 9}
              y={top + 22 + Math.min(70, altoPlanta - 44) - 26}
              width="3"
              height="20"
              fill="var(--color-madera)"
            />
          ))}
          <rect x={x + 8} y={top + 22 + Math.min(70, altoPlanta - 44) - 28} width={w - 16} height={4} fill="var(--color-madera)" />
        </g>
      )}

      {/* Buganvilla cayendo del balcón */}
      {flores && (
        <g data-flores>
          {Array.from({ length: 14 }, (_, i) => {
            const fx = x + 14 + ((i * 37) % (w - 28))
            const fy = top + 14 + ((i * 23) % 46)
            return (
              <circle
                key={i}
                cx={fx}
                cy={fy}
                r={5 + (i % 3)}
                fill={i % 3 === 0 ? 'var(--color-rojo)' : 'color-mix(in srgb, var(--color-morado) 55%, var(--color-rojo))'}
              />
            )
          })}
          {Array.from({ length: 5 }, (_, i) => (
            <circle key={`h${i}`} cx={x + 20 + i * 18} cy={top + 10 + (i % 2) * 8} r="4" fill="var(--color-verde-ink)" />
          ))}
        </g>
      )}
    </g>
  )
}

/**
 * Fondo de la banda de lecciones del Módulo 1: una calle del Centro
 * Histórico de Cartagena. Fachadas de colores con balcones de madera y
 * buganvillas; arriba, banderines de fiesta que se mecen. Las fachadas
 * suben escalonadas al entrar. Va detrás de las tarjetas, sin eventos.
 */
export default function CartagenaStreet() {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root || reduced()) return
    const casas = root.querySelectorAll('[data-casa]')
    const banderines = root.querySelectorAll('[data-banderin]')
    casas.forEach((c) => (c.style.opacity = '0'))
    const a1 = animate(casas, {
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
      delay: stagger(60),
      ease: 'outQuart',
    })
    /* Banderines: vaivén continuo, desfasado, como con brisa del mar */
    const a2 = animate(banderines, {
      rotate: [-7, 7],
      duration: 1600,
      delay: stagger(90),
      ease: 'inOutSine',
      loop: true,
      alternate: true,
    })
    return () => {
      a1.revert()
      a2.revert()
    }
  }, [])

  let x = -20
  const casas = []
  let i = 0
  while (x < W) {
    const c = CASAS[i % CASAS.length]
    casas.push({ ...c, x, h: c.h * H, color: FACHADAS[i % FACHADAS.length], key: i })
    x += c.w
    i++
  }

  /* Cuerda de banderines: una catenaria de lado a lado */
  const sag = 34
  const ropeY = (t) => 14 + sag * 4 * t * (1 - t)
  const N = 26
  const BANDERIN = ['amarillo', 'rojo', 'verde', 'azul', 'morado']

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        <rect width={W} height={H} fill="var(--color-cielo)" />
        {casas.map((c) => (
          <Casa key={c.key} {...c} />
        ))}
      </svg>

      {/* Banderines en su propio SVG anclado arriba, para que no los recorte
          el "slice" de la calle */}
      <svg viewBox={`0 0 ${W} 90`} preserveAspectRatio="xMidYMin slice" className="absolute inset-x-0 top-0 h-[70px] w-full">
        <path
          d={`M0,${ropeY(0)} Q${W / 2},${14 + sag * 2} ${W},${ropeY(1)}`}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        {Array.from({ length: N }, (_, k) => {
          const t = (k + 0.5) / N
          const bx = t * W
          const by = ropeY(t)
          return (
            <g key={k} transform={`translate(${bx} ${by})`}>
              <path
                data-banderin
                d="M-16,0 L16,0 L0,34 Z"
                fill={`var(--color-${BANDERIN[k % BANDERIN.length]})`}
                style={{ transformOrigin: '50% 0%', transformBox: 'fill-box' }}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
