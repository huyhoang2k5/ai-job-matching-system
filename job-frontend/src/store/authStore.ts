import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: 'candidate' | 'employer') => Promise<void>
  logout: () => void
  refreshAuthToken: () => Promise<void>
  updateProfile: (userData: Partial<User>) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null })
          
          const response: any = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })
          
          const data = await response.json()
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed')
          }
          
          const { user, token, refreshToken } = data.data
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          // Store token in localStorage for API calls
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', refreshToken)
          
          // Store token in cookies for Next.js Middleware
          if (typeof document !== 'undefined') {
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`
          }
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          })
          throw error
        }
      },

      register: async (name: string, email: string, password: string, role: 'candidate' | 'employer') => {
        try {
          set({ isLoading: true, error: null })
          
          const response: any = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role }),
          })
          
          const data = await response.json()
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Registration failed')
          }
          
          const { user, token, refreshToken } = data.data
          
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          
          // Store token in localStorage for API calls
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', refreshToken)
          
          // Store token in cookies for Next.js Middleware
          if (typeof document !== 'undefined') {
            document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`
          }
          
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          })
          throw error
        }
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        // Clear token from cookies for Next.js Middleware
        if (typeof document !== 'undefined') {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
        }
        
        // Reset state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshAuthToken: async () => {
        try {
          const { refreshToken } = get()
          
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }
          
          const response: any = await fetch(`${API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })
          
          const data = await response.json()
          
          if (!response.ok || !data.success) {
            throw new Error('Token refresh failed')
          }
          
          const { token, refreshToken: newRefreshToken } = data.data
          
          set({
            token,
            refreshToken: newRefreshToken,
          })
          
          // Update tokens in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('refreshToken', newRefreshToken)
          
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
        }
      },

      updateProfile: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Helper function to make authenticated API calls
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const response: any = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
  
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    const authStore = useAuthStore.getState()
    await authStore.refreshAuthToken()
    
    // Retry with new token
    const newToken = localStorage.getItem('token')
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(newToken && { Authorization: `Bearer ${newToken}` }),
        ...options.headers,
      },
    })
  }
  
  return response
}
