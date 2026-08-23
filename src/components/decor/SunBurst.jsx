/** Solecito dorado del Cultural Tip. */
export default function SunBurst({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="13" cy="13" r="5.4" fill="var(--color-gold)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 * Math.PI) / 180
        return (
          <line
            key={i}
            x1={13 + 8 * Math.cos(a)}
            y1={13 + 8 * Math.sin(a)}
            x2={13 + 11.5 * Math.cos(a)}
            y2={13 + 11.5 * Math.sin(a)}
            stroke="var(--color-gold)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )
      })}
    </svg>
  )
}
