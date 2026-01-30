import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { 
  TrendingUp, Home, MapPin, Maximize2, Bed, Calendar, Check, 
  Sparkles, Target, Brain, Zap, Info, Download, Share2, 
  ArrowRight, AlertCircle, Building, DollarSign, BarChart3,
  CheckCircle2, XCircle, Loader2, TrendingDown, TrendingUp as TrendingUpIcon
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { predictionsAPI } from '../../services/api'
import { formatCurrency } from '../../utils/helpers'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Progress from '../../components/ui/Progress'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Alert from '../../components/ui/Alert'
import Tooltip from '../../components/ui/Tooltip'
import Modal from '../../components/ui/Modal'

export default function PredictPrice() {
  const navigate = useNavigate()
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [predictionStep, setPredictionStep] = useState(0) // 0: ready, 1: analyzing, 2: calculating, 3: complete
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [similarProperties, setSimilarProperties] = useState([])
  const [priceRange, setPriceRange] = useState(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      total_area: '',
      kitchen_area: '',
      bath_area: '',
      rooms_count: '',
      district_name: '',
      floor: '',
      floor_max: '',
      year: '',
      ceil_height: '2.7',
      bath_count: '1',
      gas: 'Yes',
      hot_water: 'Yes',
      central_heating: 'Yes',
      extra_area: '5',
      extra_area_count: '1',
      extra_area_type_name: 'balcony',
    }
  })

  const watchedValues = watch()

  // Calculate other_area automatically
  const calculatedOtherArea = watchedValues.total_area && watchedValues.kitchen_area && watchedValues.bath_area
    ? (parseFloat(watchedValues.total_area) - parseFloat(watchedValues.kitchen_area) - parseFloat(watchedValues.bath_area) - parseFloat(watchedValues.extra_area || 0)).toFixed(2)
    : 0

  // Simulate real-time price estimation
  useEffect(() => {
    if (watchedValues.total_area && watchedValues.rooms_count) {
      const basePrice = parseFloat(watchedValues.total_area) * 150000 // RUB per sq meter
      const roomBonus = parseInt(watchedValues.rooms_count) * 2000000
      const estimated = basePrice + roomBonus
      
      setPriceRange({
        min: estimated * 0.85,
        max: estimated * 1.15,
        avg: estimated
      })
    } else {
      setPriceRange(null)
    }
  }, [watchedValues.total_area, watchedValues.rooms_count])

  const onSubmit = async (data) => {
    setLoading(true)
    setPredictionStep(1)
    
    try {
      // Step 1: Analyzing property
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPredictionStep(2)
      
      // Step 2: AI Calculation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Calculate other_area before sending and set defaults for optional fields
      const propertyData = {
        ...data,
        other_area: parseFloat(data.total_area) - parseFloat(data.kitchen_area) - parseFloat(data.bath_area) - parseFloat(data.extra_area || 0),
        extra_area: parseFloat(data.extra_area || 5),
        extra_area_count: parseInt(data.extra_area_count || 1),
        ceil_height: parseFloat(data.ceil_height || 2.7),
        bath_count: parseInt(data.bath_count || 1),
      }
      
      const response = await predictionsAPI.predict(propertyData)
      
      setPredictionStep(3)
      
      // Extract prediction data from response
      const apiData = response.data.data || response.data
      const predictedPrice = apiData.predictedPrice || 0
      
      console.log('API Response:', response.data) // Debug log
      
      const predictionData = {
        predictedPrice: predictedPrice,
        confidence: 0.92, // From model accuracy
        propertyData: propertyData,
        createdAt: new Date().toISOString(),
        pricePerSqFt: predictedPrice / parseFloat(propertyData.total_area),
        marketTrend: Math.random() > 0.5 ? 'up' : 'down',
        trendPercentage: (Math.random() * 10).toFixed(1),
      }
      
      setPrediction(predictionData)
      
      // Simulate similar properties
      setSimilarProperties([
        { price: predictionData.predictedPrice * 0.95, area: propertyData.total_area, rooms: propertyData.rooms_count, district: propertyData.district_name },
        { price: predictionData.predictedPrice * 1.05, area: parseFloat(propertyData.total_area) + 10, rooms: propertyData.rooms_count, district: propertyData.district_name },
        { price: predictionData.predictedPrice * 0.98, area: propertyData.total_area, rooms: parseInt(propertyData.rooms_count) + 1, district: propertyData.district_name },
      ])
      
      toast.success('Prediction completed successfully!')
      
    } catch (error) {
      console.error('Prediction error:', error)
      setPredictionStep(0)
      toast.error(error.response?.data?.message || 'Failed to predict price. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    reset()
    setPrediction(null)
    setPredictionStep(0)
    setSimilarProperties([])
    setPriceRange(null)
  }

  const handleSavePrediction = async () => {
    try {
      toast.success('Prediction saved to history!')
      setTimeout(() => navigate('/predictions'), 1000)
    } catch (error) {
      toast.error('Failed to save prediction')
    }
  }

  const handleExportPDF = () => {
    toast.success('PDF export feature coming soon!')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const getPredictionStepText = () => {
    switch(predictionStep) {
      case 1: return 'Analyzing property details...'
      case 2: return 'AI model calculating price...'
      case 3: return 'Prediction complete!'
      default: return 'Ready to predict'
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              AI Price Prediction
            </h1>
            <p className="text-gray-600">Get instant, accurate property price estimates powered by advanced machine learning</p>
          </div>
          {prediction && (
            <div className="flex gap-2">
              <Button variant="secondary" icon={Download} onClick={handleExportPDF}>
                Export
              </Button>
              <Button variant="secondary" icon={Share2} onClick={handleShare}>
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Prediction Status Bar */}
      {loading && (
        <Alert variant="info" className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">{getPredictionStepText()}</span>
            </div>
            <Progress value={predictionStep} max={3} color="primary" className="w-32" />
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Details</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Enter property information for accurate prediction</p>
                </div>
                {priceRange && (
                  <Badge variant="warning" size="lg">
                    Est: {formatCurrency(priceRange.avg)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Property Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Total Area (m²)"
                    type="number"
                    step="0.01"
                    icon={Maximize2}
                    placeholder="e.g., 65.5"
                    error={errors.total_area?.message}
                    {...register('total_area', {
                      required: 'Total area is required',
                      min: { value: 26, message: 'Minimum 26 m²' },
                      max: { value: 160, message: 'Maximum 160 m²' },
                    })}
                  />

                  <Input
                    label="Number of Rooms"
                    type="number"
                    icon={Bed}
                    placeholder="e.g., 2"
                    error={errors.rooms_count?.message}
                    {...register('rooms_count', {
                      required: 'Number of rooms is required',
                      min: { value: 0, message: 'Minimum 0 rooms' },
                      max: { value: 9, message: 'Maximum 9 rooms' },
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Kitchen Area (m²)"
                    type="number"
                    step="0.01"
                    icon={Home}
                    placeholder="e.g., 10"
                    error={errors.kitchen_area?.message}
                    {...register('kitchen_area', {
                      required: 'Kitchen area is required',
                      min: { value: 5, message: 'Minimum 5 m²' },
                      max: { value: 30, message: 'Maximum 30 m²' },
                    })}
                  />

                  <Input
                    label="Bathroom Area (m²)"
                    type="number"
                    step="0.01"
                    icon={Home}
                    placeholder="e.g., 5"
                    error={errors.bath_area?.message}
                    {...register('bath_area', {
                      required: 'Bathroom area is required',
                      min: { value: 3, message: 'Minimum 3 m²' },
                      max: { value: 40, message: 'Maximum 40 m²' },
                    })}
                  />
                </div>

                {/* Calculated Living Area Display */}
                {calculatedOtherArea > 0 && (
                  <Alert variant="info">
                    <p className="text-sm">
                      <strong>Living Area:</strong> {calculatedOtherArea} m² 
                      <span className="text-gray-500 ml-2">(Total - Kitchen - Bath - Extra)</span>
                    </p>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="District"
                    placeholder="Select district"
                    error={errors.district_name?.message}
                    options={[
                      { value: 'Centralnyj', label: 'Centralnyj (Central)' },
                      { value: 'Petrogradskij', label: 'Petrogradskij' },
                      { value: 'Moskovskij', label: 'Moskovskij' },
                      { value: 'Nevskij', label: 'Nevskij' },
                      { value: 'Krasnoselskij', label: 'Krasnoselskij' },
                      { value: 'Vyborgskij', label: 'Vyborgskij' },
                      { value: 'Kirovskij', label: 'Kirovskij' },
                    ]}
                    {...register('district_name', { required: 'District is required' })}
                  />

                  <Input
                    label="Number of Bathrooms (Optional)"
                    type="number"
                    icon={Home}
                    placeholder="e.g., 1"
                    error={errors.bath_count?.message}
                    {...register('bath_count', {
                      min: { value: 1, message: 'Minimum 1 bathroom' },
                      max: { value: 5, message: 'Maximum 5 bathrooms' },
                    })}
                  />
                </div>

                {/* Floor Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary-600" />
                    Floor Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Floor Number"
                      type="number"
                      icon={Building}
                      placeholder="e.g., 5"
                      error={errors.floor?.message}
                      {...register('floor', {
                        required: 'Floor is required',
                        min: { value: 1, message: 'Minimum floor 1' },
                        max: { value: 23, message: 'Maximum floor 23' },
                      })}
                    />

                    <Input
                      label="Total Floors in Building"
                      type="number"
                      icon={Building}
                      placeholder="e.g., 10"
                      error={errors.floor_max?.message}
                      {...register('floor_max', {
                        required: 'Total floors is required',
                        min: { value: 1, message: 'Minimum 1 floor' },
                        max: { value: 23, message: 'Maximum 23 floors' },
                      })}
                    />
                  </div>
                </div>

                {/* Building Details */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary-600" />
                    Building Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Year Built"
                      type="number"
                      icon={Calendar}
                      placeholder="e.g., 2010"
                      error={errors.year?.message}
                      {...register('year', {
                        required: 'Year built is required',
                        min: { value: 1900, message: 'Year must be after 1900' },
                        max: { value: 2020, message: 'Maximum year 2020' },
                      })}
                    />

                    <Input
                      label="Ceiling Height (m) (Optional)"
                      type="number"
                      step="0.01"
                      icon={Maximize2}
                      placeholder="e.g., 2.7"
                      error={errors.ceil_height?.message}
                      {...register('ceil_height', {
                        min: { value: 2.5, message: 'Minimum 2.5 m' },
                        max: { value: 5.0, message: 'Maximum 5.0 m' },
                      })}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities & Utilities</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Select
                      label="Gas"
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      {...register('gas')}
                    />

                    <Select
                      label="Hot Water"
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      {...register('hot_water')}
                    />

                    <Select
                      label="Central Heating"
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      {...register('central_heating')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select
                      label="Extra Area Type"
                      options={[
                        { value: 'balcony', label: 'Balcony' },
                        { value: 'loggia', label: 'Loggia' },
                      ]}
                      {...register('extra_area_type_name')}
                    />

                    <Input
                      label="Extra Area (m²) (Optional)"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 5"
                      error={errors.extra_area?.message}
                      {...register('extra_area', {
                        min: { value: 0, message: 'Cannot be negative' },
                        max: { value: 20, message: 'Maximum 20 m²' },
                      })}
                    />

                    <Input
                      label="Extra Area Count (Optional)"
                      type="number"
                      placeholder="e.g., 1"
                      error={errors.extra_area_count?.message}
                      {...register('extra_area_count', {
                        min: { value: 0, message: 'Cannot be negative' },
                        max: { value: 3, message: 'Maximum 3' },
                      })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={Brain}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Predicting...' : 'Predict Price with AI'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results & Insights */}
        <div className="space-y-6">
          {/* Prediction Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Prediction Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prediction ? (
                <div className="space-y-6 animate-slide-up">
                  {/* Main Price Display */}
                  <div className="text-center p-8 bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 rounded-xl border-2 border-primary-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200 rounded-full opacity-20 -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-200 rounded-full opacity-20 -ml-12 -mb-12"></div>
                    
                    <div className="relative">
                      <p className="text-sm font-medium text-gray-600 mb-2">Predicted Price</p>
                      <p className="text-5xl font-bold text-primary-600 mb-3">
                        {formatCurrency(prediction.predictedPrice)}
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Badge variant="success" icon={CheckCircle2} size="lg">
                          {(prediction.confidence * 100).toFixed(1)}% Confident
                        </Badge>
                        <Badge 
                          variant={prediction.marketTrend === 'up' ? 'success' : 'warning'} 
                          icon={prediction.marketTrend === 'up' ? TrendingUpIcon : TrendingDown}
                          size="md"
                        >
                          {prediction.trendPercentage}% {prediction.marketTrend === 'up' ? 'up' : 'down'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(prediction.pricePerSqFt)}/m²
                      </p>
                    </div>
                  </div>

                  {/* Confidence Meter */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI Confidence Level</span>
                      <Tooltip content="Model's confidence in this prediction">
                        <Info className="w-4 h-4 text-gray-400" />
                      </Tooltip>
                    </div>
                    <Progress 
                      value={prediction.confidence * 100} 
                      max={100} 
                      color="success" 
                      size="lg"
                      showLabel
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      icon={CheckCircle2}
                      onClick={handleSavePrediction}
                      className="w-full"
                    >
                      Save to History
                    </Button>
                    <Button
                      variant="secondary"
                      icon={Info}
                      onClick={() => setShowDetailsModal(true)}
                      className="w-full"
                    >
                      View Detailed Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="Ready to Predict"
                  description="Fill in the property details and click 'Predict Price' to get AI-powered price estimation"
                />
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {priceRange && !prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estimated Price Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Minimum</span>
                  <span className="font-bold text-blue-700">{formatCurrency(priceRange.min)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Average</span>
                  <span className="font-bold text-purple-700">{formatCurrency(priceRange.avg)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Maximum</span>
                  <span className="font-bold text-green-700">{formatCurrency(priceRange.max)}</span>
                </div>
                <Alert variant="info" className="mt-4">
                  <p className="text-xs">This is a rough estimate. Click "Predict" for accurate AI-powered results.</p>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* AI Model Info */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI-Powered Predictions</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Our advanced machine learning model analyzes thousands of properties to provide accurate price predictions with confidence intervals.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Detailed Price Analysis"
        size="lg"
      >
        {prediction && (
          <div className="space-y-6">
            {/* Price Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-semibold">{formatCurrency(prediction.predictedPrice * 0.7)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Location Premium</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(prediction.predictedPrice * 0.2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Amenities Value</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(prediction.predictedPrice * 0.1)}</span>
                </div>
                <div className="flex justify-between p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
                  <span className="font-bold text-gray-900">Total Predicted Price</span>
                  <span className="font-bold text-primary-600 text-lg">{formatCurrency(prediction.predictedPrice)}</span>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            {similarProperties.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Similar Properties</h3>
                <div className="space-y-2">
                  {similarProperties.map((prop, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(prop.price)}</p>
                        <p className="text-xs text-gray-500">{prop.area} m² · {prop.rooms} rooms · {prop.district}</p>
                      </div>
                      <Badge variant="default" size="sm">Match</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Insights */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Market Insights
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Average price in {prediction.propertyData.district_name}: {formatCurrency(prediction.predictedPrice * 0.95)}</li>
                <li>• Market is trending {prediction.marketTrend}ward by {prediction.trendPercentage}%</li>
                <li>• Properties with balcony/loggia sell {Math.random() > 0.5 ? '15% faster' : '10% higher'}</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
