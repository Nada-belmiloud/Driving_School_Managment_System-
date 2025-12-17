'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LoginCredentials, AuthState } from '../types/auth'
import { authApi } from '@/lib/api'

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
      
      console.log('Attempting login with:', { 
        username: credentials.username, 
        email: credentials.email 
      })
      
      // UPDATED: Pass all three fields to authApi.login
      const result = await authApi.login(
        credentials.username, 
        credentials.email, 
        credentials.password
      )
      
      console.log('Login API result:', result)

      if (result.success && result.data) {
        const user: User = {
          id: result.data.id,
          name: result.data.name,
          email: result.data.email
        }

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        })
        
        localStorage.setItem('user', JSON.stringify(user))
        router.push('/dashboard')
        return true
      }
      
      console.log('Login failed - result.success:', result.success, 'result.error:', result.error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Still logout locally even if API call fails
    }
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser && storedToken) {
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