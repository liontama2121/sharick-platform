import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Headphones, Pause } from 'lucide-react'

import { audioExists, canSpeak, speak, stopSpeaking } from '../../utils/speak'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Solo suena un botón a la vez: al tocar otro, el anterior se calla. */
let current = null

/**
 * Botón redondo de audífono 🎧 para UNA frase (saludos, expresiones,
 * ítems de listening). Si el mp3 aún no existe y hay `text`, lo lee la voz
 * del navegador (utils/speak); sin texto queda atenuado con "Audio coming
 * soon". Nunca rompe la página.
 */
export default function AudioButton({ src, text, label = 'Listen', size = 44, tone = 'rojo', className = '' }) {
  const ref = useRef(null)
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(!src)

  useEffect(() => {
    setFailed(!src)
    setPlaying(false)
    let live = true
    /* Se sabe de antemano si el mp3 existe: así el clic lee en voz alta al
       instante (la voz del navegador exige el gesto del usuario) */
    if (src) audioExists(src).then((ok) => live && !ok && setFailed(true))
    return () => {
      live = false
    }
  }, [src])

  useEffect(
    () => () => {
      audioRef.current?.pause()
      if (current === audioRef.current) current = null
      stopSpeaking()
    },
    [],
  )

  const play = async (e) => {
    e.stopPropagation()
    if (ref.current && !reduced()) {
      animate(ref.current, { scale: [1, 1.18, 1], duration: 380, ease: 'outQuad' })
    }
    /* Sin mp3: lectura en voz alta del texto */
    const readAloud = () => {
      if (!text || !canSpeak()) return false
      if (playing) {
        stopSpeaking()
        setPlaying(false)
        return true
      }
      current?.pause?.()
      setPlaying(true)
      speak(text, { onEnd: () => setPlaying(false) })
      return true
    }
    if (failed || !src) {
      readAloud()
      return
    }

    if (!audioRef.current) {
      const a = new Audio(src)
      a.onended = () => setPlaying(false)
      a.onpause = () => setPlaying(false)
      a.onerror = () => {
        setFailed(true)
        setPlaying(false)
        readAloud()
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
    } catch (err) {
      // Bloqueo de autoplay o pausa a mitad de carga: el archivo sí existe
      if (err?.name !== 'NotAllowedError' && err?.name !== 'AbortError') {
        setFailed(true)
        readAloud()
      }
    }
  }

  const tones = {
    rojo: 'bg-rojo-ink text-white',
    verde: 'bg-verde-ink text-white',
    azul: 'bg-azul text-white',
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={play}
      aria-label={failed && !text ? `${label} (audio coming soon)` : label}
      title={failed ? `Audio coming soon · ${src ?? ''}` : label}
      className={`flex shrink-0 items-center justify-center rounded-full shadow-soft transition-opacity
        ${tones[tone] ?? tones.rojo} ${failed && !(text && canSpeak()) ? 'opacity-45' : ''}
        ${playing ? 'ring-4 ring-amarillo/70' : ''} ${className}`}
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
