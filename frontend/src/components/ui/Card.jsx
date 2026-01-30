import { cn } from '../../utils/helpers'

export function Card({ className, children, hover = false, gradient = false, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-300',
        hover && 'hover:shadow-lg hover:border-gray-200 hover:-translate-y-1',
        gradient && 'bg-gradient-to-br from-white to-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-gray-600', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-200', className)} {...props}>
      {children}
    </div>
  )
}
