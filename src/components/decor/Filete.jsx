import { useId } from 'react'

const V = (name) => `var(--color-${name})`

/*
 * Guardas pintadas de la chiva: las franjas decorativas que los pintores
 * de buses trazan a mano entre las bandas de color de la carrocería.
 * Cada motivo es un módulo que se repite en horizontal; la altura del
 * módulo se ajusta a `height` px para que la guarda sea una sola vuelta.
 *   rombos  · cadena de rombos alternados sobre banda de color
 *   dientes · triángulos enfrentados (zigzag de dos colores)
 *   ajedrez · damero de dos filas
 *   franjas · bandas horizontales con filetes blancos
 */
const TILES = {
  rombos: {
    w: 24,
    h: 12,
    body: (c) => (
      <>
        <rect width="24" height="12" fill={c[0]} />
        <path d="M6 1 11 6 6 11 1 6Z" fill={c[1]} />
        <path d="M18 1 23 6 18 11 13 6Z" fill={c[2]} />
        <circle cx="12" cy="6" r="1.2" fill="#fff" />
        <circle cx="0" cy="6" r="1.2" fill="#fff" />
        <circle cx="24" cy="6" r="1.2" fill="#fff" />
      </>
    ),
  },
  dientes: {
    w: 16,
    h: 12,
    body: (c) => (
      <>
        <rect width="16" height="12" fill={c[0]} />
        <path d="M0 12 8 1l8 11Z" fill={c[1]} />
        <path d="M4 12 8 6.5 12 12Z" fill={c[2]} />
      </>
    ),
  },
  ajedrez: {
    w: 12,
    h: 12,
    body: (c) => (
      <>
        <rect width="12" height="12" fill={c[0]} />
        <rect width="6" height="6" fill={c[1]} />
        <rect x="6" y="6" width="6" height="6" fill={c[1]} />
      </>
    ),
  },
  franjas: {
    w: 4,
    h: 16,
    body: (c) => (
      <>
        <rect width="4" height="16" fill="#fff" />
        <rect y="1" width="4" height="4" fill={c[0]} />
        <rect y="6" width="4" height="4" fill={c[1]} />
        <rect y="11" width="4" height="4" fill={c[2]} />
      </>
    ),
  },
}

const DEFAULT_COLORS = {
  rombos: ['rojo', 'amarillo', 'verde'],
  dientes: ['azul', 'amarillo', 'rojo'],
  ajedrez: ['azul', 'amarillo'],
  franjas: ['rojo', 'amarillo', 'verde'],
}

/**
 * Guarda pintada que rellena su caja (tamaño por `className`).
 * `colors`: nombres de token (rojo, amarillo, verde, azul, madera, morado)
 * o colores CSS. `height` ajusta una vuelta del motivo a esa altura.
 */
export default function Filete({ variant = 'rombos', colors, height = 12, className = 'h-3 w-full', style }) {
  const id = useId().replace(/:/g, '')
  const tile = TILES[variant] ?? TILES.rombos
  const c = (colors ?? DEFAULT_COLORS[variant] ?? DEFAULT_COLORS.rombos).map((x) =>
    /^[a-z-]+$/.test(x) ? V(x) : x,
  )
  const s = height / tile.h

  return (
    <svg aria-hidden="true" className={`block ${className}`} style={style} preserveAspectRatio="none">
      <defs>
        <pattern
          id={`fl-${id}`}
          width={tile.w}
          height={tile.h}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${s})`}
        >
          {tile.body(c)}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#fl-${id})`} />
    </svg>
  )
}
