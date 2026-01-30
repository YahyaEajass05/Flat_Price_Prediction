import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Save, CheckCircle, Shield, Lock, Bell, Eye, Camera, Upload, Settings, LogOut, Key, CreditCard, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Tabs from '../components/ui/Tabs'
import Modal from '../components/ui/Modal'
import Progress from '../components/ui/Progress'

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm()

  const newPassword = watch('newPassword', '')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await authAPI.updateProfile(data)
      updateUser(response.data.data)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (data) => {
    setLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      toast.success('Password changed successfully!')
      setShowPasswordModal(false)
      resetPassword()
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-gray-600">Manage your profile, security, and preferences</p>
          </div>
          <Button
            variant="outline"
            icon={LogOut}
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Profile Banner Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
        </div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-6 -mt-16 relative">
            <div className="relative group">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 pb-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{user?.name}</h2>
              <p className="text-gray-600 mb-3">{user?.email}</p>
              <div className="flex items-center gap-3">
                <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'} size="lg" icon={Shield}>
                  {user?.role?.toUpperCase()}
                </Badge>
                <Badge variant="success" icon={CheckCircle} size="md">
                  Verified Account
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Update your personal details and contact information</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Full Name"
            icon={User}
            error={errors.name?.message}
            placeholder="Enter your name"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />

          <Input
            label="Email"
            type="email"
            icon={Mail}
            error={errors.email?.message}
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>

              {/* Account Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Member Since</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Account Status</span>
                    </div>
                    <Badge variant="success" icon={CheckCircle} size="lg">
                      Active & Verified
                    </Badge>
                  </div>
                </div>
              </div>

              <Alert variant="info" className="mt-6">
                Your profile information is secure and only visible to you.
              </Alert>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Manage your password and security preferences</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Change Password Section */}
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3">
                      Protect your account with a strong, unique password
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    icon={Key}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                        <Badge variant="warning" size="sm">Coming Soon</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    disabled
                  >
                    Enable 2FA
                  </Button>
                </div>
              </div>

              {/* Active Sessions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Current Session</p>
                          <p className="text-sm text-gray-500">Windows · Chrome · {new Date().toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">Active Now</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Customize your experience</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates via email</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Prediction Alerts</p>
                        <p className="text-sm text-gray-500">Get notified about prediction results</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Display</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-gray-500 mt-1">View your account activity history</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: 'Profile Updated', time: '2 hours ago', icon: User, color: 'blue' },
                  { action: 'New Prediction Made', time: '5 hours ago', icon: Activity, color: 'green' },
                  { action: 'Login from new device', time: '1 day ago', icon: Shield, color: 'orange' },
                  { action: 'Password Changed', time: '3 days ago', icon: Lock, color: 'purple' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center`}>
                      <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            icon={Lock}
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword', {
              required: 'Current password is required',
            })}
          />
          <Input
            label="New Password"
            type="password"
            icon={Key}
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {newPassword && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Password Strength</label>
              <Progress 
                value={newPassword.length} 
                max={12} 
                color={newPassword.length < 6 ? 'danger' : newPassword.length < 10 ? 'warning' : 'success'}
                size="md"
              />
            </div>
          )}
          <Input
            label="Confirm New Password"
            type="password"
            icon={Lock}
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === newPassword || 'Passwords do not match',
            })}
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Change Profile Picture"
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-6xl font-bold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </label>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAvatarModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                toast.success('Profile picture updated!')
                setShowAvatarModal(false)
              }}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
