"""
Quick test script to verify pipeline functionality
Tests preprocessing, training, and evaluation with a small subset
"""

import sys
from pathlib import Path
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))

from src.preprocessing import DataLoader, DataPreprocessor
from src.training import ModelTrainer
from src.evaluation import ModelEvaluator
from src.utils import setup_logging, print_header

def main():
    """Quick test of the pipeline"""
    
    # Setup logging
    logger = setup_logging(console_level='INFO')
    
    print_header("PIPELINE QUICK TEST", "=", 70)
    
    try:
        # Load small sample of data
        print("\n1. Loading data...")
        loader = DataLoader(Path('data/data.csv'))
        df = loader.load()
        df_sample = df.sample(n=min(1000, len(df)), random_state=42)
        print(f"   ✓ Loaded {len(df_sample)} samples")
        
        # Preprocess
        print("\n2. Preprocessing...")
        preprocessor = DataPreprocessor()
        X, y = preprocessor.fit_transform(df_sample)
        print(f"   ✓ Created {len(X.columns)} features")
        
        # Split
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        print(f"   ✓ Train: {len(X_train)}, Test: {len(X_test)}")
        
        # Train a simple model
        print("\n3. Training XGBoost...")
        trainer = ModelTrainer('xgboost')
        trainer.train(X_train, y_train)
        print(f"   ✓ Training complete")
        
        # Evaluate
        print("\n4. Evaluating...")
        y_pred = trainer.predict(X_test)
        evaluator = ModelEvaluator('xgboost')
        metrics = evaluator.evaluate(y_test.values, y_pred)
        print(f"   ✓ R² Score: {metrics['r2_score']:.4f}")
        print(f"   ✓ MAE: {metrics['mae']:,.0f} RUB")
        print(f"   ✓ MAPE: {metrics['mape']:.2f}%")
        
        print("\n" + "="*70)
        print("✅ ALL TESTS PASSED - Pipeline is working correctly!")
        print("="*70)
        
        return 0
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
