/**
 * AI Service - Integration with Python Flask API
 * Makes HTTP requests to Flask API for predictions
 */

const axios = require('axios');
const logger = require('../config/logger');

class AIService {
  constructor() {
    // Python Flask API configuration
    this.pythonApiUrl = process.env.PYTHON_API_URL || 'http://localhost:8080';
    this.pythonApiTimeout = parseInt(process.env.PYTHON_API_TIMEOUT) || 30000;
    
    // Configure axios instance for Python API
    this.apiClient = axios.create({
      baseURL: this.pythonApiUrl,
      timeout: this.pythonApiTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    logger.info(`🔗 Python API configured: ${this.pythonApiUrl}`);
    
    // Check Python API health on startup
    this.checkAPIHealth();
  }

  /**
   * Check if Python API is available
   */
  async checkAPIHealth() {
    try {
      const response = await this.apiClient.get('/api/health', { timeout: 5000 });
      logger.info(`✅ Python API is healthy: ${response.data.status}`);
      return true;
    } catch (error) {
      logger.warn(`⚠️  Python API not available: ${error.message}`);
      logger.warn(`   Make sure to start Python API: python api/app.py`);
      return false;
    }
  }

  /**
   * Make a single price prediction
   * @param {Object} propertyData - Property features
   * @returns {Promise<Object>} Prediction result
   */
  async predictPrice(propertyData) {
    const startTime = Date.now();
    
    try {
      logger.info('🔮 Starting price prediction via Flask API...');
      logger.info(`Property data: ${JSON.stringify(propertyData)}`);
      
      // Make HTTP request to Python Flask API
      const response = await this.apiClient.post('/api/predict', propertyData);


      const predictionTime = Date.now() - startTime;
      
      // Extract data from Flask API response
      const apiData = response.data;
      
      logger.info(`✅ Prediction completed in ${predictionTime}ms`);
      logger.info(`Predicted price: ${apiData.predicted_price} ${apiData.currency}`);

      return {
        success: true,
        predictedPrice: apiData.predicted_price,
        individualPredictions: {
          xgboost: apiData.predicted_price,
          lightgbm: apiData.predicted_price,
          catboost: apiData.predicted_price,
        },
        predictionTime,
        modelVersion: apiData.model_accuracy || '1.0',
        confidence: apiData.confidence_interval || [0.85, 0.95],
        currency: apiData.currency || 'RUB',
      };

    } catch (error) {
      const predictionTime = Date.now() - startTime;
      logger.error(`❌ Prediction failed: ${error.message}`);
      
      // Handle specific error cases
      if (error.code === 'ECONNREFUSED') {
        logger.error('Python API is not running. Start it with: python api/app.py');
        return {
          success: false,
          error: 'Python API is not available. Please contact administrator.',
          predictionTime,
        };
      }
      
      if (error.response) {
        // API responded with error
        logger.error(`API Error: ${JSON.stringify(error.response.data)}`);
        return {
          success: false,
          error: error.response.data.error || error.response.data.message || 'Prediction failed',
          predictionTime,
        };
      }
      
      // Other errors
      logger.error(`Stack: ${error.stack}`);
      return {
        success: false,
        error: error.message,
        predictionTime,
      };
    }
  }

  /**
   * Make batch predictions
   * @param {Array} propertiesArray - Array of property data
   * @returns {Promise<Object>} Batch prediction results
   */
  async predictBatch(propertiesArray) {
    const startTime = Date.now();
    
    try {
      logger.info(`🔮 Starting batch prediction for ${propertiesArray.length} properties via Flask API...`);
      
      // Send batch request to Python API
      const response = await this.apiClient.post('/api/predict/batch', {
        properties: propertiesArray
      });
      
      const totalTime = Date.now() - startTime;
      const apiData = response.data;
      
      logger.info(`✅ Batch prediction completed: ${apiData.summary.successful} success, ${apiData.summary.failed} failed in ${totalTime}ms`);

      return {
        success: true,
        total: apiData.summary.total,
        successful: apiData.summary.successful,
        failed: apiData.summary.failed,
        predictions: apiData.results.map(result => ({
          success: result.status === 'success',
          predictedPrice: result.predicted_price || 0,
          error: result.error || null,
        })),
        totalTime,
      };

    } catch (error) {
      logger.error(`❌ Batch prediction failed: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'Python API is not available',
          totalTime: Date.now() - startTime,
        };
      }
      
      return {
        success: false,
        error: error.message,
        totalTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get model information from Python API
   * @returns {Promise<Object>} Model metadata
   */
  async getModelInfo() {
    try {
      const response = await this.apiClient.get('/api/model/info');
      
      return {
        success: true,
        ...response.data,
      };
    } catch (error) {
      logger.error(`Error getting model info: ${error.message}`);
      return {
        success: false,
        error: error.message,
        message: 'Python API is not available',
      };
    }
  }
}

// Export singleton instance
module.exports = new AIService();
