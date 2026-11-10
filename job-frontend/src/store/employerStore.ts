import { create } from 'zustand'
import { employerApi } from '@/lib/api'
import { EmployerProfile, JobPost, Application, CandidateProfile } from '@/types'

interface EmployerState {
  profile: EmployerProfile | null
  myJobs: JobPost[]
  jobApplications: Application[]
  searchResults: CandidateProfile[]
  stats: any
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
  totalJobs: number
  jobPages: number
  currentJobPage: number
}

interface EmployerActions {
  fetchProfile: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  createJob: (data: any) => Promise<void>
  updateJob: (id: string, data: any) => Promise<void>
  deleteJob: (id: string) => Promise<void>
  fetchMyJobs: (params?: any) => Promise<void>
  fetchJobApplications: (jobId: string, params?: any) => Promise<void>
  fetchEmployerApplications: () => Promise<void>
  updateApplicationStatus: (id: string, status: string, reason?: string) => Promise<void>
  searchCandidates: (params: any) => Promise<void>
  fetchStats: () => Promise<void>
  setError: (error: string | null) => void
}

export const useEmployerStore = create<EmployerState & EmployerActions>((set, get) => ({
  profile: null,
  myJobs: [],
  jobApplications: [],
  searchResults: [],
  stats: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  totalJobs: 0,
  jobPages: 0,
  currentJobPage: 1,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await employerApi.getProfile()
      if (response.success) {
        set({ profile: response.data.profile, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateProfile: async (data) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await employerApi.updateProfile(data)
      if (response.success) {
        set({ profile: response.data.profile, isActionLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
      throw error
    }
  },

  createJob: async (data) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await employerApi.createJob(data)
      if (response.success) {
        set({ isActionLoading: false })
        get().fetchMyJobs()
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  updateJob: async (id, data) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await employerApi.updateJob(id, data)
      if (response.success) {
        set({ isActionLoading: false })
        get().fetchMyJobs()
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  deleteJob: async (id) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await employerApi.deleteJob(id)
      if (response.success) {
        set({ isActionLoading: false })
        get().fetchMyJobs()
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  fetchMyJobs: async (params = { page: 1, limit: 10 }) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await employerApi.getMyJobs(params)
      if (response.success) {
        set({
          myJobs: response.data.jobs,
          totalJobs: response.data.pagination.total,
          jobPages: response.data.pagination.pages,
          currentJobPage: response.data.pagination.current,
          isLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchJobApplications: async (jobId, params = { page: 1, limit: 10 }) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await employerApi.getJobApplications(jobId, params)
      if (response.success) {
        set({ jobApplications: response.data.applications, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchEmployerApplications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await employerApi.getApplications()
      if (response.success) {
        set({ jobApplications: response.data.applications, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateApplicationStatus: async (id, status, reason) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await employerApi.updateApplicationStatus(id, { status, reason })
      if (response.success) {
        set({ isActionLoading: false })
        // Refresh job applications if we are looking at them
        const { jobApplications } = get()
        if (jobApplications.length > 0) {
          const updatedApps = jobApplications.map(app => 
            app.id === id ? { ...app, status } : app
          )
          set({ jobApplications: updatedApps as Application[] })
        }
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  searchCandidates: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await employerApi.searchCandidates(params)
      if (response.success) {
        set({ searchResults: response.data.candidates, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const response: any = await employerApi.getDashboardStats()
      if (response.success) {
        set({ stats: response.data.stats })
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error)
    }
  },

  setError: (error) => set({ error })
}))
