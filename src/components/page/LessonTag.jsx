import Stitches from '../decor/Stitches'

/**
 * Etiqueta de lección: [1.1] coral + [título corto] navy, con decoración
 * de puntadas de tejido (rombo kanaa) a su derecha.
 */
export default function LessonTag({ id, title }) {
  return (
    <div className="absolute left-6 top-6 z-20">
      <Stitches cell={5} className="absolute left-full top-1/2 ml-3 -translate-y-1/2" />

      <div className="relative flex items-stretch overflow-hidden rounded-lg shadow-soft">
        <span className="flex items-center bg-coral-ink px-4 py-2 font-display text-[34px] leading-none text-white">
          {id}
        </span>
        {title && (
          <span className="flex items-center bg-navy px-5 py-2 font-display text-[30px] leading-none text-white">
            {title}
          </span>
        )}
      </div>
    </div>
  )
}
