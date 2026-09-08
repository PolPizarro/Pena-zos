import * as XLSX from 'xlsx'
import { listMembers } from '../members/membersService'
import { listProducts } from '../products/productsService'
import type { Product } from '../products/types'
import { createOrder, findPendingImportOrderId, replaceOrderItems, type NewOrderLineInput } from './ordersService'

// 10-orders.md §15: Email, Producto, Talla, Cantidad — one row per product
// line. Rows sharing the same Email belong to the same member's order.
export interface ImportOrderRow {
  email: string
  productName: string
  size: string
  quantityText: string
}

export interface ImportOrderRowResult {
  row: ImportOrderRow
  status: 'created' | 'updated' | 'error'
  message?: string
}

function cell(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (raw[key] != null && raw[key] !== '') return String(raw[key]).trim()
  }
  return ''
}

export async function parseExcelFile(file: File): Promise<ImportOrderRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const sheet = workbook.Sheets[firstSheetName]
  if (!sheet) return []
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rawRows.map((raw) => ({
    email: cell(raw, 'Email', 'email', 'e-mail').toLowerCase(),
    productName: cell(raw, 'Producto', 'producto'),
    size: cell(raw, 'Talla', 'talla'),
    quantityText: cell(raw, 'Cantidad', 'cantidad'),
  }))
}

interface ValidatedRow {
  row: ImportOrderRow
  rowIndex: number
  memberId: string
  product: Product
  quantity: number
  size: string
}

// 10-orders.md §15: only BOARD/ADMIN can run this (17-security-rules.md
// §13), which is also what lets it create/replace orders on behalf of
// other members — a regular member's own order creation only allows
// memberId == themselves.
export async function importOrders(seasonId: string, rows: ImportOrderRow[]): Promise<ImportOrderRowResult[]> {
  const [members, products] = await Promise.all([listMembers(), listProducts(seasonId)])
  const memberIdByEmail = new Map(members.map((m) => [m.email.toLowerCase(), m.id]))
  const activeProductByName = new Map(products.filter((p) => p.active).map((p) => [p.name.toLowerCase(), p]))

  const results: ImportOrderRowResult[] = new Array(rows.length)
  const validByMember = new Map<string, ValidatedRow[]>()

  rows.forEach((row, index) => {
    if (!row.email || !memberIdByEmail.has(row.email)) {
      results[index] = { row, status: 'error', message: `No se encuentra ningún socio con el email "${row.email}".` }
      return
    }
    const product = row.productName ? activeProductByName.get(row.productName.toLowerCase()) : undefined
    if (!product) {
      results[index] = { row, status: 'error', message: `Producto no encontrado o inactivo: "${row.productName}".` }
      return
    }
    if (product.requiresSize && !row.size) {
      results[index] = { row, status: 'error', message: `El producto "${product.name}" necesita talla.` }
      return
    }
    const quantity = Number(row.quantityText)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      results[index] = { row, status: 'error', message: `Cantidad no válida: "${row.quantityText}".` }
      return
    }

    const memberId = memberIdByEmail.get(row.email)!
    const validated: ValidatedRow = { row, rowIndex: index, memberId, product, quantity, size: row.size }
    const group = validByMember.get(memberId)
    if (group) {
      group.push(validated)
    } else {
      validByMember.set(memberId, [validated])
    }
  })

  for (const [memberId, entries] of validByMember) {
    const lines: NewOrderLineInput[] = entries.map((entry) => ({
      productId: entry.product.id,
      quantity: entry.quantity,
      size: entry.size,
      unitPrice: entry.product.price,
    }))

    try {
      const existingOrderId = await findPendingImportOrderId(seasonId, memberId)
      if (existingOrderId) {
        await replaceOrderItems(seasonId, existingOrderId, memberId, lines)
        entries.forEach((entry) => {
          results[entry.rowIndex] = { row: entry.row, status: 'updated' }
        })
      } else {
        await createOrder(seasonId, memberId, lines, 'IMPORT')
        entries.forEach((entry) => {
          results[entry.rowIndex] = { row: entry.row, status: 'created' }
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.'
      entries.forEach((entry) => {
        results[entry.rowIndex] = { row: entry.row, status: 'error', message }
      })
    }
  }

  return results
}
