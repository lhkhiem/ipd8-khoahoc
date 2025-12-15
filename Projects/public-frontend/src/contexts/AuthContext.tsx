'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in from localStorage
    // Note: In production, use secure httpOnly cookies instead of localStorage
    try {
      const storedUser = localStorage.getItem('ipd8_user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Validate user object structure
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.id && parsedUser.email) {
          setUser(parsedUser)
        } else {
          // Invalid data, clear it
          localStorage.removeItem('ipd8_user')
        }
      }
    } catch (error) {
      // Invalid JSON, clear it
      console.error('Error parsing user data from localStorage:', error)
      localStorage.removeItem('ipd8_user')
    }
  }, [])

  const login = (email: string, password?: string) => {
    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.error('Invalid email format')
      return
    }
    
    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase().substring(0, 255)
    
    // Temporary login - just create a mock user
    // In production, this should call a secure API endpoint
    const mockUser: User = {
      id: '1',
      name: 'Nguyễn Văn A',
      email: sanitizedEmail,
      phone: '0901234567',
      avatarUrl: undefined,
    }
    setUser(mockUser)
    
    // Note: In production, use secure httpOnly cookies instead of localStorage
    try {
      localStorage.setItem('ipd8_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Error saving user to localStorage:', error)
    }
    
    router.push('/dashboard')
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ipd8_user')
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
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

