import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { firebaseConfig } from './config'

const SECONDARY_APP_NAME = 'admin-user-creation'

// 16-authentication.md §3.1: creating another member's Firebase Auth
// account signs the browser into that account. This isolated second app
// instance absorbs that sign-in so the admin's session in the primary app
// (./config.ts) is never affected.
export function getSecondaryAuth() {
  const existing = getApps().find((app) => app.name === SECONDARY_APP_NAME)
  const secondaryApp = existing ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME)
  return getAuth(secondaryApp)
}
