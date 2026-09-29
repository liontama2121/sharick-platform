import { forwardRef } from 'react'

const WINDOWS = [0, 1, 2, 3, 4]

/**
 * Chiva de perfil, mirando a la derecha: parrilla con equipaje, techo azul,
 * carrocería roja con fila de ventanas, franja amarilla y verde, parachoques
 * y ruedas. Las ruedas llevan [data-wheel] para girarlas mientras avanza.
 */
const ChivaBus = forwardRef(function ChivaBus({ width = 96, className = '', style }, ref) {
  return (
    <svg
      ref={ref}
      width={width}
      height={(width * 56) / 96}
      viewBox="0 0 96 56"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {/* Parrilla con equipaje */}
      <rect x="18" y="0" width="14" height="6" rx="1.5" fill="var(--color-amarillo)" />
      <rect x="35" y="1.5" width="10" height="4.5" rx="1.2" fill="var(--color-verde)" />
      <rect x="60" y="0" width="17" height="6" rx="1.5" fill="var(--color-rojo)" />
      <rect x="9" y="5.5" width="76" height="2.5" rx="1" fill="var(--color-madera)" />

      {/* Techo y carrocería */}
      <rect x="5" y="8" width="86" height="6" rx="3" fill="var(--color-azul)" />
      <rect x="4" y="13" width="88" height="29" rx="4" fill="var(--color-rojo)" />

      {/* Ventanas con filete amarillo */}
      {WINDOWS.map((i) => (
        <rect
          key={i}
          x={9 + i * 14.5}
          y="16"
          width="10.5"
          height="10.5"
          rx="2"
          fill="#ffffff"
          stroke="var(--color-amarillo)"
          strokeWidth="1.4"
        />
      ))}
      <rect x="83" y="16" width="7" height="11" rx="2" fill="#cfe3f5" />

      {/* Franjas pintadas */}
      <rect x="4" y="29.5" width="88" height="4" fill="var(--color-amarillo)" />
      <rect x="4" y="33.5" width="88" height="3" fill="var(--color-verde)" />
      <circle cx="90.5" cy="38.5" r="1.8" fill="var(--color-amarillo)" />

      {/* Parachoques */}
      <rect x="2" y="41" width="92" height="3.5" rx="1.75" fill="var(--color-azul)" />

      {/* Ruedas */}
      {[22, 74].map((cx) => (
        <g key={cx} data-wheel style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx={cx} cy="47" r="7.5" fill="#1e2530" />
          <circle cx={cx} cy="47" r="3.2" fill="var(--color-amarillo)" />
          <rect x={cx - 0.8} y="40.5" width="1.6" height="4" fill="var(--color-amarillo)" />
        </g>
      ))}
    </svg>
  )
})

export default ChivaBus
