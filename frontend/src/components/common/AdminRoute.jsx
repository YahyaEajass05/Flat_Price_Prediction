import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const AdminRoute = () => {
  const { isAdmin } = useAuthStore()

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default AdminRoute
