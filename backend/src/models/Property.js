/**
 * Property Model - MongoDB schema for property data
 */
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  // Property Details (17 required fields for AI prediction)
  kitchen_area: { type: Number, required: true, min: 0 },
  bath_area: { type: Number, required: true, min: 0 },
  other_area: { type: Number, required: true, min: 0 },
  total_area: { type: Number, required: true, min: 10, max: 500 },
  rooms_count: { type: Number, required: true, min: 0, max: 10 },
  bath_count: { type: Number, required: true, min: 1 },
  floor: { type: Number, required: true, min: 1 },
  floor_max: { type: Number, required: true, min: 1 },
  ceil_height: { type: Number, required: true, min: 1.5, max: 6.0 },
  year: { type: Number, required: true, min: 1800, max: 2025 },
  gas: { type: String, required: true, enum: ['Yes', 'No'] },
  hot_water: { type: String, required: true, enum: ['Yes', 'No'] },
  central_heating: { type: String, required: true, enum: ['Yes', 'No'] },
  district_name: { 
    type: String, 
    required: true, 
    enum: ['Centralnyj', 'Petrogradskij', 'Moskovskij', 'Nevskij', 'Krasnoselskij', 'Vyborgskij', 'Kirovskij']
  },
  extra_area: { type: Number, required: true, min: 0, default: 0 },
  extra_area_count: { type: Number, required: true, min: 0, default: 0 },
  extra_area_type_name: { type: String, required: true, enum: ['balcony', 'loggia', 'none'], default: 'none' },
  
  // Prediction Result
  predicted_price: { type: Number, default: null },
  prediction_confidence: {
    lower: Number,
    upper: Number,
  },
  prediction_date: { type: Date, default: null },
  model_used: { type: String, enum: ['xgboost', 'lightgbm', 'catboost', 'ensemble'], default: 'ensemble' },
  
  // Status
  status: { type: String, enum: ['draft', 'predicted', 'saved', 'archived'], default: 'draft' },
  name: { type: String, trim: true },
  description: { type: String, trim: true },
  tags: [String],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Method to prepare data for Python API
propertySchema.methods.getPredictionData = function() {
  return {
    kitchen_area: this.kitchen_area,
    bath_area: this.bath_area,
    other_area: this.other_area,
    total_area: this.total_area,
    rooms_count: this.rooms_count,
    bath_count: this.bath_count,
    floor: this.floor,
    floor_max: this.floor_max,
    ceil_height: this.ceil_height,
    year: this.year,
    gas: this.gas,
    hot_water: this.hot_water,
    central_heating: this.central_heating,
    district_name: this.district_name,
    extra_area: this.extra_area,
    extra_area_count: this.extra_area_count,
    extra_area_type_name: this.extra_area_type_name,
  };
};

module.exports = mongoose.model('Property', propertySchema);
