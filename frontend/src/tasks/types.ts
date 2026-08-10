export type TaskStatus = 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'

export type TaskType =
  | 'FOOD_SERVICE'
  | 'FOOD_COLLECTION'
  | 'MOJITO_SERVICE'
  | 'SUPPLY_PICKUP'
  | 'SUPPLIER_CONTACT'
  | 'PREPARATION'
  | 'OTHER'

export interface Task {
  id: string
  title: string
  description: string
  date: string
  time: string
  requiredPeople: number
  status: TaskStatus
  type: TaskType
  assignedMemberIds: string[]
}

export type AssignmentStatus = 'ASSIGNED' | 'COMPLETED'

export interface TaskAssignment {
  memberId: string
  status: AssignmentStatus
}
