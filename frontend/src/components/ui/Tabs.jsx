import { cn } from '../../utils/helpers'

/**
 * Simple Tabs Component
 * Usage: <Tabs tabs={tabsArray} activeTab={activeTab} onChange={setActiveTab} />
 */
export default function Tabs({ tabs = [], activeTab, onChange, className }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'inline-flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                  isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                )}
              >
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Also export named components for advanced usage
export function TabsList({ children, className }) {
  return (
    <div className={cn(
      'inline-flex items-center p-1 bg-gray-100 rounded-lg',
      className
    )}>
      {children}
    </div>
  )
}

export function TabsTrigger({ value, activeTab, setActiveTab, children, icon: Icon, className }) {
  const isActive = value === activeTab

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
        isActive
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  )
}

export function TabsContent({ value, activeTab, children, className }) {
  if (value !== activeTab) return null

  return (
    <div className={cn('mt-4 animate-fade-in', className)}>
      {children}
    </div>
  )
}
