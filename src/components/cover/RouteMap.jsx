import { useEffect, useId, useMemo, useRef } from 'react'
import { animate, createTimeline, stagger } from 'animejs'

import { COUNTRIES, arc, makeProjector, polyline, ringCentroid, ringPath } from './latamGeo'
import MiniFlag from './MiniFlag'

const W = 1600
const H = 1000

/* Rectángulo del mapa dentro del lienzo: a la derecha, por encima de la
   barra inferior (88px) para que la Patagonia no quede tapada. */
const MAP_BOX = { x: 700, y: 26, w: 860, h: 856 }

/* Etiquetas de los demás países: Chile va en vertical dentro de su franja,
   como en los atlas; los muy pequeños (Centroamérica, Antillas) no llevan. */
const LABEL_MIN_AREA = 700
const LABEL_TWEAK = {
  Chile: { rotate: -90, dy: 40 },
  Argentina: { dx: -30, dy: -20 },
  Brasil: { dy: -10 },
  Uruguay: { dx: 6, dy: 8 },
  // demasiado pequeños para su nombre a esta escala
  Guyana: { hide: true },
  Suriname: { hide: true },
  'Guayana Francesa': { hide: true },
  Nicaragua: { hide: true },
}

/* Curvatura de cada tramo (ver `arc`): Venezuela → Panamá cruza el Caribe
   y Panamá → Bolivia baja por el Pacífico, pegada a la costa. */
const BENDS = [-0.25, -0.45, -0.32]

const PIN_INK = { amarillo: 'var(--color-azul)' }
/* Blanco sobre verde puro no llega a 4.5:1: el pin usa verde-ink. */
const PIN_BG = { verde: 'verde-ink' }

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Mapa de Latinoamérica con la ruta del libro. La ruta se pinta tramo a
 * tramo (sin vehículo: la línea ES la ruta); en cada país el pin late.
 * Al final espera 2s, se desvanece y vuelve a empezar.
 * `still` (miniatura del Nivel 2, reduced motion): ruta completa, quieta.
 */
