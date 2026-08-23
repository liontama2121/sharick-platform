import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

const STYLES = {
  success: { bg: 'bg-[#e8f8ee]', border: 'border-[#2f9e5f]', text: 'text-[#1d6b3f]', icon: '🎉' },
  error: { bg: 'bg-[#fdeaec]', border: 'border-col-red', text: 'text-col-red', icon: '🤔' },
  info: { bg: 'bg-[#eaf1fb]', border: 'border-col-blue', text: 'text-col-blue', icon: '💡' },
}

/**
 * Toast de feedback. Se muestra mientras `message` no sea nulo.
 * El padre decide cuándo limpiarlo (o usa autoHideMs).
 */
export default function FeedbackToast({ message, type = 'info', autoHideMs = 2600, onHide }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!message) return
    const el = ref.current
    if (el) {
      animate(el, {
        opacity: [0, 1],
        translateY: [16, 0],
        scale: [0.94, 1],
        duration: 350,
        ease: 'outBack',
      })
    }
    if (!autoHideMs || !onHide) return
    const t = setTimeout(onHide, autoHideMs)
    return () => clearTimeout(t)
  }, [message, autoHideMs, onHide])

  if (!message) return null
  const s = STYLES[type] ?? STYLES.info

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2
        rounded-full border-2 px-6 py-3 font-title font-semibold shadow-lift
        ${s.bg} ${s.border} ${s.text}`}
    >
      <span className="mr-2" aria-hidden="true">{s.icon}</span>
      {message}
    </div>
  )
}
