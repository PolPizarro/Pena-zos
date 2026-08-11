import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { listMyOrders } from '../orders/ordersService'
import type { Order } from '../orders/types'
import type { Product } from '../products/types'
import type { Season } from '../seasons/types'
import { addDeliveryItem, getDelivery, listItems, setItemDelivered } from './deliveriesService'
import type { Delivery, DeliveryItem, DeliveryItemType } from './types'

const STANDARD_ITEMS: { type: DeliveryItemType; name: string }[] = [
  { type: 'DRINKS_VOUCHER', name: 'Vale de bebidas' },
  { type: 'DINNER_VOUCHER', name: 'Vale de cena' },
  { type: 'PEÑA_PATCH', name: 'Chapa de la peña' },
  { type: 'SEMPA_VOUCHER', name: 'Vale Interpeñas / SEMPA' },
]

export function MemberDeliveryView({
  season,
  memberId,
  isSelf,
  products,
}: {
  season: Season
  memberId: string
  isSelf: boolean
  products: Product[]
}) {
  const { member } = useAuth()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [items, setItems] = useState<DeliveryItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      setDelivery(await getDelivery(season.id, memberId))
      setItems(await listItems(season.id, memberId))
      if (!isSelf) {
        setOrders(await listMyOrders(season.id, memberId))
      }
    } catch {
      setError('No se ha podido cargar la entrega.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId])

  function productName(productId: string) {
    return products.find((product) => product.id === productId)?.name ?? productId
  }

  async function handleAddStandardItem(item: { type: DeliveryItemType; name: string }) {
    setError(null)
    try {
      await addDeliveryItem(season.id, memberId, { name: item.name, type: item.type, quantity: 1 })
      await refresh()
    } catch {
      setError('No se ha podido añadir el elemento.')
    }
  }

  async function handleAddOrderItem(order: Order) {
    setError(null)
    try {
      await addDeliveryItem(season.id, memberId, {
        name: productName(order.productId),
        type: 'ORDER_PRODUCT',
        quantity: order.quantity,
        relatedOrderId: order.id,
      })
      await refresh()
    } catch {
      setError('No se ha podido añadir el producto del pedido.')
    }
  }

  async function handleToggleDelivered(item: DeliveryItem) {
    if (!member) return
    setError(null)
    try {
      await setItemDelivered(season.id, memberId, item.id, !item.delivered, member.id)
      await refresh()
    } catch {
      setError('No se ha podido actualizar el elemento.')
    }
  }

  if (loading) return <p>Cargando entrega...</p>

  const alreadyAddedTypes = new Set(items.map((item) => item.type))
  const alreadyAddedOrderIds = new Set(items.map((item) => item.relatedOrderId).filter(Boolean))

  return (
    <div>
      {error && <p role="alert">{error}</p>}
      <p>Estado: {delivery?.status ?? 'PENDING'}</p>

      {items.length === 0 && <p>Todavía no hay elementos en esta entrega.</p>}
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.delivered ? '✅' : '❌'} {item.name} × {item.quantity}
            {!isSelf && (
              <button type="button" onClick={() => handleToggleDelivered(item)}>
                {item.delivered ? 'Marcar pendiente' : 'Marcar entregado'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {!isSelf && (
        <>
          <h3>Añadir elementos estándar</h3>
          {STANDARD_ITEMS.filter((standard) => !alreadyAddedTypes.has(standard.type)).map((standard) => (
            <button key={standard.type} type="button" onClick={() => handleAddStandardItem(standard)}>
              + {standard.name}
            </button>
          ))}

          {orders.filter((order) => !alreadyAddedOrderIds.has(order.id)).length > 0 && (
            <>
              <h3>Añadir productos de pedidos</h3>
              {orders
                .filter((order) => !alreadyAddedOrderIds.has(order.id))
                .map((order) => (
                  <button key={order.id} type="button" onClick={() => handleAddOrderItem(order)}>
                    + {productName(order.productId)} × {order.quantity}
                  </button>
                ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
