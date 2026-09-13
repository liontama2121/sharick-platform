/**
 * authService — sesión de la Study Zone.
 *
 * ⚠️ DEMO ONLY — FASE SIN BACKEND. Los usuarios viven en `src/data/users.json`
 * en texto plano y la "sesión" es un objeto en localStorage. Sirve para probar
 * la plataforma con Sharick y 4-5 estudiantes en un mismo dispositivo.
 *
 * PLAN DE MIGRACIÓN → Cloudflare D1 + Pages Functions:
 *   - `login()`     → POST /api/login   (D1: tabla users, hash de contraseña,
 *                     cookie HttpOnly o token)
 *   - `logout()`    → POST /api/logout
 *   - `getSession()`→ GET  /api/session (o leer el token guardado)
 *   - `listUsers()` → GET  /api/users   (solo role teacher)
 * La INTERFAZ de este módulo (login / logout / getSession / subscribe /
 * listUsers) se mantiene igual: los componentes no cambian, solo cambia la
 * implementación de estas funciones.
 */
import data from '../data/users.json'

const SESSION_KEY = 'sharick-session'
const listeners = new Set()

function read() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

let session = read()

function write(next) {
  session = next
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* modo privado: la sesión vive solo en memoria */
  }
  listeners.forEach((l) => l())
}

/** Sesión activa: `{ username, role, name }` o `null`. */
export function getSession() {
  return session
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Inicia sesión. Devuelve `{ ok: true, session }` o `{ ok: false, error }`.
 * Es async a propósito: cuando exista el backend será una petición de red.
 */
export async function login(username, password) {
  const u = String(username ?? '').trim().toLowerCase()
  const found = data.users.find((x) => x.username === u)
  // pequeña pausa para que el botón muestre estado "Signing in…"
  await new Promise((r) => setTimeout(r, 250))
  if (!found || found.password !== String(password ?? '')) {
    return { ok: false, error: 'invalid' }
  }
  const next = { username: found.username, role: found.role, name: found.name ?? found.username }
  write(next)
  return { ok: true, session: next }
}

export async function logout() {
  write(null)
}

/** Usuarios (sin contraseña). Con D1 será un endpoint solo para el profe. */
export function listUsers() {
  return data.users.map(({ username, role, name }) => ({ username, role, name }))
}
