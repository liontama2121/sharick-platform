import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { hoverFloat } from '../../hooks/useFeedback'
import ProgressBar from '../ui/ProgressBar'

export default function ModuleCard({ bookId, module: mod, done = 0, total = 0, locked = false }) {
  const ref = useRef(null)
  const firstPage = mod.pages?.[0]?.id
  const pct = total ? Math.round((done / total) * 100) : 0

  const body = (
    <div
      ref={ref}
      onMouseEnter={() => !locked && hoverFloat(ref.current, true)}
      onMouseLeave={() => !locked && hoverFloat(ref.current, false)}
      className={`card-soft flex h-full flex-col overflow-hidden ${locked ? 'opacity-60' : ''}`}
    >
      <div className={`flex items-center gap-3 bg-gradient-to-r px-5 py-4 ${mod.gradient}`}>
        <span className="text-3xl" aria-hidden="true">{mod.icon}</span>
        <div>
          <p className="font-title text-xs font-semibold uppercase tracking-wide text-ink/70">
            Módulo {mod.moduleId}
          </p>
          <h3 className="text-ink">{mod.moduleName}</h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {mod.description && <p className="text-sm text-ink/70">{mod.description}</p>}
        <p className="text-sm text-ink/55">
          {mod.pages?.length ?? 0} páginas · {total} actividades
        </p>
        <div className="mt-auto pt-2">
          <ProgressBar value={pct} label="Avance del módulo" />
        </div>
      </div>
    </div>
  )

  if (locked || !firstPage) return <div aria-disabled="true">{body}</div>
  return (
    <Link to={`/book/${bookId}/topic/${firstPage}`} className="block h-full">
      {body}
    </Link>
  )
}
