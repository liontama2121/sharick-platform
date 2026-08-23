import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { hoverFloat } from '../../hooks/useFeedback'
import SmartImage from '../ui/ImagePlaceholder'

export default function TopicCard({ bookId, page, index, completed = false }) {
  const ref = useRef(null)

  return (
    <Link to={`/book/${bookId}/topic/${page.id}`} className="block h-full">
      <div
        ref={ref}
        onMouseEnter={() => hoverFloat(ref.current, true)}
        onMouseLeave={() => hoverFloat(ref.current, false)}
        className="card-soft flex h-full gap-4 overflow-hidden p-3"
      >
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl">
          <SmartImage src={page.backgroundImage} alt={page.title} emoji="📖" rounded="rounded-xl" />
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <p className="font-title text-xs font-semibold uppercase tracking-wide text-col-blue/60">
            Página {index + 1}
          </p>
          <h4 className="font-title text-base font-semibold text-col-blue">{page.title}</h4>
          {completed && (
            <span className="mt-1 w-fit rounded-full bg-[#e8f8ee] px-2.5 py-0.5 font-title text-[11px]
              font-semibold text-[#1d6b3f]">
              ✓ Completada
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
