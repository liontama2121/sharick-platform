import { useEffect, useId, useRef } from 'react'
import { animate, stagger } from 'animejs'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const W = 1600
const H = 420

/* Pintura: todo sale de los tokens, mezclados para dar profundidad
   (lo lejano se aclara y se azula, como la bruma de la sabana). */
const mix = (a, pa, b) => `color-mix(in srgb, var(--color-${a}) ${pa}%, ${b})`
const C = {
  cieloAlto: mix('azul', 30, 'var(--color-cielo)'),
  lejos: mix('azul', 32, 'white'),
  ciudad: mix('azul', 48, 'white'),
  cerros: mix('verde-ink', 62, 'var(--color-azul)'),
  lomas: mix('verde', 62, 'var(--color-verde-ink)'),
  prado: mix('verde', 82, 'var(--color-amarillo)'),
  ladrillo: [
    mix('rojo', 48, 'var(--color-madera)'),
    mix('rojo', 30, 'var(--color-madera)'),
    mix('madera', 80, 'white'),
  ],
  pintada: [mix('amarillo', 70, 'white'), mix('azul', 30, 'white'), mix('verde', 45, 'white'), mix('rojo', 40, 'white')],
  tronco: mix('ink-soft', 35, 'white'),
  naranja: mix('amarillo', 65, 'var(--color-rojo)'),
}

/* Crestas (de atrás hacia adelante) */
const RIDGE_FAR =
  'M0,250 C120,212 200,172 300,190 S460,132 560,160 S720,122 820,150 S1000,108 1120,140 S1320,118 1420,160 S1560,170 1600,182 V420 H0Z'
/* Cerros Orientales de Bogotá, con Monserrate en (980, 118): al centro,
   para que ningún rótulo lo tape y la card (recorte central) lo muestre */
const RIDGE_MID =
  'M0,300 C120,270 260,250 380,262 S600,240 700,226 S880,172 920,142 Q980,108 1040,142 S1180,232 1300,232 S1480,240 1600,242 V420 H0Z'
/* Lomas de Medellín: la ladera de la derecha se llena de casitas */
const HILL = [
  [0, 340], [140, 312], [260, 306], [380, 322], [560, 352], [700, 350],
  [900, 292], [1060, 268], [1200, 254], [1300, 250], [1460, 278], [1600, 296],
]
const RIDGE_NEAR = `M${HILL.map((p) => p.join(',')).join(' L')} V420 H0Z`
const MEADOW = 'M0,384 C200,362 400,372 600,382 S1000,362 1200,376 S1500,370 1600,366 V420 H0Z'

