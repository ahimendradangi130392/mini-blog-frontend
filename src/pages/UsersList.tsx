import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Users } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { usersAPI } from '../services/api'
import { User } from '../types'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SkeletonCard } from '../components/ui/Skeleton'
import { H1, H2, H3, P, Muted } from '../components/ui/typography'

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { execute, loading, error } = useApi<{ data: User[]; pagination: any }>()

  const fetchUsers = async (page: number = 1) => {
    const result = await execute(async () => {
      const response = await usersAPI.getAllUsers(page, 12)
      return {
        success: true,
        message: 'Users fetched successfully',
        data: response
      }
    })

    if (result.success && result.data) {
      if (page === 1) {
        setUsers(result.data.data || [])
      } else {
        setUsers(prev => [...prev, ...(result.data?.data || [])])
      }
      setHasMore(result.data?.pagination?.hasNext || false)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [])

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchUsers(nextPage)
    }
  }

  const formatUsername = (username: string) => {
    return `@${username}`
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center">
            <H1>Our Community</H1>
            <Muted>Discover amazing people sharing their thoughts</Muted>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto text-center py-8 sm:py-12">
          <div className="mb-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <H3>Failed to load users</H3>
            <Muted className="mb-4">{error}</Muted>
            <Button onClick={() => fetchUsers(1)} variant="default" className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center">
          <H1>Our Community</H1>
          <Muted>Discover amazing people sharing their thoughts</Muted>
        </div>

        {users.length === 0 && !loading ? (
          <Card className="text-center py-8 sm:py-12">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <H3>No users found</H3>
            <Muted className="mb-4">Be the first to join our community!</Muted>
            <Link to="/signup" className="w-full sm:w-auto block">
              <Button variant="default" className="w-full sm:w-auto">Join Community</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card key={user._id} hover className="transition-all duration-200">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-primary-600">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <H3>
                      {formatUsername(user.username)}
                    </H3>
                    
                    <Muted className="mb-4">
                      {user.email}
                    </Muted>
                    
                    <Link to={`/user/${user._id}`} className="w-full block">
                      <Button variant="default" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Loading...' : 'Load More Users'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersList 
