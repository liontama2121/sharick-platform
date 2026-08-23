import { useEffect, useState } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'

import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'
import Home from './pages/Home'
import TopicPage from './pages/TopicPage'
import { findPage, getBookMeta } from './books'

/** Título del header según la ruta actual. */
function useHeaderTitle() {
  const { bookId, pageId } = useParams()
  if (!bookId) return { title: 'Sharick · Libros de idiomas', subtitle: 'Elige tu libro' }

  const meta = getBookMeta(bookId)
  if (!pageId) return { title: meta?.name ?? 'Libro', subtitle: 'Portada' }

  const found = findPage(bookId, pageId)
  return {
    title: found?.page.title ?? meta?.name ?? 'Libro',
    subtitle: found ? `Unit ${found.module.moduleId} · página ${found.page.pageNumber}` : '',
  }
}

function Shell({ children, wide = false }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { title, subtitle } = useHeaderTitle()

  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="xl:pl-[260px]">
        <Header onToggleSidebar={() => setOpen((v) => !v)} title={title} subtitle={subtitle} />
      </div>
      <MainContent wide={wide}>{children}</MainContent>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Shell>
              <Home />
            </Shell>
          }
        />
        <Route
          path="/book/:bookId"
          element={
            <Shell wide>
              <TopicPage />
            </Shell>
          }
        />
        <Route
          path="/book/:bookId/topic/:pageId"
          element={
            <Shell wide>
              <TopicPage />
            </Shell>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
