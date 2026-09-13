import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

/**
 * Guarda de rutas de la Study Zone: sin sesión → /study/login (recordando a
 * dónde iba). Con `role="teacher"` solo entra el profe.
 */
export default function RequireSession({ role, children }) {
  const session = useSession()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/study/login" replace state={{ from: location.pathname }} />
  }
  if (role && session.role !== role) {
    return <Navigate to="/study/english-a1" replace />
  }
  return children
}