export default function RouteMap({ countries = [], route = [], still = false }) {
  const uid = useId().replace(/:/g, '')
  const rootRef = useRef(null)

  const geo = useMemo(() => {
    const project = makeProjector(MAP_BOX)
    const routeNames = new Set(countries.map((c) => c.name))

    /* Cada país: sus anillos proyectados, el path y dónde va su nombre */
    const lands = COUNTRIES.map((c) => {
      const rings = c.rings.map((ring) => ring.map(project))
      const main = rings.map(ringCentroid).sort((a, b) => b.area - a.area)[0]
      return {
        name: c.name,
        d: rings.map(ringPath).join(''),
        label: main,
        featured: routeNames.has(c.name),
      }
    })
    const labels = lands
      .filter((l) => !l.featured && l.label.area > LABEL_MIN_AREA)
      .map((l) => ({ name: l.name, x: l.label.x, y: l.label.y, ...LABEL_TWEAK[l.name] }))
      .filter((l) => !l.hide)

    /* Retícula Mercator: meridianos verticales y paralelos horizontales */
    const grid = []
    for (let lon = -120; lon <= -30; lon += 10)
      grid.push({ key: `m${lon}`, d: polyline([project([lon, 40]), project([lon, -60])]) })
    for (let lat = -50; lat <= 30; lat += 10)
      grid.push({ key: `p${lat}`, d: polyline([project([-130, lat]), project([-20, lat])]), equator: lat === 0 })

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
      }
    })
    return { lands, labels, grid, stops, legs }
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
    arrive(tl, 0, 0)

    let t = 650
    legs.forEach((leg, i) => {
      const dur = Math.round(900 + lens[i] * 2.6)
      tl.add(leg, { strokeDashoffset: [lens[i], 0], duration: dur, ease: 'inOutSine' }, t)
      t += dur
      arrive(tl, i + 1, t - 60)
      t += 520
    })

    t += 2000
    tl.add(routeGroup, { opacity: [1, 0], duration: 600, ease: 'inQuad' }, t)
    tl.add(pins, { scale: 1, duration: 1 }, t + 600)
    /* Ya invisible: los tramos vuelven a "sin pintar" para la siguiente vuelta */
    legs.forEach((leg, i) => tl.add(leg, { strokeDashoffset: lens[i], duration: 1 }, t + 600))

    return () => tl.revert()
  }, [geo, still])

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

        {/* Retícula: el mar deja de ser un plano. En miniatura (still) se
            omite: a ese tamaño no se vería. */}
        {!still && (
          <g fill="none" stroke="var(--color-paper)" strokeWidth="1.5">
            {geo.grid.map((g) => (
              <path key={g.key} d={g.d} opacity={g.equator ? 0.18 : 0.07} />
            ))}
          </g>
        )}

        {/* Costa: filete amarillo por fuera. Cada país se traza grueso en
            amarillo y luego se rellena encima, así las fronteras internas
            quedan tapadas y solo asoma el borde del continente. En miniatura
            se omite (el trazo grueso escalado a ~0.2 cuelga el rasterizado). */}
        {!still && (
          <g fill="var(--color-amarillo)" stroke="var(--color-amarillo)" strokeWidth="9" strokeLinejoin="round">
            {geo.lands.map((l) => (
              <path key={l.name} d={l.d} />
            ))}
          </g>
        )}

        {/* Todos los países, con fronteras reales; los cuatro del libro en
            pintura plana con filete blanco */}
        <g strokeLinejoin="round">
          {geo.lands
            .filter((l) => !l.featured)
            .map((l) => (
              <path
                key={l.name}
                d={l.d}
                fill="var(--color-carroceria)"
                stroke="var(--color-ink-soft)"
                strokeOpacity="0.45"
                strokeWidth="1.4"
              />
            ))}
          {geo.lands
            .filter((l) => l.featured)
            .map((l) => (
              <path
                key={l.name}
                d={l.d}
                fill={`var(--color-${shapeColor[l.name] ?? 'verde'})`}
                stroke="var(--color-paper)"
                strokeWidth="3"
              />
            ))}
        </g>

        {/* Nombres de los demás países, en versalitas de atlas */}
        {!still && (
          <g
            fill="var(--color-ink-soft)"
            fontFamily="var(--font-body)"
            fontWeight="600"
            fontSize="13"
            letterSpacing="2.2"
            textAnchor="middle"
          >
            {geo.labels.map((l) => {
              const x = l.x + (l.dx ?? 0)
              const y = l.y + (l.dy ?? 0)
              return (
                <text
                  key={l.name}
                  x={x}
                  y={y}
                  dominantBaseline="middle"
                  transform={l.rotate ? `rotate(${l.rotate} ${x} ${y})` : undefined}
                >
                  {l.name.toUpperCase()}
                </text>
              )
            })}
          </g>
        )}

        {/* Ruta: puntos amarillos sobre hilo rojo, se pinta tramo a tramo */}
        <g data-route>
          {geo.legs.map((leg, i) => (
            <g key={leg.key} mask={showStatic ? undefined : `url(#${uid}-leg${i})`}>
              <path d={leg.d} fill="none" stroke="var(--color-rojo-ink)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
              <path
                data-leg-path
                d={leg.d}
                fill="none"
                stroke="var(--color-amarillo)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="1 17"
              />
            </g>
          ))}
        </g>
      </svg>

      {/* Líneas guía del pin a su letrero */}
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
        {geo.stops.map((s) => (
          <line
            key={s.name}
            x1={s.x}
            y1={s.y}
            x2={s.x + (s.pin.label?.dx ?? 0)}
            y2={s.y + (s.pin.label?.dy ?? 0)}
            stroke="var(--color-azul)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Letreros: bandera + país + ciudad, centrados en pin + label.{dx,dy} */}
      {geo.stops.map((s) => (
        /* El div de fuera se coloca; el de dentro es el que anima Anime.js
           (si animara el de fuera, perdería el translate de centrado). */
        <div
          key={s.name}
          className="absolute"
          style={{
            left: s.x + (s.pin.label?.dx ?? 0),
            top: s.y + (s.pin.label?.dy ?? 0),
            transform: 'translate(-50%, -50%)',
          }}
        >
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
      ))}

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
    </div>
  )
}
