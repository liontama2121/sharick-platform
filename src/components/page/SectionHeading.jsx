/** "Reading" / "Listening" / "Speaking"… en Playfair coral con subrayado dorado. */
export default function SectionHeading({ children, className = '' }) {
  if (!children) return null
  return (
    <div className={className}>
      <h2 className="font-display text-[40px] leading-none text-coral-ink">{children}</h2>
      <span aria-hidden="true" className="mt-2 block h-1 w-[60px] rounded-full bg-gold" />
    </div>
  )
}
