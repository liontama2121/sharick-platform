import { useNavigate } from 'react-router-dom'

import { books, countries } from '../books'
import BookCard from '../components/cards/BookCard'
import Stitches from '../components/decor/Stitches'
import Swirl from '../components/decor/Swirl'
import Textile from '../components/decor/Textile'
import TropicalFlower from '../components/decor/TropicalFlower'
import Button from '../components/ui/Button'
import { usePageAnimation } from '../hooks/usePageAnimation'
import { useSession } from '../hooks/useSession'
import { S } from '../study/strings'

export default function Home() {
  const ref = usePageAnimation('home')
  const navigate = useNavigate()
  const session = useSession()
  const startStudying = () => navigate(session ? '/study/english-a1' : '/study/login')

  return (
    <div ref={ref} className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">
      <section data-anim className="mb-10 text-center">
        <h1 className="text-balance">Libros interactivos de idiomas</h1>
        <div className="mt-2 flex justify-center">
          <Swirl width={128} />
        </div>
        <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
          Elige tu libro y empieza a aprender. Cada lección mezcla lectura, audio,
          juegos y práctica oral, con América Latina como escenario.
        </p>
        <p className="mt-2 font-display text-[0.98rem] italic text-coral-ink">
          por la profesora Sharick Prieto
        </p>
      </section>

      {/* Muestrario: un textil por cada país del libro */}
      {countries.length > 0 && (
        <section data-anim aria-label="Países del libro" className="mb-12">
          <ul className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {countries.map((c) => (
              <li key={c.name}>
                <div className="overflow-hidden rounded-xl shadow-soft ring-1 ring-navy/10">
                  <Textile variant={c.textile} scale={1.5} className="h-20 w-full" />
                </div>
                <h2 className="mt-3 font-display text-[1.15rem] leading-tight text-navy">{c.name}</h2>
                <p className="mt-0.5 text-[0.8rem] leading-snug text-ink-soft">{c.places}</p>
                <p className="mt-1 text-[0.76rem] italic text-sage-ink">{c.craft}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

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
        className="grain relative mt-10 overflow-hidden rounded-2xl bg-navy px-7 pb-10 pt-8 text-white shadow-lift sm:px-10"
      >
        <Textile variant="aguayo" height={12} className="absolute inset-x-0 bottom-0 h-3 w-full" />
        <Stitches tone="light" cell={7} className="absolute left-4 top-5" />
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
        className="grain mt-10 rounded-2xl bg-tip px-6 py-5 text-center"
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
