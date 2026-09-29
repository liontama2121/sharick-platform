import Textile from '../decor/Textile'

/** "Reading" / "Listening" / "Speaking"… en Playfair coral con una cinta tejida debajo. */
export default function SectionHeading({ children, className = '' }) {
  if (!children) return null
  return (
    <div className={className}>
      <h2 className="font-display text-[40px] leading-none text-coral-ink">{children}</h2>
      <span aria-hidden="true" className="mt-2.5 block w-[90px] overflow-hidden rounded-[3px]">
        <Textile variant="wayuu" height={12} className="h-3 w-full" />
      </span>
    </div>
  )
}
