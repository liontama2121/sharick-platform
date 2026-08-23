import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { hoverFloat } from '../../hooks/useFeedback'

export default function BookCard({ book }) {
  const ref = useRef(null)
  const available = !!book.available

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => available && hoverFloat(ref.current, true)}
      onMouseLeave={() => available && hoverFloat(ref.current, false)}
      className={`card-soft flex h-full flex-col overflow-hidden
        ${available ? 'cursor-pointer' : 'cursor-not-allowed opacity-60 grayscale'}`}
    >
      <div
        className={`flex h-36 items-center justify-center bg-gradient-to-br text-5xl
          ${available ? book.gradient : 'from-gray-300 to-gray-400'}`}
      >
        <span aria-hidden="true">{book.flag ?? '📘'}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3>{book.name}</h3>
        <p className="text-sm text-ink/60">
          {book.language ?? 'Próximamente'}
          {book.level ? ` · Nivel ${book.level}` : ''}
        </p>
        {book.description && <p className="text-sm text-ink/70">{book.description}</p>}
        <span
          className={`mt-auto inline-flex w-fit items-center rounded-full px-3.5 py-1.5
            font-title text-xs font-semibold
            ${available ? 'bg-col-red text-white' : 'bg-gray-200 text-gray-600'}`}
        >
          {available ? 'Empezar →' : 'Próximamente'}
        </span>
      </div>
    </div>
  )

  if (!available) {
    return <div aria-disabled="true">{inner}</div>
  }
  return (
    <Link to={`/book/${book.id}`} className="block h-full" aria-label={`Abrir ${book.name}`}>
      {inner}
    </Link>
  )
}
