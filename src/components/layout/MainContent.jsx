/** Columna de contenido: deja espacio para el sidebar fijo en desktop. */
export default function MainContent({ children }) {
  return (
    <div className="lg:pl-[280px]">
      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {children}
      </main>
    </div>
  )
}
