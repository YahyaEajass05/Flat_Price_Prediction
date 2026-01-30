import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown, RefreshCw, Calendar, Clock } from 'lucide-react'
import { adminAPI, predictionsAPI } from '../../services/api'
import Loading from '../../components/common/Loading'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'
import StatCard from '../../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Progress from '../../components/ui/Progress'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, predictionsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers({ limit: 5, sortBy: '-createdAt' }),
        adminAPI.getAllPredictions({ limit: 5, sortBy: '-createdAt' })
      ])
      
      setStats(statsRes.data)
      setRecentUsers(usersRes.data.users || [])
      setRecentPredictions(predictionsRes.data.predictions || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  if (loading) return <Loading text="Loading admin dashboard..." />

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      change: stats?.userGrowth || '+12%',
      isIncrease: true,
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Predictions',
      value: stats?.totalPredictions || 0,
      change: stats?.predictionGrowth || '+23%',
      isIncrease: true,
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      lightBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Average Prediction',
      value: formatCurrency(stats?.avgPrediction || 0),
      change: stats?.avgChange || '+5%',
      isIncrease: true,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Active Today',
      value: stats?.activeToday || 0,
      change: stats?.activeChange || '-3%',
      isIncrease: false,
      icon: Activity,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      lightBg: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor platform activity and analytics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color.replace('bg-gradient-to-br from-', '').replace('-500 to-', '').replace('-600', '')}
            change={stat.change}
            changeType={stat.isIncrease ? 'increase' : 'decrease'}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm" dot />
                    <span className="text-sm text-gray-700 font-medium">Regular Users</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.regularUsers || 0}
                  </span>
                </div>
                <Progress 
                  value={(stats?.regularUsers || 0)} 
                  max={stats?.totalUsers || 1}
                  color="blue"
                  size="md"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm" dot />
                    <span className="text-sm text-gray-700 font-medium">Admin Users</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats?.adminUsers || 0}
                  </span>
                </div>
                <Progress 
                  value={(stats?.adminUsers || 0)} 
                  max={stats?.totalUsers || 1}
                  color="purple"
                  size="md"
                />
              </div>
            </div>

            {/* SVG Chart Visualization */}
            <div className="mt-6">
              <svg viewBox="0 0 200 200" className="w-full h-40">
                <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="20"
                  strokeDasharray={`${((stats?.regularUsers || 0) / (stats?.totalUsers || 1)) * 502} 502`}
                  transform="rotate(-90 100 100)"
                />
                <circle 
                  cx="100" 
                  cy="100" 
                  r="80" 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="20"
                  strokeDasharray={`${((stats?.adminUsers || 0) / (stats?.totalUsers || 1)) * 502} 502`}
                  strokeDashoffset={`-${((stats?.regularUsers || 0) / (stats?.totalUsers || 1)) * 502}`}
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="100" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="bold" fill="#111827">
                  {stats?.totalUsers || 0}
                </text>
                <text x="100" y="120" textAnchor="middle" fontSize="12" fill="#6b7280">
                  Total Users
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPredictions.slice(0, 4).map((prediction, index) => (
                <div key={prediction._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      New prediction: {formatCurrency(prediction.predictedPrice)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {prediction.user?.name || 'User'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(prediction.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Chart */}
            <div className="mt-6">
              <svg viewBox="0 0 400 100" className="w-full">
                <defs>
                  <linearGradient id="activityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#e5e7eb" strokeWidth="0.5"/>
                ))}
                
                {/* Activity line chart */}
                <polyline
                  points="0,80 50,60 100,70 150,45 200,55 250,35 300,40 350,25 400,30"
                  fill="url(#activityGradient)"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
                
                {/* Data points */}
                {[0, 50, 100, 150, 200, 250, 300, 350, 400].map((x, i) => {
                  const y = [80, 60, 70, 45, 55, 35, 40, 25, 30][i]
                  return <circle key={x} cx={x} cy={y} r="3" fill="#0ea5e9"/>
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users and Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin/users'}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
          
            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant={user.role === 'admin' ? 'purple' : 'blue'} size="sm">
                        {user.role}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Users}
                  title="No recent users"
                  description="New users will appear here"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">User Growth</span>
                  <Badge variant="blue" size="lg">
                    {stats?.userGrowth || '+12%'}
                  </Badge>
                </div>
                <Progress value={70} color="blue" size="lg" />
                <p className="text-xs text-gray-600 mt-2">Compared to last month</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Prediction Activity</span>
                  <Badge variant="success" size="lg">
                    {stats?.predictionGrowth || '+23%'}
                  </Badge>
                </div>
                <Progress value={85} color="success" size="lg" />
                <p className="text-xs text-gray-600 mt-2">Highly active platform</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">System Health</span>
                  <Badge variant="purple" size="lg">
                    Excellent
                  </Badge>
                </div>
                <Progress value={95} color="purple" size="lg" />
                <p className="text-xs text-gray-600 mt-2">All systems operational</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">Response Time</span>
                  <Badge variant="warning" size="lg">
                    <Clock className="w-4 h-4 inline mr-1" />
                    145ms
                  </Badge>
                </div>
                <Progress value={92} color="warning" size="lg" />
                <p className="text-xs text-gray-600 mt-2">Average API response time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
