/**
 * Prediction Controller - AI prediction integration
 */
const axios = require('axios');
const logger = require('../config/logger');
const Property = require('../models/Property');

const predictPrice = async (req, res, next) => {
  try {
    const propertyData = req.body;
    const pythonApiUrl = `${process.env.PYTHON_API_URL}/api/predict`;
    
    const response = await axios.post(pythonApiUrl, propertyData, {
      timeout: parseInt(process.env.PYTHON_API_TIMEOUT) || 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    const prediction = response.data;

    // Optionally save to database
    if (req.body.saveToDatabase && req.user) {
      const property = new Property({
        ...propertyData,
        userId: req.user._id,
        predicted_price: prediction.predicted_price,
        prediction_confidence: prediction.confidence_interval,
        prediction_date: new Date(),
        model_used: 'ensemble',
        status: 'predicted',
      });
      await property.save();
    }

    res.status(200).json({
      success: true,
      data: {
        predicted_price: prediction.predicted_price,
        confidence_interval: prediction.confidence_interval,
        currency: prediction.currency || 'RUB',
        model_accuracy: prediction.model_accuracy,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'AI service unavailable' });
    }
    next(error);
  }
};

const predictBatch = async (req, res, next) => {
  try {
    const { properties } = req.body;
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({ success: false, message: 'Properties array required' });
    }
    if (properties.length > 100) {
      return res.status(400).json({ success: false, message: 'Maximum 100 properties per batch' });
    }

    const pythonApiUrl = `${process.env.PYTHON_API_URL}/api/predict/batch`;
    const response = await axios.post(pythonApiUrl, { properties }, {
      timeout: parseInt(process.env.PYTHON_API_TIMEOUT) * 2,
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ success: false, message: 'AI service unavailable' });
    }
    next(error);
  }
};

const getPredictionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const predictions = await Property.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Property.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { predictPrice, predictBatch, getPredictionHistory };
