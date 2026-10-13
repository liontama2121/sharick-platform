import { useEffect, useId, useRef } from 'react'
import { animate, stagger } from 'animejs'

import Chiva from '../decor/Chiva'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const W = 1600
const H = 420

/* Pintura: todo sale de los tokens, mezclados para dar profundidad
   (lo lejano se aclara y se azula, como la bruma de la sabana). */
const mix = (a, pa, b) => `color-mix(in srgb, var(--color-${a}) ${pa}%, ${b})`
const C = {
  cieloAlto: mix('azul', 38, 'var(--color-cielo)'),
  lejosA: mix('azul', 22, 'var(--color-paper)'),
  lejosB: mix('azul', 40, 'var(--color-paper)'),
  ciudad: mix('azul', 40, 'var(--color-paper)'),
  cerrosA: mix('verde-ink', 45, 'var(--color-azul)'),
  cerrosB: mix('verde-ink', 80, 'var(--color-azul)'),
  lomasA: mix('verde', 80, 'var(--color-amarillo)'),
  lomasB: mix('verde-ink', 85, 'var(--color-azul)'),
  pradoA: mix('verde', 70, 'var(--color-amarillo)'),
  pradoB: mix('verde', 60, 'var(--color-verde-ink)'),
  via: mix('ink', 82, 'var(--color-azul)'),
  ladrillo: [
    mix('rojo', 48, 'var(--color-madera)'),
    mix('rojo', 30, 'var(--color-madera)'),
    mix('madera', 80, 'var(--color-paper)'),
  ],
  pintada: [
    mix('amarillo', 70, 'var(--color-paper)'),
    mix('azul', 30, 'var(--color-paper)'),
    mix('verde', 45, 'var(--color-paper)'),
    mix('rojo', 40, 'var(--color-paper)'),
  ],
  tronco: mix('ink-soft', 35, 'var(--color-paper)'),
  naranja: mix('amarillo', 65, 'var(--color-rojo)'),
}

const RIDGE_FAR =
  'M0,250 C120,212 200,172 300,190 S460,132 560,160 S720,122 820,150 S1000,108 1120,140 S1320,118 1420,160 S1560,170 1600,182 V420 H0Z'
/* Cerros Orientales de Bogotá, con Monserrate en (980, 118) */
const RIDGE_MID =
  'M0,300 C120,270 260,250 380,262 S600,240 700,226 S880,172 920,142 Q980,108 1040,142 S1180,232 1300,232 S1480,240 1600,242 V420 H0Z'
/* Lomas de Medellín */
const HILL = [
  [0, 340], [140, 312], [260, 306], [380, 322], [560, 352], [700, 350],
  [900, 292], [1060, 268], [1200, 254], [1300, 250], [1460, 278], [1600, 296],
]
const RIDGE_NEAR = `M${HILL.map((p) => p.join(',')).join(' L')} V420 H0Z`
const MEADOW = 'M0,366 C200,350 400,356 600,364 S1000,350 1200,360 S1500,354 1600,350 V420 H0Z'

