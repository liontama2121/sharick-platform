import { useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, LogOut, ShieldCheck } from 'lucide-react'

import { S } from '../../study/strings'
import { logout } from '../../services/authService'
import { useSession } from '../../hooks/useSession'
import { useLevelIntro } from '../../hooks/useLevelIntro'
import RoundButton from '../nav/RoundButton'
import Swirl from '../decor/Swirl'

/* Cuadritos pixel del banner navy. */
const PIXELS = [
  { x: 0, y: 0, s: 22 },
  { x: 26, y: 8, s: 14 },
  { x: 6, y: 30, s: 16 },
  { x: 30, y: 34, s: 22 },
  { x: 0, y: 58, s: 12 },
  { x: 22, y: 64, s: 18 },
  { x: 48, y: 22, s: 12 },
  { x: 50, y: 54, s: 14 },
]

/**
 * Marco de la Study Zone: borde coral como las páginas, banner navy con
 * florituras doradas, saludo del usuario y toolbar reducida (🏠 ☰ Log out).
 * `title` es lo que va grande en el banner; `subtitle` debajo.
 */
export default function StudyShell({ bookId = 'english-a1', title, subtitle, children, intro }) {
  const navigate = useNavigate()
  const session = useSession()
  const ref = useLevelIntro(intro ?? title)

  const salir = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div ref={ref} className="min-h-screen px-4 pb-12 pt-4 sm:px-6 sm:pt-5">
      <div
        className="relative mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-[1280px] rounded-[20px]
          border-[3px] border-coral-ink/70 bg-paper pb-20"
      >
        {/* Banner navy */}
        <div
          className="relative -ml-[3px] -mt-[3px] flex flex-wrap items-end justify-between gap-4
            overflow-hidden rounded-br-[64px] rounded-tl-[20px] bg-navy py-7 pl-8 pr-8 text-white
            shadow-lift sm:pr-36"
        >
          <svg width="64" height="86" viewBox="0 0 64 86" aria-hidden="true" className="absolute -left-1 top-1/2 -translate-y-1/2">
            {PIXELS.map((p, i) => (
              <rect
                key={i}
                x={p.x}
                y={p.y}
                width={p.s}
                height={p.s}
                rx="3"
                fill={i % 3 === 1 ? 'var(--color-gold)' : '#ffffff'}
                opacity={i % 3 === 1 ? 0.85 : 0.18}
              />
            ))}
          </svg>
          <Swirl width={140} className="absolute right-6 top-3 opacity-40" />

          <div className="relative ml-14 min-w-0">
            <p className="label-caps text-gold">{S.mapTitle}</p>
            <h1 className="mt-1 font-display text-[2rem] font-extrabold leading-none text-white sm:text-[2.6rem]">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-[0.92rem] text-white/80">{subtitle}</p>}
          </div>

          {session && (
            <p className="relative font-display text-[1.15rem] text-gold">
              {S.greeting(session.name ?? session.username)}
            </p>
          )}
        </div>

        {/* Toolbar reducida, superpuesta arriba a la derecha */}
        <div className="absolute right-5 top-5 z-30 flex items-center gap-2.5">
          {session?.role === 'teacher' && (
            <RoundButton label={S.teacherMode} onClick={() => navigate('/study/teacher')} className="bg-sage-ink">
              <ShieldCheck size={19} strokeWidth={2.4} />
            </RoundButton>
          )}
          <RoundButton label={S.home} onClick={() => navigate('/')}>
            <Home size={19} strokeWidth={2.4} />
          </RoundButton>
          <RoundButton label={S.topicMap} onClick={() => navigate(`/study/${bookId}`)}>
            <LayoutGrid size={19} strokeWidth={2.4} />
          </RoundButton>
          {session && (
            <button
              onClick={salir}
              className="flex h-11 items-center gap-1.5 rounded-full border-[3px] border-white bg-coral-ink
                px-4 font-body text-[0.85rem] font-bold text-white shadow-lift"
            >
              <LogOut size={16} strokeWidth={2.6} />
              {S.logOut}
            </button>
          )}
        </div>

        <div className="px-6 pt-7 sm:px-10">{children}</div>
      </div>
    </div>
  )
}
