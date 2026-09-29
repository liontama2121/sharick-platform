import SunBurst from '../decor/SunBurst'
import { Heart } from 'lucide-react'

/**
 * Caja lateral verde salvia suave con dato cultural colombiano.
 * section: { label, title, text, float }
 */
export default function CulturalTip({ section, className = '' }) {
  const floated = section.float !== false

  return (
    <aside
      className={`rounded-xl bg-tip p-4 shadow-soft
        ${floated ? 'sm:float-right sm:ml-4 sm:w-[58%]' : ''} ${className}`}
    >
      <h3 className="mb-1.5 flex items-center gap-2 text-[1.05rem]">
        <SunBurst size={22} />
        <span>
          {section.label ?? 'Cultural tip'}
          {section.title ? `: ${section.title}` : ''}
        </span>
      </h3>
      <p className="text-[0.86rem] leading-relaxed text-ink">
        {section.text}
        <Heart size={14} strokeWidth={0} fill="var(--color-rojo)" className="ml-1 inline -mt-0.5" aria-hidden="true" />
      </p>
    </aside>
  )
}
