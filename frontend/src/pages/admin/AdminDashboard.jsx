import { useEffect, useState, useRef } from 'react'
import { FaUsers, FaChartLine, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { adminAPI } from '../../services/api'
import { staggerFadeIn, countUp } from '../../utils/animations'
import Loading from '../../components/common/Loading'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const cardsRef = useRef(null)
  const statsRef = useRef(null)

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (cardsRef.current) {
      staggerFadeIn(cardsRef.current.children, 800, 100)
    }
  }, [stats])

  useEffect(() => {
    if (stats && statsRef.current) {
      const elements = statsRef.current.querySelectorAll('.stat-number')
      elements.forEach((el, index) => {
        const value = parseInt(el.dataset.value)
        countUp(el, value, 1500 + index * 200)
      })
    }
  }, [stats])

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading message="Loading admin dashboard..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard 👑</h1>
        <p className="text-purple-100">Manage users, monitor system, and view analytics</p>
      </div>

      {/* User Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4">User Statistics</h2>
        <div ref={statsRef} className="grid md:grid-cols-3 gap-6">
          <StatCard
            icon={<FaUsers className="text-3xl" />}
            label="Total Users"
            value={stats?.users?.total || 0}
            color="bg-blue-500"
          />
          <StatCard
            icon={<FaUsers className="text-3xl" />}
            label="Active Users"
            value={stats?.users?.active || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={<FaUsers className="text-3xl" />}
            label="Admins"
            value={stats?.users?.admins || 0}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Prediction Stats */}
      <div>
        <h2 className="text-xl font-bold mb-4">Prediction Statistics</h2>
        <div ref={cardsRef} className="grid md:grid-cols-4 gap-6">
          <StatCard
            icon={<FaChartLine className="text-3xl" />}
            label="Total Predictions"
            value={stats?.predictions?.total || 0}
            color="bg-indigo-500"
          />
          <StatCard
            icon={<FaCheckCircle className="text-3xl" />}
            label="Successful"
            value={stats?.predictions?.successful || 0}
            color="bg-green-500"
          />
          <StatCard
            icon={<FaTimesCircle className="text-3xl" />}
            label="Failed"
            value={stats?.predictions?.failed || 0}
            color="bg-red-500"
          />
          <StatCard
            icon={<FaChartLine className="text-3xl" />}
            label="Avg Price"
            value={`₹${Math.round(stats?.predictions?.avgPrice / 100000) || 0}L`}
            color="bg-orange-500"
            isPrice
          />
        </div>
      </div>

      {/* Recent Predictions */}
      {stats?.recentPredictions && stats.recentPredictions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Predictions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentPredictions.map((pred) => (
                  <tr key={pred._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{pred.user?.name}</p>
                        <p className="text-sm text-gray-500">{pred.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary-600">
                      ₹{pred.predictedPrice?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          pred.status === 'success' ? 'badge-success' : 'badge-danger'
                        }`}
                      >
                        {pred.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(pred.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Model Info */}
      {stats?.modelInfo && (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold mb-4">AI Model Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Model Version</p>
              <p className="text-lg font-semibold">{stats.modelInfo.version}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ensemble Models</p>
              <p className="text-lg font-semibold">{stats.modelInfo.ensemble?.join(', ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value, color, isPrice = false }) => {
  return (
    <div className="card anime-hidden">
      <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${isPrice ? '' : 'stat-number'}`} data-value={isPrice ? 0 : value}>
        {isPrice ? value : 0}
      </p>
    </div>
  )
}

export default AdminDashboard
