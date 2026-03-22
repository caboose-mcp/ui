import { useState, useEffect } from 'react'

const TOKEN_KEY = 'caboose_auth_token'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))

  useEffect(() => {
    const handler = () => setToken(localStorage.getItem(TOKEN_KEY))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const login = (t: string) => {
    localStorage.setItem(TOKEN_KEY, t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }

  return { token, login, logout }
}
