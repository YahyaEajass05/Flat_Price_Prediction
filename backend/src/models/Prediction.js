/**
 * Prediction Model - Store prediction history
 */
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Input Data
    propertyData: {
      kitchen_area: { type: Number, required: true },
      bath_area: { type: Number, required: true },
      other_area: { type: Number, required: true },
      total_area: { type: Number, required: true },
      rooms_count: { type: Number, required: true },
      bath_count: { type: Number, required: true },
      floor: { type: Number, required: true },
      floor_max: { type: Number, required: true },
      ceil_height: { type: Number, required: true },
      year: { type: Number, required: true },
      gas: { type: String, required: true },
      hot_water: { type: String, required: true },
      central_heating: { type: String, required: true },
      district_name: { type: String, required: true },
      extra_area: { type: Number, required: true },
      extra_area_count: { type: Number, required: true },
      extra_area_type_name: { type: String, required: true },
    },
    // Prediction Results
    predictedPrice: {
      type: Number,
      required: true,
    },
    individualPredictions: {
      xgboost: Number,
      lightgbm: Number,
      catboost: Number,
    },
    // Metadata
    predictionTime: {
      type: Number, // milliseconds
      default: 0,
    },
    modelVersion: {
      type: String,
      default: '1.0',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
predictionSchema.index({ user: 1, createdAt: -1 });
predictionSchema.index({ predictedPrice: 1 });
predictionSchema.index({ createdAt: -1 });

// Virtual for formatted price
predictionSchema.virtual('formattedPrice').get(function () {
  return `₹${this.predictedPrice.toLocaleString('en-IN')}`;
});

module.exports = mongoose.model('Prediction', predictionSchema);
