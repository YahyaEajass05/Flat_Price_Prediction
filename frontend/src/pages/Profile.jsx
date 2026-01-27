import { useState, useEffect, useRef } from 'react'
import { FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import { fadeIn, successAnimation } from '../utils/animations'

const Profile = () => {
  const { user, setUser } = useAuthStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    if (profileRef.current) fadeIn(profileRef.current, 800)
  }, [])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.updateProfile(formData)
      setUser(response.data)
      toast.success('Profile updated successfully!')
      successAnimation('.success-icon')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={profileRef} className="max-w-4xl mx-auto space-y-6 anime-hidden">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      {/* User Info Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <p className="text-gray-600 capitalize">{user?.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-success">Active</span>
              {user?.role === 'admin' && <span className="badge badge-info">Admin</span>}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Predictions Made</p>
            <p className="text-xl font-bold">{user?.predictionCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Prediction Limit</p>
            <p className="text-xl font-bold">
              {user?.role === 'admin' ? 'Unlimited' : user?.predictionLimit || 100}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-xl font-bold">
              {user?.role === 'admin'
                ? '∞'
                : (user?.predictionLimit || 100) - (user?.predictionCount || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="input pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
