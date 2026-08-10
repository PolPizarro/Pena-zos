import { AuthProvider, useAuth } from './auth/AuthContext'
import { ChangePasswordPage } from './auth/ChangePasswordPage'
import { LoginPage } from './auth/LoginPage'
import { logout } from './auth/authService'

function AppContent() {
  const { firebaseUser, userDoc, member, loading } = useAuth()

  if (loading) {
    return <p>Cargando...</p>
  }

  if (!firebaseUser) {
    return <LoginPage />
  }

  if (userDoc?.mustChangePassword) {
    return <ChangePasswordPage />
  }

  if (!member || member.status !== 'ACTIVE') {
    return (
      <main>
        <p>Tu cuenta no tiene acceso activo. Contacta con la junta de Peña Zos.</p>
        <button type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </main>
    )
  }

  return (
    <main>
      <h1>Peña Zos</h1>
      <p>Bienvenido, {member.fullName}.</p>
      <p>Roles: {member.roles.join(', ')}</p>
      <button type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </main>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
