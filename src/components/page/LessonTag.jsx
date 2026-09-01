/* Cuadritos tipo pixel art que salen del tag hacia arriba-izquierda. */
const PIXELS = [
  { x: 0, y: 0, s: 16, c: 'var(--color-coral)' },
  { x: 22, y: 6, s: 12, c: 'var(--color-gold)' },
  { x: 40, y: 0, s: 14, c: 'var(--color-coral)' },
  { x: 60, y: 10, s: 10, c: 'var(--color-gold)' },
  { x: 8, y: 24, s: 12, c: 'var(--color-gold)' },
  { x: 32, y: 28, s: 16, c: 'var(--color-coral)' },
  { x: 58, y: 30, s: 12, c: 'var(--color-coral)' },
  { x: 76, y: 22, s: 10, c: 'var(--color-gold)' },
]

/**
 * Etiqueta de lección: [1.1] coral + [título corto] navy, con decoración
 * de cuadritos saliendo hacia arriba.
 */
export default function LessonTag({ id, title }) {
  return (
    <div className="absolute left-6 top-6 z-20">
      <svg
        width="92"
        height="46"
        viewBox="0 0 92 46"
        aria-hidden="true"
        className="absolute -top-9 left-2"
      >
        {PIXELS.map((p, i) => (
          <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx="2" fill={p.c} opacity=".85" />
        ))}
      </svg>

      <div className="relative flex items-stretch overflow-hidden rounded-lg shadow-soft">
        <span className="flex items-center bg-coral-ink px-4 py-2 font-display text-[34px] leading-none text-white">
          {id}
        </span>
        {title && (
          <span className="flex items-center bg-navy px-5 py-2 font-display text-[30px] leading-none text-white">
            {title}
          </span>
        )}
      </div>
    </div>
  )
}
