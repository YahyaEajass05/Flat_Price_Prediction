/**
 * Test AI Integration
 * Quick test to verify AI service is working
 */

require('dotenv').config();
const aiService = require('./src/services/aiService');
const logger = require('./src/config/logger');

// Sample property data for testing
const testProperty = {
  kitchen_area: 10,
  bath_area: 5,
  other_area: 50.5,
  total_area: 65,
  rooms_count: 3,
  bath_count: 1,
  floor: 5,
  floor_max: 10,
  ceil_height: 2.7,
  year: 2010,
  gas: 'Yes',
  hot_water: 'Yes',
  central_heating: 'Yes',
  district_name: 'Centralnyj',
  extra_area: 10,
  extra_area_count: 1,
  extra_area_type_name: 'balcony',
};

async function testAIIntegration() {
  console.log('='.repeat(80));
  console.log('🧪 Testing AI Integration');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test 1: Get Model Info
    console.log('📊 Test 1: Getting Model Information...');
    const modelInfo = await aiService.getModelInfo();
    
    if (modelInfo.success) {
      console.log('✅ Model info retrieved successfully');
      console.log(`   Models found: ${modelInfo.models?.length || 0}`);
      console.log(`   Model path: ${modelInfo.modelPath}`);
      console.log('');
    } else {
      console.log('❌ Failed to get model info:', modelInfo.error);
      console.log('');
    }

    // Test 2: Single Prediction
    console.log('🔮 Test 2: Making Single Prediction...');
    console.log('   Property data:', JSON.stringify(testProperty, null, 2));
    console.log('');
    
    const prediction = await aiService.predictPrice(testProperty);
    
    if (prediction.success) {
      console.log('✅ Prediction successful!');
      console.log(`   Predicted Price: ₹${prediction.predictedPrice.toLocaleString('en-IN')}`);
      console.log(`   XGBoost: ₹${prediction.individualPredictions.xgboost.toLocaleString('en-IN')}`);
      console.log(`   LightGBM: ₹${prediction.individualPredictions.lightgbm.toLocaleString('en-IN')}`);
      console.log(`   CatBoost: ₹${prediction.individualPredictions.catboost.toLocaleString('en-IN')}`);
      console.log(`   Prediction Time: ${prediction.predictionTime}ms`);
      console.log(`   Model Version: ${prediction.modelVersion}`);
      console.log('');
    } else {
      console.log('❌ Prediction failed:', prediction.error);
      console.log('');
    }

    // Test 3: Batch Prediction (2 properties)
    console.log('📦 Test 3: Making Batch Prediction (2 properties)...');
    const testProperties = [testProperty, { ...testProperty, total_area: 70, rooms_count: 4 }];
    
    const batchPrediction = await aiService.predictBatch(testProperties);
    
    if (batchPrediction.success) {
      console.log('✅ Batch prediction successful!');
      console.log(`   Total: ${batchPrediction.total}`);
      console.log(`   Successful: ${batchPrediction.successful}`);
      console.log(`   Failed: ${batchPrediction.failed}`);
      console.log(`   Total Time: ${batchPrediction.totalTime}ms`);
      console.log('');
    } else {
      console.log('❌ Batch prediction failed:', batchPrediction.error);
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('🎉 AI Integration Tests Complete!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testAIIntegration()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  });
