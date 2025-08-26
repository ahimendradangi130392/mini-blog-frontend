import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/Button'
import { Menu, X, Home, Users, Plus, LogIn, UserPlus, LogOut, User as UserIcon } from 'lucide-react'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const getLinkClasses = (path: string) => {
    const baseClasses = "relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 group flex items-center"
    const activeClasses = "text-white bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 shadow-lg shadow-primary-500/30 border border-primary-400/20"
    const inactiveClasses = "text-gray-600 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 border border-transparent hover:border-primary-200/50"
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`
  }

  const handleLogout = () => {
    logout()
    closeMobileMenu()
    navigate('/')
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50 shadow-lg shadow-gray-900/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-4 group"
              onClick={closeMobileMenu}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 group-hover:shadow-2xl group-hover:shadow-primary-500/40 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-2xl">B</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600 bg-clip-text text-transparent">
                  MiniBlog
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Share Your Story</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link to="/" className={getLinkClasses('/')}>
              <Home className="w-5 h-5 mr-2.5" />
              Home
            </Link>
            
            <Link to="/users" className={getLinkClasses('/users')}>
              <Users className="w-5 h-5 mr-2.5" />
              Users
            </Link>
            
            {isAuthenticated && (
              <Link to="/create-post" className={getLinkClasses('/create-post')}>
                <Plus className="w-5 h-5 mr-2.5" />
                Create Post
              </Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="outline" size="default" className="flex items-center space-x-2.5 px-6 py-2.5 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all duration-300 border-2 font-medium">
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="default" size="default" className="flex items-center space-x-2.5 px-6 py-2.5 shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/35 hover:scale-105 transition-all duration-300 font-medium">
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to={`/user/${user?._id}`}>
                  <Button variant="ghost" size="default" className="flex items-center space-x-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-300 px-4 py-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/25">
                      <span className="text-white text-sm font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-gray-900 font-semibold text-sm">{user?.username}</span>
                      <span className="text-gray-500 text-xs">View Profile</span>
                    </div>
                  </Button>
                </Link>
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  size="default" 
                  className="flex items-center space-x-2.5 px-5 py-2.5 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 border-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-300"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-6">
            <div className="px-4 pt-4 pb-6 space-y-3 bg-white/95 backdrop-blur-xl rounded-2xl mt-4 shadow-2xl border border-gray-200/50">
              <Link 
                to="/" 
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActive('/') ? 'text-white bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 shadow-lg border border-primary-400/20' : 'text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50'}`}
                onClick={closeMobileMenu}
              >
                <Home className="w-5 h-5 mr-3 inline" />
                Home
              </Link>
              
              <Link 
                to="/users" 
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActive('/users') ? 'text-white bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 shadow-lg border border-primary-400/20' : 'text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50'}`}
                onClick={closeMobileMenu}
              >
                <Users className="w-5 h-5 mr-3 inline" />
                Users
              </Link>
              
              {isAuthenticated && (
                <Link 
                  to="/create-post" 
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${isActive('/create-post') ? 'text-white bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 shadow-lg border border-primary-400/20' : 'text-gray-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50'}`}
                  onClick={closeMobileMenu}
                >
                  <Plus className="w-5 h-5 mr-3 inline" />
                  Create Post
                </Link>
              )}
              
              {!isAuthenticated ? (
                <div className="pt-4 space-y-3">
                  <Link to="/login" onClick={closeMobileMenu}>
                    <Button variant="outline" className="w-full justify-center space-x-2.5 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all duration-300 border-2 font-medium py-3">
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu}>
                    <Button variant="default" className="w-full justify-center space-x-2.5 shadow-xl shadow-primary-500/25 hover:shadow-2xl hover:shadow-primary-500/35 transition-all duration-300 font-medium py-3">
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 space-y-3 border-t border-gray-200">
                  <Link to={`/user/${user?._id}`} onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-center space-x-3 hover:bg-gradient-to-r hover:from-primary-50 hover:to-blue-50 transition-all duration-300 py-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/25">
                        <span className="text-white text-xs font-bold">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span>View Profile</span>
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    className="w-full justify-center space-x-2.5 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 border-2 font-medium py-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar 
