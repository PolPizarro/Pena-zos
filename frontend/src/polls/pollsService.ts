import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Poll, PollStatus, PollType, Vote } from './types'

function pollsCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'polls')
}

function votesCollection(seasonId: string, pollId: string) {
  return collection(db, 'seasons', seasonId, 'polls', pollId, 'votes')
}

export async function listPolls(seasonId: string): Promise<Poll[]> {
  const snapshot = await getDocs(query(pollsCollection(seasonId), orderBy('startDate', 'desc')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Poll, 'id'>) }))
}

export interface NewPollInput {
  title: string
  description: string
  type: PollType
  options: string[]
  startDate: string
  endDate: string
}

export async function createPoll(seasonId: string, input: NewPollInput, createdBy: string) {
  const ref = doc(pollsCollection(seasonId))
  await setDoc(ref, {
    ...input,
    status: 'DRAFT',
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function setPollStatus(seasonId: string, pollId: string, status: PollStatus) {
  await updateDoc(doc(pollsCollection(seasonId), pollId), { status, updatedAt: serverTimestamp() })
}

export async function getMyVote(seasonId: string, pollId: string, memberId: string): Promise<Vote | null> {
  const snapshot = await getDoc(doc(votesCollection(seasonId, pollId), memberId))
  return snapshot.exists() ? (snapshot.data() as Vote) : null
}

// 08-polls.md §8: a member may change their vote while the poll is
// published; the rules enforce that window server-side too.
export async function castVote(seasonId: string, pollId: string, memberId: string, selectedOptions: string[]) {
  const ref = doc(votesCollection(seasonId, pollId), memberId)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { selectedOptions, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, { memberId, selectedOptions, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }
}

export async function listVotes(seasonId: string, pollId: string): Promise<Vote[]> {
  const snapshot = await getDocs(votesCollection(seasonId, pollId))
  return snapshot.docs.map((docSnap) => docSnap.data() as Vote)
}
