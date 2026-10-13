import { useEffect, useId, useMemo, useRef } from 'react'
import { animate, createMotionPath, createTimeline, stagger } from 'animejs'

import { COUNTRIES, TOUR, makeProjector, polyline, ringCentroid, ringPath } from './latamGeo'
import MiniFlag from './MiniFlag'

const W = 1600
const H = 1000

/* Rectángulo del mapa dentro del lienzo: a la derecha, por encima de la
   barra inferior (88px) para que la Patagonia no quede tapada. */
const MAP_BOX = { x: 700, y: 26, w: 860, h: 856 }

/* Etiquetas: tamaño según el área del país y ajustes a mano donde el
   centroide cae mal (islas, Centroamérica, Chile en vertical). */
const labelSize = (area) => (area > 3000 ? 13 : area > 500 ? 10.5 : 8.5)
const LABEL_TWEAK = {
  Chile: { rotate: -90, dy: 40 },
  Argentina: { dx: -30, dy: -20 },
  Brasil: { dy: -10 },
  Uruguay: { dx: 6, dy: 8 },
  Belice: { dx: 16, dy: -2 },
  Guatemala: { dx: -18, dy: -2 },
  'El Salvador': { dx: -22, dy: 9 },
  Honduras: { dy: -4 },
  Nicaragua: { dx: 2, dy: 2 },
  'Costa Rica': { dx: -24, dy: 8 },
  Cuba: { dy: -1 },
  Bahamas: { dx: 16, dy: -8 },
  Jamaica: { dy: 11 },
  'Haití': { dx: -12, dy: -12 },
  'República Dominicana': { dx: 30, dy: -12, short: 'REP. DOM.' },
  'Puerto Rico': { dx: 10, dy: 11 },
  'Trinidad y Tobago': { dx: 34, dy: 8, short: 'TRINIDAD' },
  Guyana: { dy: -4 },
  Suriname: { dx: 2, dy: 10 },
  'Guayana Francesa': { dx: 22, dy: 18, short: 'GUAYANA FR.' },
  'Islas Malvinas': { dy: 16 },
}

/* Velocidad del recorrido (ms por px de ruta) y espera al final */
const MS_PER_PX = 3.4
const HOLD = 2000

const PIN_BG = { verde: 'verde-ink' }

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const r1 = (n) => Math.round(n * 10) / 10

/**
 * Mapa de Latinoamérica con TODOS los países y una ruta que los recorre
 * capital por capital (México → Centroamérica → Andes → Cono Sur → Brasil →
 * Guayanas → Caribe). La ruta se pinta a velocidad constante con una
 * cabeza luminosa; cada país destella al ser visitado y queda teñido. Los
 * cuatro países del libro llevan pin grande y letrero. Al final espera 2s,
 * se desvanece y vuelve a empezar.
 *
 * `still` (miniaturas, reduced motion): ruta completa y quieta.
 * `lite` (card del Home): anima, pero sin nombres, retícula, filete de
 * costa ni letreros (a ese tamaño no se leen y pesan al rasterizar).
 */
