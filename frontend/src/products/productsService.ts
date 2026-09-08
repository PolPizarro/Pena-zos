import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Product } from './types'

function productsCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'products')
}

export async function listProducts(seasonId: string): Promise<Product[]> {
  const snapshot = await getDocs(query(productsCollection(seasonId), orderBy('name')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Product, 'id'>) }))
}

export interface NewProductInput {
  name: string
  description: string
  price: number
  requiresSize: boolean
}

export async function createProduct(seasonId: string, input: NewProductInput) {
  const ref = doc(productsCollection(seasonId))
  await setDoc(ref, { ...input, active: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  return ref.id
}

// 10-orders.md §3: inactive products cannot receive new orders (enforced
// in the order-creation UI, since it's a business rule, not access control).
export async function setProductActive(seasonId: string, productId: string, active: boolean) {
  await updateDoc(doc(productsCollection(seasonId), productId), { active, updatedAt: serverTimestamp() })
}

export async function setProductPrice(seasonId: string, productId: string, price: number) {
  await updateDoc(doc(productsCollection(seasonId), productId), { price, updatedAt: serverTimestamp() })
}
