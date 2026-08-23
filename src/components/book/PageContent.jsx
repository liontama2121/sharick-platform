import { activityId } from '../../books'
import { usePageAnimation } from '../../hooks/usePageAnimation'

import SectionLabel from '../ui/SectionLabel'
import PillButton from '../ui/PillButton'
import SmartImage from '../ui/ImagePlaceholder'
import Swirl from '../decor/Swirl'

import DialogueBlock from '../media/DialogueBlock'
import RoutineBlock from '../media/RoutineBlock'
import VocabularyBox from '../content/VocabularyBox'
import CulturalTip from '../content/CulturalTip'
import Checklist from '../content/Checklist'

import MatchActivity from '../activities/MatchActivity'
import FillBubbles from '../activities/FillBubbles'
import ListeningActivity from '../activities/ListeningActivity'
import SpeakingPrompt from '../activities/SpeakingPrompt'
import DiceGame from '../activities/DiceGame'
import MultipleChoice from '../activities/MultipleChoice'
import FillInSentence from '../activities/FillInSentence'
import RecordPrompt from '../activities/RecordPrompt'
import ExerciseBlock from '../activities/ExerciseBlock'

/* Registro de actividades: agregar un tipo = agregar un componente aquí. */
const ACTIVITIES = {
  match: MatchActivity,
  fillBubbles: FillBubbles,
  listening: ListeningActivity,
  speaking: SpeakingPrompt,
  diceGame: DiceGame,
  fillInSentence: FillInSentence,
  recordPrompt: RecordPrompt,
  multipleChoice: ({ section, completed, score, onComplete }) => (
    <ExerciseBlock
      number={section.number}
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
    </ExerciseBlock>
  ),
}

function Unknown({ section }) {
  return (
    <div className="rounded-xl border border-dashed border-coral-ink/50 p-3">
      <p className="label-caps text-coral-ink">Sección no soportada</p>
      <p className="mt-1 text-[0.85rem] text-ink-soft">
        <code>
          {section.type}
          {section.activity ? ` / ${section.activity}` : ''}
        </code>{' '}
        — registrar el componente en <code>PageContent.jsx</code>.
      </p>
    </div>
  )
}

/** Cabecera editorial de la página: UNIT · título serif · floritura · LESSON. */
function PageHeader({ page, module: mod }) {
  return (
    <header data-anim className="mb-4">
      {page.showUnit !== false && (
        <>
          <SectionLabel tone="coral">
            Unit {mod.moduleId} · {mod.moduleName}
          </SectionLabel>
          {page.unitTitle && <h1 className="mt-1">{page.unitTitle}</h1>}
        </>
      )}

      {page.lessonLabel && (
        <p className="mt-2">
          <SectionLabel tone="coral">{page.lessonLabel}</SectionLabel>
        </p>
      )}

      <h2 className={page.showUnit === false ? 'mt-1' : 'mt-0.5'}>{page.title}</h2>
      <Swirl width={104} className="mt-1.5" />

      {page.intro && <p className="mt-2 text-[0.92rem] leading-relaxed text-ink">{page.intro}</p>}
    </header>
  )
}

/**
 * Renderiza una página del libro a partir del JSON.
 * `progress` viene del hook useProgress del contenedor.
 */
export default function PageContent({ page, module: mod, progress }) {
  const ref = usePageAnimation(page.id)
  const { completeActivity, isCompleted, getScore } = progress

  return (
    <div ref={ref}>
      {page.hideHeader ? null : <PageHeader page={page} module={mod} />}

      <div className="flex flex-col gap-4">
        {(page.sections ?? []).map((section, i) => {
          const key = section.id ?? `${section.type}-${i}`

          if (section.type === 'divider') {
            return <div key={key} data-anim className="divider-dotted my-1" />
          }

          if (section.type === 'illustration') {
            return (
              <figure key={key} data-anim>
                <div className="h-44 w-full overflow-hidden rounded-[20px] sm:h-56">
                  <SmartImage
                    src={section.image}
                    alt={section.alt ?? ''}
                    emoji={section.emoji ?? '🌺'}
                  />
                </div>
                {section.caption && (
                  <figcaption className="mt-1.5 text-center text-[0.78rem] italic text-ink-soft">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            )
          }

          if (section.type === 'actions') {
            return (
              <div key={key} data-anim className="flex flex-wrap gap-2">
                {(section.items ?? []).map((a) => (
                  <PillButton key={a.label} icon={a.icon}>
                    {a.label}
                  </PillButton>
                ))}
              </div>
            )
          }

          if (section.type === 'vocabulary') {
            return (
              <div key={key} data-anim>
                <VocabularyBox section={section} />
              </div>
            )
          }

          if (section.type === 'checklist') {
            return (
              <div key={key} data-anim>
                <Checklist section={section} />
              </div>
            )
          }

          if (section.type === 'culturalTip') {
            return (
              <div key={key} data-anim>
                <CulturalTip section={section} />
              </div>
            )
          }

          if (section.type === 'dialogues') {
            return (
              <div key={key} data-anim className="flex flex-col gap-3">
                {section.label && (
                  <SectionLabel tone="sage" leaf>
                    {section.label}
                  </SectionLabel>
                )}
                {(section.items ?? []).map((d) => (
                  <DialogueBlock key={d.id} dialogue={d} />
                ))}
              </div>
            )
          }

          if (section.type === 'routine') {
            return (
              <div key={key} data-anim>
                <RoutineBlock section={section} />
              </div>
            )
          }

          if (section.type === 'activity') {
            const Component = ACTIVITIES[section.activity]
            if (!Component) {
              return (
                <div key={key} data-anim>
                  <Unknown section={section} />
                </div>
              )
            }
            const aid = activityId(page.id, section)
            return (
              <div key={key} data-anim>
                <Component
                  section={section}
                  activityId={aid}
                  completed={isCompleted(aid)}
                  score={getScore(aid)}
                  onComplete={(s = 100) => completeActivity(aid, s)}
                />
              </div>
            )
          }

          return (
            <div key={key} data-anim>
              <Unknown section={section} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
