import { cn } from '../../utils/helpers'

export default function Skeleton({ className, variant = 'default' }) {
  const variants = {
    default: 'rounded',
    text: 'rounded h-4',
    title: 'rounded h-6',
    circle: 'rounded-full',
    button: 'rounded-lg h-10',
    card: 'rounded-xl h-48',
  }

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200',
        variants[variant],
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
      <div className="flex space-x-2 pt-4">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  )
}
