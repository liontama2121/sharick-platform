/**
 * Flor tropical para las esquinas inferiores de la página.
 * variant: "bird" (ave del paraíso) · "heliconia" · "leaves"
 */
export default function TropicalFlower({ variant = 'bird', size = 130, flip = false, className = '' }) {
  const shapes = {
    bird: (
      <>
        <path d="M18 108c14-6 26-16 34-29" stroke="var(--color-sage-ink)" strokeWidth="3" strokeLinecap="round" />
        <path d="M52 79c10-2 19-7 26-15-11-2-21 1-28 8Z" fill="var(--color-sage)" />
        <path d="M52 79c9 4 19 5 29 2-7-8-17-11-26-8Z" fill="var(--color-sage-ink)" opacity=".75" />
        <path d="M55 76c6-12 16-21 29-25-1 12-7 22-17 28Z" fill="var(--color-coral)" />
        <path d="M62 72c9-9 20-14 32-15-4 11-12 19-23 22Z" fill="var(--color-gold)" opacity=".9" />
        <path d="M60 78c11-4 22-4 33 1-8 7-19 9-29 5Z" fill="var(--color-coral)" opacity=".8" />
        <circle cx="86" cy="52" r="4" fill="var(--color-gold)" />
      </>
    ),
    heliconia: (
      <>
        <path d="M22 112c12-10 20-24 24-40" stroke="var(--color-sage-ink)" strokeWidth="3" strokeLinecap="round" />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M46 ${74 - i * 15}c10-4 21-3 30 3-9 6-20 7-30 3Z`}
            fill={i % 2 ? 'var(--color-coral)' : 'var(--color-gold)'}
            opacity={0.95 - i * 0.1}
          />
        ))}
        <path d="M44 76c-9-6-14-16-14-27 10 5 16 15 16 26Z" fill="var(--color-sage)" />
      </>
    ),
    leaves: (
      <>
        <path d="M16 114c18-8 32-22 42-40" stroke="var(--color-sage-ink)" strokeWidth="3" strokeLinecap="round" />
        <path d="M58 74c2-16 12-29 27-35 2 17-7 31-22 37Z" fill="var(--color-sage)" />
        <path d="M62 82c13-8 28-9 42-3-10 12-25 16-39 10Z" fill="var(--color-sage-ink)" opacity=".7" />
        <path d="M40 92c-9-4-15-12-17-22 10 2 17 10 19 20Z" fill="var(--color-sage)" opacity=".85" />
        <circle cx="98" cy="60" r="3.4" fill="var(--color-gold)" />
        <circle cx="107" cy="70" r="2.4" fill="var(--color-coral)" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      aria-hidden="true"
      className={className}
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      {shapes[variant] ?? shapes.bird}
    </svg>
  )
}
