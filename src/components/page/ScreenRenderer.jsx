import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

import SectionHeading from './SectionHeading'
import ExerciseInstruction from './ExerciseInstruction'
import DialogueBubble from './DialogueBubble'
import IllustrationWithMarkers from './IllustrationWithMarkers'
import AudioPlayer from '../media/AudioPlayer'
import BookCover from '../book/BookCover'

import VocabularyBox from '../content/VocabularyBox'
import CulturalTip from '../content/CulturalTip'
import Checklist from '../content/Checklist'
import RoutineBlock from '../media/RoutineBlock'

import MatchMarkers from '../activities/MatchMarkers'
import MatchActivity from '../activities/MatchActivity'
import FillBubbles from '../activities/FillBubbles'
import FillInSentence from '../activities/FillInSentence'
import ListeningActivity from '../activities/ListeningActivity'
import SpeakingPrompt from '../activities/SpeakingPrompt'
import RecordPrompt from '../activities/RecordPrompt'
import DiceGame from '../activities/DiceGame'
import RouletteWheel from '../activities/RouletteWheel'
import MultipleChoice from '../activities/MultipleChoice'
import ExerciseBlock from '../activities/ExerciseBlock'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Actividades que se renderizan solas (reciben section/onComplete). */
const ACTIVITIES = {
  match: MatchActivity,
  fillBubbles: FillBubbles,
  fillInSentence: FillInSentence,
  listening: ListeningActivity,
  speaking: SpeakingPrompt,
  recordPrompt: RecordPrompt,
  diceGame: DiceGame,
  roulette: RouletteWheel,
  multipleChoice: ({ section, completed, score, onComplete }) => (
    <ExerciseBlock
      number={section.number}
      title={section.title}
      instructions={section.instructions}
      completed={completed}
      score={score}
    >
      <MultipleChoice questions={section.questions} idPrefix={section.id} onAllAnswered={onComplete} />
    </ExerciseBlock>
  ),
}

/* Bloques de contenido reutilizados del formato anterior. */
function Block({ block }) {
  if (block.type === 'vocabulary') return <VocabularyBox section={block} />
  if (block.type === 'culturalTip') return <CulturalTip section={{ ...block, float: false }} />
  if (block.type === 'checklist') return <Checklist section={block} />
  if (block.type === 'routine') return <RoutineBlock section={block} />
  if (block.type === 'text') {
    return <p className="font-body text-[19px] leading-relaxed text-ink">{block.text}</p>
  }
  return null
}

/**
 * Dibuja UNA pantalla completa a partir del JSON.
 * El campo `layout` decide dónde va cada cosa.
 */
export default function ScreenRenderer({
  screen,
  meta,
  content,
  progress,
  activityId,
  resetKey,
  playingLetter,
  onPlayDialogue,
}) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced()) return
    const items = root.querySelectorAll('[data-pop]')
    if (!items.length) return
    items.forEach((el) => {
      el.style.opacity = '0'
    })
    animate(items, {
      opacity: [0, 1],
      scale: [0.92, 1],
      duration: 420,
      ease: 'outQuad',
      delay: stagger(120),
    })
  }, [screen.id])

  const { completeActivity, isCompleted, getScore } = progress
  const activity = screen.activity
  const aid = activity ? activityId(screen.id, activity) : null

  const renderActivity = (className = '') => {
    if (!activity) return null

    if (activity.activity === 'matchMarkers') {
      return (
        <div className={className}>
          <MatchMarkers
            screen={screen}
            activity={activity}
            resetKey={resetKey}
            playingLetter={playingLetter}
            onPlayDialogue={onPlayDialogue}
            onComplete={(s = 100) => completeActivity(aid, s)}
          />
        </div>
      )
    }

    const Component = ACTIVITIES[activity.activity]
    if (!Component) {
      return (
        <p className={`font-body text-[16px] text-coral-ink ${className}`}>
          Actividad no soportada: <code>{activity.activity}</code>
        </p>
      )
    }
    return (
      <div className={className}>
        <Component
          key={resetKey}
          section={activity}
          completed={isCompleted(aid)}
          score={getScore(aid)}
          onComplete={(s = 100) => completeActivity(aid, s)}
        />
      </div>
    )
  }

  if (screen.layout === 'cover') {
    return (
      <div ref={rootRef} className="h-full w-full overflow-hidden rounded-[17px]">
        <BookCover meta={meta} content={content} />
      </div>
    )
  }

  const header = (
    <div className="flex items-start justify-between gap-6">
      <div>
        <SectionHeading>{screen.section}</SectionHeading>
        {screen.exercise && (
          <ExerciseInstruction
            className="mt-4 max-w-[760px]"
            number={screen.exercise.number}
            skill={screen.exercise.skill}
            instruction={screen.exercise.instruction}
          />
        )}
      </div>
      {screen.audio !== undefined && (
        <AudioPlayer src={screen.audio} label={screen.audioLabel ?? 'Audio'} />
      )}
    </div>
  )

  const blocks = screen.blocks ?? []

  return (
    <div ref={rootRef} className="flex h-full flex-col gap-5 px-10 pb-[104px] pt-[104px]">
      {header}

      {screen.layout === 'dialogues-left-image-right' && (
        <div className="min-h-0 flex-1">{renderActivity('h-full')}</div>
      )}

      {screen.layout === 'two-columns' && (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-8">
          <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
            {blocks.map((b, i) => (
              <div key={i} data-pop>
                <Block block={b} />
              </div>
            ))}
          </div>
          <div className="flex min-h-0 flex-col gap-4">
            {screen.illustration && (
              <IllustrationWithMarkers className="min-h-0 flex-1" illustration={screen.illustration} />
            )}
            {renderActivity('')}
          </div>
        </div>
      )}

      {screen.layout === 'image-top-activity-bottom' && (
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          {screen.illustration && (
            <IllustrationWithMarkers className="h-[280px]" illustration={screen.illustration} />
          )}
          <div className="min-h-0 flex-1 overflow-hidden">{renderActivity('')}</div>
        </div>
      )}

      {screen.layout === 'activity-full' && (
        <div className="min-h-0 flex-1 overflow-hidden">
          {blocks.map((b, i) => (
            <div key={i} data-pop className="mb-4">
              <Block block={b} />
            </div>
          ))}
          {renderActivity('')}
        </div>
      )}

      {/* Diálogos sueltos (sin actividad de emparejar) */}
      {screen.layout === 'dialogues-only' && (
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            {(screen.dialogues ?? []).map((d) => (
              <div key={d.letter} data-pop>
                <DialogueBubble
                  dialogue={d}
                  playing={playingLetter === d.letter}
                  onSelect={() => onPlayDialogue?.(d)}
                />
              </div>
            ))}
          </div>
          {screen.illustration && (
            <IllustrationWithMarkers className="min-h-0" illustration={screen.illustration} />
          )}
        </div>
      )}
    </div>
  )
}
