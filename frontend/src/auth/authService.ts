import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'
import type { Member, UserDocument } from './types'

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export function logout() {
  return signOut(auth)
}

export function requestPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email)
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const snapshot = await getDoc(doc(db, 'users', uid))
  return snapshot.exists() ? (snapshot.data() as UserDocument) : null
}

export async function getMember(memberId: string): Promise<Member | null> {
  const snapshot = await getDoc(doc(db, 'members', memberId))
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Member) : null
}

// 16-authentication.md §9: after a successful password change, clear
// mustChangePassword. The Firestore rule only allows this single field to
// flip from true to false by the user themselves (17-security-rules.md §6).
export async function completePasswordChange(firebaseUser: FirebaseUser, newPassword: string) {
  await updatePassword(firebaseUser, newPassword)
  await updateDoc(doc(db, 'users', firebaseUser.uid), { mustChangePassword: false })
}
