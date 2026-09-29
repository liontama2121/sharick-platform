import { useId } from 'react'

const C = {
  navy: 'var(--color-navy)',
  coral: 'var(--color-coral)',
  coralInk: 'var(--color-coral-ink)',
  gold: 'var(--color-gold)',
  sage: 'var(--color-sage)',
  bug: 'var(--color-bugambilia)',
  turq: 'var(--color-turquesa)',
  paper: 'var(--color-paper)',
}

/*
 * Un motivo por país del libro (inspiración geométrica, no réplica):
 * - vueltiao (Colombia): banda crema y oscura del sombrero, zigzag trenzado.
 * - wayuu (Venezuela · La Guajira): rombos kanaa encadenados de las mochilas.
 * - aguayo (Bolivia): franjas de colores con una fila central de rombitos.
 * - mola (Panamá): capas de tela recortadas, contornos concéntricos.
 */
const TILES = {
  vueltiao: {
    w: 20,
    h: 16,
    body: (
      <>
        <rect width="20" height="16" fill={C.navy} />
        <rect y="0" width="20" height="2" fill={C.paper} />
        <rect y="14" width="20" height="2" fill={C.paper} />
        <path d="M0 11.5 5 4.5l5 7 5-7 5 7" fill="none" stroke={C.paper} strokeWidth="2.2" strokeLinejoin="miter" />
        <rect x="4" y="11" width="2" height="2" fill={C.gold} />
        <rect x="14" y="3" width="2" height="2" fill={C.gold} />
      </>
    ),
  },
  wayuu: {
    w: 24,
    h: 24,
    body: (
      <>
        <rect width="24" height="24" fill={C.bug} />
        <path d="M12 1 23 12 12 23 1 12Z" fill={C.gold} />
        <path d="M12 5.5 18.5 12 12 18.5 5.5 12Z" fill={C.bug} />
        <path d="M12 9 15 12 12 15 9 12Z" fill={C.turq} />
        <rect x="0" y="0" width="3" height="3" fill={C.turq} />
        <rect x="21" y="21" width="3" height="3" fill={C.turq} />
        <rect x="21" y="0" width="3" height="3" fill={C.turq} />
        <rect x="0" y="21" width="3" height="3" fill={C.turq} />
      </>
    ),
  },
  aguayo: {
    w: 12,
    h: 32,
    body: (
      <>
        <rect y="0" width="12" height="3" fill={C.navy} />
        <rect y="3" width="12" height="4" fill={C.coralInk} />
        <rect y="7" width="12" height="2" fill={C.gold} />
        <rect y="9" width="12" height="3" fill={C.bug} />
        <rect y="12" width="12" height="8" fill={C.navy} />
        <path d="M6 13 9 16 6 19 3 16Z" fill={C.gold} />
        <rect x="5.2" y="15.2" width="1.6" height="1.6" fill={C.coral} />
        <rect y="20" width="12" height="3" fill={C.bug} />
        <rect y="23" width="12" height="2" fill={C.gold} />
        <rect y="25" width="12" height="4" fill={C.turq} />
        <rect y="29" width="12" height="3" fill={C.navy} />
      </>
    ),
  },
  mola: {
    w: 32,
    h: 32,
    body: (
      <>
        <rect width="32" height="32" fill={C.coralInk} />
        <rect x="3" y="3" width="26" height="26" rx="7" fill={C.navy} />
        <rect x="6.5" y="6.5" width="19" height="19" rx="5" fill={C.coral} />
        <rect x="9.5" y="9.5" width="13" height="13" rx="3.5" fill={C.navy} />
        <rect x="12.5" y="12.5" width="7" height="7" rx="2" fill={C.gold} />
        <rect x="15" y="0" width="2" height="4.5" rx="1" fill={C.navy} />
        <rect x="15" y="27.5" width="2" height="4.5" rx="1" fill={C.navy} />
        <rect x="0" y="15" width="4.5" height="2" rx="1" fill={C.navy} />
        <rect x="27.5" y="15" width="4.5" height="2" rx="1" fill={C.navy} />
      </>
    ),
  },
}

export const TEXTILES = Object.keys(TILES)

/**
 * Tela tejida que rellena su caja (el tamaño lo da `className`).
 * `scale` agranda la puntada; `fit="height"` ajusta la altura del motivo a
 * `height` px para bandas (una sola vuelta de aguayo, por ejemplo).
 */
export default function Textile({ variant = 'wayuu', scale = 1, height, className = 'h-6 w-full', style }) {
  const id = useId().replace(/:/g, '')
  const tile = TILES[variant] ?? TILES.wayuu
  const s = height ? height / tile.h : scale

  return (
    <svg aria-hidden="true" className={`block ${className}`} style={style} preserveAspectRatio="none">
      <defs>
        <pattern
          id={`tx-${id}`}
          width={tile.w}
          height={tile.h}
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${s})`}
        >
          {tile.body}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#tx-${id})`} />
    </svg>
  )
}
