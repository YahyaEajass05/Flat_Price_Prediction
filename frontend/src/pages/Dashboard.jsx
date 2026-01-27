import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaChartLine, FaHistory, FaRocket, FaTrophy } from 'react-icons/fa'
import { useAuthStore } from '../store/authStore'
import { predictionAPI } from '../services/api'
import anime from 'animejs'
import { scrollReveal } from '../utils/advancedAnimations'
import Loading from '../components/common/Loading'

const Dashboard = () => {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (cardsRef.current) {
      // Advanced stagger with bounce
      anime({
        targets: cardsRef.current.children,
        opacity: [0, 1],
        translateY: [50, 0],
        scale: [0.8, 1],
        rotateX: [90, 0],
        delay: anime.stagger(100, { start: 500 }),
        duration: 800,
        easing: 'easeOutElastic(1, .6)',
      })
    }

    // Scroll reveal for sections
    scrollReveal('.scroll-section')
  }, [stats])

  useEffect(() => {
    if (stats && statsRef.current) {
      // Animated counter with glow effect
      anime({
        targets: '.stat-card',
        scale: [0, 1],
        opacity: [0, 1],
        rotateY: [180, 0],
        delay: anime.stagger(150),
        duration: 1000,
        easing: 'easeOutElastic(1, .5)',
      })

      // Count up animation
      const elements = statsRef.current.querySelectorAll('.stat-number')
      elements.forEach((el, index) => {
        const value = el.dataset.value === '∞' ? 0 : parseInt(el.dataset.value) || 0
        if (value > 0) {
          anime({
            targets: { val: 0 },
            val: value,
            round: 1,
            duration: 2000 + index * 200,
            easing: 'easeOutExpo',
            update: function(anim) {
              el.textContent = Math.round(anim.animations[0].currentValue)
            },
          })
        }
      })
    }
  }, [stats])

  const loadStats = async () => {
    try {
      const response = await predictionAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading message="Loading dashboard..." />

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-8 text-white relative overflow-hidden shadow-2xl">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
        <p className="text-primary-100">Ready to make some predictions today?</p>
      </div>

      {/* Quick Stats */}
      <div ref={statsRef} className="grid md:grid-cols-4 gap-6">
        <StatCard
          icon={<FaChartLine className="text-3xl" />}
          label="Total Predictions"
          value={stats?.total || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={<FaTrophy className="text-3xl" />}
          label="Successful"
          value={stats?.successful || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={<FaHistory className="text-3xl" />}
          label="This Month"
          value={stats?.total || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={<FaRocket className="text-3xl" />}
          label="Remaining"
          value={user?.role === 'admin' ? '∞' : stats?.remaining || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6">
          <ActionCard
            to="/predict"
            icon="🔮"
            title="Predict Price"
            description="Get AI-powered price prediction for your property"
            color="from-primary-500 to-primary-600"
          />
          <ActionCard
            to="/history"
            icon="📊"
            title="View History"
            description="Check your past predictions and analytics"
            color="from-green-500 to-green-600"
          />
          <ActionCard
            to="/profile"
            icon="⚙️"
            title="Profile Settings"
            description="Manage your account and preferences"
            color="from-purple-500 to-purple-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.averagePrice > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Your Statistics</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Average Price</p>
              <p className="text-2xl font-bold text-primary-600">
                ₹{stats.averagePrice.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Min Price</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{stats.priceRange?.minPrice.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Max Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{stats.priceRange?.maxPrice.toLocaleString('en-IN') || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value, color }) => {
  const cardRef = useRef(null)

  const handleHover = () => {
    anime({
      targets: cardRef.current,
      scale: [1, 1.05, 1],
      rotateZ: [0, 5, -5, 0],
      duration: 600,
      easing: 'easeInOutQuad',
    })
  }

  return (
    <div 
      ref={cardRef}
      className="stat-card card opacity-0 cursor-pointer transform-gpu"
      onMouseEnter={handleHover}
      style={{ perspective: '1000px' }}
    >
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3 transform hover:rotate-12 transition-transform shadow-lg`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="stat-number text-3xl font-bold animate-glow" data-value={value}>
        {value === '∞' ? '∞' : '0'}
      </p>
    </div>
  )
}

const ActionCard = ({ to, icon, title, description, color }) => {
  const cardRef = useRef(null)

  const handleHover = () => {
    anime({
      targets: cardRef.current,
      scale: [1, 1.1, 1.05],
      rotateY: [0, 10, 0],
      duration: 600,
      easing: 'easeOutElastic(1, .5)',
    })

    anime({
      targets: `${cardRef.current.className} .icon`,
      rotate: [0, 360],
      scale: [1, 1.3, 1],
      duration: 800,
      easing: 'easeOutBack',
    })
  }

  return (
    <Link
      to={to}
      ref={cardRef}
      className={`card bg-gradient-to-br ${color} text-white opacity-0 transform-gpu relative overflow-hidden group`}
      onMouseEnter={handleHover}
      style={{ perspective: '1000px' }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      
      <div className="icon text-5xl mb-4 transform transition-transform group-hover:scale-110">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </Link>
  )
}

export default Dashboard
