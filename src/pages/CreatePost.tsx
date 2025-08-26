import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { postsAPI } from '../services/api'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/textarea'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { H1, P, Muted } from '../components/ui/typography'

const CreatePost: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Clear error when user changes
  useEffect(() => {
    setError('')
  }, [user?._id])

  const handleInputChange = (field: 'title' | 'content', value: string) => {
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)

    try {
      await postsAPI.createPost({
        title: formData.title.trim(),
        content: formData.content.trim()
      })
      navigate('/')
    } catch (err: any) {
      console.log('Create post error:', err)
      setError(err.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <LoadingSpinner size="lg" className="text-primary-600 mb-4" />
          <Muted>Redirecting to login...</Muted>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <H1>Create New Post</H1>
          <Muted>Share your thoughts with the community</Muted>
          <Muted className="mt-2">
            Posting as <span className="font-medium text-primary-600">@{user.username}</span>
          </Muted>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter post title"
                required
                maxLength={100}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your post content here..."
                required
                maxLength={1000}
                className="w-full min-h-[200px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/')}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CreatePost 
