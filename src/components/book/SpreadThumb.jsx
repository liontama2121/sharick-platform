import BookPage from './BookPage'
import BookCover from './BookCover'
import PageContent from './PageContent'

const SHEET_W = 520
const SHEET_H = 720
const SCALE = 0.22

/* Las miniaturas no se tocan: el progreso va inerte para que ninguna
   actividad se marque desde aquí. */
const INERT_PROGRESS = {
  progress: { completedActivities: [], scores: {} },
  completeActivity: () => {},
  setCurrentPage: () => {},
  resetBook: () => {},
  isCompleted: () => false,
  getScore: () => null,
  percent: () => 0,
}

/**
 * Miniatura real de una doble página: se renderiza el libro de verdad y se
 * escala. `pointer-events: none` la deja inerte.
 */
export default function SpreadThumb({ lesson, module: mod, meta, content }) {
  const isCover = lesson.type === 'cover'
  const sheets = isCover ? 1 : (lesson.pages ?? []).length || 1

  return (
    <div
      className="overflow-hidden rounded-lg bg-paper"
      style={{ width: SHEET_W * SCALE * sheets, height: SHEET_H * SCALE }}
      aria-hidden="true"
    >
      <div
        style={{
          width: SHEET_W * sheets,
          height: SHEET_H,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          display: 'flex',
        }}
      >
        {isCover ? (
          <div style={{ width: SHEET_W, height: SHEET_H }}>
            <BookCover meta={meta} content={content} />
          </div>
        ) : (
          (lesson.pages ?? []).map((page, i) => (
            <div key={page.id} style={{ width: SHEET_W, height: SHEET_H }}>
              <BookPage
                pageNumber={page.pageNumber ?? i + 1}
                decor={i % 2 === 0 ? 'bird' : 'leaves'}
              >
                <PageContent page={page} module={mod} progress={INERT_PROGRESS} />
              </BookPage>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
