import { forwardRef } from 'react'
import TropicalFlower from '../decor/TropicalFlower'
import WaterWave from '../decor/WaterWave'
import { numberToWords } from '../../utils/numberWords'

/**
 * Hoja del libro. react-pageflip necesita que cada página acepte una ref DOM.
 * El número va en un círculo de color + escrito en letras, como en la referencia.
 */
const BookPage = forwardRef(function BookPage(
  { pageNumber, children, decor = 'bird', className = '' },
  ref,
) {
  // En libros impresos las páginas pares van a la izquierda.
  const left = pageNumber % 2 === 0

  return (
    <div ref={ref} className={`paper h-full w-full ${className}`} data-density="soft">
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Sombra del lomo */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 w-8 ${left ? 'right-0' : 'left-0'}`}
          style={{
            background: left
              ? 'linear-gradient(to right, rgba(27,58,92,0), rgba(27,58,92,0.10))'
              : 'linear-gradient(to left, rgba(27,58,92,0), rgba(27,58,92,0.10))',
          }}
        />

        {/* Contenido */}
        <div className="scrollbar-slim relative z-10 flex-1 overflow-y-auto px-6 pb-3 pt-6 sm:px-8 sm:pt-7">
          {children}
        </div>

        {/* Decoración inferior */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28">
          <WaterWave className="absolute inset-x-0 bottom-0 h-10 w-full" />
          <TropicalFlower
            variant={decor}
            size={112}
            flip={!left}
            className={`absolute bottom-1 opacity-70 ${left ? 'left-0' : 'right-0'}`}
          />
        </div>

        {/* Pie de página */}
        <footer
          className={`relative z-10 flex items-center gap-2.5 px-6 pb-4 sm:px-8
            ${left ? 'justify-start' : 'justify-end flex-row-reverse'}`}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-ink
              font-display text-[0.9rem] text-white"
          >
            {pageNumber}
          </span>
          <span className="label-caps text-sage-ink">{numberToWords(pageNumber)}</span>
        </footer>
      </div>
    </div>
  )
})

export default BookPage
