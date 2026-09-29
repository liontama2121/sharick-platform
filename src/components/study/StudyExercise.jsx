import { Check } from 'lucide-react'

import MultipleChoice from '../activities/MultipleChoice'
import FillInEx from './exercises/FillInEx'
import MatchEx from './exercises/MatchEx'
import ScrambleEx from './exercises/ScrambleEx'

/* Opción múltiple reutiliza el componente del libro (no trae textos). */
function MultipleChoiceEx({ exercise, onDone, idPrefix }) {
  return (
    <MultipleChoice
      questions={[{ q: exercise.q, options: exercise.options, correct: exercise.correct }]}
      idPrefix={idPrefix}
      onAllAnswered={() => onDone?.()}
    />
  )
}

/**
 * Registro de tipos de ejercicio de la Study Zone. Agregar un tipo =
 * crear el componente en `exercises/` y registrarlo aquí.
 */
export const STUDY_EXERCISES = {
  multipleChoice: MultipleChoiceEx,
  fillIn: FillInEx,
  match: MatchEx,
  scramble: ScrambleEx,
}

const TYPE_LABEL = {
  multipleChoice: 'Choose',
  fillIn: 'Fill in',
  match: 'Match',
  scramble: 'Put in order',
}

/** Una tarjeta numerada con el ejercicio dentro. */
export default function StudyExercise({ exercise, number, done, onDone }) {
  const Component = STUDY_EXERCISES[exercise.type]

  return (
    <li
      className={`rounded-2xl border bg-white p-5 shadow-soft transition-colors
        ${done ? 'border-verde-ink/50' : 'border-azul/10'}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full font-display text-[1rem]
            ${done ? 'bg-verde-ink text-white' : 'bg-rojo-ink text-white'}`}
        >
          {done ? <Check size={16} strokeWidth={3} /> : number}
        </span>
        <span className="label-caps text-verde-ink">{TYPE_LABEL[exercise.type] ?? exercise.type}</span>
      </div>
      {Component ? (
        <Component exercise={exercise} onDone={onDone} idPrefix={`ex-${number}`} />
      ) : (
        <p className="text-rojo-ink">
          Unknown exercise type: <code>{exercise.type}</code>
        </p>
      )}
    </li>
  )
}
