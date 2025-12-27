'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: { email: string; password: string; name: string; phone: string; location?: string; age?: number }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      const result = await authApi.getMe()
      if (result.success && result.data) {
        setUser({
          id: result.data.id,
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          avatarUrl: result.data.avatar_url,
          role: result.data.role,
        })
      } else {
        // Silently fail - user is not authenticated or API is unavailable
        // Don't log errors for failed auth checks as they're expected when not logged in
        if (result.error && !result.error.includes('Unable to connect')) {
          // Only log non-connection errors (like 401, 403, etc.)
          console.warn('[AuthContext] Auth check failed:', result.error)
        }
        setUser(null)
      }
    } catch (error) {
      // Only log unexpected errors, not network failures
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('[AuthContext] Check auth error:', error)
      }
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      // Login bằng phone, nhưng API có thể vẫn cần email format, tạm thời dùng phone làm identifier
      const result = await authApi.login({ email: phone, password })
      
      if (result.success && result.data) {
        setUser({
          id: result.data.user.id,
          name: result.data.user.name,
          email: result.data.user.email,
          phone: result.data.user.phone,
          avatarUrl: result.data.user.avatar_url,
          role: result.data.user.role,
        })
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Login failed' }
      }
    } catch (error: any) {
      console.error('[AuthContext] Login error:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: {
    email: string
    password: string
    name: string
    phone: string
    location?: string
    age?: number
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const result = await authApi.register(data)
      
      if (result.success && result.data) {
        setUser({
          id: result.data.user.id,
          name: result.data.user.name,
          email: result.data.user.email,
          phone: result.data.user.phone,
          role: result.data.user.role,
        })
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Registration failed' }
      }
    } catch (error: any) {
      console.error('[AuthContext] Register error:', error)
      return { success: false, error: error.message || 'Registration failed' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('[AuthContext] Logout error:', error)
    } finally {
      setUser(null)
      router.push('/')
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

