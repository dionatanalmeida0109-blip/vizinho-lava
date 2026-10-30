import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AUTH_EVENT, getSession, type Session } from '../lib/localAuth'

const AuthContext = createContext<Session | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(getSession)

  useEffect(() => {
    const sync = () => setSession(getSession())
    window.addEventListener(AUTH_EVENT, sync)
    window.addEventListener('storage', sync) // outras abas
    return () => {
      window.removeEventListener(AUTH_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
