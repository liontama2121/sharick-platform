import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

const STYLES = {
  success: { bg: 'bg-tip', border: 'border-sage-ink/50', text: 'text-sage-ink', icon: '✓' },
  error: { bg: 'bg-[#fbeae6]', border: 'border-coral-ink/50', text: 'text-coral-ink', icon: '↻' },
  info: { bg: 'bg-box', border: 'border-navy/25', text: 'text-navy', icon: '•' },
}

/** Toast de feedback. Visible mientras `message` no sea nulo. */
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
      className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full
        border px-5 py-2.5 font-body text-sm font-semibold shadow-lift
        ${s.bg} ${s.border} ${s.text}`}
    >
      <span className="mr-2" aria-hidden="true">
        {s.icon}
      </span>
      {message}
    </div>
  )
}
