import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Member } from '../auth/types'
import { getDelivery } from '../deliveries/deliveriesService'
import type { DeliveryStatus } from '../deliveries/types'
import { listMembers } from '../members/membersService'
import { listProducts } from '../products/productsService'
import type { Product } from '../products/types'
import { getActiveSeason, setOrdersOpen } from '../seasons/seasonsService'
import type { Season } from '../seasons/types'
import { SearchableSelect } from '../shared/SearchableSelect'
import { cancelOrder, createOrder, listAllOrders, listMyOrders, listOrderItems, setOrderPaymentStatus } from './ordersService'
import type { NewOrderLineInput } from './ordersService'
import type { Order, OrderItem, PaymentStatus } from './types'

interface DraftLine {
  productId: string
  quantity: number
  size: string
}

type DeliveryFilter = 'NOT_DELIVERED' | 'DELIVERED' | 'ALL'

const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Pendiente',
  PARTIAL: 'Parcial',
  COMPLETED: 'Entregado',
}

export function OrdersPage() {
  const { member } = useAuth()
  const canManage = member?.roles.includes('BOARD') || member?.roles.includes('ADMIN')

  const [season, setSeason] = useState<Season | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})
  const [members, setMembers] = useState<Member[]>([])
  const [deliveryStatusByMember, setDeliveryStatusByMember] = useState<Record<string, DeliveryStatus>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberSearch, setMemberSearch] = useState('')
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('NOT_DELIVERED')

  const [orderProductId, setOrderProductId] = useState('')
  const [orderQuantity, setOrderQuantity] = useState('1')
  const [orderSize, setOrderSize] = useState('')
  const [cart, setCart] = useState<DraftLine[]>([])
  const [submittingOrder, setSubmittingOrder] = useState(false)

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
        setOrderItems({})
        return
      }
      setProducts(await listProducts(activeSeason.id))
      // 17-security-rules.md §13: a member only ever gets their own orders
      // back — Firestore rejects reading anyone else's — so canManage is
      // what actually decides whose orders this loads, not just what's shown.
      const loadedOrders = canManage
        ? await listAllOrders(activeSeason.id)
        : await listMyOrders(activeSeason.id, member.id)
      setOrders(loadedOrders)
      const itemsByOrder: Record<string, OrderItem[]> = {}
      await Promise.all(
        loadedOrders.map(async (order) => {
          itemsByOrder[order.id] = await listOrderItems(activeSeason.id, order.id)
        }),
      )
      setOrderItems(itemsByOrder)
      if (canManage) {
        setMembers(await listMembers())
        // Delivery status lives on the member's Delivery package, not on
        // the Order itself (11-deliveries.md §3) — one package can hold
        // items from several sources, but in practice it's driven by the
        // member's order, so we reuse it here to let the board hide
        // already-delivered orders from this list.
        const distinctMemberIds = [...new Set(loadedOrders.map((order) => order.memberId))]
        const statusEntries = await Promise.all(
          distinctMemberIds.map(async (memberId) => {
            const delivery = await getDelivery(activeSeason.id, memberId)
            return [memberId, delivery?.status ?? 'PENDING'] as const
          }),
        )
        setDeliveryStatusByMember(Object.fromEntries(statusEntries))
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

  function handleAddLine(event: FormEvent) {
    event.preventDefault()
    const product = products.find((candidate) => candidate.id === orderProductId)
    if (!product) {
      setError('Elige un producto.')
      return
    }
    if (product.requiresSize && !orderSize) {
      setError('Este producto necesita talla.')
      return
    }
    setError(null)
    setCart((current) => [...current, { productId: product.id, quantity: Number(orderQuantity) || 1, size: orderSize }])
    setOrderProductId('')
    setOrderQuantity('1')
    setOrderSize('')
  }

  function handleRemoveLine(index: number) {
    setCart((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmitOrder() {
    if (!season || !member || cart.length === 0) return
    setSubmittingOrder(true)
    setError(null)
    try {
      const lines: NewOrderLineInput[] = cart.map((line) => {
        const product = products.find((candidate) => candidate.id === line.productId)
        return { productId: line.productId, quantity: line.quantity, size: line.size, unitPrice: product?.price ?? 0 }
      })
      await createOrder(season.id, member.id, lines)
      setCart([])
      await refresh()
    } catch {
      setError('No se ha podido crear el pedido.')
    } finally {
      setSubmittingOrder(false)
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

  // "Eliminar" is a soft delete: cancelled orders are hidden from the
  // lists below but preserved in Firestore (10-orders.md §4).
  async function handleCancelOrder(orderId: string) {
    if (!season) return
    setError(null)
    try {
      await cancelOrder(season.id, orderId)
      await refresh()
    } catch {
      setError('No se ha podido eliminar el pedido.')
    }
  }

  // 10-orders.md §9a: board/admin can close ordering independently of the
  // season's lifecycle status, e.g. once orders move into delivery prep.
  async function handleToggleOrdersOpen() {
    if (!season) return
    setError(null)
    try {
      await setOrdersOpen(season.id, !season.ordersOpen)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el estado de los pedidos.')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (!season) return <p>No hay ninguna temporada activa.</p>

  const ordersOpen = season.ordersOpen === true
  const canOrder = ordersOpen || canManage
  const activeProducts = products.filter((product) => product.active)
  const selectedProduct = products.find((product) => product.id === orderProductId)
  const visibleOrders = orders.filter((order) => !order.cancelled)
  function deliveryStatusFor(memberId: string): DeliveryStatus {
    return deliveryStatusByMember[memberId] ?? 'PENDING'
  }
  const searchedOrders = canManage
    ? visibleOrders
        .filter((order) => memberName(order.memberId).toLowerCase().includes(memberSearch.trim().toLowerCase()))
        .filter((order) => {
          if (deliveryFilter === 'ALL') return true
          const delivered = deliveryStatusFor(order.memberId) === 'COMPLETED'
          return deliveryFilter === 'DELIVERED' ? delivered : !delivered
        })
    : visibleOrders
  const cartTotal = cart.reduce((sum, line) => sum + (products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity, 0)

  return (
    <main>
      <h1>Pedidos — {season.name}</h1>
      {error && <p role="alert">{error}</p>}

      {canManage && (
        <p>
          Estado: {ordersOpen ? 'Pedidos abiertos' : 'Pedidos cerrados'}{' '}
          <button type="button" onClick={handleToggleOrdersOpen}>
            {ordersOpen ? 'Cerrar pedidos' : 'Abrir pedidos'}
          </button>
        </p>
      )}

      <section>
        <h2>Hacer un pedido</h2>
        {!canOrder ? (
          <p>Los pedidos están cerrados. Contacta con la junta si necesitas hacer algún cambio.</p>
        ) : activeProducts.length === 0 ? (
          <p>No hay productos disponibles.</p>
        ) : (
          <>
            <form onSubmit={handleAddLine}>
              <label>
                Producto
                <SearchableSelect
                  options={activeProducts.map((product) => ({
                    value: product.id,
                    label: `${product.name} (${product.price.toFixed(2)} €)`,
                  }))}
                  value={orderProductId}
                  onChange={setOrderProductId}
                  placeholder="Busca un producto..."
                />
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
              <button type="submit">Añadir al pedido</button>
            </form>

            {cart.length > 0 && (
              <>
                <ul>
                  {cart.map((line, index) => (
                    <li key={index}>
                      {productNameFor(line.productId)} × {line.quantity} {line.size && `(talla ${line.size})`} —{' '}
                      {((products.find((p) => p.id === line.productId)?.price ?? 0) * line.quantity).toFixed(2)} €
                      <button type="button" onClick={() => handleRemoveLine(index)}>
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
                <p>Total: {cartTotal.toFixed(2)} €</p>
                <button type="button" onClick={handleSubmitOrder} disabled={submittingOrder}>
                  {submittingOrder ? 'Enviando...' : 'Confirmar pedido'}
                </button>
              </>
            )}
          </>
        )}
      </section>

      <section>
        <h2>{canManage ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
        {canManage && (
          <>
            <label>
              Buscar por nombre
              <input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Busca un socio..."
              />
            </label>
            <label>
              Estado de entrega
              <select value={deliveryFilter} onChange={(event) => setDeliveryFilter(event.target.value as DeliveryFilter)}>
                <option value="NOT_DELIVERED">No entregados</option>
                <option value="DELIVERED">Entregados</option>
                <option value="ALL">Todos los estados</option>
              </select>
            </label>
          </>
        )}
        {searchedOrders.length === 0 && <p>No hay pedidos.</p>}
        <table>
          <thead>
            <tr>
              {canManage && <th>Miembro</th>}
              <th>Productos</th>
              <th>Total</th>
              <th>Pago</th>
              {canManage && <th>Entrega</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {searchedOrders.map((order) => (
              <tr key={order.id}>
                {canManage && <td>{memberName(order.memberId)}</td>}
                <td>
                  <ul>
                    {(orderItems[order.id] ?? []).map((item) => (
                      <li key={item.id}>
                        {productNameFor(item.productId)} × {item.quantity} {item.size && `(talla ${item.size})`}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{order.totalCost.toFixed(2)} €</td>
                <td>{order.paymentStatus}</td>
                {canManage && <td>{DELIVERY_STATUS_LABELS[deliveryStatusFor(order.memberId)]}</td>}
                <td>
                  {canManage && (
                    <>
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
                    </>
                  )}
                  {(canManage || order.paymentStatus === 'PENDING') && (
                    <button type="button" onClick={() => handleCancelOrder(order.id)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