/* Altura de la loma cercana en x (interpolación lineal de HILL) */
function hillY(x) {
  for (let i = 1; i < HILL.length; i++) {
    const [x0, y0] = HILL[i - 1]
    const [x1, y1] = HILL[i]
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return HILL[HILL.length - 1][1]
}

/* Casitas de ladrillo en la ladera (Medellín): filas que bajan por la loma,
   la mayoría ladrillo y algunas pintadas. Determinista. */
const CASAS = []
for (let x = 960, k = 0; x < 1560; x += 24, k++) {
  const base = hillY(x + 10)
  for (let row = 0; row < 4; row++) {
    const h = 13 + ((k * 7 + row * 3) % 6)
    const y = base + 10 + row * 21 - h
    const painted = (k + row * 2) % 5 === 0
    CASAS.push({
      x: x + (row % 2) * 9,
      y,
      w: 19 + ((k + row) % 3) * 2,
      h,
      fill: painted ? C.pintada[(k + row) % 4] : C.ladrillo[(k * 3 + row) % 3],
    })
  }
}

/* Bogotá al pie de los cerros: torres en la bruma, la más alta con remate */
const TORRES = [
  [670, 46], [700, 70], [728, 38], [750, 96], [774, 58], [800, 120], [822, 74], [850, 52], [878, 88], [906, 44], [932, 64],
]

/* Cables: teleférico de Monserrate (Bogotá) y metrocable (Medellín) */
const CABLES = [
  { a: [690, 340], b: [972, 122], color: 'var(--color-rojo)', cabins: 3, period: 14000 },
  { a: [960, 352], b: [1440, 232], color: 'var(--color-amarillo)', cabins: 4, period: 18000 },
]

const NUBES = [
  { y: 58, s: 1, speed: 0.6, off: 0.1 },
  { y: 96, s: 0.7, speed: 0.9, off: 0.45 },
  { y: 40, s: 0.55, speed: 1.1, off: 0.75 },
  { y: 120, s: 0.8, speed: 0.7, off: 0.9 },
]

const PAJAROS = [
  { y: 90, off: 0, speed: 1.6 },
  { y: 112, off: 0.08, speed: 1.6 },
  { y: 74, off: 0.5, speed: 1.3 },
]

function Nube() {
  return (
    <g fill="var(--color-paper)">
      <ellipse cx="0" cy="0" rx="62" ry="20" />
      <circle cx="-26" cy="-12" r="22" />
      <circle cx="10" cy="-20" r="28" />
      <circle cx="40" cy="-8" r="18" />
    </g>
  )
}

function Palma({ x, h }) {
  const top = 400 - h
  return (
    <g data-palma style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
      <path d={`M${x},400 Q${x + 4},${400 - h / 2} ${x + 2},${top}`} stroke={C.tronco} strokeWidth="6" fill="none" strokeLinecap="round" />
      {[-150, -120, -90, -60, -30, -170, -10].map((ang, i) => {
        const rad = (ang * Math.PI) / 180
        const L = 42 + (i % 3) * 8
        const ex = x + 2 + Math.cos(rad) * L
        const ey = top + Math.sin(rad) * L * 0.7 + 18
        return (
          <path
            key={ang}
            d={`M${x + 2},${top} Q${x + 2 + Math.cos(rad) * L * 0.5},${top + Math.sin(rad) * L * 0.6 - 8} ${ex},${ey}`}
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

function Cafetal({ x }) {
  return (
    <g>
      <ellipse cx={x} cy="396" rx="34" ry="20" fill="var(--color-verde-ink)" />
      <ellipse cx={x - 16} cy="390" rx="18" ry="13" fill={C.lomas} />
      {[[-12, 392], [6, 386], [18, 398], [-2, 402], [24, 390]].map(([dx, y], i) => (
        <circle key={i} cx={x + dx} cy={y} r="3.2" fill="var(--color-rojo)" />
      ))}
    </g>
  )
}

/**
 * Colombia andina en movimiento, para el libro A1 (card del Home, menú del
 * libro y Módulo 1): Bogotá al pie de los Cerros Orientales con Monserrate
 * y su teleférico, las lomas de Medellín llenas de casitas de ladrillo con
 * el metrocable, palmas de cera, un guayacán amarillo soltando flores,
 * cafetales, nubes y pájaros. Las capas suben al entrar; después todo vive
 * en bucle con un solo reloj de Anime.js. Va detrás del contenido.
 */
export default function AndesScene({ className = '' }) {
  const ref = useRef(null)
  const sky = `andes-cielo-${useId().replace(/:/g, '')}`

  useEffect(() => {
    const root = ref.current
    if (!root || reduced()) return
    const q = (s) => [...root.querySelectorAll(s)]
    const anims = []

    const capas = q('[data-capa]')
    capas.forEach((c) => (c.style.opacity = '0'))
    anims.push(
      animate(capas, { opacity: [0, 1], translateY: [36, 0], duration: 900, delay: stagger(110), ease: 'outQuart' }),
    )

    /* Palmas: vaivén lento, cada una a su ritmo */
    q('[data-palma]').forEach((p, i) =>
      anims.push(
        animate(p, {
          rotate: [-1.6, 1.6],
          duration: 2600 + i * 500,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        }),
      ),
    )
    /* Sol: el halo respira */
    anims.push(
      animate(q('[data-halo]'), { scale: [1, 1.18], opacity: [0.35, 0.15], duration: 2400, ease: 'inOutSine', loop: true, alternate: true }),
    )

    /* Un solo reloj para lo que viaja: cabinas, nubes, pájaros, flores */
    const cabinas = CABLES.map((_, ci) => q(`[data-cabina="${ci}"]`))
    const nubes = q('[data-nube]')
    const pajaros = q('[data-pajaro]')
    const alas = q('[data-ala]')
    const petalos = q('[data-petalo]')
    const reloj = { t: 0 }
    anims.push(
      animate(reloj, {
        t: [0, 120000],
        duration: 120000,
        ease: 'linear',
        loop: true,
        onUpdate: () => {
          const t = reloj.t
          CABLES.forEach((cb, ci) => {
            cabinas[ci].forEach((el, k) => {
              const p = ((t / cb.period + k / cb.cabins) % 1 + 1) % 1
              const x = cb.a[0] + (cb.b[0] - cb.a[0]) * p
              const y = cb.a[1] + (cb.b[1] - cb.a[1]) * p
              el.setAttribute('transform', `translate(${x} ${y})`)
            })
          })
          nubes.forEach((el, i) => {
            const n = NUBES[i]
            const p = ((t / 90000) * n.speed + n.off) % 1
            el.setAttribute('transform', `translate(${-160 + p * (W + 320)} ${n.y}) scale(${n.s})`)
          })
          pajaros.forEach((el, i) => {
            const b = PAJAROS[i]
            const p = ((t / 40000) * b.speed + b.off) % 1
            const x = -60 + p * (W + 120)
            const y = b.y + Math.sin(p * 18) * 8
            el.setAttribute('transform', `translate(${x} ${y})`)
          })
          const flap = Math.sin(t / 110)
          alas.forEach((el) => el.setAttribute('transform', `scale(1 ${0.45 + 0.55 * Math.abs(flap)})`))
          petalos.forEach((el, i) => {
            const p = ((t / 7000) + i / petalos.length) % 1
            const x = 238 + Math.sin(p * 9 + i) * 22 + p * 40
            const y = 300 + p * 100
            el.setAttribute('transform', `translate(${x} ${y})`)
            el.setAttribute('opacity', String(p < 0.85 ? 1 : (1 - p) / 0.15))
          })
        },
      }),
    )

    return () => anims.forEach((a) => a.revert())
  }, [])

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={C.cieloAlto} />
            <stop offset="0.7" stopColor="var(--color-cielo)" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#${sky})`} />

        {/* Sol de la mañana */}
        <g>
          <circle data-halo cx="1290" cy="92" r="78" fill="var(--color-amarillo)" opacity="0.3" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
          <circle cx="1290" cy="92" r="46" fill="var(--color-amarillo)" />
        </g>

        {/* Nubes */}
        {NUBES.map((n, i) => (
          <g key={i} data-nube transform={`translate(${-160 + n.off * (W + 320)} ${n.y}) scale(${n.s})`} opacity="0.92">
            <Nube />
          </g>
        ))}

        {/* Cordillera lejana */}
        <path data-capa d={RIDGE_FAR} fill={C.lejos} />

        {/* Cerros Orientales con Monserrate y su teleférico */}
        <g data-capa>
          <path d={RIDGE_MID} fill={C.cerros} />
          <g>
            <rect x="963" y="98" width="34" height="22" fill="var(--color-paper)" />
            <path d="M959,100 L980,86 L1001,100Z" fill="var(--color-rojo-ink)" />
            <rect x="974" y="72" width="11" height="22" fill="var(--color-paper)" />
            <path d="M972,74 L979.5,64 L987,74Z" fill="var(--color-rojo-ink)" />
            <rect x="977" y="104" width="7" height="16" rx="3.5" fill="var(--color-madera)" />
          </g>
        </g>

        {/* Bogotá en la bruma, al pie de los cerros */}
        <g data-capa fill={C.ciudad}>
          {TORRES.map(([x, h]) => (
            <rect key={x} x={x} y={300 - h} width="22" height={h + 40} />
          ))}
          <path d="M800,180 l11,-14 l11,14Z" />
        </g>


        {/* Lomas de Medellín con sus casitas */}
        <g data-capa>
          <path d={RIDGE_NEAR} fill={C.lomas} />
          {CASAS.map((c, i) => (
            <g key={i}>
              <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
              <rect x={c.x} y={c.y - 3} width={c.w} height="3" fill="var(--color-madera)" />
              <rect x={c.x + 4} y={c.y + 4} width="4" height="5" fill="var(--color-paper)" opacity="0.85" />
              {c.w > 20 && <rect x={c.x + c.w - 8} y={c.y + 4} width="4" height="5" fill="var(--color-paper)" opacity="0.85" />}
            </g>
          ))}
        </g>

        {/* Cables con torres; las cabinas viajan por ellos */}
        <g data-capa>
          {CABLES.map((cb, ci) => (
            <g key={ci}>
              <line x1={cb.a[0]} y1={cb.a[1]} x2={cb.b[0]} y2={cb.b[1]} stroke="var(--color-ink)" strokeOpacity="0.55" strokeWidth="1.6" />
              {[0.33, 0.66].map((f) => {
                const x = cb.a[0] + (cb.b[0] - cb.a[0]) * f
                const y = cb.a[1] + (cb.b[1] - cb.a[1]) * f
                return <path key={f} d={`M${x - 6},${y + 34} L${x},${y} L${x + 6},${y + 34}`} stroke="var(--color-ink)" strokeOpacity="0.5" strokeWidth="2" fill="none" />
              })}
              {Array.from({ length: cb.cabins }, (_, k) => {
                const p = k / cb.cabins
                const x = cb.a[0] + (cb.b[0] - cb.a[0]) * p
                const y = cb.a[1] + (cb.b[1] - cb.a[1]) * p
                return (
                  <g key={k} data-cabina={ci} transform={`translate(${x} ${y})`}>
                    <line x1="0" y1="0" x2="0" y2="9" stroke="var(--color-ink)" strokeWidth="1.6" />
                    <rect x="-10" y="9" width="20" height="15" rx="4" fill={cb.color} />
                    <rect x="-6.5" y="12" width="13" height="6" rx="1.5" fill="var(--color-paper)" opacity="0.9" />
                  </g>
                )
              })}
            </g>
          ))}
        </g>

        {/* Pájaros */}
        {PAJAROS.map((b, i) => (
          <g key={i} data-pajaro transform={`translate(${-60 + b.off * (W + 120)} ${b.y})`}>
            <g data-ala>
              <path d="M-9,0 Q-4,-6 0,0 Q4,-6 9,0" stroke="var(--color-ink)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          </g>
        ))}

        {/* Primer plano: prado, guayacán amarillo, palmas de cera y cafetal */}
        <g data-capa>
          <path d={MEADOW} fill={C.prado} />

          {/* Guayacán amarillo (Medellín lo pinta de amarillo cada año) */}
          <path d="M236,404 C238,370 232,350 240,322 M238,350 C226,338 214,334 206,326 M240,336 C252,326 262,322 272,312" stroke="var(--color-madera)" strokeWidth="6" fill="none" strokeLinecap="round" />
          {[[206, 318, 20], [236, 298, 30], [268, 306, 22], [222, 290, 18], [252, 284, 20], [240, 314, 18]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 2 ? C.naranja : 'var(--color-amarillo)'} />
          ))}

          <Palma x={540} h={250} />
          <Palma x={600} h={214} />
          <Palma x={1536} h={236} />

          {[70, 380, 700, 1010, 1180, 1330].map((x) => (
            <Cafetal key={x} x={x} />
          ))}
        </g>

        {/* Flores del guayacán cayendo */}
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} data-petalo r="3.4" fill={i % 2 ? 'var(--color-amarillo)' : C.naranja} transform="translate(238 300)" opacity="0" />
        ))}
      </svg>
    </div>
  )
}
