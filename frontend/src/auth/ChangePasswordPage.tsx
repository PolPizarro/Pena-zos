import { useState, type FormEvent } from 'react'
import { useAuth } from './AuthContext'
import { completePasswordChange } from './authService'

export function ChangePasswordPage() {
  const { firebaseUser, reload } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!firebaseUser) return

    setSubmitting(true)
    try {
      await completePasswordChange(firebaseUser, newPassword)
      await reload()
    } catch {
      setError('No se ha podido cambiar la contraseña. Vuelve a iniciar sesión e inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main>
      <h1>Cambia tu contraseña</h1>
      <p>Es tu primer acceso. Debes establecer una contraseña nueva antes de continuar.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Nueva contraseña
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </label>
        <label>
          Confirmar contraseña
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </main>
  )
}
