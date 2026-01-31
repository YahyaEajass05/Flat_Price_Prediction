import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isInitialized: false,
      
      setAuth: (user, token) => {
        set({ user, token, isInitialized: true })
      },
      
      logout: () => {
        // Clear all auth data
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('auth-storage')
        set({ user: null, token: null, isInitialized: true })
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      
      // Initialize auth state
      initialize: () => {
        const state = get()
        // If we have user and token, verify they're valid
        if (state.user && state.token) {
          // Token exists, mark as initialized
          set({ isInitialized: true })
        } else {
          // No valid auth data, ensure clean state
          set({ user: null, token: null, isInitialized: true })
        }
      },
      
      // Check if user is authenticated
      isAuthenticated: () => {
        const state = get()
        return !!(state.user && state.token)
      },
    }),
    {
      name: 'auth-storage',
      // Only persist user and token, not isInitialized
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
