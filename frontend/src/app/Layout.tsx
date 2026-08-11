import { NavLink, Outlet } from 'react-router-dom'
import { logout } from '../auth/authService'
import type { Member } from '../auth/types'

// 19-ui-navigation.md §2: visible options depend on the member's roles.
export function Layout({ member }: { member: Member }) {
  const roles = member.roles

  return (
    <div>
      <nav>
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/calendar">Calendario</NavLink>
        <NavLink to="/dinners">Cenas</NavLink>
        <NavLink to="/tasks">Tareas</NavLink>
        <NavLink to="/events">Eventos</NavLink>
        <NavLink to="/activities">Actividades</NavLink>
        <NavLink to="/polls">Encuestas</NavLink>
        <NavLink to="/orders">Pedidos</NavLink>
        <NavLink to="/profile">Mi perfil</NavLink>
        {(roles.includes('BOARD') || roles.includes('ADMIN')) && <NavLink to="/seasons">Temporadas</NavLink>}
        {(roles.includes('BOARD') || roles.includes('TREASURER') || roles.includes('ADMIN')) && (
          <NavLink to="/members">Miembros</NavLink>
        )}
        {roles.includes('ADMIN') && <NavLink to="/members/import">Importar miembros</NavLink>}
        <button type="button" onClick={() => logout()}>
          Cerrar sesión
        </button>
      </nav>
      <Outlet />
    </div>
  )
}
