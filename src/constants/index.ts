

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',
  },
  POSTS: {
    BASE: '/posts',
    BY_ID: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    REPOST: (id: string) => `/posts/${id}/repost`,
    MENTION: (username: string) => `/posts/mention/${username}`,
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BY_USERNAME: (username: string) => `/users/username/${username}`,
    POSTS: (id: string) => `/users/${id}/posts`,
    POSTS_BY_USERNAME: (username: string) => `/users/username/${username}/posts`,
    SEARCH: '/users/search',
  },
  COMMENTS: {
    BASE: '/comments',
    BY_ID: (id: string) => `/comments/${id}`,
    BY_POST: (postId: string) => `/comments/post/${postId}`,
    LIKE: (id: string) => `/comments/${id}/like`,
  },
  HEALTH: '/health',
} as const

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const 