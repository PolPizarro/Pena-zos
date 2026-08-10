import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './app/Layout'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ChangePasswordPage } from './auth/ChangePasswordPage'
import { LoginPage } from './auth/LoginPage'
import { logout } from './auth/authService'
import type { Member, MemberRole } from './auth/types'
import { ImportMembersPage } from './members/ImportMembersPage'
import { MembersListPage } from './members/MembersListPage'
import { ProfilePage } from './members/ProfilePage'
import { SeasonsPage } from './seasons/SeasonsPage'

function HomePage({ member }: { member: Member }) {
  return (
    <main>
      <h1>Peña Zos</h1>
      <p>Bienvenido, {member.fullName}.</p>
      <p>Roles: {member.roles.join(', ')}</p>
    </main>
  )
}

function RequireRole({ roles, member, children }: { roles: MemberRole[]; member: Member; children: ReactNode }) {
  const allowed = roles.some((role) => member.roles.includes(role))
  return allowed ? <>{children}</> : <Navigate to="/" replace />
}

function AuthGate() {
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
    <Routes>
      <Route element={<Layout member={member} />}>
        <Route path="/" element={<HomePage member={member} />} />
        <Route path="/profile" element={<ProfilePage member={member} />} />
        <Route
          path="/seasons"
          element={
            <RequireRole roles={['BOARD', 'ADMIN']} member={member}>
              <SeasonsPage />
            </RequireRole>
          }
        />
        <Route
          path="/members"
          element={
            <RequireRole roles={['BOARD', 'TREASURER', 'ADMIN']} member={member}>
              <MembersListPage />
            </RequireRole>
          }
        />
        <Route
          path="/members/import"
          element={
            <RequireRole roles={['ADMIN']} member={member}>
              <ImportMembersPage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
