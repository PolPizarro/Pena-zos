export type PollType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
export type PollStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'CANCELLED'

export interface Poll {
  id: string
  title: string
  description: string
  type: PollType
  options: string[]
  startDate: string
  endDate: string
  status: PollStatus
}

export interface Vote {
  memberId: string
  selectedOptions: string[]
}
