import { useEffect, useState, type FormEvent } from 'react'
import { SearchableSelect } from '../shared/SearchableSelect'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { createInventoryItem, listInventoryItems, updateInventoryItem } from './inventoryService'
import type { InventoryCategory, InventoryItem, InventoryStatus, InventoryUnit } from './types'

const CATEGORIES: InventoryCategory[] = ['DRINKS', 'FOOD', 'DECORATION', 'EQUIPMENT', 'SUPPLIES', 'OTHER']
const UNITS: InventoryUnit[] = ['UNITS', 'BOXES', 'BOTTLES', 'LITERS', 'KILOGRAMS', 'PACKS', 'OTHER']
// DISCARDED is not offered as a manual status choice — it's the terminal
// "deleted" state, set only through the "Eliminar" button below.
const EDITABLE_STATUSES: InventoryStatus[] = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK']

function toOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }))
}

export function InventoryPage() {
  const [season, setSeason] = useState<Season | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<InventoryCategory>('OTHER')
  const [quantity, setQuantity] = useState('0')
  const [unit, setUnit] = useState<InventoryUnit>('UNITS')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      setItems(activeSeason ? await listInventoryItems(activeSeason.id) : [])
    } catch {
      setError('No se ha podido cargar el inventario.')
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
    if (!season) return
    if (!name) {
      setError('Ponle un nombre al artículo.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createInventoryItem(season.id, {
        name,
        description,
        category,
        quantity: Number(quantity) || 0,
        unit,
        notes,
      })
      setName('')
      setDescription('')
      setCategory('OTHER')
      setQuantity('0')
      setUnit('UNITS')
      setNotes('')
      await refresh()
    } catch {
      setError('No se ha podido crear el artículo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQuantityChange(item: InventoryItem, quantity: number) {
    if (!season) return
    setError(null)
    try {
      await updateInventoryItem(season.id, item.id, { quantity })
      await refresh()
    } catch {
      setError('No se ha podido actualizar la cantidad.')
    }
  }

  async function handleStatusChange(item: InventoryItem, status: InventoryStatus) {
    if (!season) return
    setError(null)
    try {
      await updateInventoryItem(season.id, item.id, { status })
      await refresh()
    } catch {
      setError('No se ha podido actualizar el estado.')
    }
  }

  // "Eliminar" is a soft delete: the item is marked DISCARDED (already an
  // existing status, 09-inventory.md §8) and hidden below, but preserved
  // in Firestore (02-data-model.md §23).
  async function handleDelete(item: InventoryItem) {
    await handleStatusChange(item, 'DISCARDED')
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  const visibleItems = items.filter((item) => item.status !== 'DISCARDED')

  return (
    <main>
      <h1>Inventario — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleCreate}>
        <h2>Nuevo artículo</h2>
        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          Descripción
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Categoría
          <SearchableSelect
            options={toOptions(CATEGORIES)}
            value={category}
            onChange={(value) => setCategory(value as InventoryCategory)}
            placeholder="Elige una categoría..."
          />
        </label>
        <label>
          Cantidad
          <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label>
          Unidad
          <SearchableSelect
            options={toOptions(UNITS)}
            value={unit}
            onChange={(value) => setUnit(value as InventoryUnit)}
            placeholder="Elige una unidad..."
          />
        </label>
        <label>
          Notas
          <input value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear artículo'}
        </button>
      </form>

      {visibleItems.length === 0 && <p>No hay artículos en el inventario.</p>}

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Unidad</th>
            <th>Estado</th>
            <th>Notas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={item.quantity}
                  onBlur={(event) => {
                    const value = Number(event.target.value)
                    if (value !== item.quantity) handleQuantityChange(item, value)
                  }}
                />
              </td>
              <td>{item.unit}</td>
              <td>
                <SearchableSelect
                  options={toOptions(EDITABLE_STATUSES)}
                  value={item.status}
                  onChange={(value) => handleStatusChange(item, value as InventoryStatus)}
                  placeholder="Elige un estado..."
                />
              </td>
              <td>{item.notes}</td>
              <td>
                <button type="button" onClick={() => handleDelete(item)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
