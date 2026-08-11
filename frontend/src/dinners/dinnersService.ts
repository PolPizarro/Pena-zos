import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Dinner, DinnerAttendee, DinnerStatus, GuestPaymentStatus } from './types'

function dinnersCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'dinners')
}

function attendeesCollection(seasonId: string, dinnerId: string) {
  return collection(db, 'seasons', seasonId, 'dinners', dinnerId, 'attendees')
}

export async function listDinners(seasonId: string): Promise<Dinner[]> {
  const snapshot = await getDocs(query(dinnersCollection(seasonId), orderBy('date')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Dinner, 'id'>) }))
}

export interface NewDinnerInput {
  name: string
  description: string
  date: string
  time: string
  location: string
  registrationDeadline: string
}

export async function createDinner(seasonId: string, input: NewDinnerInput) {
  const ref = doc(dinnersCollection(seasonId))
  await setDoc(ref, {
    ...input,
    status: 'DRAFT',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function setDinnerStatus(seasonId: string, dinnerId: string, status: DinnerStatus) {
  await updateDoc(doc(dinnersCollection(seasonId), dinnerId), { status, updatedAt: serverTimestamp() })
}

export async function getMyAttendance(
  seasonId: string,
  dinnerId: string,
  memberId: string,
): Promise<DinnerAttendee | null> {
  const snapshot = await getDoc(doc(attendeesCollection(seasonId, dinnerId), memberId))
  return snapshot.exists() ? (snapshot.data() as DinnerAttendee) : null
}

// 04-dinners.md §7: only while OPEN, and only attending/guestCount
// (guestCost/guestPaymentStatus are board-managed, enforced by the rules).
export async function setMyAttendance(
  seasonId: string,
  dinnerId: string,
  memberId: string,
  attending: boolean,
  guestCount: number,
) {
  const ref = doc(attendeesCollection(seasonId, dinnerId), memberId)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { attending, guestCount, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, { memberId, attending, guestCount, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }
}

export async function listAttendees(seasonId: string, dinnerId: string): Promise<DinnerAttendee[]> {
  const snapshot = await getDocs(attendeesCollection(seasonId, dinnerId))
  return snapshot.docs.map((docSnap) => docSnap.data() as DinnerAttendee)
}

export async function setGuestPaymentStatus(
  seasonId: string,
  dinnerId: string,
  memberId: string,
  guestPaymentStatus: GuestPaymentStatus,
  guestCost: number,
) {
  await updateDoc(doc(attendeesCollection(seasonId, dinnerId), memberId), {
    guestPaymentStatus,
    guestCost,
    updatedAt: serverTimestamp(),
  })
}
