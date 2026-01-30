import { Card } from '../ui'
import { LineChart } from '../ui/Chart'
import { TrendingUp, Calendar } from 'lucide-react'

export default function PredictionChart({ predictions = [] }) {
  // Process data for chart
  const chartData = predictions.slice(0, 10).reverse().map((p, index) => ({
    label: `P${index + 1}`,
    value: Math.round(p.predictedPrice / 1000), // Convert to thousands
    date: new Date(p.createdAt).toLocaleDateString()
  }))

  const avgPrice = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.predictedPrice, 0) / predictions.length
    : 0

  const trend = predictions.length > 1
    ? ((predictions[0].predictedPrice - predictions[predictions.length - 1].predictedPrice) / predictions[predictions.length - 1].predictedPrice * 100)
    : 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prediction Trends</h3>
          <p className="text-sm text-gray-600 mt-1">Last 10 predictions</p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Average: ${(avgPrice / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-48">
          <LineChart 
            data={chartData} 
            color="#0ea5e9"
            showGrid={true}
            animated={true}
          />
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No data available</p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Showing last {chartData.length} predictions</span>
          <span>Values in thousands ($)</span>
        </div>
      </div>
    </Card>
  )
}
