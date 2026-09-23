import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Headphones, Pause } from 'lucide-react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Solo suena un botón a la vez: al tocar otro, el anterior se calla. */
let current = null

/**
 * Botón redondo de audífono 🎧 para UNA frase (saludos, expresiones,
 * ítems de listening). Si el mp3 aún no existe queda atenuado con
 * "Audio coming soon" y nunca rompe la página.
 */
export default function AudioButton({ src, label = 'Listen', size = 44, tone = 'coral', className = '' }) {
  const ref = useRef(null)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
    setPlaying(false)
  }, [src])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      if (current === audioRef.current) current = null
    },
    [],
  )

  const play = async (e) => {
    e.stopPropagation()
    if (ref.current && !reduced()) {
      animate(ref.current, { scale: [1, 1.18, 1], duration: 380, ease: 'outQuad' })
    }
    if (failed || !src) return

    if (!audioRef.current) {
      const a = new Audio(src)
      a.onended = () => setPlaying(false)
      a.onpause = () => setPlaying(false)
      a.onerror = () => {
        setFailed(true)
        setPlaying(false)
      }
      audioRef.current = a
    }
    const a = audioRef.current
    if (playing) {
      a.pause()
      return
    }
    if (current && current !== a) current.pause()
    current = a
    try {
      a.currentTime = 0
      await a.play()
      setPlaying(true)
    } catch {
      setFailed(true)
    }
  }

  const tones = {
    coral: 'bg-coral-ink text-white',
    sage: 'bg-sage-ink text-white',
    navy: 'bg-navy text-white',
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={play}
      aria-label={failed ? `${label} (audio coming soon)` : label}
      title={failed ? `Audio coming soon · ${src ?? ''}` : label}
      className={`flex shrink-0 items-center justify-center rounded-full shadow-soft transition-opacity
        ${tones[tone] ?? tones.coral} ${failed ? 'opacity-45' : ''}
        ${playing ? 'ring-4 ring-gold/70' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {playing ? (
        <Pause size={size * 0.45} strokeWidth={2.4} fill="currentColor" />
      ) : (
        <Headphones size={size * 0.48} strokeWidth={2.3} />
      )}
    </button>
  )
}
