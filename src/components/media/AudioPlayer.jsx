import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Pause, Play, Square } from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function fmt(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function RoundBtn({ onClick, label, tone, disabled, children }) {
  const ref = useRef(null)
  const scaleTo = (v) => {
    if (!ref.current || reduced() || disabled) return
    animate(ref.current, { scale: v, duration: 180, ease: 'outQuad' })
  }
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      onMouseEnter={() => scaleTo(1.1)}
      onMouseLeave={() => scaleTo(1)}
      className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-soft
        disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}
    >
      {children}
    </button>
  )
}

/**
 * Reproductor de la página, estilo casete: barra de progreso arrastrable y
 * botones play / pause / stop. Si el mp3 todavía no existe se queda
 * deshabilitado con el aviso "Audio pendiente", pero nunca rompe la página.
 */
export default function AudioPlayer({ src, label, compact = false, onPlayingChange }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(!src)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    setFailed(!src)
    setReady(false)
    setPlaying(false)
    setTime(0)
    setDuration(0)
  }, [src])

  useEffect(() => {
    onPlayingChange?.(playing)
  }, [playing, onPlayingChange])

  // Barra espaciadora: play/pause si no se está escribiendo en un campo
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || el?.isContentEditable) return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const toggle = async () => {
    const a = audioRef.current
    if (!a || failed) return
    try {
      if (a.paused) {
        await a.play()
        setPlaying(true)
      } else {
        a.pause()
        setPlaying(false)
      }
    } catch {
      setFailed(true)
    }
  }

  const stop = () => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.currentTime = 0
    setTime(0)
    setPlaying(false)
  }

  const seek = (value) => {
    const a = audioRef.current
    if (!a || !duration) return
    a.currentTime = (value / 100) * duration
    setTime(a.currentTime)
  }

  const pct = duration ? (time / duration) * 100 : 0
  const disabled = failed || !ready

  return (
    <div
      className={`inline-flex flex-col gap-3 rounded-[14px] border-2 border-coral-ink/60 bg-box
        shadow-soft ${compact ? 'px-4 py-3' : 'px-5 py-4'}`}
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onError={() => setFailed(true)}
          onCanPlay={() => setReady(true)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            setReady(true)
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={() => {
            setPlaying(false)
            setTime(0)
          }}
        />
      )}

      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={pct}
          disabled={disabled}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={`Avanzar ${label ?? 'audio'}`}
          className="audio-range h-1.5 w-[220px] cursor-pointer appearance-none rounded-full
            disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, var(--color-coral-ink) ${pct}%, #ddd2bd ${pct}%)`,
          }}
        />
        <span className="font-body text-[13px] font-semibold text-ink-soft">
          {fmt(time)} / {fmt(duration)}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <RoundBtn label="Reproducir" tone="bg-coral-ink" disabled={disabled} onClick={toggle}>
          <Play size={20} strokeWidth={2.4} fill="currentColor" />
        </RoundBtn>
        <RoundBtn label="Pausar" tone="bg-navy" disabled={disabled || !playing} onClick={toggle}>
          <Pause size={20} strokeWidth={2.4} fill="currentColor" />
        </RoundBtn>
        <RoundBtn label="Detener" tone="bg-ink-soft" disabled={disabled} onClick={stop}>
          <Square size={17} strokeWidth={2.6} fill="currentColor" />
        </RoundBtn>

        {label && !failed && (
          <span className="ml-1 label-caps text-sage-ink">{label}</span>
        )}
        {failed && (
          <span className="ml-1 font-body text-[12px] italic text-ink-soft" title={src ?? ''}>
            Audio pendiente
          </span>
        )}
      </div>
    </div>
  )
}
