import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member, MemberRole } from '../auth/types'
import { listMembers, setMemberRoles, setMemberStatus } from './membersService'

const ALL_ROLES: MemberRole[] = ['MEMBER', 'BOARD', 'TREASURER', 'ADMIN']

export function MembersListPage() {
  const { member: currentMember } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = currentMember?.roles.includes('ADMIN') ?? false
  const myRoles = currentMember?.roles ?? []

  async function refresh() {
    setLoading(true)
    try {
      setMembers(await listMembers())
    } catch {
      setError('No se han podido cargar los miembros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 01-users-and-roles.md §7.1: a role can only be toggled by someone who
  // already holds that same role, or by ADMIN for any role.
  function canToggleRole(role: MemberRole) {
    return isAdmin || myRoles.includes(role)
  }

  async function toggleRole(targetMember: Member, role: MemberRole) {
    const hasRole = targetMember.roles.includes(role)
    const nextRoles = hasRole
      ? targetMember.roles.filter((existing) => existing !== role)
      : [...targetMember.roles, role]

    setError(null)
    try {
      await setMemberRoles(targetMember.id, nextRoles)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el rol. Comprueba que tienes permiso para asignarlo.')
    }
  }

  async function toggleStatus(targetMember: Member) {
    const nextStatus = targetMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setError(null)
    try {
      await setMemberStatus(targetMember.id, nextStatus)
      await refresh()
    } catch {
      setError('No se ha podido cambiar el estado del miembro.')
    }
  }

  if (loading) {
    return <p>Cargando miembros...</p>
  }

  return (
    <main>
      <h1>Miembros</h1>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Estado</th>
            {ALL_ROLES.map((role) => (
              <th key={role}>{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((memberRow) => (
            <tr key={memberRow.id}>
              <td>{memberRow.fullName}</td>
              <td>{memberRow.dni}</td>
              <td>{memberRow.email}</td>
              <td>
                {isAdmin ? (
                  <button type="button" onClick={() => toggleStatus(memberRow)}>
                    {memberRow.status}
                  </button>
                ) : (
                  memberRow.status
                )}
              </td>
              {ALL_ROLES.map((role) => (
                <td key={role}>
                  <input
                    type="checkbox"
                    checked={memberRow.roles.includes(role)}
                    disabled={!canToggleRole(role)}
                    onChange={() => toggleRole(memberRow, role)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
