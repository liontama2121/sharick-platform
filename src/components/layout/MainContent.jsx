/** Columna de contenido: deja espacio para el sidebar fijo en pantallas anchas. */
export default function MainContent({ children, wide = false }) {
  return (
    <div className="xl:pl-[260px]">
      <main
        className={`mx-auto w-full px-4 py-6 sm:px-7 sm:py-8 ${wide ? 'max-w-[1180px]' : 'max-w-4xl'}`}
      >
        {children}
      </main>
    </div>
  )
}
