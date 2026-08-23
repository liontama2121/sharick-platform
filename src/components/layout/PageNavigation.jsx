import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function PageNavigation({ bookId, prev, next, index, total }) {
  const navigate = useNavigate()

  const go = (page) => {
    if (!page) return
    navigate(`/book/${bookId}/topic/${page.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-col-blue/10 pt-6">
      <Button variant="ghost" onClick={() => go(prev)} disabled={!prev}>
        &larr; {prev ? prev.title : 'Anterior'}
      </Button>

      <span className="font-title text-sm font-semibold text-ink/50">
        {index + 1} / {total}
      </span>

      <Button onClick={() => go(next)} disabled={!next}>
        {next ? next.title : 'Última página'} &rarr;
      </Button>
    </nav>
  )
}
