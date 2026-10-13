import { useEffect, useId, useMemo, useRef } from 'react'
import { animate, createMotionPath, createTimeline, stagger } from 'animejs'
import { Plane } from 'lucide-react'

import {
  COAST,
  COUNTRY_SHAPES,
  ISLANDS,
  arc,
  arcPoint,
  makeProjector,
  polyline,
  smoothClosedPath,
} from './latamGeo'
import MiniFlag from './MiniFlag'

const W = 1600
const H = 1000

/* Rectángulo del mapa dentro del lienzo: a la derecha, por encima de la
   barra inferior (88px) para que la Patagonia no quede tapada. */
const MAP_BOX = { x: 480, y: 30, w: 1060, h: 806 }

/* Curvatura de cada tramo (ver `arc`): el tramo largo a Bolivia sale al
   Pacífico, como un vuelo; el de Venezuela a Panamá cruza el Caribe. */
const BENDS = [-0.22, -0.4, -0.6]

const PIN_INK = { amarillo: 'var(--color-azul)' }
/* Blanco sobre verde puro no llega a 4.5:1: el pin usa verde-ink. */
const PIN_BG = { verde: 'verde-ink' }

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Mapa de Latinoamérica con la ruta del libro. La ruta se pinta tramo a
 * tramo mientras el avión la recorre; en cada país el pin late. Al final
 * espera 2s, se desvanece y vuelve a empezar.
 * `still` (miniatura del Nivel 2, reduced motion): ruta completa, quieta.
 */
