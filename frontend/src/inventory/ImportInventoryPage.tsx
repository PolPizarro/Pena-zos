import { useEffect, useState, type ChangeEvent } from 'react'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { importInventoryItems, parseExcelFile, type ImportInventoryRowResult } from './importService'

export function ImportInventoryPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [loadingSeason, setLoadingSeason] = useState(true)
  const [results, setResults] = useState<ImportInventoryRowResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getActiveSeason()
      .then(setSeason)
      .catch(() => setError('No se ha podido cargar la temporada activa.'))
      .finally(() => setLoadingSeason(false))
  }, [])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !season) return

    setError(null)
    setResults([])
    setProcessing(true)
    try {
      const rows = await parseExcelFile(file)
      const importResults = await importInventoryItems(season.id, rows)
      setResults(importResults)
    } catch {
      setError('No se ha podido leer el fichero. Comprueba que es un Excel válido.')
    } finally {
      setProcessing(false)
      event.target.value = ''
    }
  }

  if (loadingSeason) return <p>Cargando...</p>

  return (
    <main>
      <h1>Importar inventario</h1>
      <p>
        Columnas esperadas: <strong>Nombre, Descripcion, Cantidad, Fecha actualizacion</strong>.
      </p>
      <p>
        Los artículos existentes se identifican por <strong>Nombre</strong> (dentro de la temporada activa) y
        se actualizan (descripción, cantidad, fecha de actualización). Los artículos nuevos se crean con
        categoría "OTHER", unidad "UNITS" y estado "AVAILABLE" — edítalos después desde Inventario si hace
        falta otra categoría o unidad.
      </p>

      {!season && <p role="alert">No hay ninguna temporada activa.</p>}

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={processing || !season} />

      {processing && <p>Importando...</p>}
      {error && <p role="alert">{error}</p>}

      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={`${result.row.name}-${index}`}>
                <td>{result.row.name}</td>
                <td>{result.row.quantity}</td>
                <td>
                  {result.status === 'created' && 'Creado'}
                  {result.status === 'updated' && 'Actualizado'}
                  {result.status === 'error' && `Error: ${result.message}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
