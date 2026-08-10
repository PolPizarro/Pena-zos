import { useState, type FormEvent } from 'react'
import { login, requestPasswordReset } from './authService'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setResetSent(false)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      setError('Email o contraseña incorrectos.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError('Introduce tu email para recuperar la contraseña.')
      return
    }
    setError(null)
    try {
      await requestPasswordReset(email)
      setResetSent(true)
    } catch {
      setError('No se ha podido enviar el correo de recuperación.')
    }
  }

  return (
    <main>
      <h1>Peña Zos</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        {resetSent && <p>Te hemos enviado un correo para restablecer la contraseña.</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" onClick={handleResetPassword}>
          He olvidado mi contraseña
        </button>
      </form>
    </main>
  )
}
