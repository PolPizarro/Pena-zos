import { useEffect, useState } from 'react'
import { listActivities } from '../activities/activitiesService'
import { listEvents } from '../events/eventsService'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'

interface CalendarEntry {
  id: string
  type: 'EVENT' | 'ACTIVITY'
  name: string
  date: string
  time: string
  location: string
}

// 12-calendar.md: the calendar owns no data, it aggregates other
// entities. Dinners and Tasks will join this list once those phases
// exist. Only the Agenda view is implemented for now (§9); Month/Week/Day
// (§6-8) can follow later if the board needs them.
export function CalendarPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const activeSeason = await getActiveSeason()
        setSeason(activeSeason)
        if (!activeSeason) {
          setEntries([])
          return
        }

        const [events, activities] = await Promise.all([
          listEvents(activeSeason.id),
          listActivities(activeSeason.id),
        ])

        const eventEntries: CalendarEntry[] = events
          .filter((eventItem) => eventItem.status === 'PUBLISHED' || eventItem.status === 'COMPLETED')
          .map((eventItem) => ({
            id: `event-${eventItem.id}`,
            type: 'EVENT',
            name: eventItem.name,
            date: eventItem.date,
            time: eventItem.startTime,
            location: eventItem.location,
          }))

        const activityEntries: CalendarEntry[] = activities
          .filter((activity) => activity.status !== 'DRAFT' && activity.status !== 'CANCELLED')
          .map((activity) => ({
            id: `activity-${activity.id}`,
            type: 'ACTIVITY',
            name: activity.name,
            date: activity.date,
            time: activity.startTime,
            location: activity.location,
          }))

        setEntries(
          [...eventEntries, ...activityEntries].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
        )
      } catch {
        setError('No se ha podido cargar el calendario.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  return (
    <main>
      <h1>Calendario — {season.name}</h1>
      {error && <p role="alert">{error}</p>}
      {entries.length === 0 && <p>No hay nada programado todavía.</p>}
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.date}</strong> {entry.time} — {entry.name}
            {entry.location && ` (${entry.location})`}
            <span> · {entry.type === 'EVENT' ? 'Evento' : 'Actividad'}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
