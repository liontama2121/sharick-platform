import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { activityId, findPage } from '../books'
import { useProgress } from '../hooks/useProgress'
import { usePageAnimation, usePageSlide } from '../hooks/usePageAnimation'

import DialogueBlock from '../components/media/DialogueBlock'
import RoutineBlock from '../components/media/RoutineBlock'
import SmartImage from '../components/ui/ImagePlaceholder'
import Button from '../components/ui/Button'
import PageNavigation from '../components/layout/PageNavigation'

import MatchActivity from '../components/activities/MatchActivity'
import FillBubbles from '../components/activities/FillBubbles'
import ListeningActivity from '../components/activities/ListeningActivity'
import SpeakingPrompt from '../components/activities/SpeakingPrompt'
import DiceGame from '../components/activities/DiceGame'
import MultipleChoice from '../components/activities/MultipleChoice'
import ActivityShell from '../components/activities/ActivityShell'

/* Registro de actividades: agregar un tipo nuevo = agregar un componente aquí. */
const ACTIVITIES = {
  match: MatchActivity,
  fillBubbles: FillBubbles,
  listening: ListeningActivity,
  speaking: SpeakingPrompt,
  diceGame: DiceGame,
  multipleChoice: ({ section, completed, score, onComplete }) => (
    <ActivityShell
      icon="❓"
      title={section.title}
      instructions={section.instructions}
      completed={completed}
      score={score}
    >
      <MultipleChoice
        questions={section.questions}
        idPrefix={section.id}
        onAllAnswered={onComplete}
      />
    </ActivityShell>
  ),
}

function DialoguesSection({ section }) {
  return (
    <section>
      <div className="mb-4">
        <h2>{section.title}</h2>
        {section.instructions && <p className="mt-1 text-ink/65">{section.instructions}</p>}
      </div>
      <div className="flex flex-col gap-5">
        {(section.items ?? []).map((d) => (
          <DialogueBlock key={d.id} dialogue={d} />
        ))}
      </div>
    </section>
  )
}

function UnknownSection({ section }) {
  return (
    <section className="card-soft border-2 border-dashed border-col-blue/25 p-5">
      <p className="font-title font-semibold text-col-blue">
        Sección aún no soportada: <code>{section.type}{section.activity ? ` / ${section.activity}` : ''}</code>
      </p>
      <p className="mt-1 text-sm text-ink/60">
        Agrega un componente y regístralo en <code>TopicPage.jsx</code>.
      </p>
    </section>
  )
}

export default function TopicPage() {
  const { bookId, pageId } = useParams()
  const found = findPage(bookId, pageId)

  const animRef = usePageAnimation(pageId)
  const slideRef = usePageSlide(pageId)
  const { progress, completeActivity, setCurrentPage, isCompleted, getScore } = useProgress(bookId)

  // Registra la última página visitada (para "Continuar donde quedaste")
  useEffect(() => {
    if (found && progress.currentPage !== pageId) setCurrentPage(pageId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, found])

  if (!found) {
    return (
      <div className="text-center">
        <h1 className="mb-3">Página no encontrada</h1>
        <Link to={`/book/${bookId}`}><Button variant="ghost">Volver al libro</Button></Link>
      </div>
    )
  }

  const { page, module: mod, index, total, prev, next } = found

  return (
    <div ref={slideRef}>
      <div ref={animRef}>
        <header data-anim className="anim-hidden mb-8">
          <p className="mb-1 font-title text-sm font-semibold uppercase tracking-wider text-col-red">
            <span aria-hidden="true">{mod.icon}</span> Módulo {mod.moduleId} · {mod.moduleName}
          </p>
          <h1 className="text-tricolor mb-2">{page.title}</h1>
          {page.subtitle && <p className="text-ink/60">{page.subtitle}</p>}
          {page.intro && <p className="mt-3 max-w-2xl text-ink/75">{page.intro}</p>}

          {page.backgroundImage && (
            <div className="mt-6 h-52 w-full overflow-hidden rounded-2xl sm:h-64">
              <SmartImage src={page.backgroundImage} alt={page.imageAlt ?? page.title} emoji="🏛️" />
            </div>
          )}
        </header>

        <div className="flex flex-col gap-8">
          {(page.sections ?? []).map((section, i) => {
            if (section.type === 'dialogues') {
              return (
                <div data-anim key={i} className="anim-hidden">
                  <DialoguesSection section={section} />
                </div>
              )
            }

            if (section.type === 'routine') {
              return (
                <div data-anim key={i} className="anim-hidden">
                  <RoutineBlock section={section} />
                </div>
              )
            }

            if (section.type === 'activity') {
              const Component = ACTIVITIES[section.activity]
              if (!Component) {
                return (
                  <div data-anim key={i} className="anim-hidden">
                    <UnknownSection section={section} />
                  </div>
                )
              }
              const aid = activityId(page.id, section)
              return (
                <div data-anim key={i} className="anim-hidden">
                  <Component
                    section={section}
                    activityId={aid}
                    completed={isCompleted(aid)}
                    score={getScore(aid)}
                    onComplete={(score = 100) => completeActivity(aid, score)}
                  />
                </div>
              )
            }

            return (
              <div data-anim key={i} className="anim-hidden">
                <UnknownSection section={section} />
              </div>
            )
          })}
        </div>

        <PageNavigation bookId={bookId} prev={prev} next={next} index={index} total={total} />
      </div>
    </div>
  )
}
