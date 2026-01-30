import { TrendingUp, Clock } from 'lucide-react'
import { Card, Badge } from '../ui'
import { formatCurrency, formatDateTime } from '../../utils/helpers'

export default function RecentActivity({ predictions = [] }) {
  if (!predictions || predictions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No recent predictions</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Badge variant="primary" dot>
          {predictions.length} predictions
        </Badge>
      </div>
      
      <div className="space-y-3">
        {predictions.slice(0, 5).map((prediction) => (
          <div
            key={prediction._id}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(prediction.predictedPrice)}
                </p>
                {prediction.confidence && (
                  <Badge variant="success" size="sm">
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600">
                {prediction.propertyData?.area} sq ft • {prediction.propertyData?.rooms} rooms • {prediction.propertyData?.district}
              </p>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatDateTime(prediction.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
