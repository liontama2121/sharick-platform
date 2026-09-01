import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import BookMenu from './pages/BookMenu'
import ModuleGrid from './pages/ModuleGrid'
import LessonReader from './pages/LessonReader'

/**
 * Navegación de 3 niveles, como un libro digital de editorial:
 *   /                                       Home · selector de libros
 *   /book/:bookId                           Nivel 1 · menú del libro
 *   /book/:bookId/module/:moduleId          Nivel 2 · lecciones del módulo
 *   /book/:bookId/module/:moduleId/lesson/:lessonId
 *                                           Nivel 3 · libro abierto
 * Cada nivel trae su propia cabecera; no hay sidebar.
 */
export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:bookId" element={<BookMenu />} />
          <Route path="/book/:bookId/module/:moduleId" element={<ModuleGrid />} />
          <Route
            path="/book/:bookId/module/:moduleId/lesson/:lessonId"
            element={<LessonReader />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
