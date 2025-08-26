import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { AlertTriangle, User, FileText, Heart, MessageCircle, ChevronRight, Calendar } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { usersAPI } from '../services/api'
import { User as UserType, Post } from '../types'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import { H1, H2, H3, P, Muted, Small } from '../components/ui/typography'

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<UserType | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const { execute: executeUser, loading: loadingUser, error: errorUser } = useApi<UserType>()
  const { execute: executePosts, loading: loadingPosts, error: errorPosts } = useApi<{ data: Post[]; pagination: any }>()

  const fetchUserData = async () => {
    if (!id) return

    try {
      const userData = await usersAPI.getUserById(id)
      setUser(userData)
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
    }
  }

  const fetchUserPosts = async (page: number = 1) => {
    if (!id) return

    const result = await executePosts(async () => {
      const response = await usersAPI.getUserPosts(id, page, 10)
      return {
        success: true,
        message: 'User posts fetched successfully',
        data: response
      }
    })

    if (result.success && result.data) {
      if (page === 1) {
        setPosts(result.data.data || [])
      } else {
        setPosts(prev => [...prev, ...(result.data?.data || [])])
      }
      setHasMore(result.data?.pagination?.hasNext || false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [id])

  useEffect(() => {
    if (id) {
      fetchUserPosts(1)
    }
  }, [id])

  const loadMore = () => {
    if (!loadingPosts && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchUserPosts(nextPage)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const formatUsername = (username: string) => {
    return `@${username}`
  }

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  if (loadingUser && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div className="text-center">
            <Skeleton className="h-8 sm:h-12 w-64 sm:w-80 mx-auto mb-4 sm:mb-6" />
            <Skeleton className="h-4 w-48 mx-auto" />
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

  if (errorUser && !user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto text-center py-8 sm:py-12">
          <div className="mb-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <H3>Failed to load user</H3>
            <Muted className="mb-4">{errorUser}</Muted>
            <Button onClick={fetchUserData} variant="default" className="w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto text-center py-8 sm:py-12">
          <div className="mb-6">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <H3>User not found</H3>
            <Muted className="mb-4">The user you're looking for doesn't exist or has been removed.</Muted>
            <Link to="/users">
              <Button variant="default">Browse Users</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* User Header */}
        <div className="text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <span className="text-3xl sm:text-4xl font-bold text-primary-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <H1>
            {formatUsername(user.username)}
          </H1>
          
          <Muted className="mb-2 sm:mb-4">
            {user.email}
          </Muted>
          
          <Small className="text-gray-500">
            Member since {formatDate(user.createdAt)}
          </Small>
        </div>

        {/* User Posts Section */}
        <div className="space-y-6">
          <div className="text-center">
            <H2>Posts by {user.username}</H2>
            <Muted>Discover what {user.username} has been sharing</Muted>
          </div>

          {loadingPosts && posts.length === 0 ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : errorPosts && posts.length === 0 ? (
            <Card className="text-center py-8 sm:py-12">
              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <H3>Failed to load posts</H3>
              <Muted className="mb-4">{errorPosts}</Muted>
              <Button onClick={() => fetchUserPosts(1)} variant="default" className="w-full sm:w-auto">
                Try Again
              </Button>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="text-center py-8 sm:py-12">
              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <H3>No posts yet</H3>
              <Muted className="mb-4">{user.username} hasn't shared any posts yet.</Muted>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Card 
                    key={post._id} 
                    className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg"
                  >
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="space-y-3">
                        <H3 className="group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </H3>
                        <P className="line-clamp-3 leading-relaxed text-sm sm:text-base">
                          {post.content}
                        </P>
                      </div>
                      
                      {/* Post Metadata */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-3 space-y-2 sm:space-y-0">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {getTimeAgo(post.createdAt)}
                          </span>
                          {post.updatedAt !== post.createdAt && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                              edited
                            </span>
                          )}
                        </div>
                        
                        {/* Post Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Heart className="w-4 h-4 mr-1" />
                              {post.likes?.length || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                        
                        {/* Read More Button */}
                        <Link to={`/post/${post._id}`} className="w-full block">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="w-full group-hover:bg-primary-700 transition-colors duration-200"
                          >
                            Read More
                            <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Enhanced Load More */}
              {hasMore && (
                <div className="text-center pt-6 sm:pt-8">
                  <Button
                    onClick={loadMore}
                    disabled={loadingPosts}
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loadingPosts ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Loading...
                      </div>
                    ) : (
                      'Load More Posts'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile 
