import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

/**
 * Reproductor en pill blanco. Si el mp3 aún no existe muestra
 * "Audio próximamente" sin romper la página.
 */
export default function AudioPlayer({ src, label = 'Listen', compact = false }) {
  const audioRef = useRef(null)
  const btnRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [unavailable, setUnavailable] = useState(!src)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    setUnavailable(!src)
    setPlaying(false)
    setTime(0)
    setDuration(0)
  }, [src])

  const toggle = async () => {
    const a = audioRef.current
    if (!a || unavailable) return
    try {
      if (a.paused) {
        await a.play()
        setPlaying(true)
        if (btnRef.current) {
          animate(btnRef.current, { scale: [1, 1.12, 1], duration: 380, ease: 'outQuad' })
        }
      } else {
        a.pause()
        setPlaying(false)
      }
    } catch {
      setUnavailable(true)
    }
  }

  if (unavailable) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-dashed
          border-navy/25 bg-white/60 px-3.5 py-1.5 text-[0.78rem] font-semibold text-ink-soft"
        title={src ? `Falta el archivo: ${src}` : 'Sin audio asignado'}
      >
        <span aria-hidden="true">🔊</span>
        Audio próximamente
      </span>
    )
  }

  const pct = duration ? (time / duration) * 100 : 0

  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-navy/12 bg-white px-2.5 py-1.5 shadow-soft">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onError={() => setUnavailable(true)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(false)
          setTime(0)
        }}
      />
      <button
        ref={btnRef}
        onClick={toggle}
        aria-label={playing ? `Pausar ${label}` : `Reproducir ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-ink text-white"
      >
        {playing ? (
          <svg width="12" height="13" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
            <rect x="0" y="0" width="4.5" height="16" rx="1.5" />
            <rect x="9.5" y="0" width="4.5" height="16" rx="1.5" />
          </svg>
        ) : (
          <svg width="12" height="13" viewBox="0 0 14 16" fill="currentColor" aria-hidden="true">
            <path d="M1 1.6c0-1.2 1.3-2 2.4-1.4l9 6.4c1 .7 1 2.1 0 2.8l-9 6.4C2.3 16.4 1 15.6 1 14.4V1.6Z" />
          </svg>
        )}
      </button>

      {!compact && (
        <span className="flex min-w-[110px] flex-col gap-1">
          <span className="label-caps text-sage-ink">{label}</span>
          <span className="block h-1 w-full overflow-hidden rounded-full bg-navy/10">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
          </span>
        </span>
      )}
      <span className="text-[0.72rem] text-ink-soft">
        {fmt(time)} / {fmt(duration)}
      </span>
    </span>
  )
}
