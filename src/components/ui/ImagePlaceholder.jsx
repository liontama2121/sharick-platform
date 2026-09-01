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
  const [loaded, setLoaded] = useState(false)
  const show = src && !failed

  /* La imagen se monta invisible hasta que carga: si el archivo aún no
     existe, el navegador alcanzaba a pintar su icono de imagen rota antes
     de que saltara el placeholder. */
  const picture = show && (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`h-full w-full ${imgClassName} ${rounded} ${className}
        ${loaded ? 'opacity-100' : 'absolute inset-0 opacity-0'}`}
    />
  )

  if (show && loaded) return picture

  return (
    <div
      role="img"
      aria-label={alt || 'Ilustración pendiente de generar'}
      className={`relative flex h-full w-full flex-col items-center justify-center gap-1.5
        overflow-hidden border border-dashed border-sage/60 bg-box text-center
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
      {picture}
    </div>
  )
}
