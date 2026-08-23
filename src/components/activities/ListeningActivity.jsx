import { useState } from 'react'
import ActivityShell from './ActivityShell'
import AudioPlayer from '../media/AudioPlayer'
import MultipleChoice from './MultipleChoice'
import Button from '../ui/Button'
import FeedbackToast from '../ui/FeedbackToast'

export default function ListeningActivity({ section, completed, score, onComplete }) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [toast, setToast] = useState(null)

  return (
    <>
      <ActivityShell
        icon="🎧"
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
      >
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <AudioPlayer src={section.audio} label={section.audioLabel ?? 'Listening'} />
          {section.transcript && (
            <Button variant="ghost" size="sm" onClick={() => setShowTranscript((v) => !v)}>
              {showTranscript ? 'Ocultar transcripción' : 'Ver transcripción'}
            </Button>
          )}
        </div>

        {showTranscript && section.transcript && (
          <div className="mb-6 rounded-2xl bg-col-blue/4 p-4">
            {section.transcript.map((line, i) => (
              <p key={i} className="text-[0.95rem] leading-relaxed">
                <span className="font-title font-semibold text-col-blue">{line.speaker}: </span>
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
      </ActivityShell>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
