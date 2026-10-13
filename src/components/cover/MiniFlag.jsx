/* Banderas pintadas de los cuatro países, 3:2. Se dibujan en SVG y no con
   emoji: en Windows los emoji de bandera salen como letras ("CO"). */

const Star = ({ cx, cy, r, fill }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rad = i % 2 ? r * 0.42 : r
    return `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`
  }).join(' ')
  return <polygon points={pts} fill={fill} />
}

const FLAGS = {
  colombia: (
    <>
      <rect width="30" height="10" fill="var(--color-col-yellow)" />
      <rect y="10" width="30" height="5" fill="var(--color-col-blue)" />
      <rect y="15" width="30" height="5" fill="var(--color-col-red)" />
    </>
  ),
  venezuela: (
    <>
      <rect width="30" height="6.67" fill="var(--color-col-yellow)" />
      <rect y="6.67" width="30" height="6.67" fill="var(--color-ven-blue)" />
      <rect y="13.33" width="30" height="6.67" fill="var(--color-col-red)" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI * (1.15 + (i * 0.7) / 7)
        return (
          <circle key={i} cx={15 + Math.cos(a) * 4.6} cy={13.6 + Math.sin(a) * 4.6} r="0.75" fill="var(--color-paper)" />
        )
      })}
    </>
  ),
  panama: (
    <>
      <rect width="30" height="20" fill="var(--color-paper)" />
      <rect x="15" width="15" height="10" fill="var(--color-pan-red)" />
      <rect y="10" width="15" height="10" fill="var(--color-pan-blue)" />
      <Star cx={7.5} cy={5} r={2.6} fill="var(--color-pan-blue)" />
      <Star cx={22.5} cy={15} r={2.6} fill="var(--color-pan-red)" />
    </>
  ),
  bolivia: (
    <>
      <rect width="30" height="6.67" fill="var(--color-bol-red)" />
      <rect y="6.67" width="30" height="6.67" fill="var(--color-bol-yellow)" />
      <rect y="13.33" width="30" height="6.67" fill="var(--color-bol-green)" />
    </>
  ),
}

export default function MiniFlag({ code, width = 42, className = '' }) {
  const body = FLAGS[code]
  if (!body) return null
  return (
    <svg
      viewBox="0 0 30 20"
      width={width}
      height={(width * 2) / 3}
      aria-hidden="true"
      className={`shrink-0 overflow-hidden rounded-[4px] ring-2 ring-white ${className}`}
    >
      {body}
    </svg>
  )
}
