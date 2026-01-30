import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => set({ user, token }),
      
      logout: () => {
        // Clear refresh token from localStorage
        localStorage.removeItem('refreshToken')
        set({ user: null, token: null })
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