export default function RouteMap({ countries = [], route = [], still = false }) {
  const uid = useId().replace(/:/g, '')
  const rootRef = useRef(null)

  const geo = useMemo(() => {
    const project = makeProjector(MAP_BOX)
    const coast = smoothClosedPath(COAST.map(project))
    const islands = ISLANDS.map((isl) => smoothClosedPath(isl.map(project)))
    const shapes = Object.entries(COUNTRY_SHAPES).map(([name, pts]) => ({
      name,
      d: smoothClosedPath(pts.map(project)),
    }))

    /* Retícula: meridianos y paralelos curvados por la misma lente */
    const grid = []
    for (let lon = -120; lon <= -30; lon += 10) {
      const pts = []
      for (let lat = -60; lat <= 36; lat += 2) pts.push(project([lon, lat]))
      grid.push({ key: `m${lon}`, d: polyline(pts) })
    }
    for (let lat = -50; lat <= 30; lat += 10) {
      const pts = []
      for (let lon = -126; lon <= -24; lon += 2) pts.push(project([lon, lat]))
      grid.push({ key: `p${lat}`, d: polyline(pts), equator: lat === 0 })
    }

    const byName = Object.fromEntries(countries.map((c) => [c.name, c]))
    const stops = route
      .map((name) => byName[name])
      .filter((c) => c?.pin)
      .map((c, i) => {
        const [x, y] = project([c.pin.lon, c.pin.lat])
        return { ...c, n: i + 1, x, y }
      })
    const legs = stops.slice(1).map((b, i) => {
      const a = stops[i]
      const bend = BENDS[i] ?? 0.25
      return {
        key: `${a.name}-${b.name}`,
        d: arc([a.x, a.y], [b.x, b.y], bend),
        mid: arcPoint([a.x, a.y], [b.x, b.y], bend, 0.62),
      }
    })
    return { coast, islands, shapes, grid, stops, legs }
  }, [countries, route])

  /* `mapColor` gana sobre `color`: Panamá es azul y el mar también. */
  const shapeColor = Object.fromEntries(countries.map((c) => [c.name, c.mapColor ?? c.color]))

  useEffect(() => {
    const root = rootRef.current
    if (!root || still || reduced() || geo.legs.length === 0) return

    const q = (sel) => [...root.querySelectorAll(sel)]
    const plates = q('[data-plate]')
    animate(plates, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 520,
      delay: stagger(110, { start: 250 }),
      ease: 'outQuart',
    })

    const legs = q('[data-leg-mask]')
    const paths = q('[data-leg-path]')
    const pins = q('[data-pin]')
    const rings = q('[data-ring]')
    const plane = root.querySelector('[data-plane]')
    const routeGroup = root.querySelector('[data-route]')
    /* Cada tramo se revela con strokeDashoffset sobre la máscara (la línea
       visible ya es punteada, así que no puede llevar su propio dasharray). */
    const lens = paths.map((el) => el.getTotalLength())
    legs.forEach((el, i) => {
      el.style.strokeDasharray = `${lens[i]} ${lens[i]}`
      el.style.strokeDashoffset = String(lens[i])
    })

    /* Llegada a una parada: el pin crece y suelta una onda. */
    const arrive = (tl, i, at) => {
      tl.add(pins[i], { scale: [1, 1.45, 1], duration: 560, ease: 'outBack(1.6)' }, at)
      tl.add(rings[i], { scale: [0.6, 2.4], opacity: [0.9, 0], duration: 900, ease: 'outQuad' }, at)
    }

    const tl = createTimeline({ loop: true, delay: 600 })
    tl.add(routeGroup, { opacity: [0, 1], duration: 300 }, 0)
    // el avión aparece cuando arranca el primer tramo, ya sobre Colombia
    tl.add(plane, { opacity: [0, 1], duration: 250 }, 650)
    arrive(tl, 0, 0)

    let t = 650
    legs.forEach((leg, i) => {
      const dur = Math.round(900 + lens[i] * 2.6)
      tl.add(leg, { strokeDashoffset: [lens[i], 0], duration: dur, ease: 'inOutSine' }, t)
      tl.add(plane, { ...createMotionPath(paths[i]), duration: dur, ease: 'inOutSine' }, t)
      t += dur
      arrive(tl, i + 1, t - 60)
      t += 520
    })

    t += 2000
    tl.add([routeGroup, plane], { opacity: [1, 0], duration: 600, ease: 'inQuad' }, t)
    tl.add(pins, { scale: 1, duration: 1 }, t + 600)
    /* Ya invisible: los tramos vuelven a "sin pintar" para la siguiente vuelta */
    legs.forEach((leg, i) => tl.add(leg, { strokeDashoffset: lens[i], duration: 1 }, t + 600))

    return () => tl.revert()
  }, [geo, still])

  const last = geo.legs[geo.legs.length - 1]
  const showStatic = still || reduced()

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
        <defs>
          {geo.legs.map((leg, i) => (
            <mask key={leg.key} id={`${uid}-leg${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <path
                data-leg-mask
                d={leg.d}
                fill="none"
                stroke="#fff"
                strokeWidth="18"
                strokeLinecap="round"
              />
            </mask>
          ))}
        </defs>

        {/* Retícula curva: la lente se nota y el mar deja de ser un plano */}
        <g fill="none" stroke="var(--color-paper)" strokeWidth="1.5">
          {geo.grid.map((g) => (
            <path key={g.key} d={g.d} opacity={g.equator ? 0.22 : 0.07} strokeDasharray={g.equator ? '2 9' : undefined} strokeLinecap="round" />
          ))}
        </g>

        {/* Continente: carrocería blanca con filete amarillo por fuera */}
        <g>
          {geo.islands.map((d, i) => (
            <path key={i} d={d} fill="var(--color-carroceria)" stroke="var(--color-amarillo)" strokeWidth="3" />
          ))}
          <path d={geo.coast} fill="var(--color-amarillo)" stroke="var(--color-amarillo)" strokeWidth="14" strokeLinejoin="round" />
          <path d={geo.coast} fill="var(--color-carroceria)" />
        </g>

        {/* Los cuatro países, en pintura plana con filete blanco */}
        <g stroke="var(--color-paper)" strokeWidth="4" strokeLinejoin="round">
          {geo.shapes.map((s) => (
            <path key={s.name} d={s.d} fill={`var(--color-${shapeColor[s.name] ?? 'verde'})`} />
          ))}
        </g>

        {/* Ruta: línea punteada que se pinta detrás del avión */}
        <g data-route>
          {geo.legs.map((leg, i) => (
            <g key={leg.key} mask={showStatic ? undefined : `url(#${uid}-leg${i})`}>
              <path d={leg.d} fill="none" stroke="var(--color-azul)" strokeWidth="11" strokeLinecap="round" opacity="0.35" />
              <path
                data-leg-path
                d={leg.d}
                fill="none"
                stroke="var(--color-amarillo)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="2 16"
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Pines numerados en el orden de la ruta */}
      {geo.stops.map((s, i) => (
        <span key={s.name} className="absolute" style={{ left: s.x, top: s.y }}>
          <span
            data-ring
            className="absolute -left-[22px] -top-[22px] h-11 w-11 rounded-full border-4 border-amarillo opacity-0"
          />
          <span
            data-pin
            className="absolute -left-[19px] -top-[19px] flex h-[38px] w-[38px] items-center justify-center
              rounded-full border-4 border-paper font-display text-[17px] text-paper shadow-lift"
            style={{ background: `var(--color-${PIN_BG[s.color] ?? s.color})`, color: PIN_INK[s.color] }}
          >
            {i + 1}
          </span>
        </span>
      ))}

      {/* Letreros: bandera + país + ciudad */}
      {geo.stops.map((s) => {
        /* left / right: a un lado del pin · below: centrado debajo */
        const side = s.pin.label ?? 'right'
        const pos =
          side === 'below'
            ? { top: s.y + 30, left: s.x, transform: 'translateX(-50%)' }
            : side === 'left'
              ? { top: s.y, right: W - s.x + 34, transform: 'translateY(-50%)' }
              : { top: s.y, left: s.x + 34, transform: 'translateY(-50%)' }
        return (
          /* El div de fuera se coloca; el de dentro es el que anima Anime.js
             (si animara el de fuera, perdería el translate de centrado). */
          <div key={s.name} className="absolute" style={pos}>
            <div
              data-plate
              className="flex items-center gap-3 whitespace-nowrap rounded-[12px] border-[3px] border-azul
                bg-paper py-2 pl-2.5 pr-4 shadow-lift"
            >
              <MiniFlag code={s.pin.flag} width={40} />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[24px] text-azul">{s.name}</span>
                <span className="mt-1 font-body text-[14px] font-medium text-ink-soft">{s.pin.city}</span>
              </span>
            </div>
          </div>
        )
      })}

      {/* El avión: recorre la ruta; quieto, se queda en el último tramo */}
      {geo.legs.length > 0 && (
        <div
          data-plane
          className="absolute left-0 top-0 h-0 w-0"
          style={
            showStatic && last
              ? { transform: `translate(${last.mid.x}px, ${last.mid.y}px) rotate(${last.mid.angle}deg)` }
              : { opacity: 0 }
          }
        >
          <span
            className="absolute -left-[27px] -top-[27px] flex h-[54px] w-[54px] items-center justify-center
              rounded-full border-[3px] border-azul bg-amarillo text-azul shadow-lift"
          >
            {/* Lucide dibuja el avión hacia arriba a la derecha (-45°) */}
            <Plane size={28} strokeWidth={2.4} className="rotate-45" fill="currentColor" />
          </span>
        </div>
      )}
    </div>
  )
}
