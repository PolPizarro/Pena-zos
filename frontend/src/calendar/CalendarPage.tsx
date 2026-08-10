import { useEffect, useState } from 'react'
import { listActivities } from '../activities/activitiesService'
import { useAuth } from '../auth/AuthContext'
import { listEvents } from '../events/eventsService'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { listMyTasks } from '../tasks/tasksService'

interface CalendarEntry {
  id: string
  type: 'EVENT' | 'ACTIVITY' | 'TASK'
  name: string
  date: string
  time: string
  location: string
}

// 12-calendar.md: the calendar owns no data, it aggregates other
// entities. Dinners will join this list once that phase exists. Tasks
// only show the signed-in member's own (12-calendar.md §12) — the
// Tasks screen is the place to see everything as BOARD. Only the Agenda
// view is implemented for now (§9); Month/Week/Day (§6-8) can follow
// later if the board needs them.
export function CalendarPage() {
  const { member } = useAuth()
  const [season, setSeason] = useState<Season | null>(null)
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!member) return
      setLoading(true)
      setError(null)
      try {
        const activeSeason = await getActiveSeason()
        setSeason(activeSeason)
        if (!activeSeason) {
          setEntries([])
          return
        }

        const [events, activities, myTasks] = await Promise.all([
          listEvents(activeSeason.id),
          listActivities(activeSeason.id),
          listMyTasks(activeSeason.id, member.id),
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

        const taskEntries: CalendarEntry[] = myTasks
          .filter((task) => task.status !== 'CANCELLED')
          .map((task) => ({
            id: `task-${task.id}`,
            type: 'TASK',
            name: task.title,
            date: task.date,
            time: task.time,
            location: '',
          }))

        setEntries(
          [...eventEntries, ...activityEntries, ...taskEntries].sort((a, b) =>
            (a.date + a.time).localeCompare(b.date + b.time),
          ),
        )
      } catch {
        setError('No se ha podido cargar el calendario.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [member])

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  const typeLabel: Record<CalendarEntry['type'], string> = {
    EVENT: 'Evento',
    ACTIVITY: 'Actividad',
    TASK: 'Mi tarea',
  }

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
            <span> · {typeLabel[entry.type]}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
