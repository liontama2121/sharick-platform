import { useEffect, useRef, useState } from 'react'
import ActivityShell from './ActivityShell'
import SmartImage from '../ui/ImagePlaceholder'
import Button from '../ui/Button'
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

  // libera el objectURL del clip anterior
  useEffect(() => () => { if (clipUrl) URL.revokeObjectURL(clipUrl) }, [clipUrl])

  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] }
    setChecked(next)
    if (next[i]) celebrate(nodes.current[i])
    if (phrases.every((_, k) => next[k])) {
      setToast({ msg: '¡Muy bien! Practicaste todas las frases 🎤', type: 'success' })
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
      setRecError('No pudimos acceder al micrófono. Puedes practicar en voz alta sin grabar.')
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
      <ActivityShell
        icon="🎤"
        title={section.title}
        instructions={section.instructions}
        completed={completed}
        score={score}
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 font-title text-sm font-semibold text-col-blue/70">
              Marca cada frase cuando la digas en voz alta:
            </p>
            <ul ref={listRef} className="flex flex-col gap-2.5">
              {phrases.map((p, i) => (
                <li key={i} data-bubble className="anim-hidden">
                  <button
                    ref={(el) => { nodes.current[i] = el }}
                    onClick={() => toggle(i)}
                    aria-pressed={!!checked[i]}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3
                      text-left shadow-soft transition-colors
                      ${checked[i] ? 'border-[#2f9e5f] bg-[#e8f8ee]' : 'border-col-blue/12 hover:border-col-blue/45'}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                      border-2 font-title text-xs font-bold
                      ${checked[i] ? 'border-[#2f9e5f] bg-[#2f9e5f] text-white' : 'border-col-blue/25 text-transparent'}`}>
                      ✓
                    </span>
                    <span className="font-title font-semibold">{p}</span>
                  </button>
                </li>
              ))}
            </ul>

            {canRecord && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant={recording ? 'blue' : 'ghost'}
                  size="sm"
                  onClick={recording ? stopRec : startRec}
                >
                  {recording ? '⏹ Detener grabación' : '⏺ Grabar mi voz (opcional)'}
                </Button>
                {clipUrl && <audio controls src={clipUrl} className="h-9" />}
              </div>
            )}
            {recError && <p className="mt-2 text-sm text-col-red">{recError}</p>}
          </div>

          <div className="min-h-[220px] overflow-hidden rounded-2xl">
            <SmartImage
              src={section.backgroundImage}
              alt={section.imageAlt ?? 'Paisaje colombiano'}
              emoji="🏞️"
            />
          </div>
        </div>
      </ActivityShell>

      <FeedbackToast message={toast?.msg} type={toast?.type} onHide={() => setToast(null)} />
    </>
  )
}
