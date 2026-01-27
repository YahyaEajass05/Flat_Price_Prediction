/**
 * Authentication Store using Zustand
 * Manages user authentication state
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Set user and tokens
      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      // Update user data
      setUser: (user) => {
        set({ user })
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      // Update token
      setToken: (token) => {
        set({ token })
      },

      // Check if user is admin
      isAdmin: () => {
        const { user } = get()
        return user?.role === 'admin'
      },

      // Get remaining predictions
      getRemainingPredictions: () => {
        const { user } = get()
        if (!user) return 0
        if (user.role === 'admin') return 'unlimited'
        return user.predictionLimit - user.predictionCount
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
