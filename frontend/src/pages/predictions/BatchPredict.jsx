import { useState } from 'react'
import { CheckCircle, XCircle, FileSpreadsheet, Trash2, Plus } from 'lucide-react'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import toast from 'react-hot-toast'
import { predictionsAPI } from '../../services/api'

export default function BatchPredict() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [showResults, setShowResults] = useState(false)

  // Add a new empty property
  const addProperty = () => {
    setProperties([
      ...properties,
      {
        id: Date.now(),
        total_area: '',
        kitchen_area: '',
        bath_area: '',
        rooms_count: '',
        district_name: 'Centralnyj',
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
      },
    ])
  }

  // Remove a property
  const removeProperty = (id) => {
    setProperties(properties.filter((p) => p.id !== id))
  }

  // Update property field
  const updateProperty = (id, field, value) => {
    setProperties(
      properties.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    )
  }


  // Download results as CSV
  const downloadResults = () => {
    if (!results || !results.results) return

    const headers = 'total_area,kitchen_area,bath_area,rooms_count,district_name,floor,floor_max,year,predicted_price,status,error\n'
    const rows = results.results
      .map((r) => {
        const prop = r.property
        return `${prop.total_area},${prop.kitchen_area},${prop.bath_area},${prop.rooms_count},${prop.district_name},${prop.floor},${prop.floor_max},${prop.year},${r.predictedPrice || ''},${r.success ? 'success' : 'failed'},${r.error || ''}`
      })
      .join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `batch_prediction_results_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Results downloaded successfully')
  }

  // Submit batch prediction
  const handleSubmit = async () => {
    if (properties.length === 0) {
      toast.error('Please add at least one property')
      return
    }

    if (properties.length > 100) {
      toast.error('Maximum 100 properties allowed per batch')
      return
    }

    // Validate all properties
    const invalidProperties = properties.filter(
      (p) =>
        !p.total_area ||
        !p.kitchen_area ||
        !p.bath_area ||
        !p.rooms_count ||
        !p.district_name ||
        !p.floor ||
        !p.floor_max ||
        !p.year
    )

    if (invalidProperties.length > 0) {
      toast.error('Please fill in all required fields for all properties')
      return
    }

    setLoading(true)
    try {
      // Add other_area calculation and defaults for each property
      const processedProperties = properties.map(p => ({
        ...p,
        other_area: parseFloat(p.total_area) - parseFloat(p.kitchen_area) - parseFloat(p.bath_area) - parseFloat(p.extra_area || 5),
        extra_area: parseFloat(p.extra_area || 5),
        extra_area_count: parseInt(p.extra_area_count || 1),
        ceil_height: parseFloat(p.ceil_height || 2.7),
        bath_count: parseInt(p.bath_count || 1),
        total_area: parseFloat(p.total_area),
        kitchen_area: parseFloat(p.kitchen_area),
        bath_area: parseFloat(p.bath_area),
        rooms_count: parseInt(p.rooms_count),
        floor: parseInt(p.floor),
        floor_max: parseInt(p.floor_max),
        year: parseInt(p.year),
      }))

      const response = await predictionsAPI.batchPredict({ properties: processedProperties })

      console.log('Batch prediction response:', response.data)

      if (response.data.success) {
        const data = response.data.data
        
        // Transform the predictions array to include property data and results
        const resultsWithProperties = (data.predictions || []).map((pred, index) => ({
          success: pred.status === 'success',
          predictedPrice: pred.predictedPrice,
          property: processedProperties[index] || {},
          error: pred.errorMessage || null,
        }))

        const transformedResults = {
          total: data.total || 0,
          successful: data.successful || 0,
          failed: data.failed || 0,
          totalTime: data.totalTime || 0,
          results: resultsWithProperties,
        }

        console.log('Transformed results:', transformedResults)

        setResults(transformedResults)
        setShowResults(true)
        toast.success(
          `Batch prediction completed! ${data.successful || 0} successful, ${data.failed || 0} failed`
        )
      } else {
        toast.error(response.data.message || 'Batch prediction failed')
      }
    } catch (error) {
      console.error('Batch prediction error:', error)
      toast.error(error.response?.data?.message || 'Failed to process batch prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Prediction</h1>
        <p className="text-gray-600">Predict prices for multiple properties at once (max 100 properties)</p>
      </div>

      {/* Add Properties Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Add Properties</h3>
                <p className="text-sm text-gray-600">Add properties manually to predict prices</p>
              </div>
            </div>
            <Button onClick={addProperty} icon={Plus} variant="primary">
              Add Property
            </Button>
          </div>
        </CardHeader>
        {properties.length > 0 && (
          <CardContent>
            <Alert variant="info">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} added
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Properties List */}
      {properties.length > 0 && !showResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Properties ({properties.length}/100)
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setProperties([])}
                  icon={Trash2}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
                <Button onClick={handleSubmit} loading={loading} variant="primary">
                  Predict All Prices
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {properties.map((property, index) => (
                <div
                  key={property.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Property #{index + 1}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeProperty(property.id)}
                      icon={Trash2}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Total Area (m²)*"
                      value={property.total_area}
                      onChange={(e) => updateProperty(property.id, 'total_area', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Kitchen Area (m²)*"
                      value={property.kitchen_area}
                      onChange={(e) => updateProperty(property.id, 'kitchen_area', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Bathroom Area (m²)*"
                      value={property.bath_area}
                      onChange={(e) => updateProperty(property.id, 'bath_area', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Number of Rooms*"
                      value={property.rooms_count}
                      onChange={(e) => updateProperty(property.id, 'rooms_count', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select
                      value={property.district_name}
                      onChange={(e) => updateProperty(property.id, 'district_name', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select District*</option>
                      <option value="Centralnyj">Centralnyj (Central)</option>
                      <option value="Petrogradskij">Petrogradskij</option>
                      <option value="Moskovskij">Moskovskij</option>
                      <option value="Nevskij">Nevskij</option>
                      <option value="Krasnoselskij">Krasnoselskij</option>
                      <option value="Vyborgskij">Vyborgskij</option>
                      <option value="Kirovskij">Kirovskij</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Floor Number*"
                      value={property.floor}
                      onChange={(e) => updateProperty(property.id, 'floor', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Total Floors*"
                      value={property.floor_max}
                      onChange={(e) => updateProperty(property.id, 'floor_max', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Year Built*"
                      value={property.year}
                      onChange={(e) => updateProperty(property.id, 'year', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ceiling Height (m)"
                      value={property.ceil_height}
                      onChange={(e) => updateProperty(property.id, 'ceil_height', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  {/* Optional Fields - Collapsible */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary-600">
                      Additional Options (Optional)
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                      <input
                        type="number"
                        placeholder="Bathrooms Count"
                        value={property.bath_count}
                        onChange={(e) => updateProperty(property.id, 'bath_count', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={property.gas}
                        onChange={(e) => updateProperty(property.id, 'gas', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Yes">Gas: Yes</option>
                        <option value="No">Gas: No</option>
                      </select>
                      <select
                        value={property.hot_water}
                        onChange={(e) => updateProperty(property.id, 'hot_water', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Yes">Hot Water: Yes</option>
                        <option value="No">Hot Water: No</option>
                      </select>
                      <select
                        value={property.central_heating}
                        onChange={(e) => updateProperty(property.id, 'central_heating', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Yes">Central Heating: Yes</option>
                        <option value="No">Central Heating: No</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Extra Area (m²)"
                        value={property.extra_area}
                        onChange={(e) => updateProperty(property.id, 'extra_area', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <select
                        value={property.extra_area_type_name}
                        onChange={(e) => updateProperty(property.id, 'extra_area_type_name', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="balcony">Balcony</option>
                        <option value="loggia">Loggia</option>
                      </select>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {showResults && results && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Prediction Results</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Completed in {results?.totalTime || 0}ms
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResults(false)
                    setResults(null)
                  }}
                >
                  New Batch
                </Button>
                <Button onClick={downloadResults} icon={Download} variant="primary">
                  Download Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{results?.total || 0}</p>
                  </div>
                  <FileSpreadsheet className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-900">{results?.successful || 0}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{results?.failed || 0}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results?.results?.map((result, index) => (
                    <tr key={index} className={result.success ? 'bg-white' : 'bg-red-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.property.total_area} m²</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.property.rooms_count}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.property.floor}/{result.property.floor_max}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.property.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.property.district_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {result.success ? `₽ ${result.predictedPrice?.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {result.success ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {properties.length === 0 && !showResults && (
        <Alert variant="info">
          <div className="space-y-2">
            <p className="font-semibold">How to use Batch Prediction:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Add Property" to add a new property to the batch</li>
              <li>Fill in all required property details for each property</li>
              <li>You can add up to 100 properties at once</li>
              <li>Click "Predict All Prices" to get predictions for all properties</li>
              <li>Download the results as a CSV file for your records</li>
            </ol>
          </div>
        </Alert>
      )}
    </div>
  )
}
