import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import * as XLSX from 'xlsx'
import type { MemberRole } from '../auth/types'
import { db } from '../firebase/config'
import { getSecondaryAuth } from '../firebase/secondaryAuth'

const VALID_ROLES: MemberRole[] = ['MEMBER', 'BOARD', 'TREASURER', 'ADMIN']

// 01-users-and-roles.md §5: Nombre, Apellidos, email, DNI, ROL.
// Roles are separated by comma or semicolon within the ROL cell.
export interface ImportRow {
  nombre: string
  apellidos: string
  email: string
  dni: string
  roles: MemberRole[]
  rawRoles: string
}

export interface ImportRowResult {
  row: ImportRow
  status: 'created' | 'updated' | 'error'
  message?: string
  temporaryPassword?: string
}

function cell(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (raw[key] != null && raw[key] !== '') return String(raw[key]).trim()
  }
  return ''
}

export async function parseExcelFile(file: File): Promise<ImportRow[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const sheet = workbook.Sheets[firstSheetName]
  if (!sheet) return []
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rawRows.map((raw) => {
    const rawRoles = cell(raw, 'ROL', 'Roles', 'roles')
    const roles = rawRoles
      .split(/[,;]/)
      .map((role) => role.trim().toUpperCase())
      .filter((role): role is MemberRole => (VALID_ROLES as string[]).includes(role))

    return {
      nombre: cell(raw, 'Nombre', 'nombre'),
      apellidos: cell(raw, 'Apellidos', 'apellidos'),
      email: cell(raw, 'Email', 'email', 'e-mail').toLowerCase(),
      dni: cell(raw, 'DNI', 'dni').toUpperCase(),
      roles,
      rawRoles,
    }
  })
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function findMemberIdByDni(dni: string): Promise<string | null> {
  const snapshot = await getDocs(query(collection(db, 'members'), where('dni', '==', dni), limit(1)))
  const [firstDoc] = snapshot.docs
  return firstDoc ? firstDoc.id : null
}

// Creates the Firebase Auth account via the secondary app instance, then
// writes the User document through the primary (admin-authenticated) app.
async function createAccount(memberId: string, email: string): Promise<string> {
  const temporaryPassword = generateTemporaryPassword()
  const secondaryAuth = getSecondaryAuth()
  const credential = await createUserWithEmailAndPassword(secondaryAuth, email, temporaryPassword)
  await signOut(secondaryAuth)

  await setDoc(doc(db, 'users', credential.user.uid), {
    firebaseUid: credential.user.uid,
    memberId,
    email,
    mustChangePassword: true,
  })

  return temporaryPassword
}

export async function importMembers(rows: ImportRow[]): Promise<ImportRowResult[]> {
  const results: ImportRowResult[] = []

  for (const row of rows) {
    try {
      if (!row.nombre || !row.email || !row.dni) {
        results.push({ row, status: 'error', message: 'Faltan campos obligatorios (Nombre, Email o DNI).' })
        continue
      }
      if (row.roles.length === 0) {
        results.push({ row, status: 'error', message: `Ningún rol reconocido en "${row.rawRoles}".` })
        continue
      }

      const fullName = `${row.nombre} ${row.apellidos}`.trim()
      const existingMemberId = await findMemberIdByDni(row.dni)

      if (existingMemberId) {
        await updateDoc(doc(db, 'members', existingMemberId), {
          fullName,
          email: row.email,
          roles: row.roles,
          updatedAt: serverTimestamp(),
        })
        results.push({ row, status: 'updated' })
        continue
      }

      const newMemberRef = doc(collection(db, 'members'))
      await setDoc(newMemberRef, {
        fullName,
        email: row.email,
        dni: row.dni,
        roles: row.roles,
        status: 'PENDING_ACCESS',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const temporaryPassword = await createAccount(newMemberRef.id, row.email)
      await updateDoc(newMemberRef, { status: 'ACTIVE' })

      results.push({ row, status: 'created', temporaryPassword })
    } catch (error) {
      results.push({
        row,
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido.',
      })
    }
  }

  return results
}
