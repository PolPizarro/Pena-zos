export type DinnerStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED'

export interface Dinner {
  id: string
  name: string
  description: string
  date: string
  time: string
  location: string
  registrationDeadline: string
  status: DinnerStatus
}

export type GuestPaymentStatus = 'PENDING' | 'PAID' | 'NOT_REQUIRED'

export interface DinnerAttendee {
  memberId: string
  attending: boolean
  guestCount: number
  guestCost: number | null
  guestPaymentStatus: GuestPaymentStatus | null
}
