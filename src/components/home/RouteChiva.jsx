import { useLayoutEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

import ChivaBus from '../decor/ChivaBus'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const wide = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(min-width: 640px)').matches

/* Letrero numerado de cada parada: el amarillo lleva número azul. */
const STOP_INK = { amarillo: 'var(--color-azul)' }

const BUS_W = 84
const WHEEL_CIRCUMFERENCE = 2 * Math.PI * 7.5 * (BUS_W / 96)

/* Tiempos de la llegada (ms) */
const START = 450
const FIRST_DRIVE = 850
const HOP = 720
const PAUSE = 320

/**
 * La ruta del libro: una parada por país sobre una carretera azul con raya
 * amarilla. Al entrar, la carretera se traza y una chiva recorre las cuatro
 * paradas; en cada una el letrero se voltea y aparece el país. Después,
 * pasar el mouse por un país lleva la chiva hasta esa parada.
 * En móvil (sin carretera) los letreros entran en cascada.
 */
export default function RouteChiva({ countries }) {
  const wrapRef = useRef(null)
  const busRef = useRef(null)
  const roadRef = useRef(null)
  const stopRef = useRef(0)
  const readyRef = useRef(false)

  const busX = (i) => {
    const w = wrapRef.current?.offsetWidth ?? 0
    return ((i + 0.5) * w) / countries.length - BUS_W / 2
  }

  const spinWheels = (distance, duration) => {
    const wheels = busRef.current?.querySelectorAll('[data-wheel]')
    if (!wheels?.length) return
    animate(wheels, {
      rotate: `+=${(Math.abs(distance) / WHEEL_CIRCUMFERENCE) * 360}`,
      duration,
      ease: 'inOutSine',
    })
  }

  const bounce = () => {
    animate(busRef.current, { translateY: [0, -4, 0], duration: 320, ease: 'outQuad' })
  }

  const driveTo = (i) => {
    if (!readyRef.current || i === stopRef.current || !busRef.current) return
    if (reduced()) {
      stopRef.current = i
      animate(busRef.current.parentElement, { translateX: busX(i), duration: 0 })
      return
    }
    const from = busX(stopRef.current)
    const to = busX(i)
    const duration = 260 * Math.abs(i - stopRef.current) + 240
    stopRef.current = i
    animate(busRef.current.parentElement, { translateX: to, duration, ease: 'inOutSine' })
    spinWheels(to - from, duration)
    window.setTimeout(bounce, duration - 40)
  }

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const signs = [...wrap.querySelectorAll('[data-sign]')]
    const names = [...wrap.querySelectorAll('[data-name]')]
    const car = busRef.current?.parentElement
    const timers = []
    const later = (fn, ms) => timers.push(window.setTimeout(fn, ms))

    const park = () => {
      if (car) animate(car, { translateX: busX(stopRef.current), opacity: 1, duration: 0 })
    }

    if (reduced()) {
      park()
      readyRef.current = true
      return undefined
    }

    // Móvil: sin carretera ni bus, los letreros entran en cascada.
    if (!wide()) {
      signs.forEach((s) => (s.style.opacity = '0'))
      animate(signs, {
        opacity: [0, 1],
        rotateY: [90, 0],
        duration: 520,
        ease: 'outBack(1.4)',
        delay: stagger(140, { start: START }),
      })
      return () => timers.forEach(clearTimeout)
    }

    // Escritorio: estado inicial inline (nunca por clase; ver CLAUDE.md).
    roadRef.current.style.transform = 'scaleX(0)'
    signs.forEach((s) => (s.style.opacity = '0'))
    names.forEach((n) => (n.style.opacity = '0'))
    animate(car, { translateX: busX(0) - 160, opacity: 0, duration: 0 })

    const arrive = (i) => {
      animate(signs[i], { opacity: [0, 1], rotateY: [90, 0], duration: 520, ease: 'outBack(1.4)' })
      animate(names[i], { opacity: [0, 1], translateY: [8, 0], duration: 360, ease: 'outQuad' })
      bounce()
    }

    later(() => {
      animate(roadRef.current, { scaleX: [0, 1], duration: 1100, ease: 'outExpo' })
      animate(car, { translateX: busX(0), opacity: [0, 1], duration: FIRST_DRIVE, ease: 'outCubic' })
      spinWheels(160, FIRST_DRIVE)
    }, START)

    let t = START + FIRST_DRIVE
    later(() => arrive(0), t)
    for (let i = 1; i < countries.length; i++) {
      t += PAUSE
      const at = t
      later(() => {
        animate(car, { translateX: busX(i), duration: HOP, ease: 'inOutSine' })
        spinWheels(busX(i) - busX(i - 1), HOP)
      }, at)
      t += HOP
      later(() => {
        stopRef.current = i
        arrive(i)
      }, t)
    }
    later(() => {
      readyRef.current = true
    }, t + 400)

    const onResize = () => {
      if (readyRef.current) park()
    }
    window.addEventListener('resize', onResize)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countries.length])

  return (
    <div ref={wrapRef} className="relative mt-7">
      <ol className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
        {countries.map((c, i) => (
          <li
            key={c.name}
            onMouseEnter={() => driveTo(i)}
            className="relative flex flex-col items-center px-2 text-center [perspective:400px]"
          >
            <span
              data-sign
              className="relative z-20 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white
                font-display text-[1.2rem] text-white shadow-lift"
              style={{ background: `var(--color-${c.color})`, color: STOP_INK[c.color] }}
            >
              {i + 1}
            </span>
            {/* Poste del letrero y hueco para la carretera */}
            <span aria-hidden="true" className="hidden h-12 w-1.5 rounded-b bg-azul/70 sm:block" />
            <span aria-hidden="true" className="hidden h-2.5 sm:block" />
            <h3 data-name className="mt-3 text-[1.15rem]">
              {c.name}
            </h3>
            <p className="mt-1 text-[0.82rem] leading-snug text-ink-soft">{c.places}</p>
          </li>
        ))}
      </ol>

      {/* Carretera con raya amarilla */}
      <span
        ref={roadRef}
        aria-hidden="true"
        className="absolute left-0 right-0 top-24 hidden h-2.5 origin-left rounded-full bg-azul sm:block"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--color-amarillo) 0 16px, transparent 16px 30px)',
          backgroundSize: '100% 2px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* La chiva: el contenedor avanza en X; el SVG rebota en Y */}
      <div aria-hidden="true" className="pointer-events-none absolute left-0 top-[54px] z-10 hidden sm:block">
        <ChivaBus ref={busRef} width={BUS_W} />
      </div>
    </div>
  )
}
