import { useEffect, useState } from 'react'
import type { Season } from '../seasons/types'
import { listVotes } from './pollsService'
import type { Poll } from './types'

export function PollResults({ season, poll }: { season: Season; poll: Poll }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const votes = await listVotes(season.id, poll.id)
        const tally: Record<string, number> = {}
        poll.options.forEach((option) => {
          tally[option] = 0
        })
        votes.forEach((vote) => {
          vote.selectedOptions.forEach((option) => {
            tally[option] = (tally[option] ?? 0) + 1
          })
        })
        setCounts(tally)
        setTotalVotes(votes.length)
      } catch {
        setError('No se han podido cargar los resultados.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll.id])

  if (loading) return <p>Cargando resultados...</p>

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <p>Votos emitidos: {totalVotes}</p>
      <ul>
        {poll.options.map((option) => (
          <li key={option}>
            {option}: {counts[option] ?? 0}
          </li>
        ))}
      </ul>
    </div>
  )
}
