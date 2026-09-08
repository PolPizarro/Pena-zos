import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { SearchableSelect } from '../shared/SearchableSelect'
import { PollResults } from './PollResults'
import { PollVoteForm } from './PollVoteForm'
import { createPoll, listPolls, setPollStatus } from './pollsService'
import type { Poll, PollStatus, PollType } from './types'

const POLL_TYPE_OPTIONS: { value: PollType; label: string }[] = [
  { value: 'SINGLE_CHOICE', label: 'Una opción' },
  { value: 'MULTIPLE_CHOICE', label: 'Varias opciones' },
]

export function PollsPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [expandedPollId, setExpandedPollId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PollType>('SINGLE_CHOICE')
  const [optionsText, setOptionsText] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      setPolls(activeSeason ? await listPolls(activeSeason.id) : [])
    } catch {
      setError('No se han podido cargar las encuestas.')
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
    if (!season || !member) return

    const options = optionsText
      .split('\n')
      .map((option) => option.trim())
      .filter(Boolean)

    if (!title || options.length < 2) {
      setError('Rellena el título y al menos dos opciones (una por línea).')
      return
    }
    if (new Set(options).size !== options.length) {
      setError('Las opciones no pueden repetirse.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await createPoll(season.id, { title, description, type, options, startDate, endDate }, member.id)
      setTitle('')
      setDescription('')
      setType('SINGLE_CHOICE')
      setOptionsText('')
      setStartDate('')
      setEndDate('')
      await refresh()
    } catch {
      setError('No se ha podido crear la encuesta.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(pollId: string, status: PollStatus) {
    if (!season) return
    setError(null)
    try {
      await setPollStatus(season.id, pollId, status)
      await refresh()
    } catch {
      setError('No se ha podido actualizar la encuesta.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  // "Eliminar" is a soft delete: the poll is marked CANCELLED and hidden
  // here, but preserved in Firestore (02-data-model.md §23).
  const visiblePolls = polls.filter((poll) => poll.status !== 'CANCELLED')

  return (
    <main>
      <h1>Encuestas — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreate}>
          <h2>Nueva encuesta</h2>
          <label>
            Título
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label>
            Descripción
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Tipo
            <SearchableSelect
              options={POLL_TYPE_OPTIONS}
              value={type}
              onChange={(value) => setType(value as PollType)}
              placeholder="Elige un tipo..."
            />
          </label>
          <label>
            Opciones (una por línea)
            <textarea value={optionsText} onChange={(event) => setOptionsText(event.target.value)} rows={4} />
          </label>
          <label>
            Fecha de inicio
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label>
            Fecha de fin
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear encuesta (borrador)'}
          </button>
        </form>
      )}

      {visiblePolls.length === 0 && <p>No hay encuestas.</p>}

      <ul>
        {visiblePolls.map((poll) => (
          <li key={poll.id}>
            <strong>{poll.title}</strong> ({poll.type === 'SINGLE_CHOICE' ? 'una opción' : 'varias opciones'})
            {poll.description && <p>{poll.description}</p>}
            <p>Estado: {poll.status}</p>

            {member && <PollVoteForm season={season} poll={poll} memberId={member.id} onSaved={refresh} />}

            {canManage && (
              <>
                {poll.status === 'DRAFT' && (
                  <button type="button" onClick={() => handleStatusChange(poll.id, 'PUBLISHED')}>
                    Publicar
                  </button>
                )}
                {poll.status === 'PUBLISHED' && (
                  <button type="button" onClick={() => handleStatusChange(poll.id, 'CLOSED')}>
                    Cerrar votación
                  </button>
                )}
                {poll.status !== 'CLOSED' && (
                  <button type="button" onClick={() => handleStatusChange(poll.id, 'CANCELLED')}>
                    Eliminar
                  </button>
                )}

                <button type="button" onClick={() => setExpandedPollId(expandedPollId === poll.id ? null : poll.id)}>
                  {expandedPollId === poll.id ? 'Ocultar resultados' : 'Ver resultados'}
                </button>

                {expandedPollId === poll.id && <PollResults season={season} poll={poll} />}
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
