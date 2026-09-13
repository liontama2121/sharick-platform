import { useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

import { S } from '../../study/strings'
import { login } from '../../services/authService'
import { useSession } from '../../hooks/useSession'
import { useLevelIntro } from '../../hooks/useLevelIntro'
import { shake } from '../../hooks/useFeedback'
import Button from '../../components/ui/Button'
import Swirl from '../../components/decor/Swirl'
import TropicalFlower from '../../components/decor/TropicalFlower'

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
        className="relative w-full max-w-md overflow-hidden rounded-[20px] border-[3px] border-coral-ink/70
          bg-paper px-8 pb-8 pt-10 shadow-page"
      >
        <TropicalFlower variant="leaves" size={120} className="absolute -right-6 -top-4 opacity-30" />
        <TropicalFlower variant="heliconia" size={110} flip className="absolute -left-6 bottom-2 opacity-25" />

        <div className="relative text-center">
          <p className="label-caps text-coral-ink">{S.homeLabel}</p>
          <h1 className="mt-2 text-[1.6rem]">{S.loginTitle}</h1>
          <div className="mt-2 flex justify-center">
            <Swirl width={110} />
          </div>
          <p className="mt-2 text-[0.9rem] text-ink-soft">{S.loginSubtitle}</p>
        </div>

        <form onSubmit={submit} className="relative mt-7 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="label-caps text-sage-ink">{S.username}</span>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 font-body text-[1rem] text-navy
                outline-none transition-colors focus:border-coral-ink"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="label-caps text-sage-ink">{S.password}</span>
            <span className="relative">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-navy/15 bg-white px-4 py-2.5 pr-11 font-body text-[1rem]
                  text-navy outline-none transition-colors focus:border-coral-ink"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-navy"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-coral-ink/40 bg-[#fbeae6] px-4 py-2 text-[0.88rem] font-semibold text-coral-ink">
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
          <button onClick={() => navigate('/')} className="text-[0.85rem] font-semibold text-navy underline-offset-2 hover:underline">
            {S.backHome}
          </button>
        </div>
      </div>
    </div>
  )
}
