"""
Flat Price Prediction - Actual Model Accuracy Finder
This script trains models and calculates REAL accuracy scores
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, mean_absolute_percentage_error
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
import xgboost as xgb
import lightgbm as lgb
import catboost as cb
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


def engineer_features(df):
    """
    Engineer features from raw data
    """
    df = df.copy()
    
    # Building age
    current_year = 2024
    df['building_age'] = current_year - df['year']
    df['building_age_squared'] = df['building_age'] ** 2
    
    # Area features
    df['area_per_room'] = df['total_area'] / (df['rooms_count'] + 1)  # +1 to avoid division by zero
    df['kitchen_ratio'] = df['kitchen_area'] / df['total_area']
    df['bath_ratio'] = df['bath_area'] / df['total_area']
    df['living_area'] = df['other_area']
    
    # Floor features
    df['is_first_floor'] = (df['floor'] == 1).astype(int)
    df['is_last_floor'] = (df['floor'] == df['floor_max']).astype(int)
    df['floor_ratio'] = df['floor'] / df['floor_max']
    
    # Amenities score
    df['amenities_score'] = (
        (df['gas'] == 'Yes').astype(int) + 
        (df['hot_water'] == 'Yes').astype(int) + 
        (df['central_heating'] == 'Yes').astype(int)
    )
    
    # Volume (area * height)
    df['volume'] = df['total_area'] * df['ceil_height']
    
    # Extra area features
    df['has_extra_area'] = (df['extra_area'] > 0).astype(int)
    df['extra_area_ratio'] = df['extra_area'] / (df['total_area'] + 1)
    
    # Interaction features
    df['rooms_floor_interaction'] = df['rooms_count'] * df['floor']
    
    return df


def prepare_data(df, label_encoders=None, is_training=True):
    """
    Prepare data for modeling
    """
    df = engineer_features(df)
    
    # Categorical columns to encode
    categorical_cols = ['gas', 'hot_water', 'central_heating', 'extra_area_type_name', 'district_name']
    
    if is_training:
        label_encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            label_encoders[col] = le
    else:
        for col in categorical_cols:
            if col in label_encoders:
                df[col] = label_encoders[col].transform(df[col])
    
    # Select features for modeling
    feature_cols = [
        # Original features
        'kitchen_area', 'bath_area', 'other_area', 'gas', 'hot_water',
        'central_heating', 'extra_area', 'extra_area_count', 'ceil_height',
        'floor_max', 'floor', 'total_area', 'bath_count', 'district_name',
        'rooms_count',
        # Engineered features
        'building_age', 'building_age_squared', 'area_per_room',
        'kitchen_ratio', 'bath_ratio', 'living_area', 'is_first_floor',
        'is_last_floor', 'floor_ratio', 'amenities_score', 'volume',
        'has_extra_area', 'extra_area_ratio', 'rooms_floor_interaction'
    ]
    
    X = df[feature_cols]
    
    if is_training:
        return X, label_encoders, feature_cols
    else:
        return X


def calculate_metrics(y_true, y_pred, model_name="Model"):
    """
    Calculate comprehensive accuracy metrics
    """
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    mape = mean_absolute_percentage_error(y_true, y_pred) * 100
    
    # Custom accuracy score (percentage of predictions within certain error ranges)
    errors = np.abs(y_true - y_pred)
    within_5_percent = (errors / y_true <= 0.05).sum() / len(y_true) * 100
    within_10_percent = (errors / y_true <= 0.10).sum() / len(y_true) * 100
    within_15_percent = (errors / y_true <= 0.15).sum() / len(y_true) * 100
    
    return {
        'model': model_name,
        'rmse': rmse,
        'mae': mae,
        'r2': r2,
        'mape': mape,
        'within_5_pct': within_5_percent,
        'within_10_pct': within_10_percent,
        'within_15_pct': within_15_percent
    }


def train_and_evaluate_models(X_train, X_test, y_train, y_test):
    """
    Train multiple models and evaluate their accuracy
    """
    print("="*80)
    print("TRAINING AND EVALUATING MODELS")
    print("="*80)
    
    results = []
    trained_models = {}
    
    # 1. Linear Regression
    print("\n1. Training Linear Regression...")
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    y_pred = lr.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "Linear Regression"))
    trained_models['linear_regression'] = lr
    print("   ✓ Complete")
    
    # 2. Ridge Regression
    print("\n2. Training Ridge Regression...")
    ridge = Ridge(alpha=10.0)
    ridge.fit(X_train, y_train)
    y_pred = ridge.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "Ridge Regression"))
    trained_models['ridge'] = ridge
    print("   ✓ Complete")
    
    # 3. Lasso Regression
    print("\n3. Training Lasso Regression...")
    lasso = Lasso(alpha=1.0)
    lasso.fit(X_train, y_train)
    y_pred = lasso.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "Lasso Regression"))
    trained_models['lasso'] = lasso
    print("   ✓ Complete")
    
    # 4. Random Forest
    print("\n4. Training Random Forest...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=20, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    y_pred = rf.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "Random Forest"))
    trained_models['random_forest'] = rf
    print("   ✓ Complete")
    
    # 5. Gradient Boosting
    print("\n5. Training Gradient Boosting...")
    gb = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
    gb.fit(X_train, y_train)
    y_pred = gb.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "Gradient Boosting"))
    trained_models['gradient_boosting'] = gb
    print("   ✓ Complete")
    
    # 6. XGBoost
    print("\n6. Training XGBoost...")
    xgb_model = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=7,
        learning_rate=0.05,
        random_state=42,
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    y_pred = xgb_model.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "XGBoost"))
    trained_models['xgboost'] = xgb_model
    print("   ✓ Complete")
    
    # 7. LightGBM
    print("\n7. Training LightGBM...")
    lgb_model = lgb.LGBMRegressor(
        n_estimators=200,
        max_depth=7,
        learning_rate=0.05,
        random_state=42,
        n_jobs=-1,
        verbose=-1
    )
    lgb_model.fit(X_train, y_train)
    y_pred = lgb_model.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "LightGBM"))
    trained_models['lightgbm'] = lgb_model
    print("   ✓ Complete")
    
    # 8. CatBoost
    print("\n8. Training CatBoost...")
    cat_model = cb.CatBoostRegressor(
        iterations=200,
        depth=7,
        learning_rate=0.05,
        random_state=42,
        verbose=False
    )
    cat_model.fit(X_train, y_train)
    y_pred = cat_model.predict(X_test)
    results.append(calculate_metrics(y_test, y_pred, "CatBoost"))
    trained_models['catboost'] = cat_model
    print("   ✓ Complete")
    
    # 9. Ensemble (Average of top 3 models)
    print("\n9. Creating Ensemble Model...")
    xgb_pred = trained_models['xgboost'].predict(X_test)
    lgb_pred = trained_models['lightgbm'].predict(X_test)
    cat_pred = trained_models['catboost'].predict(X_test)
    ensemble_pred = (xgb_pred + lgb_pred + cat_pred) / 3
    results.append(calculate_metrics(y_test, ensemble_pred, "Ensemble (XGB+LGB+CAT)"))
    print("   ✓ Complete")
    
    return pd.DataFrame(results), trained_models


def print_results_table(results_df):
    """
    Print results in a nice formatted table
    """
    print("\n" + "="*80)
    print("MODEL ACCURACY RESULTS")
    print("="*80)
    
    # Sort by R² score (descending)
    results_df = results_df.sort_values('r2', ascending=False).reset_index(drop=True)
    
    print(f"\n{'Model':<25} {'R² Score':<12} {'RMSE':<15} {'MAE':<15} {'MAPE %':<10}")
    print("-" * 80)
    
    for _, row in results_df.iterrows():
        print(f"{row['model']:<25} {row['r2']:<12.4f} {row['rmse']:<15,.0f} {row['mae']:<15,.0f} {row['mape']:<10.2f}")
    
    print("\n" + "="*80)
    print("PREDICTION ACCURACY (Percentage within error threshold)")
    print("="*80)
    
    print(f"\n{'Model':<25} {'±5%':<12} {'±10%':<12} {'±15%':<12}")
    print("-" * 80)
    
    for _, row in results_df.iterrows():
        print(f"{row['model']:<25} {row['within_5_pct']:<12.2f}% {row['within_10_pct']:<12.2f}% {row['within_15_pct']:<12.2f}%")
    
    # Best model
    best_model = results_df.iloc[0]
    print("\n" + "="*80)
    print("BEST MODEL")
    print("="*80)
    print(f"\nModel: {best_model['model']}")
    print(f"R² Score: {best_model['r2']:.4f} ({best_model['r2']*100:.2f}% variance explained)")
    print(f"RMSE: {best_model['rmse']:,.0f} RUB")
    print(f"MAE: {best_model['mae']:,.0f} RUB")
    print(f"MAPE: {best_model['mape']:.2f}%")
    print(f"\nPrediction Accuracy:")
    print(f"  - {best_model['within_5_pct']:.2f}% of predictions within ±5% of actual price")
    print(f"  - {best_model['within_10_pct']:.2f}% of predictions within ±10% of actual price")
    print(f"  - {best_model['within_15_pct']:.2f}% of predictions within ±15% of actual price")


def main():
    """
    Main execution function
    """
    print("="*80)
    print("FLAT PRICE PREDICTION - ACCURACY FINDER")
    print("="*80)
    print(f"\nStarted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Load data
    print("\n📂 Loading data.csv...")
    df = pd.read_csv('data/data.csv')
    print(f"   ✓ Loaded {len(df):,} records")
    
    # Prepare features
    print("\n🔧 Engineering features...")
    X, label_encoders, feature_cols = prepare_data(df, is_training=True)
    y = df['price']
    print(f"   ✓ Created {len(feature_cols)} features")
    
    # Train-test split
    print("\n✂️ Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"   ✓ Training set: {len(X_train):,} records")
    print(f"   ✓ Test set: {len(X_test):,} records")
    
    # Train and evaluate models
    results_df, trained_models = train_and_evaluate_models(X_train, X_test, y_train, y_test)
    
    # Print results
    print_results_table(results_df)
    
    # Save results
    print("\n💾 Saving results...")
    results_df.to_csv('accuracy_results.csv', index=False)
    print("   ✓ Saved to accuracy_results.csv")
    
    # Save best model
    best_model_name = results_df.iloc[0]['model']
    print(f"\n💾 Saving best model ({best_model_name})...")
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    # Save the actual sklearn/xgboost model object
    if 'Ensemble' in best_model_name:
        # Save all three ensemble models
        joblib.dump(trained_models['xgboost'], 'models/xgboost_model.pkl')
        joblib.dump(trained_models['lightgbm'], 'models/lightgbm_model.pkl')
        joblib.dump(trained_models['catboost'], 'models/catboost_model.pkl')
        joblib.dump([1/3, 1/3, 1/3], 'models/ensemble_weights.pkl')
        print("   ✓ Saved ensemble models (XGBoost, LightGBM, CatBoost)")
    else:
        model_key = best_model_name.lower().replace(' ', '_')
        if model_key in trained_models:
            joblib.dump(trained_models[model_key], f'models/{model_key}_model.pkl')
            print(f"   ✓ Saved to models/{model_key}_model.pkl")
    
    # Save label encoders and feature columns
    joblib.dump(label_encoders, 'models/label_encoders.pkl')
    joblib.dump(feature_cols, 'models/feature_cols.pkl')
    print("   ✓ Saved label encoders and feature columns")
    
    print("\n" + "="*80)
    print("✅ ACCURACY FINDING COMPLETE!")
    print("="*80)
    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return results_df


if __name__ == "__main__":
    results = main()
