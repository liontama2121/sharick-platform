import { useEffect, useRef, useState } from 'react'
import ExerciseBlock from './ExerciseBlock'
import SmartImage from '../ui/ImagePlaceholder'
import PillButton from '../ui/PillButton'
import FeedbackToast from '../ui/FeedbackToast'
import { celebrate, popIn } from '../../hooks/useFeedback'

export default function SpeakingPrompt({ section, completed, score, onComplete }) {
  const phrases = section.modelPhrases ?? []
  const [checked, setChecked] = useState({})
  const [toast, setToast] = useState(null)
  const [recording, setRecording] = useState(false)
  const [clipUrl, setClipUrl] = useState(null)
  const [recError, setRecError] = useState(null)

  const listRef = useRef(null)
  const nodes = useRef({})
  const recorderRef = useRef(null)
  const chunksRef = useRef([])

  useEffect(() => {
    if (listRef.current) popIn(listRef.current.querySelectorAll('[data-bubble]'), 120)
  }, [section.id])

  useEffect(() => () => clipUrl && URL.revokeObjectURL(clipUrl), [clipUrl])

  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] }
    setChecked(next)
    if (next[i]) celebrate(nodes.current[i])
    if (phrases.every((_, k) => next[k])) {
      setToast({ msg: '¡Practicaste todas las frases!', type: 'success' })
      onComplete?.(100)
    }
  }

  const startRec = async () => {
    setRecError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        setClipUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: rec.mimeType })))
      }
      rec.start()
      recorderRef.current = rec
      setRecording(true)
    } catch {
      setRecError('No pudimos usar el micrófono. Puedes practicar en voz alta sin grabar.')
    }
  }

  const stopRec = () => {
    recorderRef.current?.stop()
    setRecording(false)
  }

  const canRecord =
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  return (
    <>
      <ExerciseBlock
        number={section.number}
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-[0.8rem] italic text-ink-soft">Marca cada frase al decirla en voz alta.</p>
            <ul ref={listRef} className="flex flex-col gap-1.5">
              {phrases.map((p, i) => (
                <li key={i} data-bubble>
                  <button
                    ref={(el) => {
                      nodes.current[i] = el
                    }}
                    onClick={() => toggle(i)}
                    aria-pressed={!!checked[i]}
                    className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2
                      text-left text-[0.92rem] transition-colors
                      ${checked[i]
                        ? 'border-sage-ink/50 bg-tip'
                        : 'border-navy/12 bg-white hover:border-coral-ink/55'}`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                        border text-[0.7rem] font-bold
                        ${checked[i]
                          ? 'border-sage-ink bg-sage-ink text-white'
                          : 'border-navy/25 text-transparent'}`}
                    >
                      ✓
                    </span>
                    <span className="font-semibold text-navy">{p}</span>
                  </button>
                </li>
              ))}
            </ul>

            {canRecord && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <PillButton icon="record" active={recording} onClick={recording ? stopRec : startRec}>
                  {recording ? 'Detener grabación' : 'Grabar mi voz (opcional)'}
                </PillButton>
                {clipUrl && <audio controls src={clipUrl} className="h-8 max-w-[190px]" />}
              </div>
            )}
            {recError && <p className="mt-2 text-[0.82rem] text-coral-ink">{recError}</p>}
          </div>

          {section.backgroundImage && (
            <div className="min-h-[150px] overflow-hidden rounded-[20px]">
              <SmartImage
                src={section.backgroundImage}
                alt={section.imageAlt ?? 'Paisaje colombiano'}
                emoji="🏞️"
              />
            </div>
          )}
        </div>
      </ExerciseBlock>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
