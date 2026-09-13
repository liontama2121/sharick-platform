import { useNavigate } from 'react-router-dom'

import { books } from '../books'
import BookCard from '../components/cards/BookCard'
import Swirl from '../components/decor/Swirl'
import TropicalFlower from '../components/decor/TropicalFlower'
import Button from '../components/ui/Button'
import { usePageAnimation } from '../hooks/usePageAnimation'
import { useSession } from '../hooks/useSession'
import { S } from '../study/strings'

/* Cuadritos pixel del banner de la Study Zone. */
const PIXELS = [
  { x: 0, y: 0, s: 18 },
  { x: 22, y: 6, s: 12 },
  { x: 4, y: 24, s: 12 },
  { x: 24, y: 26, s: 18 },
  { x: 46, y: 14, s: 10 },
  { x: 0, y: 46, s: 10 },
  { x: 18, y: 52, s: 14 },
  { x: 44, y: 44, s: 12 },
]

export default function Home() {
  const ref = usePageAnimation('home')
  const navigate = useNavigate()
  const session = useSession()
  const startStudying = () => navigate(session ? '/study/english-a1' : '/study/login')

  return (
    <div ref={ref} className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <section data-anim className="mb-10 text-center">
        <p className="label-caps text-coral-ink">Profesora Sharick Prieto</p>
        <h1 className="mt-2">Libros interactivos de idiomas</h1>
        <div className="mt-2 flex justify-center">
          <Swirl width={128} />
        </div>
        <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          Elige tu libro y empieza a aprender. Cada lección mezcla lectura, audio,
          juegos y práctica oral con la cultura colombiana como protagonista.
        </p>
      </section>

      <section data-anim>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      {/* Study Zone: práctica por temas con progresión bloqueada */}
      <section
        data-anim
        className="relative mt-10 overflow-hidden rounded-2xl bg-navy px-7 py-8 text-white shadow-lift sm:px-10"
      >
        <svg width="60" height="70" viewBox="0 0 60 70" aria-hidden="true" className="absolute left-3 top-4">
          {PIXELS.map((p, i) => (
            <rect
              key={i}
              x={p.x}
              y={p.y}
              width={p.s}
              height={p.s}
              rx="3"
              fill={i % 3 === 1 ? 'var(--color-gold)' : '#ffffff'}
              opacity={i % 3 === 1 ? 0.85 : 0.16}
            />
          ))}
        </svg>
        <Swirl width={150} className="absolute right-8 top-5 opacity-50" />
        <TropicalFlower variant="leaves" size={150} flip className="absolute -bottom-8 -right-6 opacity-30" />

        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="min-w-0 sm:pl-14">
            <p className="label-caps text-gold">{S.homeLabel}</p>
            <h2 className="mt-1.5 font-display text-[1.9rem] font-extrabold leading-tight text-white">
              {S.homeTitle}
            </h2>
            <p className="mt-2 max-w-md text-[0.92rem] text-white/80">{S.homeSubtitle}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[0.82rem] font-semibold text-white/90 sm:justify-start">
              {S.homeFeatures.map((f) => (
                <li key={f.label}>
                  <span aria-hidden="true" className="mr-1">{f.icon}</span>
                  {f.label}
                </li>
              ))}
            </ul>
          </div>
          <Button size="lg" variant="gold" onClick={startStudying} className="shrink-0">
            {S.homeCta}
          </Button>
        </div>
      </section>

      <section
        data-anim
        className="mt-10 rounded-2xl bg-tip px-6 py-5 text-center"
      >
        <p className="font-display text-[1.05rem] text-navy">
          Tu progreso se guarda solo en este dispositivo
        </p>
        <p className="mt-1 text-[0.88rem] text-ink-soft">
          No necesitas cuenta ni internet permanente: puedes seguir donde quedaste.
        </p>
      </section>
    </div>
  )
}
