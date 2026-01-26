"""
Prediction script using trained models
Make predictions on new data
"""

import sys
import argparse
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.config import MODELS_DIR
from src.preprocessing import DataPreprocessor
from src.utils import setup_logging, print_header
import logging


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Make predictions using trained models')
    
    parser.add_argument('input', type=str,
                       help='Path to input CSV file')
    parser.add_argument('output', type=str,
                       help='Path to output CSV file')
    parser.add_argument('--model', type=str, default='ensemble',
                       help='Model to use for prediction (default: ensemble)')
    parser.add_argument('--models-dir', type=str, default=str(MODELS_DIR),
                       help='Directory containing trained models')
    parser.add_argument('--log-level', type=str, default='INFO',
                       choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
                       help='Logging level')
    
    return parser.parse_args()


def load_ensemble_models(models_dir: Path):
    """Load ensemble models"""
    xgb_model = joblib.load(models_dir / 'xgboost_model.pkl')
    lgb_model = joblib.load(models_dir / 'lightgbm_model.pkl')
    cat_model = joblib.load(models_dir / 'catboost_model.pkl')
    
    # Load weights if available
    weights_path = models_dir / 'ensemble_weights.pkl'
    if weights_path.exists():
        weights = joblib.load(weights_path)
    else:
        weights = {'xgboost': 1/3, 'lightgbm': 1/3, 'catboost': 1/3}
    
    return {
        'xgboost': xgb_model,
        'lightgbm': lgb_model,
        'catboost': cat_model,
        'weights': weights
    }


def predict_ensemble(models_dict, X):
    """Make ensemble prediction"""
    # Convert to numpy array to avoid feature name issues
    if hasattr(X, 'values'):
        X_array = X.values
    else:
        X_array = X
    
    xgb_pred = models_dict['xgboost'].predict(X_array)
    lgb_pred = models_dict['lightgbm'].predict(X_array)
    cat_pred = models_dict['catboost'].predict(X_array)
    
    weights = models_dict['weights']
    
    if isinstance(weights, dict):
        ensemble_pred = (weights.get('xgboost', 1/3) * xgb_pred + 
                        weights.get('lightgbm', 1/3) * lgb_pred + 
                        weights.get('catboost', 1/3) * cat_pred)
    else:
        ensemble_pred = (xgb_pred + lgb_pred + cat_pred) / 3
    
    return ensemble_pred


def main():
    """Main prediction pipeline"""
    
    # Parse arguments
    args = parse_args()
    
    # Setup logging
    logger = setup_logging(console_level=args.log_level)
    
    print_header("FLAT PRICE PREDICTION - MAKING PREDICTIONS", "=", 80)
    
    try:
        models_dir = Path(args.models_dir)
        
        # Check if models directory exists
        if not models_dir.exists():
            raise FileNotFoundError(f"Models directory not found: {models_dir}")
        
        # ====================================================================
        # STEP 1: LOAD DATA
        # ====================================================================
        print_header("STEP 1: LOADING DATA", "-", 80)
        logger.info(f"Loading data from {args.input}")
        
        df = pd.read_csv(args.input)
        logger.info(f"Loaded {len(df):,} records")
        
        # ====================================================================
        # STEP 2: PREPROCESS DATA
        # ====================================================================
        print_header("STEP 2: PREPROCESSING DATA", "-", 80)
        
        # Load preprocessor
        preprocessor = DataPreprocessor()
        preprocessor.load_encoders(models_dir / 'label_encoders.pkl')
        
        # Transform data
        X = preprocessor.transform(df)
        logger.info(f"Prepared {len(X.columns)} features")
        
        # ====================================================================
        # STEP 3: LOAD MODEL AND PREDICT
        # ====================================================================
        print_header("STEP 3: MAKING PREDICTIONS", "-", 80)
        
        if args.model == 'ensemble':
            logger.info("Using ensemble model")
            models_dict = load_ensemble_models(models_dir)
            predictions = predict_ensemble(models_dict, X)
        else:
            model_path = models_dir / f"{args.model}_model.pkl"
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model not found: {model_path}")
            
            logger.info(f"Loading {args.model} model")
            model = joblib.load(model_path)
            # Convert to numpy array to avoid feature name issues
            X_array = X.values if hasattr(X, 'values') else X
            predictions = model.predict(X_array)
        
        logger.info(f"Generated {len(predictions):,} predictions")
        
        # ====================================================================
        # STEP 4: SAVE PREDICTIONS
        # ====================================================================
        print_header("STEP 4: SAVING PREDICTIONS", "-", 80)
        
        # Create output DataFrame
        output_df = pd.DataFrame({'price': predictions})
        
        # Add index if present in input
        if 'index' in df.columns:
            output_df.insert(0, 'index', df['index'])
        
        # Save to CSV
        output_df.to_csv(args.output, index=False)
        logger.info(f"Saved predictions to {args.output}")
        
        # ====================================================================
        # SUMMARY
        # ====================================================================
        print_header("✅ PREDICTIONS COMPLETED", "=", 80)
        
        print(f"\n📊 Prediction Summary:")
        print(f"   • Model: {args.model}")
        print(f"   • Records: {len(predictions):,}")
        print(f"   • Mean price: {predictions.mean():,.0f} RUB")
        print(f"   • Min price: {predictions.min():,.0f} RUB")
        print(f"   • Max price: {predictions.max():,.0f} RUB")
        print(f"   • Median price: {np.median(predictions):,.0f} RUB")
        print(f"   • Output file: {args.output}")
        
        return 0
        
    except Exception as e:
        logger.error(f"Prediction failed with error: {str(e)}", exc_info=True)
        print(f"\n❌ ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
