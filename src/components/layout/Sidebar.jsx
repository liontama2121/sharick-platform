import { useRef, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { animate } from 'animejs'
import { books, getModules, moduleActivityIds, bookActivityIds } from '../../books'
import { useProgress } from '../../hooks/useProgress'
import ProgressBar from '../ui/ProgressBar'
import SectionLabel from '../ui/SectionLabel'

function SidebarLink({ to, number, children, onNavigate }) {
  const ref = useRef(null)
  const move = (x) => {
    if (!ref.current) return
    animate(ref.current, { translateX: x, duration: 200, ease: 'outQuad' })
  }
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      ref={ref}
      onMouseEnter={() => move(6)}
      onMouseLeave={() => move(0)}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.82rem] transition-colors
         ${isActive ? 'bg-navy text-white' : 'text-ink hover:bg-box'}`
      }
    >
      {number != null && (
        <span className="font-display text-[0.78rem] text-coral-ink">{number}</span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { bookId = 'english-a1' } = useParams()
  const modules = getModules(bookId)
  const { progress } = useProgress(bookId)

  const allIds = bookActivityIds(bookId)
  const doneCount = allIds.filter((id) => progress.completedActivities.includes(id)).length
  const pct = allIds.length ? Math.round((doneCount / allIds.length) * 100) : 0

  const [openModules, setOpenModules] = useState(() => new Set([1]))
  const toggleModule = (id) =>
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      {open && (
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-navy/25 xl:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col overflow-y-auto
          border-r border-navy/10 bg-paper px-4 py-5 scrollbar-slim
          transition-transform duration-300 xl:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/" onClick={onClose} className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-navy">
            <span
              aria-hidden="true"
              className="h-full w-1.5 bg-[#003DA5]"
              style={{
                background: 'linear-gradient(180deg,#FFD100 0 33%,#003DA5 33% 66%,#CE1126 66%)',
                width: '100%',
              }}
            />
          </span>
          <span>
            <span className="block font-display text-[1.05rem] leading-tight text-navy">Sharick</span>
            <span className="block text-[0.7rem] leading-tight text-ink-soft">
              Plataforma de idiomas
            </span>
          </span>
        </Link>

        <SectionLabel tone="sage" className="mb-1.5">
          Libro
        </SectionLabel>
        <div className="mb-5 flex flex-col gap-1">
          {books.map((b) => {
            const active = b.id === bookId
            return b.available ? (
              <Link
                key={b.id}
                to={`/book/${b.id}`}
                onClick={onClose}
                className={`rounded-lg px-2.5 py-1.5 text-[0.85rem] transition-colors
                  ${active ? 'bg-box font-semibold text-navy' : 'text-ink hover:bg-box'}`}
              >
                {b.name}
              </Link>
            ) : (
              <span
                key={b.id}
                title="Próximamente"
                className="rounded-lg px-2.5 py-1.5 text-[0.85rem] text-ink-soft/60"
              >
                {b.name}
              </span>
            )
          })}
        </div>

        <SectionLabel tone="sage" className="mb-1.5">
          Contenido
        </SectionLabel>
        <nav className="mb-5 flex flex-col gap-0.5">
          {modules.map((mod) => {
            const isOpen = openModules.has(mod.moduleId)
            const empty = !(mod.pages ?? []).length
            const modIds = moduleActivityIds(mod)
            const modDone = modIds.filter((id) => progress.completedActivities.includes(id)).length
            return (
              <div key={mod.moduleId}>
                <button
                  onClick={() => !empty && toggleModule(mod.moduleId)}
                  disabled={empty}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left
                    transition-colors
                    ${empty ? 'cursor-default text-ink-soft/55' : 'text-navy hover:bg-box'}`}
                >
                  <span className="label-caps shrink-0 text-coral-ink">U{mod.moduleId}</span>
                  <span className="min-w-0 flex-1 font-display text-[0.92rem] leading-tight">
                    {mod.moduleName}
                  </span>
                  {!empty && (
                    <span className="text-[0.7rem] text-ink-soft">
                      {modDone}/{modIds.length}
                    </span>
                  )}
                </button>

                {isOpen && !empty && (
                  <div className="ml-3 mt-0.5 flex flex-col gap-0.5 border-l-2 border-gold/60 pl-2">
                    {mod.pages.map((p) => (
                      <SidebarLink
                        key={p.id}
                        to={`/book/${bookId}/topic/${p.id}`}
                        number={p.pageNumber}
                        onNavigate={onClose}
                      >
                        {p.navTitle ?? p.title}
                      </SidebarLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="mt-auto rounded-xl bg-box p-3.5">
          <ProgressBar value={pct} label="Tu progreso" />
          <p className="mt-1.5 text-[0.7rem] text-ink-soft">
            {doneCount} de {allIds.length} actividades
          </p>
        </div>
      </aside>
    </>
  )
}
