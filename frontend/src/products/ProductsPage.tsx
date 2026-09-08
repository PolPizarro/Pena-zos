import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { createProduct, listProducts, setProductActive } from './productsService'
import type { Product } from './types'

// 19-ui-navigation.md §16: Products is its own screen, separate from
// Orders — members can view products (read-only); only board/admin can
// create, modify, or activate/deactivate them (10-orders.md §9).
export function ProductsPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [requiresSize, setRequiresSize] = useState(true)
  const [creating, setCreating] = useState(false)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      setProducts(activeSeason ? await listProducts(activeSeason.id) : [])
    } catch {
      setError('No se ha podido cargar la información.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreateProduct(event: FormEvent) {
    event.preventDefault()
    if (!season) return
    if (!name) {
      setError('Ponle un nombre al producto.')
      return
    }
    const priceValue = Number(price)
    if (!Number.isFinite(priceValue) || priceValue < 0) {
      setError('Ponle un precio válido al producto.')
      return
    }
    setCreating(true)
    setError(null)
    try {
      await createProduct(season.id, { name, description, price: priceValue, requiresSize })
      setName('')
      setDescription('')
      setPrice('')
      setRequiresSize(true)
      await refresh()
    } catch {
      setError('No se ha podido crear el producto.')
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleActive(product: Product) {
    if (!season) return
    setError(null)
    try {
      await setProductActive(season.id, product.id, !product.active)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el producto.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  return (
    <main>
      <h1>Productos — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <form onSubmit={handleCreateProduct}>
          <label>
            Nombre
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            Descripción
            <input value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
          <label>
            Precio (€)
            <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </label>
          <label>
            Requiere talla
            <input type="checkbox" checked={requiresSize} onChange={(event) => setRequiresSize(event.target.checked)} />
          </label>
          <button type="submit" disabled={creating}>
            {creating ? 'Creando...' : 'Crear producto'}
          </button>
        </form>
      )}

      {products.length === 0 && <p>No hay productos.</p>}
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} — {product.price.toFixed(2)} € — {product.active ? 'Activo' : 'Inactivo'}
            {product.description && <> — {product.description}</>}
            {canManage && (
              <button type="button" onClick={() => handleToggleActive(product)}>
                {product.active ? 'Desactivar' : 'Activar'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
