import pytest
import pandas as pd
import numpy as np
import joblib
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from predict import engineer_features, predict


class TestFeatureEngineering:
    """Test feature engineering functions"""
    
    def setup_method(self):
        """Setup test data"""
        self.sample_data = pd.DataFrame({
            'kitchen_area': [10],
            'bath_area': [5],
            'other_area': [50.5],
            'gas': ['Yes'],
            'hot_water': ['Yes'],
            'central_heating': ['Yes'],
            'extra_area': [10],
            'extra_area_count': [1],
            'year': [2010],
            'ceil_height': [2.7],
            'floor_max': [10],
            'floor': [5],
            'total_area': [65],
            'bath_count': [1],
            'extra_area_type_name': ['Balcony'],
            'district_name': ['District1'],
            'rooms_count': [3]
        })
    
    def test_engineer_features_creates_new_columns(self):
        """Test that feature engineering creates expected columns"""
        result = engineer_features(self.sample_data)
        
        expected_features = [
            'building_age', 'building_age_squared', 'area_per_room',
            'kitchen_ratio', 'bath_ratio', 'living_area', 'is_first_floor',
            'is_last_floor', 'floor_ratio', 'amenities_score', 'volume',
            'has_extra_area', 'extra_area_ratio', 'rooms_floor_interaction'
        ]
        
        for feature in expected_features:
            assert feature in result.columns, f"Missing feature: {feature}"
    
    def test_building_age_calculation(self):
        """Test building age calculation"""
        result = engineer_features(self.sample_data)
        expected_age = 2024 - 2010
        assert result['building_age'].iloc[0] == expected_age
    
    def test_amenities_score(self):
        """Test amenities score calculation"""
        result = engineer_features(self.sample_data)
        # All three amenities are 'Yes'
        assert result['amenities_score'].iloc[0] == 3
    
    def test_floor_indicators(self):
        """Test floor indicator features"""
        result = engineer_features(self.sample_data)
        assert result['is_first_floor'].iloc[0] == 0  # floor is 5, not 1
        assert result['is_last_floor'].iloc[0] == 0   # floor is 5, not 10
    
    def test_no_division_by_zero(self):
        """Test that division by zero is handled"""
        test_data = self.sample_data.copy()
        test_data['total_area'] = 0
        
        result = engineer_features(test_data)
        # Should not raise error - check that function completes
        assert result is not None
        assert len(result) == len(test_data)


class TestModelLoading:
    """Test model loading and prediction"""
    
    def test_models_exist(self):
        """Test that all model files exist"""
        model_files = [
            'models/xgboost_model.pkl',
            'models/lightgbm_model.pkl',
            'models/catboost_model.pkl',
            'models/label_encoders.pkl',
            'models/ensemble_weights.pkl'
        ]
        
        for file in model_files:
            assert os.path.exists(file), f"Model file not found: {file}"
    
    def test_models_loadable(self):
        """Test that models can be loaded"""
        try:
            xgb_model = joblib.load('models/xgboost_model.pkl')
            lgb_model = joblib.load('models/lightgbm_model.pkl')
            cat_model = joblib.load('models/catboost_model.pkl')
            label_encoders = joblib.load('models/label_encoders.pkl')
            weights = joblib.load('models/ensemble_weights.pkl')
            
            assert xgb_model is not None
            assert lgb_model is not None
            assert cat_model is not None
            assert label_encoders is not None
            assert weights is not None
        except Exception as e:
            pytest.fail(f"Failed to load models: {str(e)}")
    
    def test_ensemble_weights_sum(self):
        """Test that ensemble weights sum to approximately 1"""
        weights = joblib.load('models/ensemble_weights.pkl')
        weight_sum = sum(weights)
        assert abs(weight_sum - 1.0) < 0.01, f"Weights sum to {weight_sum}, expected ~1.0"


class TestPrediction:
    """Test prediction functionality"""
    
    def test_predict_returns_valid_prices(self):
        """Test that predictions are valid positive numbers using actual test data"""
        if not os.path.exists('data/test.csv'):
            pytest.skip("Test data not available")
        
        # Simply test that the predict function works on actual test data
        try:
            # Use a small subset of actual test data
            test_data = pd.read_csv('data/test.csv').head(10)
            test_data.to_csv('tmp_rovodev_test.csv', index=False)
            
            result = predict('tmp_rovodev_test.csv', 'tmp_rovodev_predictions.csv')
            
            # Check that predictions are positive
            assert (result['price'] > 0).all(), "Some predictions are not positive"
            
            # Check that predictions are reasonable (not too extreme)
            assert (result['price'] < 100_000_000).all(), "Some predictions are unreasonably high"
            assert (result['price'] > 1_000_000).all(), "Some predictions are unreasonably low"
            
            # Check correct number of predictions
            assert len(result) == 10, "Wrong number of predictions"
            
        finally:
            # Cleanup
            if os.path.exists('tmp_rovodev_test.csv'):
                os.remove('tmp_rovodev_test.csv')
            if os.path.exists('tmp_rovodev_predictions.csv'):
                os.remove('tmp_rovodev_predictions.csv')


class TestDataValidation:
    """Test data validation"""
    
    def test_required_features_present(self):
        """Test that all required features are present in training data"""
        if os.path.exists('data/data.csv'):
            df = pd.read_csv('data/data.csv')
            
            required_features = [
                'kitchen_area', 'bath_area', 'other_area', 'gas', 'hot_water',
                'central_heating', 'extra_area', 'extra_area_count', 'year',
                'ceil_height', 'floor_max', 'floor', 'total_area', 'bath_count',
                'extra_area_type_name', 'district_name', 'rooms_count', 'price'
            ]
            
            for feature in required_features:
                assert feature in df.columns, f"Missing required feature: {feature}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
