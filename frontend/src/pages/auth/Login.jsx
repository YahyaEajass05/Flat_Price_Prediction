import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { LogIn, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Get email and message from navigation state (from registration)
  const registrationEmail = location.state?.email
  const registrationMessage = location.state?.message
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      email: registrationEmail || '',
    }
  })

  // Show success message from registration
  useEffect(() => {
    if (registrationMessage) {
      setSuccessMessage(registrationMessage)
      // Only show toast if coming from registration
      if (location.state?.fromRegistration) {
        toast.success(registrationMessage)
      }
      // Clear navigation state to prevent showing on refresh
      window.history.replaceState({}, document.title)
    }
  }, [registrationMessage, location.state])

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    
    try {
      const response = await authAPI.login(data)
      // Backend returns: { success, message, data: { user, token, refreshToken } }
      const { token, user, refreshToken } = response.data.data
      
      setAuth(user, token)
      
      // Store refresh token if needed
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Invalid email or password'
      setApiError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Success Alert from Registration */}
          {successMessage && (
            <Alert 
              variant="success" 
              title="Registration Successful!"
              icon={CheckCircle}
              onClose={() => setSuccessMessage('')}
              className="mb-6"
            >
              {successMessage}
            </Alert>
          )}

          {/* API Error Alert */}
          {apiError && (
            <Alert 
              variant="error" 
              title="Login Failed"
              onClose={() => setApiError('')}
              className="mb-6"
            >
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              placeholder="you@example.com"
              disabled={loading}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Enter your password"
                disabled={loading}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 z-10"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to PricePredictor?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Create an account
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
