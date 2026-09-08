import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { logout } from '../auth/authService'
import type { Member } from '../auth/types'

// 19-ui-navigation.md §2: visible options depend on the member's roles.
// The nav collapses into a toggled menu on narrow screens (§21 mobile
// requirements) since there are too many sections for a single row.
export function Layout({ member }: { member: Member }) {
  const roles = member.roles
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <div>
      <header className="app-header">
        <div className="app-header__bar">
          <NavLink to="/" className="app-header__brand" onClick={closeMenu}>
            <span className="app-header__brand-mark" aria-hidden="true" />
            Peña Zos
          </NavLink>
          <button
            type="button"
            className="app-header__toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        <nav className={`app-nav${menuOpen ? ' is-open' : ''}`}>
          <NavLink to="/" onClick={closeMenu}>
            Inicio
          </NavLink>
          <NavLink to="/calendar" onClick={closeMenu}>
            Calendario
          </NavLink>
          <NavLink to="/dinners" onClick={closeMenu}>
            Cenas
          </NavLink>
          <NavLink to="/tasks" onClick={closeMenu}>
            Tareas
          </NavLink>
          <NavLink to="/events" onClick={closeMenu}>
            Eventos
          </NavLink>
          <NavLink to="/activities" onClick={closeMenu}>
            Actividades
          </NavLink>
          <NavLink to="/polls" onClick={closeMenu}>
            Encuestas
          </NavLink>
          <NavLink to="/products" onClick={closeMenu}>
            Productos
          </NavLink>
          <NavLink to="/orders" onClick={closeMenu}>
            Pedidos
          </NavLink>
          {(roles.includes('BOARD') || roles.includes('ADMIN')) && (
            <NavLink to="/orders/import" onClick={closeMenu}>
              Importar pedidos
            </NavLink>
          )}
          <NavLink to="/deliveries" onClick={closeMenu}>
            Entregas
          </NavLink>
          <NavLink to="/profile" onClick={closeMenu}>
            Mi perfil
          </NavLink>
          {(roles.includes('BOARD') || roles.includes('ADMIN')) && (
            <NavLink to="/seasons" onClick={closeMenu}>
              Temporadas
            </NavLink>
          )}
          {(roles.includes('BOARD') || roles.includes('ADMIN')) && (
            <NavLink to="/inventory" onClick={closeMenu}>
              Inventario
            </NavLink>
          )}
          {(roles.includes('BOARD') || roles.includes('ADMIN')) && (
            <NavLink to="/inventory/import" onClick={closeMenu}>
              Importar inventario
            </NavLink>
          )}
          {(roles.includes('BOARD') || roles.includes('TREASURER') || roles.includes('ADMIN')) && (
            <NavLink to="/members" onClick={closeMenu}>
              Miembros
            </NavLink>
          )}
          {roles.includes('ADMIN') && (
            <NavLink to="/members/import" onClick={closeMenu}>
              Importar miembros
            </NavLink>
          )}
          <button type="button" onClick={() => logout()}>
            Cerrar sesión
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
