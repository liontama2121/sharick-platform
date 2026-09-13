import { useSyncExternalStore } from 'react'
import { getSession, subscribe } from '../services/authService'

/** Sesión de la Study Zone, reactiva. `null` si nadie ha iniciado sesión. */
export function useSession() {
  return useSyncExternalStore(subscribe, getSession, () => null)
}
