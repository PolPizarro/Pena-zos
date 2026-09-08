import { useEffect, useState, type ChangeEvent } from 'react'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { importOrders, parseExcelFile, type ImportOrderRowResult } from './importService'

export function ImportOrdersPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [loadingSeason, setLoadingSeason] = useState(true)
  const [results, setResults] = useState<ImportOrderRowResult[]>([])
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
      const importResults = await importOrders(season.id, rows)
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
      <h1>Importar pedidos</h1>
      <p>
        Columnas esperadas: <strong>Email, Producto, Talla, Cantidad</strong>.
      </p>
      <p>
        Cada fila es un producto. Las filas con el mismo <strong>Email</strong> forman un único pedido para ese
        socio. <strong>Producto</strong> debe coincidir con el nombre de un producto activo de la temporada.{' '}
        <strong>Talla</strong> solo es obligatoria si el producto la requiere.
      </p>
      <p>
        Si un socio ya tiene un pedido pendiente creado por una importación anterior, sus productos se
        sustituyen por los de este fichero (útil para corregir errores). Si su pedido anterior ya está pagado,
        se crea uno nuevo aparte.
      </p>

      {!season && <p role="alert">No hay ninguna temporada activa.</p>}

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={processing || !season} />

      {processing && <p>Importando...</p>}
      {error && <p role="alert">{error}</p>}

      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Producto</th>
              <th>Talla</th>
              <th>Cantidad</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={`${result.row.email}-${result.row.productName}-${index}`}>
                <td>{result.row.email}</td>
                <td>{result.row.productName}</td>
                <td>{result.row.size || '—'}</td>
                <td>{result.row.quantityText}</td>
                <td>
                  {result.status === 'created' && 'Pedido creado'}
                  {result.status === 'updated' && 'Pedido actualizado'}
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
