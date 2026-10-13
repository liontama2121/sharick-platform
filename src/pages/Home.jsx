import { useNavigate } from 'react-router-dom'
import { BookOpen, Gamepad2, PenLine, Trophy } from 'lucide-react'

import { books, countries, getBookMeta } from '../books'
import BookCard from '../components/cards/BookCard'
import Filete from '../components/decor/Filete'
import HomeHero from '../components/home/HomeHero'
import RouteChiva from '../components/home/RouteChiva'
import Button from '../components/ui/Button'
import { usePageAnimation } from '../hooks/usePageAnimation'
import { useSession } from '../hooks/useSession'
import { S } from '../study/strings'

const FEATURE_ICONS = {
  topics: BookOpen,
  exercises: PenLine,
  quizzes: Trophy,
  arcade: Gamepad2,
}

export default function Home() {
  const ref = usePageAnimation('home')
  const navigate = useNavigate()
  const session = useSession()
  const startStudying = () => navigate(session ? '/study/english-a1' : '/study/login')
  /* La página principal es la portada del libro: English Route. */
  const meta = getBookMeta('english-a1')

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      {/* Portada: el mapa de la ruta, el mismo de la primera página del libro */}
      <div data-anim>
        <HomeHero meta={meta} />
      </div>
      <p data-anim className="mx-auto mt-6 max-w-xl text-center text-[1rem] leading-relaxed text-ink-soft">
        Súbete y aprende. Cada lección mezcla lectura, audio, juegos y práctica
        oral, en un viaje por Colombia, Venezuela, Panamá y Bolivia.
      </p>

      {/* La ruta: una parada por país */}
      {countries.length > 0 && (
        <section data-anim aria-labelledby="ruta" className="mt-12">
          <h2 id="ruta" className="text-center text-[1.6rem]">
            La ruta del libro
          </h2>
          <RouteChiva countries={countries} />
        </section>
      )}

      <section data-anim className="mt-14">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      {/* Study Zone: práctica por temas con progresión bloqueada */}
      <section
        data-anim
        className="grain relative mt-14 overflow-hidden rounded-[24px] border-[6px] border-azul bg-verde-ink
          text-white shadow-lift"
      >
        <Filete variant="ajedrez" colors={['azul', 'amarillo']} height={12} className="h-3 w-full" />

        <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
          <div className="min-w-0">
            <h2 className="rotulo text-[2rem] leading-tight text-white" style={{ '--rotulo-sombra': 'var(--color-azul)' }}>
              {S.homeLabel}
            </h2>
            <p className="mt-2 max-w-md text-[0.98rem] text-white">
              <span className="font-semibold">{S.homeTitle}</span> {S.homeSubtitle}
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.86rem] font-medium sm:justify-start">
              {S.homeFeatures.map((f) => {
                const Icon = FEATURE_ICONS[f.icon] ?? BookOpen
                return (
                  <li key={f.label} className="flex items-center gap-1.5">
                    <Icon size={17} strokeWidth={2.2} className="text-amarillo" aria-hidden="true" />
                    {f.label}
                  </li>
                )
              })}
            </ul>
          </div>
          <Button size="lg" variant="amarillo" onClick={startStudying} className="shrink-0">
            {S.homeCta}
          </Button>
        </div>
      </section>

      <section data-anim className="mt-10 rounded-2xl bg-box px-6 py-5 text-center">
        <p className="font-display text-[1.05rem] text-azul">
          Tu progreso se guarda solo en este dispositivo
        </p>
        <p className="mt-1 text-[0.9rem] text-ink-soft">
          No necesitas cuenta ni internet permanente: puedes seguir donde quedaste.
        </p>
      </section>
    </div>
  )
}
