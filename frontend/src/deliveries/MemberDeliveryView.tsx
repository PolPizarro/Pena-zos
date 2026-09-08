import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { listMyOrders, listOrderItems } from '../orders/ordersService'
import type { OrderItem } from '../orders/types'
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
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      setDelivery(await getDelivery(season.id, memberId))
      setItems(await listItems(season.id, memberId))
      if (!isSelf) {
        const orders = await listMyOrders(season.id, memberId)
        const itemsPerOrder = await Promise.all(orders.map((order) => listOrderItems(season.id, order.id)))
        setOrderItems(itemsPerOrder.flat())
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

  async function handleAddOrderItem(orderItem: OrderItem) {
    setError(null)
    try {
      await addDeliveryItem(season.id, memberId, {
        name: productName(orderItem.productId),
        type: 'ORDER_PRODUCT',
        quantity: orderItem.quantity,
        relatedOrderItemId: orderItem.id,
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
  const alreadyAddedOrderItemIds = new Set(items.map((item) => item.relatedOrderItemId).filter(Boolean))

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

          {orderItems.filter((orderItem) => !alreadyAddedOrderItemIds.has(orderItem.id)).length > 0 && (
            <>
              <h3>Añadir productos de pedidos</h3>
              {orderItems
                .filter((orderItem) => !alreadyAddedOrderItemIds.has(orderItem.id))
                .map((orderItem) => (
                  <button key={orderItem.id} type="button" onClick={() => handleAddOrderItem(orderItem)}>
                    + {productName(orderItem.productId)} × {orderItem.quantity}
                  </button>
                ))}
            </>
          )}
        </>
      )}
    </div>
  )
}
