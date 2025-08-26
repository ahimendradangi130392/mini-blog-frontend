import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/ui/LoadingSpinner'
import Navbar from './components/Navbar'

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Signup = React.lazy(() => import('./pages/Signup'))
const CreatePost = React.lazy(() => import('./pages/CreatePost'))
const PostDetail = React.lazy(() => import('./pages/PostDetail'))
const UserProfile = React.lazy(() => import('./pages/UserProfile'))
const UsersList = React.lazy(() => import('./pages/UsersList'))

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" className="text-primary-600 mb-4" />
      <p className="text-gray-600">Loading page...</p>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/post/:id/edit" element={<PostDetail />} />
                <Route path="/user/:id" element={<UserProfile />} />
                <Route path="/users" element={<UsersList />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 
