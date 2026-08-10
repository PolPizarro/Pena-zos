import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Event, EventStatus } from './types'

function eventsCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'events')
}

export async function listEvents(seasonId: string): Promise<Event[]> {
  const snapshot = await getDocs(query(eventsCollection(seasonId), orderBy('date')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Event, 'id'>) }))
}

export interface NewEventInput {
  name: string
  description: string
  date: string
  startTime: string
  endTime: string
  location: string
}

export async function createEvent(seasonId: string, input: NewEventInput, createdBy: string) {
  const ref = doc(eventsCollection(seasonId))
  await setDoc(ref, {
    ...input,
    status: 'DRAFT',
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function setEventStatus(seasonId: string, eventId: string, status: EventStatus) {
  await updateDoc(doc(eventsCollection(seasonId), eventId), { status, updatedAt: serverTimestamp() })
}
