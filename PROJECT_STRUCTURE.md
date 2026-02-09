# Flat Price Prediction - Project Structure

## Overview
This project is a complete full-stack machine learning application for predicting flat/apartment prices using ensemble methods (XGBoost, LightGBM, CatBoost).

---

## 📁 Directory Structure

### **Root Files**
- `setup.py` - Python package setup and dependencies
- `pyproject.toml` - Modern Python project configuration
- `.gitignore` - Git ignore rules (excludes __pycache__, .env, etc.)

---

### **`scripts/` - Executable Scripts**
**Purpose:** Entry point scripts for training, evaluation, and prediction

- **`train.py`** - Main training script
  - Loads data and preprocesses it
  - Trains XGBoost, LightGBM, CatBoost models
  - Creates ensemble model
  - Saves trained models to `models/`
  
- **`evaluate.py`** - Model evaluation script
  - Evaluates trained models on test data
  - Generates performance metrics
  - Creates visualization plots
  
- **`predict.py`** - Prediction script
  - Makes predictions on new data
  - Uses trained models from `models/`
  
- **`eda_analysis.py`** - Exploratory Data Analysis
  - Analyzes dataset characteristics
  - Generates EDA visualizations

**Usage:**
```bash
python scripts/train.py --data data/train.csv
python scripts/evaluate.py --model ensemble
python scripts/predict.py --input data/test.csv
```

---

### **`src/` - Core Library Modules**
**Purpose:** Reusable Python modules with classes and functions

- **`__init__.py`** - Package initialization
- **`config.py`** - Configuration settings and hyperparameters
- **`preprocessing.py`** - Data preprocessing classes
  - DataLoader
  - DataPreprocessor
  - Feature engineering
  
- **`training.py`** - Model training classes
  - ModelTrainer
  - Ensemble methods
  - Cross-validation
  
- **`evaluation.py`** - Model evaluation classes
  - ModelEvaluator
  - Performance metrics
  - Visualization
  
- **`utils.py`** - Utility functions
  - Logging setup
  - File I/O helpers
  - Timer utilities

**Key Difference:**
- `scripts/` contains **executable files** that USE the modules
- `src/` contains **library code** that provides functionality

---

### **`models/` - Trained Models**
- `xgboost_model.pkl` - XGBoost trained model
- `lightgbm_model.pkl` - LightGBM trained model
- `catboost_model.pkl` - CatBoost trained model
- `ensemble_model.pkl` - Ensemble model (weighted average)
- `scaler.pkl` - Feature scaler
- `feature_names.json` - Feature name mappings
- `training_metadata.json` - Training configuration and metrics

---

### **`data/` - Dataset Files**
- `raw/` - Original raw data
- `processed/` - Preprocessed data
- `examples/` - Sample data for testing

---

### **`results/` - Model Outputs**
- `*.png` - Performance visualization plots
- `predictions/` - Prediction outputs
- `reports/` - Text reports and metrics
- `visualizations/` - EDA and model performance charts
  - `eda/` - Exploratory data analysis plots
  - `model_performance/` - Model comparison plots

---

### **`frontend/` - React Web Application**
**Purpose:** User-facing web interface

#### **Structure:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   ├── layout/         # Layout components (Navbar, Sidebar)
│   │   ├── dashboard/      # Dashboard widgets
│   │   └── ui/             # UI components (Button, Card, etc.)
│   ├── pages/
│   │   ├── auth/           # Login, Register
│   │   ├── predictions/    # PredictPrice, BatchPredict, History
│   │   └── admin/          # Admin pages
│   ├── services/           # API service layer
│   ├── store/              # State management (Zustand)
│   └── utils/              # Helper functions
├── public/                 # Static assets
└── package.json           # Dependencies
```

**Key Features:**
- Single property prediction
- Batch prediction (up to 100 properties)
- Prediction history
- User authentication
- Admin user management
- Role-based access control

---

### **`backend/` - Node.js/Express API**
**Purpose:** RESTful API server and database layer

#### **Structure:**
```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── predictionController.js
│   │   ├── adminController.js
│   │   └── aiPredictionController.js
│   ├── models/             # MongoDB schemas
│   │   ├── User.js
│   │   ├── Prediction.js
│   │   └── Property.js
│   ├── routes/             # API routes
│   │   ├── authRoutes.js
│   │   ├── predictionRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/         # Auth, validation, error handling
│   ├── services/           # Business logic
│   │   └── aiService.js    # ML prediction service
│   ├── config/             # Configuration
│   └── utils/              # Utilities
├── scripts/
│   └── seedAdmin.js        # Create initial admin user
└── package.json
```

**API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/predictions/predict` - Single prediction
- `POST /api/predictions/predict-batch` - Batch prediction
- `GET /api/predictions/history` - Get user predictions
- `GET /api/admin/users` - Get all users (admin)
- `POST /api/admin/users` - Create user (admin)

