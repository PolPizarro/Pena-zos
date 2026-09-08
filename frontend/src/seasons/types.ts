export type SeasonStatus = 'PLANNING' | 'ACTIVE' | 'FINISHED' | 'ARCHIVED'

export interface Season {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  status: SeasonStatus
  ordersOpen: boolean
}
