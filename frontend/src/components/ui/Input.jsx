import { forwardRef } from 'react'
import { cn } from '../../utils/helpers'
import { AlertCircle } from 'lucide-react'

const Input = forwardRef(({ 
  label,
  error,
  helpText,
  icon: Icon,
  iconPosition = 'left',
  className,
  wrapperClassName,
  ...props 
}, ref) => {
  return (
    <div className={cn('w-full', wrapperClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg transition-all duration-200',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'placeholder:text-gray-400',
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400',
            Icon && iconPosition === 'left' && 'pl-10',
            Icon && iconPosition === 'right' && 'pr-10',
            props.disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
