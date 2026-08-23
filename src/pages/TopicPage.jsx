import { useCallback, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getAllPages, getBookContent, getBookMeta } from '../books'
import { useProgress } from '../hooks/useProgress'
import BookViewer from '../components/book/BookViewer'
import Button from '../components/ui/Button'

/** Lector del libro. Sirve tanto para /book/:bookId como para .../topic/:pageId */
export default function TopicPage() {
  const { bookId, pageId } = useParams()
  const navigate = useNavigate()

  const meta = getBookMeta(bookId)
  const content = getBookContent(bookId)
  const pages = getAllPages(bookId)
  const progress = useProgress(bookId)
  const { progress: state, setCurrentPage } = progress

  useEffect(() => {
    if (pageId && state.currentPage !== pageId) setCurrentPage(pageId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const handlePageChange = useCallback(
    (nextId) => {
      if (nextId && nextId !== pageId) {
        navigate(`/book/${bookId}/topic/${nextId}`, { replace: true })
      }
    },
    [bookId, pageId, navigate],
  )

  if (!meta || !content || !pages.length) {
    return (
      <div className="text-center">
        <h1 className="mb-3">Libro no disponible</h1>
        <p className="mb-6 text-ink-soft">Este libro todavía no tiene contenido publicado.</p>
        <Link to="/">
          <Button variant="ghost">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <BookViewer
      meta={meta}
      content={content}
      pages={pages}
      currentPageId={pageId}
      onPageChange={handlePageChange}
      progress={progress}
    />
  )
}
