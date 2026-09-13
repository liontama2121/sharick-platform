import { useRef, useState } from 'react'
import { S } from '../../../study/strings'
import { celebrate, shake } from '../../../hooks/useFeedback'
import Button from '../../ui/Button'

const normalize = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/[.!?¡¿,]/g, '')
    .replace(/\s+/g, ' ')

/**
 * Una frase con hueco: { sentence: "___ morning", answer, accept?, hint? }.
 * Intentos ilimitados y feedback inmediato.
 */
export default function FillInEx({ exercise, onDone }) {
  const [value, setValue] = useState('')
  const [state, setState] = useState(null) // 'ok' | 'bad'
  const rowRef = useRef(null)
  const [before, after = ''] = exercise.sentence.split('___')

  const check = () => {
    if (state === 'ok') return
    const accepted = [exercise.answer, ...(exercise.accept ?? [])].map(normalize)
    if (accepted.includes(normalize(value))) {
      setState('ok')
      celebrate(rowRef.current)
      onDone?.()
    } else {
      setState('bad')
      shake(rowRef.current)
    }
  }

  return (
    <div>
      <div
        ref={rowRef}
        className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-lg px-1 py-1 text-[1.05rem] text-ink"
      >
        <span>{before}</span>
        {state === 'ok' ? (
          <span className="border-b-2 border-sage-ink px-1.5 font-semibold text-sage-ink">
            {exercise.answer}
          </span>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (state === 'bad') setState(null)
            }}
            onKeyDown={(e) => e.key === 'Enter' && check()}
            placeholder={exercise.hint ?? ''}
            aria-label={S.typeAnswer}
            className={`rule-fill w-36 px-1 text-center font-semibold text-navy
              placeholder:font-normal placeholder:text-ink-soft/60
              ${state === 'bad' ? 'border-coral-ink' : ''}`}
          />
        )}
        <span>{after}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {state !== 'ok' && (
          <Button size="sm" variant="navy" onClick={check} disabled={!value.trim()}>
            {S.check}
          </Button>
        )}
        {state === 'ok' && <span className="text-[0.9rem] font-semibold text-sage-ink">{S.correct}</span>}
        {state === 'bad' && <span className="text-[0.9rem] font-semibold text-coral-ink">{S.tryAgain}</span>}
      </div>
    </div>
  )
}
