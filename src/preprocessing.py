"""
Data preprocessing module
Handles data loading, cleaning, validation, and feature engineering
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, List, Optional
from sklearn.preprocessing import LabelEncoder
import logging
from pathlib import Path

from src.config import (
    CURRENT_YEAR, CATEGORICAL_FEATURES, NUMERICAL_FEATURES,
    VALIDATION_RULES, OUTLIER_METHOD, OUTLIER_THRESHOLD,
    MISSING_VALUE_STRATEGY, FEATURE_ENGINEERING_CONFIG
)

# Setup logging
logger = logging.getLogger(__name__)


class DataLoader:
    """Load and validate data from CSV files"""
    
    def __init__(self, file_path: Path):
        """
        Initialize DataLoader
        
        Args:
            file_path: Path to CSV file
        """
        self.file_path = file_path
        self.df = None
        
    def load(self) -> pd.DataFrame:
        """
        Load data from CSV file
        
        Returns:
            Loaded DataFrame
        """
        logger.info(f"Loading data from {self.file_path}")
        
        try:
            self.df = pd.read_csv(self.file_path)
            logger.info(f"Successfully loaded {len(self.df)} records with {len(self.df.columns)} columns")
            return self.df
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            raise
    
    def get_basic_info(self) -> Dict:
        """
        Get basic information about the dataset
        
        Returns:
            Dictionary with dataset statistics
        """
        if self.df is None:
            raise ValueError("Data not loaded. Call load() first.")
        
        info = {
            'n_rows': len(self.df),
            'n_columns': len(self.df.columns),
            'columns': list(self.df.columns),
            'missing_values': self.df.isnull().sum().to_dict(),
            'dtypes': self.df.dtypes.to_dict(),
            'memory_usage': self.df.memory_usage(deep=True).sum() / 1024**2  # MB
        }
        
        return info


class DataValidator:
    """Validate data quality and integrity"""
    
    def __init__(self, df: pd.DataFrame):
        """
        Initialize DataValidator
        
        Args:
            df: DataFrame to validate
        """
        self.df = df
        self.validation_issues = []
        
    def validate_all(self) -> Tuple[bool, List[str]]:
        """
        Run all validation checks
        
        Returns:
            Tuple of (is_valid, list_of_issues)
        """
        logger.info("Starting data validation...")
        
        self._check_missing_values()
        self._check_data_types()
        self._check_value_ranges()
        self._check_duplicates()
        
        is_valid = len(self.validation_issues) == 0
        
        if is_valid:
            logger.info("✓ Data validation passed")
        else:
            logger.warning(f"⚠ Data validation found {len(self.validation_issues)} issues")
            for issue in self.validation_issues:
                logger.warning(f"  - {issue}")
        
        return is_valid, self.validation_issues
    
    def _check_missing_values(self):
        """Check for missing values"""
        missing = self.df.isnull().sum()
        cols_with_missing = missing[missing > 0]
        
        if len(cols_with_missing) > 0:
            for col, count in cols_with_missing.items():
                pct = (count / len(self.df)) * 100
                self.validation_issues.append(
                    f"Column '{col}' has {count} missing values ({pct:.2f}%)"
                )
    
    def _check_data_types(self):
        """Check if data types are appropriate"""
        for col in NUMERICAL_FEATURES:
            if col in self.df.columns:
                if not pd.api.types.is_numeric_dtype(self.df[col]):
                    self.validation_issues.append(
                        f"Column '{col}' should be numeric but is {self.df[col].dtype}"
                    )
        
        for col in CATEGORICAL_FEATURES:
            if col in self.df.columns:
                if not (pd.api.types.is_string_dtype(self.df[col]) or 
                        pd.api.types.is_object_dtype(self.df[col])):
                    self.validation_issues.append(
                        f"Column '{col}' should be categorical but is {self.df[col].dtype}"
                    )
    
    def _check_value_ranges(self):
        """Check if values are within expected ranges"""
        for col, rules in VALIDATION_RULES.items():
            if col not in self.df.columns:
                if rules.get('required', False):
                    self.validation_issues.append(f"Required column '{col}' is missing")
                continue
            
            if 'min' in rules:
                violations = (self.df[col] < rules['min']).sum()
                if violations > 0:
                    self.validation_issues.append(
                        f"Column '{col}' has {violations} values below minimum {rules['min']}"
                    )
            
            if 'max' in rules:
                violations = (self.df[col] > rules['max']).sum()
                if violations > 0:
                    self.validation_issues.append(
                        f"Column '{col}' has {violations} values above maximum {rules['max']}"
                    )
    
    def _check_duplicates(self):
        """Check for duplicate records"""
        n_duplicates = self.df.duplicated().sum()
        if n_duplicates > 0:
            self.validation_issues.append(f"Found {n_duplicates} duplicate records")


class DataCleaner:
    """Clean and prepare data for modeling"""
    
    def __init__(self, df: pd.DataFrame):
        """
        Initialize DataCleaner
        
        Args:
            df: DataFrame to clean
        """
        self.df = df.copy()
        
    def clean(self) -> pd.DataFrame:
        """
        Apply all cleaning operations
        
        Returns:
            Cleaned DataFrame
        """
        logger.info("Starting data cleaning...")
        
        initial_rows = len(self.df)
        
        self._handle_missing_values()
        self._remove_duplicates()
        self._handle_outliers()
        self._fix_data_types()
        
        final_rows = len(self.df)
        removed = initial_rows - final_rows
        
        if removed > 0:
            logger.info(f"Removed {removed} rows during cleaning ({removed/initial_rows*100:.2f}%)")
        
        logger.info("✓ Data cleaning complete")
        
        return self.df
    
    def _handle_missing_values(self):
        """Handle missing values according to strategy"""
        missing_counts = self.df.isnull().sum()
        cols_with_missing = missing_counts[missing_counts > 0].index
        
        if len(cols_with_missing) == 0:
            logger.info("No missing values found")
            return
        
        logger.info(f"Handling missing values in {len(cols_with_missing)} columns")
        
        for col in cols_with_missing:
            if col in NUMERICAL_FEATURES:
                strategy = MISSING_VALUE_STRATEGY['numerical']
                if strategy == 'mean':
                    self.df[col].fillna(self.df[col].mean(), inplace=True)
                elif strategy == 'median':
                    self.df[col].fillna(self.df[col].median(), inplace=True)
                elif strategy == 'drop':
                    self.df.dropna(subset=[col], inplace=True)
            
            elif col in CATEGORICAL_FEATURES:
                strategy = MISSING_VALUE_STRATEGY['categorical']
                if strategy == 'mode':
                    self.df[col].fillna(self.df[col].mode()[0], inplace=True)
                elif strategy == 'constant':
                    self.df[col].fillna('Unknown', inplace=True)
                elif strategy == 'drop':
                    self.df.dropna(subset=[col], inplace=True)
    
    def _remove_duplicates(self):
        """Remove duplicate records"""
        n_duplicates = self.df.duplicated().sum()
        if n_duplicates > 0:
            logger.info(f"Removing {n_duplicates} duplicate records")
            self.df.drop_duplicates(inplace=True)
    
    def _handle_outliers(self):
        """Detect and handle outliers"""
        from src.config import REMOVE_OUTLIERS
        
        if not REMOVE_OUTLIERS:
            logger.info("Outlier removal disabled in config")
            return
        
        logger.info(f"Detecting outliers using {OUTLIER_METHOD} method")
        
        for col in NUMERICAL_FEATURES:
            if col not in self.df.columns:
                continue
            
            if OUTLIER_METHOD == 'iqr':
                Q1 = self.df[col].quantile(0.25)
                Q3 = self.df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - OUTLIER_THRESHOLD * IQR
                upper_bound = Q3 + OUTLIER_THRESHOLD * IQR
                
                outliers = ((self.df[col] < lower_bound) | (self.df[col] > upper_bound)).sum()
                if outliers > 0:
                    logger.info(f"  Column '{col}': {outliers} outliers detected")
                    self.df = self.df[
                        (self.df[col] >= lower_bound) & (self.df[col] <= upper_bound)
                    ]
            
            elif OUTLIER_METHOD == 'zscore':
                z_scores = np.abs((self.df[col] - self.df[col].mean()) / self.df[col].std())
                outliers = (z_scores > OUTLIER_THRESHOLD).sum()
                if outliers > 0:
                    logger.info(f"  Column '{col}': {outliers} outliers detected")
                    self.df = self.df[z_scores <= OUTLIER_THRESHOLD]
    
    def _fix_data_types(self):
        """Ensure correct data types"""
        for col in NUMERICAL_FEATURES:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
        
        for col in CATEGORICAL_FEATURES:
            if col in self.df.columns:
                self.df[col] = self.df[col].astype(str)


class FeatureEngineer:
    """Create new features from existing ones"""
    
    def __init__(self, df: pd.DataFrame, config: Dict = None):
        """
        Initialize FeatureEngineer
        
        Args:
            df: DataFrame to engineer features from
            config: Feature engineering configuration
        """
        self.df = df.copy()
        self.config = config or FEATURE_ENGINEERING_CONFIG
        
    def engineer_all(self) -> pd.DataFrame:
        """
        Apply all feature engineering operations
        
        Returns:
            DataFrame with engineered features
        """
        logger.info("Starting feature engineering...")
        
        initial_features = len(self.df.columns)
        
        if self.config.get('building_age', True):
            self._create_building_age_features()
        
        if self.config.get('area_ratios', True):
            self._create_area_ratio_features()
        
        if self.config.get('floor_features', True):
            self._create_floor_features()
        
        if self.config.get('amenities_score', True):
            self._create_amenities_score()
        
        if self.config.get('volume', True):
            self._create_volume_feature()
        
        if self.config.get('extra_area_features', True):
            self._create_extra_area_features()
        
        if self.config.get('interaction_features', True):
            self._create_interaction_features()
        
        final_features = len(self.df.columns)
        new_features = final_features - initial_features
        
        logger.info(f"✓ Created {new_features} new features")
        
        return self.df
    
    def _create_building_age_features(self):
        """Create building age related features"""
        if 'year' in self.df.columns:
            self.df['building_age'] = CURRENT_YEAR - self.df['year']
            
            if self.config.get('building_age_squared', True):
                self.df['building_age_squared'] = self.df['building_age'] ** 2
            
            logger.debug("Created building age features")
    
    def _create_area_ratio_features(self):
        """Create area ratio features"""
        if 'total_area' in self.df.columns:
            # Avoid division by zero
            total_area_safe = self.df['total_area'].replace(0, np.nan)
            
            if 'kitchen_area' in self.df.columns:
                self.df['kitchen_ratio'] = self.df['kitchen_area'] / total_area_safe
            
            if 'bath_area' in self.df.columns:
                self.df['bath_ratio'] = self.df['bath_area'] / total_area_safe
            
            if 'other_area' in self.df.columns:
                self.df['living_area'] = self.df['other_area']
                self.df['living_ratio'] = self.df['other_area'] / total_area_safe
            
            # Area per room
            if 'rooms_count' in self.df.columns:
                rooms_safe = self.df['rooms_count'].replace(0, 1)  # Treat studio as 1
                self.df['area_per_room'] = self.df['total_area'] / rooms_safe
            
            logger.debug("Created area ratio features")
    
    def _create_floor_features(self):
        """Create floor-related features"""
        if 'floor' in self.df.columns and 'floor_max' in self.df.columns:
            self.df['is_first_floor'] = (self.df['floor'] == 1).astype(int)
            self.df['is_last_floor'] = (self.df['floor'] == self.df['floor_max']).astype(int)
            
            # Avoid division by zero
            floor_max_safe = self.df['floor_max'].replace(0, 1)
            self.df['floor_ratio'] = self.df['floor'] / floor_max_safe
            
            logger.debug("Created floor features")
    
    def _create_amenities_score(self):
        """Create amenities score from binary features"""
        amenity_cols = ['gas', 'hot_water', 'central_heating']
        
        if all(col in self.df.columns for col in amenity_cols):
            self.df['amenities_score'] = sum(
                (self.df[col] == 'Yes').astype(int) for col in amenity_cols
            )
            logger.debug("Created amenities score")
    
    def _create_volume_feature(self):
        """Create volume feature (area * height)"""
        if 'total_area' in self.df.columns and 'ceil_height' in self.df.columns:
            self.df['volume'] = self.df['total_area'] * self.df['ceil_height']
            logger.debug("Created volume feature")
    
    def _create_extra_area_features(self):
        """Create extra area related features"""
        if 'extra_area' in self.df.columns:
            self.df['has_extra_area'] = (self.df['extra_area'] > 0).astype(int)
            
            if 'total_area' in self.df.columns:
                total_area_safe = self.df['total_area'].replace(0, 1)
                self.df['extra_area_ratio'] = self.df['extra_area'] / total_area_safe
            
            logger.debug("Created extra area features")
    
    def _create_interaction_features(self):
        """Create interaction features between important variables"""
        if 'rooms_count' in self.df.columns and 'floor' in self.df.columns:
            self.df['rooms_floor_interaction'] = self.df['rooms_count'] * self.df['floor']
        
        if 'total_area' in self.df.columns and 'building_age' in self.df.columns:
            self.df['area_age_interaction'] = self.df['total_area'] * self.df['building_age']
        
        logger.debug("Created interaction features")


class DataPreprocessor:
    """Main preprocessing pipeline orchestrator"""
    
    def __init__(self):
        """Initialize DataPreprocessor"""
        self.label_encoders = {}
        self.feature_names = []
        self.is_fitted = False
        
    def fit_transform(self, df: pd.DataFrame, target_col: str = 'price') -> Tuple[pd.DataFrame, pd.Series]:
        """
        Fit preprocessing pipeline and transform data
        
        Args:
            df: Input DataFrame
            target_col: Name of target column
            
        Returns:
            Tuple of (X_transformed, y)
        """
        logger.info("="*70)
        logger.info("STARTING PREPROCESSING PIPELINE")
        logger.info("="*70)
        
        # Validate data
        validator = DataValidator(df)
        is_valid, issues = validator.validate_all()
        
        # Clean data
        cleaner = DataCleaner(df)
        df_clean = cleaner.clean()
        
        # Engineer features
        engineer = FeatureEngineer(df_clean)
        df_engineered = engineer.engineer_all()
        
        # Encode categorical variables
        df_encoded = self._encode_categorical(df_engineered, fit=True)
        
        # Separate features and target
        if target_col in df_encoded.columns:
            y = df_encoded[target_col]
            X = df_encoded.drop(columns=[target_col])
        else:
            y = None
            X = df_encoded
        
        # Remove non-feature columns (like 'index' if present)
        cols_to_drop = ['index', 'Unnamed: 0']
        X = X.drop(columns=[col for col in cols_to_drop if col in X.columns])
        
        self.feature_names = list(X.columns)
        self.is_fitted = True
        
        logger.info(f"✓ Preprocessing complete: {len(X.columns)} features ready")
        logger.info("="*70)
        
        return X, y
    
    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Transform new data using fitted preprocessing pipeline
        
        Args:
            df: Input DataFrame
            
        Returns:
            Transformed DataFrame
        """
        if not self.is_fitted:
            raise ValueError("Preprocessor not fitted. Call fit_transform first.")
        
        logger.info("Transforming new data...")
        
        # Clean data
        cleaner = DataCleaner(df)
        df_clean = cleaner.clean()
        
        # Engineer features
        engineer = FeatureEngineer(df_clean)
        df_engineered = engineer.engineer_all()
        
        # Encode categorical variables
        df_encoded = self._encode_categorical(df_engineered, fit=False)
        
        # Remove non-feature columns
        cols_to_drop = ['index', 'Unnamed: 0', 'price']
        X = df_encoded.drop(columns=[col for col in cols_to_drop if col in df_encoded.columns])
        
        # Ensure same features as training - add missing with 0
        missing_features = set(self.feature_names) - set(X.columns)
        for col in missing_features:
            X[col] = 0
            logger.debug(f"Added missing feature: {col}")
        
        # Remove extra features not in training
        extra_features = set(X.columns) - set(self.feature_names)
        if extra_features:
            logger.debug(f"Removing extra features: {extra_features}")
            X = X.drop(columns=list(extra_features))
        
        # Ensure exact same order as training
        X = X[self.feature_names]
        
        logger.info(f"✓ Transformation complete: {len(X.columns)} features")
        
        return X
    
    def _encode_categorical(self, df: pd.DataFrame, fit: bool = False) -> pd.DataFrame:
        """
        Encode categorical variables
        
        Args:
            df: DataFrame to encode
            fit: Whether to fit encoders or use existing
            
        Returns:
            Encoded DataFrame
        """
        df = df.copy()
        
        for col in CATEGORICAL_FEATURES:
            if col not in df.columns:
                continue
            
            if fit:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
                logger.debug(f"Fitted encoder for '{col}': {len(le.classes_)} classes")
            else:
                if col in self.label_encoders:
                    le = self.label_encoders[col]
                    # Handle unseen categories
                    df[col] = df[col].astype(str).apply(
                        lambda x: x if x in le.classes_ else le.classes_[0]
                    )
                    df[col] = le.transform(df[col])
        
        return df
    
    def get_feature_names(self) -> List[str]:
        """Get list of feature names after preprocessing"""
        return self.feature_names
    
    def save_encoders(self, path: Path):
        """Save label encoders to file"""
        import joblib
        joblib.dump(self.label_encoders, path)
        logger.info(f"Saved encoders to {path}")
    
    def load_encoders(self, path: Path):
        """Load label encoders from file"""
        import joblib
        self.label_encoders = joblib.load(path)
        
        # Load feature names from JSON file
        feature_names_path = path.parent / 'feature_names.json'
        if feature_names_path.exists():
            import json
            with open(feature_names_path, 'r') as f:
                data = json.load(f)
                self.feature_names = data.get('features', [])
            logger.info(f"Loaded {len(self.feature_names)} feature names")
        else:
            logger.warning("feature_names.json not found - will be set during transform")
        
        self.is_fitted = True
        logger.info(f"Loaded encoders from {path}")
