/** Onda de acuarela sutil para el borde inferior de la página. */
export default function WaterWave({ className = '', tone = 'sage' }) {
  const color = tone === 'gold' ? 'var(--color-gold)' : 'var(--color-sage)'
  return (
    <svg
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M0 30c34-14 62-14 96 0s62 14 96 0 62-14 96 0 62 14 112 0v16H0V30Z"
        fill={color}
        opacity=".16"
      />
      <path
        d="M0 36c34-12 62-12 96 0s62 12 96 0 62-12 96 0 62 12 112 0v10H0v-10Z"
        fill={color}
        opacity=".26"
      />
    </svg>
  )
}
