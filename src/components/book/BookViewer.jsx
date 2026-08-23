import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { animate } from 'animejs'

import BookCover from './BookCover'
import BookPage from './BookPage'
import PageContent from './PageContent'
import CornerFlip from './CornerFlip'
import { numberToWords } from '../../utils/numberWords'

const DECOR = ['bird', 'heliconia', 'leaves']
const HINT_KEY = 'corner-hint-shown'

/** ¿El foco está en un campo de texto? Entonces las flechas son del campo. */
function typingInField() {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

/** Índice de hoja donde empieza la doble página que contiene a `i`. */
function spreadStart(i) {
  if (i <= 0) return 0
  return i % 2 === 1 ? i : i - 1
}

function CornerHint({ onDismiss, style }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        ease: 'outBack',
      })
    }
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      ref={ref}
      role="status"
      style={style}
      className="pointer-events-none absolute z-40 rounded-full bg-navy px-4 py-2
        text-[0.8rem] font-semibold text-white shadow-lift"
    >
      Toca la esquina para pasar la página 👉
    </div>
  )
}

/**
 * Libro con pasada de página. La navegación es EXCLUSIVA de las esquinas:
 * react-pageflip tiene desactivados mouse, swipe y click interno.
 *
 * Sobre el índice: el hijo 0 es la portada (va sola) y las dobles páginas
 * empiezan en los índices impares. La página N del JSON vive en el hijo N+1.
 *
 * El libro se MONTA ya en la hoja pedida (`startPage`). Saltar desde el sidebar
 * lo vuelve a montar con otra hoja inicial en vez de pedirle a la librería que
 * se mueva: su índice interno no coincide con el que se le pasa en doble
 * página, y sincronizarlo en caliente terminaba colgando la pestaña.
 */
