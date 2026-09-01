/** Marco coral de la página, con el número dentro de la esquina inferior derecha. */
export default function PageFrame({ pageNumber, children }) {
  return (
    <div className="relative h-full w-full p-3">
      <div className="relative h-full w-full rounded-[20px] border-[3px] border-coral-ink/70 bg-paper">
        {children}

        {pageNumber != null && (
          <span
            className="absolute bottom-[104px] right-6 flex h-7 w-7 items-center justify-center
              rounded-full bg-coral-ink font-display text-[0.85rem] text-white"
          >
            {pageNumber}
          </span>
        )}
      </div>
    </div>
  )
}