function hillY(x) {
  for (let i = 1; i < HILL.length; i++) {
    const [x0, y0] = HILL[i - 1]
    const [x1, y1] = HILL[i]
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return HILL[HILL.length - 1][1]
}

/* Casitas de ladrillo en la ladera (Medellín). Determinista. */
const CASAS = []
for (let x = 960, k = 0; x < 1560; x += 24, k++) {
  const base = hillY(x + 10)
  for (let row = 0; row < 4; row++) {
    const h = 13 + ((k * 7 + row * 3) % 6)
    CASAS.push({
      x: x + (row % 2) * 9,
      y: base + 10 + row * 21 - h,
      w: 19 + ((k + row) % 3) * 2,
      h,
      fill: (k + row * 2) % 5 === 0 ? C.pintada[(k + row) % 4] : C.ladrillo[(k * 3 + row) % 3],
    })
  }
}

const TORRES = [
  [670, 46], [700, 70], [728, 38], [750, 96], [774, 58], [800, 120], [822, 74], [850, 52], [878, 88], [906, 44], [932, 64],
]

/* Cables quietos: teleférico de Monserrate y metrocable de Medellín */
const CABLES = [
  { a: [690, 340], b: [972, 122], color: 'var(--color-rojo)', at: [0.3, 0.7] },
  { a: [960, 352], b: [1440, 232], color: 'var(--color-amarillo)', at: [0.2, 0.5, 0.8] },
]

function Palma({ x, h }) {
  const top = 400 - h
  return (
    <g>
      <path d={`M${x},400 Q${x + 4},${400 - h / 2} ${x + 2},${top}`} stroke={C.tronco} strokeWidth="6" fill="none" strokeLinecap="round" />
      {[-150, -120, -90, -60, -30, -170, -10].map((ang, i) => {
        const rad = (ang * Math.PI) / 180
        const L = 42 + (i % 3) * 8
        return (
          <path
            key={ang}
            d={`M${x + 2},${top} Q${x + 2 + Math.cos(rad) * L * 0.5},${top + Math.sin(rad) * L * 0.6 - 8} ${x + 2 + Math.cos(rad) * L},${top + Math.sin(rad) * L * 0.7 + 18}`}
            stroke="var(--color-verde-ink)"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        )
      })}
    </g>
  )
}

/**
 * Colombia andina para el libro A1: Bogotá al pie de los Cerros Orientales
 * con Monserrate y su teleférico, las lomas de Medellín con casitas de
 * ladrillo y metrocable, palmas de cera, guayacán y, con `chiva`, LA CHIVA
 * (símbolo del libro) en la carretera del primer plano.
 *
 * Profundidad en vez de plano: degradados de luz en cada capa, bruma entre
 * capas, resplandor de sol y viñeta. Movimiento contenido, sin bucles: las
 * capas se asientan una vez (outExpo), la chiva llega rodando y frena con
 * el muelle; al pasar el puntero, paralaje suave por capas.
 *
 * `chiva`: { x, scale } — centro de la chiva en el viewBox 1600x420.
 */
export default function AndesScene({ className = '', chiva = null }) {
  const ref = useRef(null)
  const uid = useId().replace(/:/g, '')
  const g = (n) => `${uid}-${n}`

  useEffect(() => {
    const root = ref.current
    if (!root || reduced()) return
    const q = (s) => [...root.querySelectorAll(s)]
    const anims = []

    /* Entrada: las capas se asientan de atrás hacia adelante */
    anims.push(
      animate(q('[data-capa]'), {
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 1100,
        delay: stagger(90),
        ease: 'outExpo',
      }),
    )

    /* La chiva llega rodando desde la izquierda y frena con el muelle */
    const bus = root.querySelector('[data-chiva]')
    if (bus) {
      anims.push(animate(bus, { translateX: [-1100, 0], duration: 2200, delay: 350, ease: 'outExpo' }))
      anims.push(animate(q('[data-chiva] [data-wheel]'), { rotate: [-1260, 0], duration: 2200, delay: 350, ease: 'outExpo' }))
      anims.push(
        animate(q('[data-chiva] [data-body]'), {
          translateY: [0, 0, -3, 1.5, 0],
          duration: 2600,
          delay: 350,
          ease: 'outQuad',
        }),
      )
    }

    /* Paralaje al pasar el puntero por la card / cabecera que la contiene */
    const host = root.parentElement
    const layers = q('[data-depth]')
    const move = (e) => {
      const r = host.getBoundingClientRect()
      const dx = (e.clientX - r.left) / r.width - 0.5
      const dy = (e.clientY - r.top) / r.height - 0.5
      layers.forEach((el) => {
        const d = Number(el.dataset.depth)
        animate(el, { translateX: -dx * d * 28, translateY: -dy * d * 8, duration: 700, ease: 'outQuart' })
      })
    }
    const leave = () =>
      layers.forEach((el) => animate(el, { translateX: 0, translateY: 0, duration: 900, ease: 'outQuart' }))
    host?.addEventListener('pointermove', move)
    host?.addEventListener('pointerleave', leave)

    return () => {
      anims.forEach((a) => a.revert())
      host?.removeEventListener('pointermove', move)
      host?.removeEventListener('pointerleave', leave)
    }
  }, [])

  const cs = chiva?.scale ?? 0.8

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={g('cielo')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cieloAlto} />
            <stop offset="0.75" stopColor="var(--color-cielo)" />
          </linearGradient>
          <radialGradient id={g('sol')} cx="0.8" cy="0.2" r="0.5">
            <stop offset="0" stopColor="var(--color-amarillo)" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="var(--color-amarillo)" stopOpacity="0.15" />
            <stop offset="1" stopColor="var(--color-amarillo)" stopOpacity="0" />
          </radialGradient>
          {[
            ['lejos', C.lejosA, C.lejosB],
            ['cerros', C.cerrosA, C.cerrosB],
            ['lomas', C.lomasA, C.lomasB],
            ['prado', C.pradoA, C.pradoB],
          ].map(([n, a, b]) => (
            <linearGradient key={n} id={g(n)} x1="0" y1="0" x2="0.15" y2="1">
              <stop offset="0" stopColor={a} />
              <stop offset="1" stopColor={b} />
            </linearGradient>
          ))}
          {/* Bruma: blanco que sube desde la base de cada capa lejana */}
          <linearGradient id={g('bruma')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.35" stopColor="var(--color-paper)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-paper)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={g('via')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.via} />
            <stop offset="1" stopColor="var(--color-chasis)" />
          </linearGradient>
          <linearGradient id={g('vineta')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0.6" stopColor="var(--color-chasis)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-chasis)" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#${g('cielo')})`} />
        <rect width={W} height={H} fill={`url(#${g('sol')})`} />
        <circle cx="1290" cy="92" r="40" fill="var(--color-amarillo)" opacity="0.95" />

        {/* Nubes altas, suaves */}
        <g fill="var(--color-paper)" opacity="0.8" data-depth="0.15">
          <ellipse cx="220" cy="70" rx="90" ry="16" />
          <ellipse cx="270" cy="58" rx="52" ry="18" />
          <ellipse cx="1480" cy="150" rx="70" ry="12" />
          <ellipse cx="640" cy="40" rx="60" ry="10" />
        </g>

        <g data-capa>
          <g data-depth="0.2">
            <path d={RIDGE_FAR} fill={`url(#${g('lejos')})`} />
            <rect y="120" width={W} height="160" fill={`url(#${g('bruma')})`} />
          </g>
        </g>

        <g data-capa>
          <g data-depth="0.4">
            <path d={RIDGE_MID} fill={`url(#${g('cerros')})`} />
            {/* Monserrate */}
            <rect x="963" y="98" width="34" height="22" fill="var(--color-paper)" />
            <path d="M959,100 L980,86 L1001,100Z" fill="var(--color-rojo-ink)" />
            <rect x="974" y="72" width="11" height="22" fill="var(--color-paper)" />
            <path d="M972,74 L979.5,64 L987,74Z" fill="var(--color-rojo-ink)" />
            <rect x="977" y="104" width="7" height="16" rx="3.5" fill="var(--color-madera)" />
            <rect y="200" width={W} height="140" fill={`url(#${g('bruma')})`} opacity="0.7" />
            {/* Bogotá al pie de los cerros, con su cara en sombra */}
            <g fill={C.ciudad}>
              {TORRES.map(([x, h]) => (
                <g key={x}>
                  <rect x={x} y={300 - h} width="22" height={h + 40} />
                  <rect x={x + 14} y={300 - h} width="8" height={h + 40} fill="var(--color-azul)" opacity="0.14" />
                </g>
              ))}
              <path d="M800,180 l11,-14 l11,14Z" />
            </g>
          </g>
        </g>

        <g data-capa>
          <g data-depth="0.6">
            <path d={RIDGE_NEAR} fill={`url(#${g('lomas')})`} />
            {CASAS.map((c, i) => (
              <g key={i}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
                <rect x={c.x + c.w - 5} y={c.y} width="5" height={c.h} fill="var(--color-ink)" opacity="0.18" />
                <rect x={c.x} y={c.y - 3} width={c.w} height="3" fill="var(--color-madera)" />
                <rect x={c.x + 4} y={c.y + 4} width="4" height="5" fill="var(--color-paper)" opacity="0.85" />
              </g>
            ))}
            {CABLES.map((cb, ci) => (
              <g key={ci}>
                <line x1={cb.a[0]} y1={cb.a[1]} x2={cb.b[0]} y2={cb.b[1]} stroke="var(--color-ink)" strokeOpacity="0.5" strokeWidth="1.6" />
                {cb.at.map((p) => {
                  const x = cb.a[0] + (cb.b[0] - cb.a[0]) * p
                  const y = cb.a[1] + (cb.b[1] - cb.a[1]) * p
                  return (
                    <g key={p} transform={`translate(${x} ${y})`}>
                      <line x1="0" y1="0" x2="0" y2="9" stroke="var(--color-ink)" strokeWidth="1.6" />
                      <rect x="-10" y="9" width="20" height="15" rx="4" fill={cb.color} />
                      <rect x="-6.5" y="12" width="13" height="6" rx="1.5" fill="var(--color-paper)" opacity="0.9" />
                    </g>
                  )
                })}
              </g>
            ))}
          </g>
        </g>

        <g data-capa>
          <g data-depth="0.8">
            <path d={MEADOW} fill={`url(#${g('prado')})`} />
            {/* Guayacán amarillo */}
            <path
              d="M236,384 C238,350 232,330 240,302 M238,330 C226,318 214,314 206,306 M240,316 C252,306 262,302 272,292"
              stroke="var(--color-madera)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            {[[206, 298, 20], [236, 278, 30], [268, 286, 22], [222, 270, 18], [252, 264, 20], [240, 294, 18]].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 2 ? C.naranja : 'var(--color-amarillo)'} />
            ))}
            <Palma x={430} h={250} />
            <Palma x={486} h={214} />
            <Palma x={1536} h={236} />
          </g>
        </g>

        {/* Carretera y chiva en el primer plano */}
        {chiva && (
          <g data-capa>
            <g data-depth="1">
              <path d="M0,372 C400,366 1200,366 1600,372 V420 H0Z" fill={`url(#${g('via')})`} />
              <path d="M0,374 C400,368 1200,368 1600,374" stroke="var(--color-paper)" strokeOpacity="0.55" strokeWidth="2" fill="none" />
              <path d="M0,398 C400,394 1200,394 1600,398" stroke="var(--color-amarillo)" strokeWidth="4" strokeDasharray="38 30" fill="none" />
              <g data-chiva>
                <Chiva x={chiva.x - (560 * cs) / 2} y={402 - 300 * cs} width={560 * cs} height={320 * cs} />
              </g>
            </g>
          </g>
        )}
        <rect width={W} height={H} fill={`url(#${g('vineta')})`} />
      </svg>
    </div>
  )
}
