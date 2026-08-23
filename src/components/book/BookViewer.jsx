import { useCallback, useEffect, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

import BookCover from './BookCover'
import BookPage from './BookPage'
import PageContent from './PageContent'
import PillButton from '../ui/PillButton'
import { numberToWords } from '../../utils/numberWords'

const DECOR = ['bird', 'heliconia', 'leaves']

/**
 * Libro con pasada de página real (react-pageflip).
 * `pages` es la lista plana [{ page, module }] del libro; el índice 0 del
 * flipbook siempre es la portada, así que página N vive en el índice N+1.
 */
export default function BookViewer({ meta, content, pages, currentPageId, onPageChange, progress }) {
  const bookRef = useRef(null)
  const wrapRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [ready, setReady] = useState(false)

  const targetIndex = (() => {
    const i = pages.findIndex((p) => p.page.id === currentPageId)
    return i === -1 ? 0 : i + 1
  })()

  const flipTo = useCallback((i) => {
    const api = bookRef.current?.pageFlip?.()
    if (!api) return
    if (api.getCurrentPageIndex() !== i) api.turnToPage(i)
  }, [])

  // La ruta manda: al cambiar de pageId, pasamos a esa hoja.
  useEffect(() => {
    if (!ready) return
    flipTo(targetIndex)
  }, [ready, targetIndex, flipTo])

  const handleFlip = (e) => {
    const i = e.data
    setIndex(i)

    // En una doble página se ven dos hojas: si la página pedida ya está a la
    // vista, no reescribimos la ruta (si no, ir a la 9 saltaría a la 8).
    const visible = [pages[i - 1]?.page.id, pages[i]?.page.id].filter(Boolean)
    if (currentPageId && visible.includes(currentPageId)) return

    const entry = pages[i - 1]
    if (entry && entry.page.id !== currentPageId) onPageChange?.(entry.page.id)
  }

  const api = () => bookRef.current?.pageFlip?.()
  const current = pages[index - 1]

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={wrapRef} className="w-full max-w-[1120px]">
        <HTMLFlipBook
          ref={bookRef}
          width={520}
          height={720}
          size="stretch"
          minWidth={280}
          maxWidth={560}
          minHeight={420}
          maxHeight={760}
          maxShadowOpacity={0.4}
          showCover
          mobileScrollSupport
          useMouseEvents
          clickEventForward={false}
          swipeDistance={40}
          flippingTime={800}
          onInit={() => setReady(true)}
          onFlip={handleFlip}
          className="mx-auto shadow-page"
          style={{}}
        >
          <BookCover key="cover" meta={meta} content={content} />

          {pages.map((entry, i) => (
            <BookPage
              key={entry.page.id}
              pageNumber={entry.page.pageNumber ?? i + 1}
              decor={DECOR[i % DECOR.length]}
            >
              <PageContent page={entry.page} module={entry.module} progress={progress} />
            </BookPage>
          ))}
        </HTMLFlipBook>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-3">
        <PillButton icon="none" onClick={() => api()?.flipPrev()} disabled={index === 0}>
          ← Anterior
        </PillButton>

        <span className="label-caps text-ink-soft">
          {current
            ? `Página ${current.page.pageNumber} · ${numberToWords(current.page.pageNumber)}`
            : 'Portada'}
        </span>

        <PillButton
          icon="none"
          onClick={() => api()?.flipNext()}
          disabled={index >= pages.length}
        >
          Siguiente →
        </PillButton>
      </nav>
    </div>
  )
}
