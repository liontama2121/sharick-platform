/**
 * La página es una ventana de la chiva: marco de madera con filete amarillo
 * por dentro e interior blanco. El número va en una placa amarilla.
 */
export default function PageFrame({ pageNumber, children }) {
  return (
    <div className="relative h-full w-full p-3">
      <div className="ventana relative h-full w-full rounded-[22px]">
        {children}

        {pageNumber != null && (
          <span
            className="absolute bottom-[78px] right-3 z-20 flex h-9 w-9 items-center justify-center
              rounded-full bg-amarillo font-display text-[1rem] text-azul shadow-soft"
          >
            {pageNumber}
          </span>
        )}
      </div>
    </div>
  )
}
