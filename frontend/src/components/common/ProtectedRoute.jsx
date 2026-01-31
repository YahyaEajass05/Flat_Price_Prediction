import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { user, token, isInitialized, initialize } = useAuthStore()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth store if not already done
      if (!isInitialized) {
        initialize()
      }
      
      // Small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 100))
      setIsChecking(false)
    }
    
    checkAuth()
  }, [initialize, isInitialized])

  if (isChecking) {
    return <Loading fullScreen text="Verifying authentication..." />
  }
  
  if (!user || !token) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}
