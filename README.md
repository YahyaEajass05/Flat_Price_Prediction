# 🏠 Flat Price Prediction System

[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.6-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive full-stack machine learning application for predicting apartment/flat prices using advanced ensemble methods. The system combines XGBoost, LightGBM, and CatBoost algorithms to deliver accurate price predictions with a modern web interface.

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Model Information](#-model-information)
- [User Roles](#-user-roles)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Machine Learning
- 🤖 **Ensemble Model** - Combines XGBoost, LightGBM, and CatBoost for superior accuracy
- 📊 **High Accuracy** - Achieves R² score of 0.92 and MAE of ~8.5%
- 🔄 **Batch Predictions** - Process up to 100 properties simultaneously
- 📈 **Feature Importance Analysis** - Understand which factors drive prices
- 🎯 **Model Interpretability** - SHAP values for prediction explanations

### Web Application
- 🌐 **Modern UI** - Built with React 18 and Tailwind CSS
- 🔐 **Secure Authentication** - JWT-based user authentication
- 👥 **Role-Based Access** - Admin and User roles with different permissions
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 📉 **Interactive Dashboards** - Real-time charts and statistics
- 📜 **Prediction History** - Track all past predictions

### Admin Features
- 👨‍💼 **User Management** - Create, edit, and delete users
- 📊 **System Analytics** - View platform usage statistics
- 🔍 **Prediction Monitoring** - Monitor all user predictions
- ⚙️ **Role Assignment** - Assign admin or user roles
- 📏 **Quota Management** - Set prediction limits per user

### API Features
- 🚀 **RESTful API** - Well-documented REST endpoints
- 📝 **Input Validation** - Comprehensive request validation
- 🛡️ **Rate Limiting** - Prevent API abuse
- 📦 **Batch Processing** - Efficient batch prediction endpoint
- 🔒 **Secure** - CORS, Helmet, and security best practices

---

## 🏗️ System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  React Frontend │◄────►│  Express.js API │◄────►│  MongoDB        │
│  (Port 3001)    │      │  (Port 5000)    │      │  Database       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  FastAPI ML     │
                         │  Service        │
                         │  (Port 8000)    │
                         └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  ML Models      │
                         │  (.pkl files)   │
                         └─────────────────┘
```

### Data Flow
1. **User Input** → Frontend collects property details
2. **Authentication** → Backend validates JWT token
3. **API Request** → Backend forwards to ML service
4. **Prediction** → FastAPI loads model and predicts price
5. **Storage** → Backend saves prediction to MongoDB
6. **Response** → Result returned to frontend and displayed

---

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js v24.6
- **Framework:** Express.js 4.18
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, bcrypt
- **Validation:** Express-validator
- **Logging:** Winston, Morgan

### Frontend
- **Library:** React 18.3
- **Routing:** React Router DOM 6.22
- **State Management:** Zustand 4.5
- **Styling:** Tailwind CSS 3.4
- **Forms:** React Hook Form 7.50
- **Notifications:** React Hot Toast 2.4
- **Icons:** Lucide React 0.344
- **HTTP Client:** Axios 1.6

### Machine Learning
- **Python:** 3.11.14
- **ML Frameworks:**
  - XGBoost - Gradient boosting
  - LightGBM - Fast gradient boosting
  - CatBoost - Categorical feature handling
- **Data Processing:**
  - Pandas - Data manipulation
  - NumPy - Numerical computing
  - Scikit-learn - Preprocessing & metrics
- **Visualization:**
  - Matplotlib - Plotting
  - Seaborn - Statistical graphics
- **API:** FastAPI with Uvicorn

### DevOps & Tools
- **Version Control:** Git & GitHub
- **Package Managers:** npm, pip
- **Environment:** dotenv
- **Documentation:** Markdown

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)

### Verify Installation
```bash
node --version  # Should output v18.x or higher
python --version  # Should output Python 3.x
mongod --version  # Should output db version v5.x or higher
git --version
```

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YahyaEajass05/Flat_Price_Prediction.git
cd Flat_Price_Prediction
```

### 2. Install Python Dependencies
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` file** with your settings:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/flat-price-prediction

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRE=30d

# Python ML API
PYTHON_API_URL=http://localhost:8000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3001
```

### Frontend Configuration

1. **Create Environment File**
```bash
cd frontend
cp .env.example .env
```

2. **Edit `.env` file**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ML_API_URL=http://localhost:8000
```

### MongoDB Setup

1. **Start MongoDB Service**
```bash
# On Windows (as Administrator):
net start MongoDB

# On macOS/Linux:
sudo systemctl start mongod
```

2. **Create Initial Admin User** (optional)
```bash
cd backend
node scripts/seedAdmin.js
```

This creates an admin account:
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin

⚠️ **Security Note:** Change the admin password after first login!

---

## 🏃 Running the Application

### Option 1: Run All Services Individually

#### 1. Start MongoDB
```bash
# Ensure MongoDB is running
mongod
```

#### 2. Start Backend API
```bash
cd backend
npm start
# Backend runs on http://localhost:5000
```

#### 3. Start ML API (Optional - for predictions)
```bash
# In a new terminal
cd api
python app.py
# ML API runs on http://localhost:8000
```

#### 4. Start Frontend
```bash
# In a new terminal
cd frontend
npm run dev
# Frontend runs on http://localhost:3001
```

### Option 2: Development Mode with Auto-Reload

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Access the Application

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000
- **ML API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (FastAPI auto-generated)

---

## 📁 Project Structure

```
Flat_Price_Prediction/
│
├── 📂 frontend/              # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Zustand state management
│   │   └── utils/           # Helper functions
│   └── package.json
│
├── 📂 backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── services/       # Business logic
│   └── package.json
│
├── 📂 api/                  # FastAPI ML service
│   ├── app.py              # FastAPI application
│   └── services/           # ML prediction logic
│
├── 📂 scripts/              # Executable Python scripts
│   ├── train.py            # Model training
│   ├── evaluate.py         # Model evaluation
│   └── predict.py          # Make predictions
│
├── 📂 src/                  # Python ML modules
│   ├── training.py         # Training classes
│   ├── evaluation.py       # Evaluation classes
│   └── preprocessing.py    # Data preprocessing
│
├── 📂 models/               # Trained ML models (.pkl)
│   ├── xgboost_model.pkl
│   ├── lightgbm_model.pkl
│   ├── catboost_model.pkl
│   └── ensemble_model.pkl
│
├── 📂 data/                 # Dataset files
│   ├── raw/                # Original data
│   └── processed/          # Preprocessed data
│
├── 📂 results/              # Model outputs & visualizations
│   ├── predictions/
│   └── visualizations/
│
├── 📂 report/               # Academic documentation
│   ├── Task_F_Conclusion.md
│   └── References.md
│
├── 📄 README.md             # This file
├── 📄 PROJECT_STRUCTURE.md  # Detailed structure guide
├── 📄 setup.py             # Python package setup
├── 📄 requirements.txt     # Python dependencies
└── 📄 .gitignore           # Git ignore rules
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "..."
  }
}
```

### Prediction Endpoints

#### Single Prediction
```http
POST /api/predictions/predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "total_area": 75.5,
  "kitchen_area": 12.0,
  "bath_area": 8.5,
  "rooms_count": 3,
  "district_name": "Centralnyj",
  "floor": 5,
  "floor_max": 10,
  "year": 2015,
  "ceil_height": 2.7,
  "bath_count": 1,
  "gas": "Yes",
  "hot_water": "Yes",
  "central_heating": "Yes",
  "extra_area": 5,
  "extra_area_count": 1,
  "extra_area_type_name": "balcony"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "predictedPrice": 5250000,
    "property": { ... },
    "modelUsed": "ensemble",
    "predictionDate": "2026-02-08T..."
  }
}
```

#### Batch Prediction
```http
POST /api/predictions/predict-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "properties": [
    { "total_area": 75.5, ... },
    { "total_area": 90.0, ... }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "predictions": [
      {
        "predictedPrice": 5250000,
        "status": "success"
      },
      {
        "predictedPrice": 6100000,
        "status": "success"
      }
    ]
  }
}
```

#### Get Prediction History
```http
GET /api/predictions/history?page=1&limit=10
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin-token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "predictionLimit": 100
}
```

#### Update User
```http
PUT /api/admin/users/:userId
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "admin",
  "predictionLimit": 500
}
```

#### Delete User
```http
DELETE /api/admin/users/:userId
Authorization: Bearer <admin-token>
```

---

## 🤖 Model Information

### Ensemble Approach
The system uses a weighted ensemble of three powerful gradient boosting algorithms:

#### 1. XGBoost
- **Strengths:** Handles non-linear relationships, regularization
- **Use Case:** Complex feature interactions
- **Weight:** 33.3%

#### 2. LightGBM
- **Strengths:** Fast training, efficient memory usage
- **Use Case:** Large datasets, quick predictions
- **Weight:** 33.3%

#### 3. CatBoost
- **Strengths:** Native categorical feature handling
- **Use Case:** District names, amenity types
- **Weight:** 33.3%

### Model Performance
```
Metric          | Value
----------------|--------
R² Score        | 0.92
MAE             | 8.5%
RMSE            | Competitive
Training Time   | ~5 min
Prediction Time | <200ms
```

### Feature Importance (Top 10)
1. **Total Area** (28%)
2. **District Name** (22%)
3. **Floor** (12%)
4. **Kitchen Area** (10%)
5. **Year Built** (8%)
6. **Bathroom Area** (6%)
7. **Ceiling Height** (5%)
8. **Number of Rooms** (4%)
9. **Central Heating** (3%)
10. **Extra Area** (2%)

### Training Data
- **Dataset Size:** 10,000+ properties
- **Features:** 16 input features
- **Target:** Price in local currency
- **Split:** 80% train, 20% test
- **Validation:** 5-fold cross-validation

---

## 👥 User Roles

### User Role
**Permissions:**
- ✅ Make single predictions
- ✅ Make batch predictions (up to 100 properties)
- ✅ View own prediction history
- ✅ Update own profile
- ✅ Limited by prediction quota

**Default Limits:**
- Prediction Limit: 100 predictions/month
- Batch Size: 100 properties max

### Admin Role
**Permissions:**
- ✅ All user permissions
- ✅ Create new users
- ✅ Edit user details
- ✅ Delete users
- ✅ Assign roles
- ✅ Set prediction limits
- ✅ View all predictions
- ✅ Access system statistics

**No Limits:**
- Unlimited predictions
- Access to admin dashboard

---

## 🎨 Screenshots

### Landing Page
> Modern landing page with feature highlights and call-to-action

### Dashboard
> Interactive dashboard showing statistics, recent predictions, and quick actions

### Single Prediction
> User-friendly form for predicting individual property prices

### Batch Prediction
> Process multiple properties at once with progress tracking

### Prediction History
> Table view of all past predictions with filters and export options

### Admin Dashboard
> System analytics, user management, and prediction monitoring

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Python Tests
```bash
python -m pytest tests/
```

### API Testing
The FastAPI ML service includes automatic API documentation:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 📈 Performance Optimization

### Frontend
- ✅ Code splitting with React.lazy
- ✅ Optimized re-renders with React.memo
- ✅ Efficient state management with Zustand
- ✅ Image optimization
- ✅ CSS purging with Tailwind

### Backend
- ✅ Database indexing
- ✅ Query optimization
- ✅ Response compression
- ✅ Caching strategies
- ✅ Connection pooling

### ML Service
- ✅ Model serialization (.pkl files)
- ✅ Batch processing
- ✅ Efficient preprocessing pipeline
- ✅ Fast ensemble prediction (<200ms)

---

## 🔒 Security Features

- 🔐 **JWT Authentication** - Secure token-based auth
- 🔑 **Password Hashing** - bcrypt with salt rounds
- 🛡️ **CORS Protection** - Configured allowed origins
- 🔒 **Helmet.js** - HTTP security headers
- ⚡ **Rate Limiting** - Prevent API abuse
- ✅ **Input Validation** - Comprehensive request validation
- 🔍 **SQL Injection Prevention** - Mongoose ODM
- 🚫 **XSS Protection** - Input sanitization

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod --version
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux
```

