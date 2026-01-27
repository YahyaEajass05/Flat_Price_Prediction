import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FaRocket, FaChartLine, FaBrain, FaShieldAlt } from 'react-icons/fa'
import anime from 'animejs'
import { scrollReveal, staggerGrid, animateText, drawSVGLine } from '../utils/advancedAnimations'

const Landing = () => {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const floatRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    // Advanced hero animation with timeline
    const tl = anime.timeline({
      easing: 'easeOutExpo',
    })

    tl.add({
      targets: heroRef.current,
      opacity: [0, 1],
      translateY: [50, 0],
      duration: 1200,
    })
    .add({
      targets: '.hero-title',
      opacity: [0, 1],
      scale: [0.8, 1],
      translateY: [30, 0],
      duration: 800,
    }, '-=800')
    .add({
      targets: '.hero-subtitle',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
    }, '-=400')
    .add({
      targets: '.hero-buttons',
      opacity: [0, 1],
      scale: [0.9, 1],
      duration: 600,
    }, '-=300')

    // Stagger grid for feature cards
    setTimeout(() => {
      staggerGrid('.feature-card', {
        scale: [0, 1],
        rotate: [180, 0],
      })
    }, 1000)

    // Continuous float animation
    anime({
      targets: floatRef.current,
      translateY: [-15, 15],
      duration: 2000,
      direction: 'alternate',
      loop: true,
      easing: 'easeInOutSine',
    })

    // Scroll-triggered animations
    scrollReveal('.scroll-reveal', {
      translateY: [100, 0],
      opacity: [0, 1],
      rotate: [10, 0],
    })

    // Animate SVG path
    setTimeout(() => {
      drawSVGLine('.hero-svg-line')
    }, 1500)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg shadow-sm z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FP</span>
              </div>
              <span className="text-xl font-bold text-gradient">Flat Price Prediction</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10" viewBox="0 0 400 400">
            <path
              className="hero-svg-line"
              d="M 0,200 Q 100,100 200,200 T 400,200"
              fill="none"
              stroke="url(#heroGradient)"
              strokeWidth="4"
            />
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto relative z-10">
          <div ref={heroRef} className="text-center max-w-4xl mx-auto">
            <h1 className="hero-title text-6xl md:text-7xl font-bold mb-6 text-gray-900 opacity-0">
              Predict Flat Prices with{' '}
              <span className="text-gradient animate-glow">AI Power</span>
            </h1>
            <p className="hero-subtitle text-xl text-gray-600 mb-8 opacity-0">
              Get accurate property price predictions using advanced machine learning algorithms.
              Make informed decisions with confidence.
            </p>
            <div className="hero-buttons flex items-center justify-center gap-4 opacity-0">
              <Link to="/register" className="btn btn-primary px-8 py-4 text-lg">
                Start Predicting <FaRocket className="inline ml-2" />
              </Link>
              <Link to="/login" className="btn btn-secondary px-8 py-4 text-lg">
                Learn More
              </Link>
            </div>

            {/* Floating illustration */}
            <div ref={floatRef} className="mt-16">
              <div className="relative w-full max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-primary-100">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🏠</div>
                      <div className="text-sm font-semibold text-gray-700">Property Data</div>
                    </div>
                    <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">🤖</div>
                      <div className="text-sm font-semibold text-gray-700">AI Analysis</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-sm font-semibold text-gray-700">Price Prediction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-xl text-gray-600">Powerful features to help you make better decisions</p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<FaBrain className="text-4xl text-primary-600" />}
              title="AI-Powered"
              description="Advanced machine learning models trained on thousands of properties"
              delay={0}
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-green-600" />}
              title="Accurate Predictions"
              description="99.97% R² score with ensemble of XGBoost, LightGBM, and CatBoost"
            />
            <FeatureCard
              icon={<FaRocket className="text-4xl text-purple-600" />}
              title="Lightning Fast"
              description="Get predictions in seconds with our optimized infrastructure"
            />
            <FeatureCard
              icon={<FaShieldAlt className="text-4xl text-blue-600" />}
              title="Secure & Private"
              description="Your data is encrypted and protected with enterprise-grade security"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="scroll-reveal py-20 px-6 gradient-bg text-white relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle absolute w-2 h-2 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <StatCard number="99.97%" label="Prediction Accuracy" />
            <StatCard number="10K+" label="Predictions Made" />
            <StatCard number="500+" label="Happy Users" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of users who are already making informed property decisions with our AI-powered platform
          </p>
          <Link to="/register" className="btn btn-primary px-10 py-4 text-lg">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FP</span>
            </div>
            <span className="text-xl font-bold">Flat Price Prediction</span>
          </div>
          <p className="text-gray-400 mb-4">AI-powered property price predictions</p>
          <p className="text-gray-500 text-sm">© 2026 Flat Price Prediction. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: [0, 1],
        opacity: [0, 1],
        rotate: [180, 0],
        delay: delay * 150,
        duration: 800,
        easing: 'easeOutElastic(1, .6)',
      })
    }
  }, [delay])

  const handleHover = () => {
    anime({
      targets: cardRef.current,
      scale: [1, 1.05, 1],
      rotate: [0, 5, -5, 0],
      duration: 600,
      easing: 'easeInOutQuad',
    })
  }

  return (
    <div
      ref={cardRef}
      className="feature-card card text-center cursor-pointer transform-gpu opacity-0"
      onMouseEnter={handleHover}
      style={{ perspective: '1000px' }}
    >
      <div className="flex justify-center mb-4 transform transition-transform hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

const StatCard = ({ number, label }) => {
  const statRef = useRef(null)
  const numberRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: statRef.current,
              opacity: [0, 1],
              scale: [0.5, 1],
              duration: 800,
              easing: 'easeOutBack',
            })

            // Animate number if it's a percentage or has digits
            if (numberRef.current && number.match(/\d+/)) {
              const numValue = parseInt(number.match(/\d+/)[0])
              anime({
                targets: { value: 0 },
                value: numValue,
                round: 1,
                duration: 2000,
                easing: 'easeOutExpo',
                update: function(anim) {
                  const val = Math.round(anim.animations[0].currentValue)
                  numberRef.current.textContent = number.replace(/\d+/, val)
                },
              })
            }

            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statRef.current) observer.observe(statRef.current)
  }, [number])

  return (
    <div ref={statRef} className="opacity-0 transform">
      <div ref={numberRef} className="text-5xl font-bold mb-2 animate-glow">
        {number}
      </div>
      <div className="text-xl opacity-90">{label}</div>
    </div>
  )
}

export default Landing
