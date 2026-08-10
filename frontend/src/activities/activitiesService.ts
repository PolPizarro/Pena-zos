import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Activity, ActivityRegistration, ActivityStatus } from './types'

function activitiesCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'activities')
}

function registrationsCollection(seasonId: string, activityId: string) {
  return collection(db, 'seasons', seasonId, 'activities', activityId, 'registrations')
}

export async function listActivities(seasonId: string): Promise<Activity[]> {
  const snapshot = await getDocs(query(activitiesCollection(seasonId), orderBy('date')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Activity, 'id'>) }))
}

export interface NewActivityInput {
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
  registrationRequired: boolean
  capacity: number | null
}

export async function createActivity(seasonId: string, input: NewActivityInput, createdBy: string) {
  const ref = doc(activitiesCollection(seasonId))
  await setDoc(ref, {
    ...input,
    status: 'DRAFT',
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function setActivityStatus(seasonId: string, activityId: string, status: ActivityStatus) {
  await updateDoc(doc(activitiesCollection(seasonId), activityId), { status, updatedAt: serverTimestamp() })
}

export async function getMyRegistration(
  seasonId: string,
  activityId: string,
  memberId: string,
): Promise<ActivityRegistration | null> {
  const snapshot = await getDoc(doc(registrationsCollection(seasonId, activityId), memberId))
  return snapshot.exists() ? (snapshot.data() as ActivityRegistration) : null
}

// 06-activities.md §11: prevent registrations above capacity. Checked
// client-side before writing; acceptable at Peña Zos's scale (not
// race-proof, but there is no concurrent-signup scenario in practice).
export async function countActiveRegistrations(seasonId: string, activityId: string): Promise<number> {
  const snapshot = await getCountFromServer(
    query(registrationsCollection(seasonId, activityId), where('status', '==', 'REGISTERED')),
  )
  return snapshot.data().count
}

export async function registerForActivity(seasonId: string, activityId: string, memberId: string) {
  await setDoc(doc(registrationsCollection(seasonId, activityId), memberId), {
    memberId,
    status: 'REGISTERED',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function cancelMyRegistration(seasonId: string, activityId: string, memberId: string) {
  await updateDoc(doc(registrationsCollection(seasonId, activityId), memberId), {
    status: 'CANCELLED',
    updatedAt: serverTimestamp(),
  })
}
