import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../store/authStore'
import { authAPI } from '../../services/api'
import anime from 'animejs'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  useEffect(() => {
    // Advanced timeline animation
    const tl = anime.timeline({
      easing: 'easeOutExpo',
    })

    tl.add({
      targets: leftRef.current,
      translateX: [-100, 0],
      opacity: [0, 1],
      duration: 1000,
    })
    .add({
      targets: '.info-item',
      translateX: [-50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      duration: 800,
    }, '-=500')
    .add({
      targets: rightRef.current,
      translateX: [100, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 1000,
    }, '-=800')

    // Floating particles animation
    anime({
      targets: '.particle',
      translateY: [0, -20, 0],
      translateX: [0, 10, 0],
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.2, 1],
      duration: 3000,
      delay: anime.stagger(200),
      loop: true,
      easing: 'easeInOutSine',
    })
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authAPI.login(formData)
      const { user, token, refreshToken } = response.data
      
      setAuth(user, token, refreshToken)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-3 h-3 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8 relative z-10">
        {/* Left side - Info */}
        <div ref={leftRef} className="text-white flex flex-col justify-center opacity-0">
          <h1 className="text-5xl font-bold mb-4 animate-glow">Welcome Back!</h1>
          <p className="text-xl mb-6 opacity-90">
            Sign in to access your AI-powered flat price predictions
          </p>
          <div className="space-y-4">
            <div className="info-item flex items-center gap-3 opacity-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">AI-Powered Predictions</h3>
                <p className="text-sm opacity-80">Accurate price estimates using ML</p>
              </div>
            </div>
            <div className="info-item flex items-center gap-3 opacity-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold">Track Your History</h3>
                <p className="text-sm opacity-80">View all your past predictions</p>
              </div>
            </div>
            <div className="info-item flex items-center gap-3 opacity-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transform hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold">Fast & Secure</h3>
                <p className="text-sm opacity-80">Get results in seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div ref={rightRef} className="bg-white rounded-2xl shadow-2xl p-8 opacity-0 backdrop-blur-lg border border-white/20">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400" />
                  ) : (
                    <FaEye className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
