import { BookOpen, Headphones, MessageCircle, Mic, Pencil } from 'lucide-react'

const SKILLS = {
  listen: Headphones,
  speak: Mic,
  write: Pencil,
  read: BookOpen,
  dialogue: MessageCircle,
}

/** Número grande del ejercicio + icono de habilidad + instrucción. */
export default function ExerciseInstruction({ number, skill = 'read', instruction, className = '' }) {
  const Icon = SKILLS[skill] ?? BookOpen

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {number != null && (
        <span className="font-display text-[44px] leading-[0.9] text-coral-ink">{number}</span>
      )}
      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tip text-sage-ink">
        <Icon size={20} strokeWidth={2.2} />
      </span>
      <p className="mt-1 flex-1 font-body text-[22px] font-bold leading-snug text-navy">
        {instruction}
      </p>
    </div>
  )
}
