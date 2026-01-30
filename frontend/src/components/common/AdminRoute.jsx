import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import Loading from './Loading'
import Alert from '../ui/Alert'

export default function AdminRoute() {
  const { user } = useAuthStore()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  const [showAccessDenied, setShowAccessDenied] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsChecking(false)
      
      if (user && user.role !== 'admin') {
        setShowAccessDenied(true)
        setTimeout(() => {
          setShowAccessDenied(false)
        }, 3000)
      }
    }
    
    checkAdminAccess()
  }, [user])

  if (isChecking) {
    return <Loading fullScreen text="Checking admin access..." />
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6">
          <Alert variant="error" title="Access Denied">
            You don't have permission to access the admin panel. This area is restricted to administrators only.
          </Alert>
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return <Outlet />
}
