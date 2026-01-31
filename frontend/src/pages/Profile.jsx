import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Save, CheckCircle, Shield, Lock, Camera, Upload, LogOut, Key } from 'lucide-react'
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

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    window.location.href = '/login'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
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
            <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
              {user?.name?.charAt(0).toUpperCase()}
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

              <Alert variant="info" className="mt-6">
                Your password is encrypted and secure. We recommend changing it regularly.
              </Alert>
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

    </div>
  )
}
