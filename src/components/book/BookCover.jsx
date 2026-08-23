import { forwardRef } from 'react'
import Swirl from '../decor/Swirl'
import TropicalFlower from '../decor/TropicalFlower'

/**
 * Portada del libro — el ÚNICO lugar (junto al branding) donde vive
 * el tricolor de Colombia.
 */
const BookCover = forwardRef(function BookCover({ meta, content }, ref) {
  return (
    <div ref={ref} className="h-full w-full" data-density="hard">
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-navy px-8 text-center">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-2.5 bg-gradient-to-r from-[#003DA5] via-[#FFD100] to-[#CE1126]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2.5 bg-gradient-to-r from-[#CE1126] via-[#FFD100] to-[#003DA5]"
        />
        <TropicalFlower
          variant="heliconia"
          size={150}
          className="absolute -left-3 bottom-8 opacity-45"
        />
        <TropicalFlower
          variant="leaves"
          size={150}
          flip
          className="absolute -right-3 top-10 opacity-40"
        />

        <p className="label-caps text-[#FFD100]">{content?.country ?? 'Colombia'} edition</p>
        <h1 className="mt-3 font-display text-white">{meta?.name ?? 'Libro'}</h1>
        <Swirl width={120} className="mt-3" />
        <p className="mt-4 max-w-[22ch] text-[0.92rem] text-white/80">
          {meta?.description ?? ''}
        </p>
        <p className="mt-8 label-caps text-white/70">Prof. Sharick Prieto</p>
      </div>
    </div>
  )
})

export default BookCover
