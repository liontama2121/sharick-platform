import { useId } from 'react'

/* Ventanas abiertas de la carrocería (x de cada vano) */
const BAYS = [58, 112, 166, 220, 274, 328]
/* Pasajeros asomados: vano y tono de piel (mezclas de tokens) */
const PASAJEROS = [
  { bay: 0, tono: 'color-mix(in srgb, var(--color-madera) 70%, white)', y: 120 },
  { bay: 2, tono: 'color-mix(in srgb, var(--color-madera) 90%, black)', y: 116 },
  { bay: 3, tono: 'color-mix(in srgb, var(--color-madera) 55%, white)', y: 122 },
  { bay: 5, tono: 'color-mix(in srgb, var(--color-madera) 80%, white)', y: 118 },
]

/**
 * La chiva, símbolo del libro, en vista lateral con volumen: carrocería de
 * madera pintada con luz desde arriba (degradados), ventanas abiertas con
 * pasajeros, parrilla cargada (maletas, racimo de plátano, huacal), cabina
 * con parabrisas que refleja el cielo, capó azul, parrilla cromada, faro y
 * llantas de rin rojo. En el costado, "English Route" rotulado.
 * viewBox 560x320, mira a la derecha; las ruedas llevan [data-wheel] y la
 * carrocería [data-body] para animar la llegada.
 */
