import { useEffect, useState } from 'react'
import type { Member } from '../auth/types'
import type { Season } from '../seasons/types'
import { listAttendees, setGuestPaymentStatus } from './dinnersService'
import type { Dinner, DinnerAttendee } from './types'

export function DinnerAttendeesSummary({
  season,
  dinner,
  members,
}: {
  season: Season
  dinner: Dinner
  members: Member[]
}) {
  const [attendees, setAttendees] = useState<DinnerAttendee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      setAttendees(await listAttendees(season.id, dinner.id))
    } catch {
      setError('No se ha podido cargar la asistencia.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dinner.id])

  function memberName(memberId: string) {
    return members.find((candidate) => candidate.id === memberId)?.fullName ?? memberId
  }

  async function handleMarkPaid(memberId: string, guestCost: number) {
    setError(null)
    try {
      await setGuestPaymentStatus(season.id, dinner.id, memberId, 'PAID', guestCost)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el pago.')
    }
  }

  if (loading) return <p>Cargando asistencia...</p>

  const attending = attendees.filter((attendee) => attendee.attending)
  const totalGuests = attending.reduce((sum, attendee) => sum + (attendee.guestCount || 0), 0)

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <p>
        Miembros asistiendo: {attending.length} · Invitados: {totalGuests} · Total comensales:{' '}
        {attending.length + totalGuests}
      </p>
      <table>
        <thead>
          <tr>
            <th>Miembro</th>
            <th>Asiste</th>
            <th>Invitados</th>
            <th>Pago invitados</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((attendee) => (
            <tr key={attendee.memberId}>
              <td>{memberName(attendee.memberId)}</td>
              <td>{attendee.attending ? 'Sí' : 'No'}</td>
              <td>{attendee.guestCount}</td>
              <td>{attendee.guestPaymentStatus ?? '—'}</td>
              <td>
                {attendee.guestCount > 0 && attendee.guestPaymentStatus !== 'PAID' && (
                  <button type="button" onClick={() => handleMarkPaid(attendee.memberId, attendee.guestCost ?? 0)}>
                    Marcar pagado
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
