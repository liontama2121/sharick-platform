export default function Header({ onToggleSidebar, title, subtitle }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-col-blue/8 bg-cream/90 px-5 py-3 backdrop-blur-sm sm:px-8">
      <button
        onClick={onToggleSidebar}
        aria-label="Abrir menú"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-soft lg:hidden"
      >
        <span className="flex flex-col gap-1" aria-hidden="true">
          <span className="block h-0.5 w-5 rounded bg-col-blue" />
          <span className="block h-0.5 w-5 rounded bg-col-blue" />
          <span className="block h-0.5 w-5 rounded bg-col-blue" />
        </span>
      </button>
      <div className="min-w-0">
        <p className="truncate font-title text-sm font-semibold text-col-blue">{title}</p>
        {subtitle && <p className="truncate text-xs text-ink/55">{subtitle}</p>}
      </div>
    </header>
  )
}