### Python Module Not Found
```bash
# Ensure virtual environment is activated
pip install -r requirements.txt

# Or install specific package
pip install <package-name>
```

### Frontend Build Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- **Python:** Follow PEP 8
- **JavaScript:** ESLint configuration provided
- **Commits:** Use conventional commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yahya Eajass**
- GitHub: [@YahyaEajass05](https://github.com/YahyaEajass05)
- Repository: [Flat_Price_Prediction](https://github.com/YahyaEajass05/Flat_Price_Prediction)

---

## 🙏 Acknowledgments

- **Cardiff Metropolitan University** - For the academic framework
- **Kaggle Community** - For datasets and inspiration
- **Open Source Contributors** - For the amazing libraries and frameworks used in this project

---

## 📞 Support

For issues, questions, or suggestions:
- 🐛 **Report Bugs:** [GitHub Issues](https://github.com/YahyaEajass05/Flat_Price_Prediction/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/YahyaEajass05/Flat_Price_Prediction/discussions)

---

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Docker containerization
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Property image analysis with CNN
- [ ] Time-series price forecasting
- [ ] Mobile app (React Native)

---

## 📊 Project Stats

- **Total Files:** 97+ source files
- **Lines of Code:** 15,000+
- **Languages:** Python, JavaScript, JSX
- **Commits:** 20+
- **Contributors:** 1
- **Version:** 1.0.0
- **Status:** ✅ Production Ready

---

<div align="center">

**Made with ❤️ using React, Node.js, Python, and Machine Learning**

⭐ Star this repository if you find it helpful!

</div>
