/**
 * Reloj DIGITAL tipo pantalla LCD (Sharick lo pidió así para la 1.2:
 * ni analógico ni cronómetro). Muestra 12h con am / pm.
 * @param {string} time  "HH:MM" en formato 24h
 */
export default function DigitalClock({ time = '12:00', size = 'md', className = '' }) {
  const [rawH, rawM] = String(time).split(':')
  const h24 = Number(rawH) || 0
  const m = Number(rawM) || 0
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  const suffix = h24 < 12 ? 'am' : 'pm'
  const text = `${h12}:${String(m).padStart(2, '0')}`
  const ghost = text.replace(/\d/g, '8')

  const big = size === 'lg'

  return (
    <div
      role="img"
      aria-label={`Digital clock: ${text} ${suffix}`}
      className={`inline-flex items-end gap-2 rounded-[14px] border-4 border-[#2A4A6E] bg-navy
        shadow-[inset_0_3px_10px_rgba(0,0,0,.45),0_6px_14px_rgba(27,58,92,.25)]
        ${big ? 'px-5 py-2.5' : 'px-4 py-2'} ${className}`}
    >
      <span className="relative font-mono font-bold tabular-nums leading-none tracking-[0.06em]">
        {/* Segmentos apagados de fondo, como en una pantalla LCD real */}
        <span aria-hidden="true" className={`text-[#CFE8C9]/10 ${big ? 'text-[52px]' : 'text-[40px]'}`}>
          {ghost}
        </span>
        <span
          className={`absolute inset-0 text-right text-[#CFE8C9] ${big ? 'text-[52px]' : 'text-[40px]'}`}
          style={{ textShadow: '0 0 10px rgba(207,232,201,.45)' }}
        >
          {text}
        </span>
      </span>
      <span
        className={`mb-0.5 font-mono font-bold uppercase text-gold ${big ? 'text-[20px]' : 'text-[16px]'}`}
      >
        {suffix}
      </span>
    </div>
  )
}
