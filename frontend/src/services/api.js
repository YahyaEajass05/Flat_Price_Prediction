/**
 * API Service
 * Axios instance and API methods for backend communication
 */
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-toastify'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to requests
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

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh-token`,
          { refreshToken }
        )

        const { token } = response.data.data
        useAuthStore.getState().setToken(token)

        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle other errors
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong'

    toast.error(errorMessage)
    return Promise.reject(error)
  }
)

// ============================================
// Authentication API
// ============================================

export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken })
    return response.data
  },
}

// ============================================
// Prediction API
// ============================================

export const predictionAPI = {
  predict: async (propertyData) => {
    const response = await api.post('/predictions/predict', propertyData)
    return response.data
  },

  predictBatch: async (properties) => {
    const response = await api.post('/predictions/predict-batch', { properties })
    return response.data
  },

  getHistory: async (page = 1, limit = 20, status = null) => {
    const params = { page, limit }
    if (status) params.status = status
    const response = await api.get('/predictions/history', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/predictions/${id}`)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/predictions/${id}`)
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/predictions/stats')
    return response.data
  },

  getModelInfo: async () => {
    const response = await api.get('/predictions/model-info')
    return response.data
  },
}

// ============================================
// Admin API
// ============================================

export const adminAPI = {
  getAllUsers: async (page = 1, limit = 20, search = '', role = null) => {
    const params = { page, limit }
    if (search) params.search = search
    if (role) params.role = role
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },

  getAllPredictions: async (page = 1, limit = 20, status = null) => {
    const params = { page, limit }
    if (status) params.status = status
    const response = await api.get('/admin/predictions', { params })
    return response.data
  },

  createAdmin: async (data) => {
    const response = await api.post('/admin/create-admin', data)
    return response.data
  },
}

// ============================================
// Health API
// ============================================

export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },

  detailed: async () => {
    const response = await api.get('/health/detailed')
    return response.data
  },
}

export default api
