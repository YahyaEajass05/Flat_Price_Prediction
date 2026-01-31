import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  icon,
  color = 'blue',
  trend,
  subtitle
}) {
  const Icon = icon;
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600',
    indigo: 'from-indigo-500 to-indigo-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={cn(
          'w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110',
          `bg-gradient-to-br ${colorClasses[color]}`
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {(change || trend) && (
        <div className="flex items-center justify-between">
          {change && (
            <div className={cn(
              'flex items-center text-sm font-semibold px-2 py-1 rounded-full',
              changeType === 'increase' 
                ? 'bg-green-100 text-green-700' 
                : changeType === 'decrease'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            )}>
              {changeType === 'increase' ? (
                <ArrowUp className="w-3 h-3 mr-1" />
              ) : changeType === 'decrease' ? (
                <ArrowDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              {change}
            </div>
          )}
          
          {trend && (
            <div className="flex-1 ml-3">
              <svg viewBox="0 0 100 30" className="w-full h-6">
                <polyline
                  points={trend.map((val, idx) => `${idx * (100 / (trend.length - 1))},${30 - val}`).join(' ')}
                  fill="none"
                  stroke={changeType === 'increase' ? '#10b981' : '#ef4444'}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
