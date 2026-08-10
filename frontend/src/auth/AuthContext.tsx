import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../firebase/config'
import { getMember, getUserDocument } from './authService'
import type { Member, UserDocument } from './types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  userDoc: UserDocument | null
  member: Member | null
  loading: boolean
  reload: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(user: FirebaseUser) {
    const loadedUserDoc = await getUserDocument(user.uid)
    setUserDoc(loadedUserDoc)
    setMember(loadedUserDoc ? await getMember(loadedUserDoc.memberId) : null)
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      setFirebaseUser(user)
      if (user) {
        await loadProfile(user)
      } else {
        setUserDoc(null)
        setMember(null)
      }
      setLoading(false)
    })
  }, [])

  async function reload() {
    if (firebaseUser) {
      await loadProfile(firebaseUser)
    }
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, userDoc, member, loading, reload }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
