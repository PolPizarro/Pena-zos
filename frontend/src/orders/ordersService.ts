import { collection, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Order, OrderItem, OrderSource, PaymentStatus } from './types'

function ordersCollection(seasonId: string) {
  return collection(db, 'seasons', seasonId, 'orders')
}

function itemsCollection(seasonId: string, orderId: string) {
  return collection(db, 'seasons', seasonId, 'orders', orderId, 'items')
}

export async function listMyOrders(seasonId: string, memberId: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollection(seasonId), where('memberId', '==', memberId)))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) }))
}

export async function listAllOrders(seasonId: string): Promise<Order[]> {
  const snapshot = await getDocs(query(ordersCollection(seasonId), orderBy('createdAt')))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Order, 'id'>) }))
}

export async function listOrderItems(seasonId: string, orderId: string): Promise<OrderItem[]> {
  const snapshot = await getDocs(itemsCollection(seasonId, orderId))
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, orderId, ...(docSnap.data() as Omit<OrderItem, 'id' | 'orderId'>) }))
}

export interface NewOrderLineInput {
  productId: string
  quantity: number
  size: string
  unitPrice: number
}

function lineTotal(lines: NewOrderLineInput[]): number {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

// 10-orders.md §2/§4a: an order is one checkout that can bundle several
// product lines. The header (totalCost) and its items are written together
// so the order never exists without a consistent total.
export async function createOrder(
  seasonId: string,
  memberId: string,
  lines: NewOrderLineInput[],
  source: OrderSource = 'MEMBER',
) {
  const orderRef = doc(ordersCollection(seasonId))
  const batch = writeBatch(db)
  batch.set(orderRef, {
    memberId,
    source,
    totalCost: lineTotal(lines),
    paymentStatus: 'PENDING',
    cancelled: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  for (const line of lines) {
    const itemRef = doc(itemsCollection(seasonId, orderRef.id))
    batch.set(itemRef, {
      memberId,
      productId: line.productId,
      size: line.size,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.unitPrice * line.quantity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return orderRef.id
}

// 10-orders.md §15: finds the order a prior import run already created for
// this member (source IMPORT, still PENDING), so re-importing a corrected
// file updates it instead of creating a duplicate. Returns null if the
// member has no such order yet, or their only IMPORT order is already
// PAID/NOT_REQUIRED.
export async function findPendingImportOrderId(seasonId: string, memberId: string): Promise<string | null> {
  const snapshot = await getDocs(
    query(
      ordersCollection(seasonId),
      where('memberId', '==', memberId),
      where('source', '==', 'IMPORT'),
      where('paymentStatus', '==', 'PENDING'),
      limit(1),
    ),
  )
  const [firstDoc] = snapshot.docs
  return firstDoc ? firstDoc.id : null
}

// Replaces all of an order's items with `lines` and recalculates
// totalCost — used when re-importing corrects a previous IMPORT order
// (10-orders.md §15).
export async function replaceOrderItems(seasonId: string, orderId: string, memberId: string, lines: NewOrderLineInput[]) {
  const existingItems = await getDocs(itemsCollection(seasonId, orderId))
  const batch = writeBatch(db)
  for (const docSnap of existingItems.docs) {
    batch.delete(docSnap.ref)
  }
  for (const line of lines) {
    const itemRef = doc(itemsCollection(seasonId, orderId))
    batch.set(itemRef, {
      memberId,
      productId: line.productId,
      size: line.size,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.unitPrice * line.quantity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  batch.update(doc(ordersCollection(seasonId), orderId), { totalCost: lineTotal(lines), updatedAt: serverTimestamp() })
  await batch.commit()
}

// Board-only, per 10-orders.md §9 / 17-security-rules.md §13.
export async function setOrderPaymentStatus(seasonId: string, orderId: string, paymentStatus: PaymentStatus) {
  await updateDoc(doc(ordersCollection(seasonId), orderId), { paymentStatus, updatedAt: serverTimestamp() })
}

// 10-orders.md §4: soft delete. A member can cancel their own order while
// PENDING; the board can cancel any order. Never reversible from the app.
export async function cancelOrder(seasonId: string, orderId: string) {
  await updateDoc(doc(ordersCollection(seasonId), orderId), { cancelled: true, updatedAt: serverTimestamp() })
}
