import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate } from 'animejs'

import {
  activityId,
  findLesson,
  getBookContent,
  getBookMeta,
  getLessons,
  getModule,
  getModuleGames,
  getScreens,
} from '../books'
import { useProgress } from '../hooks/useProgress'
import PageStage from '../components/page/PageStage'
import PageFrame from '../components/page/PageFrame'
import LessonTag from '../components/page/LessonTag'
import CloseButton from '../components/page/CloseButton'
import BottomToolbar from '../components/page/BottomToolbar'
import ScreenRenderer from '../components/page/ScreenRenderer'
import Button from '../components/ui/Button'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function typingInField() {
  const el = document.activeElement
  const tag = el?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable
}

function DoneOverlay({ moduleName, onBack, onGames }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy/35 px-6">
      <div className="w-full max-w-md rounded-2xl bg-paper p-7 text-center shadow-lift">
        <p className="label-caps text-sage-ink">Fin del módulo</p>
        <h2 className="mt-1.5">¡Módulo completado!</h2>
        <p className="mt-2 text-[0.92rem] text-ink-soft">Llegaste al final de {moduleName}.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <Button onClick={onGames}>🎮 Jugar los juegos del módulo</Button>
          <Button variant="ghost" onClick={onBack}>
            Volver al módulo
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Índice de lecciones en modal, desde la toolbar. */
function IndexOverlay({ lessons, currentId, onPick, onClose }) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-navy/40 px-10">
      <div className="max-h-[80%] w-full max-w-3xl overflow-y-auto rounded-2xl bg-paper p-7 scrollbar-slim">
        <div className="mb-4 flex items-center justify-between">
          <h2>Índice de lecciones</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => onPick(l.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors
                ${l.id === currentId
                  ? 'border-coral-ink bg-tip'
                  : 'border-navy/12 bg-white hover:border-coral-ink/60'}`}
            >
              <span className="label-caps text-coral-ink">
                {l.type === 'cover' ? 'Portada' : l.id}
              </span>
              <span className="mt-0.5 block font-display text-[1.05rem] text-navy">
                {l.shortTitle ?? l.title}
              </span>
              <span className="text-[0.75rem] text-ink-soft">{getScreens(l).length} pantallas</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** NIVEL 3 — la lección a pantalla completa, una pantalla a la vez. */
export default function LessonReader() {
  const { bookId, moduleId, lessonId, screenNo } = useParams()
  const navigate = useNavigate()

  const meta = getBookMeta(bookId)
  const content = getBookContent(bookId)
  const mod = getModule(bookId, moduleId)
  const lessons = getLessons(bookId, moduleId)
  const lesson = findLesson(bookId, moduleId, lessonId)
  const screens = getScreens(lesson)
  const hasGames = getModuleGames(bookId, moduleId).length > 0
  const progress = useProgress(bookId)

  const [resetKey, setResetKey] = useState(0)
  const [showIndex, setShowIndex] = useState(false)
  const [done, setDone] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [barHidden, setBarHidden] = useState(false)
  const [playingLetter, setPlayingLetter] = useState(null)

  const slideRef = useRef(null)
  const dialogueAudioRef = useRef(null)

  const lessonPos = lessons.findIndex((l) => l.id === lessonId)

  /* La pantalla vive en la URL (.../lesson/1.1/screen/2). Así el Nivel 2
     puede abrir cualquier miniatura, el refresco no pierde el sitio y al
     salir con [X] la rejilla sabe dónde estaba el estudiante. */
  const screenIdx = Math.min(
    Math.max(0, (Number(screenNo) || 1) - 1),
    Math.max(0, screens.length - 1),
  )
  const screen = screens[screenIdx] ?? null

  const base = `/book/${bookId}/module/${moduleId}/lesson`

  useEffect(() => {
    setDone(false)
  }, [lessonId])

  /* Deja constancia de la pantalla vista: alimenta el contador del Nivel 2
     y el resaltado dorado al volver. */
  const { visitScreen } = progress
  useEffect(() => {
    if (screen?.id) visitScreen(screen.id)
    // visitScreen es estable (useCallback sobre bookId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen?.id])

  // Entrada de cada pantalla
  useEffect(() => {
    const el = slideRef.current
    if (!el || reduced()) return
    el.style.opacity = '0'
    animate(el, { opacity: [0, 1], translateX: [60, 0], duration: 400, ease: 'outQuad' })
  }, [screenIdx, lessonId])

  const go = useCallback(
    (dir) => {
      const el = slideRef.current
      const apply = () => {
        const url = `/book/${bookId}/module/${moduleId}/lesson`
        if (dir > 0) {
          if (screenIdx + 1 < screens.length)
            navigate(`${url}/${lessonId}/screen/${screenIdx + 2}`, { replace: true })
          else if (lessonPos + 1 < lessons.length)
            navigate(`${url}/${lessons[lessonPos + 1].id}/screen/1`)
          else setDone(true)
        } else if (screenIdx > 0) {
          navigate(`${url}/${lessonId}/screen/${screenIdx}`, { replace: true })
        } else if (lessonPos > 0) {
          // hacia atrás se entra por la ÚLTIMA pantalla de la lección anterior
          const prev = lessons[lessonPos - 1]
          navigate(`${url}/${prev.id}/screen/${getScreens(prev).length || 1}`)
        }
      }

      if (!el || reduced()) return apply()
      animate(el, {
        opacity: [1, 0],
        translateX: dir > 0 ? -60 : 60,
        duration: 260,
        ease: 'outQuad',
      })
      setTimeout(apply, 240)
    },
    [screenIdx, screens.length, lessonPos, lessons, lessonId, bookId, moduleId, navigate],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (typingInField()) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Escape' && showIndex) {
        setShowIndex(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, showIndex])

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // En pantalla completa la barra se esconde tras 2s sin mover el mouse
  useEffect(() => {
    if (!isFullscreen) {
      setBarHidden(false)
      return
    }
    let t = setTimeout(() => setBarHidden(true), 2000)
    const wake = () => {
      setBarHidden(false)
      clearTimeout(t)
      t = setTimeout(() => setBarHidden(true), 2000)
    }
    window.addEventListener('mousemove', wake)
    return () => {
      clearTimeout(t)
      window.removeEventListener('mousemove', wake)
    }
  }, [isFullscreen])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.()
  }

  /** Audio propio de un diálogo al hacer click en su caja. */
  const playDialogue = useCallback((dialogue) => {
    if (!dialogue?.audio) return
    dialogueAudioRef.current?.pause()
    const a = new Audio(dialogue.audio)
    dialogueAudioRef.current = a
    setPlayingLetter(dialogue.letter)
    a.onended = () => setPlayingLetter(null)
    a.onerror = () => setPlayingLetter(null)
    a.play().catch(() => setPlayingLetter(null))
  }, [])

  useEffect(() => () => dialogueAudioRef.current?.pause(), [])

  if (!mod || !lesson || !screen) {
    return (
      <div className="p-10 text-center">
        <h1 className="mb-4">Lección no encontrada</h1>
        <Button variant="ghost" onClick={() => navigate(`/book/${bookId}`)}>
          Volver al menú del libro
        </Button>
      </div>
    )
  }

  const toModule = () => navigate(`/book/${bookId}/module/${moduleId}`)
  const toGames = () => navigate(`/book/${bookId}/module/${moduleId}/games`)

  return (
    <PageStage>
      <PageFrame pageNumber={screen.pageNumber}>
        {lesson.type !== 'cover' && (
          <LessonTag id={lesson.id} title={lesson.shortTitle ?? lesson.title} />
        )}
        <CloseButton onClick={toModule} />

        <div ref={slideRef} className="h-full w-full">
          <ScreenRenderer
            screen={screen}
            meta={meta}
            content={content}
            progress={progress}
            activityId={activityId}
            resetKey={resetKey}
            playingLetter={playingLetter}
            onPlayDialogue={playDialogue}
          />
        </div>

        <BottomToolbar
          hidden={barHidden}
          onHome={() => navigate(`/book/${bookId}`)}
          onReset={() => setResetKey((k) => k + 1)}
          onPrevScreen={() => go(-1)}
          onNextScreen={() => go(1)}
          onIndex={() => setShowIndex(true)}
          onGames={hasGames ? toGames : null}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          onPrevLesson={() =>
            lessonPos > 0 && navigate(`${base}/${lessons[lessonPos - 1].id}/screen/1`)
          }
          onNextLesson={() =>
            lessonPos + 1 < lessons.length
              ? navigate(`${base}/${lessons[lessonPos + 1].id}/screen/1`)
              : setDone(true)
          }
          canPrevScreen={screenIdx > 0 || lessonPos > 0}
          canNextScreen={screenIdx + 1 < screens.length || lessonPos + 1 < lessons.length}
          canPrevLesson={lessonPos > 0}
          canNextLesson={lessonPos + 1 < lessons.length}
        />

        {showIndex && (
          <IndexOverlay
            lessons={lessons}
            currentId={lessonId}
            onClose={() => setShowIndex(false)}
            onPick={(id) => {
              setShowIndex(false)
              navigate(`${base}/${id}/screen/1`)
            }}
          />
        )}

        {done && (
          <DoneOverlay
            moduleName={mod.moduleName}
            onBack={() => {
              setDone(false)
              toModule()
            }}
            onGames={() => {
              setDone(false)
              toGames()
            }}
          />
        )}
      </PageFrame>
    </PageStage>
  )
}
