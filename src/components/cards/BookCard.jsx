import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { hoverFloat } from '../../hooks/useFeedback'
import Filete from '../decor/Filete'
import Guarda from '../decor/Guarda'

/** Card de libro en el Home: una ventana de la chiva con el nivel rotulado. */
export default function BookCard({ book }) {
  const ref = useRef(null)
  const available = !!book.available

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => available && hoverFloat(ref.current, true)}
      onMouseLeave={() => available && hoverFloat(ref.current, false)}
      className={`flex h-full flex-col overflow-hidden rounded-[18px] border-[6px] bg-paper shadow-lift
        ${available ? 'cursor-pointer border-madera' : 'cursor-not-allowed border-[#b9c3d0] opacity-70'}`}
    >
      <div
        className={`grain relative flex h-28 items-center justify-center
          ${available ? 'bg-azul' : 'bg-ink-soft/50'}`}
      >
        <span
          className="rotulo text-[2.4rem] leading-none text-white"
          style={{ '--rotulo-sombra': available ? 'var(--color-rojo)' : 'rgba(0,0,0,.25)' }}
        >
          {book.level ?? 'A1'}
        </span>
      </div>
      {available && <Filete variant="dientes" height={12} className="h-3 w-full" />}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[1.2rem]">{book.name}</h3>
        <Guarda width={72} />
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-verde-ink">
          {book.language ?? 'Próximamente'}
        </p>
        {book.description && (
          <p className="text-[0.9rem] leading-relaxed text-ink-soft">{book.description}</p>
        )}
        <span
          className={`mt-auto inline-flex w-fit items-center rounded-full px-5 py-2
            text-[0.85rem] font-semibold
            ${available ? 'bg-rojo-ink text-white' : 'bg-azul/10 text-ink-soft'}`}
        >
          {available ? 'Subir al libro →' : 'Próximamente'}
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
