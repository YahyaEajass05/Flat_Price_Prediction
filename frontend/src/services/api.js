import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for auth errors (handled in components)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register')
    
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    
    // Handle unauthorized errors (except during login/register)
    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (!isAuthEndpoint) {
      // Only show toast for non-auth endpoints
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
}

// Predictions API
export const predictionsAPI = {
  predict: (data) => api.post('/predictions/predict', data),
  getHistory: (params) => api.get('/predictions/history', { params }),
  getById: (id) => api.get(`/predictions/${id}`),
  delete: (id) => api.delete(`/predictions/${id}`),
  getStats: () => api.get('/predictions/stats'),
  batchPredict: (data) => api.post('/predictions/predict-batch', data),
}

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllPredictions: (params) => api.get('/admin/predictions', { params }),
  deletePrediction: (id) => api.delete(`/admin/predictions/${id}`),
}

// Health API
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
