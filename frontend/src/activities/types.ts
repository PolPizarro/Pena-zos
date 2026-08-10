export type ActivityStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Activity {
  id: string
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  registrationRequired: boolean
  capacity: number | null
  status: ActivityStatus
}

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED' | 'ATTENDED'

export interface ActivityRegistration {
  memberId: string
  status: RegistrationStatus
}
