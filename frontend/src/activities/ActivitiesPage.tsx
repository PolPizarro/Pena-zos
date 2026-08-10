import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import {
  cancelMyRegistration,
  countActiveRegistrations,
  createActivity,
  getMyRegistration,
  listActivities,
  registerForActivity,
  setActivityStatus,
} from './activitiesService'
import type { Activity, ActivityStatus } from './types'

export function ActivitiesPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [myRegistrations, setMyRegistrations] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [registrationRequired, setRegistrationRequired] = useState(false)
  const [capacity, setCapacity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    if (!member) return
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      if (!activeSeason) {
        setActivities([])
        return
      }
      const activityList = await listActivities(activeSeason.id)
      setActivities(activityList)

      const registrations: Record<string, boolean> = {}
      for (const activity of activityList) {
        const registration = await getMyRegistration(activeSeason.id, activity.id, member.id)
        registrations[activity.id] = registration?.status === 'REGISTERED'
      }
      setMyRegistrations(registrations)
    } catch {
      setError('No se han podido cargar las actividades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id])

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
      await createActivity(
        season.id,
        {
          name,
          description,
          date,
          startTime,
          endTime,
          location,
          registrationRequired,
          capacity: capacity ? Number(capacity) : null,
        },
        member.id,
      )
      setName('')
      setDescription('')
      setDate('')
      setStartTime('')
      setEndTime('')
      setLocation('')
      setRegistrationRequired(false)
      setCapacity('')
      await refresh()
    } catch {
      setError('No se ha podido crear la actividad.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(activityId: string, status: ActivityStatus) {
    if (!season) return
    setError(null)
    try {
      await setActivityStatus(season.id, activityId, status)
      await refresh()
    } catch {
      setError('No se ha podido actualizar la actividad.')
    }
  }

  async function handleRegister(activity: Activity) {
    if (!season || !member) return
    setError(null)
    try {
      if (activity.capacity != null) {
        const count = await countActiveRegistrations(season.id, activity.id)
        if (count >= activity.capacity) {
          setError('Esta actividad ya no tiene plazas disponibles.')
          return
        }
      }
      await registerForActivity(season.id, activity.id, member.id)
      await refresh()
    } catch {
      setError('No se ha podido completar la inscripción.')
    }
  }

  async function handleCancelRegistration(activity: Activity) {
    if (!season || !member) return
    setError(null)
    try {
      await cancelMyRegistration(season.id, activity.id, member.id)
      await refresh()
    } catch {
      setError('No se ha podido cancelar la inscripción.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  return (
    <main>
      <h1>Actividades — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreate}>
          <h2>Nueva actividad</h2>
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
          <label>
            Requiere inscripción
            <input
              type="checkbox"
              checked={registrationRequired}
              onChange={(event) => setRegistrationRequired(event.target.checked)}
            />
          </label>
          <label>
            Aforo (vacío = sin límite)
            <input type="number" min="0" value={capacity} onChange={(event) => setCapacity(event.target.value)} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear actividad (borrador)'}
          </button>
        </form>
      )}

      {activities.length === 0 && <p>No hay actividades.</p>}

      <ul>
        {activities.map((activity) => (
          <li key={activity.id}>
            <strong>{activity.name}</strong> — {activity.date} {activity.startTime}
            {activity.location && ` — ${activity.location}`}
            {activity.description && <p>{activity.description}</p>}
            <p>
              Estado: {activity.status}
              {activity.capacity != null && ` · Aforo: ${activity.capacity}`}
            </p>

            {activity.registrationRequired && activity.status === 'REGISTRATION_OPEN' && (
              <>
                {myRegistrations[activity.id] ? (
                  <button type="button" onClick={() => handleCancelRegistration(activity)}>
                    Cancelar inscripción
                  </button>
                ) : (
                  <button type="button" onClick={() => handleRegister(activity)}>
                    Inscribirme
                  </button>
                )}
              </>
            )}

            {canManage && (
              <>
                {activity.status === 'DRAFT' && (
                  <button type="button" onClick={() => handleStatusChange(activity.id, 'PUBLISHED')}>
                    Publicar
                  </button>
                )}
                {activity.status === 'PUBLISHED' && activity.registrationRequired && (
                  <button type="button" onClick={() => handleStatusChange(activity.id, 'REGISTRATION_OPEN')}>
                    Abrir inscripción
                  </button>
                )}
                {activity.status === 'REGISTRATION_OPEN' && (
                  <button type="button" onClick={() => handleStatusChange(activity.id, 'REGISTRATION_CLOSED')}>
                    Cerrar inscripción
                  </button>
                )}
                {(activity.status === 'PUBLISHED' || activity.status === 'REGISTRATION_CLOSED') && (
                  <button type="button" onClick={() => handleStatusChange(activity.id, 'COMPLETED')}>
                    Marcar completada
                  </button>
                )}
                {activity.status !== 'COMPLETED' && activity.status !== 'CANCELLED' && (
                  <button type="button" onClick={() => handleStatusChange(activity.id, 'CANCELLED')}>
                    Cancelar
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
