import { useState } from 'react'

const GRADIENTS = [
  'from-[#FFD100] to-[#CE1126]',
  'from-[#003DA5] to-[#FFD100]',
  'from-[#CE1126] to-[#003DA5]',
  'from-[#FFD100] to-[#003DA5]',
]

function pickGradient(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return GRADIENTS[h % GRADIENTS.length]
}

/**
 * Muestra la imagen si existe. Si no, un placeholder con gradiente + emoji +
 * la ruta exacta del archivo que hay que generar con Gemini y dónde ponerlo.
 */
export default function SmartImage({
  src,
  alt = '',
  emoji = '🇨🇴',
  className = '',
  imgClassName = 'object-cover',
  rounded = 'rounded-2xl',
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
      aria-label={alt || 'Imagen pendiente de generar'}
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br
        p-4 text-center ${pickGradient(src || alt)} ${rounded} ${className}`}
    >
      <span className="text-4xl drop-shadow-sm" aria-hidden="true">{emoji}</span>
      {alt && <span className="font-title text-sm font-semibold text-white drop-shadow">{alt}</span>}
      {src && (
        <code className="max-w-full break-all rounded-full bg-black/25 px-3 py-1 text-[11px] font-medium text-white">
          {src}
        </code>
      )}
    </div>
  )
}
