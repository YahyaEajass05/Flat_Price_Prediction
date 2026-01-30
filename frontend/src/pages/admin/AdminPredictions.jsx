import { useState, useEffect } from 'react'
import { TrendingUp, Search, Filter, Download, RefreshCw, Eye, Trash2, Calendar, User, Home, DollarSign, BarChart3 } from 'lucide-react'
import { adminAPI } from '../../services/api'
import Loading from '../../components/common/Loading'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/helpers'

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [sortBy, setSortBy] = useState('-createdAt')
  const [priceFilter, setPriceFilter] = useState('all')

  useEffect(() => {
    fetchPredictions()
  }, [sortBy])

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllPredictions({ sortBy })
      setPredictions(response.data.predictions || [])
    } catch (error) {
      console.error('Error fetching predictions:', error)
      toast.error('Failed to load predictions')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction)
    setShowDetailsModal(true)
  }

  const handleDeletePrediction = async (predictionId) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) return
    
    setDeleting(predictionId)
    try {
      await adminAPI.deletePrediction(predictionId)
      toast.success('Prediction deleted successfully')
      fetchPredictions()
    } catch (error) {
      console.error('Error deleting prediction:', error)
      toast.error(error.response?.data?.message || 'Failed to delete prediction')
    } finally {
      setDeleting(null)
    }
  }

  const handleExportPredictions = () => {
    const csvContent = [
      ['Date', 'User', 'Property Type', 'Area', 'Rooms', 'District', 'Predicted Price'],
      ...filteredPredictions.map(p => [
        formatDate(p.createdAt),
        p.user?.name || 'Unknown',
        p.propertyData?.type || 'N/A',
        p.propertyData?.area || 'N/A',
        p.propertyData?.rooms || 'N/A',
        p.propertyData?.district || 'N/A',
        p.predictedPrice
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictions_export_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('Predictions exported successfully')
  }

  const filteredPredictions = predictions.filter((prediction) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      prediction.user?.name?.toLowerCase().includes(searchLower) ||
      prediction.user?.email?.toLowerCase().includes(searchLower) ||
      prediction.propertyData?.district?.toLowerCase().includes(searchLower)
    )
    
    let matchesPrice = true
    if (priceFilter === 'low') {
      matchesPrice = prediction.predictedPrice < 300000
    } else if (priceFilter === 'medium') {
      matchesPrice = prediction.predictedPrice >= 300000 && prediction.predictedPrice < 600000
    } else if (priceFilter === 'high') {
      matchesPrice = prediction.predictedPrice >= 600000
    }
    
    return matchesSearch && matchesPrice
  })

  if (loading) return <Loading text="Loading predictions..." />

  const stats = {
    total: predictions.length,
    avgPrice: predictions.length > 0 
      ? predictions.reduce((sum, p) => sum + p.predictedPrice, 0) / predictions.length 
      : 0,
    highest: predictions.length > 0 
      ? Math.max(...predictions.map(p => p.predictedPrice)) 
      : 0,
    today: predictions.filter(p => {
      const today = new Date().toDateString()
      return new Date(p.createdAt).toDateString() === today
    }).length
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Predictions</h1>
        <p className="text-gray-600 mt-2">View and manage all property price predictions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Predictions</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Average Price</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(stats.avgPrice).replace('.00', '')}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Highest Price</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {formatCurrency(stats.highest).replace('.00', '')}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Today</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name, email, or district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="input min-w-[150px]"
            >
              <option value="all">All Prices</option>
              <option value="low">Low (&lt; $300k)</option>
              <option value="medium">Medium ($300k-$600k)</option>
              <option value="high">High (&gt; $600k)</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input min-w-[150px]"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-predictedPrice">Highest Price</option>
            <option value="predictedPrice">Lowest Price</option>
          </select>

          <button
            onClick={fetchPredictions}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportPredictions}
            disabled={filteredPredictions.length === 0}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Predictions Grid */}
      {filteredPredictions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPredictions.map((prediction) => (
            <div
              key={prediction._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow">
                    {prediction.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{prediction.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">{prediction.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(prediction)}
                    className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePrediction(prediction._id)}
                    disabled={deleting === prediction._id}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete prediction"
                  >
                    {deleting === prediction._id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 font-medium mb-1">Predicted Price</p>
                <p className="text-3xl font-bold text-primary-600">
                  {formatCurrency(prediction.predictedPrice)}
                </p>
                {prediction.confidence && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Confidence</span>
                      <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Home className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium text-gray-900">
                    {prediction.propertyData?.area || 'N/A'} sq ft
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Rooms:</span>
                  <span className="font-medium text-gray-900">
                    {prediction.propertyData?.rooms || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">District:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {prediction.propertyData?.district || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-600">Floor:</span>
                  <span className="font-medium text-gray-900">
                    {prediction.propertyData?.floor || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(prediction.createdAt)}
                </div>
                <div className="text-xs text-gray-400">
                  {formatDateTime(prediction.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium">
            {searchTerm || priceFilter !== 'all' ? 'No predictions found matching your filters' : 'No predictions found'}
          </p>
          {(searchTerm || priceFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setPriceFilter('all')
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Prediction Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Prediction Info */}
              <div className="p-4 bg-primary-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Prediction Result</h3>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">Predicted Price</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {formatCurrency(selectedPrediction.predictedPrice)}
                  </p>
                </div>
                {selectedPrediction.confidence && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Confidence Level</span>
                      <span className="font-semibold text-gray-900">
                        {(selectedPrediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${selectedPrediction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.area} sq ft</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rooms:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.rooms}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">District:</span>
                    <p className="font-medium text-gray-900 capitalize">{selectedPrediction.propertyData?.district}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Floor:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.floor}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Year Built:</span>
                    <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.year_built}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Parking:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPrediction.propertyData?.has_parking ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Balcony:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPrediction.propertyData?.has_balcony ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Prediction ID:</span>
                    <p className="font-mono text-xs text-gray-900">{selectedPrediction._id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium text-gray-900">{formatDateTime(selectedPrediction.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
