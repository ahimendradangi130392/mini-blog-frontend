import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, AuthState } from '../types'
import { authAPI } from '../services/api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          setToken(storedToken)
          const userData = await authAPI.getCurrentUser()
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Token validation failed:', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token: newToken, user: userData } = await authAPI.login({ email, password })
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      throw new Error(error.message || 'Login failed')
    }
  }, [])

  const signup = useCallback(async (username: string, email: string, password: string) => {
    try {
      const { token: newToken, user: userData } = await authAPI.signup({ username, email, password, confirmPassword: password })
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('token', newToken)
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed')
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
  }, [])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 
