import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Gamepad2, Home, Video, Volume2, X } from 'lucide-react'

import { getBookContent, getBookMeta, getGames, getLessons, getModule } from '../books'
import { useLevelIntro } from '../hooks/useLevelIntro'
import SpreadThumb from '../components/book/SpreadThumb'
import RoundButton from '../components/nav/RoundButton'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const RESOURCE_BADGES = {
  video: { Icon: Video, label: 'Video' },
  game: { Icon: Gamepad2, label: 'Juego' },
  audio: { Icon: Volume2, label: 'Audio' },
}

/** NIVEL 2 — rejilla de lecciones del módulo, una tarjeta por doble página. */
export default function ModuleGrid() {
  const { bookId, moduleId } = useParams()
  const navigate = useNavigate()
  const ref = useLevelIntro(`${bookId}-${moduleId}`)
  const gridRef = useRef(null)

  const meta = getBookMeta(bookId)
  const content = getBookContent(bookId)
  const mod = getModule(bookId, moduleId)
  const lessons = getLessons(bookId, moduleId)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll('[data-card]')
    if (!cards.length) return

    if (reduced()) {
      cards.forEach((c) => {
        c.style.opacity = '1'
      })
      return
    }

    cards.forEach((c) => {
      c.style.opacity = '0'
    })
    animate(cards, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 420,
      ease: 'outQuad',
      delay: stagger(60),
    })
  }, [moduleId])

  if (!mod) {
    return (
      <div className="p-10 text-center">
        <h1>Módulo no encontrado</h1>
      </div>
    )
  }

  /** La tarjeta hace zoom hacia el libro antes de abrirlo. */
  const openLesson = (lesson, cardEl) => {
    const go = () => navigate(`/book/${bookId}/module/${moduleId}/lesson/${lesson.id}`)
    if (!cardEl || reduced()) return go()
    animate(cardEl, {
      scale: [1, 1.14],
      opacity: [1, 0.35],
      duration: 260,
      ease: 'outQuad',
    })
    setTimeout(go, 230)
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1140px] px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-coral-ink">Module {mod.moduleId}</p>
          <h1 className="mt-1">{mod.moduleName}</h1>
          {mod.description && (
            <p className="mt-1.5 max-w-2xl text-[0.9rem] text-ink-soft">{mod.description}</p>
          )}
        </div>

        <RoundButton
          label="Volver al menú del libro"
          onClick={() => navigate(`/book/${bookId}`)}
        >
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </header>

      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {lessons.map((lesson) => {
          const isCover = lesson.type === 'cover'
          const cardRef = { current: null }
          return (
            /* div y no button: la miniatura renderiza el libro de verdad, que
               trae sus propios <button> dentro y anidarlos es HTML inválido. */
            <div
              key={lesson.id}
              data-card
              role="button"
              tabIndex={0}
              ref={(el) => {
                cardRef.current = el
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openLesson(lesson, e.currentTarget)
                }
              }}
              onClick={(e) => openLesson(lesson, e.currentTarget)}
              onMouseEnter={(e) =>
                !reduced() &&
                animate(e.currentTarget, { scale: 1.04, duration: 260, ease: 'outQuad' })
              }
              onMouseLeave={(e) =>
                !reduced() &&
                animate(e.currentTarget, { scale: 1, duration: 260, ease: 'outQuad' })
              }
              className="group relative flex cursor-pointer flex-col items-center gap-2 rounded-2xl
                border border-navy/10 bg-white p-3 text-left shadow-soft transition-shadow
                hover:shadow-lift"
            >
              <span className="relative block">
                <SpreadThumb lesson={lesson} module={mod} meta={meta} content={content} />

                {/* Etiqueta de lección */}
                <span
                  className="absolute -left-1 -top-1 flex h-8 min-w-8 items-center justify-center
                    rounded-md bg-coral-ink px-1.5 font-display text-[0.85rem] font-bold text-white"
                >
                  {isCover ? '★' : lesson.id}
                </span>

                {/* Badges de recursos */}
                {(lesson.resources ?? []).length > 0 && (
                  <span className="absolute -bottom-1 -right-1 flex gap-1">
                    {lesson.resources.map((r) => {
                      const badge = RESOURCE_BADGES[r]
                      if (!badge) return null
                      const { Icon, label } = badge
                      return (
                        <span
                          key={r}
                          title={label}
                          className="flex h-6 w-6 items-center justify-center rounded-full
                            border border-navy/10 bg-white text-sage-ink shadow-soft"
                        >
                          <Icon size={13} strokeWidth={2.2} />
                        </span>
                      )
                    })}
                  </span>
                )}
              </span>

              <span className="w-full px-0.5 pb-0.5">
                <span className="block font-display text-[0.92rem] leading-tight text-navy">
                  {lesson.title}
                </span>
                {!isCover && (
                  <span className="mt-0.5 block text-[0.72rem] text-ink-soft">
                    Páginas {lesson.pages.map((p) => p.pageNumber).join('–')}
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <RoundButton label="Ir al menú del libro" onClick={() => navigate(`/book/${bookId}`)}>
          <Home size={19} strokeWidth={2.4} />
        </RoundButton>

        {getGames(bookId, moduleId).length > 0 && (
          <button
            onClick={() => navigate(`/book/${bookId}/games?module=${moduleId}`)}
            className="rounded-full border border-navy/15 bg-white px-4 py-2 text-[0.88rem]
              font-semibold text-navy shadow-soft transition-colors hover:border-coral-ink
              hover:text-coral-ink"
          >
            🎮 Juegos de este módulo
          </button>
        )}
      </div>
    </div>
  )
}
