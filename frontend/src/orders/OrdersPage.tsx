import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member } from '../auth/types'
import { listMembers } from '../members/membersService'
import { createProduct, listProducts, setProductActive } from '../products/productsService'
import type { Product } from '../products/types'
import { getActiveSeason } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { createOrder, listAllOrders, listMyOrders, setOrderPaymentStatus } from './ordersService'
import type { Order, PaymentStatus } from './types'

export function OrdersPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [productName, setProductName] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [productRequiresSize, setProductRequiresSize] = useState(true)
  const [creatingProduct, setCreatingProduct] = useState(false)

  const [orderProductId, setOrderProductId] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('1')
  const [orderSize, setOrderSize] = useState('')
  const [creatingOrder, setCreatingOrder] = useState(false)

  async function refresh() {
    if (!member) return
    setLoading(true)
    setError(null)
    try {
      const activeSeason = await getActiveSeason()
      setSeason(activeSeason)
      if (!activeSeason) {
        setProducts([])
        setOrders([])
        return
      }
      setProducts(await listProducts(activeSeason.id))
      setOrders(canManage ? await listAllOrders(activeSeason.id) : await listMyOrders(activeSeason.id, member.id))
      if (canManage) {
        setMembers(await listMembers())
      }
    } catch {
      setError('No se ha podido cargar la información.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.id])

  function memberName(memberId: string) {
    return members.find((candidate) => candidate.id === memberId)?.fullName ?? memberId
  }

  function productNameFor(productId: string) {
    return products.find((candidate) => candidate.id === productId)?.name ?? productId
  }

  async function handleCreateProduct(event: FormEvent) {
    event.preventDefault()
    if (!season) return
    if (!productName) {
      setError('Ponle un nombre al producto.')
      return
    }
    setCreatingProduct(true)
    setError(null)
    try {
      await createProduct(season.id, {
        name: productName,
        description: productDescription,
        requiresSize: productRequiresSize,
      })
      setProductName('')
      setProductDescription('')
      setProductRequiresSize(true)
      await refresh()
    } catch {
      setError('No se ha podido crear el producto.')
    } finally {
      setCreatingProduct(false)
    }
  }

  async function handleToggleProductActive(product: Product) {
    if (!season) return
    setError(null)
    try {
      await setProductActive(season.id, product.id, !product.active)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el producto.')
    }
  }

  async function handleCreateOrder(event: FormEvent) {
    event.preventDefault()
    if (!season || !member) return
    const product = products.find((candidate) => candidate.id === orderProductId)
    if (!product) {
      setError('Elige un producto.')
      return
    }
    if (product.requiresSize && !orderSize) {
      setError('Este producto necesita talla.')
      return
    }
    setCreatingOrder(true)
    setError(null)
    try {
      await createOrder(season.id, member.id, {
        productId: product.id,
        quantity: Number(orderQuantity) || 1,
        size: orderSize,
      })
      setOrderProductId('')
      setOrderQuantity('1')
      setOrderSize('')
      await refresh()
    } catch {
      setError('No se ha podido crear el pedido.')
    } finally {
      setCreatingOrder(false)
    }
  }

  async function handlePaymentStatusChange(orderId: string, paymentStatus: PaymentStatus) {
    if (!season) return
    setError(null)
    try {
      await setOrderPaymentStatus(season.id, orderId, paymentStatus)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el pago.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  const activeProducts = products.filter((product) => product.active)
  const selectedProduct = products.find((product) => product.id === orderProductId)

  return (
    <main>
      <h1>Pedidos — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <section>
          <h2>Productos</h2>
          <form onSubmit={handleCreateProduct}>
            <label>
              Nombre
              <input value={productName} onChange={(event) => setProductName(event.target.value)} required />
            </label>
            <label>
              Descripción
              <input value={productDescription} onChange={(event) => setProductDescription(event.target.value)} />
            </label>
            <label>
              Requiere talla
              <input
                type="checkbox"
                checked={productRequiresSize}
                onChange={(event) => setProductRequiresSize(event.target.checked)}
              />
            </label>
            <button type="submit" disabled={creatingProduct}>
              {creatingProduct ? 'Creando...' : 'Crear producto'}
            </button>
          </form>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                {product.name} — {product.active ? 'Activo' : 'Inactivo'}
                <button type="button" onClick={() => handleToggleProductActive(product)}>
                  {product.active ? 'Desactivar' : 'Activar'}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2>Hacer un pedido</h2>
        {activeProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <form onSubmit={handleCreateOrder}>
            <label>
              Producto
              <select value={orderProductId} onChange={(event) => setOrderProductId(event.target.value)}>
                <option value="">Selecciona...</option>
                {activeProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cantidad
              <input
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(event) => setOrderQuantity(event.target.value)}
              />
            </label>
            {selectedProduct?.requiresSize && (
              <label>
                Talla
                <input value={orderSize} onChange={(event) => setOrderSize(event.target.value)} />
              </label>
            )}
            <button type="submit" disabled={creatingOrder}>
              {creatingOrder ? 'Enviando...' : 'Pedir'}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2>{canManage ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
        {orders.length === 0 && <p>No hay pedidos.</p>}
        <table>
          <thead>
            <tr>
              {canManage && <th>Miembro</th>}
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Talla</th>
              <th>Pago</th>
              {canManage && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                {canManage && <td>{memberName(order.memberId)}</td>}
                <td>{productNameFor(order.productId)}</td>
                <td>{order.quantity}</td>
                <td>{order.size || '—'}</td>
                <td>{order.paymentStatus}</td>
                {canManage && (
                  <td>
                    {order.paymentStatus !== 'PAID' && (
                      <button type="button" onClick={() => handlePaymentStatusChange(order.id, 'PAID')}>
                        Marcar pagado
                      </button>
                    )}
                    {order.paymentStatus === 'PENDING' && (
                      <button type="button" onClick={() => handlePaymentStatusChange(order.id, 'NOT_REQUIRED')}>
                        Sin pago requerido
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
