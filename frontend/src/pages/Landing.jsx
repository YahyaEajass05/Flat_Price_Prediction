import { useNavigate } from 'react-router-dom'
import { TrendingUp, Shield, Zap, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  const features = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models trained on thousands of properties for accurate price predictions'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with industry-standard security and encrypted connections'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get real-time predictions in seconds with our optimized prediction engine'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your prediction history and analyze market trends over time'
    }
  ]

  const benefits = [
    'No credit card required',
    'Unlimited predictions',
    'Historical data access',
    'Export prediction reports',
    'Market trend analysis',
    'Priority support'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">PricePredictor</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Predict Property Prices with
                <span className="text-primary-600"> AI Accuracy</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Make smarter real estate decisions with our advanced machine learning platform. 
                Get instant, accurate price predictions for any property.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-primary text-lg px-8 py-4 flex items-center justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-secondary text-lg px-8 py-4"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-8 flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No credit card
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative animate-slide-up">
              <div className="relative">
                <svg viewBox="0 0 500 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circles */}
                  <circle cx="250" cy="200" r="180" fill="#e0f2fe" opacity="0.5"/>
                  <circle cx="250" cy="200" r="140" fill="#bae6fd" opacity="0.5"/>
                  
                  {/* Building */}
                  <rect x="180" y="120" width="140" height="200" fill="#0ea5e9" rx="8"/>
                  <rect x="190" y="140" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="230" y="140" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="270" y="140" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="190" y="180" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="230" y="180" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="270" y="180" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="190" y="220" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="230" y="220" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="270" y="220" width="30" height="25" fill="#7dd3fc" rx="2"/>
                  <rect x="230" y="280" width="40" height="40" fill="#1e40af" rx="2"/>
                  
                  {/* Chart overlay */}
                  <rect x="100" y="250" width="120" height="80" fill="white" rx="8" opacity="0.95"/>
                  <polyline points="110,310 130,295 150,300 170,285 190,290 210,275" 
                            fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="110" cy="310" r="4" fill="#10b981"/>
                  <circle cx="130" cy="295" r="4" fill="#10b981"/>
                  <circle cx="150" cy="300" r="4" fill="#10b981"/>
                  <circle cx="170" cy="285" r="4" fill="#10b981"/>
                  <circle cx="190" cy="290" r="4" fill="#10b981"/>
                  <circle cx="210" cy="275" r="4" fill="#10b981"/>
                  
                  {/* Price tag */}
                  <rect x="320" y="160" width="100" height="50" fill="white" rx="8" opacity="0.95"/>
                  <text x="370" y="180" textAnchor="middle" fill="#0ea5e9" fontSize="12" fontWeight="bold">PRICE</text>
                  <text x="370" y="200" textAnchor="middle" fill="#1e40af" fontSize="16" fontWeight="bold">$450K</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge AI and machine learning technology to deliver the most accurate predictions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 animate-slide-up border border-gray-100"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Everything You Need to Make Informed Decisions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our platform provides comprehensive tools and insights to help you understand property values and market trends.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Benefits Illustration */}
            <div className="relative">
              <svg viewBox="0 0 400 300" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="50" width="300" height="200" fill="#f0f9ff" rx="12"/>
                <rect x="70" y="70" width="260" height="40" fill="white" rx="8"/>
                <circle cx="90" cy="90" r="8" fill="#0ea5e9"/>
                <rect x="110" y="82" width="180" height="16" fill="#e0f2fe" rx="8"/>
                
                <rect x="70" y="130" width="260" height="40" fill="white" rx="8"/>
                <circle cx="90" cy="150" r="8" fill="#10b981"/>
                <rect x="110" y="142" width="140" height="16" fill="#d1fae5" rx="8"/>
                
                <rect x="70" y="190" width="260" height="40" fill="white" rx="8"/>
                <circle cx="90" cy="210" r="8" fill="#f59e0b"/>
                <rect x="110" y="202" width="200" height="16" fill="#fef3c7" rx="8"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Predicting?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users making smarter property investment decisions with AI-powered predictions
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-primary-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center group"
          >
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-4 text-primary-100 text-sm">
            No credit card required • Free forever • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 PricePredictor. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
