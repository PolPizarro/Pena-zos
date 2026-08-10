import { useState } from 'react'
import type { MemberRole } from './auth/types'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { ChangePasswordPage } from './auth/ChangePasswordPage'
import { LoginPage } from './auth/LoginPage'
import { logout } from './auth/authService'
import { ImportMembersPage } from './members/ImportMembersPage'
import { MembersListPage } from './members/MembersListPage'
import { SeasonsPage } from './seasons/SeasonsPage'

// Temporary view switcher. Replaced by real routing in Phase 5
// (19-ui-navigation.md), once more than a couple of screens exist.
type View = 'home' | 'import-members' | 'members' | 'seasons'

function canManageMembers(roles: MemberRole[]) {
  return roles.includes('BOARD') || roles.includes('TREASURER') || roles.includes('ADMIN')
}

function canManageSeasons(roles: MemberRole[]) {
  return roles.includes('BOARD') || roles.includes('ADMIN')
}

function Home({ fullName, roles, onNavigate }: { fullName: string; roles: MemberRole[]; onNavigate: (view: View) => void }) {
  return (
    <main>
      <h1>Peña Zos</h1>
      <p>Bienvenido, {fullName}.</p>
      <p>Roles: {roles.join(', ')}</p>
      {canManageSeasons(roles) && (
        <button type="button" onClick={() => onNavigate('seasons')}>
          Temporadas
        </button>
      )}
      {canManageMembers(roles) && (
        <button type="button" onClick={() => onNavigate('members')}>
          Miembros
        </button>
      )}
      {roles.includes('ADMIN') && (
        <button type="button" onClick={() => onNavigate('import-members')}>
          Importar miembros
        </button>
      )}
      <button type="button" onClick={() => logout()}>
        Cerrar sesión
      </button>
    </main>
  )
}

function AppContent() {
  const { firebaseUser, userDoc, member, loading } = useAuth()
  const [view, setView] = useState<View>('home')

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

  if (view === 'import-members' && member.roles.includes('ADMIN')) {
    return (
      <>
        <button type="button" onClick={() => setView('home')}>
          ← Volver
        </button>
        <ImportMembersPage />
      </>
    )
  }

  if (view === 'members' && canManageMembers(member.roles)) {
    return (
      <>
        <button type="button" onClick={() => setView('home')}>
          ← Volver
        </button>
        <MembersListPage />
      </>
    )
  }

  if (view === 'seasons' && canManageSeasons(member.roles)) {
    return (
      <>
        <button type="button" onClick={() => setView('home')}>
          ← Volver
        </button>
        <SeasonsPage />
      </>
    )
  }

  return <Home fullName={member.fullName} roles={member.roles} onNavigate={setView} />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
