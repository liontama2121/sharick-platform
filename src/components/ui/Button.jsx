import { useRef } from 'react'
import { animate } from 'animejs'

const VARIANTS = {
  primary: 'bg-coral-ink text-white hover:brightness-110',
  navy: 'bg-navy text-white hover:brightness-115',
  sage: 'bg-sage-ink text-white hover:brightness-110',
  ghost: 'bg-white text-navy border border-navy/15 hover:border-coral-ink/60 hover:text-coral-ink',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const ref = useRef(null)

  const scaleTo = (v) => {
    if (!ref.current || disabled) return
    animate(ref.current, { scale: v, duration: 200, ease: 'outQuad' })
  }

  return (
    <button
      ref={ref}
      disabled={disabled}
      onMouseEnter={() => scaleTo(1.04)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.04)}
      onBlur={() => scaleTo(1)}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold
        shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-45
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
