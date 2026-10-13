import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import Leaf from '../decor/Leaf'

/**
 * Autoevaluación "I can…" al cierre de la lección. No puntúa: es para el estudiante.
 * section: { label, title, items: ["..."] }
 */
export default function Checklist({ section }) {
  const [checked, setChecked] = useState({})
  const items = section.items ?? []
  const all = items.length > 0 && items.every((_, i) => checked[i])
  const plateRef = useRef(null)

  /* Cierre de la lección: la placa entra con rebote al marcar todo */
  useEffect(() => {
    const el = plateRef.current
    if (!all || !el || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const a = animate(el, { scale: [0.4, 1.08, 1], rotate: [-8, 2, -2], opacity: [0, 1], duration: 700, ease: 'outBack(2)' })
    return () => a.revert()
  }, [all])

  return (
    <section className="rounded-[22px] border-[3px] border-azul/12 bg-box px-7 py-6">
      <h3 className="mb-4 flex items-center gap-2.5 text-[30px]">
        <Leaf size={26} />
        {section.title ?? section.label ?? 'Can-do check'}
      </h3>

      <ul className="flex flex-col gap-3">
        {items.map((it, i) => (
          <li key={i}>
            <button
              onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
              aria-pressed={!!checked[i]}
              className={`flex w-full items-center gap-3.5 rounded-2xl border-2 px-5 py-3.5
                text-left font-body text-[22px] font-medium transition-colors
                ${checked[i]
                  ? 'border-verde-ink/50 bg-tip text-verde-ink'
                  : 'border-azul/12 bg-white text-ink hover:border-verde-ink/50'}`}
            >
              <span className="shrink-0">
                {checked[i] ? <Leaf size={24} /> : <span className="block h-6 w-6 rounded-md border-2 border-azul/30" />}
              </span>
              {it}
            </button>
          </li>
        ))}
      </ul>
      {all && (
        <p
          ref={plateRef}
          className="rotulo mt-5 w-fit rounded-2xl border-4 border-azul bg-amarillo px-6 py-2 text-[34px] leading-none text-azul"
          style={{ '--rotulo-sombra': 'var(--color-paper)' }}
        >
          Well done!
        </p>
      )}
    </section>
  )
}
