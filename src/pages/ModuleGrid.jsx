import { Fragment, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { Check, Gamepad2, Home, Mic, PenLine, Video, Volume2 } from 'lucide-react'

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
import CloseButton from '../components/page/CloseButton'

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

/* Cuadritos pixel que salen del tag de cada miniatura hacia arriba-izquierda. */
const TAG_PIXELS = [
  { x: 0, y: 0, s: 14, c: 'var(--color-coral)' },
  { x: 18, y: 6, s: 10, c: 'var(--color-gold)' },
  { x: 32, y: 0, s: 12, c: 'var(--color-coral)' },
  { x: 6, y: 20, s: 10, c: 'var(--color-gold)' },
  { x: 24, y: 22, s: 14, c: 'var(--color-coral)' },
  { x: 44, y: 16, s: 10, c: 'var(--color-gold)' },
]

/* Patrón de cuadritos del banner, saliendo del lado izquierdo. */
const BANNER_PIXELS = [
  { x: 0, y: 0, s: 26 },
  { x: 30, y: 8, s: 18 },
  { x: 6, y: 34, s: 20 },
  { x: 34, y: 38, s: 26 },
  { x: 0, y: 64, s: 16 },
  { x: 24, y: 72, s: 22 },
  { x: 54, y: 24, s: 14 },
  { x: 56, y: 60, s: 18 },
  { x: 12, y: 96, s: 22 },
  { x: 42, y: 102, s: 14 },
]

/**
 * NIVEL 2 — rejilla del módulo con UNA MINIATURA POR PANTALLA, agrupadas por
 * lección y en el orden real del libro (portada → 1.1-s1 → 1.1-s2 → 1.2-s1 …).
 * Look Express Publishing: la miniatura ES la tarjeta, con un tag rojo que
 * sobresale por la esquina superior izquierda y badges circulares que
 * sobresalen por abajo.
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

  /* La portada entra en la fila de la primera lección: el separador de esa
     lección se pinta ANTES de la portada y no antes de su primera pantalla. */
  const primeraLeccion = pantallas.find((p) => !p.isCover)?.lesson ?? null
  const hayPortada = pantallas.some((p) => p.isCover)

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
  const toBook = () => navigate(`/book/${bookId}`)

  /** La tarjeta hace zoom y abre el libro DIRECTAMENTE en esa pantalla. */
  const abrirPantalla = (item, cardEl) => {
    const go = () =>
      navigate(`/book/${bookId}/module/${moduleId}/lesson/${item.lesson.id}/screen/${item.number}`)
    if (!cardEl || reduced()) return go()
    animate(cardEl, { scale: [1, 1.12], opacity: [1, 0.35], duration: 240, ease: 'outQuad' })
    setTimeout(go, 215)
  }

  /* Hover: la tarjeta crece y el tag se inclina un poco, como una pegatina. */
  const hover = (e, active) => {
    if (reduced()) return
    const card = e.currentTarget
    animate(card, { scale: active ? 1.05 : 1, duration: 260, ease: 'outQuad' })
    const tag = card.querySelector('[data-tag]')
    if (tag) animate(tag, { rotate: active ? -3 : 0, duration: 260, ease: 'outQuad' })
  }

  const pct = pantallas.length ? (hechas / pantallas.length) * 100 : 0

  const separadorDe = (lesson) => (
    <div className="col-span-full mb-3 flex items-center gap-3">
      <span className="label-caps whitespace-nowrap text-[0.66rem] text-coral-ink">
        {lesson.id} · {lesson.shortTitle ?? lesson.title}
      </span>
      <span className="h-0 flex-1 border-t-2 border-dotted border-[#e3d9c4]" />
    </div>
  )

  return (
    <div ref={ref} className="min-h-screen px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
      {/* Marco general, como el de las páginas del libro */}
      <div
        className="relative mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-[1480px]
          rounded-[20px] border-[3px] border-coral-ink/70 bg-paper pb-24 3xl:max-w-[1820px]"
      >
        {/* Banner del módulo: rojo, "Module N" en Playfair, cuadritos a la izquierda */}
        <div
          className="relative -ml-[3px] -mt-[3px] inline-flex max-w-[calc(100%-120px)] items-center
            gap-6 overflow-hidden rounded-br-[64px] rounded-tl-[20px] py-8 pl-8 pr-24 text-white
            shadow-lift"
          style={{
            background:
              'linear-gradient(100deg, var(--color-coral-ink) 0%, var(--color-coral) 100%)',
          }}
        >
          <svg
            width="72"
            height="120"
            viewBox="0 0 72 120"
            aria-hidden="true"
            className="absolute -left-1 top-1/2 -translate-y-1/2"
          >
            {BANNER_PIXELS.map((p, i) => (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width={p.s}
                height={p.s}
                rx="3"
                fill={i % 3 === 1 ? 'var(--color-gold)' : '#ffffff'}
                opacity={i % 3 === 1 ? 0.85 : 0.22}
              />
            ))}
          </svg>
          <h1 className="relative ml-16 font-display text-[2.6rem] font-extrabold leading-none text-white sm:text-[3.4rem]">
            Module {mod.moduleId}
          </h1>
        </div>

        <CloseButton label="Volver al menú del libro" onClick={toBook} />

        {/* Subtítulo + progreso, contado por pantallas */}
        <div className="px-8 pt-6 sm:px-10">
          <h2 className="font-display text-[1.45rem] text-navy">{mod.moduleName}</h2>
          {mod.description && (
            <p className="mt-1 max-w-2xl text-[0.9rem] text-ink-soft">{mod.description}</p>
          )}
          <div className="mt-3 max-w-sm">
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

        {/* Rejilla. El padding deja sitio a los tags y badges que sobresalen. */}
        <div ref={gridRef} className="grid-pantallas gap-9 px-10 pt-9 sm:px-12">
          {pantallas.map((item) => {
            const { screen, lesson, isCover, isFirstOfLesson } = item
            const hecha = estaHecha(screen)
            const badges = item.badges.slice(0, 2)

            const separador = isCover
              ? primeraLeccion
              : isFirstOfLesson && !(hayPortada && lesson.id === primeraLeccion?.id)
                ? lesson
                : null

            return (
              <Fragment key={item.key}>
                {separador && separadorDe(separador)}

                {/* div y no button: la miniatura renderiza el libro de verdad, que
                    trae sus propios <button> dentro y anidarlos es HTML inválido. */}
                <div
                  data-card
                  data-screen-id={screen.id}
                  role="button"
                  tabIndex={0}
                  title={item.title}
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
                  onMouseEnter={(e) => hover(e, true)}
                  onMouseLeave={(e) => hover(e, false)}
                  className="group relative cursor-pointer"
                >
                  {/* Anillo del pulso dorado al volver del libro */}
                  <span
                    data-pulse
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-[4px] rounded-[12px] opacity-0
                      ring-[3px] ring-gold"
                  />

                  {/* La miniatura ES la tarjeta */}
                  <ScreenThumb
                    screen={screen}
                    meta={meta}
                    content={content}
                    frameClassName="rounded-lg border border-[#cfc3a9] shadow-lift"
                  />

                  {/* Cuadritos pixel detrás del tag */}
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

                  {/* Tag sobresaliente: lección grande + pantalla n/total */}
                  <span
                    data-tag
                    className="absolute -left-5 -top-5 flex h-16 min-w-16 flex-col items-center
                      justify-center rounded-[10px] bg-coral-ink px-2 leading-none text-white
                      shadow-[0_10px_22px_rgba(27,58,92,.28)]"
                  >
                    <span className="font-display text-[1.45rem] font-extrabold">
                      {isCover ? '★' : lesson.id}
                    </span>
                    {!isCover && (
                      <span className="mt-1 font-body text-[0.62rem] font-semibold opacity-90">
                        {item.number}/{item.total}
                      </span>
                    )}

                    {/* Pantalla completada: check pequeño en la esquina del tag */}
                    {hecha && (
                      <span
                        title="Pantalla completada"
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center
                          rounded-full border-2 border-white bg-sage-ink text-white shadow-soft"
                      >
                        <Check size={12} strokeWidth={3.2} />
                      </span>
                    )}
                  </span>

                  {/* Badges circulares sobresaliendo por abajo (máx. 2) */}
                  {badges.map((b, i) => {
                    const badge = BADGES[b]
                    if (!badge) return null
                    const { Icon, label } = badge
                    return (
                      <span
                        key={b}
                        title={label}
                        aria-label={label}
                        className="absolute -bottom-6 flex h-12 w-12 items-center justify-center
                          rounded-full border-[3px] border-white bg-coral-ink text-white
                          shadow-[0_8px_18px_rgba(27,58,92,.25)]"
                        /* en fila hacia la izquierda, para no chocar con la tarjeta vecina */
                        style={{ right: -24 + i * 52 }}
                      >
                        <Icon size={20} strokeWidth={2.4} />
                      </span>
                    )
                  })}
                </div>
              </Fragment>
            )
          })}

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
            className="relative flex aspect-[16/10] cursor-pointer flex-col items-center
              justify-center gap-1.5 rounded-lg border border-sage-ink/35 bg-tip p-4 text-center
              shadow-lift"
          >
            <span
              data-tag
              className="absolute -left-5 -top-5 flex h-16 w-16 items-center justify-center
                rounded-[10px] bg-sage-ink text-white shadow-[0_10px_22px_rgba(27,58,92,.28)]"
            >
              <Gamepad2 size={30} strokeWidth={2.2} />
            </span>
            <span className="font-display text-[1.05rem] leading-tight text-navy">
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

        {/* Botonera superpuesta a la esquina inferior izquierda del marco */}
        <div className="absolute -bottom-6 left-7 z-30 flex items-center gap-3">
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
