import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Globe2,
  HelpCircle,
  ListOrdered,
  NotebookPen,
  Video,
  X,
} from 'lucide-react'

import {
  bookActivityIds,
  getBookMeta,
  getContentLessons,
  getExtraSections,
  getModules,
  getResources,
  moduleActivityIds,
} from '../books'
import { useProgress } from '../hooks/useProgress'
import { useLevelIntro } from '../hooks/useLevelIntro'
import MenuButton from '../components/nav/MenuButton'
import RoundButton from '../components/nav/RoundButton'
import FeedbackToast from '../components/ui/FeedbackToast'
import Swirl from '../components/decor/Swirl'

const RESOURCE_ICONS = {
  notebook: NotebookPen,
  'book-open': BookOpen,
  video: Video,
  gamepad: Gamepad2,
  help: HelpCircle,
  list: ListOrdered,
}

const EXTRA_ICONS = {
  check: CheckCircle2,
  globe: Globe2,
}

/** NIVEL 1 — menú principal del libro: módulos a la izquierda, recursos a la derecha. */
export default function BookMenu() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const ref = useLevelIntro(bookId)

  const meta = getBookMeta(bookId)
  const modules = getModules(bookId)
  const resources = getResources(bookId)
  const extras = getExtraSections(bookId)
  const { progress } = useProgress(bookId)
  const [toast, setToast] = useState(null)

  if (!meta) {
    return (
      <div className="p-10 text-center">
        <h1>Libro no disponible</h1>
      </div>
    )
  }

  const soon = (label) => setToast({ msg: `${label} — próximamente`, type: 'info' })
  const allIds = bookActivityIds(bookId)
  const doneAll = allIds.filter((id) => progress.completedActivities.includes(id)).length

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1080px] px-5 py-7 sm:px-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-sage-ink">
            {meta.language} · Nivel {meta.level}
          </p>
          <h1 className="mt-1 flex items-center gap-3">
            {meta.name}
            <span aria-hidden="true" className="text-2xl">
              {meta.flag}
            </span>
          </h1>
          <Swirl width={116} className="mt-1.5" />
          <p className="mt-2 text-[0.9rem] text-ink-soft">
            {doneAll} de {allIds.length} actividades completadas
          </p>
        </div>

        <RoundButton label="Cerrar el libro" onClick={() => navigate('/')}>
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Columna izquierda — módulos */}
        <section>
          <p className="mb-2.5 label-caps text-sage-ink">Módulos</p>
          <div className="flex flex-col gap-3">
            {modules.map((mod) => {
              const lessons = getContentLessons(bookId, mod.moduleId)
              const available = lessons.length > 0
              const ids = moduleActivityIds(mod)
              const done = ids.filter((id) => progress.completedActivities.includes(id)).length
              return (
                <MenuButton
                  key={mod.moduleId}
                  badge={mod.moduleId}
                  tone="coral"
                  label={mod.moduleName}
                  hint={available ? `${lessons.length} lecciones · ${done}/${ids.length} actividades` : null}
                  available={available}
                  onClick={() =>
                    available
                      ? navigate(`/book/${bookId}/module/${mod.moduleId}`)
                      : soon(`Módulo ${mod.moduleId}`)
                  }
                />
              )
            })}

            {extras.map((x) => {
              const Icon = EXTRA_ICONS[x.badge] ?? CheckCircle2
              return (
                <MenuButton
                  key={x.id}
                  badge={<Icon size={26} strokeWidth={2} />}
                  tone="coral"
                  label={x.label}
                  available={!!x.available}
                  onClick={() => soon(x.label)}
                />
              )
            })}
          </div>
        </section>

        {/* Columna derecha — recursos */}
        <section>
          <p className="mb-2.5 label-caps text-sage-ink">Recursos</p>
          <div className="flex flex-col gap-3">
            {resources.map((r) => {
              const Icon = RESOURCE_ICONS[r.icon] ?? BookOpen
              return (
                <MenuButton
                  key={r.id}
                  badge={<Icon size={26} strokeWidth={2} />}
                  tone="sage"
                  label={r.label}
                  available={!!r.available}
                  onClick={() =>
                    r.route ? navigate(`/book/${bookId}/${r.route}`) : soon(r.label)
                  }
                />
              )
            })}
          </div>
        </section>
      </div>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </div>
  )
}
