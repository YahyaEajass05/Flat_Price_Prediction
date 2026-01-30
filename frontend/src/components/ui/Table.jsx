import { cn } from '../../utils/helpers'

export function Table({ children, className }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className }) {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }) {
  return (
    <tbody className={cn('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, hover = true }) {
  return (
    <tr className={cn(hover && 'hover:bg-gray-50 transition-colors', className)}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className }) {
  return (
    <th className={cn(
      'px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
      className
    )}>
      {children}
    </th>
  )
}

export function TableCell({ children, className }) {
  return (
    <td className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', className)}>
      {children}
    </td>
  )
}
