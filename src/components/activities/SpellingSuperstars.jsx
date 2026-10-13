import { useEffect, useId, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Headphones, Star, X } from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Estrella de 5 puntas (para el piso, las categorías y el bonus) */
const starPath = (cx, cy, R, r = R * 0.45) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 ? r : R
    return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`
  }).join('') + 'Z'

let clip = null

/** Silueta de una estrella del espectáculo: imagen si existe; si no, una
    silueta dibujada (cabeza + cuerpo) con luz de borde. */
function Silhouette({ src, name, pose = 0 }) {
  const [failed, setFailed] = useState(!src)
  if (!failed) {
    return <img src={src} alt={`Silhouette of ${name}`} onError={() => setFailed(true)} className="h-full w-full object-contain object-bottom" />
  }
  /* Tres poses: vestido y melena, saludando con la mano, traje largo y moño */
  const POSES = [
    {
      hair: 'M42,42 C38,16 82,16 78,42 C84,62 88,80 82,96 L38,96 C32,80 36,62 42,42Z',
      body: 'M60,62 C46,62 34,66 28,74 L18,122 L28,125 L38,92 L40,122 L24,236 L96,236 L80,122 L82,92 L90,112 L100,104 L92,74 C86,66 74,62 60,62Z',
    },
    {
      hair: 'M44,36 C44,20 76,20 76,36 L76,30 C72,22 48,22 44,30Z',
      body: 'M60,62 C44,62 30,66 24,74 L16,138 L26,140 L34,96 L38,150 L36,236 L56,236 L60,160 L64,236 L84,236 L82,150 L86,96 L92,70 L106,26 L116,30 L100,82 C96,68 76,62 60,62Z',
    },
    {
      hair: 'M44,38 C44,22 76,22 76,38Z M51,20 a9,9 0 1,0 18,0 a9,9 0 1,0 -18,0Z',
      body: 'M60,62 C47,62 36,66 30,74 L24,128 L33,130 L40,94 L42,128 L20,236 L100,236 L78,128 L80,94 L87,130 L96,128 L90,74 C84,66 73,62 60,62Z',
    },
  ]
  const { hair, body } = POSES[pose % POSES.length]
  const rim = { fill: 'var(--color-chasis)', stroke: 'var(--color-amarillo)', strokeOpacity: 0.6, strokeWidth: 2, strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 120 240" className="h-full w-full" role="img" aria-label={`Silhouette of ${name}`}>
      <title>{src}</title>
      <ellipse cx="60" cy="236" rx="48" ry="6" fill="var(--color-chasis)" opacity="0.6" />
      <path d={body} {...rim} />
      <rect x="54" y="52" width="12" height="14" fill="var(--color-chasis)" />
      <circle cx="60" cy="40" r="17" {...rim} />
      <path d={hair} {...rim} />
    </svg>
  )
}

/**
 * Exercise 5 · Spelling Superstars! — noche de estreno de cine, en SVG/CSS
 * con los tokens del libro: cielo azul noche con reflectores que barren,
 * alfombra roja en diagonal, estrellas doradas en el piso (Paseo de la
 * Fama), letrero de cine con bombillitas, dos estrellas de categoría
 * (🎤 cantante, 🎬 actor o actriz), siluetas de famosos sobre la alfombra
 * y un 🎧 de ejemplo que, al sonar, ENCIENDE un reflector sobre su
 * silueta. La ⭐ abre el bonus. Ocupa toda la página (layout "full-bleed").
 * section: { number, instruction, categories[], stars[], howTo[], bonus }
 */
export default function SpellingSuperstars({ section, onComplete }) {
  const rootRef = useRef(null)
  const [lit, setLit] = useState(null)
  const [bonus, setBonus] = useState(false)
  const heard = useRef(new Set())
  const reported = useRef(false)
  const offTimer = useRef(null)
  const uid = useId().replace(/:/g, '')

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced()) return
    const q = (s) => [...root.querySelectorAll(s)]
    const anims = [
      /* Reflectores: barrido lento y cruzado */
      ...q('[data-beam]').map((el, i) =>
        animate(el, {
          rotate: i % 2 ? [14, -10] : [-14, 10],
          duration: 5200 + i * 900,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        }),
      ),
      /* Bombillitas del letrero: parpadeo sutil en ola */
      animate(q('[data-bulb]'), {
        opacity: [1, 0.45],
        duration: 700,
        delay: stagger(60),
        ease: 'inOutSine',
        loop: true,
        alternate: true,
      }),
      /* Entrada: letrero, estrellas y siluetas */
      animate(q('[data-in]'), { opacity: [0, 1], translateY: [24, 0], duration: 800, delay: stagger(110), ease: 'outExpo' }),
    ]
    return () => anims.forEach((a) => a.revert())
  }, [])

  useEffect(
    () => () => {
      clip?.pause()
      clearTimeout(offTimer.current)
    },
    [],
  )

  /* 🎧 de ejemplo: suena el deletreo y se enciende su reflector */
  const playStar = (s, btn) => {
    if (btn && !reduced()) animate(btn, { scale: [1, 1.2, 1], duration: 380, ease: 'outQuad' })
    clip?.pause()
    clearTimeout(offTimer.current)
    setLit(s.name)
    /* Sin mp3 (aún no grabado) el reflector igual se ve 3 s */
    const off = (ms = 1800) => {
      clearTimeout(offTimer.current)
      offTimer.current = setTimeout(() => setLit((n) => (n === s.name ? null : n)), ms)
    }
    if (s.audio) {
      clip = new Audio(s.audio)
      clip.onended = () => off()
      clip.onerror = () => off(3000)
      clip.play().catch(() => off(3000))
    } else off(3000)
    heard.current.add(s.name)
    const withAudio = (section.stars ?? []).filter((x) => x.audio).length
    if (heard.current.size >= withAudio && !reported.current) {
      reported.current = true
      onComplete?.(100)
    }
  }

  const bulbs = []
  for (let i = 0; i < 22; i++) bulbs.push({ x: 18 + i * 33, y: 12 })
  for (let i = 0; i < 22; i++) bulbs.push({ x: 18 + i * 33, y: 128 })
  for (let i = 1; i < 4; i++) bulbs.push({ x: 10, y: 12 + i * 29 }, { x: 726, y: 12 + i * 29 })

  const stars = section.stars ?? []

  return (
    <div ref={rootRef} className="relative h-full w-full overflow-hidden rounded-[17px] bg-chasis">
      {/* ── Escenario: cielo, reflectores, piso y alfombra ── */}
      <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-chasis)" />
            <stop offset="0.65" stopColor="var(--color-azul)" />
          </linearGradient>
          <linearGradient id={`${uid}-haz`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="var(--color-amarillo)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--color-amarillo)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-alfombra`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-rojo-ink)" />
            <stop offset="0.5" stopColor="var(--color-rojo)" />
            <stop offset="1" stopColor="var(--color-rojo-ink)" />
          </linearGradient>
          <linearGradient id={`${uid}-piso`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="color-mix(in srgb, var(--color-chasis) 70%, var(--color-ink-soft))" />
            <stop offset="1" stopColor="var(--color-chasis)" />
          </linearGradient>
        </defs>
        <rect width="1600" height="1000" fill={`url(#${uid}-cielo)`} />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={(i * 397) % 1600} cy={(i * 131) % 420} r={i % 3 ? 1.5 : 2.5} fill="var(--color-paper)" opacity={0.35 + (i % 4) * 0.1} />
        ))}
        {/* Reflectores desde el piso */}
        {[
          [260, 0],
          [620, 1],
          [1000, 2],
          [1360, 3],
        ].map(([x, i]) => (
          <g key={x} data-beam style={{ transformBox: 'view-box', transformOrigin: `${x}px 640px` }}>
            <path d={`M${x - 14},640 L${x - 150},-40 L${x + 150},-40 L${x + 14},640Z`} fill={`url(#${uid}-haz)`} />
          </g>
        ))}
        {/* Piso con estrellas del Paseo de la Fama */}
        <path d="M0,600 L1600,560 V1000 H0Z" fill={`url(#${uid}-piso)`} />
        {[
          [110, 700], [300, 880], [1250, 660], [1440, 820], [1500, 640], [180, 930],
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 46} y={y - 30} width="92" height="60" rx="6" fill="color-mix(in srgb, var(--color-rojo-ink) 55%, var(--color-chasis))" />
            <path d={starPath(x, y, 24)} fill="var(--color-amarillo)" stroke="var(--color-paper)" strokeOpacity="0.5" />
          </g>
        ))}
        {/* Alfombra roja en diagonal */}
        <path d="M380,1000 L900,560 L1180,560 L780,1000Z" fill={`url(#${uid}-alfombra)`} />
        <path d="M380,1000 L900,560" stroke="var(--color-amarillo)" strokeWidth="6" />
        <path d="M780,1000 L1180,560" stroke="var(--color-amarillo)" strokeWidth="6" />
        {/* Postes con cordón dorado */}
        {[[860, 600], [760, 690], [1210, 600], [1120, 690]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <rect x={x - 4} y={y - 50} width="8" height="50" fill="var(--color-amarillo)" />
            <circle cx={x} cy={y - 54} r="8" fill="var(--color-amarillo)" />
          </g>
        ))}
        <path d="M860,560 Q810,610 760,640" stroke="var(--color-rojo)" strokeWidth="6" fill="none" />
        <path d="M1210,560 Q1165,610 1120,640" stroke="var(--color-rojo)" strokeWidth="6" fill="none" />
      </svg>

      {/* ── Letrero de cine ── */}
      <div data-in className="absolute left-1/2 top-[96px] w-[740px] -translate-x-1/2">
        <div className="relative h-[142px] rounded-[18px] border-[6px] border-amarillo bg-rojo-ink shadow-page">
          <svg viewBox="0 0 736 142" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {bulbs.map((b, i) => (
              <circle key={i} data-bulb cx={b.x} cy={b.y} r="6" fill="var(--color-amarillo)" stroke="var(--color-paper)" strokeWidth="1.5" />
            ))}
          </svg>
          <h2
            className="rotulo absolute inset-0 flex items-center justify-center text-[64px] leading-none text-amarillo"
            style={{ '--rotulo-sombra': 'var(--color-chasis)' }}
          >
            {section.title ?? 'Spelling Superstars!'}
          </h2>
        </div>
      </div>

      {/* ── Instrucción + estrellas de categoría (izquierda) ── */}
      <div data-in className="absolute left-[44px] top-[262px] w-[400px]">
        <div className="flex items-start gap-3">
          <span className="rotulo text-[48px] leading-none text-amarillo" style={{ '--rotulo-sombra': 'var(--color-rojo-ink)' }}>
            {section.number ?? 5}
          </span>
          <p className="mt-1 font-body text-[23px] font-semibold leading-snug text-paper">{section.instruction ?? 'Think of:'}</p>
        </div>
        <div className="mt-5 flex flex-col gap-4">
          {(section.categories ?? []).map((c) => (
            <div key={c.text} className="flex items-center gap-4">
              <svg viewBox="0 0 120 120" className="h-[118px] w-[118px] shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,.35)]" aria-hidden="true">
                <path d={starPath(60, 64, 58, 26)} fill="var(--color-amarillo)" stroke="var(--color-paper)" strokeWidth="3" strokeLinejoin="round" />
                <text x="60" y="78" textAnchor="middle" fontSize="40">
                  {c.icon}
                </text>
              </svg>
              <p className="font-display text-[26px] leading-tight text-paper">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Siluetas sobre la alfombra, con reflector y 🎧 ── */}
      {stars.map((s, i) => {
        const x = [560, 820, 1080][i] ?? 560 + i * 260
        const on = lit === s.name
        return (
          <div key={s.name} data-in className="absolute bottom-[110px]" style={{ left: x, width: 190, height: 420 }}>
            {/* Cono de luz */}
            <div
              className="pointer-events-none absolute -top-[260px] left-1/2 h-[700px] w-[340px] -translate-x-1/2 transition-opacity duration-500"
              style={{
                opacity: on ? 1 : 0,
                clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)',
                background: 'linear-gradient(to bottom, color-mix(in srgb, var(--color-amarillo) 75%, transparent), color-mix(in srgb, var(--color-amarillo) 18%, transparent))',
              }}
            />
            <div className="relative h-[330px]">
              <Silhouette src={s.silhouette} name={s.name} pose={i} />
            </div>
            <div className="relative mt-2 flex items-center justify-center gap-2">
              <span className="rounded-full bg-paper px-3 py-1 font-display text-[18px] text-azul shadow-soft">{s.name}</span>
              {s.audio && (
                <button
                  type="button"
                  onClick={(e) => playStar(s, e.currentTarget)}
                  aria-label={`Listen: ${s.name}`}
                  className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lift transition-colors
                    ${on ? 'bg-amarillo text-azul ring-4 ring-amarillo/50' : 'bg-rojo-ink text-paper'}`}
                >
                  <Headphones size={21} strokeWidth={2.4} />
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* ── Cómo se juega + bonus (derecha) ── */}
      <aside data-in className="absolute right-[40px] top-[262px] w-[330px] rounded-[22px] border-[4px] border-amarillo bg-paper px-6 py-5 shadow-page">
        <h3 className="font-display text-[26px] text-rojo-ink">How to play</h3>
        <ol className="mt-3 flex flex-col gap-2.5 font-body text-[19px] leading-snug text-ink">
          {(section.howTo ?? []).map((step, i) => (
            <li key={i} className="grid grid-cols-[30px_1fr] gap-1">
              <span className="font-display text-[22px] leading-none text-azul">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </aside>

      <div className="absolute bottom-[130px] right-[150px]">
        <button
          type="button"
          onClick={() => setBonus((b) => !b)}
          aria-expanded={bonus}
          aria-label="Bonus challenge"
          className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-amarillo text-azul shadow-page ring-4 ring-paper/40 transition-transform hover:scale-105"
        >
          <Star size={52} strokeWidth={2} fill="currentColor" />
        </button>
        <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper px-3 py-0.5 font-display text-[18px] text-azul shadow-soft">
          Bonus
        </span>
        {bonus && (
          <div
            role="dialog"
            aria-label="Bonus"
            className="absolute bottom-[110px] right-0 w-[320px] rounded-[20px] border-[4px] border-amarillo bg-azul px-6 py-5 shadow-page"
          >
            <button type="button" onClick={() => setBonus(false)} aria-label="Close bonus" className="absolute right-3 top-3 text-paper/70 hover:text-paper">
              <X size={22} />
            </button>
            <Star size={30} strokeWidth={2} fill="currentColor" className="text-amarillo" />
            <p className="mt-2 font-body text-[22px] font-semibold leading-snug text-paper">{section.bonus}</p>
          </div>
        )}
      </div>
    </div>
  )
}
