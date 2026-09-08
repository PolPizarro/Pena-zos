export type PaymentStatus = 'PENDING' | 'PAID' | 'NOT_REQUIRED'
export type OrderSource = 'MEMBER' | 'IMPORT'

export interface Order {
  id: string
  memberId: string
  source: OrderSource
  totalCost: number
  paymentStatus: PaymentStatus
  cancelled: boolean
}

export interface OrderItem {
  id: string
  orderId: string
  memberId: string
  productId: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
}
