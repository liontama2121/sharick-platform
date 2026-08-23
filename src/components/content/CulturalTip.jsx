import SunBurst from '../decor/SunBurst'
import SectionLabel from '../ui/SectionLabel'

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
      <div className="mb-1.5 flex items-center gap-2">
        <SunBurst size={22} />
        <SectionLabel tone="coral">{section.label ?? 'Cultural Tip'}</SectionLabel>
      </div>
      {section.title && (
        <p className="mb-1 font-display text-[1.05rem] text-navy">{section.title}</p>
      )}
      <p className="text-[0.86rem] leading-relaxed text-ink">
        {section.text}
        <span className="ml-1 text-coral" aria-hidden="true">
          ♥
        </span>
      </p>
    </aside>
  )
}
