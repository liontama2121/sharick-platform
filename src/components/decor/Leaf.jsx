/** Rombo pintado de la chiva que acompaña los labels VOCABULARY / EXERCISE. */
export default function Leaf({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path d="M8 1 15 8 8 15 1 8Z" fill="var(--color-verde)" />
      <path d="M8 4.5 11.5 8 8 11.5 4.5 8Z" fill="var(--color-amarillo)" />
    </svg>
  )
}