---

### **`api/` - Python FastAPI ML Service**
**Purpose:** Machine learning prediction API

- `app.py` - FastAPI application
- `test_api_endpoints.py` - API testing
- `test_client.py` - Client testing

**Endpoints:**
- `POST /predict` - Single prediction
- `POST /predict/batch` - Batch predictions
- `GET /model/info` - Model information
- `GET /health` - Health check

---

### **`report/` - Academic Documentation**
- `Task_F_Conclusion.md` - Project conclusion (Task F)
- `References.md` - Harvard-style references (30+ sources)
- `architecture_diagrams.puml` - System architecture diagrams
- `ICBT_CIS6005_S2SRI_WRIT1_Nov-2025_Main_2025-26.pdf` - Assignment brief

---

### **`tests/` - Unit Tests**
- `test_model.py` - Model testing
- `__init__.py` - Test package initialization

---

### **`utils/` - Helper Scripts**
- `accuracy_finder.py` - Model accuracy analysis
- `accuracy_report.py` - Generate accuracy reports
- `run_quick_test.py` - Quick testing utility

---

## 🔄 Data Flow

### Training Pipeline:
```
Raw Data → Preprocessing → Feature Engineering → Model Training → Evaluation → Save Models
```

### Prediction Pipeline:
```
User Input (Frontend) → Backend API → Python ML API → Load Model → Predict → Return Result
```

### Complete Stack:
```
React (Frontend) ↔ Node.js/Express (Backend) ↔ FastAPI (ML Service) ↔ MongoDB (Database)
                                               ↔ Trained Models (pkl files)
```

---

## 🚀 Quick Start

### 1. Train Models
```bash
cd scripts
python train.py
```

### 2. Start Backend
```bash
cd backend
npm install
npm start
```

### 3. Start ML API
```bash
cd api
python app.py
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- ML API: http://localhost:8000

---

## 📊 Models Used

1. **XGBoost** - Gradient boosting with tree-based learning
2. **LightGBM** - Fast gradient boosting framework
3. **CatBoost** - Handles categorical features natively
4. **Ensemble** - Weighted average of all three models

---

## 🛠️ Technology Stack

### Machine Learning:
- Python 3.8+
- Scikit-learn
- XGBoost, LightGBM, CatBoost
- Pandas, NumPy
- Matplotlib, Seaborn

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- FastAPI (Python ML service)

### Frontend:
- React 18
- React Router
- Zustand (State Management)
- Tailwind CSS
- Recharts (Visualizations)

---

## 📝 Important Notes

### Files Are NOT Duplicates:
- **`scripts/train.py`** ≠ **`src/training.py`**
  - `scripts/train.py` is an executable script
  - `src/training.py` is a module with training classes

- **`scripts/evaluate.py`** ≠ **`src/evaluation.py`**
  - `scripts/evaluate.py` is an executable script
  - `src/evaluation.py` is a module with evaluation classes

This is a **standard Python project structure** separating:
- **Scripts** (entry points) from **Libraries** (reusable code)

### Cleaned Up:
- ✅ All `__pycache__/` folders removed
- ✅ All `*.pyc` files removed
- ✅ `.gitignore` updated to prevent future caching

---

## 👥 User Roles

### Admin:
- Create/manage users
- View all predictions
- Access system statistics
- Assign roles and limits

### User:
- Make predictions (single/batch)
- View prediction history
- Manage profile
- Limited by prediction quota

---

## 📈 Model Performance

- **R² Score**: 0.92
- **MAE**: ~8.5% of average price
- **RMSE**: Competitive across all models
- **Ensemble** outperforms individual models

---

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- CORS configuration
- Environment variables for secrets

---

## 📚 Documentation

- Full API documentation: `/docs` (FastAPI)
- Assignment completion: `report/`
- Harvard references: `report/References.md`
- Architecture diagrams: `report/architecture_diagrams.puml`

---

## 🎯 Project Completion Status

✅ Machine Learning Models Trained  
✅ Backend API Implemented  
✅ Frontend Application Built  
✅ Admin User Management  
✅ Batch Prediction Feature  
✅ Authentication & Authorization  
✅ Database Integration  
✅ Documentation Complete  
✅ GitHub Repository Updated  

---

**Repository:** https://github.com/YahyaEajass05/Flat_Price_Prediction

**Last Updated:** February 8, 2026
