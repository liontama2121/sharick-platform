import { forwardRef, useState } from 'react'
import SmartImage from '../ui/ImagePlaceholder'

/**
 * Ilustración grande con marcadores numerados encima.
 * Las posiciones vienen en % del JSON, así que los marcadores se dibujan
 * igual aunque la imagen todavía no exista.
 */
const IllustrationWithMarkers = forwardRef(function IllustrationWithMarkers(
  { illustration, markerRefs, filled = {}, selectedMarker = null, onMarkerClick, className = '' },
  ref,
) {
  const [hover, setHover] = useState(null)
  const markers = illustration?.markers ?? []

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="h-full w-full overflow-hidden rounded-[16px] shadow-soft">
        <SmartImage
          src={illustration?.src}
          alt={illustration?.alt ?? ''}
          emoji={illustration?.emoji ?? '🏙️'}
          rounded="rounded-[16px]"
        />
      </div>

      {markers.map((m) => {
        const letter = filled[m.n]
        const isSelected = selectedMarker === m.n
        return (
          <button
            key={m.n}
            ref={(el) => {
              if (markerRefs) markerRefs.current[m.n] = el
            }}
            type="button"
            onClick={() => onMarkerClick?.(m)}
            onMouseEnter={() => setHover(m.n)}
            onMouseLeave={() => setHover(null)}
            aria-label={m.label ? `Persona ${m.n}: ${m.label}` : `Persona ${m.n}`}
            className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center
              justify-center rounded-full border shadow-lift transition-transform
              ${letter
                ? 'border-sage-ink bg-sage-ink text-white'
                : 'border-navy/20 bg-white text-ink'}
              ${isSelected ? 'ring-4 ring-gold' : ''}
              ${hover === m.n ? 'scale-[1.2]' : ''}`}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <span className="font-body text-[18px] font-bold">{letter ?? m.n}</span>

            {hover === m.n && m.label && (
              <span
                className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap
                  rounded-full bg-navy px-3 py-1 text-[13px] font-semibold text-white shadow-lift"
              >
                {m.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})

export default IllustrationWithMarkers
