import ScreenRenderer from '../page/ScreenRenderer'
import { STAGE_H, STAGE_W } from '../page/PageStage'
import { activityId, getScreens } from '../../books'

const SCALE = 0.16

/* Las miniaturas no se tocan: progreso inerte para que ninguna actividad
   se marque desde aquí. */
const INERT_PROGRESS = {
  progress: { completedActivities: [], scores: {} },
  completeActivity: () => {},
  isCompleted: () => false,
  getScore: () => null,
}

/** Miniatura real de la PRIMERA pantalla de una lección (landscape 16:10). */
export default function SpreadThumb({ lesson, meta, content }) {
  const screen = getScreens(lesson)[0]
  if (!screen) return null

  return (
    <div
      className="overflow-hidden rounded-lg border border-navy/10 bg-paper"
      style={{ width: STAGE_W * SCALE, height: STAGE_H * SCALE }}
      aria-hidden="true"
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <ScreenRenderer
          screen={screen}
          meta={meta}
          content={content}
          progress={INERT_PROGRESS}
          activityId={activityId}
          resetKey={0}
        />
      </div>
    </div>
  )
}
