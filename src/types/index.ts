

// User types
export interface User {
  _id: string
  username: string
  email: string
  createdAt: string
}

// Post types
export interface Post {
  _id: string
  title: string
  content: string
  author: User
  likes: string[]
  comments: string[]
  rePosts: string[]
  mentions: string[]
  createdAt: string
  updatedAt: string
}

// Comment types
export interface Comment {
  _id: string
  content: string
  author: User
  post: string
  parentComment?: string
  mentions: string[]
  likes: string[]
  createdAt: string
  updatedAt: string
}

// Auth types
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Array<{ field: string; message: string }>
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Form types
export interface FormField {
  value: string
  error: string
  touched: boolean
}

export interface FormState {
  [key: string]: FormField
}

// Component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseComponentProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  required?: boolean
  disabled?: boolean
  maxLength?: number
}

export interface CardProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

// Route types
export interface RouteConfig {
  path: string
  element: React.LazyExoticComponent<React.ComponentType>
  title: string
  requiresAuth?: boolean
  layout?: 'default' | 'auth' | 'dashboard'
} 