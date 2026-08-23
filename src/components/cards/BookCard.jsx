import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { hoverFloat } from '../../hooks/useFeedback'
import Swirl from '../decor/Swirl'
import TropicalFlower from '../decor/TropicalFlower'

/** Card de libro en el Home. La portada conserva el tricolor de Colombia. */
export default function BookCard({ book }) {
  const ref = useRef(null)
  const available = !!book.available

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => available && hoverFloat(ref.current, true)}
      onMouseLeave={() => available && hoverFloat(ref.current, false)}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border border-navy/10
        bg-white shadow-soft ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
    >
      <div
        className={`relative flex h-32 items-center justify-center overflow-hidden
          ${available ? 'bg-navy' : 'bg-ink-soft/40'}`}
      >
        {available && (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#003DA5] via-[#FFD100] to-[#CE1126]"
            />
            <TropicalFlower
              variant="heliconia"
              size={96}
              className="absolute -left-2 bottom-0 opacity-45"
            />
          </>
        )}
        <span className="font-display text-2xl text-white">{book.level ?? 'A1'}</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <h3>{book.name}</h3>
        <Swirl width={72} />
        <p className="label-caps text-sage-ink">{book.language ?? 'Próximamente'}</p>
        {book.description && (
          <p className="text-[0.88rem] leading-relaxed text-ink-soft">{book.description}</p>
        )}
        <span
          className={`mt-auto inline-flex w-fit items-center rounded-full px-4 py-1.5
            text-[0.78rem] font-semibold
            ${available ? 'bg-coral-ink text-white' : 'bg-navy/10 text-ink-soft'}`}
        >
          {available ? 'Abrir el libro →' : 'Próximamente'}
        </span>
      </div>
    </div>
  )

  if (!available) return <div aria-disabled="true">{inner}</div>
  return (
    <Link to={`/book/${book.id}`} className="block h-full" aria-label={`Abrir ${book.name}`}>
      {inner}
    </Link>
  )
}
