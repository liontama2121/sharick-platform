import { useNavigate } from 'react-router-dom'
import { BookOpen, Gamepad2, PenLine, Trophy } from 'lucide-react'

import { books, countries } from '../books'
import BookCard from '../components/cards/BookCard'
import Filete from '../components/decor/Filete'
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

/* Placa numerada de cada parada: el amarillo lleva número azul. */
const STOP_INK = { amarillo: 'var(--color-azul)' }

export default function Home() {
  const ref = usePageAnimation('home')
  const navigate = useNavigate()
  const session = useSession()
  const startStudying = () => navigate(session ? '/study/english-a1' : '/study/login')

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      {/* Frente de la chiva: techo azul, carrocería roja, rótulo amarillo, parachoques */}
      <header
        data-anim
        className="grain relative overflow-hidden rounded-[28px] border-[6px] border-azul bg-rojo-ink
          text-center shadow-page"
      >
        <div aria-hidden="true" className="h-4 bg-azul" />
        <Filete variant="rombos" height={12} className="h-3 w-full" />

        <div className="px-5 pb-9 pt-8 sm:px-10">
          <div className="mx-auto w-fit max-w-full rounded-2xl border-4 border-azul bg-amarillo px-6 py-4 shadow-lift sm:px-9">
            <h1
              className="rotulo text-balance text-[clamp(1.7rem,4.6vw,3rem)] leading-[1.05] text-azul"
              style={{ '--rotulo-sombra': '#ffffff' }}
            >
              Libros interactivos de idiomas
            </h1>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-white">
            Súbete y aprende. Cada lección mezcla lectura, audio, juegos y práctica
            oral, en un viaje por Colombia, Venezuela, Bolivia y Panamá.
          </p>
          <p className="mt-3 font-display text-[1.05rem] text-amarillo">
            con la profesora Sharick Prieto
          </p>
        </div>

        <Filete variant="dientes" colors={['rojo-ink', 'amarillo', 'azul']} height={14} className="h-3.5 w-full" />
        <div aria-hidden="true" className="h-5 bg-azul" />
      </header>

      {/* La ruta: una parada por país */}
      {countries.length > 0 && (
        <section data-anim aria-labelledby="ruta" className="mt-12">
          <h2 id="ruta" className="text-center text-[1.6rem]">
            La ruta del libro
          </h2>
          <ol className="relative mt-7 grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {/* Carretera con línea central amarilla */}
            <span
              aria-hidden="true"
              className="absolute left-[12.5%] right-[12.5%] top-[19px] hidden h-2.5 rounded-full bg-azul sm:block"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, var(--color-amarillo) 0 16px, transparent 16px 30px)',
                backgroundSize: '100% 2px',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {countries.map((c, i) => (
              <li key={c.name} className="relative flex flex-col items-center px-2 text-center">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white
                    font-display text-[1.2rem] text-white shadow-lift"
                  style={{ background: `var(--color-${c.color})`, color: STOP_INK[c.color] }}
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[1.15rem]">{c.name}</h3>
                <p className="mt-1 text-[0.82rem] leading-snug text-ink-soft">{c.places}</p>
              </li>
            ))}
          </ol>
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
