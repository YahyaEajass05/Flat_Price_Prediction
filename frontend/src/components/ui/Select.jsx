import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Select = forwardRef(({ 
  label,
  error,
  helpText,
  options = [],
  className,
  wrapperClassName,
  placeholder = 'Select an option',
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
        <select
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 pr-10 border rounded-lg appearance-none transition-all duration-200',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'bg-white cursor-pointer',
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 hover:border-gray-400',
            props.disabled && 'bg-gray-50 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
