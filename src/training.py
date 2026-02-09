import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import logging
from pathlib import Path
import joblib
import time

from sklearn.model_selection import cross_val_score, KFold
import xgboost as xgb
import lightgbm as lgb
import catboost as cb

from src.config import (
    XGBOOST_PARAMS, LIGHTGBM_PARAMS, CATBOOST_PARAMS,
    ENSEMBLE_WEIGHTS, CV_FOLDS, CV_SCORING, RANDOM_STATE, MODELS_DIR
)

# Setup logging
logger = logging.getLogger(__name__)


class ModelTrainer:
    """Train and manage machine learning models"""
    
    def __init__(self, model_type: str):
        """
        Initialize ModelTrainer
        
        Args:
            model_type: Type of model to train
        """
        self.model_type = model_type
        self.model = None
        self.training_time = 0
        self.cv_scores = None
        
    def build_model(self):
        """Build model based on type"""
        logger.info(f"Building {self.model_type} model...")
        
        if self.model_type == 'xgboost':
            self.model = xgb.XGBRegressor(**XGBOOST_PARAMS)
        
        elif self.model_type == 'lightgbm':
            self.model = lgb.LGBMRegressor(**LIGHTGBM_PARAMS)
        
        elif self.model_type == 'catboost':
            self.model = cb.CatBoostRegressor(**CATBOOST_PARAMS)
        
        else:
            raise ValueError(f"Unknown model type: {self.model_type}. Only xgboost, lightgbm, catboost are supported.")
        
        return self.model
    
    def train(self, X_train: pd.DataFrame, y_train: pd.Series, 
              X_val: Optional[pd.DataFrame] = None, 
              y_val: Optional[pd.Series] = None) -> Any:
        """
        Train the model
        
        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features (optional, for early stopping)
            y_val: Validation target (optional, for early stopping)
            
        Returns:
            Trained model
        """
        if self.model is None:
            self.build_model()
        
        logger.info(f"Training {self.model_type}...")
        logger.info(f"  Training samples: {len(X_train)}")
        if X_val is not None:
            logger.info(f"  Validation samples: {len(X_val)}")
        
        start_time = time.time()
        
        # Train with early stopping for boosting models if validation set provided
        if X_val is not None and y_val is not None:
            if self.model_type in ['xgboost', 'lightgbm', 'catboost']:
                self._train_with_early_stopping(X_train, y_train, X_val, y_val)
            else:
                self.model.fit(X_train, y_train)
        else:
            self.model.fit(X_train, y_train)
        
        self.training_time = time.time() - start_time
        
        logger.info(f"[OK] Training complete in {self.training_time:.2f} seconds")
        
        return self.model
    
    def _train_with_early_stopping(self, X_train, y_train, X_val, y_val):
        """Train with early stopping for boosting models"""
        from src.config import EARLY_STOPPING_ROUNDS
        
        if self.model_type == 'xgboost':
            # XGBoost 2.0+ uses callbacks for early stopping
            self.model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                verbose=False
            )
        
        elif self.model_type == 'lightgbm':
            self.model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                callbacks=[lgb.early_stopping(EARLY_STOPPING_ROUNDS, verbose=False)]
            )
        
        elif self.model_type == 'catboost':
            self.model.fit(
                X_train, y_train,
                eval_set=(X_val, y_val),
                early_stopping_rounds=EARLY_STOPPING_ROUNDS,
                verbose=False
            )
    
    def cross_validate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, float]:
        """
        Perform cross-validation
        
        Args:
            X: Features
            y: Target
            
        Returns:
            Dictionary with CV scores
        """
        if self.model is None:
            self.build_model()
        
        logger.info(f"Performing {CV_FOLDS}-fold cross-validation for {self.model_type}...")
        
        kfold = KFold(n_splits=CV_FOLDS, shuffle=True, random_state=RANDOM_STATE)
        
        scores = cross_val_score(
            self.model, X, y, 
            cv=kfold, 
            scoring=CV_SCORING,
            n_jobs=-1
        )
        
        self.cv_scores = {
            'mean': scores.mean(),
            'std': scores.std(),
            'scores': scores.tolist()
        }
        
        logger.info(f"  CV {CV_SCORING}: {self.cv_scores['mean']:.4f} (+/- {self.cv_scores['std']:.4f})")
        
        return self.cv_scores
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions
        
        Args:
            X: Features
            
        Returns:
            Predictions
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        return self.model.predict(X)
    
    def get_feature_importance(self, feature_names: List[str], top_n: int = 20) -> pd.DataFrame:
        """
        Get feature importance
        
        Args:
            feature_names: List of feature names
            top_n: Number of top features to return
            
        Returns:
            DataFrame with feature importance
        """
        if self.model is None:
            raise ValueError("Model not trained.")
        
        # Get feature importance based on model type
        if hasattr(self.model, 'feature_importances_'):
            importance = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            importance = np.abs(self.model.coef_)
        else:
            logger.warning(f"Model {self.model_type} does not support feature importance")
            return pd.DataFrame()
        
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        return importance_df.head(top_n)
    
    def save(self, path: Path):
        """
        Save model to file
        
        Args:
            path: Path to save model
        """
        if self.model is None:
            raise ValueError("No model to save")
        
        joblib.dump(self.model, path)
        logger.info(f"Saved {self.model_type} model to {path}")
    
    def load(self, path: Path):
        """
        Load model from file
        
        Args:
            path: Path to load model from
        """
        self.model = joblib.load(path)
        logger.info(f"Loaded {self.model_type} model from {path}")


