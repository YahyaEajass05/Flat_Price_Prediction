/**
 * Prediction Routes
 * Routes for AI price predictions
 */

const express = require('express');
const router = express.Router();
const {
  predictPrice,
  predictBatch,
  getPredictionHistory,
  getPredictionById,
  deletePrediction,
  getUserPredictionStats,
  getModelInfo,
} = require('../controllers/aiPredictionController');
const { protect } = require('../middleware/auth');
const { checkPredictionLimit } = require('../middleware/roleCheck');
const {
  predictionValidation,
  objectIdValidation,
  paginationValidation,
  validate,
} = require('../middleware/validation');

// Protect all prediction routes
router.use(protect);

// Prediction endpoints
router.post('/predict', checkPredictionLimit, predictionValidation, validate, predictPrice);
router.post('/predict-batch', checkPredictionLimit, predictBatch);

// Prediction history and stats
router.get('/history', paginationValidation, validate, getPredictionHistory);
router.get('/stats', getUserPredictionStats);
router.get('/model-info', getModelInfo);

// Single prediction operations
router.get('/:id', objectIdValidation('id'), validate, getPredictionById);
router.delete('/:id', objectIdValidation('id'), validate, deletePrediction);

module.exports = router;
