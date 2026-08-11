import { useEffect, useState, type FormEvent } from 'react'
import type { Season } from '../seasons/types'
import { castVote, getMyVote } from './pollsService'
import type { Poll } from './types'

export function PollVoteForm({
  season,
  poll,
  memberId,
  onSaved,
}: {
  season: Season
  poll: Poll
  memberId: string
  onSaved: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const existing = await getMyVote(season.id, poll.id, memberId)
      setSelected(existing?.selectedOptions ?? [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id])

  function toggleOption(option: string) {
    if (poll.type === 'SINGLE_CHOICE') {
      setSelected([option])
    } else {
      setSelected((prev) => (prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]))
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (selected.length === 0) {
      setError('Selecciona al menos una opción.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await castVote(season.id, poll.id, memberId, selected)
      onSaved()
    } catch {
      setError('No se ha podido guardar tu voto.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p>Cargando tu voto...</p>

  if (poll.status !== 'PUBLISHED') {
    return selected.length > 0 ? <p>Tu voto: {selected.join(', ')}</p> : <p>No votaste en esta encuesta.</p>
  }

  return (
    <form onSubmit={handleSubmit}>
      {poll.options.map((option) => (
        <label key={option}>
          <input
            type={poll.type === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
            name={`poll-${poll.id}`}
            checked={selected.includes(option)}
            onChange={() => toggleOption(option)}
          />
          {option}
        </label>
      ))}
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={saving}>
        {saving ? 'Guardando...' : selected.length > 0 ? 'Actualizar voto' : 'Votar'}
      </button>
    </form>
  )
}
