"""
Main training script
Complete pipeline for training flat price prediction models
"""

import sys
import argparse
from pathlib import Path
import pandas as pd
from sklearn.model_selection import train_test_split

# Add parent directory to path so we can import src
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import (
    TRAIN_DATA_PATH, TEST_SIZE, VALIDATION_SIZE, TARGET_COLUMN,
    MODELS_TO_TRAIN, MODELS_DIR, RESULTS_DIR, RANDOM_STATE
)
from src.preprocessing import DataLoader, DataPreprocessor
from src.training import TrainingPipeline
from src.evaluation import ModelEvaluator, ModelComparator, Visualizer
from src.utils import setup_logging, Timer, print_header, save_json
import logging


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Train flat price prediction models')
    
    parser.add_argument('--data', type=str, default=str(TRAIN_DATA_PATH),
                       help='Path to training data CSV')
    parser.add_argument('--models', nargs='+', default=MODELS_TO_TRAIN,
                       help='Models to train')
    parser.add_argument('--test-size', type=float, default=TEST_SIZE,
                       help='Test set size (0-1)')
    parser.add_argument('--val-size', type=float, default=VALIDATION_SIZE,
                       help='Validation set size from training (0-1)')
    parser.add_argument('--cv', action='store_true',
                       help='Perform cross-validation')
    parser.add_argument('--no-viz', action='store_true',
                       help='Skip visualization generation')
    parser.add_argument('--log-level', type=str, default='INFO',
                       choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
                       help='Logging level')
    parser.add_argument('--save-models', action='store_true', default=True,
                       help='Save trained models')
    
    return parser.parse_args()


def main():
    """Main training pipeline"""
    
    # Parse arguments
    args = parse_args()
    
    # Setup logging
    logger = setup_logging(console_level=args.log_level)
    
    print_header("FLAT PRICE PREDICTION - TRAINING PIPELINE", "=", 80)
    logger.info(f"Starting training pipeline at {pd.Timestamp.now()}")
    logger.info(f"Configuration: {vars(args)}")
    
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
            logger.info(f"Memory usage: {info['memory_usage']:.2f} MB")
        
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
        # STEP 4: MODEL TRAINING
        # ====================================================================
        with Timer("Model Training"):
            print_header("STEP 4: MODEL TRAINING", "-", 80)
            
            pipeline = TrainingPipeline(args.models)
            trained_models = pipeline.train_all_models(
                X_train, y_train, X_val, y_val,
                perform_cv=args.cv
            )
            
            logger.info(f"Successfully trained {len(trained_models)} models")
        
        # ====================================================================
        # STEP 5: MODEL EVALUATION
        # ====================================================================
        with Timer("Model Evaluation"):
            print_header("STEP 5: MODEL EVALUATION", "-", 80)
            
            comparator = ModelComparator()
            visualizer = Visualizer(RESULTS_DIR)
            
            for model_name, trainer in trained_models.items():
                logger.info(f"\nEvaluating {model_name}...")
                
                # Make predictions
                if model_name == 'ensemble':
                    y_pred = trainer.predict(X_test)
                else:
                    y_pred = trainer.predict(X_test)
                
                # Evaluate
                evaluator = ModelEvaluator(model_name)
                metrics = evaluator.evaluate(y_test.values, y_pred)
                
                # Add to comparator
                comparator.add_result(model_name, metrics)
                
                # Print detailed report
                evaluator.print_detailed_report()
                
                # Generate visualizations
                if not args.no_viz:
                    logger.info(f"Generating visualizations for {model_name}...")
                    visualizer.plot_predictions(y_test.values, y_pred, model_name)
                    visualizer.plot_residuals(y_test.values, y_pred, model_name)
                    visualizer.plot_error_distribution(y_test.values, y_pred, model_name)
                    
                    # Feature importance (if available)
                    if hasattr(trainer, 'get_feature_importance'):
                        importance_df = trainer.get_feature_importance(
                            preprocessor.get_feature_names()
                        )
                        if not importance_df.empty:
                            visualizer.plot_feature_importance(
                                importance_df, model_name
                            )
        
        # ====================================================================
        # STEP 6: MODEL COMPARISON
        # ====================================================================
        with Timer("Model Comparison"):
            print_header("STEP 6: MODEL COMPARISON", "-", 80)
            
            # Print comparison table
            comparator.print_comparison_table()
            
            # Save comparison results
            comparison_df = comparator.get_comparison_df()
            comparator.save_comparison(RESULTS_DIR / 'model_comparison.csv')
            
            # Generate comparison visualizations
            if not args.no_viz:
                visualizer.plot_model_comparison(comparison_df)
            
            # Get best model
            best_model_name, best_metrics = comparator.get_best_model()
            logger.info(f"\n🏆 Best Model: {best_model_name}")
            logger.info(f"   R² Score: {best_metrics['r2_score']:.6f}")
            logger.info(f"   MAE: {best_metrics['mae']:,.0f} RUB")
        
        # ====================================================================
        # STEP 7: SAVE MODELS
        # ====================================================================
        if args.save_models:
            with Timer("Saving Models"):
                print_header("STEP 7: SAVING MODELS", "-", 80)
                
                pipeline.save_all_models(MODELS_DIR)
                
                # Save metadata
                metadata = {
                    'best_model': best_model_name,
                    'best_metrics': {k: float(v) if isinstance(v, (int, float)) else v 
                                    for k, v in best_metrics.items()},
                    'training_date': pd.Timestamp.now().isoformat(),
                    'dataset_size': len(df),
                    'n_features': len(X.columns),
                    'test_size': args.test_size,
                    'models_trained': list(trained_models.keys())
                }
                save_json(metadata, MODELS_DIR / 'training_metadata.json')
                
                logger.info(f"Models and artifacts saved to {MODELS_DIR}")
        
        # ====================================================================
        # COMPLETION
        # ====================================================================
        print_header("✅ TRAINING PIPELINE COMPLETED SUCCESSFULLY", "=", 80)
        logger.info(f"Completed at {pd.Timestamp.now()}")
        logger.info(f"Results saved to: {RESULTS_DIR}")
        logger.info(f"Models saved to: {MODELS_DIR}")
        
        print("\n📊 Quick Summary:")
        print(f"   • Best Model: {best_model_name}")
        print(f"   • Accuracy: {best_metrics['r2_score']*100:.2f}% (R² = {best_metrics['r2_score']:.6f})")
        print(f"   • Average Error: {best_metrics['mae']:,.0f} RUB ({best_metrics['mape']:.2f}%)")
        print(f"   • Predictions within ±10%: {best_metrics['within_10_pct']:.2f}%")
        
        return 0
        
    except Exception as e:
        logger.error(f"Pipeline failed with error: {str(e)}", exc_info=True)
        print(f"\n❌ ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
