import { useLayoutEffect, useState } from 'react'

export const STAGE_W = 1600
export const STAGE_H = 1000

/**
 * Lienzo fijo de 1600x1000 escalado al viewport (fit-to-page).
 * Todo el contenido de una pantalla se maqueta a ese tamaño y nunca hay scroll:
 * el sobrante se rellena con cream (letterbox).
 */
export default function PageStage({ children }) {
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const calc = () => {
      setScale(Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H))
    }
    calc()
    window.addEventListener('resize', calc)
    document.addEventListener('fullscreenchange', calc)
    return () => {
      window.removeEventListener('resize', calc)
      document.removeEventListener('fullscreenchange', calc)
    }
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-paper">
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flex: '0 0 auto',
        }}
      >
        {children}
      </div>
    </div>
  )
}
