import { useState } from 'react'
import Leaf from '../decor/Leaf'

/**
 * Autoevaluación "I can…" al cierre de la lección. No puntúa: es para el estudiante.
 * section: { label, title, items: ["..."] }
 */
export default function Checklist({ section }) {
  const [checked, setChecked] = useState({})
  const items = section.items ?? []

  return (
    <section className="box-beige px-5 py-4">
      <h3 className="mb-2 flex items-center gap-2">
        <Leaf size={18} />
        {section.title ?? section.label ?? 'Can-do check'}
      </h3>

      <ul className="flex flex-col gap-1.5">
        {items.map((it, i) => (
          <li key={i}>
            <button
              onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
              aria-pressed={!!checked[i]}
              className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-1.5
                text-left text-[0.9rem] transition-colors
                ${checked[i]
                  ? 'border-verde-ink/50 bg-tip text-verde-ink'
                  : 'border-azul/12 bg-white text-ink hover:border-verde-ink/50'}`}
            >
              <span className="shrink-0">
                {checked[i] ? <Leaf size={15} /> : <span className="block h-3.5 w-3.5 rounded-sm border border-azul/30" />}
              </span>
              {it}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
