/** Hojita verde que acompaña los labels VOCABULARY / EXERCISE. */
export default function Leaf({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M14 2C7.5 2 3 5.2 3 9.6c0 1.6.6 3 1.6 4.1C6 11.4 8.6 9.3 12 8.2 9.2 9.9 6.7 12 5.4 14.2c.9.5 1.9.8 3 .8 4.3 0 5.6-5.6 5.6-13Z"
        fill="var(--color-sage)"
      />
      <path d="M2 15c1.2-2.4 3-4.4 5.2-6" stroke="var(--color-sage-ink)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
