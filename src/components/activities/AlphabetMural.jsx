import { useEffect, useId, useRef, useState } from 'react'
import { animate, stagger } from 'animejs'

import { Check } from 'lucide-react'

import SmartImage from '../ui/ImagePlaceholder'
import { audioExists, speak, stopSpeaking } from '../../utils/speak'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/* Pintura de grafiti: colores del libro, cada letra con su contorno */
const PAINT = [
  { fill: 'var(--color-rojo)', line: 'var(--color-azul)' },
  { fill: 'var(--color-amarillo)', line: 'var(--color-azul)' },
  { fill: 'var(--color-verde)', line: 'var(--color-chasis)' },
  { fill: 'var(--color-paper)', line: 'var(--color-rojo-ink)' },
  { fill: 'var(--color-morado)', line: 'var(--color-chasis)' },
  { fill: 'color-mix(in srgb, var(--color-amarillo) 60%, var(--color-rojo))', line: 'var(--color-azul)' },
  { fill: 'color-mix(in srgb, var(--color-azul) 45%, var(--color-paper))', line: 'var(--color-azul)' },
]
/* Inclinación de cada letra (determinista): el mural no está en regla */
const TILT = [-6, 4, -2, 7, -4, 3, -7, 5, -3, 6, -5, 2, -6, 4, 7, -3, 5, -4, 3, -6, 6, -2, 4, -5, 2, -4]

/* Manchas de aerosol detrás de las letras */
const SPLATS = [
  { x: 8, y: 14, r: 120, c: 'var(--color-amarillo)' },
  { x: 42, y: 70, r: 150, c: 'var(--color-verde)' },
  { x: 78, y: 22, r: 130, c: 'var(--color-rojo)' },
  { x: 92, y: 80, r: 110, c: 'var(--color-morado)' },
  { x: 25, y: 92, r: 90, c: 'var(--color-azul)' },
]

let currentClip = null

/**
 * "Listen and repeat." El alfabeto pintado como mural de arte urbano
 * (Bogotá y Medellín) sobre un muro de ladrillo. Las letras son contenido
 * real: cada una es un botón que reproduce su audio (letter-a.mp3 …) y
 * late al sonar. Se completa cuando el estudiante escuchó las 26.
 * section: { audioPattern: "/audio/english/module1/letter-{l}.mp3", artist: { src, alt } }
 */