export default function Chiva({ className = '', title = 'English Route', ...svgProps }) {
  const id = useId().replace(/:/g, '')
  const g = (n) => `${id}-${n}`

  return (
    <svg viewBox="0 0 560 320" className={className} aria-hidden="true" {...svgProps}>
      <defs>
        {/* Luz cenital: claro arriba, sombra abajo */}
        <linearGradient id={g('luz')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-paper)" stopOpacity="0.28" />
          <stop offset="0.45" stopColor="var(--color-paper)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--color-chasis)" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={g('rojo')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-rojo)" />
          <stop offset="1" stopColor="var(--color-rojo-ink)" />
        </linearGradient>
        <linearGradient id={g('azul')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--color-azul) 70%, white)" />
          <stop offset="1" stopColor="var(--color-azul)" />
        </linearGradient>
        <linearGradient id={g('interior')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-ink)" />
          <stop offset="1" stopColor="var(--color-ink-soft)" />
        </linearGradient>
        <linearGradient id={g('vidrio')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-cielo)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--color-azul) 45%, white)" />
        </linearGradient>
        <linearGradient id={g('cromo')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-paper)" />
          <stop offset="0.45" stopColor="color-mix(in srgb, var(--color-ink-soft) 40%, var(--color-paper))" />
          <stop offset="0.55" stopColor="color-mix(in srgb, var(--color-ink-soft) 80%, var(--color-paper))" />
          <stop offset="1" stopColor="var(--color-paper-edge)" />
        </linearGradient>
        <radialGradient id={g('llanta')} cx="0.5" cy="0.45" r="0.55">
          <stop offset="0.6" stopColor="var(--color-ink)" />
          <stop offset="1" stopColor="var(--color-chasis)" />
        </radialGradient>
        <radialGradient id={g('faro')} cx="0.4" cy="0.4" r="0.6">
          <stop offset="0" stopColor="var(--color-paper)" />
          <stop offset="0.6" stopColor="color-mix(in srgb, var(--color-amarillo) 45%, white)" />
          <stop offset="1" stopColor="var(--color-amarillo)" />
        </radialGradient>
        <filter id={g('sombra')} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <pattern id={g('rombos')} width="22" height="14" patternUnits="userSpaceOnUse">
          <rect width="22" height="14" fill="var(--color-azul)" />
          <path d="M5.5 1.5 10 7 5.5 12.5 1 7Z" fill="var(--color-amarillo)" />
          <path d="M16.5 1.5 21 7 16.5 12.5 12 7Z" fill="var(--color-rojo)" />
        </pattern>
        <clipPath id={g('cuerpo')}>
          <path d="M40,82 Q40,70 52,70 H404 V250 H40Z" />
        </clipPath>
      </defs>

      {/* Sombra en el suelo */}
      <ellipse cx="290" cy="300" rx="250" ry="12" fill="var(--color-chasis)" opacity="0.45" filter={`url(#${g('sombra')})`} />

      <g data-body>
        {/* ── Parrilla con carga ─────────────────────────────── */}
        <g>
          <rect x="70" y="18" width="62" height="30" rx="7" fill="var(--color-amarillo)" />
          <rect x="70" y="18" width="62" height="30" rx="7" fill={`url(#${g('luz')})`} />
          <rect x="98" y="16" width="6" height="34" fill="var(--color-madera)" opacity="0.5" />
          <rect x="140" y="26" width="48" height="22" rx="5" fill="var(--color-verde)" />
          <rect x="140" y="26" width="48" height="22" rx="5" fill={`url(#${g('luz')})`} />
          {/* Huacal de madera */}
          <rect x="196" y="20" width="56" height="28" fill="color-mix(in srgb, var(--color-madera) 75%, white)" />
          {[204, 220, 236].map((x) => (
            <rect key={x} x={x} y="20" width="4" height="28" fill="var(--color-madera)" />
          ))}
          <rect x="196" y="20" width="56" height="28" fill={`url(#${g('luz')})`} />
          {/* Racimo de plátano */}
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M${270 + i * 9},46 q-6,-18 4,-30`}
                stroke={i % 2 ? 'var(--color-verde)' : 'color-mix(in srgb, var(--color-verde) 55%, var(--color-amarillo))'}
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </g>
          <rect x="318" y="22" width="70" height="26" rx="6" fill="var(--color-rojo)" />
          <rect x="318" y="22" width="70" height="26" rx="6" fill={`url(#${g('luz')})`} />
          <path d="M318,35 H388" stroke="var(--color-amarillo)" strokeWidth="3" />
          {/* Barandas */}
          <rect x="44" y="48" width="364" height="7" rx="3" fill="var(--color-madera)" />
          {[52, 120, 190, 260, 330, 398].map((x) => (
            <rect key={x} x={x - 2.5} y="40" width="5" height="16" fill="var(--color-madera)" />
          ))}
          <rect x="44" y="38" width="364" height="4" rx="2" fill="color-mix(in srgb, var(--color-madera) 70%, black)" />
        </g>

        {/* ── Techo ──────────────────────────────────────────── */}
        <path d="M30,74 Q30,58 46,58 H414 Q424,58 424,68 V76 H30Z" fill={`url(#${g('azul')})`} />
        <rect x="30" y="58" width="394" height="3" fill="var(--color-paper)" opacity="0.35" />

        {/* ── Carrocería de pasajeros ────────────────────────── */}
        <g clipPath={`url(#${g('cuerpo')})`}>
          <rect x="40" y="70" width="364" height="180" fill={`url(#${g('rojo')})`} />
          {/* Vanos abiertos con banca y pasajeros */}
          {BAYS.map((x) => (
            <g key={x}>
              <path d={`M${x},150 V100 Q${x},88 ${x + 12},88 H${x + 32} Q${x + 44},88 ${x + 44},100 V150Z`} fill={`url(#${g('interior')})`} />
              <rect x={x} y="140" width="44" height="10" fill="var(--color-madera)" />
            </g>
          ))}
          {PASAJEROS.map((p, i) => {
            const x = BAYS[p.bay] + 22
            return (
              <g key={i}>
                <path d={`M${x - 15},150 Q${x - 14},${p.y + 12} ${x},${p.y + 12} Q${x + 14},${p.y + 12} ${x + 15},150Z`} fill={['var(--color-amarillo)', 'var(--color-verde)', 'var(--color-paper)', 'var(--color-morado)'][i]} />
                <circle cx={x} cy={p.y} r="10" fill={p.tono} />
                <path d={`M${x - 10},${p.y - 3} Q${x},${p.y - 16} ${x + 10},${p.y - 3}`} fill="var(--color-ink)" />
              </g>
            )
          })}
          {/* Pilares de madera pintada entre vanos */}
          {BAYS.slice(1).map((x) => (
            <rect key={x} x={x - 10} y="84" width="10" height="66" fill="var(--color-amarillo)" />
          ))}
          {/* Bandas pintadas */}
          <rect x="40" y="150" width="364" height="12" fill="var(--color-amarillo)" />
          <rect x="40" y="162" width="364" height="14" fill={`url(#${g('rombos')})`} />
          <rect x="40" y="226" width="364" height="10" fill="var(--color-verde)" />
          <rect x="40" y="236" width="364" height="14" fill="var(--color-azul)" />
          {/* Rótulo del costado */}
          <rect x="120" y="186" width="210" height="32" rx="16" fill="var(--color-amarillo)" />
          <text
            x="225"
            y="208"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize="21"
            fill="var(--color-azul)"
            style={{ paintOrder: 'stroke' }}
            stroke="var(--color-paper)"
            strokeWidth="3"
          >
            {title}
          </text>
          {/* Luz y volumen sobre toda la carrocería */}
          <rect x="40" y="70" width="364" height="180" fill={`url(#${g('luz')})`} />
        </g>
        {/* Escalera trasera */}
        <g fill="var(--color-madera)">
          <rect x="24" y="76" width="5" height="170" />
          <rect x="36" y="76" width="5" height="170" />
          {[96, 122, 148, 174, 200, 226].map((y) => (
            <rect key={y} x="24" y={y} width="17" height="4" />
          ))}
        </g>

        {/* ── Cabina y capó ──────────────────────────────────── */}
        <path d="M404,70 H440 Q458,70 462,90 L470,150 V250 H404Z" fill={`url(#${g('rojo')})`} />
        <path d="M410,86 H438 Q450,86 453,98 L459,146 H410Z" fill={`url(#${g('vidrio')})`} />
        <path d="M420,90 L428,90 L416,144 L410,144Z" fill="var(--color-paper)" opacity="0.55" />
        <rect x="404" y="150" width="66" height="12" fill="var(--color-amarillo)" />
        <path d="M404,70 H440 Q458,70 462,90 L470,150 V250 H404Z" fill={`url(#${g('luz')})`} />

        <path d="M468,156 Q520,156 538,176 Q548,188 548,206 V246 H468Z" fill={`url(#${g('azul')})`} />
        <path d="M478,170 Q500,164 524,176" stroke="var(--color-amarillo)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M480,186 Q504,180 530,192" stroke="var(--color-rojo)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M468,156 Q520,156 538,176 Q548,188 548,206 V246 H468Z" fill={`url(#${g('luz')})`} />

        {/* Parrilla cromada, faro y parachoques */}
        <rect x="540" y="196" width="14" height="48" rx="3" fill={`url(#${g('cromo')})`} />
        {[544, 548].map((x) => (
          <rect key={x} x={x} y="200" width="1.6" height="40" fill="var(--color-ink-soft)" />
        ))}
        <circle cx="534" cy="186" r="11" fill={`url(#${g('cromo')})`} />
        <circle cx="534" cy="186" r="8" fill={`url(#${g('faro')})`} />
        <rect x="396" y="244" width="164" height="11" rx="5.5" fill={`url(#${g('cromo')})`} />
        <rect x="26" y="244" width="40" height="11" rx="5.5" fill={`url(#${g('cromo')})`} />

        {/* Chasis y guardabarros */}
        <rect x="40" y="250" width="440" height="14" fill="var(--color-ink)" />
        <path d="M78,264 A54,54 0 0 1 186,264Z" fill="var(--color-chasis)" />
        <path d="M388,264 A54,54 0 0 1 496,264Z" fill="var(--color-chasis)" />
      </g>

      {/* Ruedas: llanta, rin rojo con rayos, copa cromada */}
      {[132, 442].map((cx) => (
        <g key={cx} data-wheel style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
          <circle cx={cx} cy="266" r="40" fill={`url(#${g('llanta')})`} />
          <circle cx={cx} cy="266" r="23" fill="var(--color-rojo)" />
          <circle cx={cx} cy="266" r="23" fill={`url(#${g('luz')})`} />
          {[0, 60, 120].map((a) => (
            <rect
              key={a}
              x={cx - 2}
              y="245"
              width="4"
              height="42"
              fill="var(--color-amarillo)"
              transform={`rotate(${a} ${cx} 266)`}
            />
          ))}
          <circle cx={cx} cy="266" r="8" fill={`url(#${g('cromo')})`} />
        </g>
      ))}
    </svg>
  )
}
