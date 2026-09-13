import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import Home from './pages/Home'
import BookMenu from './pages/BookMenu'
import ModuleGrid from './pages/ModuleGrid'
import LessonReader from './pages/LessonReader'
import GamesPicker from './pages/GamesPicker'
import ModuleGames from './pages/ModuleGames'
import StudyLogin from './pages/study/StudyLogin'
import StudyMap from './pages/study/StudyMap'
import StudyTopic from './pages/study/StudyTopic'
import StudyQuiz from './pages/study/StudyQuiz'
import StudyArcade from './pages/study/StudyArcade'
import StudyTeacher from './pages/study/StudyTeacher'
import RequireSession from './components/study/RequireSession'

/**
 * Navegación de 3 niveles, como un libro digital de editorial:
 *   /                                       Home · selector de libros
 *   /book/:bookId                           Nivel 1 · menú del libro
 *   /book/:bookId/games                     Selector de módulo para jugar
 *   /book/:bookId/module/:moduleId/games    Juegos de ese módulo
 *   /book/:bookId/module/:moduleId          Nivel 2 · lecciones del módulo
 *   /book/:bookId/module/:moduleId/lesson/:lessonId
 *   /book/:bookId/module/:moduleId/lesson/:lessonId/screen/:screenNo
 *                                           Nivel 3 · libro abierto
 *                                           (la variante /screen/N abre
 *                                            directamente esa pantalla)
 * Cada nivel trae su propia cabecera; no hay sidebar.
 *
 * Study Zone (requiere sesión, ver services/authService.js):
 *   /study/login                    usuario + contraseña
 *   /study/teacher                  modo profe (role: teacher)
 *   /study/:bookId                  mapa de temas con candados
 *   /study/:bookId/arcade           simulacro contrarreloj
 *   /study/:bookId/:topicId         Learn · Practice · Final Quiz
 *   /study/:bookId/:topicId/quiz    quiz final, una pregunta a la vez
 */
const guard = (el, role) => <RequireSession role={role}>{el}</RequireSession>

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:bookId" element={<BookMenu />} />
          <Route path="/book/:bookId/games" element={<GamesPicker />} />
          <Route path="/book/:bookId/module/:moduleId" element={<ModuleGrid />} />
          <Route path="/book/:bookId/module/:moduleId/games" element={<ModuleGames />} />
          <Route
            path="/book/:bookId/module/:moduleId/lesson/:lessonId"
            element={<LessonReader />}
          />
          <Route
            path="/book/:bookId/module/:moduleId/lesson/:lessonId/screen/:screenNo"
            element={<LessonReader />}
          />

          <Route path="/study/login" element={<StudyLogin />} />
          <Route path="/study/teacher" element={guard(<StudyTeacher />, 'teacher')} />
          <Route path="/study/:bookId" element={guard(<StudyMap />)} />
          <Route path="/study/:bookId/arcade" element={guard(<StudyArcade />)} />
          <Route path="/study/:bookId/:topicId" element={guard(<StudyTopic />)} />
          <Route path="/study/:bookId/:topicId/quiz" element={guard(<StudyQuiz />)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  )
}
