export type MemberRole = 'MEMBER' | 'BOARD' | 'TREASURER' | 'ADMIN'

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_ACCESS'

export interface UserDocument {
  firebaseUid: string
  memberId: string
  email: string
  mustChangePassword: boolean
}

export interface Member {
  id: string
  fullName: string
  email: string
  phone?: string
  dni: string
  roles: MemberRole[]
  status: MemberStatus
}
