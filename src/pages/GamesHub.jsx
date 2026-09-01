import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import { X } from 'lucide-react'

import { getBookMeta, getGameModules, getGames } from '../books'
import { useProgress } from '../hooks/useProgress'
import { useLevelIntro } from '../hooks/useLevelIntro'
import RoundButton from '../components/nav/RoundButton'
import GameCard from '../components/games/GameCard'
import GameShell from '../components/games/GameShell'
import GameResult from '../components/games/GameResult'
import MemoryGame from '../components/games/MemoryGame'
import QuickQuiz from '../components/games/QuickQuiz'
import WordScramble from '../components/games/WordScramble'
import DiceGame from '../components/activities/DiceGame'
import RouletteWheel from '../components/activities/RouletteWheel'
import MatchActivity from '../components/activities/MatchActivity'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* Juegos que ya existían como actividad del libro: se reutilizan tal cual. */
const ACTIVITY_GAMES = {
  diceGame: DiceGame,
  roulette: RouletteWheel,
  match: MatchActivity,
}

const starsFor = (score) => (score >= 90 ? 3 : score >= 70 ? 2 : 1)

/** Envoltura de una actividad del libro usada como juego suelto. */
function ActivityGame({ game, onFinish, onExit }) {
  const Component = ACTIVITY_GAMES[game.type]
  const [result, setResult] = useState(null)
  const [round, setRound] = useState(0)

  if (!Component) return null

  return (
    <>
      <Component
        key={round}
        section={game.data}
        completed={false}
        score={null}
        onComplete={(score = 100) => {
          const stars = starsFor(score)
          setResult({ score, stars })
          onFinish?.({ score, stars })
        }}
      />

      {result && (
        <GameResult
          detail={`Puntaje: ${result.score}%`}
          stars={result.stars}
          onReplay={() => {
            setResult(null)
            setRound((r) => r + 1)
          }}
          onExit={onExit}
        />
      )}
    </>
  )
}

/** Hub de juegos: filtro por módulo y juego a pantalla completa. */
export default function GamesHub() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const ref = useLevelIntro(bookId)
  const gridRef = useRef(null)

  const meta = getBookMeta(bookId)
  const modules = getGameModules(bookId)
  const filter = params.get('module') ?? 'all'
  const games = getGames(bookId, filter)
  const allGames = getGames(bookId)

  const { getGameResult, recordGame, playedGames } = useProgress(bookId)
  const [openId, setOpenId] = useState(null)
  const openGame = allGames.find((g) => g.id === openId) ?? null

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll('[data-card]')
    if (!cards.length) return
    if (reduced()) {
      cards.forEach((c) => {
        c.style.opacity = '1'
      })
      return
    }
    cards.forEach((c) => {
      c.style.opacity = '0'
    })
    animate(cards, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 400,
      ease: 'outQuad',
      delay: stagger(60),
    })
  }, [filter])

  const played = playedGames(allGames.map((g) => g.id))

  const renderGame = () => {
    if (!openGame) return null
    const common = {
      game: openGame,
      onFinish: (res) => recordGame(openGame.id, res),
      onExit: () => setOpenId(null),
    }
    if (ACTIVITY_GAMES[openGame.type]) return <ActivityGame {...common} />
    if (openGame.type === 'memory') return <MemoryGame {...common} />
    if (openGame.type === 'quiz') return <QuickQuiz {...common} />
    if (openGame.type === 'scramble') return <WordScramble {...common} />
    return <p className="text-ink-soft">Este juego todavía no está disponible.</p>
  }

  return (
    <div ref={ref} className="mx-auto w-full max-w-[1080px] px-5 py-7 sm:px-8">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="label-caps text-sage-ink">Games</p>
          <h1 className="mt-1">Games · {meta?.name ?? 'Libro'}</h1>
          <p className="mt-1.5 text-[0.92rem] text-ink-soft">
            Practica jugando. Elige un módulo y un juego.
          </p>
          <p className="mt-1 text-[0.82rem] text-ink-soft">
            {played} de {allGames.length} juegos jugados
          </p>
        </div>

        <RoundButton label="Volver al menú del libro" onClick={() => navigate(`/book/${bookId}`)}>
          <X size={20} strokeWidth={2.5} />
        </RoundButton>
      </header>

      {/* Filtro por módulo */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[{ id: 'all', label: 'Todos' }, ...modules.map((m) => ({ id: String(m), label: `Module ${m}` }))].map(
          (opt) => {
            const active = filter === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setParams(opt.id === 'all' ? {} : { module: opt.id })}
                className={`rounded-full border px-4 py-1.5 text-[0.85rem] font-semibold transition-colors
                  ${active
                    ? 'border-coral-ink bg-coral-ink text-white'
                    : 'border-navy/15 bg-white text-navy hover:border-coral-ink/60'}`}
              >
                {opt.label}
              </button>
            )
          },
        )}
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div data-card key={game.id} className="h-full">
            <GameCard
              game={game}
              result={getGameResult(game.id)}
              onPlay={() => setOpenId(game.id)}
            />
          </div>
        ))}
      </div>

      {openGame && (
        <GameShell
          icon={openGame.icon}
          title={openGame.title}
          subtitle={openGame.blurb}
          onClose={() => setOpenId(null)}
        >
          {renderGame()}
        </GameShell>
      )}
    </div>
  )
}
