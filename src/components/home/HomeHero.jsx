import LiveCover from '../book/LiveCover'

/**
 * Portada de la página principal: la misma portada "English Route" del
 * libro (mapa + ruta animada) dentro de una ventana de la chiva.
 */
export default function HomeHero({ meta }) {
  return (
    <header className="ventana overflow-hidden rounded-[28px] shadow-page">
      <LiveCover meta={meta} />
    </header>
  )
}
