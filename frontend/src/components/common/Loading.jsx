import { Loader2 } from 'lucide-react'

export default function Loading({ 
  text = 'Loading...', 
  fullScreen = false,
  size = 'default',
  overlay = false 
}) {
  const sizes = {
    sm: 'w-6 h-6',
    default: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Loader */}
      <div className="relative">
        <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${sizes[size]} border-4 border-primary-200 rounded-full animate-ping opacity-20`} />
        </div>
      </div>
      
      {/* Text and Progress */}
      {text && (
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium animate-pulse">{text}</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {content}
      </div>
    )
  }

  if (overlay) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      {content}
    </div>
  )
}

// Inline loader for buttons and small spaces
export function InlineLoader({ size = 'sm', className = '' }) {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return <Loader2 className={`${sizes[size]} animate-spin ${className}`} />
}

// Skeleton loader card
export function LoadingCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-200 rounded mb-3 last:mb-0" style={{ width: `${100 - i * 10}%` }} />
      ))}
    </div>
  )
}

// Loading overlay for specific sections
export function LoadingOverlay({ text = 'Loading...', transparent = false }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center z-10 ${transparent ? 'bg-white/80' : 'bg-white'} backdrop-blur-sm rounded-xl`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        {text && <p className="text-sm text-gray-600 font-medium">{text}</p>}
      </div>
    </div>
  )
}

// Prediction loader with AI brain animation
export function PredictionLoader({ text = 'Analyzing property data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* AI Brain Animation */}
      <div className="relative w-32 h-32">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
        
        {/* Inner ring */}
        <div className="absolute inset-4 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" style={{ animationDuration: '2s' }} />
        
        {/* Center SVG Brain/House Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary-600 rounded-full -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '1s' }}>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-blue-600 rounded-full -translate-x-1/2" />
        </div>
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDelay: '2s' }}>
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-purple-600 rounded-full -translate-x-1/2" />
        </div>
      </div>

      {/* Text and Progress Steps */}
      <div className="text-center space-y-4 max-w-md">
        <p className="text-lg font-semibold text-gray-900 animate-pulse">
          {text}
        </p>
        
        {/* Progress Steps */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600 animate-fade-in">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Processing features...</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <span>Running AI model...</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <span>Calculating price...</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '100%', backgroundSize: '200% 100%' }} />
        </div>
      </div>
    </div>
  )
}

// Quick prediction loader (compact version)
export function QuickPredictionLoader() {
  return (
    <div className="flex items-center space-x-3 p-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-3 border-primary-200 border-t-primary-600 animate-spin" />
        <div className="absolute inset-1 rounded-full bg-primary-100 flex items-center justify-center">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">Predicting price...</p>
        <p className="text-xs text-gray-500">This may take a few seconds</p>
      </div>
    </div>
  )
}
