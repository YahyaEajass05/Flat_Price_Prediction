import { cn } from '../../utils/helpers'

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon: Icon,
  dot = false,
  className,
  ...props 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    blue: 'bg-blue-100 text-blue-700',
    pink: 'bg-pink-100 text-pink-700',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full transition-all',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          variant === 'success' && 'bg-green-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'default' && 'bg-gray-500',
        )} />
      )}
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  )
}
