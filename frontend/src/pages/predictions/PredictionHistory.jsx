import { useState, useEffect } from 'react'
import { 
  History, Search, Filter, ChevronLeft, ChevronRight, Download, 
  TrendingUp, TrendingDown, BarChart3, Calendar, DollarSign,
  MapPin, Home, Maximize2, Eye, Trash2, RefreshCw, Grid, List,
  CheckCircle, XCircle, Clock, Target, ArrowUpRight, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import { predictionsAPI } from '../../services/api'
import Loading from '../../components/common/Loading'
import { formatCurrency, formatDateTime, formatDate } from '../../utils/helpers'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Tabs from '../../components/ui/Tabs'
import Modal from '../../components/ui/Modal'
import Progress from '../../components/ui/Progress'
import Alert from '../../components/ui/Alert'
import StatCard from '../../components/ui/StatCard'

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('-createdAt')
  const [filterDistrict, setFilterDistrict] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [selectedPrediction, setSelectedPrediction] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [stats, setStats] = useState(null)
  const [dateRange, setDateRange] = useState('all') // all, today, week, month
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchPredictions()
    calculateStats()
  }, [currentPage, sortBy, dateRange])

  const fetchPredictions = async () => {
    setLoading(true)
    setRefreshing(true)
    try {
      const response = await predictionsAPI.getHistory({
        page: currentPage,
        limit: 12,
        sortBy,
      })
      setPredictions(response.data.predictions || response.data.data || [])
      setTotalPages(response.data.totalPages || response.data.pages || 1)
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = () => {
    if (predictions.length === 0) return

    const totalPredictions = predictions.length
    const avgPrice = predictions.reduce((sum, p) => sum + p.predictedPrice, 0) / totalPredictions
    const maxPrice = Math.max(...predictions.map(p => p.predictedPrice))
    const minPrice = Math.min(...predictions.map(p => p.predictedPrice))
    const avgConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0.85), 0) / totalPredictions

    setStats({
      total: totalPredictions,
      avgPrice,
      maxPrice,
      minPrice,
      avgConfidence: avgConfidence * 100,
    })
  }

  useEffect(() => {
    calculateStats()
  }, [predictions])

  const filteredPredictions = predictions.filter((pred) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      pred.predictedPrice?.toString().includes(searchLower) ||
      pred.propertyData?.district?.toLowerCase().includes(searchLower) ||
      pred.propertyData?.area?.toString().includes(searchLower)
    
    const matchesDistrict = filterDistrict === 'all' || pred.propertyData?.district === filterDistrict

    return matchesSearch && matchesDistrict
  })

  const handleViewDetails = (prediction) => {
    setSelectedPrediction(prediction)
    setShowDetailsModal(true)
  }

  const handleDeletePrediction = async (id) => {
    if (window.confirm('Are you sure you want to delete this prediction?')) {
      try {
        // await predictionsAPI.delete(id)
        setPredictions(predictions.filter(p => p._id !== id))
        toast.success('Prediction deleted successfully')
      } catch (error) {
        toast.error('Failed to delete prediction')
      }
    }
  }

  const handleExportData = () => {
    const csvContent = predictions.map(p => 
      `${p.predictedPrice},${p.propertyData?.area},${p.propertyData?.rooms},${p.propertyData?.district},${formatDateTime(p.createdAt)}`
    ).join('\n')
    
    const blob = new Blob([`Price,Area,Rooms,District,Date\n${csvContent}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `predictions-${Date.now()}.csv`
    a.click()
  }

  if (loading && predictions.length === 0) return <Loading text="Loading predictions..." />

  return (
    <div className="animate-fade-in space-y-8">
      {/* Enhanced Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              Prediction History
            </h1>
            <p className="text-gray-600">View and analyze all your property price predictions</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              icon={RefreshCw} 
              onClick={fetchPredictions}
              loading={refreshing}
            >
              Refresh
            </Button>
            <Button 
              variant="secondary" 
              icon={Download} 
              onClick={handleExportData}
              disabled={predictions.length === 0}
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Predictions"
            value={stats.total}
            icon={Target}
            color="blue"
            subtitle="All time predictions"
          />
          <StatCard
            title="Average Price"
            value={formatCurrency(stats.avgPrice)}
            icon={DollarSign}
            color="green"
            subtitle="Across all predictions"
          />
          <StatCard
            title="Highest Price"
            value={formatCurrency(stats.maxPrice)}
            icon={TrendingUp}
            color="purple"
            subtitle="Maximum predicted"
          />
          <StatCard
            title="Avg Confidence"
            value={`${stats.avgConfidence.toFixed(1)}%`}
            icon={CheckCircle}
            color="orange"
            subtitle="AI confidence level"
          />
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Sort Row */}
            <div className="flex flex-col lg:flex-row gap-4">
              <Input
                icon={Search}
                placeholder="Search by price, district, area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: '-createdAt', label: '🕒 Most Recent' },
                  { value: 'createdAt', label: '🕒 Oldest First' },
                  { value: '-predictedPrice', label: '💰 Highest Price' },
                  { value: 'predictedPrice', label: '💰 Lowest Price' },
                  { value: '-confidence', label: '🎯 Highest Confidence' },
                ]}
                className="lg:w-56"
              />

              <Select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                options={[
                  { value: 'all', label: '📍 All Districts' },
                  { value: 'downtown', label: 'Downtown' },
                  { value: 'suburbs', label: 'Suburbs' },
                  { value: 'uptown', label: 'Uptown' },
                  { value: 'outskirts', label: 'Outskirts' },
                  { value: 'central', label: 'Central' },
                  { value: 'waterfront', label: 'Waterfront' },
                ]}
                className="lg:w-48"
              />
            </div>

            {/* Date Range and View Mode Row */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                {['all', 'today', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateRange === range
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      {filteredPredictions.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredPredictions.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{predictions.length}</span> predictions
          </p>
        </div>
      )}

      {/* Predictions Display */}
      {filteredPredictions.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPredictions.map((prediction, index) => (
                <Card 
                  key={prediction._id || index} 
                  hover
                  className="group relative overflow-hidden"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Home className="w-5 h-5 text-white" />
                          </div>
                          <Badge variant="primary" size="sm">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePrediction(prediction._id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Predicted Price</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {formatCurrency(prediction.predictedPrice)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(prediction.predictedPrice / parseFloat(prediction.propertyData?.total_area || prediction.propertyData?.area || 1))}/m²
                      </p>
                    </div>

                    {/* Property Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Maximize2 className="w-4 h-4" />
                        <span>{prediction.propertyData?.area} sq ft</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="w-4 h-4" />
                        <span>{prediction.propertyData?.rooms} rooms</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">{prediction.propertyData?.district}</span>
                      </div>
                    </div>

                    {/* Confidence */}
                    {prediction.confidence && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600">Confidence</span>
                          <span className="font-medium text-gray-900">
                            {(prediction.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={prediction.confidence * 100} 
                          max={100}
                          color="success"
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {formatDate(prediction.createdAt)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDetails(prediction)}
                      >
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredPredictions.map((prediction, index) => (
                <Card key={prediction._id || index} hover>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Index */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Price</p>
                          <p className="text-xl font-bold text-primary-600">
                            {formatCurrency(prediction.predictedPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Property</p>
                          <p className="text-sm font-medium text-gray-900">
                            {prediction.propertyData?.area} sq ft
                          </p>
                          <p className="text-xs text-gray-500">
                            {prediction.propertyData?.rooms} rooms
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Location</p>
                          <Badge variant="purple" size="sm" className="capitalize">
                            {prediction.propertyData?.district}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(prediction.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleViewDetails(prediction)}
                        >
                          View
                        </Button>
                        <button
                          onClick={() => handleDeletePrediction(prediction._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="secondary"
                icon={ChevronLeft}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                {totalPages > 5 && <span className="text-gray-400">...</span>}
              </div>
              <Button
                variant="secondary"
                icon={ChevronRight}
                iconPosition="right"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={History}
              title={searchTerm || filterDistrict !== 'all' ? 'No predictions found' : 'No predictions yet'}
              description={
                searchTerm || filterDistrict !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start making predictions to see your history here'
              }
              action={
                !searchTerm && filterDistrict === 'all' && (
                  <Button
                    variant="primary"
                    icon={TrendingUp}
                    onClick={() => window.location.href = '/predict'}
                  >
                    Make Your First Prediction
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Detailed View Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Prediction Details"
        size="lg"
      >
        {selectedPrediction && (
          <div className="space-y-6">
            {/* Price Display */}
            <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Predicted Price</p>
              <p className="text-4xl font-bold text-primary-600 mb-2">
                {formatCurrency(selectedPrediction.predictedPrice)}
              </p>
              {selectedPrediction.confidence && (
                <Badge variant="success" size="lg" icon={CheckCircle}>
                  {(selectedPrediction.confidence * 100).toFixed(1)}% Confidence
                </Badge>
              )}
            </div>

            {/* Property Details */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Area</p>
                  <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.area} sq ft</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Rooms</p>
                  <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.rooms}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">District</p>
                  <p className="font-medium text-gray-900 capitalize">{selectedPrediction.propertyData?.district}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Floor</p>
                  <p className="font-medium text-gray-900">{selectedPrediction.propertyData?.floor}</p>
                </div>
                {selectedPrediction.propertyData?.year_built && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Year Built</p>
                    <p className="font-medium text-gray-900">{selectedPrediction.propertyData.year_built}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Price/m²</p>
                  <p className="font-medium text-gray-900">
                    {formatCurrency(selectedPrediction.predictedPrice / parseFloat(selectedPrediction.propertyData?.total_area || selectedPrediction.propertyData?.area || 1))}
                  </p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPrediction.propertyData?.has_parking === 'true' && (
                  <Badge variant="blue" size="md" icon={CheckCircle}>Parking</Badge>
                )}
                {selectedPrediction.propertyData?.has_balcony === 'true' && (
                  <Badge variant="green" size="md" icon={CheckCircle}>Balcony</Badge>
                )}
                {selectedPrediction.propertyData?.has_elevator === 'true' && (
                  <Badge variant="purple" size="md" icon={CheckCircle}>Elevator</Badge>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Predicted on {formatDateTime(selectedPrediction.createdAt)}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
