import { forwardRef } from 'react'
import TropicalFlower from '../decor/TropicalFlower'
import WaterWave from '../decor/WaterWave'
import { numberToWords } from '../../utils/numberWords'

/** Los clicks del contenido no salen de la página: pasar hoja es solo por las esquinas. */
const stop = (e) => e.stopPropagation()

/**
 * Hoja del libro. react-pageflip necesita que cada página acepte una ref DOM.
 * El número va en un círculo de color + escrito en letras, como en la referencia.
 *
 * Las esquinas de CornerFlip (64px en mobile, 90px en desktop) se dibujan encima:
 * por eso el contenido y el número de página llevan margen en el borde exterior,
 * para que nada interactivo quede debajo del doblez.
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

        {/* Contenido — aislado de la pasada de página */}
        <div
          onClick={stop}
          onMouseDown={stop}
          onTouchStart={stop}
          onPointerDown={stop}
          className={`scrollbar-slim relative z-10 flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pt-7
            ${left ? 'sm:pl-12' : 'sm:pr-12'}`}
        >
          {children}
        </div>

        {/* Decoración inferior */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28">
          <WaterWave className="absolute inset-x-0 bottom-0 h-10 w-full" />
          <TropicalFlower
            variant={decor}
            size={104}
            flip={!left}
            className={`absolute bottom-1 opacity-60 ${left ? 'left-14' : 'right-14'}`}
          />
        </div>

        {/* Pie de página: desplazado hacia adentro para no quedar bajo el doblez */}
        <footer
          className={`relative z-10 flex items-center gap-2.5 px-6 pb-4 sm:px-8
            ${left ? 'justify-start pl-20 sm:pl-24' : 'flex-row-reverse justify-start pr-20 sm:pr-24'}`}
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
