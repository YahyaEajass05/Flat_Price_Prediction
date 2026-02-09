import sys
import argparse
from pathlib import Path
import pandas as pd
import joblib

# Add parent directory to path so we can import src
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import MODELS_DIR, RESULTS_DIR, TEST_DATA_PATH
from src.preprocessing import DataPreprocessor
from src.evaluation import ModelEvaluator, Visualizer
from src.utils import setup_logging, Timer, print_header, load_json
import logging


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Evaluate trained models')
    
    parser.add_argument('--data', type=str, default=str(TEST_DATA_PATH),
                       help='Path to test data CSV')
    parser.add_argument('--model', type=str, required=True,
                       help='Model name to evaluate')
    parser.add_argument('--models-dir', type=str, default=str(MODELS_DIR),
                       help='Directory containing trained models')
    parser.add_argument('--output', type=str, default=str(RESULTS_DIR),
                       help='Output directory for results')
    parser.add_argument('--no-viz', action='store_true',
                       help='Skip visualization generation')
    parser.add_argument('--save-predictions', action='store_true',
                       help='Save predictions to CSV')
    parser.add_argument('--log-level', type=str, default='INFO',
                       choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
                       help='Logging level')
    
    return parser.parse_args()


def main():
    """Main evaluation pipeline"""
    
    # Parse arguments
    args = parse_args()
    
    # Setup logging
    logger = setup_logging(console_level=args.log_level)
    
    print_header("FLAT PRICE PREDICTION - MODEL EVALUATION", "=", 80)
    logger.info(f"Starting evaluation at {pd.Timestamp.now()}")
    
    try:
        models_dir = Path(args.models_dir)
        output_dir = Path(args.output)
        output_dir.mkdir(exist_ok=True)
        
        # ====================================================================
        # STEP 1: LOAD DATA
        # ====================================================================
        with Timer("Data Loading"):
            print_header("STEP 1: DATA LOADING", "-", 80)
            
            df = pd.read_csv(args.data)
            logger.info(f"Loaded {len(df):,} records from {args.data}")
        
        # ====================================================================
        # STEP 2: LOAD PREPROCESSOR AND PREPARE DATA
        # ====================================================================
        with Timer("Data Preprocessing"):
            print_header("STEP 2: DATA PREPROCESSING", "-", 80)
            
            # Load preprocessor artifacts
            preprocessor = DataPreprocessor()
            preprocessor.load_encoders(models_dir / 'label_encoders.pkl')
            
            # Check if target column exists
            has_target = 'price' in df.columns
            
            if has_target:
                X = preprocessor.transform(df.drop(columns=['price']))
                y = df['price']
                logger.info("Test data has target column - full evaluation possible")
            else:
                X = preprocessor.transform(df)
                y = None
                logger.info("Test data has no target column - only predictions available")
        
        # ====================================================================
        # STEP 3: LOAD MODEL
        # ====================================================================
        with Timer("Model Loading"):
            print_header("STEP 3: MODEL LOADING", "-", 80)
            
            model_path = models_dir / f"{args.model}_model.pkl"
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model not found: {model_path}")
            
            model = joblib.load(model_path)
            logger.info(f"Loaded model: {args.model}")
        
        # ====================================================================
        # STEP 4: MAKE PREDICTIONS
        # ====================================================================
        with Timer("Prediction"):
            print_header("STEP 4: MAKING PREDICTIONS", "-", 80)
            
            # Handle ensemble model
            if args.model == 'ensemble':
                # Load ensemble models
                xgb_model = joblib.load(models_dir / 'xgboost_model.pkl')
                lgb_model = joblib.load(models_dir / 'lightgbm_model.pkl')
                cat_model = joblib.load(models_dir / 'catboost_model.pkl')
                weights = joblib.load(models_dir / 'ensemble_weights.pkl')
                
                # Make predictions
                xgb_pred = xgb_model.predict(X)
                lgb_pred = lgb_model.predict(X)
                cat_pred = cat_model.predict(X)
                
                # Weighted average
                if isinstance(weights, dict):
                    y_pred = (weights.get('xgboost', 1/3) * xgb_pred + 
                             weights.get('lightgbm', 1/3) * lgb_pred + 
                             weights.get('catboost', 1/3) * cat_pred)
                else:
                    y_pred = (xgb_pred + lgb_pred + cat_pred) / 3
            else:
                y_pred = model.predict(X)
            
            logger.info(f"Generated {len(y_pred):,} predictions")
            logger.info(f"Prediction range: {y_pred.min():,.0f} - {y_pred.max():,.0f}")
        
        # ====================================================================
        # STEP 5: EVALUATION (if target available)
        # ====================================================================
        if has_target and y is not None:
            with Timer("Model Evaluation"):
                print_header("STEP 5: MODEL EVALUATION", "-", 80)
                
                evaluator = ModelEvaluator(args.model)
                metrics = evaluator.evaluate(y.values, y_pred)
                
                # Print detailed report
                evaluator.print_detailed_report()
                
                # Save metrics
                metrics_df = pd.DataFrame([metrics])
                metrics_df.to_csv(output_dir / f'{args.model}_evaluation.csv', index=False)
                logger.info(f"Saved metrics to {output_dir / f'{args.model}_evaluation.csv'}")
                
                # Generate visualizations
                if not args.no_viz:
                    logger.info("Generating visualizations...")
                    visualizer = Visualizer(output_dir)
                    visualizer.plot_predictions(y.values, y_pred, args.model)
                    visualizer.plot_residuals(y.values, y_pred, args.model)
                    visualizer.plot_error_distribution(y.values, y_pred, args.model)
        
        # ====================================================================
        # STEP 6: SAVE PREDICTIONS
        # ====================================================================
        if args.save_predictions:
            with Timer("Saving Predictions"):
                print_header("STEP 6: SAVING PREDICTIONS", "-", 80)
                
                predictions_df = pd.DataFrame({
                    'predicted_price': y_pred
                })
                
                if has_target:
                    predictions_df['actual_price'] = y.values
                    predictions_df['error'] = y_pred - y.values
                    predictions_df['relative_error_pct'] = (predictions_df['error'] / y.values * 100)
                
                output_file = output_dir / f'{args.model}_predictions.csv'
                predictions_df.to_csv(output_file, index=False)
                logger.info(f"Saved predictions to {output_file}")
        
        # ====================================================================
        # COMPLETION
        # ====================================================================
        print_header("✅ EVALUATION COMPLETED SUCCESSFULLY", "=", 80)
        
        if has_target:
            print("\n📊 Evaluation Summary:")
            print(f"   • Model: {args.model}")
            print(f"   • R² Score: {metrics['r2_score']:.6f} ({metrics['r2_score']*100:.2f}%)")
            print(f"   • RMSE: {metrics['rmse']:,.0f} RUB")
            print(f"   • MAE: {metrics['mae']:,.0f} RUB ({metrics['mape']:.2f}%)")
            print(f"   • Within ±10%: {metrics['within_10_pct']:.2f}%")
        else:
            print("\n📊 Prediction Summary:")
            print(f"   • Model: {args.model}")
            print(f"   • Predictions: {len(y_pred):,}")
            print(f"   • Mean: {y_pred.mean():,.0f} RUB")
            print(f"   • Min: {y_pred.min():,.0f} RUB")
            print(f"   • Max: {y_pred.max():,.0f} RUB")
        
        return 0
        
    except Exception as e:
        logger.error(f"Evaluation failed with error: {str(e)}", exc_info=True)
        print(f"\n❌ ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
