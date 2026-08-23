import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'
import Home from './pages/Home'
import BookHome from './pages/BookHome'
import TopicPage from './pages/TopicPage'
import { findPage, getBookMeta } from './books'

/** Título del header según la ruta actual. */
function useHeaderTitle() {
  const { bookId, pageId } = useParams()
  if (!bookId) return { title: 'Sharick · Libros de idiomas', subtitle: 'Elige tu libro' }
  const meta = getBookMeta(bookId)
  if (!pageId) return { title: meta?.name ?? 'Libro', subtitle: 'Módulos del libro' }
  const found = findPage(bookId, pageId)
  return {
    title: found?.page.title ?? meta?.name ?? 'Libro',
    subtitle: found ? `Módulo ${found.module.moduleId} · ${found.module.moduleName}` : '',
  }
}

function Shell({ children }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { title, subtitle } = useHeaderTitle()

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="min-h-screen bg-cream">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-[280px]">
        <Header onToggleSidebar={() => setOpen((v) => !v)} title={title} subtitle={subtitle} />
      </div>
      <MainContent>{children}</MainContent>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell><Home /></Shell>} />
        <Route path="/book/:bookId" element={<Shell><BookHome /></Shell>} />
        <Route path="/book/:bookId/topic/:pageId" element={<Shell><TopicPage /></Shell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
