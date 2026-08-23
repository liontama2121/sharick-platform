import { Link, useParams } from 'react-router-dom'
import { getBookMeta, getModules, moduleActivityIds, pageActivityIds } from '../books'
import ModuleCard from '../components/cards/ModuleCard'
import TopicCard from '../components/cards/TopicCard'
import Button from '../components/ui/Button'
import { useProgress } from '../hooks/useProgress'
import { usePageAnimation } from '../hooks/usePageAnimation'

export default function BookHome() {
  const { bookId } = useParams()
  const meta = getBookMeta(bookId)
  const modules = getModules(bookId)
  const { progress } = useProgress(bookId)
  const ref = usePageAnimation(bookId)

  if (!meta || !modules.length) {
    return (
      <div className="text-center">
        <h1 className="mb-3">Libro no disponible</h1>
        <p className="mb-6 text-ink/65">Este libro todavía no tiene contenido publicado.</p>
        <Link to="/"><Button variant="ghost">Volver al inicio</Button></Link>
      </div>
    )
  }

  const resumeId = progress.currentPage

  return (
    <div ref={ref}>
      <section data-anim className="anim-hidden mb-8">
        <p className="mb-1 font-title text-sm font-semibold uppercase tracking-wider text-col-red">
          {meta.language} · Nivel {meta.level}
        </p>
        <h1 className="text-tricolor mb-3">{meta.name}</h1>
        <p className="max-w-2xl text-ink/70">{meta.description}</p>

        {resumeId && (
          <div className="mt-5">
            <Link to={`/book/${bookId}/topic/${resumeId}`}>
              <Button>Continuar donde quedaste &rarr;</Button>
            </Link>
          </div>
        )}
      </section>

      <section data-anim className="anim-hidden mb-10">
        <h2 className="mb-4">Módulos</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {modules.map((mod) => {
            const ids = moduleActivityIds(mod)
            const done = ids.filter((id) => progress.completedActivities.includes(id)).length
            return (
              <ModuleCard
                key={mod.moduleId}
                bookId={bookId}
                module={mod}
                done={done}
                total={ids.length}
                locked={!(mod.pages ?? []).length}
              />
            )
          })}
        </div>
      </section>

      {modules
        .filter((m) => (m.pages ?? []).length)
        .map((mod) => (
          <section data-anim key={mod.moduleId} className="anim-hidden mb-10">
            <h2 className="mb-4">
              <span aria-hidden="true">{mod.icon}</span> {mod.moduleName}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {mod.pages.map((page, i) => {
                const ids = pageActivityIds(page)
                const complete =
                  ids.length > 0 && ids.every((id) => progress.completedActivities.includes(id))
                return (
                  <TopicCard
                    key={page.id}
                    bookId={bookId}
                    page={page}
                    index={i}
                    completed={complete}
                  />
                )
              })}
            </div>
          </section>
        ))}
    </div>
  )
}
