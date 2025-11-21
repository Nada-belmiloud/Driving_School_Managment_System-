'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginCredentials, AuthState } from '../types/auth'
import { authenticateUser, getManagerData } from '@/lib/data/dummyData'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })
  const router = useRouter()

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const isAuthenticated = authenticateUser(credentials.username, credentials.password)
      
      if (isAuthenticated) {
        const user = getManagerData()
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        })
        
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/dashboard')
        return true
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
    localStorage.removeItem('user')
    router.push('/login')
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}