import { useEffect, useId, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'
import { Plus } from 'lucide-react'
import AudioButton from '../media/AudioButton'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Lienzo del diagrama. Todo se mide aquí y se escala con el SVG. */
const W = 1400
const H = 540
const ZONE = W / 4
const ARC_Y = 200 // extremos de cada arco
const ARC_TOP = 88 // punto de control (el arco sube hasta ~144)
const HALF = 158 // medio ancho del arco
const BTN_Y = 292 // fila de botones 🎧 (overlay HTML)

/* Paneles del cielo: mañana, tarde, noche que cae, noche. */
const SKY = ['#FCE7A6', '#CFE3F5', '#F4A259', '#1F3354']

/* Estrella de cinco puntas pequeña para el cielo nocturno. */
function Star({ x, y, r = 5 }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`
  }).join(' ')
  return <polygon points={pts} fill="#FCE7A6" />
}

/** Sol con rayos. */
function Sun({ x, y, r, fill, rays = true }) {
  return (
    <g>
      {rays &&
        Array.from({ length: 12 }, (_, i) => {
          const a = (Math.PI / 6) * i
          return (
            <line
              key={i}
              x1={x + (r + 10) * Math.cos(a)}
              y1={y + (r + 10) * Math.sin(a)}
              x2={x + (r + 26) * Math.cos(a)}
              y2={y + (r + 26) * Math.sin(a)}
              stroke={fill}
              strokeWidth="6"
              strokeLinecap="round"
              opacity=".75"
            />
          )
        })}
      <circle cx={x} cy={y} r={r + 8} fill={fill} opacity=".25" />
      <circle cx={x} cy={y} r={r} fill={fill} />
    </g>
  )
}

/** Nota de uso (+) de "Good night!". */
function NoteBadge({ note, style }) {
  const [open, setOpen] = useState(false)
  const iconRef = useRef(null)
  const noteRef = useRef(null)

  useEffect(() => {
    if (!open || !noteRef.current || reduced()) return
    animate(noteRef.current, { opacity: [0, 1], translateY: [-8, 0], duration: 320, ease: 'outQuad' })
  }, [open])

  const toggle = (e) => {
    e.stopPropagation()
    if (iconRef.current && !reduced()) {
      animate(iconRef.current, { rotate: open ? [45, 0] : [0, 45], duration: 260, ease: 'outQuad' })
    }
    setOpen((v) => !v)
  }

  return (
    <div className="absolute z-10 flex -translate-y-1/2 flex-col items-center" style={style}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? 'Hide usage note' : 'Show usage note'}
        className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white
          bg-amarillo text-azul shadow-soft"
      >
        <span ref={iconRef} className="flex" style={{ transform: open ? 'rotate(45deg)' : undefined }}>
          <Plus size={24} strokeWidth={2.8} />
        </span>
      </button>
      {open && (
        <p
          ref={noteRef}
          className="absolute right-0 top-[54px] w-[250px] rounded-2xl bg-white px-4 py-3 text-left
            font-body text-[18px] font-semibold leading-snug text-azul shadow-lift"
        >
          {note}
        </p>
      )}
    </div>
  )
}

/**
 * "El arco del día": paisaje panorámico donde el sol recorre el día de
 * izquierda a derecha, con un arco y un saludo por franja.
 * block: { zones: [{ greeting, range, audio, note? }] } — las 4 franjas en
 * orden mañana · tarde · noche temprana · al dormir.
 * `compact` = versión mini de ayuda (sin audio ni nota, sin animación).
 */
export default function DayArc({ block, compact = false, className = '' }) {
  const zones = (block?.zones ?? []).slice(0, 4)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || compact || reduced()) return
    const arcs = root.querySelectorAll('[data-arc]')
    const texts = root.querySelectorAll('[data-greet]')
    arcs.forEach((p) => {
      const len = p.getTotalLength()
      p.style.strokeDasharray = `${len}`
      p.style.strokeDashoffset = `${len}`
    })
    texts.forEach((t) => {
      t.style.opacity = '0'
    })
    animate(arcs, { strokeDashoffset: 0, duration: 650, ease: 'inOutQuad', delay: stagger(260) })
    animate(texts, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 420,
      ease: 'outQuad',
      delay: stagger(90, { start: 420 }),
    })
  }, [block?.id, compact])

  const night = (i) => i === 3
  const pct = (v, total) => `${(v / total) * 100}%`

  return (
    <div ref={rootRef} className={`relative w-full ${className}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label={`The day: ${zones.map((z) => z.greeting).join(', ')}`}
      >
        <defs>
          <clipPath id={`clip-${uid}`}>
            <rect width={W} height={H} rx="28" />
          </clipPath>
          {['azul', 'amarillo'].map((c) => (
            <marker
              key={c}
              id={`arrow-${c}-${uid}`}
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 0 10 5 0 10z" fill={c === 'amarillo' ? '#F5B700' : '#1f3354'} />
            </marker>
          ))}
        </defs>

        <g clipPath={`url(#clip-${uid})`}>
          {/* Cielo pintado como paneles planos de la chiva, uno por franja,
              separados por filetes blancos */}
          {SKY.map((c, i) => (
            <rect key={c} x={i * ZONE} width={ZONE} height={H} fill={c} />
          ))}
          {[1, 2, 3].map((i) => (
            <rect key={i} x={i * ZONE - 2} width="4" height={H} fill="#FFFFFF" opacity=".85" />
          ))}

          {/* Estrellas y luna de la franja nocturna */}
          {[
            [1095, 60, 6], [1180, 44, 4], [1290, 70, 7], [1360, 38, 4], [1120, 250, 4],
            [1340, 250, 5], [1075, 330, 4], [1380, 170, 4], [1300, 330, 3],
          ].map(([x, y, r], i) => (
            <Star key={i} x={x} y={y} r={r} />
          ))}
          <circle cx={3.5 * ZONE} cy="360" r="42" fill="#FCE7A6" />
          <circle cx={3.5 * ZONE + 20} cy="347" r="38" fill="#1F3354" />

          {/* Soles: saliendo, en lo alto, cayendo */}
          <Sun x={0.5 * ZONE} y={440} r={54} fill="#F5B700" />
          <Sun x={1.5 * ZONE} y={385} r={48} fill="#F5B700" />
          <Sun x={2.5 * ZONE} y={432} r={46} fill="#D7263D" rays={false} />

          {/* Montañas: fondo y frente */}
          <path
            d={`M0 460 L90 405 L190 450 L300 390 L420 445 L540 400 L650 450 L760 395 L880 452
               L990 405 L1110 450 L1230 400 L1330 445 L${W} 420 L${W} ${H} L0 ${H}Z`}
            fill="#3FB3A5"
          />
          <path
            d={`M0 490 Q120 440 250 480 T520 478 T800 482 T1080 476 T${W} 470 L${W} ${H} L0 ${H}Z`}
            fill="#0F6E63"
          />

          {/* Arcos con flecha + saludo que sigue la curva */}
          {zones.map((z, i) => {
            const cx = (i + 0.5) * ZONE
            const d = `M${cx - HALF} ${ARC_Y} Q${cx} ${ARC_TOP} ${cx + HALF} ${ARC_Y}`
            const ink = night(i) ? '#FFFFFF' : '#1f3354'
            return (
              <g key={i}>
                <path id={`arc-${uid}-${i}`} d={d} fill="none" />
                <path
                  data-arc
                  d={d}
                  fill="none"
                  stroke={night(i) ? '#F5B700' : '#1f3354'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  markerEnd={`url(#arrow-${night(i) ? 'amarillo' : 'azul'}-${uid})`}
                />
                <text
                  data-greet
                  style={{ fontFamily: 'var(--font-display)' }}
                  fontSize={compact ? 34 : 31}
                  fill={ink}
                  dy="-12"
                >
                  <textPath href={`#arc-${uid}-${i}`} startOffset="50%" textAnchor="middle">
                    {z.greeting}
                  </textPath>
                </text>
                {z.range && (
                  <text
                    data-greet
                    x={cx}
                    y={ARC_Y + 50}
                    textAnchor="middle"
                    style={{ fontFamily: 'var(--font-body)' }}
                    fontWeight="700"
                    fontSize={compact ? 34 : 24}
                    letterSpacing="2"
                    fill={night(i) ? '#F5B700' : i === 2 ? '#1f3354' : '#B01E31'}
                  >
                    {z.range}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>

      {/* Botones HTML encima del SVG, en % para que escalen igual */}
      {!compact &&
        zones.map((z, i) => (
          <div
            key={i}
            data-greet
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: pct((i + 0.5) * ZONE, W), top: pct(BTN_Y, H) }}
          >
            <AudioButton
              src={z.audio}
              label={`Listen: ${z.greeting}`}
              size={54}
              className="border-[3px] border-white"
            />
          </div>
        ))}
      {!compact &&
        zones.map(
          (z, i) =>
            z.note && (
              <NoteBadge
                key={`note-${i}`}
                note={z.note}
                style={{ left: pct((i + 0.5) * ZONE + 62, W), top: pct(BTN_Y, H) }}
              />
            ),
        )}
    </div>
  )
}
