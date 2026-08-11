export type PaymentStatus = 'PENDING' | 'PAID' | 'NOT_REQUIRED'

export interface Order {
  id: string
  memberId: string
  productId: string
  quantity: number
  size: string
  paymentStatus: PaymentStatus
}
