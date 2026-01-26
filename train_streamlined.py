"""
Streamlined training script - Ensemble Model Only (Best Performance)
Trains XGBoost, LightGBM, and CatBoost, then creates ensemble
"""

import sys
import argparse
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.config import (
    TRAIN_DATA_PATH, TEST_SIZE, VALIDATION_SIZE, TARGET_COLUMN,
    MODELS_DIR, RESULTS_DIR, RANDOM_STATE
)
from src.preprocessing import DataLoader, DataPreprocessor
from src.training import EnsembleTrainer
from src.evaluation import ModelEvaluator, Visualizer
from src.utils import setup_logging, Timer, print_header, save_json
import logging


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Train ensemble model for flat price prediction')
    
    parser.add_argument('--data', type=str, default=str(TRAIN_DATA_PATH),
                       help='Path to training data CSV')
    parser.add_argument('--test-size', type=float, default=TEST_SIZE,
                       help='Test set size (0-1)')
    parser.add_argument('--val-size', type=float, default=VALIDATION_SIZE,
                       help='Validation set size from training (0-1)')
    parser.add_argument('--no-viz', action='store_true',
                       help='Skip visualization generation')
    parser.add_argument('--log-level', type=str, default='INFO',
                       choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
                       help='Logging level')
    
    return parser.parse_args()


def main():
    """Main training pipeline"""
    
    # Parse arguments
    args = parse_args()
    
    # Setup logging
    logger = setup_logging(console_level=args.log_level)
    
    print_header("FLAT PRICE PREDICTION - ENSEMBLE MODEL TRAINING", "=", 80)
    logger.info(f"Starting training pipeline at {pd.Timestamp.now()}")
    logger.info("Training best model only: Ensemble (XGBoost + LightGBM + CatBoost)")
    
    try:
        # ====================================================================
        # STEP 1: LOAD DATA
        # ====================================================================
        with Timer("Data Loading"):
            print_header("STEP 1: DATA LOADING", "-", 80)
            
            loader = DataLoader(Path(args.data))
            df = loader.load()
            
            info = loader.get_basic_info()
            logger.info(f"Dataset shape: {info['n_rows']} rows × {info['n_columns']} columns")
        
        # ====================================================================
        # STEP 2: PREPROCESSING
        # ====================================================================
        with Timer("Data Preprocessing"):
            print_header("STEP 2: DATA PREPROCESSING", "-", 80)
            
            preprocessor = DataPreprocessor()
            X, y = preprocessor.fit_transform(df, target_col=TARGET_COLUMN)
            
            logger.info(f"Features: {len(X.columns)}")
            logger.info(f"Target range: {y.min():,.0f} - {y.max():,.0f}")
            
            # Save preprocessor artifacts
            preprocessor.save_encoders(MODELS_DIR / 'label_encoders.pkl')
            save_json({'features': preprocessor.get_feature_names()},
                     MODELS_DIR / 'feature_names.json')
        
        # ====================================================================
        # STEP 3: TRAIN-TEST SPLIT
        # ====================================================================
        with Timer("Data Splitting"):
            print_header("STEP 3: TRAIN-TEST SPLIT", "-", 80)
            
            # First split: train+val vs test
            X_train_val, X_test, y_train_val, y_test = train_test_split(
                X, y, test_size=args.test_size, random_state=RANDOM_STATE
            )
            
            # Second split: train vs validation
            if args.val_size > 0:
                X_train, X_val, y_train, y_val = train_test_split(
                    X_train_val, y_train_val, 
                    test_size=args.val_size, 
                    random_state=RANDOM_STATE
                )
            else:
                X_train, y_train = X_train_val, y_train_val
                X_val, y_val = None, None
            
            logger.info(f"Training set: {len(X_train):,} samples")
            if X_val is not None:
                logger.info(f"Validation set: {len(X_val):,} samples")
            logger.info(f"Test set: {len(X_test):,} samples")
        
        # ====================================================================
        # STEP 4: TRAIN ENSEMBLE MODEL
        # ====================================================================
        with Timer("Ensemble Model Training"):
            print_header("STEP 4: TRAINING ENSEMBLE MODEL", "-", 80)
            logger.info("Training XGBoost, LightGBM, and CatBoost...")
            
            ensemble = EnsembleTrainer(['xgboost', 'lightgbm', 'catboost'])
            ensemble.train_all(X_train, y_train, X_val, y_val)
            
            # Optimize weights if validation set provided
            if X_val is not None and y_val is not None:
                logger.info("Optimizing ensemble weights...")
                ensemble.optimize_weights(X_val, y_val)
            
            logger.info(f"✓ Ensemble training complete")
            logger.info(f"  Final weights: {ensemble.weights}")
        
        # ====================================================================
        # STEP 5: EVALUATION
        # ====================================================================
        with Timer("Model Evaluation"):
            print_header("STEP 5: MODEL EVALUATION", "-", 80)
            
            # Make predictions
            y_pred = ensemble.predict(X_test)
            
            # Evaluate
            evaluator = ModelEvaluator('Ensemble')
            metrics = evaluator.evaluate(y_test.values, y_pred)
            
            # Print detailed report
            evaluator.print_detailed_report()
            
            # Generate visualizations
            if not args.no_viz:
                logger.info("Generating visualizations...")
                visualizer = Visualizer(RESULTS_DIR)
                visualizer.plot_predictions(y_test.values, y_pred, 'Ensemble')
                visualizer.plot_residuals(y_test.values, y_pred, 'Ensemble')
                visualizer.plot_error_distribution(y_test.values, y_pred, 'Ensemble')
        
        # ====================================================================
        # STEP 6: SAVE MODEL
        # ====================================================================
        with Timer("Saving Model"):
            print_header("STEP 6: SAVING MODEL", "-", 80)
            
            MODELS_DIR.mkdir(exist_ok=True)
            ensemble.save_all(MODELS_DIR)
            
            # Save metadata
            metadata = {
                'model_type': 'ensemble',
                'components': ['xgboost', 'lightgbm', 'catboost'],
                'weights': ensemble.weights,
                'metrics': {k: float(v) if isinstance(v, (int, float)) else v 
                           for k, v in metrics.items()},
                'training_date': pd.Timestamp.now().isoformat(),
                'dataset_size': len(df),
                'n_features': len(X.columns),
                'test_size': args.test_size,
                'accuracy': f"{metrics['r2_score']*100:.2f}%"
            }
            save_json(metadata, MODELS_DIR / 'model_metadata.json')
            
            logger.info(f"Models and artifacts saved to {MODELS_DIR}")
        
        # ====================================================================
        # COMPLETION
        # ====================================================================
        print_header("✅ TRAINING COMPLETED SUCCESSFULLY", "=", 80)
        logger.info(f"Completed at {pd.Timestamp.now()}")
        
        print("\n📊 Final Results:")
        print(f"   • Model: Ensemble (XGBoost + LightGBM + CatBoost)")
        print(f"   • Accuracy: {metrics['r2_score']*100:.2f}% (R² = {metrics['r2_score']:.6f})")
        print(f"   • Average Error: {metrics['mae']:,.0f} RUB ({metrics['mape']:.2f}%)")
        print(f"   • Predictions within ±10%: {metrics['within_10_pct']:.2f}%")
        print(f"   • Models saved to: {MODELS_DIR}")
        
        return 0
        
    except Exception as e:
        logger.error(f"Pipeline failed with error: {str(e)}", exc_info=True)
        print(f"\n❌ ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
