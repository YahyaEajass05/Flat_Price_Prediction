import { useState, useEffect, useRef } from 'react'
import { predictionAPI } from '../../services/api'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import { staggerFadeIn } from '../../utils/animations'
import Loading from '../../components/common/Loading'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

const PredictionHistory = () => {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const listRef = useRef(null)

  useEffect(() => {
    loadPredictions()
  }, [page])

  useEffect(() => {
    if (listRef.current && predictions.length > 0) {
      staggerFadeIn(listRef.current.children, 600, 80)
    }
  }, [predictions])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const response = await predictionAPI.getHistory(page, 20)
      setPredictions(response.data)
      setTotalPages(response.pages)
    } catch (error) {
      console.error('Failed to load predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && predictions.length === 0) {
    return <Loading message="Loading prediction history..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prediction History</h1>
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">No Predictions Yet</h3>
          <p className="text-gray-600 mb-4">Start making predictions to see your history here</p>
          <a href="/predict" className="btn btn-primary">
            Make First Prediction
          </a>
        </div>
      ) : (
        <>
          {/* Predictions List */}
          <div ref={listRef} className="space-y-4">
            {predictions.map((prediction) => (
              <PredictionCard key={prediction._id} prediction={prediction} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const PredictionCard = ({ prediction }) => {
  const isSuccess = prediction.status === 'success'

  return (
    <div className="card hover:shadow-xl transition-all anime-hidden">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isSuccess ? (
              <FaCheckCircle className="text-green-500" />
            ) : (
              <FaTimesCircle className="text-red-500" />
            )}
            <span className={`badge ${isSuccess ? 'badge-success' : 'badge-danger'}`}>
              {prediction.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{formatDateTime(prediction.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(prediction.predictedPrice)}
          </p>
          <p className="text-xs text-gray-500">{prediction.predictionTime}ms</p>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600">Total Area</p>
          <p className="font-semibold">{prediction.propertyData.total_area} m²</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Rooms</p>
          <p className="font-semibold">{prediction.propertyData.rooms_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Floor</p>
          <p className="font-semibold">
            {prediction.propertyData.floor}/{prediction.propertyData.floor_max}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Year</p>
          <p className="font-semibold">{prediction.propertyData.year}</p>
        </div>
      </div>

      {/* Individual Predictions */}
      {isSuccess && prediction.individualPredictions && (
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-600">XGB: </span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(prediction.individualPredictions.xgboost)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">LGB: </span>
            <span className="font-semibold text-green-600">
              {formatCurrency(prediction.individualPredictions.lightgbm)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">CAT: </span>
            <span className="font-semibold text-purple-600">
              {formatCurrency(prediction.individualPredictions.catboost)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PredictionHistory
