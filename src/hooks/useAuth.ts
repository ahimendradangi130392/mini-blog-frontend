import { useContext, useCallback } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { LoginCredentials, SignupCredentials } from '../types'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  const { user, token, isLoading, isAuthenticated, login, signup, logout } = context

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials.email, credentials.password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [login])

  const handleSignup = useCallback(async (credentials: SignupCredentials) => {
    try {
      await signup(credentials.username, credentials.email, credentials.password)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }, [signup])

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout
  }
} 