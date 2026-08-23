/**
 * Reloj analógico clásico y legible (Sharick pidió explícitamente un reloj normal).
 * @param {string} time  "HH:MM" en formato 24h
 */
export default function AnalogClock({ time = '12:00', size = 120, showDigital = true }) {
  const [rawH, rawM] = String(time).split(':')
  const h24 = Number(rawH) || 0
  const m = Number(rawM) || 0

  const minuteAngle = m * 6
  const hourAngle = ((h24 % 12) + m / 60) * 30

  const R = 50
  const ticks = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        role="img"
        aria-label={`Reloj marcando las ${time}`}
      >
        <circle cx="60" cy="60" r={R + 6} fill="#ffffff" stroke="var(--color-navy)" strokeWidth="3" />
        <circle cx="60" cy="60" r={R + 6} fill="none" stroke="var(--color-gold)" strokeWidth="1.5" opacity="0.7" />

        {ticks.map((i) => {
          const a = (i * 30 * Math.PI) / 180
          const outer = R
          const inner = i % 3 === 0 ? R - 9 : R - 5
          return (
            <line
              key={i}
              x1={60 + inner * Math.sin(a)}
              y1={60 - inner * Math.cos(a)}
              x2={60 + outer * Math.sin(a)}
              y2={60 - outer * Math.cos(a)}
              stroke="var(--color-ink)"
              strokeWidth={i % 3 === 0 ? 3 : 1.5}
              strokeLinecap="round"
            />
          )
        })}

        {[12, 3, 6, 9].map((n, i) => {
          const a = (i * 90 * Math.PI) / 180
          const r = R - 19
          return (
            <text
              key={n}
              x={60 + r * Math.sin(a)}
              y={60 - r * Math.cos(a) + 5}
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fontFamily="Nunito Sans, sans-serif"
              fill="var(--color-navy)"
            >
              {n}
            </text>
          )
        })}

        {/* manecilla de las horas */}
        <line
          x1="60" y1="60"
          x2={60 + 24 * Math.sin((hourAngle * Math.PI) / 180)}
          y2={60 - 24 * Math.cos((hourAngle * Math.PI) / 180)}
          stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round"
        />
        {/* manecilla de los minutos */}
        <line
          x1="60" y1="60"
          x2={60 + 36 * Math.sin((minuteAngle * Math.PI) / 180)}
          y2={60 - 36 * Math.cos((minuteAngle * Math.PI) / 180)}
          stroke="var(--color-coral-ink)" strokeWidth="3.5" strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="4" fill="var(--color-navy)" />
      </svg>

      {showDigital && (
        <span className="label-caps text-ink-soft">{time}</span>
      )}
    </div>
  )
}
