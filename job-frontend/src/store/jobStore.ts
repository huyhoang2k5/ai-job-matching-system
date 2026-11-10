import { create } from 'zustand'
import { jobApi } from '@/lib/api'
import { JobPost, SearchFilters } from '@/types'

interface JobState {
  jobs: JobPost[]
  featuredJobs: JobPost[]
  currentJob: JobPost | null
  popularSkills: string[]
  totalJobs: number
  totalPages: number
  currentPage: number
  isLoading: boolean
  error: string | null
}

interface JobActions {
  fetchJobs: (filters?: SearchFilters) => Promise<void>
  fetchFeaturedJobs: (limit?: number) => Promise<void>
  fetchJobById: (id: string) => Promise<void>
  fetchPopularSkills: (limit?: number) => Promise<void>
  clearCurrentJob: () => void
  setError: (error: string | null) => void
}

export const useJobStore = create<JobState & JobActions>((set) => ({
  jobs: [],
  featuredJobs: [],
  currentJob: null,
  popularSkills: [],
  totalJobs: 0,
  totalPages: 0,
  currentPage: 1,
  isLoading: false,
  error: null,

  fetchJobs: async (filters) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await jobApi.getAll(filters)
      if (response.success) {
        set({
          jobs: response.data.jobs,
          totalJobs: response.data.pagination.total,
          totalPages: response.data.pagination.pages,
          currentPage: response.data.pagination.current,
          isLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchFeaturedJobs: async (limit = 6) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await jobApi.getFeatured({ limit })
      if (response.success) {
        set({ featuredJobs: response.data.jobs, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchJobById: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await jobApi.getById(id)
      if (response.success) {
        set({ currentJob: response.data.job, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchPopularSkills: async (limit = 20) => {
    try {
      const response: any = await jobApi.getPopularSkills(limit)
      if (response.success) {
        set({ popularSkills: response.data.skills.map((s: any) => s._id) })
      }
    } catch (error: any) {
      console.error('Failed to fetch popular skills:', error)
    }
  },

  clearCurrentJob: () => set({ currentJob: null }),
  setError: (error) => set({ error })
}))
