import { animate } from 'animejs'
import { Check, Gamepad2, Mic, PenLine, Video, Volume2 } from 'lucide-react'

import LessonSpread from './LessonSpread'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const BADGES = {
  audio: { Icon: Volume2, label: 'Audio' },
  game: { Icon: Gamepad2, label: 'Juego' },
  video: { Icon: Video, label: 'Video' },
  written: { Icon: PenLine, label: 'Ejercicio escrito' },
  speaking: { Icon: Mic, label: 'Speaking' },
}

/* Cuadritos pixel que salen del tag hacia arriba-izquierda. */
const TAG_PIXELS = [
  { x: 0, y: 0, s: 14, c: 'var(--color-coral)' },
  { x: 18, y: 6, s: 10, c: 'var(--color-gold)' },
  { x: 32, y: 0, s: 12, c: 'var(--color-coral)' },
  { x: 6, y: 20, s: 10, c: 'var(--color-gold)' },
  { x: 24, y: 22, s: 14, c: 'var(--color-coral)' },
  { x: 44, y: 16, s: 10, c: 'var(--color-gold)' },
]

/** Anillo de progreso de 24px pegado a la esquina del tag; al 100 % es un ✓. */
function ProgressRing({ done, total }) {
  if (!total || !done) return null
  const pct = Math.min(1, done / total)
  const R = 9
  const C = 2 * Math.PI * R
  const full = done >= total

  return (
    <span
      title={full ? 'Lección completada' : `${done} de ${total} pantallas completadas`}
      className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full
        border-2 border-white shadow-soft ${full ? 'bg-sage-ink text-white' : 'bg-white'}`}
    >
      {full ? (
        <Check size={12} strokeWidth={3.2} />
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r={R} fill="none" stroke="var(--color-tip)" strokeWidth="4" />
          <circle
            cx="12"
            cy="12"
            r={R}
            fill="none"
            stroke="var(--color-sage-ink)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${C * pct} ${C}`}
            transform="rotate(-90 12 12)"
          />
        </svg>
      )}
    </span>
  )
}

/**
 * Tarjeta de una LECCIÓN en el Nivel 2 (y en el índice ☰ del lector):
 * spread de dos páginas con tag rojo sobresaliente, cuadritos pixel, anillo
 * de progreso y badges circulares mitad afuera. `compact` la reduce para el
 * índice del lector.
 */
export default function LessonCard({
  item,
  meta,
  content,
  done = 0,
  onOpen,
  compact = false,
  current = false,
  className = '',
}) {
  const { lesson, isCover, thumbScreens, screens, badges, title } = item
  const total = screens.length

  /* Hover: la tarjeta crece y el tag se inclina, como una pegatina. */
  const hover = (e, active) => {
    if (reduced()) return
    const card = e.currentTarget
    animate(card, { scale: active ? 1.05 : 1, duration: 260, ease: 'outQuad' })
    const tag = card.querySelector('[data-tag]')
    if (tag) animate(tag, { rotate: active ? -3 : 0, duration: 260, ease: 'outQuad' })
  }

  const tagSize = compact ? 'h-12 min-w-12 -left-4 -top-4 rounded-[8px] px-1.5' : 'h-16 min-w-16 -left-5 -top-5 rounded-[10px] px-2'
  const badgeSize = compact ? 36 : 48

  return (
    /* div y no button: la miniatura renderiza el libro de verdad, que trae
       sus propios <button> dentro y anidarlos es HTML inválido. */
    <div
      data-card
      data-lesson-id={lesson.id}
      role="button"
      tabIndex={0}
      title={title}
      aria-label={`${isCover ? 'Portada' : `Lección ${lesson.id}`} — ${title}${
        total ? ` · ${done} de ${total} pantallas completadas` : ''
      }`}
      aria-current={current ? 'true' : undefined}
      onClick={(e) => onOpen?.(item, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.(item, e.currentTarget)
        }
      }}
      onMouseEnter={(e) => hover(e, true)}
      onMouseLeave={(e) => hover(e, false)}
      className={`group relative cursor-pointer ${className}`}
    >
      {/* Anillo del pulso dorado al volver del libro */}
      <span
        data-pulse
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[4px] rounded-[12px] opacity-0 ring-[3px] ring-gold"
      />

      <LessonSpread
        screens={thumbScreens}
        meta={meta}
        content={content}
        frameClassName={`rounded-lg border shadow-lift
          ${current ? 'border-coral-ink ring-2 ring-coral-ink/40' : 'border-[#cfc3a9]'}`}
      />

      {/* Cuadritos pixel detrás del tag */}
      {!compact && (
        <svg
          width="56"
          height="38"
          viewBox="0 0 56 38"
          aria-hidden="true"
          className="pointer-events-none absolute -left-7 -top-9"
        >
          {TAG_PIXELS.map((p, i) => (
            <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx="2" fill={p.c} opacity=".9" />
          ))}
        </svg>
      )}

      {/* Tag sobresaliente: número de lección grande (★ en la portada) */}
      <span
        data-tag
        className={`absolute flex flex-col items-center justify-center bg-coral-ink leading-none
          text-white shadow-[0_10px_22px_rgba(27,58,92,.28)] ${tagSize}`}
      >
        <span className={`font-display font-extrabold ${compact ? 'text-[1.1rem]' : 'text-[1.5rem]'}`}>
          {isCover ? '★' : lesson.id}
        </span>
        {!isCover && !compact && (
          <span className="mt-1 font-body text-[0.6rem] font-semibold opacity-90">
            {total} {total === 1 ? 'pantalla' : 'pantallas'}
          </span>
        )}
        {!isCover && <ProgressRing done={done} total={total} />}
      </span>

      {/* Badges circulares mitad afuera, en fila hacia la izquierda (máx. 2) */}
      {badges.slice(0, 2).map((b, i) => {
        const badge = BADGES[b]
        if (!badge) return null
        const { Icon, label } = badge
        return (
          <span
            key={b}
            title={label}
            aria-label={label}
            className="absolute flex items-center justify-center rounded-full border-[3px]
              border-white bg-coral-ink text-white shadow-[0_8px_18px_rgba(27,58,92,.25)]"
            style={{
              width: badgeSize,
              height: badgeSize,
              bottom: -badgeSize / 2,
              right: -badgeSize / 2 + i * (badgeSize + 4),
            }}
          >
            <Icon size={compact ? 16 : 20} strokeWidth={2.4} />
          </span>
        )
      })}
    </div>
  )
}
