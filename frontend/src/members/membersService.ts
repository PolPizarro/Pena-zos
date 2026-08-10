import { collection, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { Member, MemberRole, MemberStatus } from '../auth/types'
import { db } from '../firebase/config'

export async function listMembers(): Promise<Member[]> {
  const snapshot = await getDocs(query(collection(db, 'members'), orderBy('fullName')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Member, 'id'>) }))
}

// 01-users-and-roles.md §7.1 / 17-security-rules.md §6a: only writes
// `roles` (+ updatedAt) so this also works for non-admin, per-role
// self-management, not just ADMIN.
export async function setMemberRoles(memberId: string, roles: MemberRole[]) {
  await updateDoc(doc(db, 'members', memberId), { roles, updatedAt: serverTimestamp() })
}

// ADMIN only, per 01-users-and-roles.md §11.
export async function setMemberStatus(memberId: string, status: MemberStatus) {
  await updateDoc(doc(db, 'members', memberId), { status, updatedAt: serverTimestamp() })
}