class EnsembleTrainer:
    """Train and manage ensemble of models"""
    
    def __init__(self, model_types: List[str] = ['xgboost', 'lightgbm', 'catboost']):
        """
        Initialize EnsembleTrainer
        
        Args:
            model_types: List of model types to include in ensemble
        """
        self.model_types = model_types
        self.models = {}
        self.weights = None
        
    def train_all(self, X_train: pd.DataFrame, y_train: pd.Series,
                  X_val: Optional[pd.DataFrame] = None,
                  y_val: Optional[pd.Series] = None) -> Dict[str, Any]:
        """
        Train all models in ensemble
        
        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features
            y_val: Validation target
            
        Returns:
            Dictionary of trained models
        """
        logger.info("="*70)
        logger.info(f"TRAINING ENSEMBLE ({len(self.model_types)} models)")
        logger.info("="*70)
        
        for model_type in self.model_types:
            trainer = ModelTrainer(model_type)
            trainer.train(X_train, y_train, X_val, y_val)
            self.models[model_type] = trainer
        
        # Set default weights (equal)
        self.weights = {mt: 1/len(self.model_types) for mt in self.model_types}
        
        logger.info("[OK] Ensemble training complete")
        
        return self.models
    
    def optimize_weights(self, X_val: pd.DataFrame, y_val: pd.Series,
                        method: str = 'grid_search') -> Dict[str, float]:
        """
        Optimize ensemble weights
        
        Args:
            X_val: Validation features
            y_val: Validation target
            method: Optimization method ('grid_search' or 'equal')
            
        Returns:
            Optimized weights
        """
        if method == 'equal':
            self.weights = {mt: 1/len(self.model_types) for mt in self.model_types}
            return self.weights
        
        logger.info("Optimizing ensemble weights...")
        
        # Get predictions from each model
        predictions = {}
        for model_type, trainer in self.models.items():
            predictions[model_type] = trainer.predict(X_val)
        
        # Grid search for best weights
        from sklearn.metrics import r2_score
        
        best_score = -np.inf
        best_weights = None
        
        # Simple grid search (can be improved with scipy.optimize)
        if len(self.model_types) == 3:
            for w1 in np.arange(0.2, 0.8, 0.1):
                for w2 in np.arange(0.2, 0.8, 0.1):
                    w3 = 1 - w1 - w2
                    if w3 < 0.1 or w3 > 0.8:
                        continue
                    
                    weights = dict(zip(self.model_types, [w1, w2, w3]))
                    ensemble_pred = self._weighted_predict(predictions, weights)
                    score = r2_score(y_val, ensemble_pred)
                    
                    if score > best_score:
                        best_score = score
                        best_weights = weights
        
        if best_weights is not None:
            self.weights = best_weights
            logger.info(f"Optimized weights: {self.weights}")
            logger.info(f"Validation R² score: {best_score:.6f}")
        
        return self.weights
    
    def _weighted_predict(self, predictions: Dict[str, np.ndarray], 
                         weights: Dict[str, float]) -> np.ndarray:
        """
        Combine predictions with weights
        
        Args:
            predictions: Dictionary of predictions
            weights: Dictionary of weights
            
        Returns:
            Weighted predictions
        """
        ensemble_pred = np.zeros(len(next(iter(predictions.values()))))
        
        for model_type, pred in predictions.items():
            ensemble_pred += weights[model_type] * pred
        
        return ensemble_pred
    
    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make ensemble predictions
        
        Args:
            X: Features
            
        Returns:
            Ensemble predictions
        """
        if not self.models:
            raise ValueError("No models trained")
        
        predictions = {}
        for model_type, trainer in self.models.items():
            predictions[model_type] = trainer.predict(X)
        
        return self._weighted_predict(predictions, self.weights)
    
    def save_all(self, save_dir: Path):
        """
        Save all models in ensemble
        
        Args:
            save_dir: Directory to save models
        """
        save_dir.mkdir(exist_ok=True)
        
        for model_type, trainer in self.models.items():
            model_path = save_dir / f"{model_type}_model.pkl"
            trainer.save(model_path)
        
        # Save weights
        weights_path = save_dir / "ensemble_weights.pkl"
        joblib.dump(self.weights, weights_path)
        logger.info(f"Saved ensemble weights to {weights_path}")
    
    def load_all(self, load_dir: Path):
        """
        Load all models in ensemble
        
        Args:
            load_dir: Directory to load models from
        """
        for model_type in self.model_types:
            model_path = load_dir / f"{model_type}_model.pkl"
            trainer = ModelTrainer(model_type)
            trainer.load(model_path)
            self.models[model_type] = trainer
        
        # Load weights
        weights_path = load_dir / "ensemble_weights.pkl"
        self.weights = joblib.load(weights_path)
        logger.info(f"Loaded ensemble weights from {weights_path}")


class TrainingPipeline:
    """Complete training pipeline orchestrator"""
    
    def __init__(self, models_to_train: List[str]):
        """
        Initialize TrainingPipeline
        
        Args:
            models_to_train: List of model types to train
        """
        self.models_to_train = models_to_train
        self.trained_models = {}
        self.training_results = []
        
    def train_all_models(self, X_train: pd.DataFrame, y_train: pd.Series,
                        X_val: Optional[pd.DataFrame] = None,
                        y_val: Optional[pd.Series] = None,
                        perform_cv: bool = False) -> Dict[str, ModelTrainer]:
        """
        Train all specified models
        
        Args:
            X_train: Training features
            y_train: Training target
            X_val: Validation features
            y_val: Validation target
            perform_cv: Whether to perform cross-validation
            
        Returns:
            Dictionary of trained models
        """
        logger.info("="*70)
        logger.info("STARTING MODEL TRAINING PIPELINE")
        logger.info("="*70)
        logger.info(f"Models to train: {len(self.models_to_train)}")
        logger.info(f"Training samples: {len(X_train)}")
        if X_val is not None:
            logger.info(f"Validation samples: {len(X_val)}")
        logger.info("="*70)
        
        for i, model_type in enumerate(self.models_to_train, 1):
            if model_type == 'ensemble':
                continue  # Handle ensemble separately
            
            logger.info(f"\n[{i}/{len(self.models_to_train)}] {model_type.upper()}")
            logger.info("-" * 70)
            
            try:
                trainer = ModelTrainer(model_type)
                
                # Cross-validation (optional)
                if perform_cv:
                    cv_scores = trainer.cross_validate(X_train, y_train)
                
                # Train model
                trainer.train(X_train, y_train, X_val, y_val)
                
                self.trained_models[model_type] = trainer
                
                logger.info(f"[OK] {model_type} training successful")
                
            except Exception as e:
                logger.error(f"[FAILED] {model_type} training failed: {str(e)}")
                continue
        
        # Handle ensemble if requested
        if 'ensemble' in self.models_to_train:
            logger.info(f"\n[{len(self.models_to_train)}/{len(self.models_to_train)}] ENSEMBLE")
            logger.info("-" * 70)
            
            ensemble_models = ['xgboost', 'lightgbm', 'catboost']
            available_models = [m for m in ensemble_models if m in self.trained_models]
            
            if len(available_models) >= 2:
                ensemble = EnsembleTrainer(available_models)
                ensemble.models = {m: self.trained_models[m] for m in available_models}
                
                if X_val is not None and y_val is not None:
                    ensemble.optimize_weights(X_val, y_val)
                else:
                    ensemble.weights = {m: 1/len(available_models) for m in available_models}
                
                self.trained_models['ensemble'] = ensemble
                logger.info("[OK] Ensemble creation successful")
            else:
                logger.warning("Not enough models for ensemble (need at least 2)")
        
        logger.info("="*70)
        logger.info(f"[OK] TRAINING COMPLETE: {len(self.trained_models)} models trained")
        logger.info("="*70)
        
        return self.trained_models
    
    def save_all_models(self, save_dir: Path = MODELS_DIR):
        """
        Save all trained models
        
        Args:
            save_dir: Directory to save models
        """
        save_dir.mkdir(exist_ok=True)
        
        logger.info(f"Saving models to {save_dir}...")
        
        for model_type, trainer in self.trained_models.items():
            if model_type == 'ensemble':
                if isinstance(trainer, EnsembleTrainer):
                    trainer.save_all(save_dir)
            else:
                model_path = save_dir / f"{model_type}_model.pkl"
                trainer.save(model_path)
        
        logger.info(f"[OK] All models saved to {save_dir}")
    
    def get_training_summary(self) -> pd.DataFrame:
        """
        Get summary of training results
        
        Returns:
            DataFrame with training summary
        """
        summary = []
        
        for model_type, trainer in self.trained_models.items():
            if model_type == 'ensemble':
                continue
            
            info = {
                'model': model_type,
                'training_time': trainer.training_time,
            }
            
            if trainer.cv_scores:
                info['cv_mean'] = trainer.cv_scores['mean']
                info['cv_std'] = trainer.cv_scores['std']
            
            summary.append(info)
        
        return pd.DataFrame(summary)
