import { useRef } from 'react'
import { animate } from 'animejs'

const VARIANTS = {
  primary: 'bg-col-red text-white hover:brightness-110',
  blue: 'bg-col-blue text-white hover:brightness-110',
  yellow: 'bg-col-yellow text-ink hover:brightness-105',
  ghost: 'bg-white text-col-blue border-2 border-col-blue/15 hover:border-col-blue/40',
}

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
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
      onMouseEnter={() => scaleTo(1.05)}
      onMouseLeave={() => scaleTo(1)}
      onFocus={() => scaleTo(1.05)}
      onBlur={() => scaleTo(1)}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-title font-semibold
        shadow-soft transition-colors disabled:cursor-not-allowed disabled:opacity-45
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
