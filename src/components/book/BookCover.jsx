import { forwardRef, useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

import { countries } from '../../books'
import Filete from '../decor/Filete'
import RouteMap from '../cover/RouteMap'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Portada "English Route": el mar azul noche y el mapa real de
 * Latinoamérica con todos sus países; una ruta recorre todas las capitales
 * en bucle y los cuatro países del libro llevan letrero. El título vive en
 * el Pacífico, abajo a la izquierda, y entra letra a letra.
 * Se dibuja siempre en el lienzo de 1600x1000. `still` = miniatura quieta;
 * `lite` = card del Home (anima la ruta, sin el detalle fino del mapa).
 */
const BookCover = forwardRef(function BookCover({ meta, still = false, lite = false }, ref) {
  const titleRef = useRef(null)
  const cover = meta?.cover ?? {}
  const title = cover.title ?? meta?.name ?? 'Libro'
  const [first, ...rest] = title.split(' ')
  /* En la card del Home ya hay un h1 en la página (la cabecera) */
  const Heading = lite ? 'p' : 'h1'

  useEffect(() => {
    const el = titleRef.current
    if (!el || still || reduced()) return
    /* Letras del título: caen y rebotan una a una, como rótulos que se
       cuelgan; después entran subtítulo y autora. */
    const chars = el.querySelectorAll('[data-char]')
    const parts = el.querySelectorAll('[data-in]')
    const a1 = animate(chars, {
      opacity: [0, 1],
      translateY: [-70, 0],
      rotate: [-14, 0],
      duration: 900,
      delay: stagger(55, { start: 150 }),
      ease: 'outBack(1.8)',
    })
    const a2 = animate(parts, {
      opacity: [0, 1],
      translateY: [26, 0],
      duration: 760,
      delay: stagger(140, { start: 150 + chars.length * 55 }),
      ease: 'outQuart',
    })
    return () => {
      a1.revert()
      a2.revert()
    }
  }, [still])

  /* Cada letra en su span (inline-block para poder moverla) */
  const letters = (word, key) =>
    [...word].map((ch, k) => (
      <span key={`${key}-${k}`} data-char className="inline-block">
        {ch}
      </span>
    ))

  return (
    <div ref={ref} className="h-full w-full" data-density="hard">
      <div className="grain relative h-full overflow-hidden bg-azul">
        <RouteMap countries={countries} still={still} lite={lite} />

        <Filete variant="rombos" height={20} className="absolute inset-x-0 top-0 h-5 w-full" />

        <div ref={titleRef} className="absolute bottom-[138px] left-[84px] max-w-[760px]">
          <Heading
            aria-label={title}
            className="rotulo text-[148px] leading-[0.92] text-amarillo"
            style={{ '--rotulo-sombra': 'var(--color-rojo-ink)' }}
          >
            <span aria-hidden="true">
              {letters(first, 'a')}
              {rest.length > 0 && (
                <>
                  <br />
                  {letters(rest.join(' '), 'b')}
                </>
              )}
            </span>
          </Heading>

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
