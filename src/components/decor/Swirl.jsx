/** Floritura dorada (~) para acompañar subtítulos de lección. */
export default function Swirl({ width = 96, className = '' }) {
  return (
    <svg
      width={width}
      height={(width * 14) / 96}
      viewBox="0 0 96 14"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M2 8c6-7 12-7 18 0s12 7 18 0 12-7 18 0 12 7 18 0"
        stroke="var(--color-gold)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="90" cy="8" r="2.6" fill="var(--color-gold)" />
    </svg>
  )
}
