import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Progress from '../../components/ui/Progress'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [apiError, setApiError] = useState('')
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password', '')
  
  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    
    if (strength <= 2) return { strength: 1, label: 'Weak', color: 'bg-red-500' }
    if (strength <= 3) return { strength: 2, label: 'Medium', color: 'bg-yellow-500' }
    return { strength: 3, label: 'Strong', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(password)

  const onSubmit = async (data) => {
    setLoading(true)
    setApiError('')
    
    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      
      // Backend returns: { success, message, data: { user, token, refreshToken } }
      const { token, user, refreshToken } = response.data.data
      
      // Auto-login after registration
      const { setAuth } = useAuthStore.getState()
      setAuth(user, token)
      
      // Store refresh token if needed
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      
      toast.success('Account created successfully! Welcome!')
      setTimeout(() => {
        navigate('/dashboard')
      }, 500)
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Start predicting property prices today</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* API Error Alert */}
          {apiError && (
            <Alert 
              variant="error" 
              title="Registration Failed"
              onClose={() => setApiError('')}
              className="mb-6"
            >
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name Field */}
            <Input
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              disabled={loading}
              error={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters',
                },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: 'Name can only contain letters and spaces',
                },
              })}
            />

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
                placeholder="Create a strong password"
                disabled={loading}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Password is too long',
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
              
              {/* Password Strength Indicator */}
              {password && (
                <Progress
                  value={passwordStrength.strength}
                  max={3}
                  color={
                    passwordStrength.strength === 1 ? 'danger' :
                    passwordStrength.strength === 2 ? 'warning' : 'success'
                  }
                  label={`Password strength: ${passwordStrength.label}`}
                  showLabel
                  className="mt-2"
                />
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                icon={Lock}
                placeholder="Confirm your password"
                disabled={loading}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 z-10"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                  {...register('terms', {
                    required: 'You must agree to the terms and conditions',
                  })}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </button>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={UserPlus}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in instead
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