export default function AlphabetMural({ section, completed, onComplete }) {
  const [heard, setHeard] = useState(() => new Set())
  const [playing, setPlaying] = useState(null)
  const wallRef = useRef(null)
  const reported = useRef(false)
  const pid = useId().replace(/:/g, '')

  useEffect(() => {
    const wall = wallRef.current
    if (!wall || reduced()) return
    const letters = wall.querySelectorAll('[data-letter]')
    letters.forEach((el) => (el.style.opacity = '0'))
    const a = animate(letters, {
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 520,
      delay: stagger(28, { start: 150 }),
      ease: 'outBack(1.6)',
    })
    return () => a.revert()
  }, [section.id])

  /* Letras sin mp3 todavía (se leen con la voz del navegador) */
  const missing = useRef(new Set())
  useEffect(() => {
    ALPHABET.forEach((L) => {
      const src = (section.audioPattern ?? '').replace('{l}', L.toLowerCase())
      audioExists(src).then((ok) => !ok && missing.current.add(L))
    })
  }, [section.audioPattern])

  const play = (letter, el) => {
    if (el && !reduced()) {
      animate(el, { scale: [1, 1.28, 1], rotate: [0, -6, 4, 0], duration: 520, ease: 'outQuad' })
    }
    const src = (section.audioPattern ?? '').replace('{l}', letter.toLowerCase())
    currentClip?.pause()
    if (missing.current.has(letter)) {
      /* Ya se sabe que no hay mp3: se lee en el mismo clic */
      setPlaying(letter)
      if (!speak(`${letter}.`, { rate: 0.8, onEnd: () => setPlaying((p) => (p === letter ? null : p)) })) setPlaying(null)
    } else if (src) {
      const clip = new Audio(src)
      currentClip = clip
      setPlaying(letter)
      const done = () => setPlaying((p) => (p === letter ? null : p))
      /* Sin mp3 todavía: la letra la dice la voz del navegador */
      const fallback = () => {
        if (!speak(`${letter}.`, { rate: 0.8, onEnd: done })) done()
      }
      clip.onended = done
      clip.onerror = fallback
      clip.play().catch((err) => {
        if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') fallback()
      })
    }
    setHeard((prev) => {
      if (prev.has(letter)) return prev
      const next = new Set(prev)
      next.add(letter)
      if (next.size === ALPHABET.length && !reported.current) {
        reported.current = true
        onComplete?.(100)
      }
      return next
    })
  }

  useEffect(
    () => () => {
      currentClip?.pause()
      stopSpeaking()
    },
    [],
  )

  const rows = [ALPHABET.slice(0, 7), ALPHABET.slice(7, 14), ALPHABET.slice(14, 20), ALPHABET.slice(20)]

  return (
    <div className="grid h-full grid-cols-[1fr_330px] gap-6">
      {/* El muro */}
      <div
        ref={wallRef}
        className="relative overflow-hidden rounded-[22px] border-[5px] border-madera shadow-lift"
      >
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id={`${pid}-ladrillo`} width="96" height="48" patternUnits="userSpaceOnUse">
              <rect width="96" height="48" fill="color-mix(in srgb, var(--color-madera) 35%, var(--color-paper))" />
              <rect x="2" y="2" width="44" height="20" rx="2" fill="color-mix(in srgb, var(--color-rojo) 30%, color-mix(in srgb, var(--color-madera) 40%, var(--color-paper)))" />
              <rect x="50" y="2" width="44" height="20" rx="2" fill="color-mix(in srgb, var(--color-rojo) 22%, color-mix(in srgb, var(--color-madera) 38%, var(--color-paper)))" />
              <rect x="-22" y="26" width="44" height="20" rx="2" fill="color-mix(in srgb, var(--color-rojo) 26%, color-mix(in srgb, var(--color-madera) 42%, var(--color-paper)))" />
              <rect x="26" y="26" width="44" height="20" rx="2" fill="color-mix(in srgb, var(--color-rojo) 34%, color-mix(in srgb, var(--color-madera) 36%, var(--color-paper)))" />
              <rect x="74" y="26" width="44" height="20" rx="2" fill="color-mix(in srgb, var(--color-rojo) 26%, color-mix(in srgb, var(--color-madera) 42%, var(--color-paper)))" />
            </pattern>
            <radialGradient id={`${pid}-luz`} cx="0.3" cy="0.2" r="0.9">
              <stop offset="0" stopColor="var(--color-paper)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--color-chasis)" stopOpacity="0.25" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${pid}-ladrillo)`} />
          <rect width="100%" height="100%" fill={`url(#${pid}-luz)`} />
        </svg>
        {/* Manchas de aerosol: gradientes CSS (círculos SVG translúcidos sobre el
            patrón de ladrillo colgaban el rasterizado de Chrome) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: SPLATS.map(
              (s) => `radial-gradient(circle at ${s.x}% ${s.y}%, color-mix(in srgb, ${s.c} 30%, transparent), transparent ${s.r}px)`,
            ).join(", "),
          }}
        />

        <div className="relative flex h-full flex-col justify-center gap-3 px-8 py-6">
          {rows.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-3">
              {row.map((L) => {
                const i = ALPHABET.indexOf(L)
                const paint = PAINT[i % PAINT.length]
                const done = heard.has(L)
                return (
                  <button
                    key={L}
                    type="button"
                    data-letter
                    onClick={(e) => play(L, e.currentTarget)}
                    aria-label={`Letter ${L}. Listen`}
                    className="group relative flex h-[118px] min-w-[118px] items-end justify-center rounded-2xl px-1 pb-2
                      outline-none transition-colors hover:bg-paper/15 focus-visible:ring-4 focus-visible:ring-amarillo"
                    style={{ rotate: `${TILT[i]}deg` }}
                  >
                    <span
                      className="font-display text-[78px] leading-none"
                      style={{
                        color: paint.fill,
                        WebkitTextStroke: `5px ${paint.line}`,
                        paintOrder: 'stroke fill',
                        textShadow: `5px 6px 0 color-mix(in srgb, ${paint.line} 55%, transparent)`,
                      }}
                    >
                      {L}
                    </span>
                    <span
                      className="ml-0.5 font-display text-[44px] leading-none"
                      style={{
                        color: paint.fill,
                        WebkitTextStroke: `4px ${paint.line}`,
                        paintOrder: 'stroke fill',
                      }}
                    >
                      {L.toLowerCase()}
                    </span>
                    {/* Ya la escuchó: insignia verde con ✓ (amarilla mientras suena) */}
                    <span
                      className={`absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper
                        text-paper shadow-soft transition-opacity
                        ${playing === L ? 'bg-amarillo opacity-100' : done ? 'bg-verde-ink opacity-100' : 'opacity-0'}`}
                    >
                      <Check size={16} strokeWidth={3.4} />
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Quien pinta el mural + progreso */}
      <div className="flex min-h-0 flex-col gap-4">
        <div className="min-h-0 flex-1">
          <SmartImage
            src={section.artist?.src}
            alt={section.artist?.alt ?? ''}
            emoji="🎨"
            className="h-full"
          />
        </div>
        <div className="rounded-2xl bg-box px-5 py-4 font-body text-[18px] text-ink-soft">
          <p className="mb-2 text-[24px] font-semibold">
            <span className="font-bold text-azul">{heard.size}</span> of 26 letters
            {completed ? ' · Done!' : ''}
          </p>
          <span className="flex gap-[3px]">
            {ALPHABET.map((L) => (
              <span key={L} className={`h-2.5 flex-1 rounded-full ${heard.has(L) ? 'bg-verde-ink' : 'bg-azul/12'}`} />
            ))}
          </span>
          <p className="mt-2 text-[16px]">Tap a letter. Listen and repeat.</p>
        </div>
      </div>
    </div>
  )
}
