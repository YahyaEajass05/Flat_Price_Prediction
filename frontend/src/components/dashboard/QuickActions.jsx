import { TrendingUp, History, User, Settings, FileText, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../ui'

export default function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    {
      icon: TrendingUp,
      title: 'New Prediction',
      description: 'Predict property price',
      color: 'from-blue-500 to-blue-600',
      path: '/predict'
    },
    {
      icon: History,
      title: 'View History',
      description: 'Past predictions',
      color: 'from-green-500 to-green-600',
      path: '/predictions'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'View insights',
      color: 'from-purple-500 to-purple-600',
      path: '/predictions'
    },
    {
      icon: User,
      title: 'Profile',
      description: 'Account settings',
      color: 'from-orange-500 to-orange-600',
      path: '/profile'
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3 group-hover:shadow-lg transition-all`}>
              <action.icon className="w-7 h-7 text-white" />
            </div>
            <p className="font-semibold text-gray-900 text-sm text-center">{action.title}</p>
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </Card>
  )
}
