export default function Header({ onToggleSidebar, title, subtitle }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy/8 bg-paper/90 px-5 py-2.5 backdrop-blur-sm sm:px-8">
      <button
        onClick={onToggleSidebar}
        aria-label="Abrir menú"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-navy/12 bg-white shadow-soft xl:hidden"
      >
        <span className="flex flex-col gap-1" aria-hidden="true">
          <span className="block h-0.5 w-4 rounded bg-navy" />
          <span className="block h-0.5 w-4 rounded bg-navy" />
          <span className="block h-0.5 w-4 rounded bg-navy" />
        </span>
      </button>
      <div className="min-w-0">
        <p className="truncate font-display text-[0.95rem] text-navy">{title}</p>
        {subtitle && <p className="truncate label-caps text-sage-ink">{subtitle}</p>}
      </div>
    </header>
  )
}
