/**
 * Health Check Routes
 * System health and status endpoints
 */

const express = require('express');
const router = express.Router();
const logger = require('../config/logger');
const aiService = require('../services/aiService');

/**
 * @desc    Basic health check
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * @desc    Detailed health check
 * @route   GET /api/health/detailed
 * @access  Public
 */
router.get('/detailed', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      ai: {
        status: 'checking...',
      },
    };

    // Check AI service
    try {
      const modelInfo = await aiService.getModelInfo();
      health.ai = {
        status: modelInfo.success ? 'ready' : 'unavailable',
        models: modelInfo.models?.length || 0,
      };
    } catch (error) {
      health.ai = {
        status: 'error',
        error: error.message,
      };
    }

    res.status(200).json(health);
  } catch (error) {
    logger.error(`Health check error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

module.exports = router;
