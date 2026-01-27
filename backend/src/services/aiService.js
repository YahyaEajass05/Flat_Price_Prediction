/**
 * AI Service - Direct integration with Python ML models
 * Uses python-shell to execute Python scripts
 */

const { PythonShell } = require('python-shell');
const path = require('path');
const logger = require('../config/logger');
const fs = require('fs');

class AIService {
  constructor() {
    this.pythonPath = process.env.PYTHON_PATH || 'python';
    this.modelPath = path.resolve(__dirname, '../../../models');
    this.scriptPath = path.resolve(__dirname, '../../../src');
    this.predictScript = path.join(this.scriptPath, 'predict.py');
    
    // Verify paths exist
    this.verifySetup();
  }

  verifySetup() {
    if (!fs.existsSync(this.modelPath)) {
      logger.error(`Model path does not exist: ${this.modelPath}`);
      throw new Error('ML models directory not found');
    }
    
    if (!fs.existsSync(this.scriptPath)) {
      logger.error(`Script path does not exist: ${this.scriptPath}`);
      throw new Error('Python scripts directory not found');
    }

    // Check for model files
    const requiredModels = [
      'xgboost_model.pkl',
      'lightgbm_model.pkl',
      'catboost_model.pkl',
      'label_encoders.pkl',
      'ensemble_weights.pkl'
    ];

    const missingModels = requiredModels.filter(model => 
      !fs.existsSync(path.join(this.modelPath, model))
    );

    if (missingModels.length > 0) {
      logger.warn(`Missing model files: ${missingModels.join(', ')}`);
      logger.warn('Please train the models first by running: python src/train_model.py');
    } else {
      logger.info('✅ All ML models found and ready');
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
      logger.info('🔮 Starting price prediction...');
      
      // Prepare Python script options
      const options = {
        mode: 'json',
        pythonPath: this.pythonPath,
        pythonOptions: ['-u'], // unbuffered output
        scriptPath: __dirname,
        args: []
      };

      // Create a temporary prediction script wrapper
      const predictionScript = `
import sys
import os
sys.path.insert(0, '${this.scriptPath.replace(/\\/g, '/')}')

import json
import joblib
import pandas as pd
import numpy as np

# Load models
models_path = '${this.modelPath.replace(/\\/g, '/')}'
xgb_model = joblib.load(f'{models_path}/xgboost_model.pkl')
lgb_model = joblib.load(f'{models_path}/lightgbm_model.pkl')
cat_model = joblib.load(f'{models_path}/catboost_model.pkl')
label_encoders = joblib.load(f'{models_path}/label_encoders.pkl')
weights = joblib.load(f'{models_path}/ensemble_weights.pkl')

# Input data
data = ${JSON.stringify(propertyData)}

# Create DataFrame
df = pd.DataFrame([data])

# Feature engineering
df['building_age'] = 2024 - df['year']
df['building_age_squared'] = df['building_age'] ** 2
df['area_per_room'] = df['total_area'] / (df['rooms_count'] + 1)
df['kitchen_ratio'] = df['kitchen_area'] / df['total_area'].replace(0, np.nan)
df['bath_ratio'] = df['bath_area'] / df['total_area'].replace(0, np.nan)
df['other_ratio'] = df['other_area'] / df['total_area'].replace(0, np.nan)
df['living_area'] = df['total_area'] - df['kitchen_area'] - df['bath_area']
df['is_first_floor'] = (df['floor'] == 1).astype(int)
df['is_last_floor'] = (df['floor'] == df['floor_max']).astype(int)
df['floor_ratio'] = df['floor'] / (df['floor_max'] + 1)
df['amenities_score'] = ((df['gas'] == 'Yes').astype(int) + (df['hot_water'] == 'Yes').astype(int) + (df['central_heating'] == 'Yes').astype(int))
df['volume'] = df['total_area'] * df['ceil_height']
df['has_extra_area'] = (df['extra_area'] > 0).astype(int)
df['extra_area_ratio'] = df['extra_area'] / (df['total_area'] + 1)
df['rooms_floor_interaction'] = df['rooms_count'] * df['floor']
df['age_floor_interaction'] = df['building_age'] * df['floor_max']

# Encode categorical variables
categorical_cols = ['gas', 'hot_water', 'central_heating', 'district_name', 'extra_area_type_name']
for col in categorical_cols:
    if col in df.columns and col in label_encoders:
        try:
            df[col] = label_encoders[col].transform(df[col].astype(str))
        except:
            df[col] = 0

# Make predictions
xgb_pred = float(xgb_model.predict(df)[0])
lgb_pred = float(lgb_model.predict(df)[0])
cat_pred = float(cat_model.predict(df)[0])

# Ensemble prediction
ensemble_pred = float(xgb_pred * weights[0] + lgb_pred * weights[1] + cat_pred * weights[2])
ensemble_pred = max(ensemble_pred, 0)

# Output result
result = {
    "predicted_price": int(ensemble_pred),
    "individual_predictions": {
        "xgboost": int(xgb_pred),
        "lightgbm": int(lgb_pred),
        "catboost": int(cat_pred)
    },
    "confidence": "high",
    "model_version": "1.0"
}

print(json.dumps(result))
`;

      // Write temporary script
      const tempScriptPath = path.join(__dirname, 'temp_predict.py');
      fs.writeFileSync(tempScriptPath, predictionScript);

      // Run Python script
      const results = await PythonShell.run(tempScriptPath, options);
      
      // Clean up temp file
      fs.unlinkSync(tempScriptPath);

      const predictionTime = Date.now() - startTime;
      logger.info(`✅ Prediction completed in ${predictionTime}ms`);

      if (!results || results.length === 0) {
        throw new Error('No prediction result returned from Python script');
      }

      const result = typeof results[0] === 'string' ? JSON.parse(results[0]) : results[0];
      
      return {
        success: true,
        predictedPrice: result.predicted_price,
        individualPredictions: result.individual_predictions,
        predictionTime,
        modelVersion: result.model_version || '1.0',
      };

    } catch (error) {
      const predictionTime = Date.now() - startTime;
      logger.error(`❌ Prediction failed: ${error.message}`);
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
      logger.info(`🔮 Starting batch prediction for ${propertiesArray.length} properties...`);
      
      const predictions = await Promise.all(
        propertiesArray.map(property => this.predictPrice(property))
      );

      const successCount = predictions.filter(p => p.success).length;
      const failedCount = predictions.length - successCount;
      
      const totalTime = Date.now() - startTime;
      logger.info(`✅ Batch prediction completed: ${successCount} success, ${failedCount} failed in ${totalTime}ms`);

      return {
        success: true,
        total: predictions.length,
        successful: successCount,
        failed: failedCount,
        predictions,
        totalTime,
      };

    } catch (error) {
      logger.error(`❌ Batch prediction failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        totalTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get model information
   * @returns {Promise<Object>} Model metadata
   */
  async getModelInfo() {
    try {
      const modelFiles = fs.readdirSync(this.modelPath);
      const modelStats = modelFiles
        .filter(file => file.endsWith('.pkl'))
        .map(file => {
          const stats = fs.statSync(path.join(this.modelPath, file));
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
          };
        });

      return {
        success: true,
        modelPath: this.modelPath,
        models: modelStats,
        version: '1.0',
        ensemble: ['xgboost', 'lightgbm', 'catboost'],
      };
    } catch (error) {
      logger.error(`Error getting model info: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
module.exports = new AIService();
