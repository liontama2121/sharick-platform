import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import { S } from '../../study/strings'
import { login } from '../../services/authService'
import { useSession } from '../../hooks/useSession'
import { useLevelIntro } from '../../hooks/useLevelIntro'
import { shake } from '../../hooks/useFeedback'
import Button from '../../components/ui/Button'
import Filete from '../../components/decor/Filete'

const DEFAULT_AFTER = '/study/english-a1'

/** /study/login — tarjeta centrada estilo editorial. */
export default function StudyLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = useSession()
  const ref = useLevelIntro('study-login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const cardRef = useRef(null)

  const after = location.state?.from ?? DEFAULT_AFTER

  if (session) return <Navigate to={after} replace />

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const res = await login(username, password)
    setBusy(false)
    if (res.ok) {
      navigate(after, { replace: true })
    } else {
      setError(S.loginError)
      shake(cardRef.current)
    }
  }

  return (
    <div ref={ref} className="flex min-h-screen items-center justify-center px-5 py-10">
      <div
        ref={cardRef}
        className="relative w-full max-w-md overflow-hidden rounded-[22px] border-[6px] border-madera
          bg-paper px-8 pb-8 pt-12 shadow-page"
      >
        <Filete variant="ajedrez" colors={['verde-ink', 'amarillo']} height={12} className="absolute inset-x-0 top-0 h-3 w-full" />

        <div className="relative text-center">
          <h1 className="rotulo text-[1.7rem] leading-tight text-verde-ink">{S.loginTitle}</h1>
          <p className="mt-3 text-[0.92rem] text-ink-soft">{S.loginSubtitle}</p>
        </div>

        <form onSubmit={submit} className="relative mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.85rem] font-semibold text-azul">{S.username}</span>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border-2 border-azul/20 bg-white px-4 py-2.5 font-body text-[1rem] text-azul
                outline-none transition-colors focus:border-rojo-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.85rem] font-semibold text-azul">{S.password}</span>
            <span className="relative">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border-2 border-azul/20 bg-white px-4 py-2.5 pr-11 font-body text-[1rem]
                  text-azul outline-none transition-colors focus:border-rojo-ink"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-azul"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-rojo-ink/40 bg-[#fde8ea] px-4 py-2 text-[0.88rem] font-semibold text-rojo-ink">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={busy || !username || !password} className="mt-1 w-full">
            <LogIn size={18} strokeWidth={2.5} />
            {busy ? S.signingIn : S.signIn}
          </Button>
        </form>

        <p className="relative mt-5 text-center text-[0.75rem] text-ink-soft">{S.loginDemoHint}</p>
        <div className="relative mt-3 text-center">
          <button onClick={() => navigate('/')} className="text-[0.85rem] font-semibold text-azul underline-offset-2 hover:underline">
            {S.backHome}
          </button>
        </div>
      </div>
    </div>
  )
}
