import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react'
import StatCard from '../ui/StatCard'

export default function StatsOverview({ stats }) {
  const statCards = [
    {
      title: 'My Predictions',
      value: stats?.myPredictions || 0,
      change: '+12%',
      changeType: 'increase',
      icon: TrendingUp,
      color: 'blue',
      trend: [15, 22, 18, 25, 20, 28, 24, 30]
    },
    {
      title: 'Average Price',
      value: stats?.avgPrice ? `$${Math.round(stats.avgPrice / 1000)}k` : '$0',
      change: '+8.5%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'green',
      trend: [20, 25, 22, 28, 26, 32, 30, 35]
    },
    {
      title: 'This Month',
      value: stats?.thisMonth || 0,
      change: '+23%',
      changeType: 'increase',
      icon: Activity,
      color: 'purple',
      trend: [10, 15, 13, 20, 18, 25, 22, 28]
    },
    {
      title: 'Accuracy Rate',
      value: '94%',
      change: '+2.1%',
      changeType: 'increase',
      icon: Users,
      color: 'orange',
      trend: [80, 82, 85, 87, 90, 92, 93, 94]
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
