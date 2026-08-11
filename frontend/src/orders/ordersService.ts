import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Order, PaymentStatus } from './types'

function ordersCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'orders')
}

export async function listMyOrders(seasonId: string, memberId: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollection(seasonId), where('memberId', '==', memberId)))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) }))
}

export async function listAllOrders(seasonId: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollection(seasonId), orderBy('createdAt')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) }))
}

export interface NewOrderInput {
  productId: string
  quantity: number
  size: string
}

export async function createOrder(seasonId: string, memberId: string, input: NewOrderInput) {
  const ref = doc(ordersCollection(seasonId))
  await setDoc(ref, {
    memberId,
    ...input,
    paymentStatus: 'PENDING',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// Board-only, per 10-orders.md §9 / 17-security-rules.md §13.
export async function setOrderPaymentStatus(seasonId: string, orderId: string, paymentStatus: PaymentStatus) {
  await updateDoc(doc(ordersCollection(seasonId), orderId), { paymentStatus, updatedAt: serverTimestamp() })
}
