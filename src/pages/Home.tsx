import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertTriangle, FileText, Users } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { Post } from '../types'
import { postsAPI } from '../services/api'
import Card from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import { H1, H2, H3, P, Muted } from '../components/ui/typography'

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [userPosts, setUserPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [userPostsPage, setUserPostsPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hasMoreUserPosts, setHasMoreUserPosts] = useState(true)
  
  const { execute: executeAllPosts, loading: loadingAllPosts, error: errorAllPosts } = useApi<{ data: Post[]; pagination: any }>()
  const { execute: executeUserPosts, loading: loadingUserPosts, error: errorUserPosts } = useApi<{ data: Post[]; pagination: any }>()

  const fetchAllPosts = async (page: number = 1) => {
    const result = await executeAllPosts(async () => {
      const response = await postsAPI.getAllPosts(page, 10)
      return {
        success: true,
        message: 'Posts fetched successfully',
        data: response
      }
    })

    if (result.success && result.data) {
      if (page === 1) {
        setAllPosts(result.data.data || [])
      } else {
        setAllPosts(prev => [...prev, ...(result.data?.data || [])])
      }
      setHasMore(result.data?.pagination?.hasNext || false)
    }
  }

  const fetchUserPosts = async (page: number = 1) => {
    if (!user) return
    
    const result = await executeUserPosts(async () => {
      const response = await postsAPI.getAllPosts(page, 10) // We'll filter by user in frontend for now
      return {
        success: true,
        message: 'User posts fetched successfully',
        data: response
      }
    })

    if (result.success && result.data) {
      // Filter posts by current user
      const userPostsData = result.data.data.filter((post: Post) => post.author._id === user._id)
      
      if (page === 1) {
        setUserPosts(userPostsData)
      } else {
        setUserPosts(prev => [...prev, ...userPostsData])
      }
      setHasMoreUserPosts(result.data?.pagination?.hasNext || false)
    }
  }

  useEffect(() => {
    fetchAllPosts(1)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPosts(1)
    }
  }, [isAuthenticated, user])

  const loadMore = () => {
    if (!loadingAllPosts && hasMore) {
      const nextPage = currentPage + 1
      setCurrentPage(nextPage)
      fetchAllPosts(nextPage)
    }
  }

  const loadMoreUserPosts = () => {
    if (!loadingUserPosts && hasMoreUserPosts) {
      const nextPage = userPostsPage + 1
      setUserPostsPage(nextPage)
      fetchUserPosts(nextPage)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }

  const formatUsername = (username: string) => {
    return `@${username}`
  }

  if (loadingAllPosts && allPosts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <H1>Mini Blog</H1>
          <Muted>Discover stories from our community</Muted>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  if (errorAllPosts && allPosts.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="mb-6">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
          </div>
          <H3>Failed to load posts</H3>
          <Muted className="mb-4">{errorAllPosts}</Muted>
          <Button onClick={() => fetchAllPosts(1)} variant="default" className="w-full sm:w-auto">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <H1>Mini Blog</H1>
        <Muted>Discover stories from our community</Muted>
      </div>

      {/* User's Own Posts Section (if logged in) */}
      {isAuthenticated && user && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <H2>Your Posts</H2>
            <Link to="/create-post" className="w-full sm:w-auto">
              <Button variant="default" size="sm" className="w-full sm:w-auto">
                Create New Post
              </Button>
            </Link>
          </div>
          
          {userPosts.length === 0 && !loadingUserPosts ? (
            <Card className="text-center py-6 sm:py-8">
              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <H3>No posts yet</H3>
              <Muted className="mb-4">Start sharing your thoughts with the community!</Muted>
              <Link to="/create-post" className="w-full sm:w-auto block">
                <Button variant="default" className="w-full sm:w-auto">Create Your First Post</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post._id} hover className="transition-all duration-200 border-l-4 border-l-primary-500">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <Link 
                          to={`/post/${post._id}`}
                          className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                        >
                          {post.title}
                        </Link>
                        <P className="text-gray-600 mt-2 line-clamp-3">{post.content}</P>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-4">
                        <Link to={`/post/${post._id}/edit`} className="w-full sm:w-auto">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-sm text-gray-500">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className="text-primary-600 font-medium">
                          {formatUsername(user.username)}
                        </span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      
                      <Link to={`/post/${post._id}`} className="w-full sm:w-auto">
                        <Button variant="default" size="sm" className="w-full sm:w-auto">
                          View Post
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {hasMoreUserPosts && (
                <div className="text-center pt-4">
                  <Button
                    onClick={loadMoreUserPosts}
                    disabled={loadingUserPosts}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {loadingUserPosts ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Community Posts Section */}
      <div className="space-y-4">
        <H2>Community Posts</H2>
        
        {allPosts.length === 0 && !loadingAllPosts ? (
          <Card className="text-center py-8 sm:py-12">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <H3>No posts yet</H3>
            <Muted className="mb-4">Be the first to share your story!</Muted>
            {isAuthenticated ? (
              <Link to="/create-post" className="w-full sm:w-auto block">
                <Button variant="default" className="w-full sm:w-auto">Create Your First Post</Button>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="default" className="w-full sm:w-auto">Sign Up to Post</Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto">Login</Button>
                </Link>
              </div>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {allPosts.map((post) => (
              <Card key={post._id} hover className="transition-all duration-200">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <Link 
                        to={`/post/${post._id}`}
                        className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200"
                      >
                        {post.title}
                      </Link>
                      <P className="text-gray-600 mt-2 line-clamp-3">{post.content}</P>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-sm text-gray-500">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Link 
                        to={`/user/${post.author._id}`}
                        className="flex items-center space-x-2 hover:text-primary-600 transition-colors duration-200"
                      >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 text-xs font-medium">
                            {post.author.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{formatUsername(post.author.username)}</span>
                      </Link>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <Link to={`/post/${post._id}`} className="w-full sm:w-auto">
                      <Button variant="default" size="sm" className="w-full sm:w-auto">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && (
              <div className="text-center pt-6">
                <Button
                  onClick={loadMore}
                  disabled={loadingAllPosts}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loadingAllPosts ? 'Loading...' : 'Load More Posts'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home 
