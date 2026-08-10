import { useState, type ChangeEvent } from 'react'
import { importMembers, parseExcelFile, type ImportRowResult } from './importService'

export function ImportMembersPage() {
  const [results, setResults] = useState<ImportRowResult[]>([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setResults([])
    setProcessing(true)
    try {
      const rows = await parseExcelFile(file)
      const importResults = await importMembers(rows)
      setResults(importResults)
    } catch {
      setError('No se ha podido leer el fichero. Comprueba que es un Excel válido.')
    } finally {
      setProcessing(false)
      event.target.value = ''
    }
  }

  return (
    <main>
      <h1>Importar miembros</h1>
      <p>
        Columnas esperadas: <strong>Nombre, Apellidos, Email, DNI, ROL</strong> (varios roles en la
        misma celda, separados por coma).
      </p>
      <p>
        Los miembros existentes se identifican por <strong>DNI</strong> y se actualizan (nombre,
        email, roles). Los nuevos reciben una cuenta con contraseña temporal — apúntala ahora, no se
        volverá a mostrar.
      </p>

      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={processing} />

      {processing && <p>Importando...</p>}
      {error && <p role="alert">{error}</p>}

      {results.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Resultado</th>
              <th>Contraseña temporal</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={`${result.row.dni || result.row.email}-${index}`}>
                <td>
                  {result.row.nombre} {result.row.apellidos}
                </td>
                <td>{result.row.dni}</td>
                <td>
                  {result.status === 'created' && 'Creado'}
                  {result.status === 'updated' && 'Actualizado'}
                  {result.status === 'error' && `Error: ${result.message}`}
                </td>
                <td>{result.temporaryPassword ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}
