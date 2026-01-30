/**
 * AI Prediction Controller
 * Handles price predictions using the AI service
 */

const Prediction = require('../models/Prediction');
const User = require('../models/User');
const aiService = require('../services/aiService');
const logger = require('../config/logger');

/**
 * @desc    Make a single price prediction
 * @route   POST /api/predictions/predict
 * @access  Private
 */
exports.predictPrice = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const propertyData = req.body;
    const user = req.user;

    // Check if user can make predictions (for non-admin users)
    if (user.role !== 'admin' && user.predictionCount >= user.predictionLimit) {
      return res.status(429).json({
        success: false,
        message: `Prediction limit reached. You have used ${user.predictionCount} out of ${user.predictionLimit} predictions.`,
        data: {
          used: user.predictionCount,
          limit: user.predictionLimit,
          remaining: 0,
        },
      });
    }

    logger.info(`Prediction request from user: ${user.email}`);

    // Call AI service for prediction
    const result = await aiService.predictPrice(propertyData);

    if (!result.success) {
      // Save failed prediction
      await Prediction.create({
        user: user._id,
        propertyData,
        predictedPrice: 0,
        status: 'failed',
        errorMessage: result.error,
        predictionTime: result.predictionTime,
      });

      logger.error(`Prediction failed for user ${user.email}: ${result.error}`);

      return res.status(500).json({
        success: false,
        message: 'Prediction failed. Please check your input data or try again.',
        error: result.error,
        details: 'The AI model encountered an error. Please ensure all fields are filled correctly.',
      });
    }

    // Save successful prediction to database
    const prediction = await Prediction.create({
      user: user._id,
      propertyData,
      predictedPrice: result.predictedPrice,
      individualPredictions: result.individualPredictions,
      predictionTime: result.predictionTime,
      modelVersion: result.modelVersion,
      status: 'success',
    });

    // Increment user's prediction count
    if (user.role !== 'admin') {
      user.predictionCount += 1;
      await user.save({ validateBeforeSave: false });
    }

    const totalTime = Date.now() - startTime;
    logger.info(`Prediction completed successfully in ${totalTime}ms`);

    res.status(200).json({
      success: true,
      message: 'Price predicted successfully',
      data: {
        predictionId: prediction._id,
        predictedPrice: result.predictedPrice,
        formattedPrice: `₹${result.predictedPrice.toLocaleString('en-IN')}`,
        individualPredictions: result.individualPredictions,
        predictionTime: result.predictionTime,
        modelVersion: result.modelVersion,
        remaining: user.role === 'admin' ? 'unlimited' : user.predictionLimit - user.predictionCount,
      },
    });
  } catch (error) {
    logger.error(`Prediction error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Make batch predictions
 * @route   POST /api/predictions/predict-batch
 * @access  Private
 */
exports.predictBatch = async (req, res, next) => {
  try {
    const { properties } = req.body;
    const user = req.user;

    if (!properties || !Array.isArray(properties)) {
      return res.status(400).json({
        success: false,
        message: 'Properties array is required',
      });
    }

    if (properties.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Properties array cannot be empty',
      });
    }

    if (properties.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 properties allowed per batch',
      });
    }

    // Check prediction limit for non-admin users
    if (user.role !== 'admin') {
      const remaining = user.predictionLimit - user.predictionCount;
      if (remaining < properties.length) {
        return res.status(429).json({
          success: false,
          message: `Insufficient prediction credits. You have ${remaining} predictions remaining but requested ${properties.length}.`,
        });
      }
    }

    logger.info(`Batch prediction request from user: ${user.email} for ${properties.length} properties`);

    // Call AI service for batch prediction
    const result = await aiService.predictBatch(properties);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Batch prediction failed',
        error: result.error,
      });
    }

    // Save predictions to database
    const savedPredictions = [];
    for (let i = 0; i < result.predictions.length; i++) {
      const pred = result.predictions[i];
      const propertyData = properties[i];

      if (pred.success) {
        const prediction = await Prediction.create({
          user: user._id,
          propertyData,
          predictedPrice: pred.predictedPrice,
          individualPredictions: pred.individualPredictions,
          predictionTime: pred.predictionTime,
          modelVersion: pred.modelVersion,
          status: 'success',
        });
        savedPredictions.push(prediction);
      } else {
        await Prediction.create({
          user: user._id,
          propertyData,
          predictedPrice: 0,
          status: 'failed',
          errorMessage: pred.error,
        });
      }
    }

    // Update user's prediction count
    if (user.role !== 'admin') {
      user.predictionCount += result.successful;
      await user.save({ validateBeforeSave: false });
    }

    logger.info(`Batch prediction completed: ${result.successful} successful, ${result.failed} failed`);

    res.status(200).json({
      success: true,
      message: 'Batch prediction completed',
      data: {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        predictions: savedPredictions,
        totalTime: result.totalTime,
        remaining: user.role === 'admin' ? 'unlimited' : user.predictionLimit - user.predictionCount,
      },
    });
  } catch (error) {
    logger.error(`Batch prediction error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user's prediction history
 * @route   GET /api/predictions/history
 * @access  Private
 */
exports.getPredictionHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const predictions = await Prediction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prediction.countDocuments(query);

    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: predictions,
    });
  } catch (error) {
    logger.error(`Get prediction history error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single prediction by ID
 * @route   GET /api/predictions/:id
 * @access  Private
 */
exports.getPredictionById = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id).populate('user', 'name email');

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found',
      });
    }

    // Check if user owns this prediction or is admin
    if (prediction.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this prediction',
      });
    }

    res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    logger.error(`Get prediction by ID error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete a prediction
 * @route   DELETE /api/predictions/:id
 * @access  Private
 */
exports.deletePrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found',
      });
    }

    // Check if user owns this prediction or is admin
    if (prediction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this prediction',
      });
    }

    await prediction.deleteOne();

    logger.info(`Prediction deleted: ${prediction._id}`);

    res.status(200).json({
      success: true,
      message: 'Prediction deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete prediction error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get prediction statistics for user
 * @route   GET /api/predictions/stats
 * @access  Private
 */
exports.getUserPredictionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const totalPredictions = await Prediction.countDocuments({ user: userId });
    const successfulPredictions = await Prediction.countDocuments({ user: userId, status: 'success' });
    const failedPredictions = await Prediction.countDocuments({ user: userId, status: 'failed' });

    // Average predicted price
    const avgPrice = await Prediction.aggregate([
      { $match: { user: userId, status: 'success' } },
      { $group: { _id: null, avgPrice: { $avg: '$predictedPrice' } } },
    ]);

    // Min and Max prices
    const priceRange = await Prediction.aggregate([
      { $match: { user: userId, status: 'success' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$predictedPrice' },
          maxPrice: { $max: '$predictedPrice' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalPredictions,
        successful: successfulPredictions,
        failed: failedPredictions,
        averagePrice: avgPrice[0]?.avgPrice || 0,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        predictionLimit: req.user.predictionLimit,
        remaining: req.user.role === 'admin' ? 'unlimited' : req.user.predictionLimit - req.user.predictionCount,
      },
    });
  } catch (error) {
    logger.error(`Get user prediction stats error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get AI model information
 * @route   GET /api/predictions/model-info
 * @access  Private
 */
exports.getModelInfo = async (req, res, next) => {
  try {
    const modelInfo = await aiService.getModelInfo();

    res.status(200).json({
      success: true,
      data: modelInfo,
    });
  } catch (error) {
    logger.error(`Get model info error: ${error.message}`);
    next(error);
  }
};
