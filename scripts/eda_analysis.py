import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

# Create EDA directory in results/visualizations/eda
EDA_DIR = Path(__file__).parent.parent / 'results' / 'visualizations' / 'eda'
EDA_DIR.mkdir(parents=True, exist_ok=True)

print("="*80)
print("EXPLORATORY DATA ANALYSIS - FLAT PRICE PREDICTION")
print("="*80)

# Load data
print("\n📂 Loading data...")
# Update path to use new structure
data_path = Path(__file__).parent.parent / 'data' / 'raw' / 'data.csv'
df = pd.read_csv(data_path)
print(f"✓ Loaded {len(df):,} records with {len(df.columns)} columns")

# ============================================================================
# 1. DATA OVERVIEW
# ============================================================================
print("\n" + "="*80)
print("1. DATA OVERVIEW")
print("="*80)

print(f"\nDataset Shape: {df.shape}")
print(f"Memory Usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
print(f"\nColumn Names:")
print(df.columns.tolist())

print("\n" + "-"*80)
print("Data Types:")
print(df.dtypes)

print("\n" + "-"*80)
print("First 5 Rows:")
print(df.head())

print("\n" + "-"*80)
print("Missing Values:")
missing = df.isnull().sum()
if missing.sum() == 0:
    print("✓ No missing values found!")
else:
    print(missing[missing > 0])

# ============================================================================
# 2. DESCRIPTIVE STATISTICS
# ============================================================================
print("\n" + "="*80)
print("2. DESCRIPTIVE STATISTICS")
print("="*80)

print("\nNumerical Variables:")
print(df.describe().round(2))

print("\n" + "-"*80)
print("Categorical Variables:")
categorical_cols = df.select_dtypes(include=['object']).columns
for col in categorical_cols:
    print(f"\n{col}:")
    print(df[col].value_counts())
    print(f"Unique values: {df[col].nunique()}")

# ============================================================================
# 3. TARGET VARIABLE ANALYSIS (PRICE)
# ============================================================================
print("\n" + "="*80)
print("3. TARGET VARIABLE ANALYSIS (PRICE)")
print("="*80)

print(f"\nPrice Statistics:")
print(f"  Mean:       {df['price'].mean():,.0f} RUB")
print(f"  Median:     {df['price'].median():,.0f} RUB")
print(f"  Std Dev:    {df['price'].std():,.0f} RUB")
print(f"  Min:        {df['price'].min():,.0f} RUB")
print(f"  Max:        {df['price'].max():,.0f} RUB")
print(f"  Range:      {df['price'].max() - df['price'].min():,.0f} RUB")
print(f"  CV:         {(df['price'].std() / df['price'].mean() * 100):.2f}%")

# Percentiles
print(f"\nPrice Percentiles:")
for p in [10, 25, 50, 75, 90, 95, 99]:
    print(f"  {p}th:       {df['price'].quantile(p/100):,.0f} RUB")

# Skewness and Kurtosis
print(f"\nDistribution Shape:")
print(f"  Skewness:   {df['price'].skew():.4f}")
print(f"  Kurtosis:   {df['price'].kurtosis():.4f}")

# Price Distribution Plot
fig, axes = plt.subplots(2, 2, figsize=(15, 10))

# Histogram
axes[0, 0].hist(df['price'], bins=50, edgecolor='black', alpha=0.7)
axes[0, 0].set_xlabel('Price (RUB)')
axes[0, 0].set_ylabel('Frequency')
axes[0, 0].set_title('Price Distribution (Histogram)')
axes[0, 0].axvline(df['price'].mean(), color='red', linestyle='--', label=f'Mean: {df["price"].mean():,.0f}')
axes[0, 0].axvline(df['price'].median(), color='green', linestyle='--', label=f'Median: {df["price"].median():,.0f}')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Box Plot
axes[0, 1].boxplot(df['price'], vert=True)
axes[0, 1].set_ylabel('Price (RUB)')
axes[0, 1].set_title('Price Distribution (Box Plot)')
axes[0, 1].grid(True, alpha=0.3)

# Q-Q Plot
stats.probplot(df['price'], dist="norm", plot=axes[1, 0])
axes[1, 0].set_title('Q-Q Plot (Normal Distribution)')
axes[1, 0].grid(True, alpha=0.3)

# Density Plot
df['price'].plot(kind='density', ax=axes[1, 1])
axes[1, 1].set_xlabel('Price (RUB)')
axes[1, 1].set_ylabel('Density')
axes[1, 1].set_title('Price Distribution (Kernel Density)')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(EDA_DIR / '01_price_distribution.png', dpi=300, bbox_inches='tight')
print(f"\n✓ Saved: {EDA_DIR / '01_price_distribution.png'}")
plt.close()

# ============================================================================
# 4. NUMERICAL FEATURES ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("4. NUMERICAL FEATURES ANALYSIS")
print("="*80)

numerical_cols = ['kitchen_area', 'bath_area', 'other_area', 'extra_area',
                  'year', 'ceil_height', 'floor_max', 'floor', 'total_area',
                  'bath_count', 'rooms_count', 'extra_area_count']

# Distribution of numerical features
fig, axes = plt.subplots(4, 3, figsize=(18, 16))
axes = axes.flatten()

for idx, col in enumerate(numerical_cols):
    axes[idx].hist(df[col], bins=30, edgecolor='black', alpha=0.7)
    axes[idx].set_xlabel(col)
    axes[idx].set_ylabel('Frequency')
    axes[idx].set_title(f'{col} Distribution')
    axes[idx].axvline(df[col].mean(), color='red', linestyle='--', alpha=0.5)
    axes[idx].grid(True, alpha=0.3)
    
    # Add statistics
    mean = df[col].mean()
    median = df[col].median()
    axes[idx].text(0.02, 0.98, f'Mean: {mean:.1f}\nMedian: {median:.1f}',
                   transform=axes[idx].transAxes, verticalalignment='top',
                   bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()
plt.savefig(EDA_DIR / '02_numerical_distributions.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '02_numerical_distributions.png'}")
plt.close()

# ============================================================================
# 5. CORRELATION ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("5. CORRELATION ANALYSIS")
print("="*80)

# Correlation matrix for numerical variables
numerical_features = numerical_cols + ['price']
correlation_matrix = df[numerical_features].corr()

print("\nCorrelation with Price (sorted):")
price_corr = correlation_matrix['price'].sort_values(ascending=False)
for feature, corr in price_corr.items():
    if feature != 'price':
        print(f"  {feature:<20} {corr:>8.4f}")

# Correlation Heatmap
fig, ax = plt.subplots(figsize=(14, 12))
sns.heatmap(correlation_matrix, annot=True, fmt='.2f', cmap='coolwarm',
            center=0, square=True, linewidths=1, cbar_kws={"shrink": 0.8})
plt.title('Correlation Matrix - Numerical Features', fontsize=16, fontweight='bold')
plt.tight_layout()
plt.savefig(EDA_DIR / '03_correlation_heatmap.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '03_correlation_heatmap.png'}")
plt.close()

# Top correlations with price
fig, axes = plt.subplots(2, 3, figsize=(18, 12))
axes = axes.flatten()

top_corr_features = price_corr.drop('price').head(6).index

for idx, feature in enumerate(top_corr_features):
    axes[idx].scatter(df[feature], df['price'], alpha=0.3, s=10)
    axes[idx].set_xlabel(feature)
    axes[idx].set_ylabel('Price (RUB)')
    axes[idx].set_title(f'Price vs {feature} (r={price_corr[feature]:.3f})')
    
    # Add trend line
    z = np.polyfit(df[feature], df['price'], 1)
    p = np.poly1d(z)
    axes[idx].plot(df[feature], p(df[feature]), "r--", alpha=0.8, linewidth=2)
    axes[idx].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(EDA_DIR / '04_price_vs_features.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '04_price_vs_features.png'}")
plt.close()

# ============================================================================
# 6. CATEGORICAL FEATURES ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("6. CATEGORICAL FEATURES ANALYSIS")
print("="*80)

categorical_features = ['gas', 'hot_water', 'central_heating', 
                        'extra_area_type_name', 'district_name']

# Price by categorical features
fig, axes = plt.subplots(2, 3, figsize=(18, 12))
axes = axes.flatten()

for idx, feature in enumerate(categorical_features):
    df.boxplot(column='price', by=feature, ax=axes[idx])
    axes[idx].set_xlabel(feature)
    axes[idx].set_ylabel('Price (RUB)')
    axes[idx].set_title(f'Price Distribution by {feature}')
    plt.sca(axes[idx])
    plt.xticks(rotation=45, ha='right')
    axes[idx].grid(True, alpha=0.3)

# Remove the last empty subplot
axes[-1].remove()

plt.tight_layout()
plt.savefig(EDA_DIR / '05_price_by_categorical.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '05_price_by_categorical.png'}")
plt.close()

# Mean price by categorical features
fig, axes = plt.subplots(2, 3, figsize=(18, 10))
axes = axes.flatten()

for idx, feature in enumerate(categorical_features):
    mean_prices = df.groupby(feature)['price'].mean().sort_values()
    mean_prices.plot(kind='barh', ax=axes[idx], color='skyblue', edgecolor='black')
    axes[idx].set_xlabel('Average Price (RUB)')
    axes[idx].set_ylabel(feature)
    axes[idx].set_title(f'Average Price by {feature}')
    axes[idx].grid(True, alpha=0.3, axis='x')

# Remove the last empty subplot
axes[-1].remove()

plt.tight_layout()
plt.savefig(EDA_DIR / '06_avg_price_by_categorical.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '06_avg_price_by_categorical.png'}")
plt.close()

# ============================================================================
# 7. OUTLIER DETECTION
# ============================================================================
print("\n" + "="*80)
print("7. OUTLIER DETECTION")
print("="*80)

# Detect outliers using IQR method
outlier_summary = {}

for col in numerical_cols + ['price']:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 3 * IQR
    upper_bound = Q3 + 3 * IQR
    
    outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
    outlier_pct = (outliers / len(df)) * 100
    
    if outliers > 0:
        outlier_summary[col] = {'count': outliers, 'percentage': outlier_pct}
        print(f"  {col:<20} {outliers:>6} outliers ({outlier_pct:>5.2f}%)")

# Box plots for outlier visualization
fig, axes = plt.subplots(4, 4, figsize=(20, 16))
axes = axes.flatten()

all_numerical = numerical_cols + ['price']
for idx, col in enumerate(all_numerical):
    axes[idx].boxplot(df[col], vert=True)
    axes[idx].set_ylabel(col)
    axes[idx].set_title(f'{col} - Outliers')
    axes[idx].grid(True, alpha=0.3)

# Remove extra subplots
for idx in range(len(all_numerical), len(axes)):
    axes[idx].remove()

plt.tight_layout()
plt.savefig(EDA_DIR / '07_outlier_detection.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '07_outlier_detection.png'}")
plt.close()

# ============================================================================
# 8. FEATURE RELATIONSHIPS
# ============================================================================
print("\n" + "="*80)
print("8. FEATURE RELATIONSHIPS")
print("="*80)

# Area relationships
fig, axes = plt.subplots(2, 2, figsize=(15, 12))

# Total area vs components
axes[0, 0].scatter(df['kitchen_area'] + df['bath_area'] + df['other_area'], 
                   df['total_area'], alpha=0.3, s=10)
axes[0, 0].plot([0, df['total_area'].max()], [0, df['total_area'].max()], 
                'r--', label='Perfect match')
axes[0, 0].set_xlabel('Kitchen + Bath + Other Area')
axes[0, 0].set_ylabel('Total Area')
axes[0, 0].set_title('Total Area vs Sum of Components')
axes[0, 0].legend()
axes[0, 0].grid(True, alpha=0.3)

# Floor vs Floor Max
axes[0, 1].scatter(df['floor_max'], df['floor'], alpha=0.3, s=10)
axes[0, 1].plot([0, df['floor_max'].max()], [0, df['floor_max'].max()], 
                'r--', label='Top floor')
axes[0, 1].set_xlabel('Floor Max (Building Height)')
axes[0, 1].set_ylabel('Floor')
axes[0, 1].set_title('Floor vs Building Height')
axes[0, 1].legend()
axes[0, 1].grid(True, alpha=0.3)

# Rooms vs Total Area
axes[1, 0].scatter(df['total_area'], df['rooms_count'], alpha=0.3, s=10)
axes[1, 0].set_xlabel('Total Area')
axes[1, 0].set_ylabel('Number of Rooms')
axes[1, 0].set_title('Rooms vs Total Area')
axes[1, 0].grid(True, alpha=0.3)

# Building Age vs Price
df['building_age'] = 2024 - df['year']
axes[1, 1].scatter(df['building_age'], df['price'], alpha=0.3, s=10)
axes[1, 1].set_xlabel('Building Age (years)')
axes[1, 1].set_ylabel('Price (RUB)')
axes[1, 1].set_title('Price vs Building Age')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig(EDA_DIR / '08_feature_relationships.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '08_feature_relationships.png'}")
plt.close()

# ============================================================================
# 9. DISTRICT ANALYSIS
# ============================================================================
print("\n" + "="*80)
print("9. DISTRICT ANALYSIS")
print("="*80)

district_stats = df.groupby('district_name').agg({
    'price': ['mean', 'median', 'std', 'count'],
    'total_area': 'mean',
    'rooms_count': 'mean'
}).round(2)

print("\nDistrict Statistics:")
print(district_stats)

# District analysis plot
fig, axes = plt.subplots(2, 2, figsize=(16, 12))

# Average price by district
district_price = df.groupby('district_name')['price'].mean().sort_values()
district_price.plot(kind='barh', ax=axes[0, 0], color='steelblue', edgecolor='black')
axes[0, 0].set_xlabel('Average Price (RUB)')
axes[0, 0].set_ylabel('District')
axes[0, 0].set_title('Average Price by District')
axes[0, 0].grid(True, alpha=0.3, axis='x')

# Count by district
district_count = df['district_name'].value_counts()
district_count.plot(kind='bar', ax=axes[0, 1], color='coral', edgecolor='black')
axes[0, 1].set_xlabel('District')
axes[0, 1].set_ylabel('Number of Properties')
axes[0, 1].set_title('Property Count by District')
axes[0, 1].tick_params(axis='x', rotation=45)
axes[0, 1].grid(True, alpha=0.3, axis='y')

# Average area by district
district_area = df.groupby('district_name')['total_area'].mean().sort_values()
district_area.plot(kind='barh', ax=axes[1, 0], color='lightgreen', edgecolor='black')
axes[1, 0].set_xlabel('Average Total Area (m²)')
axes[1, 0].set_ylabel('District')
axes[1, 0].set_title('Average Area by District')
axes[1, 0].grid(True, alpha=0.3, axis='x')

# Price distribution by district (violin plot)
df_sorted = df.sort_values('district_name')
axes[1, 1].violinplot([df_sorted[df_sorted['district_name'] == d]['price'].values 
                        for d in sorted(df['district_name'].unique())],
                       positions=range(len(df['district_name'].unique())),
                       showmeans=True, showmedians=True)
axes[1, 1].set_xticks(range(len(df['district_name'].unique())))
axes[1, 1].set_xticklabels(sorted(df['district_name'].unique()), rotation=45, ha='right')
axes[1, 1].set_xlabel('District')
axes[1, 1].set_ylabel('Price (RUB)')
axes[1, 1].set_title('Price Distribution by District')
axes[1, 1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig(EDA_DIR / '09_district_analysis.png', dpi=300, bbox_inches='tight')
print(f"✓ Saved: {EDA_DIR / '09_district_analysis.png'}")
plt.close()

# ============================================================================
# 10. SUMMARY STATISTICS
# ============================================================================
print("\n" + "="*80)
print("10. SUMMARY STATISTICS")
print("="*80)

summary_stats = {
    'Total Records': len(df),
    'Total Features': len(df.columns),
    'Numerical Features': len(numerical_cols),
    'Categorical Features': len(categorical_features),
    'Missing Values': df.isnull().sum().sum(),
    'Duplicate Rows': df.duplicated().sum(),
    'Memory Usage (MB)': df.memory_usage(deep=True).sum() / 1024**2
}

print("\nDataset Summary:")
for key, value in summary_stats.items():
    print(f"  {key:<25} {value}")

print("\n" + "="*80)
print("✅ EDA COMPLETE!")
print("="*80)
print(f"\nAll visualizations saved to: {EDA_DIR}/")
print("\nGenerated files:")
for file in sorted(EDA_DIR.glob('*.png')):
    print(f"  ✓ {file.name}")

print("\n" + "="*80)
