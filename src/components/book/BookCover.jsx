import { forwardRef } from 'react'
import { countries } from '../../books'
import Filete from '../decor/Filete'

/* Placa numerada de cada parada: el amarillo lleva número azul. */
const STOP_INK = { amarillo: 'var(--color-azul)' }

/**
 * Portada del libro: el frente de la chiva. Techo azul con guarda,
 * carrocería roja, rótulo amarillo con el nombre, la ruta por los cuatro
 * países y parachoques azul. Se dibuja siempre en el lienzo de 1600x1000.
 */
const BookCover = forwardRef(function BookCover({ meta }, ref) {
  return (
    <div ref={ref} className="h-full w-full" data-density="hard">
      <div className="grain relative flex h-full flex-col overflow-hidden bg-rojo-ink text-center">
        <div aria-hidden="true" className="h-8 shrink-0 bg-azul" />
        <Filete variant="rombos" height={20} className="h-5 w-full shrink-0" />

        <div className="flex flex-1 flex-col items-center justify-center px-16 pb-24">
          <div className="rounded-[28px] border-[6px] border-azul bg-amarillo px-14 py-8 shadow-lift">
            <h1 className="rotulo text-[104px] leading-none text-azul" style={{ '--rotulo-sombra': '#ffffff' }}>
              {meta?.name ?? 'Libro'}
            </h1>
          </div>

          {countries.length > 0 && (
            <ol className="mt-14 flex items-start gap-3">
              {countries.map((c, i) => (
                <li key={c.name} className="flex items-start gap-3">
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="mt-[23px] h-2.5 w-20 rounded-full bg-azul"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(90deg, var(--color-amarillo) 0 12px, transparent 12px 22px)',
                        backgroundSize: '100% 2px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                  )}
                  <span className="flex flex-col items-center">
                    <span
                      className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white font-display text-[24px] text-white shadow-lift"
                      style={{ background: `var(--color-${c.color})`, color: STOP_INK[c.color] }}
                    >
                      {i + 1}
                    </span>
                    <span className="mt-2 font-display text-[24px] text-white">{c.name}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}

          <p className="mt-12 font-display text-[28px] text-amarillo">Prof. Sharick Prieto</p>
        </div>
      </div>
    </div>
  )
})

export default BookCover
