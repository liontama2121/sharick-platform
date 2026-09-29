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
import Filete from '../components/decor/Filete'

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
      {/* Frente de la chiva: rótulo del libro sobre la carrocería roja */}
      <header className="grain relative mb-9 overflow-hidden rounded-[24px] border-[6px] border-azul bg-rojo-ink shadow-page">
        <div aria-hidden="true" className="h-3 bg-azul" />
        <Filete variant="rombos" height={12} className="h-3 w-full" />
        <div className="flex items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <div className="min-w-0">
            <div className="w-fit max-w-full rounded-2xl border-4 border-azul bg-amarillo px-5 py-3 shadow-lift">
              <h1
                className="rotulo text-[clamp(1.6rem,6vw,2.6rem)] leading-none text-azul"
                style={{ '--rotulo-sombra': '#ffffff' }}
              >
                {meta.name.replace(/^(\S+) /, '$1 ')}
              </h1>
            </div>
            <p className="mt-4 text-[0.95rem] text-white">
              {meta.language} · Nivel {meta.level} · {doneAll} de {allIds.length} actividades completadas
            </p>
          </div>

          <RoundButton label="Cerrar el libro" onClick={() => navigate('/')} size="lg" className="shrink-0">
            <X size={22} strokeWidth={2.6} />
          </RoundButton>
        </div>
        <Filete variant="dientes" colors={['rojo-ink', 'amarillo', 'azul']} height={12} className="h-3 w-full" />
        <div aria-hidden="true" className="h-4 bg-azul" />
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Columna izquierda — módulos */}
        <section>
          <h2 className="mb-3 text-[1.25rem]">Módulos</h2>
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
                  tone="rojo"
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
                  tone="rojo"
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
          <h2 className="mb-3 text-[1.25rem]">Recursos</h2>
          <div className="flex flex-col gap-3">
            {resources.map((r) => {
              const Icon = RESOURCE_ICONS[r.icon] ?? BookOpen
              return (
                <MenuButton
                  key={r.id}
                  badge={<Icon size={26} strokeWidth={2} />}
                  tone="verde"
                  label={r.label}
                  available={!!r.available}
                  onClick={() =>
                    r.route
                      ? navigate(r.route.startsWith('/') ? r.route : `/book/${bookId}/${r.route}`)
                      : soon(r.label)
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
