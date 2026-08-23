import { useRef, useState } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { animate } from 'animejs'
import { books, getModules, moduleActivityIds, bookActivityIds } from '../../books'
import { useProgress } from '../../hooks/useProgress'
import ProgressBar from '../ui/ProgressBar'

function SidebarLink({ to, children, onNavigate }) {
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
        `block rounded-xl px-3 py-2 text-sm transition-colors
         ${isActive
           ? 'bg-col-blue text-white font-title font-semibold'
           : 'text-ink/75 hover:text-col-yellow hover:bg-col-blue/5'}`
      }
    >
      {children}
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
      {/* Overlay en mobile */}
      {open && (
        <button
          aria-label="Cerrar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-y-auto
          border-r border-col-blue/8 bg-white px-5 py-6 scrollbar-slim
          transition-transform duration-300 lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/" onClick={onClose} className="mb-6 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFD100] to-[#CE1126] text-xl">
            🇨🇴
          </span>
          <div>
            <p className="font-title text-base font-bold leading-tight text-col-blue">Sharick</p>
            <p className="text-[11px] leading-tight text-ink/55">Plataforma de idiomas</p>
          </div>
        </Link>

        {/* Selector de libro */}
        <p className="mb-1 font-title text-[11px] font-semibold uppercase tracking-wide text-ink/45">
          Libro
        </p>
        <div className="mb-6 flex flex-col gap-1.5">
          {books.map((b) => {
            const active = b.id === bookId
            return b.available ? (
              <Link
                key={b.id}
                to={`/book/${b.id}`}
                onClick={onClose}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors
                  ${active ? 'bg-col-yellow/25 font-title font-semibold text-col-blue' : 'text-ink/70 hover:bg-col-blue/5'}`}
              >
                <span aria-hidden="true">{b.flag}</span> {b.name}
              </Link>
            ) : (
              <span
                key={b.id}
                title="Próximamente"
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ink/35"
              >
                <span aria-hidden="true">{b.flag}</span> {b.name}
              </span>
            )
          })}
        </div>

        {/* Modulos en acordeon */}
        <p className="mb-1 font-title text-[11px] font-semibold uppercase tracking-wide text-ink/45">
          Módulos
        </p>
        <nav className="mb-6 flex flex-col gap-1">
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
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left
                    font-title text-sm font-semibold transition-colors
                    ${empty ? 'cursor-default text-ink/35' : 'text-col-blue hover:bg-col-blue/5'}`}
                >
                  <span aria-hidden="true">{mod.icon}</span>
                  <span className="flex-1 leading-tight">{mod.moduleName}</span>
                  {!empty && (
                    <span className="text-[11px] font-medium text-ink/45">
                      {modDone}/{modIds.length}
                    </span>
                  )}
                  {!empty && (
                    <span
                      aria-hidden="true"
                      className={`text-[10px] transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    >
                      &#9654;
                    </span>
                  )}
                </button>

                {isOpen && !empty && (
                  <div className="ml-3 mt-1 flex flex-col gap-0.5 border-l-2 border-col-yellow/50 pl-2">
                    {mod.pages.map((p) => (
                      <SidebarLink
                        key={p.id}
                        to={`/book/${bookId}/topic/${p.id}`}
                        onNavigate={onClose}
                      >
                        {p.title}
                      </SidebarLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-col-blue/4 p-4">
          <ProgressBar value={pct} label="Tu progreso" />
          <p className="mt-2 text-[11px] text-ink/55">
            {doneCount} de {allIds.length} actividades
          </p>
        </div>
      </aside>
    </>
  )
}
