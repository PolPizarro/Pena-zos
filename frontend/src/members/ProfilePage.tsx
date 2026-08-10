import type { Member } from '../auth/types'

export function ProfilePage({ member }: { member: Member }) {
  return (
    <main>
      <h1>Mi perfil</h1>
      <dl>
        <dt>Nombre</dt>
        <dd>{member.fullName}</dd>
        <dt>Email</dt>
        <dd>{member.email}</dd>
        <dt>DNI</dt>
        <dd>{member.dni}</dd>
        <dt>Roles</dt>
        <dd>{member.roles.join(', ')}</dd>
        <dt>Estado</dt>
        <dd>{member.status}</dd>
      </dl>
    </main>
  )
}
