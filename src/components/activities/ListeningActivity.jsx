import { useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import AudioPlayer from '../media/AudioPlayer'
import MultipleChoice from './MultipleChoice'
import PillButton from '../ui/PillButton'
import FeedbackToast from '../ui/FeedbackToast'

export default function ListeningActivity({ section, completed, score, onComplete }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [toast, setToast] = useState(null)

  return (
    <>
      <ExerciseBlock
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <AudioPlayer src={section.audio} label={section.audioLabel ?? 'Listen'} />
          {section.transcript && (
            <PillButton icon="none" onClick={() => setShowTranscript((v) => !v)}>
              {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
            </PillButton>
          )}
        </div>

        {showTranscript && section.transcript && (
          <div className="mb-4 box-beige p-3.5">
            {section.transcript.map((line, i) => (
              <p key={i} className="text-[0.88rem] leading-relaxed">
                <span className="font-semibold text-navy">{line.speaker}: </span>
                {line.text}
              </p>
            ))}
          </div>
        )}

        <MultipleChoice
          questions={section.questions}
          idPrefix={section.id ?? 'listening'}
          onAllAnswered={(s) => {
            setToast({ msg: '¡Listening completado!', type: 'success' })
            onComplete?.(s)
          }}
        />
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