export default function BookViewer({ meta, content, pages, currentPageId, onPageChange, progress }) {
  const bookRef = useRef(null)
  const wrapRef = useRef(null)

  const targetIndex = useMemo(() => {
    const i = pages.findIndex((p) => p.page.id === currentPageId)
    return i === -1 ? 0 : i + 1
  }, [pages, currentPageId])

  // Hoja inicial de este montaje; cambiar `key` remonta el libro.
  const [mount, setMount] = useState(() => ({ key: 0, start: spreadStart(targetIndex) }))
  const [index, setIndex] = useState(() => spreadStart(targetIndex))
  const [ready, setReady] = useState(false)
  const [box, setBox] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [wrapMax, setWrapMax] = useState(1120)

  // Espejo del índice para leerlo dentro de efectos sin meterlo en sus deps.
  const indexRef = useRef(index)
  const setSheet = useCallback((i) => {
    indexRef.current = i
    setIndex(i)
  }, [])

  const api = useCallback(() => bookRef.current?.pageFlip?.(), [])
  const isPortrait = useCallback(() => api()?.getOrientation?.() === 'portrait', [api])

  /* El libro tiene que caber entero en la ventana: si sobresale por abajo, las
     esquinas inferiores —la forma principal de pasar página— quedan fuera de
     pantalla. Limitamos el ancho del contenedor según el alto libre
     (relación de hoja 520x720). */
  useEffect(() => {
    const calc = () => {
      const avail = window.innerHeight - 190
      const byHeight = Math.round((2 * 520 * Math.max(avail, 340)) / 720)
      setWrapMax(Math.min(1120, Math.max(520, byHeight)))
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  /* Ruta -> libro. Depende SOLO de targetIndex: si también dependiera de
     `index`, nuestro propio avance por esquina remontaría el libro a mitad de
     la animación y la hoja se quedaría en blanco. */
  const honored = useRef(targetIndex)
  useEffect(() => {
    if (honored.current === targetIndex) return
    honored.current = targetIndex

    const i = indexRef.current
    const visible = i === 0 || isPortrait() ? [i] : [i, i + 1]
    if (visible.includes(targetIndex)) return

    const start = isPortrait() ? targetIndex : spreadStart(targetIndex)
    setMount((m) => ({ key: m.key + 1, start }))
    setSheet(start)
    setReady(false)
  }, [targetIndex, isPortrait, setSheet])

  // Las esquinas se posicionan sobre el libro real, no sobre el contenedor.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap || !ready) return
    const book = wrap.querySelector('.stf__parent')
    if (!book) return

    // Sin la guarda de igualdad esto entra en bucle de re-render.
    const measure = () => {
      const w = wrap.getBoundingClientRect()
      const b = book.getBoundingClientRect()
      const next = {
        left: Math.round(b.left - w.left),
        top: Math.round(b.top - w.top),
        width: Math.round(b.width),
        height: Math.round(b.height),
      }
      setBox((prev) =>
        prev &&
        prev.left === next.left &&
        prev.top === next.top &&
        prev.width === next.width &&
        prev.height === next.height
          ? prev
          : next,
      )
    }
    measure()

    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    const ro = new ResizeObserver(schedule)
    ro.observe(book)
    ro.observe(wrap)
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [ready, mount.key])

  // Hint de primera vez
  useEffect(() => {
    if (!ready) return
    try {
      if (!localStorage.getItem(HINT_KEY)) setShowHint(true)
    } catch {
      /* modo privado: sin hint */
    }
  }, [ready])

  const dismissHint = useCallback(() => {
    setShowHint(false)
    try {
      localStorage.setItem(HINT_KEY, '1')
    } catch {
      /* nada que guardar */
    }
  }, [])

  const lastChild = pages.length
  const lastStart = lastChild % 2 === 1 ? lastChild : lastChild - 1

  const step = useCallback(
    (dir) => {
      const fp = api()
      if (!fp) return
      dismissHint()

      const portrait = isPortrait()
      const next = portrait
        ? Math.min(Math.max(index + dir, 0), lastChild)
        : dir > 0
          ? index === 0
            ? 1
            : Math.min(index + 2, lastStart)
          : index <= 1
            ? 0
            : index - 2

      if (next === index) return
      honored.current = next
      setSheet(next)
      if (dir > 0) fp.flipNext()
      else fp.flipPrev()

      const entry = pages[next - 1]
      if (entry && entry.page.id !== currentPageId) onPageChange?.(entry.page.id)
    },
    [api, dismissHint, isPortrait, index, lastChild, lastStart, pages, currentPageId, onPageChange, setSheet],
  )

  const flipNext = useCallback(() => step(1), [step])
  const flipPrev = useCallback(() => step(-1), [step])

  // Teclado: solo flechas, y solo si no se está escribiendo en un campo.
  useEffect(() => {
    const onKey = (e) => {
      if (typingInField() || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        flipNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        flipPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flipNext, flipPrev])

  const current = pages[index - 1]
  const atStart = index === 0
  const atEnd = index >= lastStart && index !== 0

  const cornerStyle = (vertical, horizontal) => {
    if (!box) return { display: 'none' }
    return {
      position: 'absolute',
      top: vertical === 'top' ? box.top : undefined,
      bottom: vertical === 'bottom' ? `calc(100% - ${box.top + box.height}px)` : undefined,
      left: horizontal === 'left' ? box.left : undefined,
      right: horizontal === 'right' ? `calc(100% - ${box.left + box.width}px)` : undefined,
    }
  }

  const CORNERS = [
    { position: 'bottom-right', style: cornerStyle('bottom', 'right'), onFlip: flipNext, disabled: atEnd },
    { position: 'top-right', style: cornerStyle('top', 'right'), onFlip: flipNext, disabled: atEnd },
    { position: 'bottom-left', style: cornerStyle('bottom', 'left'), onFlip: flipPrev, disabled: atStart },
    { position: 'top-left', style: cornerStyle('top', 'left'), onFlip: flipPrev, disabled: atStart },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={wrapRef} className="relative w-full" style={{ maxWidth: wrapMax }}>
        <HTMLFlipBook
          key={mount.key}
          ref={bookRef}
          width={520}
          height={720}
          size="stretch"
          minWidth={280}
          maxWidth={560}
          minHeight={420}
          maxHeight={760}
          maxShadowOpacity={0.4}
          showCover
          mobileScrollSupport
          startPage={mount.start}
          /* Navegación EXCLUSIVA por esquinas: sin mouse, sin swipe, sin click interno */
          useMouseEvents={false}
          disableFlipByClick
          clickEventForward={false}
          flippingTime={800}
          onInit={() => setReady(true)}
          className="mx-auto shadow-page"
          style={{}}
        >
          <BookCover key="cover" meta={meta} content={content} />

          {pages.map((entry, i) => (
            <BookPage
              key={entry.page.id}
              pageNumber={entry.page.pageNumber ?? i + 1}
              decor={DECOR[i % DECOR.length]}
            >
              <PageContent page={entry.page} module={entry.module} progress={progress} />
            </BookPage>
          ))}
        </HTMLFlipBook>

        {CORNERS.map((c) => (
          <CornerFlip
            key={c.position}
            position={c.position}
            style={c.style}
            onFlip={c.onFlip}
            disabled={c.disabled}
          />
        ))}

        {showHint && box && (
          <CornerHint
            onDismiss={dismissHint}
            style={{
              right: `calc(100% - ${box.left + box.width - 8}px)`,
              bottom: `calc(100% - ${box.top + box.height - 100}px)`,
            }}
          />
        )}
      </div>

      <p className="label-caps text-ink-soft">
        {current
          ? `Página ${current.page.pageNumber} · ${numberToWords(current.page.pageNumber)}`
          : 'Portada'}
      </p>
    </div>
  )
}
