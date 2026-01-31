import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, History, DollarSign, Activity, Calendar, Clock, BarChart3, ArrowUpRight, ArrowDownRight, Target, Zap } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { predictionsAPI, adminAPI } from '../services/api'
import Loading from '../components/common/Loading'
import { formatCurrency, formatDate } from '../utils/helpers'
import StatCard from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Progress from '../components/ui/Progress'
import Tooltip from '../components/ui/Tooltip'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [recentPredictions, setRecentPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch predictions and stats
      const [predictionsRes, statsRes] = await Promise.all([
        predictionsAPI.getHistory({ limit: 5 }),
        predictionsAPI.getStats(),
      ])
      
      console.log('Predictions Response:', predictionsRes.data)
      console.log('Stats Response:', statsRes.data)
      
      // The API returns 'data' array, not 'predictions'
      setRecentPredictions(predictionsRes.data.data || [])
      setStats(statsRes.data.data || {})
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set empty defaults on error
      setRecentPredictions([])
      setStats({})
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  if (loading) return <Loading text="Loading dashboard..." />

  const statCards = [
    {
      title: 'Total Predictions',
      value: stats?.total || 0,
      icon: History,
      color: 'blue',
      subtitle: 'All predictions made',
    },
    {
      title: 'Successful',
      value: stats?.successful || 0,
      icon: Target,
      color: 'green',
      subtitle: 'Successfully predicted',
    },
    {
      title: 'Average Price',
      value: formatCurrency(stats?.averagePrice || 0),
      icon: DollarSign,
      color: 'purple',
      subtitle: 'Avg predicted price',
    },
    {
      title: 'Remaining',
      value: stats?.remaining === 'unlimited' ? '∞' : (stats?.remaining || 0),
      icon: Zap,
      color: 'orange',
      subtitle: 'Predictions left',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Welcome Section with Time-based Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-blue-600 rounded-2xl p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-white opacity-5 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {getGreeting()}, {user?.name}! 👋
              </h1>
              <p className="text-primary-100 text-lg">
                Here's your prediction analytics overview
              </p>
              <div className="flex items-center gap-4 mt-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <Button
                variant="secondary"
                onClick={fetchDashboardData}
                loading={refreshing}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            changeType={stat.changeType}
            subtitle={stat.subtitle}
          />
        ))}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          hover 
          className="cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-primary-200 transition-all"
          onClick={() => navigate('/predict')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">New Prediction</h3>
            <p className="text-sm text-gray-600">Get AI-powered price estimates instantly</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-primary-600 font-medium">
                <Zap className="w-4 h-4 mr-1" />
                <span>Quick & Accurate</span>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          hover 
          className="cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-green-200 transition-all"
          onClick={() => navigate('/predictions')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <History className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">View History</h3>
            <p className="text-sm text-gray-600">Access all your past predictions</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-green-600 font-medium">
                <Target className="w-4 h-4 mr-1" />
                <span>{recentPredictions.length} Recent</span>
              </div>
            </div>
          </div>
        </Card>

        <Card 
          hover 
          className="cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all"
          onClick={() => navigate('/profile')}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">My Profile</h3>
            <p className="text-sm text-gray-600">Manage account and settings</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'} size="sm">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Enhanced Recent Predictions with Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Predictions List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Predictions</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Your latest property price estimates</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/predictions')}
                className="text-primary-600 hover:text-primary-700"
              >
                View All →
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {recentPredictions.length > 0 ? (
              <div className="space-y-3">
                {recentPredictions.map((prediction, index) => (
                  <div
                    key={prediction._id}
                    className="group relative p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(prediction.predictedPrice)}
                            </p>
                            <p className="text-xs text-gray-500">Predicted Price</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="blue" size="sm">
                            📐 {prediction.propertyData?.total_area || prediction.propertyData?.area || 'N/A'} m²
                          </Badge>
                          <Badge variant="purple" size="sm">
                            🏠 {prediction.propertyData?.rooms_count || prediction.propertyData?.rooms || 'N/A'} rooms
                          </Badge>
                          <Badge variant="default" size="sm">
                            📍 {prediction.propertyData?.district_name || prediction.propertyData?.district || 'N/A'}
                          </Badge>
                          {prediction.confidence && (
                            <Tooltip content="Prediction confidence level">
                              <Badge variant="success" size="sm">
                                ✓ {(prediction.confidence * 100).toFixed(0)}% Confident
                              </Badge>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-700">
                          {formatDate(prediction.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(prediction.createdAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No predictions yet"
                description="Start making predictions to see your history and analytics here"
                action={
                  <Button
                    variant="primary"
                    icon={TrendingUp}
                    onClick={() => navigate('/predict')}
                  >
                    Make Your First Prediction
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Prediction Insights Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prediction Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Predictions</span>
                  <Badge variant="blue" size="lg">{recentPredictions.length}</Badge>
                </div>
                <Progress value={recentPredictions.length} max={10} color="blue" size="sm" />
                <p className="text-xs text-gray-600 mt-2">
                  {10 - recentPredictions.length} more to reach milestone
                </p>
              </div>

              {recentPredictions.length > 0 && (
                <>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">Avg. Price</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(
                        recentPredictions.reduce((sum, p) => sum + p.predictedPrice, 0) / 
                        recentPredictions.length
                      )}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Based on recent predictions</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Accuracy</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                      {recentPredictions[0]?.confidence 
                        ? `${(recentPredictions[0].confidence * 100).toFixed(1)}%`
                        : '95%'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">AI model confidence</p>
                  </div>
                </>
              )}

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/predictions')}
                >
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
