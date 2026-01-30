import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useState } from 'react'
import Loading from './Loading'

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Simulate auth check (in real app, verify token with backend)
    const checkAuth = async () => {
      // Add your token verification logic here
      await new Promise(resolve => setTimeout(resolve, 300))
      setIsChecking(false)
    }
    
    checkAuth()
  }, [token])

  if (isChecking) {
    return <Loading fullScreen text="Verifying authentication..." />
  }
  
  if (!user || !token) {
    // Redirect to login but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  
  return children
}
