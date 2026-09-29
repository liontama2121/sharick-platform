import Filete from '../decor/Filete'

/** "Reading" / "Listening"… rotulado en rojo con sombra amarilla y guarda de dientes. */
export default function SectionHeading({ children, className = '' }) {
  if (!children) return null
  return (
    <div className={className}>
      <h2 className="rotulo text-[40px] leading-none text-rojo-ink">{children}</h2>
      <span aria-hidden="true" className="mt-3 block w-[96px] overflow-hidden rounded-[3px]">
        <Filete variant="dientes" height={12} className="h-3 w-full" />
      </span>
    </div>
  )
}
