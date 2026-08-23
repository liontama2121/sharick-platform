import { useEffect, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import PillButton from '../ui/PillButton'
import FeedbackToast from '../ui/FeedbackToast'
import { celebrate } from '../../hooks/useFeedback'

function MicIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="6" y="1.5" width="6" height="9" rx="3" fill="var(--color-coral-ink)" />
      <path
        d="M3.5 8.5a5.5 5.5 0 0 0 11 0M9 14v2.5"
        stroke="var(--color-coral-ink)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Preguntas para responder en voz alta, numeradas y con icono de micrófono.
 * Grabación opcional con MediaRecorder; si no hay permiso, sigue siendo utilizable.
 * section.items: [{ question, hint }]
 */
export default function RecordPrompt({ section, completed, score, onComplete }) {
  const items = section.items ?? []
  const [answered, setAnswered] = useState({})
  const [recordingIdx, setRecordingIdx] = useState(null)
  const [clips, setClips] = useState({})
  const [recError, setRecError] = useState(null)
  const [toast, setToast] = useState(null)

  const rows = useRef({})
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(
    () => () => Object.values(clips).forEach((url) => URL.revokeObjectURL(url)),
    // limpieza al desmontar
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const canRecord =
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  const markDone = (i) => {
    if (answered[i]) return
    const next = { ...answered, [i]: true }
    setAnswered(next)
    celebrate(rows.current[i])
    if (Object.keys(next).length === items.length) {
      setToast({ msg: '¡Respondiste todas en voz alta! 🎤', type: 'success' })
      onComplete?.(100)
    }
  }

  const startRec = async (i) => {
    setRecError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const url = URL.createObjectURL(new Blob(chunksRef.current, { type: rec.mimeType }))
        setClips((c) => ({ ...c, [i]: url }))
        markDone(i)
      }
      rec.start()
      recorderRef.current = rec
      setRecordingIdx(i)
    } catch {
      setRecError('No pudimos usar el micrófono. Responde en voz alta y marca la pregunta.')
    }
  }

  const stopRec = () => {
    recorderRef.current?.stop()
    setRecordingIdx(null)
  }

  return (
    <>
      <ExerciseBlock
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed || Object.keys(answered).length === items.length}
        score={score}
        footer={`${Object.keys(answered).length} de ${items.length} respondidas`}
      >
        <ol className="flex flex-col gap-3">
          {items.map((item, i) => {
            const done = answered[i]
            return (
              <li
                key={i}
                ref={(el) => {
                  rows.current[i] = el
                }}
                className={`rounded-xl border px-3.5 py-3 transition-colors
                  ${done ? 'border-sage-ink/45 bg-tip' : 'border-navy/12 bg-white'}`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="font-display text-[1.05rem] leading-6 text-coral-ink">
                    {i + 1}.
                  </span>
                  <span className="mt-1 shrink-0">
                    <MicIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.95rem] text-ink">{item.question}</p>
                    {item.hint && (
                      <p className="mt-0.5 text-[0.78rem] italic text-ink-soft">{item.hint}</p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {canRecord && (
                        <PillButton
                          icon="record"
                          active={recordingIdx === i}
                          disabled={recordingIdx != null && recordingIdx !== i}
                          onClick={() => (recordingIdx === i ? stopRec() : startRec(i))}
                        >
                          {recordingIdx === i ? 'Detener' : 'Grabar'}
                        </PillButton>
                      )}
                      <PillButton icon="none" onClick={() => markDone(i)} disabled={done}>
                        {done ? '✓ Respondida' : 'Ya la dije'}
                      </PillButton>
                      {clips[i] && <audio controls src={clips[i]} className="h-8 max-w-[190px]" />}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        {recError && <p className="mt-2 text-[0.82rem] text-coral-ink">{recError}</p>}
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
