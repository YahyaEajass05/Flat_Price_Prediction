import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Layout
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminRoute from './components/common/AdminRoute'

// Pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import PredictPrice from './pages/predictions/PredictPrice'
import PredictionHistory from './pages/predictions/PredictionHistory'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPredictions from './pages/admin/AdminPredictions'

function App() {
  const { user, initialize } = useAuthStore()

  // Initialize auth store on app mount
  React.useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/predict" element={<PredictPrice />} />
          <Route path="/predictions" element={<PredictionHistory />} />
          
          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/predictions" element={<AdminPredictions />} />
          </Route>
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
