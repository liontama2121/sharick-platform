import Leaf from '../decor/Leaf'

/**
 * Label editorial en mayúsculas: UNIT 1 · LESSON 2 · VOCABULARY · EXERCISE 3
 * tone "verde" para VOCABULARY/EXERCISE, "rojo" para UNIT/LESSON/CULTURAL TIP.
 */
export default function SectionLabel({ children, tone = 'verde', leaf = false, className = '' }) {
  const color = tone === 'rojo' ? 'text-rojo-ink' : 'text-verde-ink'
  return (
    <span className={`inline-flex items-center gap-1.5 label-caps ${color} ${className}`}>
      {leaf && <Leaf size={15} />}
      {children}
    </span>
  )
}
