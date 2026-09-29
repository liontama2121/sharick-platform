import { useLayoutEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { animate } from 'animejs'
import { BookOpen, Gamepad2, PenLine, Trophy } from 'lucide-react'

import { books, countries } from '../books'
import BookCard from '../components/cards/BookCard'
import Filete from '../components/decor/Filete'
import RouteChiva from '../components/home/RouteChiva'
import Button from '../components/ui/Button'
import { usePageAnimation } from '../hooks/usePageAnimation'
import { useSession } from '../hooks/useSession'
import { S } from '../study/strings'

const FEATURE_ICONS = {
  topics: BookOpen,
  exercises: PenLine,
  quizzes: Trophy,
  arcade: Gamepad2,
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function Home() {
  const ref = usePageAnimation('home')
  const navigate = useNavigate()
  const session = useSession()
  const startStudying = () => navigate(session ? '/study/english-a1' : '/study/login')
  const signRef = useRef(null)
  const guardTopRef = useRef(null)
  const guardBottomRef = useRef(null)

  /* Llegada de la cabecera: las guardas se pintan como una pincelada y el
     rótulo amarillo entra colgado, se mece y se asienta. */
  useLayoutEffect(() => {
    if (reduced()) return
    const sign = signRef.current
    const top = guardTopRef.current
    const bottom = guardBottomRef.current
    if (!sign || !top || !bottom) return
    sign.style.opacity = '0'
    top.style.clipPath = 'inset(0% 100% 0% 0%)'
    bottom.style.clipPath = 'inset(0% 0% 0% 100%)'
    animate(top, { clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)'], duration: 1000, ease: 'outQuart', delay: 120 })
    animate(bottom, { clipPath: ['inset(0% 0% 0% 100%)', 'inset(0% 0% 0% 0%)'], duration: 1000, ease: 'outQuart', delay: 260 })
    animate(sign, {
      opacity: [0, 1],
      translateY: [-34, 0],
      rotate: [-6, 2, -0.8, 0],
      duration: 1150,
      ease: 'outQuart',
      delay: 180,
    })
  }, [])

  return (
    <div ref={ref} className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10">
      {/* Frente de la chiva: techo azul, carrocería roja, rótulo amarillo, parachoques */}
      <header
        data-anim
        className="grain relative overflow-hidden rounded-[28px] border-[6px] border-azul bg-rojo-ink
          text-center shadow-page"
      >
        <div aria-hidden="true" className="h-4 bg-azul" />
        <div ref={guardTopRef}>
          <Filete variant="rombos" height={12} className="h-3 w-full" />
        </div>

        <div className="px-5 pb-9 pt-8 sm:px-10">
          <div
            ref={signRef}
            className="mx-auto w-fit max-w-full origin-top rounded-2xl border-4 border-azul bg-amarillo px-6 py-4 shadow-lift sm:px-9"
          >
            <h1
              className="rotulo text-balance text-[clamp(1.7rem,4.6vw,3rem)] leading-[1.05] text-azul"
              style={{ '--rotulo-sombra': '#ffffff' }}
            >
              Libros interactivos de idiomas
            </h1>
          </div>
          <p className="mx-auto mt-6 max-w-xl text-[1rem] leading-relaxed text-white">
            Súbete y aprende. Cada lección mezcla lectura, audio, juegos y práctica
            oral, en un viaje por Colombia, Venezuela, Bolivia y Panamá.
          </p>
          <p className="mt-3 font-display text-[1.05rem] text-amarillo">
            con la profesora Sharick Prieto
          </p>
        </div>

        <div ref={guardBottomRef}>
          <Filete variant="dientes" colors={['rojo-ink', 'amarillo', 'azul']} height={14} className="h-3.5 w-full" />
        </div>
        <div aria-hidden="true" className="h-5 bg-azul" />
      </header>

      {/* La ruta: una parada por país */}
      {countries.length > 0 && (
        <section data-anim aria-labelledby="ruta" className="mt-12">
          <h2 id="ruta" className="text-center text-[1.6rem]">
            La ruta del libro
          </h2>
          <RouteChiva countries={countries} />
        </section>
      )}

      <section data-anim className="mt-14">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      {/* Study Zone: práctica por temas con progresión bloqueada */}
      <section
        data-anim
        className="grain relative mt-14 overflow-hidden rounded-[24px] border-[6px] border-azul bg-verde-ink
          text-white shadow-lift"
      >
        <Filete variant="ajedrez" colors={['azul', 'amarillo']} height={12} className="h-3 w-full" />

        <div className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
          <div className="min-w-0">
            <h2 className="rotulo text-[2rem] leading-tight text-white" style={{ '--rotulo-sombra': 'var(--color-azul)' }}>
              {S.homeLabel}
            </h2>
            <p className="mt-2 max-w-md text-[0.98rem] text-white">
              <span className="font-semibold">{S.homeTitle}</span> {S.homeSubtitle}
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.86rem] font-medium sm:justify-start">
              {S.homeFeatures.map((f) => {
                const Icon = FEATURE_ICONS[f.icon] ?? BookOpen
                return (
                  <li key={f.label} className="flex items-center gap-1.5">
                    <Icon size={17} strokeWidth={2.2} className="text-amarillo" aria-hidden="true" />
                    {f.label}
                  </li>
                )
              })}
            </ul>
          </div>
          <Button size="lg" variant="amarillo" onClick={startStudying} className="shrink-0">
            {S.homeCta}
          </Button>
        </div>
      </section>

      <section data-anim className="mt-10 rounded-2xl bg-box px-6 py-5 text-center">
        <p className="font-display text-[1.05rem] text-azul">
          Tu progreso se guarda solo en este dispositivo
        </p>
        <p className="mt-1 text-[0.9rem] text-ink-soft">
          No necesitas cuenta ni internet permanente: puedes seguir donde quedaste.
        </p>
      </section>
    </div>
  )
}
