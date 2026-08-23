import { useState } from 'react'

/**
 * Muestra la imagen si existe. Si no, un marco editorial suave con emoji +
 * la ruta exacta del archivo que hay que generar y dónde ponerlo.
 */
export default function SmartImage({
  src,
  alt = '',
  emoji = '🌿',
  className = '',
  imgClassName = 'object-cover',
  rounded = 'rounded-[20px]',
  showPath = true,
  compact = false,
}) {
  const [failed, setFailed] = useState(false)
  const show = src && !failed

  if (show) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`h-full w-full ${imgClassName} ${rounded} ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt || 'Ilustración pendiente de generar'}
      className={`flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden
        border border-dashed border-sage/60 bg-box text-center
        ${compact ? 'p-1' : 'p-4'} ${rounded} ${className}`}
    >
      <span className={`opacity-80 ${compact ? 'text-xl' : 'text-3xl'}`} aria-hidden="true">
        {emoji}
      </span>
      {alt && !compact && <span className="font-display text-[0.9rem] text-navy">{alt}</span>}
      {showPath && !compact && src && (
        <code className="max-w-full break-all rounded-full bg-navy/8 px-2.5 py-0.5 text-[10px] text-ink-soft">
          {src}
        </code>
      )}
    </div>
  )
}
