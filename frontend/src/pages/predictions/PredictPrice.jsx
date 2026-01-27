import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import { predictionAPI } from '../../services/api'
import anime from 'animejs'
import { scrollReveal, createAdvancedTimeline } from '../../utils/advancedAnimations'
import { formatCurrency } from '../../utils/helpers'
import { FaHome, FaBed, FaBath, FaRuler, FaCalendar, FaMapMarkerAlt } from 'react-icons/fa'

const PredictPrice = () => {
  const [formData, setFormData] = useState({
    kitchen_area: '',
    bath_area: '',
    other_area: '',
    total_area: '',
    rooms_count: '',
    bath_count: '',
    floor: '',
    floor_max: '',
    ceil_height: '',
    year: '',
    gas: 'Yes',
    hot_water: 'Yes',
    central_heating: 'Yes',
    district_name: '',
    extra_area: '',
    extra_area_count: '',
    extra_area_type_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  
  const formRef = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => {
    // Advanced form entrance animation
    if (formRef.current) {
      const tl = createAdvancedTimeline({ autoplay: true })
      
      tl.add({
        targets: formRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
      })
      .add({
        targets: '.form-section',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100),
        duration: 600,
      }, '-=400')
    }

    // Scroll reveal for sections
    scrollReveal('.scroll-section')
  }, [])

  useEffect(() => {
    if (result && resultRef.current) {
      // Dramatic result animation with timeline
      const tl = createAdvancedTimeline({ autoplay: true })
      
      tl.add({
        targets: resultRef.current,
        scale: [0, 1.1, 1],
        opacity: [0, 1],
        rotateY: [180, 0],
        duration: 1000,
        easing: 'easeOutElastic(1, .6)',
      })
      .add({
        targets: '.price-badge',
        scale: [0, 1.2, 1],
        rotate: [0, 360],
        duration: 1200,
        easing: 'easeOutElastic(1, .5)',
      }, '-=600')
      .add({
        targets: '.individual-pred',
        opacity: [0, 1],
        translateX: [-50, 0],
        delay: anime.stagger(100),
        duration: 600,
      }, '-=400')

      // Continuous glow animation
      anime({
        targets: '.price-badge',
        boxShadow: [
          '0 0 20px rgba(16, 185, 129, 0.5)',
          '0 0 40px rgba(16, 185, 129, 0.8)',
          '0 0 20px rgba(16, 185, 129, 0.5)',
        ],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine',
      })
    }
  }, [result])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      // Convert string values to numbers
      const processedData = {
        ...formData,
        kitchen_area: parseFloat(formData.kitchen_area),
        bath_area: parseFloat(formData.bath_area),
        other_area: parseFloat(formData.other_area),
        total_area: parseFloat(formData.total_area),
        rooms_count: parseInt(formData.rooms_count),
        bath_count: parseInt(formData.bath_count),
        floor: parseInt(formData.floor),
        floor_max: parseInt(formData.floor_max),
        ceil_height: parseFloat(formData.ceil_height),
        year: parseInt(formData.year),
        extra_area: parseFloat(formData.extra_area),
        extra_area_count: parseInt(formData.extra_area_count),
      }

      const response = await predictionAPI.predict(processedData)
      setResult(response.data)
      toast.success('Prediction successful!')
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Prediction failed')
      // Shake animation on error
      anime({
        targets: formRef.current,
        translateX: [-10, 10, -10, 10, -5, 5, 0],
        duration: 500,
        easing: 'easeInOutSine',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8 scroll-section">
        <h1 className="text-4xl font-bold mb-2 animate-glow">Predict Flat Price 🔮</h1>
        <p className="text-gray-600">Enter property details to get AI-powered price prediction</p>
      </div>

      {/* Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="card opacity-0 relative overflow-hidden">
        {/* Animated gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500 opacity-10 animate-gradient"></div>
        <h2 className="form-section text-2xl font-bold mb-6 flex items-center gap-2 opacity-0">
          <FaHome className="text-primary-600 animate-bounce" />
          Property Details
        </h2>

        <div className="form-section grid md:grid-cols-3 gap-6 opacity-0">
          {/* Kitchen Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kitchen Area (sq m)
            </label>
            <input
              type="number"
              step="0.1"
              name="kitchen_area"
              value={formData.kitchen_area}
              onChange={handleChange}
              required
              className="input"
              placeholder="10"
            />
          </div>

          {/* Bath Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bath Area (sq m)
            </label>
            <input
              type="number"
              step="0.1"
              name="bath_area"
              value={formData.bath_area}
              onChange={handleChange}
              required
              className="input"
              placeholder="5"
            />
          </div>

          {/* Other Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Area (sq m)
            </label>
            <input
              type="number"
              step="0.1"
              name="other_area"
              value={formData.other_area}
              onChange={handleChange}
              required
              className="input"
              placeholder="50"
            />
          </div>

          {/* Total Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaRuler className="inline mr-2" />
              Total Area (sq m)
            </label>
            <input
              type="number"
              step="0.1"
              name="total_area"
              value={formData.total_area}
              onChange={handleChange}
              required
              className="input"
              placeholder="65"
            />
          </div>

          {/* Rooms Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBed className="inline mr-2" />
              Number of Rooms
            </label>
            <input
              type="number"
              name="rooms_count"
              value={formData.rooms_count}
              onChange={handleChange}
              required
              className="input"
              placeholder="3"
            />
          </div>

          {/* Bath Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaBath className="inline mr-2" />
              Number of Bathrooms
            </label>
            <input
              type="number"
              name="bath_count"
              value={formData.bath_count}
              onChange={handleChange}
              required
              className="input"
              placeholder="1"
            />
          </div>

          {/* Floor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor Number</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              required
              className="input"
              placeholder="5"
            />
          </div>

          {/* Floor Max */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Floors</label>
            <input
              type="number"
              name="floor_max"
              value={formData.floor_max}
              onChange={handleChange}
              required
              className="input"
              placeholder="10"
            />
          </div>

          {/* Ceiling Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ceiling Height (m)
            </label>
            <input
              type="number"
              step="0.1"
              name="ceil_height"
              value={formData.ceil_height}
              onChange={handleChange}
              required
              className="input"
              placeholder="2.7"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaCalendar className="inline mr-2" />
              Year Built
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="input"
              placeholder="2010"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              District Name
            </label>
            <input
              type="text"
              name="district_name"
              value={formData.district_name}
              onChange={handleChange}
              required
              className="input"
              placeholder="Centralnyj"
            />
          </div>

          {/* Extra Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Area (sq m)
            </label>
            <input
              type="number"
              step="0.1"
              name="extra_area"
              value={formData.extra_area}
              onChange={handleChange}
              required
              className="input"
              placeholder="10"
            />
          </div>

          {/* Gas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gas Available</label>
            <select name="gas" value={formData.gas} onChange={handleChange} className="input">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Hot Water */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hot Water</label>
            <select
              name="hot_water"
              value={formData.hot_water}
              onChange={handleChange}
              className="input"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Central Heating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Central Heating
            </label>
            <select
              name="central_heating"
              value={formData.central_heating}
              onChange={handleChange}
              className="input"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Extra Area Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Area Count
            </label>
            <input
              type="number"
              name="extra_area_count"
              value={formData.extra_area_count}
              onChange={handleChange}
              required
              className="input"
              placeholder="1"
            />
          </div>

          {/* Extra Area Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Area Type
            </label>
            <input
              type="text"
              name="extra_area_type_name"
              value={formData.extra_area_type_name}
              onChange={handleChange}
              required
              className="input"
              placeholder="balcony"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-4 text-lg font-semibold disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Predicting Price...
              </span>
            ) : (
              '🔮 Predict Price'
            )}
          </button>
        </div>
      </form>

      {/* Result */}
      {result && (
        <div ref={resultRef} className="card bg-gradient-to-br from-green-50 to-blue-50 opacity-0 relative overflow-hidden">
          {/* Success particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-500 rounded-full opacity-30 animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">Prediction Result</h2>

          {/* Main Price */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Predicted Price</p>
            <div className="price-badge inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-8 py-4 rounded-2xl">
              <span className="text-5xl font-bold">{formatCurrency(result.predictedPrice)}</span>
            </div>
          </div>

          {/* Individual Predictions */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="individual-pred bg-white p-4 rounded-lg text-center opacity-0 transform hover:scale-105 transition-transform cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">XGBoost</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(result.individualPredictions.xgboost)}
              </p>
            </div>
            <div className="individual-pred bg-white p-4 rounded-lg text-center opacity-0 transform hover:scale-105 transition-transform cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">LightGBM</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(result.individualPredictions.lightgbm)}
              </p>
            </div>
            <div className="individual-pred bg-white p-4 rounded-lg text-center opacity-0 transform hover:scale-105 transition-transform cursor-pointer">
              <p className="text-sm text-gray-600 mb-1">CatBoost</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(result.individualPredictions.catboost)}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-gray-600 border-t pt-4">
            <span>Prediction Time: {result.predictionTime}ms</span>
            <span>Model Version: {result.modelVersion}</span>
            <span className="badge badge-success">Success</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictPrice
