export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'

export interface Event {
  id: string
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: EventStatus
}
