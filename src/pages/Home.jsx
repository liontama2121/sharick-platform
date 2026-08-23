import { books } from '../books'
import BookCard from '../components/cards/BookCard'
import { usePageAnimation } from '../hooks/usePageAnimation'

export default function Home() {
  const ref = usePageAnimation('home')

  return (
    <div ref={ref}>
      <section data-anim className="anim-hidden mb-10 text-center">
        <p className="mb-2 font-title text-sm font-semibold uppercase tracking-wider text-col-red">
          Profesora Sharick Prieto
        </p>
        <h1 className="text-tricolor mb-3">Libros interactivos de idiomas</h1>
        <p className="mx-auto max-w-xl text-ink/70">
          Elige tu libro y empieza a aprender. Cada lección mezcla lectura, audio,
          juegos y práctica oral con la cultura colombiana como protagonista.
        </p>
      </section>

      <section data-anim className="anim-hidden">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      <section
        data-anim
        className="anim-hidden mt-10 rounded-2xl bg-gradient-to-r from-[#003DA5]/6 to-[#FFD100]/16 p-6 text-center"
      >
        <p className="font-title font-semibold text-col-blue">
          Tu progreso se guarda solo en este dispositivo
        </p>
        <p className="mt-1 text-sm text-ink/65">
          No necesitas cuenta ni internet permanente: puedes seguir donde quedaste.
        </p>
      </section>
    </div>
  )
}
