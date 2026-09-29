/**
 * Etiqueta de lección como placa rotulada de la chiva: [1.1] en rojo con
 * sombra amarilla + [título corto] en azul con sombra roja.
 */
export default function LessonTag({ id, title }) {
  return (
    <div className="absolute left-6 top-6 z-20">
      <div className="relative flex items-stretch overflow-hidden rounded-xl border-[3px] border-amarillo shadow-lift">
        <span
          className="rotulo flex items-center bg-rojo-ink px-4 py-2 text-[34px] leading-none text-white"
          style={{ '--rotulo-sombra': 'var(--color-azul)' }}
        >
          {id}
        </span>
        {title && (
          <span
            className="rotulo flex items-center bg-azul px-5 py-2 text-[30px] leading-none text-white"
            style={{ '--rotulo-sombra': 'var(--color-rojo)' }}
          >
            {title}
          </span>
        )}
      </div>
    </div>
  )
}
