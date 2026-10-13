import Filete from './Filete'

/** Guarda corta de rombos pintados, bajo títulos y rótulos. */
export default function Guarda({ width = 96, colors, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`block overflow-hidden rounded-[3px] ${className}`}
      style={{ width, height: 10 }}
    >
      <Filete variant="rombos" colors={colors} height={10} className="h-full w-full" />
    </span>
  )
}
