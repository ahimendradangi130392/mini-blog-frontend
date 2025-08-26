import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { H1, P, Muted } from '../components/ui/typography'

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state, or default to home
  const from = (location.state as any)?.from || '/'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login({ email: formData.email, password: formData.password })
      if (result.success) {
        navigate(from, { replace: true })
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Show loading if already authenticated
  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-8 sm:py-12 px-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <Muted>Redirecting...</Muted>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <H1>Welcome Back</H1>
          <Muted>Sign in to your account</Muted>
          {from !== '/' && (
            <Muted className="mt-2">
              Please sign in to access {from === '/create-post' ? 'post creation' : 'this page'}
            </Muted>
          )}
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Muted>
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </Muted>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Login 
