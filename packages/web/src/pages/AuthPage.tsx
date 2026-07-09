import { useState, type FormEvent } from 'react'
import { Alert, Button, Card } from '../components/ui'
import { useAuth } from '../context/useAuth'
import { BRAND_BLUE, neutrals, radius, type } from '../lib/design-tokens'
import { inputBase, labelBase } from '../lib/styles'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (mode === 'signup') {
      const { error: signUpError } = await signUp(email, password, displayName)
      setSubmitting(false)
      if (signUpError) {
        setError(signUpError)
        return
      }
      setMessage('Account created. You are signed in.')
      return
    }

    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) setError(signInError)
  }

  return (
    <div style={{ minHeight: '100vh', background: neutrals.pageBg, padding: '48px 16px' }}>
      <Card tone="neutral" style={{ maxWidth: 400, margin: '0 auto', padding: 32, boxShadow: 'var(--shadow-soft)' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: radius.md,
            background: BRAND_BLUE,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            fontSize: 18,
          }}
          aria-hidden="true"
        >
          <i className="fa-solid fa-fire" />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: type.titleLg,
            fontWeight: 600,
            margin: '0 0 8px 0',
            letterSpacing: '-0.02em',
            color: neutrals.textPrimary,
          }}
        >
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p style={{ fontSize: type.body, color: neutrals.textSubtle, margin: '0 0 24px 0' }}>
          Track your daily nutrition with a private food log.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <Button
            variant={mode === 'signin' ? 'primary' : 'secondary'}
            style={{ flex: 1 }}
            onClick={() => {
              setMode('signin')
              setError(null)
              setMessage(null)
            }}
          >
            Sign in
          </Button>
          <Button
            variant={mode === 'signup' ? 'primary' : 'secondary'}
            style={{ flex: 1 }}
            onClick={() => {
              setMode('signup')
              setError(null)
              setMessage(null)
            }}
          >
            Sign up
          </Button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <label style={labelBase}>
              Display name
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
                style={{ ...inputBase, marginTop: 6 }}
              />
            </label>
          )}

          <label style={labelBase}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ ...inputBase, marginTop: 6 }}
            />
          </label>

          <label style={labelBase}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={{ ...inputBase, marginTop: 6 }}
            />
          </label>

          {error && <Alert variant="error">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Button type="submit" size="md" disabled={submitting} style={{ marginTop: 8, width: '100%' }}>
            {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
