import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Check, Gamepad2, Home, Mic, PenLine, Video, Volume2, X } from 'lucide-react'

import {
  activityId,
  getBookContent,
  getBookMeta,
  getModule,
  getModuleGames,
  getModuleScreens,
} from '../books'
import { useLevelIntro } from '../hooks/useLevelIntro'
import { useProgress } from '../hooks/useProgress'
import ScreenThumb from '../components/book/ScreenThumb'
import RoundButton from '../components/nav/RoundButton'

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

/**
 * NIVEL 2 — rejilla del módulo con UNA MINIATURA POR PANTALLA, agrupadas por
 * lección y en el orden real del libro (portada → 1.1-s1 → 1.1-s2 → 1.2-s1 …).
 */
export default function ModuleGrid() {
  const { bookId, moduleId } = useParams()
  const navigate = useNavigate()
  const ref = useLevelIntro(`${bookId}-${moduleId}`)
  const gridRef = useRef(null)

  const meta = getBookMeta(bookId)
  const content = getBookContent(bookId)
  const mod = getModule(bookId, moduleId)
  const games = getModuleGames(bookId, moduleId)

  const { getModuleGameStats, isCompleted, isScreenVisited, progress } = useProgress(bookId)
  const gameStats = getModuleGameStats(moduleId, games.map((g) => g.id))

  const pantallas = useMemo(() => getModuleScreens(bookId, moduleId), [bookId, moduleId])

  /* Una pantalla CON actividad se completa al resolverla; una sin actividad,
     con verla. Así el contador del header no se queda corto para siempre. */
  const estaHecha = (screen) =>
    screen.activity
      ? isCompleted(activityId(screen.id, screen.activity))
      : isScreenVisited(screen.id)

  const hechas = pantallas.filter((p) => estaHecha(p.screen)).length

  /* Entrada escalonada de las tarjetas */
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
      delay: stagger(40),
    })
  }, [moduleId])

  /* Al volver del libro con [X]: scroll hasta la pantalla donde estaba el
     estudiante y pulso dorado sobre esa tarjeta. */
  const ultima = progress.currentPage
  useEffect(() => {
    if (!ultima || !gridRef.current) return
    const escapar = window.CSS?.escape ?? ((s) => s)
    const card = gridRef.current.querySelector(`[data-screen-id="${escapar(ultima)}"]`)
    if (!card) return

    const t = setTimeout(() => {
      card.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' })
      const ring = card.querySelector('[data-pulse]')
      if (!ring || reduced()) return
      animate(ring, {
        opacity: [
          { to: 1, duration: 260 },
          { to: 0, duration: 950 },
        ],
        scale: [
          { to: 1.03, duration: 260 },
          { to: 1, duration: 950 },
        ],
        ease: 'inOutQuad',
      })
    }, 420)

    return () => clearTimeout(t)
  }, [ultima, moduleId])

  if (!mod) {
    return (
      <div className="p-10 text-center">
        <h1>Módulo no encontrado</h1>
      </div>
    )
  }

  const toGames = () => navigate(`/book/${bookId}/module/${moduleId}/games`)

  /** La tarjeta hace zoom y abre el libro DIRECTAMENTE en esa pantalla. */
  const abrirPantalla = (item, cardEl) => {
    const go = () =>
      navigate(`/book/${bookId}/module/${moduleId}/lesson/${item.lesson.id}/screen/${item.number}`)
    if (!cardEl || reduced()) return go()
    animate(cardEl, { scale: [1, 1.12], opacity: [1, 0.35], duration: 240, ease: 'outQuad' })
    setTimeout(go, 215)
  }

  const hover = (e, scale) =>
    !reduced() && animate(e.currentTarget, { scale, duration: 260, ease: 'outQuad' })

  const pct = pantallas.length ? (hechas / pantallas.length) * 100 : 0

  return (
    <div
      ref={ref}
      className="mx-auto w-full max-w-[1480px] px-5 py-7 pb-24 sm:px-8 3xl:max-w-[1820px]"
    >
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="label-caps text-coral-ink">Module {mod.moduleId}</p>
          <h1 className="mt-1">{mod.moduleName}</h1>
          {mod.description && (
            <p className="mt-1.5 max-w-2xl text-[0.9rem] text-ink-soft">{mod.description}</p>
          )}

          {/* Progreso del módulo, contado por pantallas */}
          <div className="mt-3.5 max-w-sm">
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10"
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pantallas completadas del módulo"
            >
              <div
                className="h-full rounded-full bg-coral-ink transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 font-body text-[0.8rem] font-semibold text-ink-soft">
              {hechas} de {pantallas.length} pantallas completadas
            </p>
          </div>
        </div>

        <RoundButton label="Volver al menú del libro" onClick={() => navigate(`/book/${bookId}`)}>
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </header>

      <div
        ref={gridRef}
        className="grid-pantallas gap-x-5 gap-y-6"
      >
        {pantallas.map((item) => {
          const { screen, lesson, isCover, isFirstOfLesson } = item
          const hecha = estaHecha(screen)

          return (
            <Fragment key={item.key}>
              {/* Separador de lección (la portada va sola, sin separador) */}
              {isFirstOfLesson && !isCover && (
                <div className="col-span-full mt-3 flex items-center gap-3">
                  <span className="label-caps whitespace-nowrap text-[0.7rem] text-coral-ink">
                    {lesson.id} · {lesson.shortTitle ?? lesson.title}
                  </span>
                  <span className="h-0 flex-1 border-t-2 border-dotted border-[#d9cdb5]" />
                </div>
              )}

              {/* div y no button: la miniatura renderiza el libro de verdad, que
                  trae sus propios <button> dentro y anidarlos es HTML inválido. */}
              <div
                data-card
                data-screen-id={screen.id}
                role="button"
                tabIndex={0}
                aria-label={`${
                  isCover ? 'Portada' : `${lesson.id}, pantalla ${item.number} de ${item.total}`
                } — ${item.title}`}
                onClick={(e) => abrirPantalla(item, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    abrirPantalla(item, e.currentTarget)
                  }
                }}
                onMouseEnter={(e) => hover(e, 1.04)}
                onMouseLeave={(e) => hover(e, 1)}
                className={`group relative flex cursor-pointer flex-col gap-2 rounded-2xl bg-white
                  p-2.5 text-left shadow-soft transition-shadow hover:shadow-lift
                  ${isFirstOfLesson ? 'border-2 border-coral-ink' : 'border border-navy/10'}`}
              >
                {/* Anillo del pulso dorado al volver del libro */}
                <span
                  data-pulse
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-[3px] rounded-[18px] opacity-0
                    ring-[3px] ring-gold"
                />

                <span className="relative block">
                  <ScreenThumb screen={screen} meta={meta} content={content} />

                  {/* Etiqueta: lección grande + pantalla n/total debajo */}
                  <span
                    className="absolute -left-1 -top-1 flex min-w-8 flex-col items-center
                      justify-center rounded-md bg-coral-ink px-1.5 py-1 leading-none text-white"
                  >
                    <span className="font-display text-[0.85rem] font-bold">
                      {isCover ? '★' : lesson.id}
                    </span>
                    {!isCover && (
                      <span className="mt-0.5 font-body text-[0.58rem] font-semibold opacity-90">
                        {item.number}/{item.total}
                      </span>
                    )}
                  </span>

                  {/* Pantalla completada */}
                  {hecha && (
                    <span
                      title="Pantalla completada"
                      className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center
                        rounded-full border-2 border-white bg-sage-ink text-white shadow-soft"
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}

                  {/* Badges de lo que trae ESTA pantalla */}
                  {item.badges.length > 0 && (
                    <span className="absolute -bottom-1 -right-1 flex gap-1">
                      {item.badges.map((b) => {
                        const badge = BADGES[b]
                        if (!badge) return null
                        const { Icon, label } = badge
                        return (
                          <span
                            key={b}
                            title={label}
                            className="flex h-6 w-6 items-center justify-center rounded-full
                              border border-navy/10 bg-white text-sage-ink shadow-soft"
                          >
                            <Icon size={12} strokeWidth={2.2} />
                          </span>
                        )
                      })}
                    </span>
                  )}
                </span>

                <span className="block px-0.5 pb-0.5 font-display text-[0.86rem] leading-tight text-navy">
                  {item.title}
                </span>
              </div>
            </Fragment>
          )
        })}

        {/* Tarjeta especial: los juegos del módulo, la última de la rejilla */}
        <div
          data-card
          role="button"
          tabIndex={0}
          onClick={toGames}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toGames()
            }
          }}
          onMouseEnter={(e) => hover(e, 1.04)}
          onMouseLeave={(e) => hover(e, 1)}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl
            border border-sage-ink/35 bg-tip p-5 text-center shadow-soft transition-shadow
            hover:shadow-lift"
        >
          <span className="text-4xl" aria-hidden="true">
            🎮
          </span>
          <span className="font-display text-[1rem] leading-tight text-navy">
            Games · Module {mod.moduleId}
          </span>
          {games.length > 0 ? (
            <>
              <span className="label-caps text-sage-ink">{games.length} juegos</span>
              <span className="text-[0.74rem] text-ink-soft">
                {gameStats.played} de {gameStats.total} jugados · ⭐ {gameStats.stars}
              </span>
            </>
          ) : (
            <span className="label-caps text-coral-ink">Próximamente</span>
          )}
        </div>
      </div>

      {/* Botonera flotante abajo a la izquierda: casa + juegos */}
      <div className="fixed bottom-5 left-5 z-30 flex items-center gap-3">
        <RoundButton label="Ir al menú del libro" onClick={() => navigate(`/book/${bookId}`)}>
          <Home size={19} strokeWidth={2.4} />
        </RoundButton>
        <RoundButton label={`Juegos del módulo ${mod.moduleId}`} onClick={toGames}>
          <Gamepad2 size={19} strokeWidth={2.4} />
        </RoundButton>
      </div>
    </div>
  )
}
