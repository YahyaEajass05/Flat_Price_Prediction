"""
Configuration file for the flat price prediction pipeline
Contains all hyperparameters, paths, and settings
"""

import os
from pathlib import Path

# ============================================================================
# PATHS
# ============================================================================
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
LOGS_DIR = BASE_DIR / "logs"
RESULTS_DIR = BASE_DIR / "results"

# Ensure directories exist
MODELS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)
RESULTS_DIR.mkdir(exist_ok=True)

# Data files
TRAIN_DATA_PATH = DATA_DIR / "data.csv"
TEST_DATA_PATH = DATA_DIR / "test.csv"

# ============================================================================
# DATA CONFIGURATION
# ============================================================================
RANDOM_STATE = 42
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.1  # From training set

# Target column
TARGET_COLUMN = "price"

# Original feature columns
ORIGINAL_FEATURES = [
    'kitchen_area', 'bath_area', 'other_area', 'gas', 'hot_water',
    'central_heating', 'extra_area', 'extra_area_count', 'year',
    'ceil_height', 'floor_max', 'floor', 'total_area', 'bath_count',
    'extra_area_type_name', 'district_name', 'rooms_count'
]

# Categorical columns
CATEGORICAL_FEATURES = [
    'gas', 'hot_water', 'central_heating', 
    'extra_area_type_name', 'district_name'
]

# Numerical columns
NUMERICAL_FEATURES = [
    'kitchen_area', 'bath_area', 'other_area', 'extra_area',
    'extra_area_count', 'year', 'ceil_height', 'floor_max',
    'floor', 'total_area', 'bath_count', 'rooms_count'
]

# ============================================================================
# FEATURE ENGINEERING CONFIGURATION
# ============================================================================
CURRENT_YEAR = 2024

FEATURE_ENGINEERING_CONFIG = {
    'building_age': True,
    'building_age_squared': True,
    'area_ratios': True,
    'floor_features': True,
    'amenities_score': True,
    'volume': True,
    'extra_area_features': True,
    'interaction_features': True,
    'polynomial_features': False,  # Can be enabled for more complexity
}

# ============================================================================
# MODEL HYPERPARAMETERS
# ============================================================================

# XGBoost
XGBOOST_PARAMS = {
    'n_estimators': 200,
    'max_depth': 7,
    'learning_rate': 0.05,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'random_state': RANDOM_STATE,
    'n_jobs': -1,
    'verbosity': 0,
    'early_stopping_rounds': 50  # Built-in parameter for XGBoost 2.0+
}

# LightGBM
LIGHTGBM_PARAMS = {
    'n_estimators': 200,
    'max_depth': 7,
    'learning_rate': 0.05,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'random_state': RANDOM_STATE,
    'n_jobs': -1,
    'verbose': -1
}

# CatBoost
CATBOOST_PARAMS = {
    'iterations': 200,
    'depth': 7,
    'learning_rate': 0.05,
    'random_state': RANDOM_STATE,
    'verbose': False,
    'allow_writing_files': False
}

# Random Forest and Gradient Boosting - REMOVED (not needed, ensemble is best)

# Linear Models - REMOVED (not needed, ensemble is best)

# Ensemble weights (equal by default)
ENSEMBLE_WEIGHTS = {
    'xgboost': 1/3,
    'lightgbm': 1/3,
    'catboost': 1/3
}

# ============================================================================
# TRAINING CONFIGURATION
# ============================================================================

# Models to train (Best model only - Ensemble)
# Ensemble consists of: XGBoost, LightGBM, and CatBoost
MODELS_TO_TRAIN = [
    'xgboost',
    'lightgbm',
    'catboost',
    'ensemble'
]

# Cross-validation
CV_FOLDS = 5
CV_SCORING = 'r2'

# Early stopping (for boosting models)
EARLY_STOPPING_ROUNDS = 50

# ============================================================================
# EVALUATION CONFIGURATION
# ============================================================================

# Metrics to calculate
EVALUATION_METRICS = [
    'r2_score',
    'rmse',
    'mae',
    'mape',
    'within_5_pct',
    'within_10_pct',
    'within_15_pct'
]

# Visualization settings
PLOT_SETTINGS = {
    'figsize': (12, 8),
    'dpi': 100,
    'style': 'seaborn-v0_8-darkgrid'
}

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOG_LEVEL = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# ============================================================================
# PREPROCESSING CONFIGURATION
# ============================================================================

# Data validation rules
VALIDATION_RULES = {
    'price': {
        'min': 1_000_000,
        'max': 100_000_000,
        'required': True
    },
    'total_area': {
        'min': 10,
        'max': 500,
        'required': True
    },
    'rooms_count': {
        'min': 0,  # 0 for studio apartments
        'max': 10,
        'required': True
    },
    'year': {
        'min': 1800,
        'max': 2025,
        'required': True
    },
    'floor': {
        'min': 1,
        'max': 100,
        'required': True
    },
    'ceil_height': {
        'min': 1.5,
        'max': 6.0,
        'required': True
    }
}

# Outlier detection
OUTLIER_METHOD = 'iqr'  # 'iqr' or 'zscore'
OUTLIER_THRESHOLD = 3  # IQR multiplier or Z-score threshold
REMOVE_OUTLIERS = False  # Set to True to remove outliers

# Missing value handling
MISSING_VALUE_STRATEGY = {
    'numerical': 'median',  # 'mean', 'median', 'mode', or 'drop'
    'categorical': 'mode'   # 'mode', 'constant', or 'drop'
}

# ============================================================================
# PREDICTION CONFIGURATION
# ============================================================================

# Prediction output format
PREDICTION_OUTPUT = {
    'include_confidence_intervals': True,
    'confidence_level': 0.95,
    'include_feature_importance': True
}

# ============================================================================
# VERSIONING
# ============================================================================

MODEL_VERSION = "1.0.0"
PIPELINE_VERSION = "1.0.0"

# ============================================================================
# EXPORT SETTINGS
# ============================================================================

# Model export formats
EXPORT_FORMATS = ['pkl', 'joblib']

# Results export formats
RESULTS_FORMATS = ['csv', 'json']

# Report formats
REPORT_FORMATS = ['txt', 'html', 'pdf']
