import { Timestamp, doc, getDocs, limit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { inventoryCollection } from './inventoryService'

// 09-inventory.md §4: Nombre, Descripcion, Cantidad, Fecha actualizacion.
// New items default to category OTHER, unit UNITS and status AVAILABLE —
// the board refines those manually from the Inventario page afterwards.
export interface ImportInventoryRow {
  name: string
  description: string
  quantity: number
  updatedAtRaw: string
  updatedAt: Date | null
}

export interface ImportInventoryRowResult {
  row: ImportInventoryRow
  status: 'created' | 'updated' | 'error'
  message?: string
}

function cell(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (raw[key] != null && raw[key] !== '') return String(raw[key]).trim()
  }
  return ''
}

function parseDateCell(raw: Record<string, unknown>, ...keys: string[]): { raw: string; date: Date | null } {
  for (const key of keys) {
    const value = raw[key]
    if (value == null || value === '') continue
    if (value instanceof Date) return { raw: value.toISOString(), date: value }
    const text = String(value).trim()
    const parsed = new Date(text)
    return { raw: text, date: Number.isNaN(parsed.getTime()) ? null : parsed }
  }
  return { raw: '', date: null }
}

export async function parseExcelFile(file: File): Promise<ImportInventoryRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const sheet = workbook.Sheets[firstSheetName]
  if (!sheet) return []
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rawRows.map((raw) => {
    const quantityText = cell(raw, 'Cantidad', 'cantidad')
    const { raw: updatedAtRaw, date: updatedAt } = parseDateCell(
      raw,
      'Fecha actualizacion',
      'Fecha actualización',
      'FechaActualizacion',
      'fecha actualizacion',
    )

    return {
      name: cell(raw, 'Nombre', 'nombre'),
      description: cell(raw, 'Descripcion', 'Descripción', 'descripcion', 'descripción'),
      quantity: quantityText === '' ? NaN : Number(quantityText),
      updatedAtRaw,
      updatedAt,
    }
  })
}

async function findInventoryItemIdByName(seasonId: string, name: string): Promise<string | null> {
  const snapshot = await getDocs(query(inventoryCollection(seasonId), where('name', '==', name), limit(1)))
  const [firstDoc] = snapshot.docs
  return firstDoc ? firstDoc.id : null
}

export async function importInventoryItems(
  seasonId: string,
  rows: ImportInventoryRow[],
): Promise<ImportInventoryRowResult[]> {
  const results: ImportInventoryRowResult[] = []

  for (const row of rows) {
    try {
      if (!row.name) {
        results.push({ row, status: 'error', message: 'Falta el nombre del artículo.' })
        continue
      }
      if (Number.isNaN(row.quantity) || row.quantity < 0) {
        results.push({ row, status: 'error', message: `Cantidad no válida: "${row.quantity}".` })
        continue
      }

      const updatedAt = row.updatedAt ? Timestamp.fromDate(row.updatedAt) : serverTimestamp()
      const collectionRef = inventoryCollection(seasonId)
      const existingId = await findInventoryItemIdByName(seasonId, row.name)

      if (existingId) {
        await updateDoc(doc(collectionRef, existingId), {
          description: row.description,
          quantity: row.quantity,
          updatedAt,
        })
        results.push({ row, status: 'updated' })
        continue
      }

      const newRef = doc(collectionRef)
      await setDoc(newRef, {
        name: row.name,
        description: row.description,
        category: 'OTHER',
        quantity: row.quantity,
        unit: 'UNITS',
        status: 'AVAILABLE',
        notes: '',
        createdAt: serverTimestamp(),
        updatedAt,
      })
      results.push({ row, status: 'created' })
    } catch (error) {
      results.push({
        row,
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      })
    }
  }

  return results
}
