/**
 * Health Controller
 */
const { checkConnection } = require('../config/database');
const axios = require('axios');
const logger = require('../config/logger');

const healthCheck = async (req, res) => {
  try {
    const dbStatus = checkConnection();
    let pythonApiStatus = 'unknown';
    try {
      const response = await axios.get(`${process.env.PYTHON_API_URL}/api/health`, { timeout: 5000 });
      pythonApiStatus = response.data.status === 'healthy' ? 'connected' : 'error';
    } catch (error) {
      pythonApiStatus = 'disconnected';
    }

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: { status: dbStatus, type: 'MongoDB' },
      pythonAI: { status: pythonApiStatus, url: process.env.PYTHON_API_URL },
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', message: error.message });
  }
};

const getStatus = async (req, res) => {
  res.status(200).json({
    service: 'Flat Price Prediction Backend API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck, getStatus };
