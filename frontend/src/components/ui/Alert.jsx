import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '../../utils/helpers'

export default function Alert({ 
  variant = 'info', 
  title, 
  children, 
  onClose,
  className 
}) {
  const variants = {
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      textColor: 'text-blue-800'
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      textColor: 'text-green-800'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-900',
      textColor: 'text-amber-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-800'
    }
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div className={cn(
      'p-4 rounded-lg border flex items-start space-x-3',
      config.bg,
      className
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('font-semibold mb-1', config.titleColor)}>
            {title}
          </p>
        )}
        <div className={cn('text-sm', config.textColor)}>
          {children}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
