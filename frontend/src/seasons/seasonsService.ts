import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Season } from './types'

export async function listSeasons(): Promise<Season[]> {
  const snapshot = await getDocs(query(collection(db, 'seasons'), orderBy('year', 'desc')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Season, 'id'>) }))
}

export async function getActiveSeason(): Promise<Season | null> {
  const snapshot = await getDocs(query(collection(db, 'seasons'), where('status', '==', 'ACTIVE'), limit(1)))
  const [firstDoc] = snapshot.docs
  return firstDoc ? { id: firstDoc.id, ...(firstDoc.data() as Omit<Season, 'id'>) } : null
}

export interface NewSeasonInput {
  name: string
  year: number
  startDate: string
  endDate: string
}

export async function createSeason(input: NewSeasonInput) {
  const ref = doc(collection(db, 'seasons'))
  await setDoc(ref, {
    ...input,
    status: 'PLANNING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// 14-seasons.md §7: only one season may be ACTIVE at a time. Activating a
// season automatically finishes whichever season was previously active.
export async function activateSeason(seasonId: string) {
  const currentlyActive = await getActiveSeason()
  const batch = writeBatch(db)

  if (currentlyActive && currentlyActive.id !== seasonId) {
    batch.update(doc(db, 'seasons', currentlyActive.id), {
      status: 'FINISHED',
      updatedAt: serverTimestamp(),
    })
  }

  batch.update(doc(db, 'seasons', seasonId), { status: 'ACTIVE', updatedAt: serverTimestamp() })
  await batch.commit()
}

export async function archiveSeason(seasonId: string) {
  await updateDoc(doc(db, 'seasons', seasonId), { status: 'ARCHIVED', updatedAt: serverTimestamp() })
}
