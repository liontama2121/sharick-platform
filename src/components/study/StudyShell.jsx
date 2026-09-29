import { useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, LogOut, ShieldCheck } from 'lucide-react'

import { S } from '../../study/strings'
import { logout } from '../../services/authService'
import { useSession } from '../../hooks/useSession'
import { useLevelIntro } from '../../hooks/useLevelIntro'
import RoundButton from '../nav/RoundButton'
import Filete from '../decor/Filete'

/**
 * Marco de la Study Zone: borde rojo como las páginas, banner azul con
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
        className="relative mx-auto min-h-[calc(100vh-2.5rem)] w-full max-w-[1280px] overflow-hidden
          rounded-[26px] border-[6px] border-azul bg-carroceria pb-20 shadow-page"
      >
        {/* Carrocería verde de la Study Zone con guarda de ajedrez */}
        <div className="grain relative bg-verde-ink text-white">
          <div aria-hidden="true" className="h-3 bg-azul" />
          <Filete variant="ajedrez" colors={['azul', 'amarillo']} height={12} className="h-3 w-full" />
          <div className="flex flex-wrap items-end justify-between gap-4 px-8 pb-7 pt-6 sm:pr-72">
            <div className="min-w-0">
              <p className="font-display text-[1rem] text-amarillo">{S.mapTitle}</p>
              <h1 className="rotulo mt-1 text-[2rem] leading-none text-white sm:text-[2.6rem]" style={{ '--rotulo-sombra': 'var(--color-azul)' }}>
                {title}
              </h1>
              {subtitle && <p className="mt-2 text-[0.95rem] text-white">{subtitle}</p>}
            </div>

            {session && (
              <p className="font-display text-[1.15rem] text-amarillo">
                {S.greeting(session.name ?? session.username)}
              </p>
            )}
          </div>
        </div>

        {/* Toolbar reducida, superpuesta arriba a la derecha */}
        <div className="absolute right-5 top-9 z-30 flex items-center gap-2.5">
          {session?.role === 'teacher' && (
            <RoundButton label={S.teacherMode} onClick={() => navigate('/study/teacher')} className="bg-verde-ink">
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
              className="flex h-11 items-center gap-1.5 rounded-full border-[3px] border-amarillo bg-rojo-ink
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
