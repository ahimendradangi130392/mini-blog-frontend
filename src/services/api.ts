import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { User, Post, LoginCredentials, SignupCredentials, ApiResponse, PaginatedResponse, Comment as AppComment } from '../types'
import { API_BASE_URL, API_ENDPOINTS, PAGINATION_DEFAULTS, HTTP_STATUS } from '../constants'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management utilities
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem('token'),
  setToken: (token: string): void => localStorage.setItem('token', token),
  removeToken: (): void => localStorage.removeItem('token'),
  isTokenValid: (): boolean => {
    const token = localStorage.getItem('token')
    if (!token) return false
    
    try {
      // Basic JWT validation (check if it's expired)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch {
      return false
    }
  }
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken()

    // Always attach token if it exists; backend will validate
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Ensure Content-Type is set for all non-GET/DELETE requests
    if (config.method !== 'get' && config.method !== 'delete') {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Log the error for debugging
    console.log('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      response: error.response?.data
    })

    // Handle 401 Unauthorized errors
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
      // Only redirect on 401 if it's not a login/signup request
      if (!error.config?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) && 
          !error.config?.url?.includes(API_ENDPOINTS.AUTH.SIGNUP)) {
        // Clear invalid token and redirect to login
        tokenManager.removeToken()
        console.log('Token removed due to 401 error')
        // window.location.href = '/login'
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      // User doesn't have permission for this action
      console.warn('Access forbidden:', error.config?.url)
    }
    
    return Promise.reject(error)
  }
)

// API Response wrapper
const handleResponse = <T>(response: AxiosResponse): T => {
  return response.data
}



// Helper function to extract data from nested API responses
const extractData = <T>(response: AxiosResponse): T => {
  const data = response.data
  
  // Handle nested data structure: { success: true, data: { user: {...} } }
  if (data.data && typeof data.data === 'object') {
    // If data.data has a 'user' property, return that
    if (data.data.user) {
      return data.data.user
    }
    // If data.data has a 'post' property, return that
    if (data.data.post) {
      return data.data.post
    }
    // For paginated responses, return the entire data object
    // This handles: { data: [...], pagination: {...} }
    if (Array.isArray(data.data) || data.data.pagination) {
      return data
    }
    // Otherwise return the data.data object
    return data.data
  }
  
  // Handle direct data structure: { success: true, user: {...} }
  if (data.user) {
    return data.user
  }
  
  // Handle direct data structure: { success: true, post: {...} }
  if (data.post) {
    return data.post
  }
  
  // Fallback to the entire response data
  return data
}

// Auth API
export const authAPI = {
  signup: async (credentials: SignupCredentials): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, credentials)
    const data = handleResponse<{ token: string; user: User; message: string; success: boolean }>(response)
    
    if (!data.success) {
      throw new Error(data.message || 'Signup failed')
    }
    
    return { token: data.token, user: data.user }
  },

  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    const data = handleResponse<{ token: string; user: User; message: string; success: boolean }>(response)
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed')
    }
    
    return { token: data.token, user: data.user }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME)
    const data = handleResponse<{ user: User }>(response)
    return data.user
  },
}

// Posts API
export const postsAPI = {
  getAllPosts: async (page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.POSTS.BASE}?page=${page}&limit=${limit}`)
    return extractData<PaginatedResponse<Post>>(response)
  },

  getPostById: async (id: string): Promise<Post> => {
    const response = await apiClient.get(API_ENDPOINTS.POSTS.BY_ID(id))
    return extractData<Post>(response)
  },

  createPost: async (postData: { title: string; content: string }): Promise<Post> => {
    const response = await apiClient.post(API_ENDPOINTS.POSTS.BASE, postData)
    return extractData<Post>(response)
  },

  updatePost: async (id: string, postData: { title: string; content: string }): Promise<Post> => {
    const response = await apiClient.put(API_ENDPOINTS.POSTS.BY_ID(id), postData)
    return extractData<Post>(response)
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.POSTS.BY_ID(id))
  },

  // New methods for bonus features
  toggleLike: async (id: string): Promise<Post> => {
    const response = await apiClient.post(API_ENDPOINTS.POSTS.LIKE(id))
    return extractData<Post>(response)
  },

  rePost: async (id: string): Promise<Post> => {
    const response = await apiClient.post(API_ENDPOINTS.POSTS.REPOST(id))
    return extractData<Post>(response)
  },

  getPostsByMention: async (username: string, page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<PaginatedResponse<Post>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.POSTS.MENTION(username)}?page=${page}&limit=${limit}`)
    return extractData<PaginatedResponse<Post>>(response)
  }
}

// Users API
export const usersAPI = {
  getAllUsers: async (page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.BASE}?page=${page}&limit=${limit}`)
    return extractData<PaginatedResponse<User>>(response)
  },

  getUserById: async (idOrUsername: string): Promise<User> => {
    // If idOrUsername is not a 24-char hex, treat as username
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrUsername)
    const url = isObjectId ? API_ENDPOINTS.USERS.BY_ID(idOrUsername) : API_ENDPOINTS.USERS.BY_USERNAME(idOrUsername)
    const response = await apiClient.get(url)
    return extractData<User>(response)
  },

  getUserPosts: async (idOrUsername: string, page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<PaginatedResponse<Post>> => {
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrUsername)
    const url = isObjectId ? API_ENDPOINTS.USERS.POSTS(idOrUsername) : API_ENDPOINTS.USERS.POSTS_BY_USERNAME(idOrUsername)
    const response = await apiClient.get(`${url}?page=${page}&limit=${limit}`)
    return extractData<PaginatedResponse<Post>>(response)
  },

  searchUsers: async (query: string, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<User[]> => {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`)
    return extractData<User[]>(response)
  },
}

// Comments API
export const commentsAPI = {
  createComment: async (commentData: { postId: string; content: string; parentCommentId?: string }): Promise<AppComment> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMENTS.BASE, commentData)
    return extractData<AppComment>(response)
  },

  getCommentsByPost: async (postId: string, page: number = PAGINATION_DEFAULTS.DEFAULT_PAGE, limit: number = PAGINATION_DEFAULTS.DEFAULT_LIMIT): Promise<PaginatedResponse<AppComment>> => {
    const response = await apiClient.get(`${API_ENDPOINTS.COMMENTS.BY_POST(postId)}?page=${page}&limit=${limit}`)
    return extractData<PaginatedResponse<AppComment>>(response)
  },

  toggleLike: async (id: string): Promise<AppComment> => {
    const response = await apiClient.post(API_ENDPOINTS.COMMENTS.LIKE(id))
    return extractData<AppComment>(response)
  },

  deleteComment: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.COMMENTS.BY_ID(id))
  }
}

// Health check
export const healthAPI = {
  check: async (): Promise<{ success: boolean; message: string; timestamp: string; uptime: number }> => {
    const response = await apiClient.get(API_ENDPOINTS.HEALTH)
    return handleResponse(response)
  },
}

export default apiClient 