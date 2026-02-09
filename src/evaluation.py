"""
Model evaluation module
Handles comprehensive evaluation of trained models with multiple metrics
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
import logging
from pathlib import Path
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    mean_absolute_percentage_error
)

from src.config import EVALUATION_METRICS, PLOT_SETTINGS, RESULTS_DIR

# Setup logging
logger = logging.getLogger(__name__)


class ModelEvaluator:
    """Evaluate model performance with comprehensive metrics"""
    
    def __init__(self, model_name: str):
        """
        Initialize ModelEvaluator
        
        Args:
            model_name: Name of the model being evaluated
        """
        self.model_name = model_name
        self.metrics = {}
        self.predictions = None
        self.actuals = None
        
    def evaluate(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """
        Calculate all evaluation metrics
        
        Args:
            y_true: True values
            y_pred: Predicted values
            
        Returns:
            Dictionary of metrics
        """
        self.actuals = y_true
        self.predictions = y_pred
        
        logger.info(f"Evaluating {self.model_name}...")
        
        # Basic regression metrics
        self.metrics['r2_score'] = r2_score(y_true, y_pred)
        self.metrics['rmse'] = np.sqrt(mean_squared_error(y_true, y_pred))
        self.metrics['mae'] = mean_absolute_error(y_true, y_pred)
        self.metrics['mape'] = mean_absolute_percentage_error(y_true, y_pred) * 100
        
        # Additional metrics
        self.metrics['mse'] = mean_squared_error(y_true, y_pred)
        
        # Percentage-based accuracy
        errors = np.abs(y_true - y_pred)
        relative_errors = errors / y_true
        
        self.metrics['within_5_pct'] = (relative_errors <= 0.05).sum() / len(y_true) * 100
        self.metrics['within_10_pct'] = (relative_errors <= 0.10).sum() / len(y_true) * 100
        self.metrics['within_15_pct'] = (relative_errors <= 0.15).sum() / len(y_true) * 100
        self.metrics['within_20_pct'] = (relative_errors <= 0.20).sum() / len(y_true) * 100
        
        # Error statistics
        self.metrics['mean_error'] = np.mean(y_pred - y_true)
        self.metrics['std_error'] = np.std(y_pred - y_true)
        self.metrics['max_error'] = np.max(np.abs(y_pred - y_true))
        self.metrics['median_error'] = np.median(np.abs(y_pred - y_true))
        
        # Explained variance
        self.metrics['explained_variance'] = self._explained_variance(y_true, y_pred)
        
        # Adjusted R²
        n = len(y_true)
        p = 1  # Number of predictors (simplified)
        self.metrics['adj_r2_score'] = 1 - (1 - self.metrics['r2_score']) * (n - 1) / (n - p - 1)
        
        logger.info(f"  R² Score: {self.metrics['r2_score']:.6f}")
        logger.info(f"  RMSE: {self.metrics['rmse']:,.0f}")
        logger.info(f"  MAE: {self.metrics['mae']:,.0f}")
        logger.info(f"  MAPE: {self.metrics['mape']:.2f}%")
        
        return self.metrics
    
    def _explained_variance(self, y_true: np.ndarray, y_pred: np.ndarray) -> float:
        """Calculate explained variance score"""
        numerator = np.var(y_true - y_pred)
        denominator = np.var(y_true)
        return 1 - (numerator / denominator) if denominator != 0 else 0
    
    def get_metrics_summary(self) -> pd.Series:
        """
        Get metrics as pandas Series
        
        Returns:
            Series with all metrics
        """
        return pd.Series(self.metrics)
    
    def get_error_distribution(self) -> Dict[str, np.ndarray]:
        """
        Get error distribution statistics
        
        Returns:
            Dictionary with error arrays and statistics
        """
        if self.predictions is None or self.actuals is None:
            raise ValueError("No predictions available. Run evaluate() first.")
        
        errors = self.predictions - self.actuals
        absolute_errors = np.abs(errors)
        relative_errors = absolute_errors / self.actuals * 100
        
        return {
            'errors': errors,
            'absolute_errors': absolute_errors,
            'relative_errors': relative_errors,
            'percentiles': {
                'p25': np.percentile(absolute_errors, 25),
                'p50': np.percentile(absolute_errors, 50),
                'p75': np.percentile(absolute_errors, 75),
                'p90': np.percentile(absolute_errors, 90),
                'p95': np.percentile(absolute_errors, 95),
                'p99': np.percentile(absolute_errors, 99),
            }
        }
    
    def print_detailed_report(self):
        """Print detailed evaluation report"""
        print("\n" + "="*70)
        print(f"EVALUATION REPORT: {self.model_name}")
        print("="*70)
        
        print("\n[PRIMARY METRICS]")
        print("-" * 70)
        print(f"R² Score:              {self.metrics['r2_score']:.6f} ({self.metrics['r2_score']*100:.2f}%)")
        print(f"Adjusted R² Score:     {self.metrics['adj_r2_score']:.6f}")
        print(f"Explained Variance:    {self.metrics['explained_variance']:.6f}")
        
        print("\n[ERROR METRICS]")
        print("-" * 70)
        print(f"RMSE:                  {self.metrics['rmse']:>15,.0f} RUB")
        print(f"MAE:                   {self.metrics['mae']:>15,.0f} RUB")
        print(f"MAPE:                  {self.metrics['mape']:>15.2f} %")
        print(f"MSE:                   {self.metrics['mse']:>15,.0f}")
        
        print("\n[ERROR STATISTICS]")
        print("-" * 70)
        print(f"Mean Error:            {self.metrics['mean_error']:>15,.0f} RUB")
        print(f"Std Error:             {self.metrics['std_error']:>15,.0f} RUB")
        print(f"Median Error:          {self.metrics['median_error']:>15,.0f} RUB")
        print(f"Max Error:             {self.metrics['max_error']:>15,.0f} RUB")
        
        print("\n[PREDICTION ACCURACY]")
        print("-" * 70)
        print(f"Within ±5%:            {self.metrics['within_5_pct']:>15.2f} %")
        print(f"Within ±10%:           {self.metrics['within_10_pct']:>15.2f} %")
        print(f"Within ±15%:           {self.metrics['within_15_pct']:>15.2f} %")
        print(f"Within ±20%:           {self.metrics['within_20_pct']:>15.2f} %")
        
        # Error distribution
        error_dist = self.get_error_distribution()
        print("\n[ERROR PERCENTILES]")
        print("-" * 70)
        for pct, value in error_dist['percentiles'].items():
            print(f"{pct.upper():<10} {value:>15,.0f} RUB")
        
        print("\n" + "="*70)


class ModelComparator:
    """Compare multiple models and generate comparison reports"""
    
    def __init__(self):
        """Initialize ModelComparator"""
        self.results = []
        
    def add_result(self, model_name: str, metrics: Dict[str, float]):
        """
        Add model results for comparison
        
        Args:
            model_name: Name of the model
            metrics: Dictionary of metrics
        """
        result = {'model': model_name}
        result.update(metrics)
        self.results.append(result)
        
    def get_comparison_df(self) -> pd.DataFrame:
        """
        Get comparison DataFrame
        
        Returns:
            DataFrame with all model results
        """
        df = pd.DataFrame(self.results)
        
        # Sort by R² score (descending)
        if 'r2_score' in df.columns:
            df = df.sort_values('r2_score', ascending=False).reset_index(drop=True)
        
        return df
    
    def get_best_model(self, metric: str = 'r2_score') -> Tuple[str, Dict]:
        """
        Get best performing model
        
        Args:
            metric: Metric to use for comparison
            
        Returns:
            Tuple of (model_name, metrics)
        """
        df = self.get_comparison_df()
        
        if metric in ['rmse', 'mae', 'mape', 'mse']:
            # Lower is better
            best_idx = df[metric].idxmin()
        else:
            # Higher is better
            best_idx = df[metric].idxmax()
        
        best_row = df.iloc[best_idx]
        return best_row['model'], best_row.to_dict()
    
    def print_comparison_table(self):
        """Print formatted comparison table"""
        df = self.get_comparison_df()
        
        print("\n" + "="*100)
        print("MODEL COMPARISON")
        print("="*100)
        
        # Main metrics table
        print(f"\n{'Model':<25} {'R² Score':<12} {'RMSE':<15} {'MAE':<15} {'MAPE %':<10}")
        print("-" * 100)
        
        for idx, row in df.iterrows():
            rank = "#1" if idx == 0 else "#2" if idx == 1 else "#3" if idx == 2 else f"#{idx+1}"
            print(f"{rank:<4} {row['model']:<23} {row['r2_score']:<12.6f} {row['rmse']:<15,.0f} "
                  f"{row['mae']:<15,.0f} {row['mape']:<10.2f}")
        
        # Accuracy table
        print("\n" + "="*100)
        print("PREDICTION ACCURACY (Percentage within error threshold)")
        print("="*100)
        
        print(f"\n{'Model':<25} {'Within ±5%':<15} {'Within ±10%':<15} {'Within ±15%':<15}")
        print("-" * 100)
        
        for idx, row in df.iterrows():
            rank = "#1" if idx == 0 else "#2" if idx == 1 else "#3" if idx == 2 else f"#{idx+1}"
            print(f"{rank:<4} {row['model']:<23} {row['within_5_pct']:<15.2f} "
                  f"{row['within_10_pct']:<15.2f} {row['within_15_pct']:<15.2f}")
        
        # Best model summary
        best_model, best_metrics = self.get_best_model()
        
        print("\n" + "="*100)
        print("[BEST MODEL]")
        print("="*100)
        print(f"\nModel: {best_model}")
        print(f"R² Score: {best_metrics['r2_score']:.6f} ({best_metrics['r2_score']*100:.2f}%)")
        print(f"Average Error: {best_metrics['mae']:,.0f} RUB ({best_metrics['mape']:.2f}%)")
        print(f"Predictions within ±10%: {best_metrics['within_10_pct']:.2f}%")
        
        print("\n" + "="*100)
    
    def save_comparison(self, filepath: Path):
        """
        Save comparison results to CSV
        
        Args:
            filepath: Path to save CSV file
        """
        df = self.get_comparison_df()
        df.to_csv(filepath, index=False)
        logger.info(f"Saved comparison results to {filepath}")


class Visualizer:
    """Create visualization plots for model evaluation"""
    
    def __init__(self, save_dir: Path = RESULTS_DIR):
        """
        Initialize Visualizer
        
        Args:
            save_dir: Directory to save plots
        """
        self.save_dir = save_dir
        self.save_dir.mkdir(exist_ok=True)
        
        # Set style
        try:
            plt.style.use(PLOT_SETTINGS['style'])
        except:
            plt.style.use('seaborn-v0_8')
        
        sns.set_palette("husl")
    
    def plot_predictions(self, y_true: np.ndarray, y_pred: np.ndarray,
                        model_name: str, save: bool = True):
        """
        Plot actual vs predicted values
        
        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            save: Whether to save the plot
        """
        fig, ax = plt.subplots(figsize=PLOT_SETTINGS['figsize'])
        
        # Scatter plot
        ax.scatter(y_true, y_pred, alpha=0.5, s=20)
        
        # Perfect prediction line
        min_val = min(y_true.min(), y_pred.min())
        max_val = max(y_true.max(), y_pred.max())
        ax.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
        
        # Labels and title
        ax.set_xlabel('Actual Price (RUB)', fontsize=12)
        ax.set_ylabel('Predicted Price (RUB)', fontsize=12)
        ax.set_title(f'Actual vs Predicted: {model_name}', fontsize=14, fontweight='bold')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Add R² score
        r2 = r2_score(y_true, y_pred)
        ax.text(0.05, 0.95, f'R² = {r2:.4f}', transform=ax.transAxes,
                fontsize=12, verticalalignment='top',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
        
        plt.tight_layout()
        
        if save:
            filename = f"{model_name.lower().replace(' ', '_')}_predictions.png"
            plt.savefig(self.save_dir / filename, dpi=PLOT_SETTINGS['dpi'], bbox_inches='tight')
            logger.info(f"Saved plot: {filename}")
        
        plt.close()
    
    def plot_residuals(self, y_true: np.ndarray, y_pred: np.ndarray,
                      model_name: str, save: bool = True):
        """
        Plot residuals distribution
        
        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            save: Whether to save the plot
        """
        residuals = y_pred - y_true
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 5))
        
        # Residuals vs Predicted
        axes[0].scatter(y_pred, residuals, alpha=0.5, s=20)
        axes[0].axhline(y=0, color='r', linestyle='--', lw=2)
        axes[0].set_xlabel('Predicted Price (RUB)', fontsize=12)
        axes[0].set_ylabel('Residuals (RUB)', fontsize=12)
        axes[0].set_title('Residual Plot', fontsize=12, fontweight='bold')
        axes[0].grid(True, alpha=0.3)
        
        # Residuals histogram
        axes[1].hist(residuals, bins=50, edgecolor='black', alpha=0.7)
        axes[1].axvline(x=0, color='r', linestyle='--', lw=2)
        axes[1].set_xlabel('Residuals (RUB)', fontsize=12)
        axes[1].set_ylabel('Frequency', fontsize=12)
        axes[1].set_title('Residuals Distribution', fontsize=12, fontweight='bold')
        axes[1].grid(True, alpha=0.3)
        
        plt.suptitle(f'{model_name} - Residual Analysis', fontsize=14, fontweight='bold', y=1.02)
        plt.tight_layout()
        
        if save:
            filename = f"{model_name.lower().replace(' ', '_')}_residuals.png"
            plt.savefig(self.save_dir / filename, dpi=PLOT_SETTINGS['dpi'], bbox_inches='tight')
            logger.info(f"Saved plot: {filename}")
        
        plt.close()
    
    def plot_error_distribution(self, y_true: np.ndarray, y_pred: np.ndarray,
                               model_name: str, save: bool = True):
        """
        Plot error distribution analysis
        
        Args:
            y_true: True values
            y_pred: Predicted values
            model_name: Name of the model
            save: Whether to save the plot
        """
        absolute_errors = np.abs(y_pred - y_true)
        relative_errors = absolute_errors / y_true * 100
        
        fig, axes = plt.subplots(2, 2, figsize=(15, 12))
        
        # Absolute errors histogram
        axes[0, 0].hist(absolute_errors, bins=50, edgecolor='black', alpha=0.7)
        axes[0, 0].set_xlabel('Absolute Error (RUB)', fontsize=11)
        axes[0, 0].set_ylabel('Frequency', fontsize=11)
        axes[0, 0].set_title('Absolute Error Distribution', fontsize=12, fontweight='bold')
        axes[0, 0].grid(True, alpha=0.3)
        
        # Relative errors histogram
        axes[0, 1].hist(relative_errors, bins=50, edgecolor='black', alpha=0.7)
        axes[0, 1].set_xlabel('Relative Error (%)', fontsize=11)
        axes[0, 1].set_ylabel('Frequency', fontsize=11)
        axes[0, 1].set_title('Relative Error Distribution', fontsize=12, fontweight='bold')
        axes[0, 1].grid(True, alpha=0.3)
        
        # Error vs predicted value
        axes[1, 0].scatter(y_pred, absolute_errors, alpha=0.5, s=20)
        axes[1, 0].set_xlabel('Predicted Price (RUB)', fontsize=11)
        axes[1, 0].set_ylabel('Absolute Error (RUB)', fontsize=11)
        axes[1, 0].set_title('Error vs Predicted Value', fontsize=12, fontweight='bold')
        axes[1, 0].grid(True, alpha=0.3)
        
        # Cumulative error distribution
        sorted_errors = np.sort(relative_errors)
        cumulative = np.arange(1, len(sorted_errors) + 1) / len(sorted_errors) * 100
        axes[1, 1].plot(sorted_errors, cumulative, linewidth=2)
        axes[1, 1].axvline(x=5, color='g', linestyle='--', label='±5%')
        axes[1, 1].axvline(x=10, color='orange', linestyle='--', label='±10%')
        axes[1, 1].axvline(x=15, color='r', linestyle='--', label='±15%')
        axes[1, 1].set_xlabel('Relative Error (%)', fontsize=11)
        axes[1, 1].set_ylabel('Cumulative Percentage', fontsize=11)
        axes[1, 1].set_title('Cumulative Error Distribution', fontsize=12, fontweight='bold')
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3)
        
        plt.suptitle(f'{model_name} - Error Analysis', fontsize=14, fontweight='bold', y=1.00)
        plt.tight_layout()
        
        if save:
            filename = f"{model_name.lower().replace(' ', '_')}_error_analysis.png"
            plt.savefig(self.save_dir / filename, dpi=PLOT_SETTINGS['dpi'], bbox_inches='tight')
            logger.info(f"Saved plot: {filename}")
        
        plt.close()
    
    def plot_model_comparison(self, comparison_df: pd.DataFrame, save: bool = True):
        """
        Plot model comparison charts
        
        Args:
            comparison_df: DataFrame with model comparison results
            save: Whether to save the plot
        """
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        models = comparison_df['model']
        
        # R² Score comparison
        axes[0, 0].barh(models, comparison_df['r2_score'])
        axes[0, 0].set_xlabel('R² Score', fontsize=11)
        axes[0, 0].set_title('R² Score Comparison', fontsize=12, fontweight='bold')
        axes[0, 0].grid(True, alpha=0.3, axis='x')
        
        # RMSE comparison
        axes[0, 1].barh(models, comparison_df['rmse'])
        axes[0, 1].set_xlabel('RMSE (RUB)', fontsize=11)
        axes[0, 1].set_title('RMSE Comparison (Lower is Better)', fontsize=12, fontweight='bold')
        axes[0, 1].grid(True, alpha=0.3, axis='x')
        
        # MAE comparison
        axes[1, 0].barh(models, comparison_df['mae'])
        axes[1, 0].set_xlabel('MAE (RUB)', fontsize=11)
        axes[1, 0].set_title('MAE Comparison (Lower is Better)', fontsize=12, fontweight='bold')
        axes[1, 0].grid(True, alpha=0.3, axis='x')
        
        # Accuracy within thresholds
        accuracy_data = comparison_df[['within_5_pct', 'within_10_pct', 'within_15_pct']].values
        x = np.arange(len(models))
        width = 0.25
        
        axes[1, 1].barh(x - width, accuracy_data[:, 0], width, label='Within ±5%')
        axes[1, 1].barh(x, accuracy_data[:, 1], width, label='Within ±10%')
        axes[1, 1].barh(x + width, accuracy_data[:, 2], width, label='Within ±15%')
        
        axes[1, 1].set_yticks(x)
        axes[1, 1].set_yticklabels(models)
        axes[1, 1].set_xlabel('Percentage (%)', fontsize=11)
        axes[1, 1].set_title('Prediction Accuracy', fontsize=12, fontweight='bold')
        axes[1, 1].legend()
        axes[1, 1].grid(True, alpha=0.3, axis='x')
        
        plt.suptitle('Model Performance Comparison', fontsize=14, fontweight='bold', y=0.995)
        plt.tight_layout()
        
        if save:
            filename = "model_comparison.png"
            plt.savefig(self.save_dir / filename, dpi=PLOT_SETTINGS['dpi'], bbox_inches='tight')
            logger.info(f"Saved plot: {filename}")
        
        plt.close()
    
    def plot_feature_importance(self, importance_df: pd.DataFrame, model_name: str,
                               top_n: int = 20, save: bool = True):
        """
        Plot feature importance
        
        Args:
            importance_df: DataFrame with feature importance
            model_name: Name of the model
            top_n: Number of top features to show
            save: Whether to save the plot
        """
        top_features = importance_df.head(top_n)
        
        fig, ax = plt.subplots(figsize=(10, max(8, top_n * 0.4)))
        
        ax.barh(range(len(top_features)), top_features['importance'])
        ax.set_yticks(range(len(top_features)))
        ax.set_yticklabels(top_features['feature'])
        ax.set_xlabel('Importance', fontsize=12)
        ax.set_title(f'Top {top_n} Feature Importance: {model_name}', 
                    fontsize=14, fontweight='bold')
        ax.grid(True, alpha=0.3, axis='x')
        
        plt.tight_layout()
        
        if save:
            filename = f"{model_name.lower().replace(' ', '_')}_feature_importance.png"
            plt.savefig(self.save_dir / filename, dpi=PLOT_SETTINGS['dpi'], bbox_inches='tight')
            logger.info(f"Saved plot: {filename}")
        
        plt.close()
