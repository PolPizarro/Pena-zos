import { useEffect, useState, type FormEvent } from 'react'
import { activateSeason, archiveSeason, createSeason, listSeasons } from './seasonsService'
import type { Season } from './types'

export function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      setSeasons(await listSeasons())
    } catch {
      setError('No se han podido cargar las temporadas.')
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
    setError(null)
    if (!name || !year || !startDate || !endDate) {
      setError('Rellena todos los campos.')
      return
    }

    setSubmitting(true)
    try {
      await createSeason({ name, year: Number(year), startDate, endDate })
      setName('')
      setYear('')
      setStartDate('')
      setEndDate('')
      await refresh()
    } catch {
      setError('No se ha podido crear la temporada.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleActivate(seasonId: string) {
    setError(null)
    try {
      await activateSeason(seasonId)
      await refresh()
    } catch {
      setError('No se ha podido activar la temporada.')
    }
  }

  async function handleArchive(seasonId: string) {
    setError(null)
    try {
      await archiveSeason(seasonId)
      await refresh()
    } catch {
      setError('No se ha podido archivar la temporada.')
    }
  }

  return (
    <main>
      <h1>Temporadas</h1>

      <form onSubmit={handleCreate}>
        <h2>Nueva temporada</h2>
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Año
          <input type="number" value={year} onChange={(event) => setYear(event.target.value)} required />
        </label>
        <label>
          Fecha de inicio
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>
        <label>
          Fecha de fin
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear temporada'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Año</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((season) => (
              <tr key={season.id}>
                <td>{season.name}</td>
                <td>{season.year}</td>
                <td>{season.startDate}</td>
                <td>{season.endDate}</td>
                <td>{season.status}</td>
                <td>
                  {season.status === 'PLANNING' && (
                    <button type="button" onClick={() => handleActivate(season.id)}>
                      Activar
                    </button>
                  )}
                  {season.status === 'FINISHED' && (
                    <button type="button" onClick={() => handleArchive(season.id)}>
                      Archivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
