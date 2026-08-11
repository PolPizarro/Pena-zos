import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Delivery, DeliveryItem, DeliveryItemType } from './types'

function deliveriesCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'deliveries')
}

function itemsCollection(seasonId: string, memberId: string) {
  return collection(db, 'seasons', seasonId, 'deliveries', memberId, 'items')
}

export async function getDelivery(seasonId: string, memberId: string): Promise<Delivery | null> {
  const snapshot = await getDoc(doc(deliveriesCollection(seasonId), memberId))
  return snapshot.exists() ? (snapshot.data() as Delivery) : null
}

export async function listItems(seasonId: string, memberId: string): Promise<DeliveryItem[]> {
  const snapshot = await getDocs(itemsCollection(seasonId, memberId))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<DeliveryItem, 'id'>) }))
}

async function ensureDelivery(seasonId: string, memberId: string) {
  const ref = doc(deliveriesCollection(seasonId), memberId)
  const existing = await getDoc(ref)
  if (!existing.exists()) {
    await setDoc(ref, {
      memberId,
      status: 'PENDING',
      deliveredAt: null,
      deliveredBy: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}

export async function addDeliveryItem(
  seasonId: string,
  memberId: string,
  input: { name: string; type: DeliveryItemType; quantity: number; relatedOrderId?: string | null },
) {
  await ensureDelivery(seasonId, memberId)
  const ref = doc(itemsCollection(seasonId, memberId))
  await setDoc(ref, {
    name: input.name,
    type: input.type,
    quantity: input.quantity,
    delivered: false,
    relatedOrderId: input.relatedOrderId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

// 11-deliveries.md §12: Delivery.status is derived from its items, not
// set directly.
export async function setItemDelivered(
  seasonId: string,
  memberId: string,
  itemId: string,
  delivered: boolean,
  deliveredBy: string,
) {
  await updateDoc(doc(itemsCollection(seasonId, memberId), itemId), { delivered, updatedAt: serverTimestamp() })

  const items = await listItems(seasonId, memberId)
  const allDelivered = items.length > 0 && items.every((item) => item.delivered)
  const noneDelivered = items.every((item) => !item.delivered)
  const status = allDelivered ? 'COMPLETED' : noneDelivered ? 'PENDING' : 'PARTIAL'

  await updateDoc(doc(deliveriesCollection(seasonId), memberId), {
    status,
    deliveredAt: status === 'COMPLETED' ? serverTimestamp() : null,
    deliveredBy: status === 'COMPLETED' ? deliveredBy : null,
    updatedAt: serverTimestamp(),
  })
}