export default function RouteMap({ countries = [], still = false, lite = false }) {
  const uid = useId().replace(/:/g, '')
  const rootRef = useRef(null)
  const showStatic = still || reduced()
  const detail = !still && !lite

  const geo = useMemo(() => {
    const project = makeProjector(MAP_BOX)
    const featuredBy = Object.fromEntries(countries.map((c) => [c.name, c]))

    const lands = COUNTRIES.map((c) => {
      const rings = c.rings.map((ring) => ring.map(project))
      const main = rings.map(ringCentroid).sort((a, b) => b.area - a.area)[0]
      const [cx, cy] = project([c.capital.lon, c.capital.lat])
      return {
        name: c.name,
        d: rings.map(ringPath).join(''),
        label: main,
        capital: { x: cx, y: cy, name: c.capital.name },
        featured: featuredBy[c.name] ?? null,
      }
    })
    const byName = Object.fromEntries(lands.map((l) => [l.name, l]))

    const labels = lands
      .filter((l) => !l.featured)
      .map((l) => {
        const t = LABEL_TWEAK[l.name] ?? {}
        return {
          name: l.name,
          text: (t.short ?? l.name).toUpperCase(),
          x: l.label.x + (t.dx ?? 0),
          y: l.label.y + (t.dy ?? 0),
          rotate: t.rotate,
          size: labelSize(l.label.area),
        }
      })

    /* Recorrido: un solo path con un arco por tramo (curvatura alterna
       para que no parezca trazado con regla). */
    const stops = TOUR.map((n) => byName[n]).filter(Boolean)
    let d = ''
    const segs = []
    stops.forEach((s, i) => {
      const { x, y } = s.capital
      if (i === 0) {
        d = `M${r1(x)},${r1(y)}`
        return
      }
      const a = stops[i - 1].capital
      const bend = i % 2 ? 0.16 : -0.16
      const qx = r1((a.x + x) / 2 + (y - a.y) * bend)
      const qy = r1((a.y + y) / 2 - (x - a.x) * bend)
      d += `Q${qx},${qy} ${r1(x)},${r1(y)}`
      segs.push({ qx, qy, x: r1(x), y: r1(y) })
    })

    /* Retícula Mercator */
    const grid = []
    for (let lon = -120; lon <= -30; lon += 10)
      grid.push({ key: `m${lon}`, d: polyline([project([lon, 40]), project([lon, -60])]) })
    for (let lat = -50; lat <= 30; lat += 10)
      grid.push({ key: `p${lat}`, d: polyline([project([-130, lat]), project([-20, lat])]), equator: lat === 0 })

    const pins = lands
      .filter((l) => l.featured?.pin)
      .map((l) => {
        const [x, y] = project([l.featured.pin.lon, l.featured.pin.lat])
        return { ...l.featured, x, y }
      })

    return { lands, labels, stops, tour: d, segs, grid, pins }
  }, [countries])

  const fillOf = (l) => `var(--color-${l.featured.mapColor ?? l.featured.color ?? 'verde'})`

  useEffect(() => {
    const root = rootRef.current
    if (!root || showStatic) return

    const q = (sel) => [...root.querySelectorAll(sel)]
    const anims = []

    const plates = q('[data-plate]')
    if (plates.length)
      anims.push(
        animate(plates, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 520,
          delay: stagger(110, { start: 250 }),
          ease: 'outQuart',
        }),
      )

    const mask = root.querySelector('[data-tour-mask]')
    const path = root.querySelector('[data-tour-path]')
    const head = root.querySelector('[data-head]')
    const routeGroup = root.querySelector('[data-route]')

    const total = path.getTotalLength()
    mask.style.strokeDasharray = `${total} ${total}`
    mask.style.strokeDashoffset = String(total)

    /* Largo acumulado hasta cada parada, midiendo el prefijo del path:
       con velocidad constante, eso dice cuándo llega la cabeza. */
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const first = geo.stops[0].capital
    let prefix = `M${r1(first.x)},${r1(first.y)}`
    const cum = [0]
    geo.segs.forEach((s) => {
      prefix += `Q${s.qx},${s.qy} ${s.x},${s.y}`
      probe.setAttribute('d', prefix)
      cum.push(probe.getTotalLength())
    })

    const dur = Math.round(total * MS_PER_PX)
    const caps = q('[data-cap]')
    const flashes = q('[data-flash]')
    const byData = (attr) => Object.fromEntries(q(`[${attr}]`).map((el) => [el.getAttribute(attr), el]))
    const labelEls = byData('data-label')
    const pinEls = byData('data-pin')
    const ringEls = byData('data-ring')
    const flashBy = byData('data-flash')

    const tl = createTimeline({ loop: true, delay: 500 })
    tl.add([routeGroup, head], { opacity: [0, 1], duration: 300 }, 0)
    tl.add(mask, { strokeDashoffset: [total, 0], duration: dur, ease: 'linear' }, 0)
    tl.add(head, { ...createMotionPath(path), duration: dur, ease: 'linear' }, 0)

    /* Llegada a cada capital: el punto aparece, el país destella y queda
       teñido, su nombre da un saltito; los del libro además laten. */
    geo.stops.forEach((s, i) => {
      const at = Math.round((cum[i] / total) * dur)
      tl.add(caps[i], { scale: [0, 1.6, 1], opacity: [0, 1], duration: 420, ease: 'outBack(2)' }, at)
      const fl = flashBy[s.name]
      if (fl) {
        tl.add(fl, { opacity: [0, 0.75], duration: 180, ease: 'outQuad' }, at)
        tl.add(fl, { opacity: [0.75, 0.22], duration: 700, ease: 'outQuad' }, at + 180)
      }
      if (labelEls[s.name]) tl.add(labelEls[s.name], { scale: [1, 1.35, 1], duration: 520, ease: 'outBack(2)' }, at)
      if (pinEls[s.name]) {
        tl.add(pinEls[s.name], { scale: [1, 1.5, 1], duration: 600, ease: 'outBack(1.6)' }, at)
        tl.add(ringEls[s.name], { scale: [0.6, 2.6], opacity: [0.9, 0], duration: 900, ease: 'outQuad' }, at)
      }
    })

    const end = dur + HOLD
    tl.add([routeGroup, head, ...caps, ...flashes], { opacity: 0, duration: 600, ease: 'inQuad' }, end)
    tl.add(mask, { strokeDashoffset: total, duration: 1 }, end + 600)

    anims.push(tl)
    return () => anims.forEach((a) => a.revert())
  }, [geo, showStatic])

  return (
    <div ref={rootRef} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
        <defs>
          <mask id={`${uid}-tour`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <path data-tour-mask d={geo.tour} fill="none" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
          </mask>
        </defs>

        {/* Retícula: el mar deja de ser un plano */}
        {detail && (
          <g fill="none" stroke="var(--color-paper)" strokeWidth="1.5">
            {geo.grid.map((g) => (
              <path key={g.key} d={g.d} opacity={g.equator ? 0.18 : 0.07} />
            ))}
          </g>
        )}

        {/* Costa: filete amarillo por fuera (cada país trazado grueso debajo
            de los rellenos: las fronteras internas quedan tapadas). Solo en
            la portada grande: escalado a ~0.2 cuelga el rasterizado. */}
        {detail && (
          <g fill="var(--color-amarillo)" stroke="var(--color-amarillo)" strokeWidth="9" strokeLinejoin="round">
            {geo.lands.map((l) => (
              <path key={l.name} d={l.d} />
            ))}
          </g>
        )}

        {/* Todos los países con sus fronteras; los del libro en su color */}
        <g strokeLinejoin="round">
          {geo.lands.map((l) =>
            l.featured ? (
              <path key={l.name} d={l.d} fill={fillOf(l)} stroke="var(--color-paper)" strokeWidth="3" />
            ) : (
              <path
                key={l.name}
                d={l.d}
                fill="var(--color-carroceria)"
                stroke="var(--color-ink-soft)"
                strokeOpacity="0.45"
                strokeWidth="1.4"
              />
            ),
          )}
        </g>

        {/* Destello de cada país cuando la ruta llega (empieza invisible) */}
        {!showStatic && (
          <g fill="var(--color-amarillo)">
            {geo.lands.map((l) => (
              <path key={l.name} data-flash={l.name} d={l.d} opacity="0" />
            ))}
          </g>
        )}

        {/* Nombres de todos los demás países, en versalitas de atlas */}
        {detail && (
          <g fill="var(--color-ink-soft)" fontFamily="var(--font-body)" fontWeight="600" textAnchor="middle">
            {geo.labels.map((l) => (
              /* El giro va en el <g>: Anime.js escribe el transform del <text>
                 al animar el saltito y borraría la rotación. */
              <g key={l.name} transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}>
                <text
                  data-label={l.name}
                  x={l.x}
                  y={l.y}
                  fontSize={l.size}
                  letterSpacing={l.size > 10 ? 2.2 : 1.2}
                  dominantBaseline="middle"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                >
                  {l.text}
                </text>
              </g>
            ))}
          </g>
        )}

        {/* La ruta: hilo rojo + puntos amarillos, revelada por la máscara */}
        <g data-route mask={showStatic ? undefined : `url(#${uid}-tour)`}>
          <path d={geo.tour} fill="none" stroke="var(--color-rojo-ink)" strokeWidth="2.5" strokeLinecap="round" />
          <path
            data-tour-path
            d={geo.tour}
            fill="none"
            stroke="var(--color-amarillo)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="1 14"
          />
        </g>

        {/* Capitales: un punto por parada, aparecen al llegar la ruta */}
        <g>
          {geo.stops.map((s) => (
            <circle
              key={s.name}
              data-cap
              cx={s.capital.x}
              cy={s.capital.y}
              r="4.5"
              fill="var(--color-paper)"
              stroke="var(--color-rojo-ink)"
              strokeWidth="2.5"
              opacity={showStatic ? 1 : 0}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}
        </g>
      </svg>

      {/* Líneas guía del pin a su letrero */}
      {detail && (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0">
          {geo.pins.map((s) => (
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
      )}

      {/* Letreros de los cuatro países del libro: bandera + país + ciudad */}
      {detail &&
        geo.pins.map((s) => (
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

      {/* Pines de los cuatro países del libro */}
      {geo.pins.map((s) => (
        <span key={s.name} className="absolute" style={{ left: s.x, top: s.y }}>
          <span
            data-ring={s.name}
            className="absolute -left-[22px] -top-[22px] h-11 w-11 rounded-full border-4 border-amarillo opacity-0"
          />
          <span
            data-pin={s.name}
            className="absolute -left-[15px] -top-[15px] h-[30px] w-[30px] rounded-full border-4 border-paper shadow-lift"
            style={{ background: `var(--color-${PIN_BG[s.color] ?? s.color})` }}
          />
        </span>
      ))}

      {/* Cabeza de la ruta: el punto que va pintando el recorrido */}
      {!showStatic && (
        <div data-head className="absolute left-0 top-0 h-0 w-0" style={{ opacity: 0 }}>
          <span className="absolute -left-[13px] -top-[13px] h-[26px] w-[26px] rounded-full bg-amarillo/40" />
          <span className="absolute -left-[8px] -top-[8px] h-4 w-4 rounded-full border-[3px] border-paper bg-rojo-ink shadow-lift" />
        </div>
      )}
    </div>
  )
}
