/*
 * Puntadas de tejido: un rombo escalonado (kanaa wayuu) hecho de cuadritos,
 * con un rombito suelto que "se sale" hacia la esquina. Sustituye a los
 * cuadritos pixel de los tags y banners: misma función, lenguaje textil.
 */
const CELLS = (() => {
  const out = []
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const d = Math.abs(x - 3) + Math.abs(y - 3)
      if (d === 3) out.push({ x, y, k: 'a' })
      else if (d === 1) out.push({ x, y, k: 'b' })
      else if (d === 0) out.push({ x, y, k: 'c' })
    }
  }
  // rombito suelto abajo a la derecha
  ;[
    [8, 6],
    [7, 7],
    [9, 7],
    [8, 8],
  ].forEach(([x, y]) => out.push({ x, y, k: 'b' }))
  return out
})()

const TONES = {
  warm: { a: 'var(--color-coral)', b: 'var(--color-gold)', c: 'var(--color-bugambilia)', o: 0.92 },
  light: { a: '#ffffff', b: 'var(--color-gold)', c: '#ffffff', o: 0.9, oa: 0.28 },
  textile: { a: 'var(--color-turquesa)', b: 'var(--color-gold)', c: 'var(--color-bugambilia)', o: 0.92 },
}

export default function Stitches({ cell = 8, tone = 'warm', className = '' }) {
  const t = TONES[tone] ?? TONES.warm
  return (
    <svg
      width={cell * 10}
      height={cell * 9}
      viewBox="0 0 10 9"
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
    >
      {CELLS.map((c, i) => (
        <rect
          key={i}
          x={c.x + 0.08}
          y={c.y + 0.08}
          width="0.84"
          height="0.84"
          rx="0.14"
          fill={t[c.k]}
          opacity={c.k === 'a' && t.oa ? t.oa : t.o}
        />
      ))}
    </svg>
  )
}
