import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member } from '../auth/types'
import { listMembers } from '../members/membersService'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { SearchableSelect } from '../shared/SearchableSelect'
import {
  assignMember,
  cancelTask,
  completeTask,
  createTask,
  listMyTasks,
  listTasks,
  removeAssignment,
} from './tasksService'
import type { Task, TaskType } from './types'

const TASK_TYPES: TaskType[] = [
  'FOOD_SERVICE',
  'FOOD_COLLECTION',
  'MOJITO_SERVICE',
  'SUPPLY_PICKUP',
  'SUPPLIER_CONTACT',
  'PREPARATION',
  'OTHER',
]

export function TasksPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [requiredPeople, setRequiredPeople] = useState('1')
  const [type, setType] = useState<TaskType>('OTHER')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    if (!member) return
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      if (!activeSeason) {
        setTasks([])
        return
      }
      setTasks(canManage ? await listTasks(activeSeason.id) : await listMyTasks(activeSeason.id, member.id))
      if (canManage) {
        setMembers(await listMembers())
      }
    } catch {
      setError('No se han podido cargar las tareas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id])

  function memberName(memberId: string) {
    return members.find((candidate) => candidate.id === memberId)?.fullName ?? memberId
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    if (!season || !member) return
    if (!title || !date) {
      setError('Rellena al menos el título y la fecha.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createTask(
        season.id,
        { title, description, date, time, requiredPeople: Number(requiredPeople) || 1, type },
        member.id,
      )
      setTitle('')
      setDescription('')
      setDate('')
      setTime('')
      setRequiredPeople('1')
      setType('OTHER')
      await refresh()
    } catch {
      setError('No se ha podido crear la tarea.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAssign(task: Task, memberId: string) {
    if (!season || !memberId) return
    setError(null)
    try {
      await assignMember(season.id, task.id, memberId)
      await refresh()
    } catch {
      setError('No se ha podido asignar el miembro.')
    }
  }

  async function handleRemoveAssignment(task: Task, memberId: string) {
    if (!season) return
    setError(null)
    try {
      await removeAssignment(season.id, task.id, memberId, task.assignedMemberIds)
      await refresh()
    } catch {
      setError('No se ha podido quitar la asignación.')
    }
  }

  async function handleComplete(taskId: string) {
    if (!season) return
    setError(null)
    try {
      await completeTask(season.id, taskId)
      await refresh()
    } catch {
      setError('No se ha podido completar la tarea.')
    }
  }

  // "Eliminar" is a soft delete: the task is marked CANCELLED (05-tasks.md
  // already defines this status) and hidden from the lists below, but the
  // record is preserved in Firestore per 02-data-model.md §23.
  async function handleDelete(taskId: string) {
    if (!season) return
    setError(null)
    try {
      await cancelTask(season.id, taskId)
      await refresh()
    } catch {
      setError('No se ha podido eliminar la tarea.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  const visibleTasks = tasks.filter((task) => task.status !== 'CANCELLED')

  return (
    <main>
      <h1>Tareas — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreate}>
          <h2>Nueva tarea</h2>
          <label>
            Título
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
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
            Personas necesarias
            <input
              type="number"
              min="1"
              value={requiredPeople}
              onChange={(event) => setRequiredPeople(event.target.value)}
            />
          </label>
          <label>
            Tipo
            <SearchableSelect
              options={TASK_TYPES.map((taskType) => ({ value: taskType, label: taskType }))}
              value={type}
              onChange={(value) => setType(value as TaskType)}
              placeholder="Elige un tipo..."
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear tarea'}
          </button>
        </form>
      )}

      {visibleTasks.length === 0 && <p>{canManage ? 'No hay tareas.' : 'No tienes tareas asignadas.'}</p>}

      <ul>
        {visibleTasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong> — {task.date} {task.time} ({task.type})
            {task.description && <p>{task.description}</p>}
            <p>
              Estado: {task.status} · Asignados: {task.assignedMemberIds.length}/{task.requiredPeople}
            </p>
            <p>
              {task.assignedMemberIds.length === 0
                ? 'Nadie asignado todavía.'
                : task.assignedMemberIds.map((memberId) => memberName(memberId)).join(', ')}
            </p>

            {canManage && task.status !== 'COMPLETED' && (
              <>
                <SearchableSelect
                  options={members
                    .filter((candidate) => !task.assignedMemberIds.includes(candidate.id))
                    .map((candidate) => ({ value: candidate.id, label: candidate.fullName }))}
                  value=""
                  onChange={(memberId) => handleAssign(task, memberId)}
                  placeholder="Asignar miembro..."
                />

                {task.assignedMemberIds.map((memberId) => (
                  <button key={memberId} type="button" onClick={() => handleRemoveAssignment(task, memberId)}>
                    Quitar a {memberName(memberId)}
                  </button>
                ))}

                <button type="button" onClick={() => handleComplete(task.id)}>
                  Marcar completada
                </button>
                <button type="button" onClick={() => handleDelete(task.id)}>
                  Eliminar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
