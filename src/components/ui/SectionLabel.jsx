import Leaf from '../decor/Leaf'

/**
 * Label editorial en mayúsculas: UNIT 1 · LESSON 2 · VOCABULARY · EXERCISE 3
 * tone "sage" para VOCABULARY/EXERCISE, "coral" para UNIT/LESSON/CULTURAL TIP.
 */
export default function SectionLabel({ children, tone = 'sage', leaf = false, className = '' }) {
  const color = tone === 'coral' ? 'text-coral-ink' : 'text-sage-ink'
  return (
    <span className={`inline-flex items-center gap-1.5 label-caps ${color} ${className}`}>
      {leaf && <Leaf size={15} />}
      {children}
    </span>
  )
}
