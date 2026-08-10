import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Task, TaskType } from './types'

function tasksCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'tasks')
}

function assignmentsCollection(seasonId: string, taskId: string) {
  return collection(db, 'seasons', seasonId, 'tasks', taskId, 'assignments')
}

export async function listTasks(seasonId: string): Promise<Task[]> {
  const snapshot = await getDocs(query(tasksCollection(seasonId), orderBy('date')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Task, 'id'>) }))
}

// 12-calendar.md §12: members only see tasks assigned to them.
export async function listMyTasks(seasonId: string, memberId: string): Promise<Task[]> {
  const snapshot = await getDocs(
    query(tasksCollection(seasonId), where('assignedMemberIds', 'array-contains', memberId)),
  )
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Task, 'id'>) }))
}

export interface NewTaskInput {
  title: string
  description: string
  date: string
  time: string
  requiredPeople: number
  type: TaskType
}

export async function createTask(seasonId: string, input: NewTaskInput, createdBy: string) {
  const ref = doc(tasksCollection(seasonId))
  await setDoc(ref, {
    ...input,
    status: 'PENDING',
    assignedMemberIds: [],
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function assignMember(seasonId: string, taskId: string, memberId: string) {
  await setDoc(doc(assignmentsCollection(seasonId, taskId), memberId), {
    memberId,
    status: 'ASSIGNED',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  await updateDoc(doc(tasksCollection(seasonId), taskId), {
    assignedMemberIds: arrayUnion(memberId),
    status: 'ASSIGNED',
    updatedAt: serverTimestamp(),
  })
}

export async function removeAssignment(
  seasonId: string,
  taskId: string,
  memberId: string,
  currentAssignedMemberIds: string[],
) {
  await deleteDoc(doc(assignmentsCollection(seasonId, taskId), memberId))
  const remaining = currentAssignedMemberIds.filter((id) => id !== memberId).length
  await updateDoc(doc(tasksCollection(seasonId), taskId), {
    assignedMemberIds: arrayRemove(memberId),
    status: remaining === 0 ? 'PENDING' : 'ASSIGNED',
    updatedAt: serverTimestamp(),
  })
}

export async function completeTask(seasonId: string, taskId: string) {
  await updateDoc(doc(tasksCollection(seasonId), taskId), { status: 'COMPLETED', updatedAt: serverTimestamp() })
}

export async function cancelTask(seasonId: string, taskId: string) {
  await updateDoc(doc(tasksCollection(seasonId), taskId), { status: 'CANCELLED', updatedAt: serverTimestamp() })
}
