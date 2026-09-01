import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { animate } from 'animejs'

import {
  findLesson,
  getBookContent,
  getBookMeta,
  getModule,
  getModulePages,
  lessonOfPage,
} from '../books'
import { useProgress } from '../hooks/useProgress'
import { useLevelIntro } from '../hooks/useLevelIntro'
import BookViewer from '../components/book/BookViewer'
import ReaderBar from '../components/layout/ReaderBar'
import Button from '../components/ui/Button'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function DoneOverlay({ moduleName, onBack }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && !reduced()) {
      animate(ref.current, {
        opacity: [0, 1],
        scale: [0.94, 1],
        duration: 380,
        ease: 'outBack',
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/35 px-6">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-paper p-7 text-center shadow-lift"
      >
        <p className="label-caps text-sage-ink">Fin del módulo</p>
        <h2 className="mt-1.5">¡Módulo completado!</h2>
        <p className="mt-2 text-[0.92rem] text-ink-soft">
          Llegaste al final de {moduleName}. Puedes repasar cualquier lección cuando quieras.
        </p>
        <div className="mt-5">
          <Button onClick={onBack}>Volver al módulo</Button>
        </div>
      </div>
    </div>
  )
}

/** NIVEL 3 — el libro abierto en una doble página. */
export default function LessonReader() {
  const { bookId, moduleId, lessonId } = useParams()
  const navigate = useNavigate()
  const ref = useLevelIntro(`${bookId}-${moduleId}`)

  const meta = getBookMeta(bookId)
  const content = getBookContent(bookId)
  const mod = getModule(bookId, moduleId)
  const pages = getModulePages(bookId, moduleId)
  const lesson = findLesson(bookId, moduleId, lessonId)
  const progress = useProgress(bookId)
  const { setCurrentPage } = progress

  const [done, setDone] = useState(false)

  const currentPageId = lesson?.pages?.[0]?.id ?? null

  useEffect(() => {
    if (currentPageId) setCurrentPage(currentPageId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageId])

  const handlePageChange = useCallback(
    (pageId) => {
      // pageId nulo = el lector está en la portada del libro.
      const nextId = pageId === null ? 'cover' : lessonOfPage(bookId, moduleId, pageId)?.id
      if (nextId && nextId !== lessonId) {
        navigate(`/book/${bookId}/module/${moduleId}/lesson/${nextId}`, { replace: true })
      }
    },
    [bookId, moduleId, lessonId, navigate],
  )

  const toModule = () => navigate(`/book/${bookId}/module/${moduleId}`)

  if (!mod || !lesson) {
    return (
      <div className="p-10 text-center">
        <h1 className="mb-4">Lección no encontrada</h1>
        <Button variant="ghost" onClick={() => navigate(`/book/${bookId}`)}>
          Volver al menú del libro
        </Button>
      </div>
    )
  }

  const label =
    lesson.type === 'cover'
      ? `Module ${mod.moduleId} · Portada`
      : `Module ${mod.moduleId} · ${lesson.id}`

  return (
    <div ref={ref}>
      <ReaderBar
        title={label}
        onHome={() => navigate(`/book/${bookId}`)}
        onClose={toModule}
      />

      <div className="mx-auto w-full max-w-[1140px] px-4 pb-8 sm:px-8">
        <BookViewer
          meta={meta}
          content={content}
          pages={pages}
          currentPageId={currentPageId}
          onPageChange={handlePageChange}
          onReachEnd={() => setDone(true)}
          progress={progress}
        />
      </div>

      {done && (
        <DoneOverlay
          moduleName={mod.moduleName}
          onBack={() => {
            setDone(false)
            toModule()
          }}
        />
      )}
    </div>
  )
}
