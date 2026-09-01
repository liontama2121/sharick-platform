import { useNavigate, useParams } from 'react-router-dom'
import { X } from 'lucide-react'

import { getBookMeta, getModuleGames, getModules } from '../books'
import { useProgress } from '../hooks/useProgress'
import { useLevelIntro } from '../hooks/useLevelIntro'
import MenuButton from '../components/nav/MenuButton'
import RoundButton from '../components/nav/RoundButton'
import Swirl from '../components/decor/Swirl'

/** Selector de módulo del botón Games del menú principal. */
export default function GamesPicker() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const ref = useLevelIntro(`${bookId}-games`)

  const meta = getBookMeta(bookId)
  const modules = getModules(bookId)
  const { getModuleGameStats } = useProgress(bookId)

  return (
    <div ref={ref} className="mx-auto w-full max-w-[720px] px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-sage-ink">Games</p>
          <h1 className="mt-1">¿De qué módulo quieres jugar?</h1>
          <Swirl width={104} className="mt-1.5" />
          <p className="mt-2 text-[0.9rem] text-ink-soft">
            Cada módulo tiene sus propios juegos, con su vocabulario y sus diálogos.
          </p>
        </div>

        <RoundButton label="Volver al menú del libro" onClick={() => navigate(`/book/${bookId}`)}>
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </header>

      <div className="flex flex-col gap-3">
        {modules.map((mod) => {
          const games = getModuleGames(bookId, mod.moduleId)
          const available = games.length > 0
          const stats = getModuleGameStats(mod.moduleId, games.map((g) => g.id))
          return (
            <MenuButton
              key={mod.moduleId}
              badge={mod.moduleId}
              tone="coral"
              label={mod.moduleName}
              hint={
                available
                  ? `${games.length} juegos · ${stats.played} jugados · ⭐ ${stats.stars}`
                  : null
              }
              available={available}
              onClick={() =>
                available && navigate(`/book/${bookId}/module/${mod.moduleId}/games`)
              }
            />
          )
        })}
      </div>

      <p className="mt-6 text-center text-[0.82rem] text-ink-soft">{meta?.name}</p>
    </div>
  )
}
