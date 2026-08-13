import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { InventoryCategory, InventoryItem, InventoryUnit } from './types'

function inventoryCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'inventory')
}

export async function listInventoryItems(seasonId: string): Promise<InventoryItem[]> {
  const snapshot = await getDocs(query(inventoryCollection(seasonId), orderBy('name')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<InventoryItem, 'id'>) }))
}

export interface NewInventoryItemInput {
  name: string
  description: string
  category: InventoryCategory
  quantity: number
  unit: InventoryUnit
  notes: string
}

export async function createInventoryItem(seasonId: string, input: NewInventoryItemInput) {
  const ref = doc(inventoryCollection(seasonId))
  await setDoc(ref, { ...input, status: 'AVAILABLE', createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

export async function updateInventoryItem(
  seasonId: string,
  itemId: string,
  changes: Partial<Pick<InventoryItem, 'quantity' | 'status' | 'notes'>>,
) {
  await updateDoc(doc(inventoryCollection(seasonId), itemId), { ...changes, updatedAt: serverTimestamp() })
}
