import { NavLink } from 'react-router-dom'
import { Home, TrendingUp, History, User, Shield, X, BarChart3, ChevronRight, Crown, Settings } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../utils/helpers'
import Badge from '../ui/Badge'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, badge: null },
    { name: 'Predict Price', href: '/predict', icon: TrendingUp, badge: 'Hot' },
    { name: 'Prediction History', href: '/predictions', icon: History, badge: null },
    { name: 'Profile', href: '/profile', icon: User, badge: null },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield, badge: null },
    { name: 'Manage Users', href: '/admin/users', icon: User, badge: null },
    { name: 'Manage Predictions', href: '/admin/predictions', icon: BarChart3, badge: null },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-white border-r border-gray-200 z-40 transform transition-all duration-300 ease-out shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:top-16 lg:shadow-none'
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              PricePredictor
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card (Mobile) */}
        <div className="lg:hidden p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <Badge variant="primary" size="sm" className="mt-1">
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-md shadow-primary-200'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center">
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all',
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      )}>
                        <item.icon
                          className={cn(
                            'h-5 w-5 transition-colors',
                            isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
                          )}
                        />
                      </div>
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "default" : "warning"} 
                        size="sm"
                        className={isActive ? "bg-white/20 text-white" : ""}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-white opacity-50" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="mt-6">
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Admin Panel
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {adminNavigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-gray-900'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center">
                          <div className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all',
                            isActive 
                              ? 'bg-white/20' 
                              : 'bg-purple-100 group-hover:bg-purple-200'
                          )}>
                            <item.icon
                              className={cn(
                                'h-5 w-5 transition-colors',
                                isActive ? 'text-white' : 'text-purple-600 group-hover:text-purple-900'
                              )}
                            />
                          </div>
                          <span>{item.name}</span>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-4 h-4 text-white opacity-50" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button 
            onClick={() => {
              onClose()
              window.location.href = '/profile'
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-500" />
            <span>Settings</span>
          </button>
          
          {/* Version Info */}
          <div className="mt-3 px-3">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-400">© 2026 PricePredictor</p>
          </div>
        </div>
      </div>
    </>
  )
}
