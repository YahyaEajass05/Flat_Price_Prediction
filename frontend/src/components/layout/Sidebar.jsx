import { NavLink } from 'react-router-dom'
import { FaHome, FaChartLine, FaHistory, FaUserShield, FaUsers } from 'react-icons/fa'
import { useAuthStore } from '../../store/authStore'
import { useEffect, useRef } from 'react'
import { staggerFadeIn } from '../../utils/animations'

const Sidebar = () => {
  const { isAdmin } = useAuthStore()
  const linksRef = useRef(null)

  useEffect(() => {
    if (linksRef.current) {
      staggerFadeIn(linksRef.current.children, 800, 50)
    }
  }, [])

  const navLinks = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard', admin: false },
    { to: '/predict', icon: FaChartLine, label: 'Predict Price', admin: false },
    { to: '/history', icon: FaHistory, label: 'History', admin: false },
  ]

  const adminLinks = [
    { to: '/admin', icon: FaUserShield, label: 'Admin Dashboard', admin: true },
    { to: '/admin/users', icon: FaUsers, label: 'Manage Users', admin: true },
  ]

  const allLinks = isAdmin() ? [...navLinks, ...adminLinks] : navLinks

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg border-r border-gray-200">
      <nav className="p-4" ref={linksRef}>
        {allLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Prediction limit indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <PredictionLimit />
      </div>
    </aside>
  )
}

const PredictionLimit = () => {
  const { user, getRemainingPredictions } = useAuthStore()
  const remaining = getRemainingPredictions()

  if (user?.role === 'admin') {
    return (
      <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-1">Predictions</p>
        <p className="text-lg font-bold text-gradient">Unlimited ∞</p>
      </div>
    )
  }

  const percentage = (user?.predictionCount / user?.predictionLimit) * 100

  return (
    <div className="p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg">
      <p className="text-xs text-gray-600 mb-2">Predictions Used</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{user?.predictionCount || 0}</span>
        <span className="text-sm text-gray-600">/ {user?.predictionLimit || 100}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{remaining} remaining</p>
    </div>
  )
}

export default Sidebar
