import { cn } from '../../utils/helpers'

export default function Progress({ 
  value = 0, 
  max = 100, 
  color = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className 
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    purple: 'bg-purple-600',
    blue: 'bg-blue-600',
  }

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
    xl: 'h-6',
  }

  const bgColors = {
    primary: 'bg-primary-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    danger: 'bg-red-100',
    purple: 'bg-purple-100',
    blue: 'bg-blue-100',
  }

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showLabel && (
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        bgColors[color],
        sizes[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colors[color],
            animated && 'animate-pulse',
            striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-[shimmer_2s_infinite]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
