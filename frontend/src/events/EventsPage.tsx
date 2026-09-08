import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { createEvent, listEvents, setEventStatus } from './eventsService'
import type { Event, EventStatus } from './types'

export function EventsPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      setEvents(activeSeason ? await listEvents(activeSeason.id) : [])
    } catch {
      setError('No se han podido cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(formEvent: FormEvent) {
    formEvent.preventDefault()
    if (!season || !member) return
    if (!name || !date) {
      setError('Rellena al menos el nombre y la fecha.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createEvent(season.id, { name, description, date, startTime, endTime, location }, member.id)
      setName('')
      setDescription('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setLocation('')
      await refresh()
    } catch {
      setError('No se ha podido crear el evento.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(eventId: string, status: EventStatus) {
    if (!season) return
    setError(null)
    try {
      await setEventStatus(season.id, eventId, status)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el evento.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  // "Eliminar" is a soft delete: the event is marked CANCELLED and hidden
  // here, but preserved in Firestore (02-data-model.md §23).
  const visibleEvents = events.filter((eventItem) => eventItem.status !== 'CANCELLED')

  return (
    <main>
      <h1>Eventos — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreate}>
          <h2>Nuevo evento</h2>
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
            Hora de inicio
            <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
          </label>
          <label>
            Hora de fin
            <input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
          </label>
          <label>
            Lugar
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear evento (borrador)'}
          </button>
        </form>
      )}

      {visibleEvents.length === 0 && <p>No hay eventos.</p>}

      <ul>
        {visibleEvents.map((eventItem) => (
          <li key={eventItem.id}>
            <strong>{eventItem.name}</strong> — {eventItem.date} {eventItem.startTime}
            {eventItem.location && ` — ${eventItem.location}`}
            {eventItem.description && <p>{eventItem.description}</p>}
            <p>Estado: {eventItem.status}</p>
            {canManage && (
              <>
                {eventItem.status === 'DRAFT' && (
                  <button type="button" onClick={() => handleStatusChange(eventItem.id, 'PUBLISHED')}>
                    Publicar
                  </button>
                )}
                {eventItem.status === 'PUBLISHED' && (
                  <button type="button" onClick={() => handleStatusChange(eventItem.id, 'COMPLETED')}>
                    Marcar completado
                  </button>
                )}
                {eventItem.status !== 'COMPLETED' && (
                  <button type="button" onClick={() => handleStatusChange(eventItem.id, 'CANCELLED')}>
                    Eliminar
                  </button>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
