import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Gamepad2, Home } from 'lucide-react'

import {
  activityId,
  getBookContent,
  getBookMeta,
  getModule,
  findLessonOfScreen,
  getModuleGames,
  getModuleLessonCards,
} from '../books'
import { useLevelIntro } from '../hooks/useLevelIntro'
import { useProgress } from '../hooks/useProgress'
import LessonCard from '../components/book/LessonCard'
import RoundButton from '../components/nav/RoundButton'
import Filete from '../components/decor/Filete'
import CloseButton from '../components/page/CloseButton'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * NIVEL 2 — rejilla del módulo con UNA MINIATURA POR LECCIÓN: portada (★) y
 * después [1.1] [1.2] [1.3]…, como el índice visual de Express Publishing.
 * Cada miniatura es un spread de dos páginas con tag rojo sobresaliente y
 * badges circulares (ver `book/LessonCard.jsx`).
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

  const tarjetas = useMemo(() => getModuleLessonCards(bookId, moduleId), [bookId, moduleId])

  /* Una pantalla CON actividad se completa al resolverla; una sin actividad,
     con verla. Así el contador del header no se queda corto para siempre. */
  const estaHecha = (screen) =>
    screen.activity
      ? isCompleted(activityId(screen.id, screen.activity))
      : isScreenVisited(screen.id)

  const hechasDe = (item) => item.screens.filter(estaHecha).length
  const totalPantallas = tarjetas.reduce((n, t) => n + t.screens.length, 0)
  const hechas = tarjetas.reduce((n, t) => n + hechasDe(t), 0)

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

  /* Al volver del libro con [X]: scroll hasta la lección donde estaba el
     estudiante y pulso dorado sobre esa tarjeta. */
  const ultima = progress.currentPage
  useEffect(() => {
    if (!ultima || !gridRef.current) return
    const leccion = findLessonOfScreen(bookId, moduleId, ultima)
    if (!leccion) return
    const escapar = window.CSS?.escape ?? ((s) => s)
    const card = gridRef.current.querySelector(`[data-lesson-id="${escapar(leccion.id)}"]`)
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
  }, [ultima, bookId, moduleId])

  if (!mod) {
    return (
      <div className="p-10 text-center">
        <h1>Módulo no encontrado</h1>
      </div>
    )
  }

  const toGames = () => navigate(`/book/${bookId}/module/${moduleId}/games`)
  const toBook = () => navigate(`/book/${bookId}`)

  /** La tarjeta hace zoom y abre la lección en su pantalla 1. */
  const abrirLeccion = (item, cardEl) => {
    const go = () =>
      navigate(`/book/${bookId}/module/${moduleId}/lesson/${item.lesson.id}/screen/1`)
    if (!cardEl || reduced()) return go()
    animate(cardEl, { scale: [1, 1.12], opacity: [1, 0.35], duration: 240, ease: 'outQuad' })
    setTimeout(go, 215)
  }

  /* Hover de la tarjeta de juegos (las de lección lo traen dentro). */
  const hover = (e, active) => {
    if (reduced()) return
    const card = e.currentTarget
    animate(card, { scale: active ? 1.05 : 1, duration: 260, ease: 'outQuad' })
    const tag = card.querySelector('[data-tag]')
    if (tag) animate(tag, { rotate: active ? -3 : 0, duration: 260, ease: 'outQuad' })
  }

  const pct = totalPantallas ? (hechas / totalPantallas) * 100 : 0

  return (
    <div ref={ref} className="min-h-screen px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
      {/* Costado de la chiva: carrocería blanca con techo azul y faldón rojo;
          cada lección es una ventana */}
      <div
        className="relative mx-auto w-full max-w-[1480px] overflow-hidden
          rounded-[26px] border-[6px] border-azul bg-carroceria pb-[88px] shadow-page 3xl:max-w-[1820px]"
      >
        {/* Techo: banda azul con guarda de rombos */}
        <div aria-hidden="true" className="grain absolute inset-x-0 top-0 h-5 bg-azul" />
        <Filete variant="rombos" height={12} className="absolute inset-x-0 top-5 h-3 w-full" />

        {/* Rótulo del módulo: placa roja pintada, letra slab con sombra amarilla */}
        <div
          className="grain relative ml-5 mt-14 inline-flex max-w-[calc(100%-120px)] items-center
            rounded-2xl border-4 border-amarillo bg-rojo-ink px-5 py-4 shadow-lift sm:ml-8 sm:px-8 sm:py-5"
        >
          <h1 className="rotulo whitespace-nowrap text-[1.9rem] leading-none text-white sm:text-[3.6rem]">
            Module {mod.moduleId}
          </h1>
        </div>

        <CloseButton label="Volver al menú del libro" onClick={toBook} />

        {/* Subtítulo + progreso, contado por pantallas */}
        <div className="px-8 pt-6 sm:px-10">
          <h2 className="text-[1.5rem] text-azul">{mod.moduleName}</h2>
          {mod.description && (
            <p className="mt-1 max-w-2xl text-[0.9rem] text-ink-soft">{mod.description}</p>
          )}
          <div className="mt-3 max-w-sm">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-azul/10"
              role="progressbar"
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Pantallas completadas del módulo"
            >
              <div
                className="h-full rounded-full bg-verde transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 font-body text-[0.8rem] font-semibold text-ink-soft">
              {hechas} de {totalPantallas} pantallas completadas
            </p>
          </div>
        </div>

        {/* Rejilla. El padding deja sitio a los tags y badges que sobresalen. */}
        {/* Banda de ventanas: franja verde pintada entre filetes amarillos,
            como la fila de ventanas del costado de la chiva */}
        <div className="grain mt-9 border-y-4 border-amarillo bg-verde px-9 py-12 sm:px-12">
        <div ref={gridRef} className="grid-pantallas gap-x-10 gap-y-14">
          {tarjetas.map((item) => (
            <LessonCard
              key={item.key}
              item={item}
              meta={meta}
              content={content}
              done={hechasDe(item)}
              onOpen={abrirLeccion}
            />
          ))}

          {/* Tarjeta especial: los juegos del módulo, la última de la rejilla */}
          <div
            data-card
            role="button"
            tabIndex={0}
            title={`Games · Module ${mod.moduleId}`}
            onClick={toGames}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toGames()
              }
            }}
            onMouseEnter={(e) => hover(e, true)}
            onMouseLeave={(e) => hover(e, false)}
            className="relative flex aspect-[2/1] cursor-pointer flex-col items-center
              justify-center gap-1.5 rounded-[14px] border-[5px] border-madera bg-tip p-4 text-center
              shadow-lift"
          >
            <span
              data-tag
              className="absolute -left-5 -top-5 flex h-16 w-16 items-center justify-center
                rounded-[12px] border-[3px] border-amarillo bg-verde-ink text-white
                shadow-[0_10px_22px_rgba(20,30,50,.28)]"
            >
              <Gamepad2 size={30} strokeWidth={2.2} />
            </span>
            <span className="font-display text-[1.1rem] leading-tight text-azul">
              Games · Module {mod.moduleId}
            </span>
            {games.length > 0 ? (
              <>
                <span className="label-caps text-verde-ink">{games.length} juegos</span>
                <span className="text-[0.74rem] text-ink-soft">
                  {gameStats.played} de {gameStats.total} jugados · ⭐ {gameStats.stars}
                </span>
              </>
            ) : (
              <span className="label-caps text-rojo-ink">Próximamente</span>
            )}
          </div>
        </div>
        </div>

        {/* Faldón: banda roja con guarda de dientes, como la parte baja de la chiva */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
          <Filete variant="dientes" height={14} className="h-3.5 w-full" />
          <div className="grain h-12 bg-rojo-ink" />
        </div>

        {/* Botonera sobre el faldón, esquina inferior izquierda */}
        <div className="absolute bottom-4 left-7 z-30 flex items-center gap-3">
          <RoundButton
            label="Ir al menú del libro"
            onClick={toBook}
            size="lg"
          >
            <Home size={22} strokeWidth={2.4} />
          </RoundButton>
          <RoundButton
            label={`Juegos del módulo ${mod.moduleId}`}
            onClick={toGames}
            size="lg"
          >
            <Gamepad2 size={22} strokeWidth={2.4} />
          </RoundButton>
        </div>
      </div>
    </div>
  )
}
