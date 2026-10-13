import { forwardRef, useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

import { countries } from '../../books'
import Filete from '../decor/Filete'
import RouteMap from '../cover/RouteMap'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Portada "English Route": el mar azul noche, el continente pintado de
 * blanco carrocería y la ruta del libro (Colombia → Venezuela → Panamá →
 * Bolivia) que un avión recorre en bucle. El título vive en el Pacífico,
 * abajo a la izquierda, que es el hueco natural del mapa.
 * Se dibuja siempre en el lienzo de 1600x1000. `still` = miniatura quieta.
 */
const BookCover = forwardRef(function BookCover({ meta, still = false }, ref) {
  const titleRef = useRef(null)
  const cover = meta?.cover ?? {}
  const title = cover.title ?? meta?.name ?? 'Libro'
  const [first, ...rest] = title.split(' ')

  useEffect(() => {
    const el = titleRef.current
    if (!el || still || reduced()) return
    const parts = el.querySelectorAll('[data-in]')
    animate(parts, {
      opacity: [0, 1],
      translateY: [26, 0],
      duration: 760,
      delay: stagger(120),
      ease: 'outQuart',
    })
  }, [still])

  return (
    <div ref={ref} className="h-full w-full" data-density="hard">
      <div className="grain relative h-full overflow-hidden bg-azul">
        <RouteMap countries={countries} route={cover.route ?? countries.map((c) => c.name)} still={still} />

        <Filete variant="rombos" height={20} className="absolute inset-x-0 top-0 h-5 w-full" />

        <div ref={titleRef} className="absolute bottom-[138px] left-[84px] max-w-[760px]">
          <h1
            data-in
            className="rotulo text-[148px] leading-[0.92] text-amarillo"
            style={{ '--rotulo-sombra': 'var(--color-rojo-ink)' }}
          >
            {first}
            {rest.length > 0 && (
              <>
                <br />
                {rest.join(' ')}
              </>
            )}
          </h1>

          {cover.subtitle && (
            <p data-in className="mt-9 font-body text-[30px] font-medium leading-snug text-paper">
              {cover.subtitle}
            </p>
          )}
          {cover.author && (
            <p data-in className="mt-3 font-display text-[28px] text-amarillo">
              {cover.author}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

export default BookCover
