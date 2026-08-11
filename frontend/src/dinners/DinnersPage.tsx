import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member } from '../auth/types'
import { listMembers } from '../members/membersService'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { DinnerAttendanceSection } from './DinnerAttendanceSection'
import { DinnerAttendeesSummary } from './DinnerAttendeesSummary'
import { createDinner, listDinners, setDinnerStatus } from './dinnersService'
import type { Dinner, DinnerStatus } from './types'

export function DinnersPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [dinners, setDinners] = useState<Dinner[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [expandedDinnerId, setExpandedDinnerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [registrationDeadline, setRegistrationDeadline] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      if (!activeSeason) {
        setDinners([])
        return
      }
      setDinners(await listDinners(activeSeason.id))
      if (canManage) {
        setMembers(await listMembers())
      }
    } catch {
      setError('No se han podido cargar las cenas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!season) return
    if (!name || !date) {
      setError('Rellena al menos el nombre y la fecha.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createDinner(season.id, { name, description, date, time, location, registrationDeadline })
      setName('')
      setDescription('')
      setDate('')
      setTime('')
      setLocation('')
      setRegistrationDeadline('')
      await refresh()
    } catch {
      setError('No se ha podido crear la cena.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(dinnerId: string, status: DinnerStatus) {
    if (!season) return
    setError(null)
    try {
      await setDinnerStatus(season.id, dinnerId, status)
      await refresh()
    } catch {
      setError('No se ha podido actualizar la cena.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  return (
    <main>
      <h1>Cenas — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreate}>
          <h2>Nueva cena</h2>
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Descripción
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Fecha
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
          </label>
          <label>
            Hora
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
          <label>
            Lugar
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <label>
            Fecha límite de inscripción
            <input
              type="date"
              value={registrationDeadline}
              onChange={(event) => setRegistrationDeadline(event.target.value)}
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear cena (borrador)'}
          </button>
        </form>
      )}

      {dinners.length === 0 && <p>No hay cenas.</p>}

      <ul>
        {dinners.map((dinner) => (
          <li key={dinner.id}>
            <strong>{dinner.name}</strong> — {dinner.date} {dinner.time}
            {dinner.location && ` — ${dinner.location}`}
            {dinner.description && <p>{dinner.description}</p>}
            <p>Estado: {dinner.status}</p>

            {dinner.status !== 'DRAFT' && member && (
              <DinnerAttendanceSection season={season} dinner={dinner} memberId={member.id} onSaved={refresh} />
            )}

            {canManage && (
              <>
                {dinner.status === 'DRAFT' && (
                  <button type="button" onClick={() => handleStatusChange(dinner.id, 'OPEN')}>
                    Abrir inscripción
                  </button>
                )}
                {dinner.status === 'OPEN' && (
                  <button type="button" onClick={() => handleStatusChange(dinner.id, 'CLOSED')}>
                    Cerrar inscripción
                  </button>
                )}
                {dinner.status === 'CLOSED' && (
                  <button type="button" onClick={() => handleStatusChange(dinner.id, 'COMPLETED')}>
                    Marcar completada
                  </button>
                )}
                {dinner.status !== 'COMPLETED' && dinner.status !== 'CANCELLED' && (
                  <button type="button" onClick={() => handleStatusChange(dinner.id, 'CANCELLED')}>
                    Cancelar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setExpandedDinnerId(expandedDinnerId === dinner.id ? null : dinner.id)}
                >
                  {expandedDinnerId === dinner.id ? 'Ocultar asistencia' : 'Ver asistencia'}
                </button>

                {expandedDinnerId === dinner.id && (
                  <DinnerAttendeesSummary season={season} dinner={dinner} members={members} />
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
