import { books } from '../books'
import BookCard from '../components/cards/BookCard'
import Swirl from '../components/decor/Swirl'
import { usePageAnimation } from '../hooks/usePageAnimation'

export default function Home() {
  const ref = usePageAnimation('home')

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
