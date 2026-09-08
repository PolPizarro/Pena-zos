export type DeliveryStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED'

export interface Delivery {
  memberId: string
  status: DeliveryStatus
  deliveredAt: string | null
  deliveredBy: string | null
}

export type DeliveryItemType = 'DRINKS_VOUCHER' | 'DINNER_VOUCHER' | 'PEÑA_PATCH' | 'SEMPA_VOUCHER' | 'ORDER_PRODUCT' | 'OTHER'

export interface DeliveryItem {
  id: string
  name: string
  type: DeliveryItemType
  quantity: number
  delivered: boolean
  relatedOrderItemId: string | null
}
