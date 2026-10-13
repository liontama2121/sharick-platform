import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

import { hoverFloat } from '../../hooks/useFeedback'
import Filete from '../decor/Filete'
import Guarda from '../decor/Guarda'
import CartagenaStreet from '../scene/CartagenaStreet'

const SCENES = { cartagena: CartagenaStreet }

/* Mini ruta del libro: paradas sobre línea punteada y pin en la última.
   Repite en pequeño el recorrido de la portada English Route. */
function RouteGlyph({ stops = 4 }) {
  const pts = Array.from({ length: stops }, (_, i) => [10 + i * 30, i % 2 ? 30 : 14])
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join('')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <span className="relative block h-[44px] w-[112px]" aria-hidden="true">
      <svg viewBox="0 0 112 44" className="absolute inset-0 h-full w-full">
        <path d={d} fill="none" stroke="var(--color-azul)" strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" />
        {pts.slice(0, -1).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="var(--color-azul)" stroke="var(--color-paper)" strokeWidth="2" />
        ))}
      </svg>
      <MapPin
        size={30}
        strokeWidth={2.4}
        className="absolute text-rojo-ink"
        fill="var(--color-paper)"
        style={{ left: lx - 15, top: ly - 28 }}
      />
    </span>
  )
}

/** Card de libro en el Home: una ventana de la chiva con el nivel rotulado.
    Si el libro trae `scene` (registry.json), la cabecera es esa escena
    animada: English Route = calle de Cartagena, la misma del Módulo 1. */
export default function BookCard({ book }) {
  const ref = useRef(null)
  const available = !!book.available
  const Scene = available ? SCENES[book.scene] : null

  const level = (
    <span
      className="inline-flex items-center rounded-[12px] border-[3px] border-amarillo bg-rojo-ink px-4 py-1 shadow-lift"
    >
      <span className="rotulo text-[2rem] leading-none text-paper" style={{ '--rotulo-sombra': 'var(--color-azul)' }}>
        {book.level ?? 'A1'}
      </span>
    </span>
  )

  const inner = (
    <div
      ref={ref}
      onMouseEnter={() => available && hoverFloat(ref.current, true)}
      onMouseLeave={() => available && hoverFloat(ref.current, false)}
      className={`group flex h-full flex-col overflow-hidden rounded-[18px] border-[6px] bg-paper shadow-lift
        ${available ? 'cursor-pointer border-madera' : 'cursor-not-allowed border-[#b9c3d0] opacity-70'}`}
    >
      {Scene ? (
        <div className="relative h-36 overflow-hidden">
          <Scene />
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
            {level}
            <span className="rounded-full bg-paper/90 px-1.5 shadow-soft">
              <RouteGlyph />
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`grain relative flex h-36 items-center justify-center
            ${available ? 'bg-azul' : 'bg-ink-soft/50'}`}
        >
          <span
            className="rotulo text-[2.4rem] leading-none text-white"
            style={{ '--rotulo-sombra': available ? 'var(--color-rojo)' : 'rgba(0,0,0,.25)' }}
          >
            {book.level ?? 'A1'}
          </span>
        </div>
      )}
      {available && (
        <Filete variant="vueltiao" height={12} className="h-3 w-full" />
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-[1.35rem]">{book.name}</h3>
        <Guarda width={72} />
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.12em] text-verde-ink">
          {book.language ?? 'Próximamente'}
        </p>
        {book.description && (
          <p className="text-[0.9rem] leading-relaxed text-ink-soft">{book.description}</p>
        )}
        <span
          className={`mt-auto inline-flex w-fit items-center rounded-full px-5 py-2
            text-[0.85rem] font-semibold transition-colors duration-300
            ${
              available
                ? 'border-[3px] border-amarillo bg-rojo-ink text-paper group-hover:bg-azul'
                : 'bg-azul/10 text-ink-soft'
            }`}
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
